export class RejectTicket {
  constructor(ticketRepository, getTicketUseCase, notificationService) {
    this.ticketRepository = ticketRepository;
    this.getTicketUseCase = getTicketUseCase;
    this.notificationService = notificationService;
  }

  async execute({ ticketId, agentId, agentName }) {
    if (!ticketId) {
      throw new Error('ID do ticket ausente para recusa.');
    }

    const ticket = await this.ticketRepository.getById(ticketId);
    if (!ticket) {
      throw new Error('Ticket não encontrado.');
    }

    // Busca outros atendentes conectados e ativos
    const activeOperators = await this.notificationService.getActiveOperators();
    const alternativeOperators = activeOperators.filter(o => o.id !== agentId);

    if (alternativeOperators.length > 0) {
      // Distribui para outro atendente aleatório
      const newOperator = alternativeOperators[Math.floor(Math.random() * alternativeOperators.length)];
      
      await this.ticketRepository.assignOperator(ticketId, newOperator.id, 'pending_acceptance');

      const updatedTicket = await this.getTicketUseCase.execute({ ticketId });
      this.notificationService.sendTicketUpdate(updatedTicket);

      console.log(`♻️ [Ticket Recusado/Encaminhado] ID: ${ticketId} do atendente ${agentName} para ${newOperator.name}`);

      return { success: true, updatedTicket };
    } else {
      // Não há outros operadores online. Lança erro específico que será capturado pela apresentação para REJECT_FAILED
      const error = new Error('Você é o único atendente disponível no momento. O atendimento continuará em sua fila de solicitações.');
      error.code = 'REJECT_FAILED';
      throw error;
    }
  }
}
