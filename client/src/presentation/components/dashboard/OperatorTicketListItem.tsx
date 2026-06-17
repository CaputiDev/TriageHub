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
  const lastMsg = ticket.messages[ticket.messages.length - 1];
  const lastTextSnippet = lastMsg
    ? (lastMsg.sender === 'agent' ? 'Você: ' : '') + lastMsg.text
    : ticket.subject;
  const lastText = lastTextSnippet.length > 36 ? lastTextSnippet.slice(0, 36) + '...' : lastTextSnippet;
  const lastTime = lastMsg
    ? new Date(lastMsg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '';

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return '[Crítico]';
      case 'high': return '[Alto]';
      case 'medium': return '[Médio]';
      default: return '[Baixo]';
    }
  };

  const getPriorityColorClass = (priority: string) => {
    if (ticket.status === 'resolved') return 'text-zinc-400 dark:text-zinc-550';
    switch (priority) {
      case 'critical': return 'text-red-500 font-bold';
      case 'high': return 'text-amber-500 font-semibold';
      case 'medium': return 'text-zinc-600 dark:text-zinc-300';
      default: return 'text-zinc-400 dark:text-zinc-500';
    }
  };

  return (
    <button
      onClick={() => onSelect(ticket.id)}
      className={`w-full text-left p-3 border rounded transition-colors cursor-pointer flex flex-col gap-1 ${
        isSelected
          ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700'
          : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
      }`}
    >
      <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
        <span className="font-mono">
          #{ticket.id.slice(0, 8).toUpperCase()}
        </span>
        <span>
          {lastTime || new Date(ticket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate flex-1">
          {ticket.customerName}
        </span>
        <span className={`text-[9px] font-mono uppercase shrink-0 ${getPriorityColorClass(ticket.priority)}`}>
          {getPriorityText(ticket.priority)}
        </span>
      </div>

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 italic">
        "{lastText}"
      </p>

      <div className="flex items-center justify-between text-[9px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-900/40 pt-1 mt-0.5">
        <div className="flex gap-2">
          <span>{ticket.channel}</span>
          <span>•</span>
          <span>{ticket.status === 'in_progress' ? 'Em atendimento' : 'Resolvido'}</span>
        </div>
        <span>Estresse: {ticket.stressLevel}/5</span>
      </div>
    </button>
  );
};
