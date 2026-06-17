import React, { useState } from 'react';
import type { Ticket } from '../../../core/entities/ticket';
import type { UserState } from '../../../core/entities/user';
import { ChatFeed } from '../chat/ChatFeed';
import { ChatInput } from '../chat/ChatInput';
import { ChatSystemLog } from '../chat/ChatSystemLog';
import { getPriorityBadge } from './helpers';
import { TicketDetailSummary } from '../dashboard/TicketDetailSummary';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '../common/Button';

interface ActiveChatViewerProps {
  ticket: Ticket;
  currentUser: UserState;
  onResolve: (id: string) => void;
  onSendChat: (text: string) => void;
}

export const ActiveChatViewer: React.FC<ActiveChatViewerProps> = ({
  ticket,
  currentUser,
  onResolve,
  onSendChat
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border-subtle flex justify-between items-center shrink-0">
        <div>
          <h3 className="font-bold text-sm text-text-main flex items-center gap-2">
            {ticket.customerName}
            <span className="text-[10px] text-text-muted font-mono font-normal">
              #{ticket.id.slice(0, 8).toUpperCase()}
            </span>
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {getPriorityBadge(ticket.priority)}
            <span className="text-[10px] text-text-muted font-mono uppercase">
              {ticket.channel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ChatSystemLog logs={ticket.logs ?? []} />
          <button
            onClick={() => setIsDetailsOpen(true)}
            className="p-1.5 rounded border border-secondary bg-bg-panel text-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Ver detalhes"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {ticket.status !== 'resolved' && (
            <button
              onClick={() => onResolve(ticket.id)}
              className="px-3 py-1.5 bg-secondary hover:opacity-90 text-white rounded text-xs font-medium cursor-pointer transition-colors border border-secondary"
            >
              Resolver
            </button>
          )}
        </div>
      </div>

      <ChatFeed
        messages={ticket.messages}
        currentUserName={currentUser.name}
        currentUserRole="agent"
        customerName={ticket.customerName}
      />

      <ChatInput
        status={ticket.status}
        operatorName={ticket.operatorName}
        customerName={ticket.customerName}
        currentUserRole="agent"
        onSend={onSendChat}
      />

      {/* Modal de Detalhes do Chamado */}
      {isDetailsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
          onClick={() => setIsDetailsOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-bg-panel border border-border-subtle rounded p-6 space-y-4 shadow-xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">Detalhes do Chamado</h3>
              <Button onClick={() => setIsDetailsOpen(false)} variant="text" size="sm" className="font-bold">
                Fechar
              </Button>
            </div>
            <TicketDetailSummary ticket={ticket} showPriority showCustomer showStatus />
          </div>
        </div>
      )}
    </div>
  );
};
