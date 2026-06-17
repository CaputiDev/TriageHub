import { NotificationService } from '../../core/services/NotificationService.js';

export class WSNotificationService extends NotificationService {
  constructor(wss) {
    super();
    this.wss = wss;
  }

  async getActiveOperators() {
    const operators = [];
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1 && client.user && client.user.role === 'agent') {
        if (!operators.some(o => o.id === client.user.id)) {
          operators.push(client.user);
        }
      }
    });
    return operators;
  }

  async sendTicketUpdate(ticket, triageLog = null) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1 && client.user) {
        const isAnyAgent = client.user.role === 'agent' && !ticket.operatorId;
        const isAssignedAgent = client.user.role === 'agent' && client.user.id === ticket.operatorId;
        const isOwnerClient = client.user.id === ticket.customerId;

        if (isAnyAgent || isAssignedAgent || isOwnerClient) {
          client.send(JSON.stringify({
            type: 'TICKET_UPDATE',
            data: ticket,
            ...(triageLog && (isAssignedAgent || isAnyAgent) ? { triageLog } : {})
          }));
        }
      }
    });
  }
}
