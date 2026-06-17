import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import argon2 from 'argon2';

const PORT = 8080;

// Configuração do Banco de Dados Persistente
let db;

async function initDatabase() {
  db = await open({
    filename: './support.db',
    driver: sqlite3.Database
  });

  // Verifica se o esquema está desatualizado (se a tabela tickets existe mas não tem customerId ou ainda possui declaredUrgency)
  try {
    const tableInfo = await db.all("PRAGMA table_info(tickets)");
    if (tableInfo.length > 0) {
      const hasCustomerId = tableInfo.some(column => column.name === 'customerId');
      const hasDeclaredUrgency = tableInfo.some(column => column.name === 'declaredUrgency');
      if (!hasCustomerId || hasDeclaredUrgency) {
        console.log('⚠️ Esquema de banco de dados desatualizado detectado (ajustando colunas). Recriando tabelas relacionais...');
        await db.exec(`
          DROP TABLE IF EXISTS messages;
          DROP TABLE IF EXISTS tickets;
          DROP TABLE IF EXISTS agent_access_logs;
          DROP TABLE IF EXISTS agents;
          DROP TABLE IF EXISTS users;
        `);
      }
    }
  } catch (e) {
    // Tabela ainda não existe, prossegue normalmente
  }

  // Nota: Para o desenvolvimento acadêmico local e evitar conflitos com colunas anteriores,
  // recriamos as tabelas com a nova estrutura expandida se necessário.
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agents (
      userId TEXT PRIMARY KEY,
      funcao TEXT NOT NULL,
      codigoIdentificacao TEXT UNIQUE NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS agent_access_logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES agents(userId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      channel TEXT NOT NULL,
      category TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      stressLevel INTEGER NOT NULL,
      operatorId TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(customerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(operatorId) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      ticketId TEXT NOT NULL,
      senderId TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY(ticketId) REFERENCES tickets(id) ON DELETE CASCADE,
      FOREIGN KEY(senderId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ticket_logs (
      id TEXT PRIMARY KEY,
      ticketId TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY(ticketId) REFERENCES tickets(id) ON DELETE CASCADE
    );
  `);

  // Garante que o usuário system_bot existe para integridade referencial dos logs e mensagens
  const systemBotUser = await db.get("SELECT 1 FROM users WHERE id = 'system_bot'");
  if (!systemBotUser) {
    await db.run(
      "INSERT INTO users (id, email, name, passwordHash, role) VALUES ('system_bot', 'bot@triagehub.local', 'Sistema', 'N/A', 'system')"
    );
  }

  console.log('💾 Banco de dados persistente inicializado!');
}

// Inicializa o banco de dados antes do WebSocket
await initDatabase();

const wss = new WebSocketServer({ port: PORT });
console.log(`🚀 Servidor Proxy WebSocket rodando na porta ${PORT}`);

// Palavras-chave de estresse para a triagem automatizada
const STRESS_KEYWORDS = ['procon', 'cancelar', 'urgente', 'ruim', 'advogado'];

/**
 * Retorna uma lista de nomes de técnicos ATIVOS e conectados no momento
 */
/**
 * Retorna uma lista de objetos de atendentes ATIVOS e conectados no momento
 */
function getActiveOperators() {
  const operators = [];
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.user && client.user.role === 'agent') {
      if (!operators.some(o => o.id === client.user.id)) {
        operators.push(client.user);
      }
    }
  });
  return operators;
}

/**
 * Separa linhas brutas de mensagens em mensagens de chat (client/agent)
 * e logs legados do system_bot que ainda estejam na tabela messages.
 */
function splitMessages(rows) {
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

/**
 * Retorna os tickets formatados com nomes decodificados e histórico de mensagens.
 * Filtra por cliente se o usuário logado for cliente.
 */
async function getFullTickets(user = null) {
  let ticketsQuery = `
    SELECT t.*, u_c.name AS customerName, u_c.email AS customerEmail, u_o.name AS operatorName
    FROM tickets t
    JOIN users u_c ON t.customerId = u_c.id
    LEFT JOIN users u_o ON t.operatorId = u_o.id
  `;
  let queryParams = [];

  if (user && user.role === 'client') {
    ticketsQuery += ' WHERE t.customerId = ? ';
    queryParams.push(user.id);
  } else if (user && user.role === 'agent') {
    ticketsQuery += ' WHERE t.operatorId = ? ';
    queryParams.push(user.id);
  }

  const tickets = await db.all(ticketsQuery, queryParams);

  for (const ticket of tickets) {
    if (!ticket.operatorName) {
      ticket.operatorName = 'Aguardando Atendente';
    }

    const rows = await db.all(`
      SELECT m.id, m.ticketId, m.text, m.timestamp, u.role AS senderRole, u.name AS senderName
      FROM messages m
      JOIN users u ON m.senderId = u.id
      WHERE m.ticketId = ?
      ORDER BY m.timestamp ASC
    `, [ticket.id]);

    const { chatMessages, legacyLogs } = splitMessages(rows);
    ticket.messages = chatMessages;

    const dbLogs = await db.all(`
      SELECT id, ticketId, text, timestamp FROM ticket_logs
      WHERE ticketId = ? ORDER BY timestamp ASC
    `, [ticket.id]);

    // Mescla logs legados (system_bot antigo) com ticket_logs, ordenado por timestamp
    ticket.logs = [...legacyLogs, ...dbLogs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
  return tickets;
}

/**
 * Retorna um ticket individual com mensagens e nomes formatados a partir do ID
 */
async function getTicketById(ticketId) {
  const tickets = await db.all(`
    SELECT t.*, u_c.name AS customerName, u_c.email AS customerEmail, u_o.name AS operatorName
    FROM tickets t
    JOIN users u_c ON t.customerId = u_c.id
    LEFT JOIN users u_o ON t.operatorId = u_o.id
    WHERE t.id = ?
  `, [ticketId]);

  if (tickets.length === 0) return null;
  const ticket = tickets[0];
  if (!ticket.operatorName) {
    ticket.operatorName = 'Aguardando Atendente';
  }

  const rows = await db.all(`
    SELECT m.id, m.ticketId, m.text, m.timestamp, u.role AS senderRole, u.name AS senderName
    FROM messages m
    JOIN users u ON m.senderId = u.id
    WHERE m.ticketId = ?
    ORDER BY m.timestamp ASC
  `, [ticket.id]);

  const { chatMessages, legacyLogs } = splitMessages(rows);
  ticket.messages = chatMessages;

  const dbLogs = await db.all(`
    SELECT id, ticketId, text, timestamp FROM ticket_logs
    WHERE ticketId = ? ORDER BY timestamp ASC
  `, [ticket.id]);

  // Mescla logs legados com ticket_logs, ordenado por timestamp
  ticket.logs = [...legacyLogs, ...dbLogs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return ticket;
}

/**
 * Transmite a atualização do ticket de forma segura:
 * - O operador designado ao ticket recebe a atualização.
 * - O cliente dono do ticket recebe a atualização.
 * - Outros agentes não recebem tickets que não são seus.
 */
function sendTicketUpdate(ticket, triageLog = null) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.user) {
      // Se o ticket não tem operador, todos os agentes online recebem (para fila aberta)
      const isAnyAgent = client.user.role === 'agent' && !ticket.operatorId;
      // Se tem operador, apenas o designado recebe
      const isAssignedAgent = client.user.role === 'agent' && client.user.id === ticket.operatorId;
      const isOwnerClient = client.user.id === ticket.customerId;

      if (isAnyAgent || isAssignedAgent || isOwnerClient) {
        client.send(JSON.stringify({
          type: 'TICKET_UPDATE',
          data: ticket,
          ...(triageLog && (isAssignedAgent || isAnyAgent) ? { triageLog } : {})
        }));
      }
    }
  });
}

/**
 * Gera um código identificador aleatório de 8 dígitos contendo letras maiúsculas e números de 1 a 9
 */
function generateAgentCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Executa a Triagem Automatizada baseada na descrição detalhada
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

  // Ouve mensagens recebidas
  ws.on('message', async (messageRaw) => {
    try {
      const message = JSON.parse(messageRaw);
      console.log(`📩 Evento recebido: ${message.type}`);

      switch (message.type) {

        // =======================================================
        // AUTH: Autenticação Segura (Login e Registro com Argon2)
        // =======================================================
        case 'AUTH': {
          const { email, password, firstName, lastName, role, funcao, isSignUp } = message.data;

          if (!email || !password) {
            ws.send(JSON.stringify({
              type: 'AUTH_ERROR',
              error: 'Dados de autenticação incompletos.'
            }));
            return;
          }

          // Busca usuário no SQLite pelo email
          const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);

          if (isSignUp) {
            // ==========================================
            // CADASTRO/REGISTRO
            // ==========================================
            if (existingUser) {
              ws.send(JSON.stringify({
                type: 'AUTH_ERROR',
                error: 'Este e-mail já está cadastrado. Por favor, faça login.'
              }));
              return;
            }

            if (!firstName || !lastName || !role) {
              ws.send(JSON.stringify({
                type: 'AUTH_ERROR',
                error: 'Por favor, preencha todos os campos para realizar o cadastro.'
              }));
              return;
            }

            if (role === 'agent' && !funcao) {
              ws.send(JSON.stringify({
                type: 'AUTH_ERROR',
                error: 'Por favor, selecione a sua função de atendente.'
              }));
              return;
            }

            const name = `${firstName.trim()} ${lastName.trim()}`;

            try {
              const salt = Buffer.from("uvacomchocolatequente567890");
              const passwordHash = await argon2.hash(password, { salt });

              const userId = randomUUID();

              // Salva o novo usuário no SQLite
              await db.run(
                `INSERT INTO users (id, email, name, passwordHash, role) VALUES (?, ?, ?, ?, ?)`,
                [userId, email, name, passwordHash, role]
              );

              let code = '';
              if (role === 'agent') {
                // Gera código de identificação exclusivo de 8 dígitos
                let isUnique = false;
                while (!isUnique) {
                  code = generateAgentCode();
                  const existingAgent = await db.get('SELECT 1 FROM agents WHERE codigoIdentificacao = ?', [code]);
                  if (!existingAgent) {
                    isUnique = true;
                  }
                }

                await db.run(
                  `INSERT INTO agents (userId, funcao, codigoIdentificacao) VALUES (?, ?, ?)`,
                  [userId, funcao, code]
                );

                console.log(`🔒 Novo atendente cadastrado: ${name} (${funcao}) | Código: ${code}`);
              } else {
                console.log(`🔒 Novo usuário cadastrado: ${name} (${role})`);
              }

              // Associa o usuário à conexão WebSocket
              ws.user = { id: userId, name, role, email };

              ws.send(JSON.stringify({
                type: 'AUTH_SUCCESS',
                data: {
                  id: userId,
                  email,
                  name,
                  role,
                  ...(role === 'agent' ? { funcao, codigoIdentificacao: code } : {})
                }
              }));

              // Envia o estado inicial de tickets
              const currentTickets = await getFullTickets(ws.user);
              ws.send(JSON.stringify({
                type: 'INITIAL_STATE',
                data: currentTickets
              }));
            } catch (err) {
              console.error('❌ Erro no cadastro:', err);
              ws.send(JSON.stringify({
                type: 'AUTH_ERROR',
                error: 'Erro no servidor ao realizar cadastro.'
              }));
            }

          } else {
            // ==========================================
            // LOGIN
            // ==========================================
            if (!existingUser) {
              ws.send(JSON.stringify({
                type: 'AUTH_ERROR',
                error: 'Este e-mail não está cadastrado. Por favor, realize o cadastro.'
              }));
              return;
            }

            try {
              const passwordMatch = await argon2.verify(existingUser.passwordHash, password);

              if (passwordMatch) {
                console.log(`🔒 Login efetuado com sucesso: ${existingUser.name} (${existingUser.role})`);

                // Associa o usuário à conexão WebSocket
                ws.user = { id: existingUser.id, name: existingUser.name, role: existingUser.role, email: existingUser.email };

                let extraDetails = {};
                if (existingUser.role === 'agent') {
                  const agentDetails = await db.get('SELECT * FROM agents WHERE userId = ?', [existingUser.id]);
                  let funcao = agentDetails?.funcao || 'suporte_ti_1';
                  let codigoIdentificacao = agentDetails?.codigoIdentificacao;

                  if (!codigoIdentificacao) {
                    // Correção automática para atendentes antigos sem registro em agents
                    let isUnique = false;
                    while (!isUnique) {
                      codigoIdentificacao = generateAgentCode();
                      const existingAgent = await db.get('SELECT 1 FROM agents WHERE codigoIdentificacao = ?', [codigoIdentificacao]);
                      if (!existingAgent) {
                        isUnique = true;
                      }
                    }
                    await db.run(
                      `INSERT INTO agents (userId, funcao, codigoIdentificacao) VALUES (?, ?, ?)`,
                      [existingUser.id, funcao, codigoIdentificacao]
                    );
                  }

                  // 1. Grava log de acesso na tabela dedicada de atendentes
                  const logId = randomUUID();
                  const timestamp = new Date().toISOString();
                  await db.run(
                    `INSERT INTO agent_access_logs (id, userId, timestamp) VALUES (?, ?, ?)`,
                    [logId, existingUser.id, timestamp]
                  );

                  // 2. Limita os logs de acessos a no máximo os 50 mais recentes
                  const logs = await db.all(
                    `SELECT id FROM agent_access_logs WHERE userId = ? ORDER BY timestamp DESC`,
                    [existingUser.id]
                  );
                  if (logs.length > 50) {
                    for (const oldestLog of logs.slice(50)) {
                      await db.run(`DELETE FROM agent_access_logs WHERE id = ?`, [oldestLog.id]);
                    }
                  }

                  extraDetails = { funcao, codigoIdentificacao };
                }

                ws.send(JSON.stringify({
                  type: 'AUTH_SUCCESS',
                  data: {
                    id: existingUser.id,
                    email: existingUser.email,
                    name: existingUser.name,
                    role: existingUser.role,
                    ...extraDetails
                  }
                }));

                 // Se for um atendente, reatribui tickets orfãos antes de enviar o estado inicial
                 if (ws.user.role === 'agent') {
                   const orphanTickets = await db.all(
                     "SELECT * FROM tickets WHERE status = 'open' AND operatorId IS NULL"
                   );
                   if (orphanTickets.length > 0) {
                     console.log(`🛠️ Atendimentos órfãos encaminhados para ${ws.user.name} como pendentes de aceitação...`);
                     for (const orphan of orphanTickets) {
                       await db.run(
                         "UPDATE tickets SET operatorId = ?, status = 'pending_acceptance' WHERE id = ?",
                         [ws.user.id, orphan.id]
                       );
                     }
                   }
                 }

                 // Envia os tickets após login com sucesso (já incluindo tickets reatribuídos)
                 const currentTickets = await getFullTickets(ws.user);
                 ws.send(JSON.stringify({
                   type: 'INITIAL_STATE',
                   data: currentTickets
                 }));
              } else {
                console.warn(`⚠️ Senha incorreta para o email: ${email}`);
                ws.send(JSON.stringify({
                  type: 'AUTH_ERROR',
                  error: 'Senha incorreta. Por favor, tente novamente.'
                }));
              }
            } catch (err) {
              console.error('❌ Erro ao verificar hash de senha:', err);
              ws.send(JSON.stringify({
                type: 'AUTH_ERROR',
                error: 'Erro interno ao autenticar senha.'
              }));
            }
          }
          break;
        }

        // IDENTIFY: Identificação Reativa de Usuários
        case 'IDENTIFY': {
          const { name, role, email, id } = message.data;
          if (!role) return;

          let userId = id;
          let userName = name;
          if (email && (!userId || !userName)) {
            const u = await db.get('SELECT * FROM users WHERE email = ?', [email]);
            if (u) {
              userId = u.id;
              userName = u.name;
            }
          }

          if (!userId) return;

          ws.user = { id: userId, name: userName, role, email };
          console.log(`👤 Usuário re-identificado na conexão: ${userName} | Cargo: ${role.toUpperCase()}`);

          // Se for um ATENDENTE se conectando, encaminha os tickets "Aguardando Atendente" como pendentes
          if (role === 'agent') {
            const pendingTickets = await db.all(
              "SELECT * FROM tickets WHERE status = 'open' AND operatorId IS NULL"
            );

            if (pendingTickets.length > 0) {
              console.log(`🛠️ Atendimentos órfãos encaminhados para ${userName} como pendentes de aceitação...`);

              for (const ticket of pendingTickets) {
                // 1. Atualiza o atendente do ticket no SQLite para pendente de aceitação
                await db.run(
                  "UPDATE tickets SET operatorId = ?, status = 'pending_acceptance' WHERE id = ?",
                  [userId, ticket.id]
                );

                // 2. Recarrega o ticket atualizado e transmite
                const updatedTicket = await getTicketById(ticket.id);
                sendTicketUpdate(updatedTicket);
              }
            }
          }
          break;
        }

        // CLIENTE: Cria um novo pedido de suporte (Questionário Expandido)
        case 'CREATE_TICKET': {
          const { customerEmail, channel, category, subject, description } = message.data;

          if (!customerEmail || !channel || !category || !subject || !description) {
            console.warn('⚠️ Payload incompleto para CREATE_TICKET');
            return;
          }

          if (!ws.user) {
            console.warn('⚠️ Usuário não autenticado no WebSocket');
            return;
          }

          const customerId = ws.user.id;
          const customerName = ws.user.name;
          const ticketId = randomUUID();
          const createdAt = new Date().toISOString();

          // 1. Executa Triagem de Estresse
          const { priority, stressLevel, detectedKeywords } = realizarTriagem(description);

          // 2. Busca atendentes online
          const activeOperators = getActiveOperators();
          let operatorId = null;
          let operatorName = 'Aguardando Atendente';
          let hasAgent = activeOperators.length > 0;

          if (hasAgent) {
            const selectedAgent = activeOperators[Math.floor(Math.random() * activeOperators.length)];
            operatorId = selectedAgent.id;
            operatorName = selectedAgent.name;
          }

          // 3. Insere Ticket no SQLite usando IDs (com status 'pending_acceptance' se houver operador)
          const initialStatus = hasAgent ? 'pending_acceptance' : 'open';
          await db.run(
            `INSERT INTO tickets (id, customerId, channel, category, subject, description, priority, status, stressLevel, operatorId, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ticketId, customerId, channel, category, subject, description, priority, initialStatus, stressLevel, operatorId, createdAt]
          );

          // 4. Cria Mensagem Inicial do Cliente (usando o resumo do assunto)
          const clientMsgId = randomUUID();
          await db.run(
            `INSERT INTO messages (id, ticketId, senderId, text, timestamp) VALUES (?, ?, ?, ?, ?)`,
            [clientMsgId, ticketId, customerId, subject, createdAt]
          );

          // 5. Registra log do sistema sobre a fila de espera (sem operador online)
          if (!hasAgent) {
            const logId = randomUUID();
            const logTimestamp = new Date(Date.now() + 1000).toISOString();
            const logText = `Ticket criado e adicionado à fila de espera. Nenhum especialista online no momento — o primeiro técnico disponível assumirá o atendimento automaticamente.`;

            await db.run(
              `INSERT INTO ticket_logs (id, ticketId, text, timestamp) VALUES (?, ?, ?, ?)`,
              [logId, ticketId, logText, logTimestamp]
            );
          } else {
            const logId = randomUUID();
            const logTimestamp = new Date(Date.now() + 1000).toISOString();
            const logText = `Ticket criado e encaminhado para o especialista ${operatorName} para aceite.`;

            await db.run(
              `INSERT INTO ticket_logs (id, ticketId, text, timestamp) VALUES (?, ?, ?, ?)`,
              [logId, ticketId, logText, logTimestamp]
            );
          }

          // 6. Carrega o ticket criado com suas mensagens
          const newTicket = await getTicketById(ticketId);

          console.log(`📥 [Ticket Criado] De: ${customerName} | Prioridade: ${priority.toUpperCase()} | Canal: ${channel} | Status: ${initialStatus}`);

          // Envia resposta direta de confirmação de criação para o cliente específico
          ws.send(JSON.stringify({
            type: 'TICKET_CREATED',
            data: newTicket
          }));

          // Transmite a atualização de forma segura para todos os agentes e para o cliente
          sendTicketUpdate(newTicket, {
            id: randomUUID(),
            timestamp: createdAt,
            customerName,
            subject,
            detectedKeywords,
            priority,
            stressLevel
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

          if (!ws.user) {
            console.warn('⚠️ Conexão WebSocket não autenticada');
            return;
          }

          const messageId = randomUUID();
          const timestamp = new Date().toISOString();
          const senderId = ws.user.id;

          // 1. Salva a nova mensagem no SQLite com senderId
          await db.run(
            `INSERT INTO messages (id, ticketId, senderId, text, timestamp) VALUES (?, ?, ?, ?, ?)`,
            [messageId, ticketId, senderId, text, timestamp]
          );

          // 2. Busca informações do Ticket
          const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [ticketId]);

          if (!ticket) {
            console.error(`❌ Ticket ${ticketId} não encontrado.`);
            return;
          }

          let newStatus = ticket.status;
          let newStressLevel = ticket.stressLevel;
          let newOperatorId = ticket.operatorId;

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
            // Aumenta estresse se o cliente usar palavras-chave críticas
            const textLower = text.toLowerCase();
            const keywordsEncontradas = STRESS_KEYWORDS.filter(keyword => textLower.includes(keyword));
            if (keywordsEncontradas.length > 0) {
              newStressLevel = Math.min(5, newStressLevel + 1);
            }

            // ──────────────────────────────────────────────────────────────
            // VERIFICAÇÃO DE ATENDENTE ATIVO
            // Quando o cliente envia mensagem, verifica se o atendente
            // designado ainda está online. Se não estiver, reatribui.
            // ──────────────────────────────────────────────────────────────
            if (ticket.status === 'in_progress' && ticket.operatorId) {
              const activeOperators = getActiveOperators();
              const operatorIsOnline = activeOperators.some(o => o.id === ticket.operatorId);

              if (!operatorIsOnline) {
                console.warn(`⚠️ [SEND_MESSAGE] Atendente do ticket ${ticketId} está offline. Reatribuindo...`);

                // Outros atendentes online (excluindo o desconectado)
                const alternatives = activeOperators.filter(o => o.id !== ticket.operatorId);

                if (alternatives.length > 0) {
                  // Escolhe um atendente aleatório disponível
                  const newOperator = alternatives[Math.floor(Math.random() * alternatives.length)];
                  newOperatorId = newOperator.id;
                  newStatus = 'pending_acceptance';

                  // Registra log de sistema notificando a transição de atendente
                  const sysMsgId = randomUUID();
                  const sysMsgTimestamp = new Date(Date.now() + 500).toISOString();
                  const sysMsgText = `Atendente anterior desconectou. Ticket reatribuído para o especialista ${newOperator.name}. Aguardando aceite.`;

                  await db.run(
                    `INSERT INTO ticket_logs (id, ticketId, text, timestamp) VALUES (?, ?, ?, ?)`,
                    [sysMsgId, ticketId, sysMsgText, sysMsgTimestamp]
                  );

                  console.log(`♻️ [SEND_MESSAGE] Ticket ${ticketId} reatribuído para ${newOperator.name}.`);
                } else {
                  // Nenhum atendente online — volta para a fila aberta
                  newOperatorId = null;
                  newStatus = 'open';

                  const sysMsgId = randomUUID();
                  const sysMsgTimestamp = new Date(Date.now() + 500).toISOString();
                  const sysMsgText = `Atendente desconectou e não há outros especialistas online. Ticket devolvido para a fila de espera geral.`;

                  await db.run(
                    `INSERT INTO ticket_logs (id, ticketId, text, timestamp) VALUES (?, ?, ?, ?)`,
                    [sysMsgId, ticketId, sysMsgText, sysMsgTimestamp]
                  );

                  console.log(`⚠️ [SEND_MESSAGE] Ticket ${ticketId} sem atendente online. Devolvido para a fila aberta.`);
                }
              }
            }
          }

          // 3. Atualiza o status, nível de estresse e operador do Ticket no SQLite
          await db.run(
            `UPDATE tickets SET status = ?, stressLevel = ?, operatorId = ? WHERE id = ?`,
            [newStatus, newStressLevel, newOperatorId, ticketId]
          );

          // 4. Recarrega o ticket atualizado
          const updatedTicket = await getTicketById(ticketId);

          console.log(`✍️ [Nova Mensagem] Em: Ticket ${ticketId} | Remetente: ${sender} | Estresse: ${newStressLevel}`);

          // Transmite o ticket atualizado de forma segura
          sendTicketUpdate(updatedTicket);
          break;
        }

        // RESOLVER TICKET: Operador finaliza o suporte
        case 'RESOLVE_TICKET': {
          const { ticketId } = message.data;

          if (!ticketId) {
            console.warn('⚠️ ID do ticket ausente para RESOLVE_TICKET');
            return;
          }

          if (!ws.user) {
            console.warn('⚠️ Conexão WebSocket não autenticada');
            return;
          }

          const timestamp = new Date().toISOString();
          const finalLogId = randomUUID();
          const finalLogText = `Ticket encerrado pelo operador ${ws.user.name}.`;

          // 1. Atualiza o status do ticket para resolved e estresse para 1 no SQLite
          await db.run(
            `UPDATE tickets SET status = 'resolved', stressLevel = 1 WHERE id = ?`,
            [ticketId]
          );

          // 2. Registra log de finalização em ticket_logs
          await db.run(
            `INSERT INTO ticket_logs (id, ticketId, text, timestamp) VALUES (?, ?, ?, ?)`,
            [finalLogId, ticketId, finalLogText, timestamp]
          );

          // 3. Recarrega o ticket finalizado
          const resolvedTicket = await getTicketById(ticketId);

          console.log(`✅ [Ticket Resolvido] ID: ${ticketId}`);

          // Transmite o encerramento do ticket de forma segura
          sendTicketUpdate(resolvedTicket);
          break;
        }

        // GET_TICKET: Busca ticket por ID de Protocolo (8 caracteres ou UUID)
        case 'GET_TICKET': {
          const { ticketId } = message.data;

          if (!ticketId) {
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              error: 'ID do protocolo ausente.'
            }));
            console.warn('⚠️ ID do ticket ausente para GET_TICKET');
            return;
          }

          if (!ws.user) {
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              ticketId,
              error: 'Sessão não autenticada no servidor.'
            }));
            console.warn('⚠️ Conexão WebSocket não autenticada');
            return;
          }

          try {
            // Busca o ticket pelo ID de protocolo (primeiros 8 caracteres do UUID) ou UUID completo
            let fullTicketId = ticketId;
            if (ticketId.length === 8) {
              const ticketRow = await db.get(
                "SELECT id FROM tickets WHERE UPPER(SUBSTR(id, 1, 8)) = UPPER(?)",
                [ticketId]
              );
              if (ticketRow) {
                fullTicketId = ticketRow.id;
              } else {
                ws.send(JSON.stringify({
                  type: 'TICKET_ERROR',
                  ticketId,
                  error: 'Protocolo de ticket não encontrado no banco de dados.'
                }));
                console.warn(`⚠️ Protocolo ${ticketId} não encontrado.`);
                return;
              }
            } else if (ticketId.length !== 36) {
              ws.send(JSON.stringify({
                type: 'TICKET_ERROR',
                ticketId,
                error: 'ID de protocolo inválido. Deve conter exatamente 8 caracteres.'
              }));
              return;
            }

            const ticket = await getTicketById(fullTicketId);
            if (ticket) {
              // Envia diretamente para o solicitante
              ws.send(JSON.stringify({
                type: 'TICKET_UPDATE',
                data: ticket
              }));
              console.log(`📤 Ticket ${fullTicketId} (Protocolo: ${ticketId}) enviado com sucesso para ${ws.user.name}`);
            } else {
              ws.send(JSON.stringify({
                type: 'TICKET_ERROR',
                ticketId,
                error: 'Protocolo de ticket não encontrado no banco de dados.'
              }));
              console.warn(`⚠️ Ticket ${fullTicketId} não encontrado.`);
            }
          } catch (err) {
            console.error('❌ Erro ao buscar ticket por protocolo:', err);
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              ticketId,
              error: 'Erro interno no servidor ao pesquisar o protocolo.'
            }));
          }
          break;
        }

        // ACCEPT_TICKET: Operador aceita a solicitação pendente
        case 'ACCEPT_TICKET': {
          const { ticketId } = message.data;

          if (!ticketId) {
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              error: 'ID do ticket ausente para aceitação.'
            }));
            return;
          }

          if (!ws.user) {
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              ticketId,
              error: 'Sessão não autenticada no servidor.'
            }));
            return;
          }

          try {
            const ticket = await db.get("SELECT * FROM tickets WHERE id = ?", [ticketId]);
            if (!ticket) {
              ws.send(JSON.stringify({
                type: 'TICKET_ERROR',
                ticketId,
                error: 'Ticket não encontrado.'
              }));
              return;
            }

            // 1. Atualiza o status para em progresso
            await db.run(
              "UPDATE tickets SET status = 'in_progress' WHERE id = ?",
              [ticketId]
            );

            // 2. Insere a mensagem de boas-vindas do atendente no banco
            const welcomeMsgId = randomUUID();
            const welcomeText = `Olá! Eu sou o técnico ${ws.user.name} e acabo de aceitar o seu suporte. Como posso te auxiliar com o seu pedido de atendimento?`;
            const welcomeTimestamp = new Date().toISOString();

            await db.run(
              `INSERT INTO messages (id, ticketId, senderId, text, timestamp) VALUES (?, ?, ?, ?, ?)`,
              [welcomeMsgId, ticketId, ws.user.id, welcomeText, welcomeTimestamp]
            );

            // 3. Recarrega o ticket atualizado e transmite
            const updatedTicket = await getTicketById(ticketId);
            sendTicketUpdate(updatedTicket);
            console.log(`✅ [Ticket Aceito] ID: ${ticketId} pelo atendente ${ws.user.name}`);
          } catch (err) {
            console.error('❌ Erro ao aceitar ticket:', err);
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              ticketId,
              error: 'Erro interno ao aceitar o ticket.'
            }));
          }
          break;
        }

        // REJECT_TICKET: Operador nega a solicitação pendente
        case 'REJECT_TICKET': {
          const { ticketId } = message.data;

          if (!ticketId) {
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              error: 'ID do ticket ausente para recusa.'
            }));
            return;
          }

          if (!ws.user) {
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              ticketId,
              error: 'Sessão não autenticada no servidor.'
            }));
            return;
          }

          try {
            const ticket = await db.get("SELECT * FROM tickets WHERE id = ?", [ticketId]);
            if (!ticket) {
              ws.send(JSON.stringify({
                type: 'TICKET_ERROR',
                ticketId,
                error: 'Ticket não encontrado.'
              }));
              return;
            }

            const currentAgentId = ws.user.id;
            const currentAgentName = ws.user.name;

            // Busca outros atendentes conectados e ativos (excluindo o atual)
            const alternativeOperators = getActiveOperators().filter(o => o.id !== currentAgentId);

            if (alternativeOperators.length > 0) {
              // Distribui para outro atendente aleatório no estado de proposta
              const newOperator = alternativeOperators[Math.floor(Math.random() * alternativeOperators.length)];
              
              await db.run(
                "UPDATE tickets SET operatorId = ?, status = 'pending_acceptance' WHERE id = ?",
                [newOperator.id, ticketId]
              );

              // Recarrega o ticket atualizado e transmite
              const updatedTicket = await getTicketById(ticketId);
              sendTicketUpdate(updatedTicket);
              console.log(`♻️ [Ticket Recusado/Encaminhado] ID: ${ticketId} do atendente ${currentAgentName} para ${newOperator.name}`);
            } else {
              // Não há outros operadores online. Alerta o operador e mantém na fila dele.
              ws.send(JSON.stringify({
                type: 'REJECT_FAILED',
                ticketId,
                error: 'Você é o único atendente disponível no momento. O atendimento continuará em sua fila de solicitações.'
              }));
              console.warn(`⚠️ Recusa de ticket ${ticketId} falhou: único atendente online.`);
            }
          } catch (err) {
            console.error('❌ Erro ao recusar ticket:', err);
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              ticketId,
              error: 'Erro interno ao recusar o ticket.'
            }));
          }
          break;
        }

        default:
          console.warn(`⚠️ Evento WebSocket não reconhecido: ${message.type}`);
      }
    } catch (err) {
      console.error('❌ Erro no processamento de mensagem WebSocket:', err);
    }
  });

  ws.on('close', async () => {
    console.log('🔌 Conexão WebSocket encerrada.');

    // Se quem desconectou era um atendente, executa reatribuição resiliente dos seus tickets ativos
    if (ws.user && ws.user.role === 'agent') {
      const disconnectedAgentId = ws.user.id;
      const disconnectedAgentName = ws.user.name;
      console.log(`🔌 Técnico desconectado: ${disconnectedAgentName} (ID: ${disconnectedAgentId}). Verificando tickets ativos...`);

      try {
        const activeTickets = await db.all(
          "SELECT * FROM tickets WHERE status != 'resolved' AND operatorId = ?",
          [disconnectedAgentId]
        );

        if (activeTickets.length > 0) {
          console.log(`🛠️ Reatribuindo ${activeTickets.length} ticket(s) ativo(s) do técnico desconectado...`);

          // Obtém outros atendentes online, garantindo que não inclua o que acabou de desconectar
          const alternativeOperators = getActiveOperators().filter(o => o.id !== disconnectedAgentId);

          if (alternativeOperators.length > 0) {
            // Distribui os tickets aleatoriamente entre os atendentes online no estado pendente de aceitação
            for (const ticket of activeTickets) {
              const newOperator = alternativeOperators[Math.floor(Math.random() * alternativeOperators.length)];
              
              await db.run(
                "UPDATE tickets SET operatorId = ?, status = 'pending_acceptance' WHERE id = ?",
                [newOperator.id, ticket.id]
              );

              // Registra log de sistema sobre a transição de atendente
              const msgId = randomUUID();
              const transitionText = `Técnico ${disconnectedAgentName} desconectou. Ticket encaminhado para ${newOperator.name} como pendente de aceite.`;
              const timestamp = new Date().toISOString();

              await db.run(
                `INSERT INTO ticket_logs (id, ticketId, text, timestamp) VALUES (?, ?, ?, ?)`,
                [msgId, ticket.id, transitionText, timestamp]
              );

              // Carrega ticket atualizado e transmite a atualização
              const updatedTicket = await getTicketById(ticket.id);
              sendTicketUpdate(updatedTicket);
            }
            console.log(`✅ ${activeTickets.length} ticket(s) reatribuído(s) com sucesso aos atendentes online como pendentes.`);
          } else {
            // Se nenhum atendente estiver online, devolve os tickets para a fila aberta sem operador
            for (const ticket of activeTickets) {
              await db.run(
                "UPDATE tickets SET operatorId = NULL, status = 'open' WHERE id = ?",
                [ticket.id]
              );

              // Registra log de sistema: sem atendentes online
              const msgId = randomUUID();
              const fallbackText = `Técnico ${disconnectedAgentName} desconectou. Nenhum outro operador online — ticket devolvido para a fila de espera geral.`;
              const timestamp = new Date().toISOString();

              await db.run(
                `INSERT INTO ticket_logs (id, ticketId, text, timestamp) VALUES (?, ?, ?, ?)`,
                [msgId, ticket.id, fallbackText, timestamp]
              );

              // Carrega ticket atualizado e transmite a atualização
              const updatedTicket = await getTicketById(ticket.id);
              sendTicketUpdate(updatedTicket);
            }
            console.log(`⚠️ Nenhum outro atendente online. ${activeTickets.length} ticket(s) devolvido(s) para a fila.`);
          }
        }
      } catch (err) {
        console.error('❌ Erro na reatribuição ao desconectar atendente:', err);
      }
    }
  });
});
