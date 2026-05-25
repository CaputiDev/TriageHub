import { useEffect, useCallback } from 'react';
import { useTicketStore } from '../store/useTicketStore';
import type { Ticket, TriageLog } from '../types/ticket';

const WS_URL = 'ws://localhost:8080';

// Conexão e temporizadores globais fora do ciclo de renderização do React
let globalWs: WebSocket | null = null;
let reconnectTimeoutId: number | null = null;

// Lista de ouvintes de retorno de chamadas para permitir chamadas baseadas em promessas
const pendingResolves = new Map<string, (value: any) => void>();

export function useWebSocket() {
  const { 
    isConnected,
    currentUser 
  } = useTicketStore();

  /**
   * Conecta ao servidor WebSocket de forma resiliente e persistente.
   * Utiliza useTicketStore.getState() diretamente dentro dos manipuladores
   * de eventos para evitar closures desatualizadas devido a montagem/desmontagem de componentes.
   */
  const connect = useCallback(() => {
    if (globalWs && (globalWs.readyState === WebSocket.CONNECTING || globalWs.readyState === WebSocket.OPEN)) {
      return;
    }

    console.log('🔌 Conectando ao Servidor WebSocket...');
    
    try {
      const ws = new WebSocket(WS_URL);
      globalWs = ws;

      ws.onopen = () => {
        console.log('✅ Conexão WebSocket estabelecida com sucesso!');
        useTicketStore.getState().setConnected(true);
        if (reconnectTimeoutId) {
          clearTimeout(reconnectTimeoutId);
          reconnectTimeoutId = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const store = useTicketStore.getState();
          
          switch (message.type) {
            case 'INITIAL_STATE':
              console.log('📥 Sincronização inicial de tickets do SQLite:', message.data.length, 'tickets');
              store.setTickets(message.data as Ticket[]);
              break;

            case 'TICKET_CREATED': {
              console.log('📥 Ticket criado recebido via WS:', message.data.id);
              const ticket = message.data as Ticket;
              store.addOrUpdateTicket(ticket);
              store.setActiveTicketId(ticket.id);

              // Resolve a promessa pendente para quem acionou a criação
              const resolve = pendingResolves.get('CREATE_TICKET');
              if (resolve) {
                resolve(ticket);
                pendingResolves.delete('CREATE_TICKET');
              }
              break;
            }

            case 'TICKET_UPDATE': {
              console.log('📥 Atualização de ticket recebida do SQLite:', message.data.id);
              const ticket = message.data as Ticket;
              store.addOrUpdateTicket(ticket);
              
              if (message.triageLog) {
                store.addTriageLog(message.triageLog as TriageLog);
              }
              break;
            }

            default:
              console.warn('⚠️ Evento WebSocket desconhecido recebido do servidor:', message.type);
          }
        } catch (err) {
          console.error('❌ Erro ao decodificar mensagem WebSocket:', err);
        }
      };

      ws.onclose = (event) => {
        useTicketStore.getState().setConnected(false);
        globalWs = null;
        
        console.log(`🔌 Conexão WebSocket fechada (código: ${event.code}). Reconectando em 3s...`);
        if (!reconnectTimeoutId) {
          reconnectTimeoutId = window.setTimeout(() => {
            reconnectTimeoutId = null;
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Erro de conexão no WebSocket:', error);
        ws.close();
      };

    } catch (err) {
      console.error('❌ Erro ao criar instância WebSocket:', err);
      useTicketStore.getState().setConnected(false);
    }
  }, []);

  /**
   * Envia requisição de criação de novo ticket de suporte (retorna Promessa para redirecionamento)
   */
  const createTicket = useCallback((customerName: string, channel: 'WhatsApp' | 'Webchat', subject: string): Promise<Ticket> => {
    return new Promise((resolve, reject) => {
      if (globalWs && globalWs.readyState === WebSocket.OPEN) {
        pendingResolves.set('CREATE_TICKET', resolve);
        
        const payload = JSON.stringify({
          type: 'CREATE_TICKET',
          data: { customerName, channel, subject }
        });
        globalWs.send(payload);
        console.log(`📤 Enviando pedido de suporte de ${customerName}`);
      } else {
        reject(new Error('WebSocket não está conectado. Tente novamente.'));
      }
    });
  }, []);

  /**
   * Envia uma nova mensagem no chat (atendente ou cliente)
   */
  const sendMessage = useCallback((ticketId: string, sender: 'client' | 'agent', text: string) => {
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: 'SEND_MESSAGE',
        data: { ticketId, sender, text }
      });
      globalWs.send(payload);
      console.log(`📤 Nova mensagem enviada pelo ${sender} no ticket ${ticketId}`);
      return true;
    }
    return false;
  }, []);

  /**
   * Finaliza/resolve o ticket de suporte
   */
  const resolveTicket = useCallback((ticketId: string) => {
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: 'RESOLVE_TICKET',
        data: { ticketId }
      });
      globalWs.send(payload);
      console.log(`📤 Fechamento de ticket enviado: ${ticketId}`);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();
  }, [connect]);

  // Identifica reativamente o usuário ao se conectar ou mudar de login
  // Isso roda sempre que useWebSocket é invocado e os estados mudam, garantindo sincronia total
  useEffect(() => {
    if (isConnected && currentUser && globalWs && globalWs.readyState === WebSocket.OPEN) {
      globalWs.send(JSON.stringify({
        type: 'IDENTIFY',
        data: { name: currentUser.name, role: currentUser.role }
      }));
      console.log(`📤 Identificado reativamente como: ${currentUser.name} (${currentUser.role})`);
    }
  }, [isConnected, currentUser]);

  return {
    isConnected,
    createTicket,
    sendMessage,
    resolveTicket,
    reconnect: connect
  };
}
