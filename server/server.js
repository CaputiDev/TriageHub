import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const PORT = 8080;

// Configuração do Banco de Dados SQLite
let db;

async function initDatabase() {
  db = await open({
    filename: './support.db',
    driver: sqlite3.Database
  });

  // Criação das Tabelas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      customerName TEXT NOT NULL,
      channel TEXT NOT NULL,
      subject TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      stressLevel INTEGER NOT NULL,
      operatorName TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      ticketId TEXT NOT NULL,
      sender TEXT NOT NULL, -- 'client' | 'agent'
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY(ticketId) REFERENCES tickets(id) ON DELETE CASCADE
    );
  `);

  console.log('💾 Banco de dados SQLite inicializado com sucesso! (support.db)');
}

// Inicializa o banco de dados antes de iniciar o WebSocket
await initDatabase();

const wss = new WebSocketServer({ port: PORT });
console.log(`🚀 Servidor Proxy WebSocket rodando na porta ${PORT}`);

// Palavras-chave de estresse para a triagem automatizada
const STRESS_KEYWORDS = ['procon', 'cancelar', 'urgente', 'ruim', 'advogado'];

/**
 * Retorna uma lista de nomes de técnicos ATIVOS e conectados no momento
 */
function getActiveOperators() {
  const operators = [];
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.user && client.user.role === 'agent') {
      if (!operators.includes(client.user.name)) {
        operators.push(client.user.name);
      }
    }
  });
  return operators;
}

/**
 * Retorna todos os tickets com suas mensagens ordenadas por data
 */
async function getFullTickets() {
  const tickets = await db.all('SELECT * FROM tickets');
  for (const ticket of tickets) {
    ticket.messages = await db.all(
      'SELECT * FROM messages WHERE ticketId = ? ORDER BY timestamp ASC',
      [ticket.id]
    );
  }
  return tickets;
}

/**
 * Transmite uma mensagem para todos os operadores/clientes conectados
 */
function broadcast(message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(payload);
    }
  });
}

/**
 * Executa a Triagem Automatizada
 */
function realizarTriagem(text) {
  const textLower = text.toLowerCase();
  const keywordsEncontradas = STRESS_KEYWORDS.filter(keyword => textLower.includes(keyword));
  const isStress = keywordsEncontradas.length > 0;

  if (isStress) {
    const priority = Math.random() > 0.5 ? 'critical' : 'high';
    return { priority, stressLevel: 5, detectedKeywords: keywordsEncontradas };
  } else {
    const priority = Math.random() > 0.5 ? 'medium' : 'low';
    const stressLevel = Math.floor(Math.random() * 3) + 1; // 1 a 3
    return { priority, stressLevel, detectedKeywords: [] };
  }
}

// Escuta conexões WebSocket
wss.on('connection', async (ws) => {
  console.log('🔌 Nova conexão WebSocket estabelecida.');

  // Envia o estado inicial de tickets salvos no SQLite
  try {
    const currentTickets = await getFullTickets();
    ws.send(JSON.stringify({
      type: 'INITIAL_STATE',
      data: currentTickets
    }));
  } catch (err) {
    console.error('❌ Erro ao enviar estado inicial do SQLite:', err);
  }

  // Ouve mensagens recebidas
  ws.on('message', async (messageRaw) => {
    try {
      const message = JSON.parse(messageRaw);
      console.log(`📩 Evento recebido: ${message.type}`);

      switch (message.type) {
        
        // IDENTIFY: Identifica o usuário conectado (Cliente ou Técnico)
        case 'IDENTIFY': {
          const { name, role } = message.data;
          if (!name || !role) return;

          // Associa os dados do usuário ao objeto de conexão WebSocket
          ws.user = { name, role };
          console.log(`👤 Usuário identificado: ${name} | Cargo: ${role.toUpperCase()}`);

          // Se for um ATENDENTE se conectando, verifica se há tickets "Aguardando Atendente" para assumir
          if (role === 'agent') {
            const pendingTickets = await db.all(
              "SELECT * FROM tickets WHERE status != 'resolved' AND operatorName = 'Aguardando Atendente'"
            );

            if (pendingTickets.length > 0) {
              console.log(`🛠️ Atendente ${name} assumindo ${pendingTickets.length} ticket(s) em espera...`);
              
              for (const ticket of pendingTickets) {
                // 1. Atualiza o atendente do ticket no SQLite
                await db.run(
                  "UPDATE tickets SET operatorName = ?, status = 'open' WHERE id = ?",
                  [name, ticket.id]
                );

                // 2. Cria mensagem de apresentação automática do atendente assumindo o caso
                const welcomeMsgId = randomUUID();
                const welcomeText = `Olá! Eu sou o técnico ${name} e acabo de assumir o seu suporte. Como posso te auxiliar com o seu pedido de atendimento?`;
                const welcomeTimestamp = new Date().toISOString();

                await db.run(
                  `INSERT INTO messages (id, ticketId, sender, text, timestamp) VALUES (?, ?, ?, ?, ?)`,
                  [welcomeMsgId, ticket.id, 'agent', welcomeText, welcomeTimestamp]
                );

                // 3. Recarrega o ticket atualizado
                const updatedTicket = await db.get('SELECT * FROM tickets WHERE id = ?', [ticket.id]);
                updatedTicket.messages = await db.all(
                  'SELECT * FROM messages WHERE ticketId = ? ORDER BY timestamp ASC',
                  [ticket.id]
                );

                // 4. Transmite a atualização em tempo real
                broadcast({
                  type: 'TICKET_UPDATE',
                  data: updatedTicket
                });
              }
            }
          }
          break;
        }

        // CLIENTE: Cria um novo pedido de suporte
        case 'CREATE_TICKET': {
          const { customerName, channel, subject } = message.data;
          
          if (!customerName || !channel || !subject) {
            console.warn('⚠️ Payload incompleto para CREATE_TICKET');
            return;
          }

          const ticketId = randomUUID();
          const createdAt = new Date().toISOString();

          // 1. Executa Triagem de Estresse baseada na mensagem inicial (subject)
          const { priority, stressLevel, detectedKeywords } = realizarTriagem(subject);

          // 2. Busca atendentes ATIVOS e conectados no momento
          const activeOperators = getActiveOperators();
          let operatorName = 'Aguardando Atendente';
          let hasAgent = activeOperators.length > 0;

          if (hasAgent) {
            // Se houver atendentes conectados, escolhe um de forma automática
            operatorName = activeOperators[Math.floor(Math.random() * activeOperators.length)];
          }

          // 3. Insere Ticket no SQLite
          await db.run(
            `INSERT INTO tickets (id, customerName, channel, subject, priority, status, stressLevel, operatorName, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ticketId, customerName, channel, subject, priority, 'open', stressLevel, operatorName, createdAt]
          );

          // 4. Cria Mensagem Inicial do Cliente
          const clientMsgId = randomUUID();
          await db.run(
            `INSERT INTO messages (id, ticketId, sender, text, timestamp) VALUES (?, ?, ?, ?, ?)`,
            [clientMsgId, ticketId, 'client', subject, createdAt]
          );

          // 5. Cria Mensagem de Boas-vindas
          const welcomeMsgId = randomUUID();
          const welcomeTimestamp = new Date(Date.now() + 1000).toISOString();
          let welcomeText = '';

          if (hasAgent) {
            // Mensagem automática de apresentação com o nome do técnico ativo selecionado
            welcomeText = `Olá! Eu sou o técnico ${operatorName} e acabo de ser designado para o seu suporte. Como posso te auxiliar com o seu pedido de atendimento?`;
          } else {
            // Mensagem de espera caso não existam técnicos ativos no momento
            welcomeText = `Olá! Agradecemos o seu contato. No momento, todos os nossos especialistas estão offline. Por favor, aguarde um momento que o primeiro técnico disponível que se conectar assumirá o seu atendimento!`;
          }

          await db.run(
            `INSERT INTO messages (id, ticketId, sender, text, timestamp) VALUES (?, ?, ?, ?, ?)`,
            [welcomeMsgId, ticketId, 'agent', welcomeText, welcomeTimestamp]
          );

          // 6. Carrega o ticket criado com suas mensagens
          const newTicket = await db.get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
          newTicket.messages = await db.all(
            'SELECT * FROM messages WHERE ticketId = ? ORDER BY timestamp ASC',
            [ticketId]
          );

          console.log(`📥 [Ticket Criado] De: ${customerName} | Designado: ${operatorName} | Prioridade: ${priority.toUpperCase()}`);

          // Envia resposta direta de confirmação de criação para o cliente específico
          ws.send(JSON.stringify({
            type: 'TICKET_CREATED',
            data: newTicket
          }));

          // Transmite a atualização geral para todos os conectados (operadores terão o novo ticket na fila)
          broadcast({
            type: 'TICKET_UPDATE',
            data: newTicket,
            triageLog: {
              id: randomUUID(),
              timestamp: createdAt,
              customerName,
              subject,
              detectedKeywords,
              priority,
              stressLevel
            }
          });
          break;
        }

        // COMUNICAÇÃO DE CHAT: Cliente ou Atendente envia mensagem de texto
        case 'SEND_MESSAGE': {
          const { ticketId, sender, text } = message.data;

          if (!ticketId || !sender || !text) {
            console.warn('⚠️ Payload incompleto para SEND_MESSAGE');
            return;
          }

          const messageId = randomUUID();
          const timestamp = new Date().toISOString();

          // 1. Salva a nova mensagem no SQLite
          await db.run(
            `INSERT INTO messages (id, ticketId, sender, text, timestamp) VALUES (?, ?, ?, ?, ?)`,
            [messageId, ticketId, sender, text, timestamp]
          );

          // 2. Busca informações do Ticket
          const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
          
          if (!ticket) {
            console.error(`❌ Ticket ${ticketId} não encontrado.`);
            return;
          }

          let newStatus = ticket.status;
          let newStressLevel = ticket.stressLevel;

          // Se for resposta do atendente, muda o status para em progresso se estiver aberto
          if (sender === 'agent') {
            if (ticket.status === 'open') {
              newStatus = 'in_progress';
            }
            // Acalma o cliente: diminui nível de estresse em -1 (mínimo 1)
            if (newStressLevel > 1) {
              newStressLevel = Math.max(1, newStressLevel - 1);
            }
          } else if (sender === 'client') {
            // Se for resposta do cliente, analisa se usou termos de estresse adicionais para aumentar o estresse!
            const textLower = text.toLowerCase();
            const keywordsEncontradas = STRESS_KEYWORDS.filter(keyword => textLower.includes(keyword));
            if (keywordsEncontradas.length > 0) {
              newStressLevel = Math.min(5, newStressLevel + 1); // Aumenta estresse em +1 (máximo 5)
            }
          }

          // 3. Atualiza o status e nível de estresse do Ticket no SQLite
          await db.run(
            `UPDATE tickets SET status = ?, stressLevel = ? WHERE id = ?`,
            [newStatus, newStressLevel, ticketId]
          );

          // 4. Recarrega o ticket atualizado
          const updatedTicket = await db.get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
          updatedTicket.messages = await db.all(
            'SELECT * FROM messages WHERE ticketId = ? ORDER BY timestamp ASC',
            [ticketId]
          );

          console.log(`✍️ [Nova Mensagem] Em: Ticket ${ticketId} | Remetente: ${sender} | Estresse: ${newStressLevel}`);

          // Transmite o ticket atualizado em broadcast (mantém cliente e atendente sincronizados)
          broadcast({
            type: 'TICKET_UPDATE',
            data: updatedTicket
          });
          break;
        }

        // RESOLVER TICKET: Operador finaliza o suporte
        case 'RESOLVE_TICKET': {
          const { ticketId } = message.data;

          if (!ticketId) {
            console.warn('⚠️ ID do ticket ausente para RESOLVE_TICKET');
            return;
          }

          const timestamp = new Date().toISOString();
          const finalMsgId = randomUUID();
          const finalMsgText = "Prezado cliente, identificamos que sua solicitação foi atendida. Este ticket foi encerrado pelo operador. Obrigado pelo contato!";

          // 1. Atualiza o status do ticket para resolved e estresse para 1 no SQLite
          await db.run(
            `UPDATE tickets SET status = 'resolved', stressLevel = 1 WHERE id = ?`,
            [ticketId]
          );

          // 2. Insere mensagem automática de finalização no SQLite
          await db.run(
            `INSERT INTO messages (id, ticketId, sender, text, timestamp) VALUES (?, ?, ?, ?, ?)`,
            [finalMsgId, ticketId, 'agent', finalMsgText, timestamp]
          );

          // 3. Recarrega o ticket finalizado
          const resolvedTicket = await db.get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
          resolvedTicket.messages = await db.all(
            'SELECT * FROM messages WHERE ticketId = ? ORDER BY timestamp ASC',
            [ticketId]
          );

          console.log(`✅ [Ticket Resolvido] ID: ${ticketId}`);

          // Transmite o encerramento do ticket para sincronizar as telas
          broadcast({
            type: 'TICKET_UPDATE',
            data: resolvedTicket
          });
          break;
        }

        default:
          console.warn(`⚠️ Evento WebSocket não reconhecido: ${message.type}`);
      }
    } catch (err) {
      console.error('❌ Erro no processamento de mensagem WebSocket:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Conexão WebSocket encerrada.');
  });
});
