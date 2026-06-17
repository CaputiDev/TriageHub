import React, { useState } from 'react';
import { Send } from 'lucide-react';
import type { TicketStatus } from '../../../core/entities/ticket';

interface ChatInputProps {
  status: TicketStatus;
  operatorName: string;
  customerName: string;
  currentUserRole: 'client' | 'agent';
  onSend: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  status,
  operatorName,
  customerName,
  currentUserRole,
  onSend
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  // 1. Status Resolvido / Concluído
  if (status === 'resolved') {
    return (
      <div className="p-3 border-t border-border-subtle text-center">
        <span className="text-[11px] text-text-muted italic">
          {currentUserRole === 'client' 
            ? 'Este chamado foi resolvido e finalizado pelo especialista.'
            : 'Este atendimento foi encerrado.'}
        </span>
      </div>
    );
  }

  // 2. Status Pendente de Aceite
  if (status === 'pending_acceptance') {
    if (currentUserRole === 'client') {
      return (
        <div className="p-3 border-t border-border-subtle space-y-2">
          <div className="text-center text-[10px] text-text-muted italic">
            Aguardando confirmação de um especialista... Você já pode enviar mensagens.
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Escreva sua mensagem..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-bg-panel border border-border-subtle rounded focus:outline-none focus:border-secondary text-text-main transition-colors"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-4 py-2 bg-secondary hover:opacity-90 disabled:opacity-50 text-white rounded transition-colors cursor-pointer flex items-center justify-center border border-secondary"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      );
    } else {
      return (
        <div className="p-3 border-t border-border-subtle text-center">
          <span className="text-[11px] text-text-muted italic animate-pulse">
            Este chamado está aguardando confirmação de aceite pelo atendente.
          </span>
        </div>
      );
    }
  }

  // 3. Status Ativo / Em Atendimento
  const placeholder = currentUserRole === 'client'
    ? `Mensagem para ${operatorName || 'atendente'}...`
    : `Responder a ${customerName}...`;

  return (
    <div className="p-3 border-t border-border-subtle bg-bg-panel/50">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-3 py-2 text-xs bg-bg-panel border border-border-subtle rounded focus:outline-none focus:border-secondary text-text-main transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-4 py-2 bg-secondary hover:opacity-90 disabled:opacity-50 text-white rounded transition-colors cursor-pointer flex items-center justify-center border border-secondary"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
