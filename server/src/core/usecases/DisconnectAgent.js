import { randomUUID } from 'crypto';

export class DisconnectAgent {
  constructor(ticketRepository, ticketLogRepository, getTicketUseCase, notificationService) {
    this.ticketRepository = ticketRepository;
    this.ticketLogRepository = ticketLogRepository;
    this.getTicketUseCase = getTicketUseCase;
    this.notificationService = notificationService;
  }

  async execute({ agentId, agentName }) {
    console.log(`🔌 Técnico desconectado: ${agentName} (ID: ${agentId}). Verificando tickets ativos...`);

    const activeTickets = await this.ticketRepository.getActiveTicketsByOperator(agentId);

    if (activeTickets.length > 0) {
      console.log(`🛠️ Reatribuindo ${activeTickets.length} ticket(s) ativo(s) do técnico desconectado...`);

      // Obtém outros atendentes online
      const activeOperators = await this.notificationService.getActiveOperators();
      const alternativeOperators = activeOperators.filter(o => o.id !== agentId);

      if (alternativeOperators.length > 0) {
        for (const ticket of activeTickets) {
          const newOperator = alternativeOperators[Math.floor(Math.random() * alternativeOperators.length)];
          
          await this.ticketRepository.assignOperator(ticket.id, newOperator.id, 'pending_acceptance');

          const transitionText = `Técnico ${agentName} desconectou. Ticket encaminhado para ${newOperator.name} como pendente de aceite.`;
          await this.ticketLogRepository.create({
            id: randomUUID(),
            ticketId: ticket.id,
            text: transitionText,
            timestamp: new Date().toISOString()
          });

          const updatedTicket = await this.getTicketUseCase.execute({ ticketId: ticket.id });
          if (updatedTicket) {
            this.notificationService.sendTicketUpdate(updatedTicket);
          }
        }
        console.log(`✅ ${activeTickets.length} ticket(s) reatribuído(s) com sucesso aos atendentes online como pendentes.`);
      } else {
        for (const ticket of activeTickets) {
          await this.ticketRepository.assignOperator(ticket.id, null, 'open');

          const fallbackText = `Técnico ${agentName} desconectou. Nenhum outro operador online — ticket devolvido para a fila de espera geral.`;
          await this.ticketLogRepository.create({
            id: randomUUID(),
            ticketId: ticket.id,
            text: fallbackText,
            timestamp: new Date().toISOString()
          });

          const updatedTicket = await this.getTicketUseCase.execute({ ticketId: ticket.id });
          if (updatedTicket) {
            this.notificationService.sendTicketUpdate(updatedTicket);
          }
        }
        console.log(`⚠️ Nenhum outro atendente online. ${activeTickets.length} ticket(s) devolvido(s) para a fila.`);
      }
    }
  }
}
