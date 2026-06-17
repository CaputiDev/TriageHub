import React from 'react';
import type { Ticket } from '../../../core/entities/ticket';
import { Lock } from 'lucide-react';
import { getPriorityBadge } from './helpers';

interface RequestViewerProps {
  ticket: Ticket;
  requestError: string | null;
  isRejecting: boolean;
  isAccepting: boolean;
  onReject: (id: string) => void;
  onAccept: (id: string) => void;
}

export const RequestViewer: React.FC<RequestViewerProps> = ({
  ticket,
  requestError,
  isRejecting,
  isAccepting,
  onReject,
  onAccept
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-xl p-6 rounded border border-border-subtle bg-bg-panel">
        <h2 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-text-muted" /> Solicitação #{ticket.id.slice(0, 8).toUpperCase()}
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
          <div>
            <span className="text-text-muted block">Cliente</span> {ticket.customerName}
          </div>
          <div>
            <span className="text-text-muted block">Canal</span> {ticket.channel}
          </div>
          <div>
            <span className="text-text-muted block">Prioridade</span> {getPriorityBadge(ticket.priority)}
          </div>
          <div>
            <span className="text-text-muted block">Estresse</span> {ticket.stressLevel}/5
          </div>
        </div>
        <div className="mb-6">
          <span className="text-[10px] text-text-muted block">Assunto</span>
          <p className="text-xs font-bold text-text-main">{ticket.subject}</p>
          <p className="text-xs text-text-muted mt-2 p-3 bg-bg-base rounded">{ticket.description}</p>
        </div>
        {requestError && (
          <div className="mb-4 text-xs text-red-500 font-semibold">{requestError}</div>
        )}
        <div className="flex gap-4">
          <button
            onClick={() => onReject(ticket.id)}
            disabled={isRejecting || isAccepting}
            className="flex-1 py-2 text-xs border border-secondary bg-transparent hover:bg-secondary hover:text-white rounded font-semibold text-secondary disabled:opacity-50 cursor-pointer transition-colors"
          >
            {isRejecting ? 'Recusando...' : 'Recusar'}
          </button>
          <button
            onClick={() => onAccept(ticket.id)}
            disabled={isAccepting || isRejecting}
            className="flex-1 py-2 text-xs bg-secondary hover:opacity-90 text-white rounded font-semibold disabled:opacity-50 cursor-pointer transition-colors border border-secondary"
          >
            {isAccepting ? 'Aceitando...' : 'Aceitar'}
          </button>
        </div>
      </div>
    </div>
  );
};
