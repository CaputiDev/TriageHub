export class WSController {
  constructor({
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
  }) {
    this.authenticateUser = authenticateUser;
    this.identifyUser = identifyUser;
    this.assignOrphanTickets = assignOrphanTickets;
    this.createTicket = createTicket;
    this.sendMessage = sendMessage;
    this.resolveTicket = resolveTicket;
    this.getTicket = getTicket;
    this.getFullTickets = getFullTickets;
    this.acceptTicket = acceptTicket;
    this.rejectTicket = rejectTicket;
    this.disconnectAgent = disconnectAgent;
  }

  async handleMessage(ws, messageRaw) {
    try {
      const message = JSON.parse(messageRaw);
      console.log(`📩 Evento recebido: ${message.type}`);

      switch (message.type) {
        case 'AUTH': {
          try {
            const { user, extraDetails, isSignUp } = await this.authenticateUser.execute(message.data);
            ws.user = user;

            ws.send(JSON.stringify({
              type: 'AUTH_SUCCESS',
              data: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                ...extraDetails
              }
            }));

            if (user.role === 'agent') {
              await this.assignOrphanTickets.execute({ agentId: user.id, agentName: user.name });
            }

            const currentTickets = await this.getFullTickets.execute({ user: ws.user });
            ws.send(JSON.stringify({
              type: 'INITIAL_STATE',
              data: currentTickets
            }));
          } catch (err) {
            console.error('❌ Erro na autenticação:', err.message);
            ws.send(JSON.stringify({
              type: 'AUTH_ERROR',
              error: err.message
            }));
          }
          break;
        }

        case 'IDENTIFY': {
          try {
            const user = await this.identifyUser.execute(message.data);
            ws.user = user;
            console.log(`👤 Usuário re-identificado na conexão: ${user.name} | Cargo: ${user.role.toUpperCase()}`);

            if (user.role === 'agent') {
              await this.assignOrphanTickets.execute({ agentId: user.id, agentName: user.name });
            }

            const agentTickets = await this.getFullTickets.execute({ user: ws.user });
            ws.send(JSON.stringify({ type: 'INITIAL_STATE', data: agentTickets }));
          } catch (err) {
            console.error('❌ Erro ao identificar conexão:', err.message);
          }
          break;
        }

        case 'CREATE_TICKET': {
          if (!ws.user) {
            ws.send(JSON.stringify({ type: 'TICKET_ERROR', error: 'Sessão não autenticada. Faça login novamente.' }));
            return;
          }
          try {
            const newTicket = await this.createTicket.execute({
              customerId: ws.user.id,
              customerName: ws.user.name,
              ...message.data
            });
            ws.send(JSON.stringify({ type: 'TICKET_CREATED', data: newTicket }));
          } catch (err) {
            console.error('❌ Erro ao criar ticket:', err.message);
            ws.send(JSON.stringify({ type: 'TICKET_ERROR', error: err.message }));
          }
          break;
        }

        case 'SEND_MESSAGE': {
          if (!ws.user) {
            console.warn('⚠️ Conexão WebSocket não autenticada');
            return;
          }
          try {
            await this.sendMessage.execute({
              ...message.data,
              senderId: ws.user.id,
              senderName: ws.user.name
            });
          } catch (err) {
            console.error('❌ Erro ao enviar mensagem:', err.message);
          }
          break;
        }

        case 'RESOLVE_TICKET': {
          if (!ws.user) {
            console.warn('⚠️ Conexão WebSocket não autenticada');
            return;
          }
          try {
            await this.resolveTicket.execute({
              ticketId: message.data.ticketId,
              operatorName: ws.user.name
            });
          } catch (err) {
            console.error('❌ Erro ao resolver ticket:', err.message);
          }
          break;
        }

        case 'GET_TICKET': {
          const { ticketId } = message.data;
          if (!ws.user) {
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              ticketId,
              error: 'Sessão não autenticada no servidor.'
            }));
            return;
          }
          try {
            const ticket = await this.getTicket.execute({ ticketId });
            if (ticket) {
              ws.send(JSON.stringify({
                type: 'TICKET_UPDATE',
                data: ticket
              }));
              console.log(`📤 Ticket ${ticket.id} (Protocolo: ${ticketId}) enviado com sucesso para ${ws.user.name}`);
            } else {
              ws.send(JSON.stringify({
                type: 'TICKET_ERROR',
                ticketId,
                error: 'Protocolo de ticket não encontrado no banco de dados.'
              }));
            }
          } catch (err) {
            console.error('❌ Erro ao obter ticket:', err.message);
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              ticketId,
              error: err.message
            }));
          }
          break;
        }

        case 'ACCEPT_TICKET': {
          const { ticketId } = message.data;
          if (!ws.user) {
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              ticketId,
              error: 'Sessão não autenticada no servidor.'
            }));
            return;
          }
          try {
            await this.acceptTicket.execute({
              ticketId,
              agentId: ws.user.id,
              agentName: ws.user.name
            });
          } catch (err) {
            console.error('❌ Erro ao aceitar ticket:', err.message);
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              ticketId,
              error: err.message
            }));
          }
          break;
        }

        case 'REJECT_TICKET': {
          const { ticketId } = message.data;
          if (!ws.user) {
            ws.send(JSON.stringify({
              type: 'TICKET_ERROR',
              ticketId,
              error: 'Sessão não autenticada no servidor.'
            }));
            return;
          }
          try {
            await this.rejectTicket.execute({
              ticketId,
              agentId: ws.user.id,
              agentName: ws.user.name
            });
          } catch (err) {
            console.error('❌ Erro ao recusar ticket:', err.message);
            if (err.code === 'REJECT_FAILED') {
              ws.send(JSON.stringify({
                type: 'REJECT_FAILED',
                ticketId,
                error: err.message
              }));
            } else {
              ws.send(JSON.stringify({
                type: 'TICKET_ERROR',
                ticketId,
                error: err.message
              }));
            }
          }
          break;
        }

        default:
          console.warn(`⚠️ Evento WebSocket não reconhecido: ${message.type}`);
      }
    } catch (err) {
      console.error('❌ Erro no processamento de mensagem WebSocket:', err);
    }
  }

  async handleClose(ws) {
    console.log('🔌 Conexão WebSocket encerrada.');
    if (ws.user && ws.user.role === 'agent') {
      try {
        await this.disconnectAgent.execute({
          agentId: ws.user.id,
          agentName: ws.user.name
        });
      } catch (err) {
        console.error('❌ Erro no desligamento da conexão do atendente:', err.message);
      }
    }
  }
}
