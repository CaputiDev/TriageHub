import React from 'react';
import type { Ticket } from '../../../core/entities/ticket';

interface ClientTicketCardProps {
  ticket: Ticket;
  onEnterChat: (ticketId: string) => void;
}

export const ClientTicketCard: React.FC<ClientTicketCardProps> = ({ ticket, onEnterChat }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
            Aberto
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-650 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            Em Atendimento
          </span>
        );
      case 'pending_acceptance':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 animate-pulse">
            Triando Especialista
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-650 text-emerald-650 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            Resolvido
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            Desconhecido
          </span>
        );
    }
  };

  const isResolved = ticket.status === 'resolved';

  return (
    <div
      className={`p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900/80 rounded-2xl flex flex-col justify-between gap-4 transition-all shadow-sm hover:shadow-md ${
        isResolved ? 'opacity-85 hover:opacity-100' : ''
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-bold">
            Protocolo: {ticket.id.slice(0, 8).toUpperCase()}
          </span>
          <div className="flex items-center gap-1.5">
            {getStatusBadge(ticket.status)}
            <span className="text-[9px] bg-slate-105 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/50">
              {ticket.channel}
            </span>
          </div>
        </div>

        <div>
          <h4 className={`font-bold text-xs line-clamp-1 ${isResolved ? 'text-slate-700 dark:text-slate-300' : 'text-slate-800 dark:text-slate-200'}`}>
            {ticket.subject}
          </h4>
          <p className="text-[11px] text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {ticket.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-900/50 pt-3 mt-1 shrink-0">
        <div className="text-[10px] text-slate-505 text-slate-500">
          {isResolved ? (
            <span>Finalizado por: <strong>{ticket.operatorName}</strong></span>
          ) : ticket.operatorId ? (
            <span>Especialista: <strong className="text-slate-700 dark:text-slate-300">{ticket.operatorName}</strong></span>
          ) : (
            <span className="italic text-indigo-555 text-indigo-500 font-semibold animate-pulse">Aguardando atendente...</span>
          )}
        </div>
        <button
          onClick={() => onEnterChat(ticket.id)}
          className={`px-4 py-2 border text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
            isResolved
              ? 'bg-slate-100 hover:bg-slate-250 border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              : 'bg-indigo-50 hover:bg-indigo-600 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/40 text-indigo-650 text-indigo-600 dark:text-indigo-400 hover:text-white dark:hover:text-white shadow-sm'
          }`}
        >
          {isResolved ? 'Ver Histórico' : 'Entrar no Chat'}
        </button>
      </div>
    </div>
  );
};
