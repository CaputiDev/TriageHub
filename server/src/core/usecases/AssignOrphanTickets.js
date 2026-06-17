export class AssignOrphanTickets {
  constructor(ticketRepository, getTicketUseCase, notificationService) {
    this.ticketRepository = ticketRepository;
    this.getTicketUseCase = getTicketUseCase;
    this.notificationService = notificationService;
  }

  async execute({ agentId, agentName }) {
    const orphanTickets = await this.ticketRepository.getOrphanTickets();

    if (orphanTickets.length > 0) {
      console.log(`🛠️ Atendimentos órfãos encaminhados para ${agentName} como pendentes de aceitação...`);

      for (const ticket of orphanTickets) {
        await this.ticketRepository.assignOperator(ticket.id, agentId, 'pending_acceptance');

        const updatedTicket = await this.getTicketUseCase.execute({ ticketId: ticket.id });
        if (updatedTicket) {
          this.notificationService.sendTicketUpdate(updatedTicket);
        }
      }
    }
  }
}
