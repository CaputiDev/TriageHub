import { useNavigate, useParams } from 'react-router-dom';
import { useTicketStore } from '../../store/useTicketStore';
import { ticketRepository } from '../../data/repositories/ticketRepository';

export function useOperatorChatController() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  const currentUser = useTicketStore((state) => state.currentUser);
  const tickets = useTicketStore((state) => state.tickets);
  const isConnected = useTicketStore((state) => state.isConnected);

  const ticket = tickets.find((t) => t.id === ticketId);

  const handleSend = (text: string) => {
    if (!ticket) return;
    ticketRepository.sendMessage(ticket.id, 'agent', text);
  };

  const handleResolve = () => {
    if (!ticket) return;
    ticketRepository.resolveTicket(ticket.id);
  };

  const handleLeave = () => {
    navigate('/operator/dashboard');
  };

  return {
    ticketId,
    currentUser,
    isConnected,
    ticket,
    handleSend,
    handleResolve,
    handleLeave
  };
}
