export class GetTicket {
  constructor(ticketRepository, messageRepository, ticketLogRepository) {
    this.ticketRepository = ticketRepository;
    this.messageRepository = messageRepository;
    this.ticketLogRepository = ticketLogRepository;
  }

  async execute({ ticketId }) {
    if (!ticketId) {
      throw new Error('ID do protocolo ausente.');
    }

    let ticket = null;
    if (ticketId.length === 8) {
      ticket = await this.ticketRepository.getByIdWithProtocol(ticketId);
    } else if (ticketId.length === 36) {
      ticket = await this.ticketRepository.getById(ticketId);
    } else {
      throw new Error('ID de protocolo inválido. Deve conter exatamente 8 caracteres ou UUID válido.');
    }

    if (!ticket) {
      return null;
    }

    if (!ticket.operatorName) {
      ticket.operatorName = 'Aguardando Atendente';
    }

    // Fetch and split messages
    const messageRows = await this.messageRepository.getMessagesByTicketId(ticket.id);
    const { chatMessages, legacyLogs } = this.splitMessages(messageRows);
    ticket.messages = chatMessages;

    // Fetch db logs
    const dbLogs = await this.ticketLogRepository.getLogsByTicketId(ticket.id);

    // Merge and sort logs
    ticket.logs = [...legacyLogs, ...dbLogs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return ticket;
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
