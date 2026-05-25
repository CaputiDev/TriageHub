import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

// Porta do servidor WebSocket
const PORT = 8080;

// Inicializa o servidor WebSocket
const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 Servidor Proxy WebSocket rodando na porta ${PORT}`);

// Estado local em memória para os tickets ativos
// Armazenado como um Map indexado pelo ID do ticket para acesso O(1)
const ticketsMap = new Map();

// Palavras-chave de estresse para a triagem automatizada
const STRESS_KEYWORDS = ['procon', 'cancelar', 'urgente', 'ruim', 'advogado'];

// Lista de nomes de clientes fictícios para simulação
const FICTITIOUS_NAMES = [
  'Carlos Silva', 'Ana Souza', 'Marcos Oliveira', 'Juliana Lima',
  'Roberto Santos', 'Gabriela Costa', 'Felipe Almeida', 'Patrícia Rocha',
  'Lucas Pereira', 'Mariana Neves', 'Daniela Fernandes', 'Rodrigo Melo'
];

// Lista de canais possíveis
const CHANNELS = ['WhatsApp', 'Webchat'];

// Lista de assuntos com palavras de estresse e normais para simulação
const SIMULATED_SUBJECTS = [
  { text: 'Preciso cancelar meu plano imediatamente', stress: true },
  { text: 'Estou tendo problemas de acesso ao painel principal', stress: false },
  { text: 'Meu caso está no PROCON e quero uma resposta', stress: true },
  { text: 'Dúvida sobre a fatura deste mês', stress: false },
  { text: 'Serviço muito ruim! Quero falar com um supervisor', stress: true },
  { text: 'Como posso alterar minha senha cadastrada?', stress: false },
  { text: 'Meu advogado me orientou a abrir essa reclamação', stress: true },
  { text: 'Preciso de um suporte urgente no servidor de produção', stress: true },
  { text: 'Queria entender mais sobre os planos corporativos', stress: false },
  { text: 'Minha integração API parou de funcionar', stress: false }
];

/**
 * Função de transmissão: envia uma mensagem para todos os clientes conectados
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
 * Motor de Triagem Inteligente
 * Regra de Negócio: Analisa a ocorrência de palavras de estresse no texto do assunto
 * Define prioridades crítícas/altas e nível de estresse 5 se detectado,
 * caso contrário define prioridades normais e nível de estresse baixo (1 a 3)
 */
function realizarTriagem(subject) {
  const subjectLower = subject.toLowerCase();
  const keywordsEncontradas = STRESS_KEYWORDS.filter(keyword => subjectLower.includes(keyword));
  const isStress = keywordsEncontradas.length > 0;

  if (isStress) {
    // Escolhe aleatoriamente entre 'critical' e 'high'
    const priority = Math.random() > 0.5 ? 'critical' : 'high';
    return {
      priority,
      stressLevel: 5,
      detectedKeywords: keywordsEncontradas
    };
  } else {
    // Escolhe aleatoriamente entre 'medium' e 'low'
    const priority = Math.random() > 0.5 ? 'medium' : 'low';
    // Nível de estresse entre 1 e 3
    const stressLevel = Math.floor(Math.random() * 3) + 1;
    return {
      priority,
      stressLevel,
      detectedKeywords: []
    };
  }
}

/**
 * Simulador de Novo Ticket
 * Cria um novo ticket com dados realistas, realiza a triagem e o transmite aos clientes
 */
function simularNovoTicket() {
  const id = randomUUID();
  const customerName = FICTITIOUS_NAMES[Math.floor(Math.random() * FICTITIOUS_NAMES.length)];
  const channel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
  const subjectObj = SIMULATED_SUBJECTS[Math.floor(Math.random() * SIMULATED_SUBJECTS.length)];
  
  const { priority, stressLevel, detectedKeywords } = realizarTriagem(subjectObj.text);

  const initialMessage = {
    id: randomUUID(),
    sender: 'client',
    text: subjectObj.text,
    timestamp: new Date().toISOString()
  };

  const newTicket = {
    id,
    customerName,
    channel,
    subject: subjectObj.text,
    priority,
    status: 'open',
    stressLevel,
    messages: [initialMessage],
    createdAt: new Date().toISOString()
  };

  // Salva no estado em memória
  ticketsMap.set(id, newTicket);

  console.log(`\n📥 [Novo Ticket] De: ${customerName} | Canal: ${channel} | Prioridade: ${priority.toUpperCase()} | Estresse: ${stressLevel}`);
  if (detectedKeywords.length > 0) {
    console.log(`⚠️ [Triagem] Alerta! Palavras-chave de estresse detectadas: ${detectedKeywords.join(', ')}`);
  }

  // Transmite para todos os clientes conectados
  broadcast({
    type: 'TICKET_UPDATE',
    data: newTicket,
    triageLog: {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      customerName,
      subject: subjectObj.text,
      detectedKeywords,
      priority,
      stressLevel
    }
  });
}

// Inicializa a simulação automática: roda a cada 10 segundos
setInterval(simularNovoTicket, 10000);

// Gera dois tickets iniciais para que a aplicação não inicie vazia
simularNovoTicket();
setTimeout(simularNovoTicket, 3000);

// Eventos de Conexão do Servidor WebSocket
wss.on('connection', (ws) => {
  console.log('🔌 Novo operador de suporte conectado via WebSocket.');

  // Ao conectar, envia todos os tickets existentes para sincronizar o front-end
  const currentTickets = Array.from(ticketsMap.values());
  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    data: currentTickets
  }));

  // Escuta as mensagens enviadas pelos clientes (React)
  ws.on('message', (messageRaw) => {
    try {
      const message = JSON.parse(messageRaw);
      console.log(`📩 Mensagem recebida do cliente: type=${message.type}`);

      if (message.type === 'AGENT_REPLY') {
        const { ticketId, text } = message.data;

        if (!ticketId || !text) {
          console.warn('⚠️ Payload inválido para AGENT_REPLY');
          return;
        }

        // Recupera o ticket correspondente
        const ticket = ticketsMap.get(ticketId);

        if (ticket) {
          // Cria a mensagem do agente
          const newAgentMessage = {
            id: randomUUID(),
            sender: 'agent',
            text: text,
            timestamp: new Date().toISOString()
          };

          // Adiciona a mensagem e atualiza o status se estiver aberto
          ticket.messages.push(newAgentMessage);
          
          if (ticket.status === 'open') {
            ticket.status = 'in_progress';
          }

          // Se o agente respondeu, podemos baixar levemente o nível de estresse se for alto (ex: acalmar o cliente)
          if (ticket.stressLevel > 1) {
            ticket.stressLevel = Math.max(1, ticket.stressLevel - 1);
          }

          // Atualiza no banco em memória
          ticketsMap.set(ticketId, ticket);

          console.log(`✍️ [Resposta Agente] Enviada para ticket ${ticketId}. Novo Status: ${ticket.status}`);

          // Retransmite o ticket atualizado para todos os clientes conectados (inclusive quem enviou)
          broadcast({
            type: 'TICKET_UPDATE',
            data: ticket
          });
        } else {
          console.error(`❌ Ticket com ID ${ticketId} não encontrado.`);
        }
      }
    } catch (err) {
      console.error('❌ Erro ao decodificar mensagem recebida do WebSocket:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Conexão encerrada por um operador de suporte.');
  });
});
