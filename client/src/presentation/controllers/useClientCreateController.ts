import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketStore } from '../../store/useTicketStore';
import { ticketRepository } from '../../data/repositories/ticketRepository';

const STRESS_KEYWORDS = ['procon', 'cancelar', 'urgente', 'ruim', 'advogado'];

export function useClientCreateController() {
  const navigate = useNavigate();
  const currentUser = useTicketStore((state) => state.currentUser);
  const isConnected = useTicketStore((state) => state.isConnected);

  const [category, setCategory] = useState('Dúvidas & Configurações');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState<'WhatsApp' | 'Webchat'>('WhatsApp');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const hasStressKeyword = STRESS_KEYWORDS.some((word) =>
    description.toLowerCase().includes(word)
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!subject.trim()) {
      setError('Por favor, informe o título resumido do seu problema.');
      return;
    }
    if (!description.trim()) {
      setError('Por favor, digite a descrição detalhada do seu problema para a nossa triagem.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const newTicket = await ticketRepository.createTicket(
        currentUser.name,
        currentUser.email,
        channel,
        category,
        subject.trim(),
        description.trim()
      );

      setSubmitting(false);
      navigate(`/client/chat/${newTicket.id}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Falha ao salvar ticket. Tente novamente.';
      setError(errorMsg);
      setSubmitting(false);
    }
  };

  return {
    currentUser,
    category,
    setCategory,
    subject,
    setSubject,
    description,
    setDescription,
    channel,
    setChannel,
    submitting,
    error,
    setError,
    isConnected,
    hasStressKeyword,
    handleFormSubmit,
    navigateBack: () => navigate('/client/dashboard')
  };
}
