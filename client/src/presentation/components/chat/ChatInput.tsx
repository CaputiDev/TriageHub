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
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 italic">
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
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="text-center text-[10px] text-zinc-400 dark:text-zinc-550 italic">
            Aguardando confirmação de um especialista... Você já pode enviar mensagens.
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Escreva sua mensagem..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer flex items-center justify-center bg-transparent"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      );
    } else {
      return (
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-550 italic animate-pulse">
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
    <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/30">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer flex items-center justify-center bg-transparent"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
