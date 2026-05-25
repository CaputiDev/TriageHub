import { useEffect, useCallback } from 'react';
import { useTicketStore } from '../store/useTicketStore';
import type { Ticket, TriageLog } from '../types/ticket';

const WS_URL = 'ws://localhost:8080';

// Conexão e temporizadores globais fora do ciclo de renderização do React
let globalWs: WebSocket | null = null;
let reconnectTimeoutId: number | null = null;

// Lista de ouvintes de retorno de chamadas para permitir chamadas baseadas em promessas
const pendingResolves = new Map<string, (value: any) => void>();
const pendingRejects = new Map<string, (reason: any) => void>();

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
            
            // ==========================================
            // AUTH_SUCCESS: Autenticação bem-sucedida
            // ==========================================
            case 'AUTH_SUCCESS': {
              console.log('🔑 Autenticação efetuada com sucesso no backend:', message.data.name);
              const { id, email, name, role, funcao, codigoIdentificacao } = message.data;
              
              // Executa o login na store global
              store.login(id, name, role, email, funcao, codigoIdentificacao);

              const resolve = pendingResolves.get('AUTH');
              if (resolve) {
                resolve(message.data);
                pendingResolves.delete('AUTH');
                pendingRejects.delete('AUTH');
              }
              break;
            }

            // ==========================================
            // AUTH_ERROR: Erro de login/registro
            // ==========================================
            case 'AUTH_ERROR': {
              console.warn('❌ Falha na autenticação do socket:', message.error);
              
              const reject = pendingRejects.get('AUTH');
              if (reject) {
                reject(new Error(message.error));
                pendingResolves.delete('AUTH');
                pendingRejects.delete('AUTH');
              }
              break;
            }

            case 'INITIAL_STATE':
              console.log('📥 Sincronização inicial de tickets:', message.data.length, 'tickets');
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
              console.log('📥 Sincronização ou atualização de ticket recebida:', message.data.id);
              const ticket = message.data as Ticket;
              store.addOrUpdateTicket(ticket);
              
              if (message.triageLog) {
                store.addTriageLog(message.triageLog as TriageLog);
              }

              // Resolve a promessa pendente de busca se houver (por UUID ou pelos primeiros 8 caracteres)
              const shortId = ticket.id.slice(0, 8).toUpperCase();
              const resolve = pendingResolves.get(`GET_TICKET_${ticket.id}`) ||
                              pendingResolves.get(`GET_TICKET_${shortId}`) ||
                              pendingResolves.get(`GET_TICKET_${shortId.toLowerCase()}`);
                              
              if (resolve) {
                resolve(ticket);
                pendingResolves.delete(`GET_TICKET_${ticket.id}`);
                pendingResolves.delete(`GET_TICKET_${shortId}`);
                pendingResolves.delete(`GET_TICKET_${shortId.toLowerCase()}`);
                
                pendingRejects.delete(`GET_TICKET_${ticket.id}`);
                pendingRejects.delete(`GET_TICKET_${shortId}`);
                pendingRejects.delete(`GET_TICKET_${shortId.toLowerCase()}`);
              }

              // Resolve promessa de aceite se houver
              const acceptResolve = pendingResolves.get(`ACCEPT_${ticket.id}`);
              if (acceptResolve) {
                acceptResolve(ticket);
                pendingResolves.delete(`ACCEPT_${ticket.id}`);
                pendingRejects.delete(`ACCEPT_${ticket.id}`);
              }

              // Resolve promessa de rejeição se houver
              const rejectResolve = pendingResolves.get(`REJECT_${ticket.id}`);
              if (rejectResolve) {
                rejectResolve(ticket);
                pendingResolves.delete(`REJECT_${ticket.id}`);
                pendingRejects.delete(`REJECT_${ticket.id}`);
              }
              break;
            }

            case 'TICKET_ERROR': {
              console.warn('❌ Erro de ticket recebido do servidor:', message.error);
              const ticketId = message.ticketId || '';
              const shortId = ticketId.length === 36 ? ticketId.slice(0, 8).toUpperCase() : ticketId.toUpperCase();
              
              const reject = pendingRejects.get(`GET_TICKET_${ticketId}`) ||
                             pendingRejects.get(`GET_TICKET_${shortId}`) ||
                             pendingRejects.get(`GET_TICKET_${shortId.toLowerCase()}`);
                             
              if (reject) {
                reject(new Error(message.error));
                pendingResolves.delete(`GET_TICKET_${ticketId}`);
                pendingResolves.delete(`GET_TICKET_${shortId}`);
                pendingResolves.delete(`GET_TICKET_${shortId.toLowerCase()}`);
                
                pendingRejects.delete(`GET_TICKET_${ticketId}`);
                pendingRejects.delete(`GET_TICKET_${shortId}`);
                pendingRejects.delete(`GET_TICKET_${shortId.toLowerCase()}`);
              }
              break;
            }

            case 'REJECT_FAILED': {
              console.warn('❌ Falha ao recusar ticket:', message.error);
              const reject = pendingRejects.get(`REJECT_${message.ticketId}`);
              if (reject) {
                reject(new Error(message.error));
                pendingResolves.delete(`REJECT_${message.ticketId}`);
                pendingRejects.delete(`REJECT_${message.ticketId}`);
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
   * Envia requisição segura de autenticação (Login ou Registro Automático)
   */
  const authenticate = useCallback((
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string, 
    role?: 'client' | 'agent', 
    funcao?: string,
    isSignUp?: boolean
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (globalWs && globalWs.readyState === WebSocket.OPEN) {
        pendingResolves.set('AUTH', resolve);
        pendingRejects.set('AUTH', reject);

        const payload = JSON.stringify({
          type: 'AUTH',
          data: { email, password, firstName, lastName, role, funcao, isSignUp }
        });
        globalWs.send(payload);
        console.log(`📤 Enviando solicitação de autenticação para o e-mail: ${email}`);
      } else {
        reject(new Error('Servidor offline. Verifique a conexão com o WebSocket.'));
      }
    });
  }, []);

  /**
   * Envia requisição de criação de novo ticket de suporte (Questionário Expandido)
   */
  const createTicket = useCallback((
    customerName: string, 
    customerEmail: string,
    channel: 'WhatsApp' | 'Webchat', 
    category: string,
    subject: string,
    description: string
  ): Promise<Ticket> => {
    return new Promise((resolve, reject) => {
      if (globalWs && globalWs.readyState === WebSocket.OPEN) {
        pendingResolves.set('CREATE_TICKET', resolve);
        
        const payload = JSON.stringify({
          type: 'CREATE_TICKET',
          data: { 
            customerName, 
            customerEmail, 
            channel, 
            category, 
            subject, 
            description 
          }
        });
        globalWs.send(payload);
        console.log(`📤 Enviando ticket expandido para ${customerName}`);
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

  /**
   * Busca um ticket específico a partir do seu ID de Protocolo (UUID)
   */
  const getTicket = useCallback((ticketId: string): Promise<Ticket> => {
    return new Promise((resolve, reject) => {
      if (globalWs && globalWs.readyState === WebSocket.OPEN) {
        pendingResolves.set(`GET_TICKET_${ticketId}`, resolve);
        pendingRejects.set(`GET_TICKET_${ticketId}`, reject);

        const payload = JSON.stringify({
          type: 'GET_TICKET',
          data: { ticketId }
        });
        globalWs.send(payload);
        console.log(`📤 Solicitando ticket específico por protocolo: ${ticketId}`);
      } else {
        reject(new Error('Servidor offline. Verifique a conexão com o WebSocket.'));
      }
    });
  }, []);

  /**
   * Aceita uma solicitação de ticket pendente
   */
  const acceptTicket = useCallback((ticketId: string): Promise<Ticket> => {
    return new Promise((resolve, reject) => {
      if (globalWs && globalWs.readyState === WebSocket.OPEN) {
        pendingResolves.set(`ACCEPT_${ticketId}`, resolve);
        pendingRejects.set(`ACCEPT_${ticketId}`, reject);

        const payload = JSON.stringify({
          type: 'ACCEPT_TICKET',
          data: { ticketId }
        });
        globalWs.send(payload);
        console.log(`📤 Enviando aceite do ticket: ${ticketId}`);
      } else {
        reject(new Error('WebSocket não está conectado. Tente novamente.'));
      }
    });
  }, []);

  /**
   * Recusa um ticket recebido, tentando repassá-lo para outro operador online
   */
  const rejectTicket = useCallback((ticketId: string): Promise<Ticket> => {
    return new Promise((resolve, reject) => {
      if (globalWs && globalWs.readyState === WebSocket.OPEN) {
        pendingResolves.set(`REJECT_${ticketId}`, resolve);
        pendingRejects.set(`REJECT_${ticketId}`, reject);

        const payload = JSON.stringify({
          type: 'REJECT_TICKET',
          data: { ticketId }
        });
        globalWs.send(payload);
        console.log(`📤 Enviando recusa do ticket: ${ticketId}`);
      } else {
        reject(new Error('WebSocket não está conectado. Tente novamente.'));
      }
    });
  }, []);

  useEffect(() => {
    connect();
  }, [connect]);

  // Identifica reativamente o usuário ao se conectar ou se re-autenticar
  useEffect(() => {
    if (isConnected && currentUser && globalWs && globalWs.readyState === WebSocket.OPEN) {
      globalWs.send(JSON.stringify({
        type: 'IDENTIFY',
        data: { id: currentUser.id, name: currentUser.name, role: currentUser.role, email: currentUser.email }
      }));
      console.log(`📤 Identificado reativamente como: ${currentUser.name} (${currentUser.role})`);
    }
  }, [isConnected, currentUser]);

  return {
    isConnected,
    authenticate,
    createTicket,
    sendMessage,
    resolveTicket,
    getTicket,
    acceptTicket,
    rejectTicket,
    reconnect: connect
  };
}
