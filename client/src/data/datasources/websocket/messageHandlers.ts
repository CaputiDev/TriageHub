import { useTicketStore } from '../../../store/useTicketStore';
import type { Ticket } from '../../../core/entities/ticket';
import type { TriageLog } from '../../../core/entities/triage';
import type { PendingRequests } from './pendingRequests';

export type WebSocketMessage = {
    type: string;
    data?: unknown;
    error?: string;
    ticketId?: string;
    triageLog?: TriageLog;
};

function resolveTicketByShortId(pending: PendingRequests, ticketId: string): void {
    const shortId = ticketId.slice(0, 8).toUpperCase();
    pending.resolve(`GET_TICKET_${ticketId}`, ticketId);
    pending.resolve(`GET_TICKET_${shortId}`, ticketId);
    pending.resolve(`GET_TICKET_${shortId.toLowerCase()}`, ticketId);
}

export function handleMessage(message: WebSocketMessage, pending: PendingRequests): void {
    const store = useTicketStore.getState();

    switch (message.type) {
        case 'AUTH_SUCCESS': {
            const payload = message.data as {
                id: string;
                email: string;
                name: string;
                role: 'client' | 'agent';
                funcao?: string;
                codigoIdentificacao?: string;
            };

            store.login(payload.id, payload.name, payload.role, payload.email, payload.funcao, payload.codigoIdentificacao);
            pending.resolve('AUTH', payload);
            break;
        }

        case 'AUTH_ERROR': {
            pending.reject('AUTH', new Error(message.error ?? 'Authentication failed'));
            break;
        }

        case 'INITIAL_STATE': {
            store.setTickets(message.data as Ticket[]);
            break;
        }

        case 'TICKET_CREATED': {
            const ticket = message.data as Ticket;
            store.addOrUpdateTicket(ticket);
            store.setActiveTicketId(ticket.id);
            pending.resolve('CREATE_TICKET', ticket);
            break;
        }

        case 'TICKET_UPDATE': {
            const ticket = message.data as Ticket;
            store.addOrUpdateTicket(ticket);

            if (message.triageLog) {
                store.addTriageLog(message.triageLog as TriageLog);
            }

            resolveTicketByShortId(pending, ticket.id);
            pending.resolve(`ACCEPT_${ticket.id}`, ticket);
            pending.resolve(`REJECT_${ticket.id}`, ticket);
            break;
        }

        case 'TICKET_ERROR': {
            const ticketId = message.ticketId ?? '';
            const shortId = ticketId.length === 36 ? ticketId.slice(0, 8).toUpperCase() : ticketId.toUpperCase();

            if (!message.ticketId) {
                pending.reject('CREATE_TICKET', new Error(message.error ?? 'Ticket creation failed'));
                break;
            }

            pending.reject(`GET_TICKET_${ticketId}`, new Error(message.error ?? 'Ticket lookup failed'));
            pending.reject(`GET_TICKET_${shortId}`, new Error(message.error ?? 'Ticket lookup failed'));
            pending.reject(`GET_TICKET_${shortId.toLowerCase()}`, new Error(message.error ?? 'Ticket lookup failed'));
            break;
        }

        case 'REJECT_FAILED': {
            pending.reject(`REJECT_${message.ticketId ?? ''}`, new Error(message.error ?? 'Reject failed'));
            break;
        }

        default:
            break;
    }
}
