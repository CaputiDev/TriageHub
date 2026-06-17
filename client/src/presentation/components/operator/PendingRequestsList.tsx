import React from 'react';
import type { Ticket } from '../../../core/entities/ticket';
import { Lock } from 'lucide-react';
import { getPriorityBadge } from './helpers';

interface PendingRequestsListProps {
  pendingRequests: Ticket[];
  activeRequestId: string | null;
  setActiveRequestId: (id: string | null) => void;
  setActiveChatId: (id: string | null) => void;
}

export const PendingRequestsList: React.FC<PendingRequestsListProps> = ({
  pendingRequests,
  activeRequestId,
  setActiveRequestId,
  setActiveChatId
}) => {
  return (
    <div className="p-4 border-b border-border-subtle bg-bg-panel/20 transition-colors">
      <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" /> Solicitações
        </span>
        {pendingRequests.length > 0 && (
          <span className="text-[10px] text-amber-500 font-mono">
            [{pendingRequests.length} pendente]
          </span>
        )}
      </h3>

      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
        {pendingRequests.length === 0 ? (
          <p className="text-text-muted text-xs italic py-2 text-center">Nenhuma solicitação aguardando.</p>
        ) : (
          pendingRequests.map((req) => {
            const isSelected = activeRequestId === req.id;
            return (
              <button
                key={req.id}
                onClick={() => {
                  setActiveRequestId(req.id);
                  setActiveChatId(null);
                }}
                className={`w-full text-left p-3 rounded border transition-colors cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-bg-base border-secondary'
                    : 'bg-bg-panel border-border-subtle hover:bg-bg-base/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-text-main">
                    {req.customerName}
                  </span>
                  {getPriorityBadge(req.priority)}
                </div>
                <p className="text-[11px] text-text-muted font-normal line-clamp-1">"{req.subject}"</p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
