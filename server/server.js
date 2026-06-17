import { DatabaseConnection } from './src/infrastructure/database/DatabaseConnection.js';
import { SQLiteUserRepository, SQLiteTicketRepository, SQLiteMessageRepository, SQLiteTicketLogRepository } from './src/infrastructure/database/SQLiteRepositories.js';
import { PasswordHasher } from './src/infrastructure/security/PasswordHasher.js';
import { WSNotificationService } from './src/infrastructure/websocket/WSNotificationService.js';
import { WSController } from './src/presentation/websocket/WSController.js';
import { WSServer } from './src/presentation/websocket/WSServer.js';

import { AuthenticateUser } from './src/core/usecases/AuthenticateUser.js';
import { IdentifyUser } from './src/core/usecases/IdentifyUser.js';
import { AssignOrphanTickets } from './src/core/usecases/AssignOrphanTickets.js';
import { CreateTicket } from './src/core/usecases/CreateTicket.js';
import { SendMessage } from './src/core/usecases/SendMessage.js';
import { ResolveTicket } from './src/core/usecases/ResolveTicket.js';
import { GetTicket } from './src/core/usecases/GetTicket.js';
import { GetFullTickets } from './src/core/usecases/GetFullTickets.js';
import { AcceptTicket } from './src/core/usecases/AcceptTicket.js';
import { RejectTicket } from './src/core/usecases/RejectTicket.js';
import { DisconnectAgent } from './src/core/usecases/DisconnectAgent.js';

const PORT = 8080;

async function bootstrap() {
  // 1. Inicializa Conexão com o Banco de Dados
  const dbConnection = new DatabaseConnection();
  const db = await dbConnection.connect();

  // 2. Inicializa os Repositórios
  const userRepository = new SQLiteUserRepository(db);
  const ticketRepository = new SQLiteTicketRepository(db);
  const messageRepository = new SQLiteMessageRepository(db);
  const ticketLogRepository = new SQLiteTicketLogRepository(db);

  // 3. Inicializa Serviços Utilitários
  const passwordHasher = new PasswordHasher();

  // 4. Instancia os Use Cases (Injeção de Dependência)
  let notificationService = null;

  // GetTicket e GetFullTickets não dependem de NotificationService
  const getTicket = new GetTicket(ticketRepository, messageRepository, ticketLogRepository);
  const getFullTickets = new GetFullTickets(ticketRepository, messageRepository, ticketLogRepository);

  const authenticateUser = new AuthenticateUser(userRepository, passwordHasher);
  const identifyUser = new IdentifyUser(userRepository);

  // Use cases que necessitam do notificationService
  const assignOrphanTickets = new AssignOrphanTickets(ticketRepository, getTicket, {
    sendTicketUpdate: (ticket, triageLog) => notificationService?.sendTicketUpdate(ticket, triageLog)
  });

  const createTicket = new CreateTicket(ticketRepository, messageRepository, ticketLogRepository, getTicket, {
    getActiveOperators: () => notificationService?.getActiveOperators(),
    sendTicketUpdate: (ticket, triageLog) => notificationService?.sendTicketUpdate(ticket, triageLog)
  });

  const sendMessage = new SendMessage(ticketRepository, messageRepository, ticketLogRepository, getTicket, {
    getActiveOperators: () => notificationService?.getActiveOperators(),
    sendTicketUpdate: (ticket, triageLog) => notificationService?.sendTicketUpdate(ticket, triageLog)
  });

  const resolveTicket = new ResolveTicket(ticketRepository, ticketLogRepository, getTicket, {
    sendTicketUpdate: (ticket, triageLog) => notificationService?.sendTicketUpdate(ticket, triageLog)
  });

  const acceptTicket = new AcceptTicket(ticketRepository, messageRepository, getTicket, {
    sendTicketUpdate: (ticket, triageLog) => notificationService?.sendTicketUpdate(ticket, triageLog)
  });

  const rejectTicket = new RejectTicket(ticketRepository, getTicket, {
    getActiveOperators: () => notificationService?.getActiveOperators(),
    sendTicketUpdate: (ticket, triageLog) => notificationService?.sendTicketUpdate(ticket, triageLog)
  });

  const disconnectAgent = new DisconnectAgent(ticketRepository, ticketLogRepository, getTicket, {
    getActiveOperators: () => notificationService?.getActiveOperators(),
    sendTicketUpdate: (ticket, triageLog) => notificationService?.sendTicketUpdate(ticket, triageLog)
  });

  // 5. Inicializa o Controlador de WebSocket
  const wsController = new WSController({
    authenticateUser,
    identifyUser,
    assignOrphanTickets,
    createTicket,
    sendMessage,
    resolveTicket,
    getTicket,
    getFullTickets,
    acceptTicket,
    rejectTicket,
    disconnectAgent
  });

  // 6. Inicia o Servidor de WebSocket
  const wsServer = new WSServer(PORT, wsController);
  const wss = wsServer.start();

  // 7. Vincula a implementação concreta do NotificationService
  notificationService = new WSNotificationService(wss);
}

bootstrap().catch((err) => {
  console.error('❌ Falha crítica ao inicializar o servidor:', err);
  process.exit(1);
});
