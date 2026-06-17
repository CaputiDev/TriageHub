import React, { useState } from 'react';
import { Send, CheckCircle, AlertTriangle } from 'lucide-react';
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
      <div className="p-4 border-t border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-955/30">
        <div className="text-center p-3.5 bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {currentUserRole === 'client' 
            ? 'Este ticket foi resolvido e finalizado pelo especialista.'
            : 'Este ticket de suporte já foi resolvido e finalizado.'}
        </div>
      </div>
    );
  }

  // 2. Status Pendente de Aceite pelo Operador
  if (status === 'pending_acceptance') {
    if (currentUserRole === 'client') {
      return (
        <div className="p-4 border-t border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-955/30 space-y-2">
          <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl text-xs flex items-center justify-center gap-2 animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Aguardando confirmação de um especialista... Você já pode enviar mensagens.
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Escreva sua mensagem enquanto aguarda..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      );
    } else {
      // Para o operador
      return (
        <div className="p-4 border-t border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-955/30">
          <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl text-xs flex items-center justify-center gap-2 animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Este chamado está aguardando confirmação de aceite pelo atendente.
          </div>
        </div>
      );
    }
  }

  // 3. Status Ativo / Em Atendimento
  const placeholder = currentUserRole === 'client'
    ? `Mensagem para ${operatorName || 'Atendente'}...`
    : `Responder a ${customerName}...`;

  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-955/30">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-655 focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md hover:shadow-indigo-950"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
