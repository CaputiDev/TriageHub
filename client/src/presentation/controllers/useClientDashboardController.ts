import { useNavigate } from 'react-router-dom';
import { useTicketStore } from '../../store/useTicketStore';

export function useClientDashboardController() {
  const navigate = useNavigate();
  const currentUser = useTicketStore((state) => state.currentUser);
  const tickets = useTicketStore((state) => state.tickets);
  const logout = useTicketStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeTickets = tickets.filter((t) => t.status !== 'resolved');
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved');

  return {
    currentUser,
    activeTickets,
    resolvedTickets,
    handleLogout,
    navigateToCreate: () => navigate('/client/create'),
    navigateToChat: (ticketId: string) => navigate(`/client/chat/${ticketId}`)
  };
}
