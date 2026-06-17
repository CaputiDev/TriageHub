import { WebSocketServer } from 'ws';

export class WSServer {
  constructor(port, wsController) {
    this.port = port;
    this.wsController = wsController;
    this.wss = null;
  }

  start() {
    this.wss = new WebSocketServer({ port: this.port });
    console.log(`🚀 Servidor Proxy WebSocket rodando na porta ${this.port}`);

    this.wss.on('connection', (ws) => {
      console.log('🔌 Nova conexão WebSocket estabelecida.');

      ws.on('message', async (messageRaw) => {
        await this.wsController.handleMessage(ws, messageRaw);
      });

      ws.on('close', async () => {
        await this.wsController.handleClose(ws);
      });
    });

    return this.wss;
  }

  getWss() {
    return this.wss;
  }
}
