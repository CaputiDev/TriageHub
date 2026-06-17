import { useTicketStore } from '../../../store/useTicketStore';
import type { Ticket } from '../../../core/entities/ticket';
import type { TriageLog } from '../../../core/entities/triage';
import type { UserState } from '../../../core/entities/user';

const WS_URL = 'ws://localhost:8080';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeoutId: number | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pendingResolves = new Map<string, (value: any) => void>();
  private pendingRejects = new Map<string, (reason: Error) => void>();
  private listeners: Set<(connected: boolean) => void> = new Set();

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    console.log('🔌 Conectando ao Servidor WebSocket...');

    try {
      const ws = new WebSocket(WS_URL);
      this.ws = ws;

      ws.onopen = () => {
        console.log('✅ Conexão WebSocket estabelecida com sucesso!');
        useTicketStore.getState().setConnected(true);
        this.notifyListeners(true);
        if (this.reconnectTimeoutId) {
          clearTimeout(this.reconnectTimeoutId);
          this.reconnectTimeoutId = null;
        }

        // Se já houver um usuário logado, re-identifica-o
        const currentUser = useTicketStore.getState().currentUser;
        if (currentUser) {
          this.identify(currentUser.id, currentUser.name, currentUser.role, currentUser.email);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const store = useTicketStore.getState();

          switch (message.type) {
            case 'AUTH_SUCCESS': {
              console.log('🔑 Autenticação efetuada com sucesso no backend:', message.data.name);
              const { id, email, name, role, funcao, codigoIdentificacao } = message.data;

              store.login(id, name, role, email, funcao, codigoIdentificacao);

              const resolve = this.pendingResolves.get('AUTH');
              if (resolve) {
                resolve(message.data);
                this.pendingResolves.delete('AUTH');
                this.pendingRejects.delete('AUTH');
              }
              break;
            }

            case 'AUTH_ERROR': {
              console.warn('❌ Falha na autenticação do socket:', message.error);

              const reject = this.pendingRejects.get('AUTH');
              if (reject) {
                reject(new Error(message.error));
                this.pendingResolves.delete('AUTH');
                this.pendingRejects.delete('AUTH');
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

              const resolve = this.pendingResolves.get('CREATE_TICKET');
              if (resolve) {
                resolve(ticket);
                this.pendingResolves.delete('CREATE_TICKET');
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

              const shortId = ticket.id.slice(0, 8).toUpperCase();
              const resolve = this.pendingResolves.get(`GET_TICKET_${ticket.id}`) ||
                this.pendingResolves.get(`GET_TICKET_${shortId}`) ||
                this.pendingResolves.get(`GET_TICKET_${shortId.toLowerCase()}`);

              if (resolve) {
                resolve(ticket);
                this.pendingResolves.delete(`GET_TICKET_${ticket.id}`);
                this.pendingResolves.delete(`GET_TICKET_${shortId}`);
                this.pendingResolves.delete(`GET_TICKET_${shortId.toLowerCase()}`);

                this.pendingRejects.delete(`GET_TICKET_${ticket.id}`);
                this.pendingRejects.delete(`GET_TICKET_${shortId}`);
                this.pendingRejects.delete(`GET_TICKET_${shortId.toLowerCase()}`);
              }

              const acceptResolve = this.pendingResolves.get(`ACCEPT_${ticket.id}`);
              if (acceptResolve) {
                acceptResolve(ticket);
                this.pendingResolves.delete(`ACCEPT_${ticket.id}`);
                this.pendingRejects.delete(`ACCEPT_${ticket.id}`);
              }

              const rejectResolve = this.pendingResolves.get(`REJECT_${ticket.id}`);
              if (rejectResolve) {
                rejectResolve(ticket);
                this.pendingResolves.delete(`REJECT_${ticket.id}`);
                this.pendingRejects.delete(`REJECT_${ticket.id}`);
              }
              break;
            }

            case 'TICKET_ERROR': {
              console.warn('❌ Erro de ticket recebido do servidor:', message.error);
              const ticketId = message.ticketId || '';
              const shortId = ticketId.length === 36 ? ticketId.slice(0, 8).toUpperCase() : ticketId.toUpperCase();

              // Rejeita criação de ticket pendente (sem ticketId = erro no CREATE_TICKET)
              if (!message.ticketId) {
                const createReject = this.pendingRejects.get('CREATE_TICKET');
                if (createReject) {
                  createReject(new Error(message.error));
                  this.pendingResolves.delete('CREATE_TICKET');
                  this.pendingRejects.delete('CREATE_TICKET');
                }
                break;
              }

              const reject = this.pendingRejects.get(`GET_TICKET_${ticketId}`) ||
                this.pendingRejects.get(`GET_TICKET_${shortId}`) ||
                this.pendingRejects.get(`GET_TICKET_${shortId.toLowerCase()}`);

              if (reject) {
                reject(new Error(message.error));
                this.pendingResolves.delete(`GET_TICKET_${ticketId}`);
                this.pendingResolves.delete(`GET_TICKET_${shortId}`);
                this.pendingResolves.delete(`GET_TICKET_${shortId.toLowerCase()}`);

                this.pendingRejects.delete(`GET_TICKET_${ticketId}`);
                this.pendingRejects.delete(`GET_TICKET_${shortId}`);
                this.pendingRejects.delete(`GET_TICKET_${shortId.toLowerCase()}`);
              }
              break;
            }

            case 'REJECT_FAILED': {
              console.warn('❌ Falha ao recusar ticket:', message.error);
              const reject = this.pendingRejects.get(`REJECT_${message.ticketId}`);
              if (reject) {
                reject(new Error(message.error));
                this.pendingResolves.delete(`REJECT_${message.ticketId}`);
                this.pendingRejects.delete(`REJECT_${message.ticketId}`);
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
        this.notifyListeners(false);
        this.ws = null;

        console.log(`🔌 Conexão WebSocket fechada (código: ${event.code}). Reconectando em 3s...`);
        if (!this.reconnectTimeoutId) {
          this.reconnectTimeoutId = window.setTimeout(() => {
            this.reconnectTimeoutId = null;
            this.connect();
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
      this.notifyListeners(false);
    }
  }

  public identify(id: string, name: string, role: 'client' | 'agent', email: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'IDENTIFY',
        data: { id, name, role, email }
      }));
      console.log(`📤 Identificado reativamente como: ${name} (${role})`);
    }
  }

  public authenticate(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    role?: 'client' | 'agent',
    funcao?: string,
    isSignUp?: boolean
  ): Promise<UserState> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.pendingResolves.set('AUTH', resolve);
        this.pendingRejects.set('AUTH', reject);

        const payload = JSON.stringify({
          type: 'AUTH',
          data: { email, password, firstName, lastName, role, funcao, isSignUp }
        });
        this.ws.send(payload);
        console.log(`📤 Enviando solicitação de autenticação para o e-mail: ${email}`);
      } else {
        reject(new Error('Servidor offline. Verifique a conexão com o WebSocket.'));
      }
    });
  }

  public createTicket(
    customerName: string,
    customerEmail: string,
    channel: 'WhatsApp' | 'Webchat',
    category: string,
    subject: string,
    description: string
  ): Promise<Ticket> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.pendingResolves.set('CREATE_TICKET', resolve);
        this.pendingRejects.set('CREATE_TICKET', reject);

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
        this.ws.send(payload);
        console.log(`📤 Enviando ticket expandido para ${customerName}`);
      } else {
        reject(new Error('WebSocket não está conectado. Tente novamente.'));
      }
    });
  }

  public sendMessage(ticketId: string, sender: 'client' | 'agent', text: string): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: 'SEND_MESSAGE',
        data: { ticketId, sender, text }
      });
      this.ws.send(payload);
      console.log(`📤 Nova mensagem enviada pelo ${sender} no ticket ${ticketId}`);
      return true;
    }
    return false;
  }

  public resolveTicket(ticketId: string): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: 'RESOLVE_TICKET',
        data: { ticketId }
      });
      this.ws.send(payload);
      console.log(`📤 Fechamento de ticket enviado: ${ticketId}`);
      return true;
    }
    return false;
  }

  public getTicket(ticketId: string): Promise<Ticket> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.pendingResolves.set(`GET_TICKET_${ticketId}`, resolve);
        this.pendingRejects.set(`GET_TICKET_${ticketId}`, reject);

        const payload = JSON.stringify({
          type: 'GET_TICKET',
          data: { ticketId }
        });
        this.ws.send(payload);
        console.log(`📤 Solicitando ticket específico por protocolo: ${ticketId}`);
      } else {
        reject(new Error('Servidor offline. Verifique a conexão com o WebSocket.'));
      }
    });
  }

  public acceptTicket(ticketId: string): Promise<Ticket> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.pendingResolves.set(`ACCEPT_${ticketId}`, resolve);
        this.pendingRejects.set(`ACCEPT_${ticketId}`, reject);

        const payload = JSON.stringify({
          type: 'ACCEPT_TICKET',
          data: { ticketId }
        });
        this.ws.send(payload);
        console.log(`📤 Enviando aceite do ticket: ${ticketId}`);
      } else {
        reject(new Error('WebSocket não está conectado. Tente novamente.'));
      }
    });
  }

  public rejectTicket(ticketId: string): Promise<Ticket> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.pendingResolves.set(`REJECT_${ticketId}`, resolve);
        this.pendingRejects.set(`REJECT_${ticketId}`, reject);

        const payload = JSON.stringify({
          type: 'REJECT_TICKET',
          data: { ticketId }
        });
        this.ws.send(payload);
        console.log(`📤 Enviando recusa do ticket: ${ticketId}`);
      } else {
        reject(new Error('WebSocket não está conectado. Tente novamente.'));
      }
    });
  }

  public addListener(callback: (connected: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(connected: boolean): void {
    this.listeners.forEach((listener) => listener(connected));
  }
}

export const websocketService = new WebSocketService();
