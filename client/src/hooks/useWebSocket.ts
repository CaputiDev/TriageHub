import { useEffect, useRef, useCallback } from 'react';
import { useTicketStore } from '../store/useTicketStore';
import type { Ticket, TriageLog } from '../types/ticket';

// URL do servidor WebSocket
const WS_URL = 'ws://localhost:8080';

// Instância singleton do WebSocket fora do hook para persistir entre renderizações
// e evitar conexões duplicadas causadas pelo StrictMode do React
let globalWs: WebSocket | null = null;
let reconnectTimeoutId: number | null = null;

export function useWebSocket() {
  const { 
    addOrUpdateTicket, 
    setTickets, 
    addTriageLog, 
    setConnected,
    isConnected 
  } = useTicketStore();

  // Referência para controlar se o hook está montado (evita chamadas em componentes desmontados)
  const isMounted = useRef(true);

  /**
   * Conecta ao servidor WebSocket de forma resiliente
   */
  const connect = useCallback(() => {
    // Se já estiver conectado ou conectando, ignora
    if (globalWs && (globalWs.readyState === WebSocket.CONNECTING || globalWs.readyState === WebSocket.OPEN)) {
      return;
    }

    console.log('🔌 Conectando ao Servidor WebSocket...');
    
    try {
      const ws = new WebSocket(WS_URL);
      globalWs = ws;

      ws.onopen = () => {
        if (!isMounted.current) {
          ws.close();
          return;
        }
        console.log('✅ Conexão WebSocket estabelecida com sucesso!');
        setConnected(true);
        if (reconnectTimeoutId) {
          clearTimeout(reconnectTimeoutId);
          reconnectTimeoutId = null;
        }
      };

      ws.onmessage = (event) => {
        if (!isMounted.current) return;
        
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'INITIAL_STATE':
              console.log('📥 Estado inicial recebido do servidor:', message.data.length, 'tickets');
              setTickets(message.data as Ticket[]);
              break;

            case 'TICKET_UPDATE':
              console.log('📥 Atualização de ticket recebida:', message.data.id);
              addOrUpdateTicket(message.data as Ticket);
              
              // Se houver um log de triagem anexado, adiciona à store
              if (message.triageLog) {
                addTriageLog(message.triageLog as TriageLog);
              }
              break;

            default:
              console.warn('⚠️ Tipo de mensagem desconhecido recebido do servidor:', message.type);
          }
        } catch (err) {
          console.error('❌ Erro ao processar mensagem do WebSocket:', err);
        }
      };

      ws.onclose = (event) => {
        setConnected(false);
        globalWs = null;
        
        if (isMounted.current) {
          console.log(`🔌 Conexão WebSocket fechada (código: ${event.code}). Tentando reconectar em 3s...`);
          // Tenta reconectar após 3 segundos
          if (!reconnectTimeoutId) {
            reconnectTimeoutId = window.setTimeout(() => {
              reconnectTimeoutId = null;
              connect();
            }, 3000);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Erro no WebSocket:', error);
        ws.close();
      };

    } catch (err) {
      console.error('❌ Falha ao instanciar o WebSocket:', err);
      setConnected(false);
    }
  }, [addOrUpdateTicket, setTickets, addTriageLog, setConnected]);

  /**
   * Envia uma resposta do agente para o servidor
   */
  const sendResponse = useCallback((ticketId: string, text: string) => {
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: 'AGENT_REPLY',
        data: { ticketId, text }
      });
      globalWs.send(payload);
      console.log(`📤 Resposta enviada para o ticket ${ticketId}:`, text);
      return true;
    } else {
      console.warn('⚠️ Não foi possível enviar a resposta. Conexão WebSocket fechada.');
      return false;
    }
  }, []);

  // Controla o ciclo de vida da conexão WebSocket
  useEffect(() => {
    isMounted.current = true;
    
    // Inicia a conexão
    connect();

    // Cleanup: Executa quando o hook é desmontado globalmente
    return () => {
      isMounted.current = false;
      // Nota: Não fechamos a conexão global imediatamente se houver re-renderizações rápidas do StrictMode,
      // mas se o app inteiro desmontar, podemos limpar. Em ambientes reais de SPA, a conexão WebSocket
      // geralmente dura a sessão inteira do operador.
    };
  }, [connect]);

  return {
    isConnected,
    sendResponse,
    reconnect: connect
  };
}
