export class GetFullTickets {
  constructor(ticketRepository, messageRepository, ticketLogRepository) {
    this.ticketRepository = ticketRepository;
    this.messageRepository = messageRepository;
    this.ticketLogRepository = ticketLogRepository;
  }

  async execute({ user }) {
    const tickets = await this.ticketRepository.getAll(user);

    for (const ticket of tickets) {
      if (!ticket.operatorName) {
        ticket.operatorName = 'Aguardando Atendente';
      }

      // Fetch messages
      const messageRows = await this.messageRepository.getMessagesByTicketId(ticket.id);
      const { chatMessages, legacyLogs } = this.splitMessages(messageRows);
      ticket.messages = chatMessages;

      // Fetch db logs
      const dbLogs = await this.ticketLogRepository.getLogsByTicketId(ticket.id);

      // Merge and sort logs
      ticket.logs = [...legacyLogs, ...dbLogs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    }

    return tickets;
  }

  splitMessages(rows) {
    const chatMessages = [];
    const legacyLogs = [];

    for (const m of rows) {
      if (m.senderRole === 'system') {
        legacyLogs.push({ id: m.id, ticketId: m.ticketId, text: m.text, timestamp: m.timestamp });
      } else {
        chatMessages.push({
          id: m.id,
          ticketId: m.ticketId,
          text: m.text,
          timestamp: m.timestamp,
          sender: m.senderRole === 'agent' ? 'agent' : 'client',
          senderName: m.senderName
        });
      }
    }

    return { chatMessages, legacyLogs };
  }
}
