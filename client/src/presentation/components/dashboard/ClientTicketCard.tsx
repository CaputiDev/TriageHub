import React from 'react';
import type { Ticket } from '../../../core/entities/ticket';

interface ClientTicketCardProps {
  ticket: Ticket;
  onEnterChat: (ticketId: string) => void;
}

export const ClientTicketCard: React.FC<ClientTicketCardProps> = ({ ticket, onEnterChat }) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em atendimento';
      case 'pending_acceptance': return 'Triando especialista';
      case 'resolved': return 'Resolvido';
      default: return 'Desconhecido';
    }
  };

  const isResolved = ticket.status === 'resolved';

  return (
    <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col justify-between gap-3 transition-colors">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
          <span className="font-mono font-medium">
            Protocolo #{ticket.id.slice(0, 8).toUpperCase()}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {getStatusLabel(ticket.status)}
            </span>
            <span>•</span>
            <span>{ticket.channel}</span>
          </div>
        </div>

        <div>
          <h4 className={`text-xs font-bold ${isResolved ? 'text-zinc-400 dark:text-zinc-550' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {ticket.subject}
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
            {ticket.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-2 shrink-0 text-[10px]">
        <div className="text-zinc-500">
          {isResolved ? (
            <span>Concluído por: {ticket.operatorName}</span>
          ) : ticket.operatorId ? (
            <span>Responsável: {ticket.operatorName}</span>
          ) : (
            <span className="text-zinc-400 italic">Fila de espera...</span>
          )}
        </div>
        <button
          onClick={() => onEnterChat(ticket.id)}
          className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded text-[10px] font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-zinc-800 dark:text-zinc-200 bg-transparent"
        >
          {isResolved ? 'Ver chamado' : 'Abrir chat'}
        </button>
      </div>
    </div>
  );
};
