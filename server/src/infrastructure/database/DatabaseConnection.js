import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export class DatabaseConnection {
  constructor(dbPath = './support.db') {
    this.dbPath = dbPath;
    this.db = null;
  }

  async connect() {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    await this.verifyAndMigrateSchema();
    await this.createTables();
    await this.ensureSystemBot();

    return this.db;
  }

  async verifyAndMigrateSchema() {
    try {
      const tableInfo = await this.db.all("PRAGMA table_info(tickets)");
      if (tableInfo.length > 0) {
        const hasCustomerId = tableInfo.some(column => column.name === 'customerId');
        const hasDeclaredUrgency = tableInfo.some(column => column.name === 'declaredUrgency');
        if (!hasCustomerId || hasDeclaredUrgency) {
          console.log('⚠️ Esquema de banco de dados desatualizado detectado (ajustando colunas). Recriando tabelas relacionais...');
          await this.db.exec(`
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
  }

  async createTables() {
    await this.db.exec(`
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
  }

  async ensureSystemBot() {
    const systemBotUser = await this.db.get("SELECT 1 FROM users WHERE id = 'system_bot'");
    if (!systemBotUser) {
      await this.db.run(
        "INSERT INTO users (id, email, name, passwordHash, role) VALUES ('system_bot', 'bot@triagehub.local', 'Sistema', 'N/A', 'system')"
      );
    }
  }

  getDb() {
    return this.db;
  }
}
