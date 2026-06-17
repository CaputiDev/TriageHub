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
    if (ticket.status === 'resolved') return 'text-text-muted';
    switch (priority) {
      case 'critical': return 'text-red-500 font-bold';
      case 'high': return 'text-amber-500 font-semibold';
      case 'medium': return 'text-text-main';
      default: return 'text-text-muted';
    }
  };

  return (
    <button
      onClick={() => onSelect(ticket.id)}
      className={`w-full text-left p-3 border rounded transition-colors cursor-pointer flex flex-col gap-1 ${
        isSelected
          ? 'bg-bg-base border-secondary'
          : 'bg-bg-panel border-border-subtle hover:border-secondary'
      }`}
    >
      <div className="flex items-center justify-between text-[10px] text-text-muted">
        <span className="font-mono">
          #{ticket.id.slice(0, 8).toUpperCase()}
        </span>
        <span>
          {lastTime || new Date(ticket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="font-bold text-xs text-text-main truncate flex-1">
          {ticket.customerName}
        </span>
        <span className={`text-[9px] font-mono uppercase shrink-0 ${getPriorityColorClass(ticket.priority)}`}>
          {getPriorityText(ticket.priority)}
        </span>
      </div>

      <p className="text-[11px] text-text-muted line-clamp-1 italic">
        "{lastText}"
      </p>

      <div className="flex items-center justify-between text-[9px] text-text-muted border-t border-border-subtle pt-1 mt-0.5">
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
