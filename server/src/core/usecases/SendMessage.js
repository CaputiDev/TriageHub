import { randomUUID } from 'crypto';
import { STRESS_KEYWORDS } from '../entities/Ticket.js';

export class SendMessage {
  constructor(ticketRepository, messageRepository, ticketLogRepository, getTicketUseCase, notificationService) {
    this.ticketRepository = ticketRepository;
    this.messageRepository = messageRepository;
    this.ticketLogRepository = ticketLogRepository;
    this.getTicketUseCase = getTicketUseCase;
    this.notificationService = notificationService;
  }

  async execute({ ticketId, sender, text, senderId, senderName }) {
    if (!ticketId || !sender || !text) {
      throw new Error('Dados incompletos para enviar a mensagem.');
    }

    const messageId = randomUUID();
    const timestamp = new Date().toISOString();

    // 1. Salva a nova mensagem no banco
    await this.messageRepository.create({
      id: messageId,
      ticketId,
      senderId,
      text,
      timestamp
    });

    // 2. Busca o Ticket correspondente
    const ticket = await this.ticketRepository.getById(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} não encontrado.`);
    }

    let newStatus = ticket.status;
    let newStressLevel = ticket.stressLevel;
    let newOperatorId = ticket.operatorId;

    if (sender === 'agent') {
      if (ticket.status === 'open') {
        newStatus = 'in_progress';
      }
      if (newStressLevel > 1) {
        newStressLevel = Math.max(1, newStressLevel - 1);
      }
    } else if (sender === 'client') {
      // Ajuste de nível de estresse com base nas palavras chaves do cliente
      const textLower = text.toLowerCase();
      const keywordsFound = STRESS_KEYWORDS.filter(kw => textLower.includes(kw));
      if (keywordsFound.length > 0) {
        newStressLevel = Math.min(5, newStressLevel + 1);
      }

      // Se o ticket estava em progresso, garante que o atendente ainda está conectado
      if (ticket.status === 'in_progress' && ticket.operatorId) {
        const activeOperators = await this.notificationService.getActiveOperators();
        const operatorIsOnline = activeOperators.some(o => o.id === ticket.operatorId);

        if (!operatorIsOnline) {
          console.warn(`⚠️ [SendMessage] Atendente do ticket ${ticketId} está offline. Reatribuindo...`);

          const alternatives = activeOperators.filter(o => o.id !== ticket.operatorId);

          if (alternatives.length > 0) {
            const newOperator = alternatives[Math.floor(Math.random() * alternatives.length)];
            newOperatorId = newOperator.id;
            newStatus = 'pending_acceptance';

            const logText = `Atendente anterior desconectou. Ticket reatribuído para o especialista ${newOperator.name}. Aguardando aceite.`;
            await this.ticketLogRepository.create({
              id: randomUUID(),
              ticketId,
              text: logText,
              timestamp: new Date(Date.now() + 500).toISOString()
            });
            console.log(`♻️ [SendMessage] Ticket ${ticketId} reatribuído para ${newOperator.name}.`);
          } else {
            newOperatorId = null;
            newStatus = 'open';

            const logText = `Atendente desconectou e não há outros especialistas online. Ticket devolvido para a fila de espera geral.`;
            await this.ticketLogRepository.create({
              id: randomUUID(),
              ticketId,
              text: logText,
              timestamp: new Date(Date.now() + 500).toISOString()
            });
            console.log(`⚠️ [SendMessage] Ticket ${ticketId} sem atendente online. Devolvido para a fila aberta.`);
          }
        }
      }
    }

    // 3. Atualiza o status, estresse e operador do Ticket
    await this.ticketRepository.updateStatusAndStressAndOperator(ticketId, newStatus, newStressLevel, newOperatorId);

    // 4. Recarrega o ticket atualizado e transmite
    const updatedTicket = await this.getTicketUseCase.execute({ ticketId });

    console.log(`✍️ [Nova Mensagem] Em: Ticket ${ticketId} | Remetente: ${sender} | Estresse: ${newStressLevel}`);

    this.notificationService.sendTicketUpdate(updatedTicket);

    return updatedTicket;
  }
}
