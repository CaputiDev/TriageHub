import { useTicketStore } from '../../../store/useTicketStore';
import type { Ticket } from '../../../core/entities/ticket';
import type { UserState } from '../../../core/entities/user';
import { handleMessage } from './messageHandlers';
import { PendingRequests } from './pendingRequests';
import { MAX_RECONNECT_ATTEMPTS, RECONNECT_DELAY_MS, WS_URL } from './websocketConfig';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeoutId: number | null = null;
  private reconnectAttempts = 0;
  private pendingRequests = new PendingRequests();
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
        this.reconnectAttempts = 0;
        useTicketStore.getState().setConnected(true);
        this.notifyListeners(true);

        if (this.reconnectTimeoutId) {
          clearTimeout(this.reconnectTimeoutId);
          this.reconnectTimeoutId = null;
        }

        const currentUser = useTicketStore.getState().currentUser;
        if (currentUser) {
          this.identify(currentUser.id, currentUser.name, currentUser.role, currentUser.email);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message, this.pendingRequests);
        } catch (err) {
          console.error('❌ Erro ao decodificar mensagem WebSocket:', err);
        }
      };

      ws.onclose = (event) => {
        useTicketStore.getState().setConnected(false);
        this.notifyListeners(false);
        this.ws = null;

        const shouldRetry = this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS;
        console.log(`🔌 Conexão WebSocket fechada (código: ${event.code}). ${shouldRetry ? `Reconectando em ${this.getReconnectDelay()}ms...` : 'Limite de reconexão atingido.'}`);

        if (shouldRetry) {
          this.scheduleReconnect();
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

  private getReconnectDelay(): number {
    return Math.min(RECONNECT_DELAY_MS * 2 ** this.reconnectAttempts, 30000);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeoutId) {
      return;
    }

    const delay = this.getReconnectDelay();
    this.reconnectAttempts += 1;

    this.reconnectTimeoutId = window.setTimeout(() => {
      this.reconnectTimeoutId = null;
      this.connect();
    }, delay);
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
        this.pendingRequests.set('AUTH', resolve, reject);

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
        this.pendingRequests.set('CREATE_TICKET', resolve, reject);

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
        this.pendingRequests.set(`GET_TICKET_${ticketId}`, resolve, reject);

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
        this.pendingRequests.set(`ACCEPT_${ticketId}`, resolve, reject);

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
        this.pendingRequests.set(`REJECT_${ticketId}`, resolve, reject);

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
