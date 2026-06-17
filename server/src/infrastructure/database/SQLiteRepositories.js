export class SQLiteUserRepository {
  constructor(db) {
    this.db = db;
  }

  async findByEmail(email) {
    return await this.db.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  async findById(id) {
    return await this.db.get('SELECT * FROM users WHERE id = ?', [id]);
  }

  async create({ id, email, name, passwordHash, role }) {
    await this.db.run(
      'INSERT INTO users (id, email, name, passwordHash, role) VALUES (?, ?, ?, ?, ?)',
      [id, email, name, passwordHash, role]
    );
  }

  async createAgent({ userId, funcao, codigoIdentificacao }) {
    await this.db.run(
      'INSERT INTO agents (userId, funcao, codigoIdentificacao) VALUES (?, ?, ?)',
      [userId, funcao, codigoIdentificacao]
    );
  }

  async findAgentByUserId(userId) {
    return await this.db.get('SELECT * FROM agents WHERE userId = ?', [userId]);
  }

  async findAgentByCode(code) {
    return await this.db.get('SELECT 1 FROM agents WHERE codigoIdentificacao = ?', [code]);
  }

  async createAgentAccessLog({ id, userId, timestamp }) {
    await this.db.run(
      'INSERT INTO agent_access_logs (id, userId, timestamp) VALUES (?, ?, ?)',
      [id, userId, timestamp]
    );
  }

  async getAgentAccessLogs(userId) {
    return await this.db.all(
      'SELECT id FROM agent_access_logs WHERE userId = ? ORDER BY timestamp DESC',
      [userId]
    );
  }

  async deleteAgentAccessLog(id) {
    await this.db.run('DELETE FROM agent_access_logs WHERE id = ?', [id]);
  }
}

export class SQLiteTicketRepository {
  constructor(db) {
    this.db = db;
  }

  async create({ id, customerId, channel, category, subject, description, priority, status, stressLevel, operatorId, createdAt }) {
    await this.db.run(
      `INSERT INTO tickets (id, customerId, channel, category, subject, description, priority, status, stressLevel, operatorId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, customerId, channel, category, subject, description, priority, status, stressLevel, operatorId, createdAt]
    );
  }

  async getById(id) {
    const rows = await this.db.all(`
      SELECT t.*, u_c.name AS customerName, u_c.email AS customerEmail, u_o.name AS operatorName
      FROM tickets t
      JOIN users u_c ON t.customerId = u_c.id
      LEFT JOIN users u_o ON t.operatorId = u_o.id
      WHERE t.id = ?
    `, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async getByIdWithProtocol(protocol) {
    const ticketRow = await this.db.get(
      "SELECT id FROM tickets WHERE UPPER(SUBSTR(id, 1, 8)) = UPPER(?)",
      [protocol]
    );
    if (!ticketRow) return null;
    return await this.getById(ticketRow.id);
  }

  async getAll(user = null) {
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

    return await this.db.all(ticketsQuery, queryParams);
  }

  async updateStatusAndStressAndOperator(id, status, stressLevel, operatorId) {
    await this.db.run(
      'UPDATE tickets SET status = ?, stressLevel = ?, operatorId = ? WHERE id = ?',
      [status, stressLevel, operatorId, id]
    );
  }

  async updateStatusAndStress(id, status, stressLevel) {
    await this.db.run(
      'UPDATE tickets SET status = ?, stressLevel = ? WHERE id = ?',
      [status, stressLevel, id]
    );
  }

  async updateStatus(id, status) {
    await this.db.run(
      'UPDATE tickets SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  async getOrphanTickets() {
    return await this.db.all(
      "SELECT * FROM tickets WHERE status = 'open' AND operatorId IS NULL"
    );
  }

  async getActiveTicketsByOperator(operatorId) {
    return await this.db.all(
      "SELECT * FROM tickets WHERE status != 'resolved' AND operatorId = ?",
      [operatorId]
    );
  }

  async assignOperator(ticketId, operatorId, status) {
    await this.db.run(
      "UPDATE tickets SET operatorId = ?, status = ? WHERE id = ?",
      [operatorId, status, ticketId]
    );
  }
}

export class SQLiteMessageRepository {
  constructor(db) {
    this.db = db;
  }

  async create({ id, ticketId, senderId, text, timestamp }) {
    await this.db.run(
      `INSERT INTO messages (id, ticketId, senderId, text, timestamp) VALUES (?, ?, ?, ?, ?)`,
      [id, ticketId, senderId, text, timestamp]
    );
  }

  async getMessagesByTicketId(ticketId) {
    return await this.db.all(`
      SELECT m.id, m.ticketId, m.text, m.timestamp, u.role AS senderRole, u.name AS senderName
      FROM messages m
      JOIN users u ON m.senderId = u.id
      WHERE m.ticketId = ?
      ORDER BY m.timestamp ASC
    `, [ticketId]);
  }
}

export class SQLiteTicketLogRepository {
  constructor(db) {
    this.db = db;
  }

  async create({ id, ticketId, text, timestamp }) {
    await this.db.run(
      `INSERT INTO ticket_logs (id, ticketId, text, timestamp) VALUES (?, ?, ?, ?)`,
      [id, ticketId, text, timestamp]
    );
  }

  async getLogsByTicketId(ticketId) {
    return await this.db.all(`
      SELECT id, ticketId, text, timestamp FROM ticket_logs
      WHERE ticketId = ? ORDER BY timestamp ASC
    `, [ticketId]);
  }
}
