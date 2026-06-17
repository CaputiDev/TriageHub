import React from 'react';
import type { Ticket } from '../../../core/entities/ticket';

interface OperatorTicketListItemProps {
  ticket: Ticket;
  isSelected: boolean;
  onSelect: (ticketId: string) => void;
}

export const OperatorTicketListItem: React.FC<OperatorTicketListItemProps> = ({
  ticket,
  isSelected,
  onSelect
}) => {
  // Extract last message snippet or fallback to subject
  const lastMsg = ticket.messages[ticket.messages.length - 1];
  const lastTextSnippet = lastMsg
    ? (lastMsg.sender === 'agent' ? 'Você: ' : '') + lastMsg.text
    : ticket.subject;
  const lastText = lastTextSnippet.length > 36 ? lastTextSnippet.slice(0, 36) + '...' : lastTextSnippet;
  const lastTime = lastMsg
    ? new Date(lastMsg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '';

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/80 text-red-650 text-red-650 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 animate-pulse-slow">
            Crítico
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-705 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
            Alto
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-650 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30">
            Médio
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-605 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
            Baixo
          </span>
        );
    }
  };

  return (
    <button
      onClick={() => onSelect(ticket.id)}
      className={`w-full text-left p-3.5 border rounded-xl flex flex-col gap-1.5 relative transition-all cursor-pointer ${
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-500/80 shadow-md shadow-indigo-100 dark:shadow-indigo-950/20'
          : 'bg-white/80 dark:bg-slate-900/20 border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800 hover:bg-white dark:hover:bg-slate-900/40'
      }`}
    >
      {/* Urgência Crítica */}
      {ticket.priority === 'critical' && ticket.status !== 'resolved' && (
        <div className="absolute left-0 top-3 bottom-3 w-1 bg-red-500 rounded-r-md animate-pulse"></div>
      )}

      <div className="flex items-center justify-between">
        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate pr-2 max-w-[180px]">
          {ticket.customerName}
        </span>
        <span className="text-[9px] text-slate-500 font-mono shrink-0">
          {lastTime || new Date(ticket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <p className="text-[11px] text-slate-605 text-slate-600 dark:text-slate-405 dark:text-slate-400 font-normal line-clamp-1 italic shrink-0">
        "{lastText}"
      </p>

      <div className="flex items-center justify-between gap-1 mt-1 shrink-0">
        <div className="flex items-center space-x-1.5">
          {getPriorityBadge(ticket.priority)}
          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 px-1.5 py-0.5 rounded font-medium">
            {ticket.channel}
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${
              ticket.status === 'in_progress'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
            }`}
          >
            {ticket.status === 'in_progress' ? 'Em Progresso' : 'Resolvido'}
          </span>
        </div>
        <span className="text-[9px] font-bold text-slate-505 text-slate-500">
          Estresse: {ticket.stressLevel}/5
        </span>
      </div>
    </button>
  );
};
