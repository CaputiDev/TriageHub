import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore } from '../../store/useTicketStore';
import { ticketRepository } from '../../data/repositories/ticketRepository';

export function useOperatorDashboardController() {
  const navigate = useNavigate();

  const currentUser = useTicketStore((state) => state.currentUser);
  const tickets = useTicketStore((state) => state.tickets);
  const triageLogs = useTicketStore((state) => state.triageLogs);
  const logout = useTicketStore((state) => state.logout);
  const isConnected = useTicketStore((state) => state.isConnected);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'WhatsApp' | 'Webchat'>('all');

  // Search by protocol ID
  const [protocolId, setProtocolId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [protocolError, setProtocolError] = useState('');

  // Integrated workspace state
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Computed metrics
  const metrics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'open').length;
    const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
    const resolved = tickets.filter((t) => t.status === 'resolved').length;

    const active = tickets.filter((t) => t.status !== 'resolved');
    const avgStress = active.length > 0
      ? (active.reduce((acc, t) => acc + t.stressLevel, 0) / active.length).toFixed(1)
      : '0.0';

    const criticalCount = tickets.filter((t) => t.priority === 'critical' && t.status !== 'resolved').length;

    return { total, open, inProgress, resolved, avgStress, criticalCount };
  }, [tickets]);

  // Pending ticket requests for current operator
  const pendingRequests = useMemo(() => {
    if (!currentUser) return [];
    return tickets.filter((t) => t.status === 'pending_acceptance' && t.operatorId === currentUser.id);
  }, [tickets, currentUser]);

  // Active chats assigned to this operator
  const activeChats = useMemo(() => {
    if (!currentUser) return [];
    return tickets.filter((t) => t.status !== 'pending_acceptance' && t.operatorId === currentUser.id);
  }, [tickets, currentUser]);

  // Filtered active chats for sidebar
  const filteredActiveChats = useMemo(() => {
    return activeChats.filter((ticket) => {
      const matchesSearch =
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.category && ticket.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesChannel = channelFilter === 'all' || ticket.channel === channelFilter;

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [activeChats, searchTerm, statusFilter, channelFilter]);

  const handleProtocolSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = protocolId.trim();

    const protocolRegex = /^[0-9a-fA-F]{8}$/;
    if (!protocolRegex.test(cleanId)) {
      setProtocolError('O ID do protocolo deve conter exatamente 8 caracteres hexadecimais (ex: 83D6F392).');
      return;
    }

    setIsSearching(true);
    setProtocolError('');

    try {
      const ticket = await ticketRepository.getTicket(cleanId);
      setIsSearching(false);
      setProtocolId('');
      setActiveChatId(ticket.id);
      setActiveRequestId(null);
    } catch (err) {
      setIsSearching(false);
      const errorMsg = err instanceof Error ? err.message : 'Erro ao buscar o protocolo informado.';
      setProtocolError(errorMsg);
    }
  };

  const handleAccept = async (ticketId: string) => {
    setIsAccepting(true);
    setRequestError('');
    try {
      await ticketRepository.acceptTicket(ticketId);
      setIsAccepting(false);
      setActiveRequestId(null);
      setActiveChatId(ticketId);
    } catch (err) {
      setIsAccepting(false);
      const errorMsg = err instanceof Error ? err.message : 'Erro ao aceitar o atendimento.';
      setRequestError(errorMsg);
    }
  };

  const handleReject = async (ticketId: string) => {
    setIsRejecting(true);
    setRequestError('');
    try {
      await ticketRepository.rejectTicket(ticketId);
      setIsRejecting(false);
      setActiveRequestId(null);
    } catch (err) {
      setIsRejecting(false);
      const errorMsg = err instanceof Error ? err.message : 'Erro ao recusar o atendimento.';
      setRequestError(errorMsg);
    }
  };

  const handleSendChat = (text: string) => {
    if (!activeChatId) return;
    ticketRepository.sendMessage(activeChatId, 'agent', text);
  };

  const handleResolve = (ticketId: string) => {
    ticketRepository.resolveTicket(ticketId);
  };

  const handleLeave = () => {
    logout();
    navigate('/');
  };

  const selectedChatTicket = activeChatId ? tickets.find((t) => t.id === activeChatId) : null;
  const selectedRequestTicket = activeRequestId ? tickets.find((t) => t.id === activeRequestId) : null;

  return {
    currentUser,
    tickets,
    triageLogs,
    isConnected,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    channelFilter,
    setChannelFilter,
    protocolId,
    setProtocolId,
    isSearching,
    protocolError,
    activeChatId,
    setActiveChatId,
    activeRequestId,
    setActiveRequestId,
    isDrawerOpen,
    setIsDrawerOpen,
    requestError,
    setRequestError,
    isAccepting,
    isRejecting,
    metrics,
    pendingRequests,
    activeChats,
    filteredActiveChats,
    selectedChatTicket,
    selectedRequestTicket,
    handleProtocolSearch,
    handleAccept,
    handleReject,
    handleSendChat,
    handleResolve,
    handleLeave,
    handleReconnect: () => ticketRepository.connect()
  };
}
