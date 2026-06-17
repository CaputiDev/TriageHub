import { randomUUID } from 'crypto';

export class AcceptTicket {
  constructor(ticketRepository, messageRepository, getTicketUseCase, notificationService) {
    this.ticketRepository = ticketRepository;
    this.messageRepository = messageRepository;
    this.getTicketUseCase = getTicketUseCase;
    this.notificationService = notificationService;
  }

  async execute({ ticketId, agentId, agentName }) {
    if (!ticketId) {
      throw new Error('ID do ticket ausente para aceitação.');
    }

    const ticket = await this.ticketRepository.getById(ticketId);
    if (!ticket) {
      throw new Error('Ticket não encontrado.');
    }

    // 1. Atualiza o status para em progresso
    await this.ticketRepository.updateStatus(ticketId, 'in_progress');

    // 2. Insere a mensagem de boas-vindas do atendente
    const welcomeMsgId = randomUUID();
    const welcomeText = `Olá! Eu sou o técnico ${agentName} e acabo de aceitar o seu suporte. Como posso te auxiliar com o seu pedido de atendimento?`;
    const welcomeTimestamp = new Date().toISOString();

    await this.messageRepository.create({
      id: welcomeMsgId,
      ticketId,
      senderId: agentId,
      text: welcomeText,
      timestamp: welcomeTimestamp
    });

    // 3. Recarrega o ticket atualizado e transmite
    const updatedTicket = await this.getTicketUseCase.execute({ ticketId });
    this.notificationService.sendTicketUpdate(updatedTicket);

    console.log(`✅ [Ticket Aceito] ID: ${ticketId} pelo atendente ${agentName}`);

    return updatedTicket;
  }
}
