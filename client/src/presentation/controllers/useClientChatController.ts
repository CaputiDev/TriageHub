import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTicketStore } from '../../store/useTicketStore';
import { ticketRepository } from '../../data/repositories/ticketRepository';

export function useClientChatController() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  const currentUser = useTicketStore((state) => state.currentUser);
  const tickets = useTicketStore((state) => state.tickets);
  const isConnected = useTicketStore((state) => state.isConnected);

  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  const ticket = tickets.find((t) => t.id === ticketId);

  const handleSend = (text: string) => {
    if (!ticket) return;
    ticketRepository.sendMessage(ticket.id, 'client', text);
  };

  const handleLeave = () => {
    navigate('/client/dashboard');
  };

  return {
    ticketId,
    currentUser,
    isConnected,
    mobileInfoOpen,
    setMobileInfoOpen,
    ticket,
    handleSend,
    handleLeave
  };
}
