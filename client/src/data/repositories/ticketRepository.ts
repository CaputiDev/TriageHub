import { websocketService } from '../datasources/websocket/websocketService';
import type { Ticket } from '../../core/entities/ticket';
import type { UserState } from '../../core/entities/user';

export interface TicketRepository {
  connect(): void;
  authenticate(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    role?: 'client' | 'agent',
    funcao?: string,
    isSignUp?: boolean
  ): Promise<UserState>;
  createTicket(
    customerName: string,
    customerEmail: string,
    channel: 'WhatsApp' | 'Webchat',
    category: string,
    subject: string,
    description: string
  ): Promise<Ticket>;
  sendMessage(ticketId: string, sender: 'client' | 'agent', text: string): boolean;
  resolveTicket(ticketId: string): boolean;
  getTicket(ticketId: string): Promise<Ticket>;
  acceptTicket(ticketId: string): Promise<Ticket>;
  rejectTicket(ticketId: string): Promise<Ticket>;
  onConnectionChange(callback: (connected: boolean) => void): () => void;
}

export const ticketRepository: TicketRepository = {
  connect: () => websocketService.connect(),
  authenticate: (email, password, firstName, lastName, role, funcao, isSignUp) =>
    websocketService.authenticate(email, password, firstName, lastName, role, funcao, isSignUp),
  createTicket: (customerName, customerEmail, channel, category, subject, description) =>
    websocketService.createTicket(customerName, customerEmail, channel, category, subject, description),
  sendMessage: (ticketId, sender, text) => websocketService.sendMessage(ticketId, sender, text),
  resolveTicket: (ticketId) => websocketService.resolveTicket(ticketId),
  getTicket: (ticketId) => websocketService.getTicket(ticketId),
  acceptTicket: (ticketId) => websocketService.acceptTicket(ticketId),
  rejectTicket: (ticketId) => websocketService.rejectTicket(ticketId),
  onConnectionChange: (callback) => websocketService.addListener(callback)
};
