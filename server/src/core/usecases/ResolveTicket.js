import { randomUUID } from 'crypto';

export class ResolveTicket {
  constructor(ticketRepository, ticketLogRepository, getTicketUseCase, notificationService) {
    this.ticketRepository = ticketRepository;
    this.ticketLogRepository = ticketLogRepository;
    this.getTicketUseCase = getTicketUseCase;
    this.notificationService = notificationService;
  }

  async execute({ ticketId, operatorName }) {
    if (!ticketId) {
      throw new Error('ID do ticket ausente para finalização.');
    }

    const timestamp = new Date().toISOString();
    const finalLogId = randomUUID();
    const finalLogText = `Ticket encerrado pelo operador ${operatorName}.`;

    // 1. Atualiza status e nível de estresse no banco
    await this.ticketRepository.updateStatusAndStress(ticketId, 'resolved', 1);

    // 2. Registra log do encerramento
    await this.ticketLogRepository.create({
      id: finalLogId,
      ticketId,
      text: finalLogText,
      timestamp
    });

    // 3. Recarrega o ticket finalizado
    const resolvedTicket = await this.getTicketUseCase.execute({ ticketId });

    console.log(`✅ [Ticket Resolvido] ID: ${ticketId}`);

    // Transmite encerramento
    this.notificationService.sendTicketUpdate(resolvedTicket);

    return resolvedTicket;
  }
}
