import { randomUUID } from 'crypto';
import { Ticket } from '../entities/Ticket.js';

export class CreateTicket {
  constructor(ticketRepository, messageRepository, ticketLogRepository, getTicketUseCase, notificationService) {
    this.ticketRepository = ticketRepository;
    this.messageRepository = messageRepository;
    this.ticketLogRepository = ticketLogRepository;
    this.getTicketUseCase = getTicketUseCase;
    this.notificationService = notificationService;
  }

  async execute({ customerId, customerName, customerEmail, channel, category, subject, description }) {
    if (!customerEmail || !channel || !category || !subject || !description) {
      throw new Error('Dados incompletos para criar o ticket.');
    }

    const ticketId = randomUUID();
    const createdAt = new Date().toISOString();

    // 1. Executa Triagem de Estresse
    const { priority, stressLevel, detectedKeywords } = Ticket.realizarTriagem(description);

    // 2. Busca atendentes online
    const activeOperators = await this.notificationService.getActiveOperators();
    let operatorId = null;
    let operatorName = 'Aguardando Atendente';
    const hasAgent = activeOperators.length > 0;

    if (hasAgent) {
      const selectedAgent = activeOperators[Math.floor(Math.random() * activeOperators.length)];
      operatorId = selectedAgent.id;
      operatorName = selectedAgent.name;
    }

    // 3. Insere Ticket no Banco
    const initialStatus = hasAgent ? 'pending_acceptance' : 'open';
    await this.ticketRepository.create({
      id: ticketId,
      customerId,
      channel,
      category,
      subject,
      description,
      priority,
      status: initialStatus,
      stressLevel,
      operatorId,
      createdAt
    });

    // 4. Cria Mensagem Inicial do Cliente
    const clientMsgId = randomUUID();
    await this.messageRepository.create({
      id: clientMsgId,
      ticketId,
      senderId: customerId,
      text: subject,
      timestamp: createdAt
    });

    // 5. Registra log do sistema
    const logText = hasAgent
      ? `Ticket criado e encaminhado para o especialista ${operatorName} para aceite.`
      : `Ticket criado e adicionado à fila de espera. Nenhum especialista online no momento.`;
    await this.ticketLogRepository.create({
      id: randomUUID(),
      ticketId,
      text: logText,
      timestamp: new Date(Date.now() + 1000).toISOString()
    });

    // 6. Carrega o ticket criado com suas mensagens e logs
    const newTicket = await this.getTicketUseCase.execute({ ticketId });

    console.log(`📥 [Ticket Criado] De: ${customerName} | Prioridade: ${priority.toUpperCase()} | Canal: ${channel} | Status: ${initialStatus}`);

    // 7. Transmite a atualização para todos os agentes e para o cliente
    this.notificationService.sendTicketUpdate(newTicket, {
      id: randomUUID(),
      timestamp: createdAt,
      customerName,
      subject,
      detectedKeywords,
      priority,
      stressLevel
    });

    return newTicket;
  }
}
