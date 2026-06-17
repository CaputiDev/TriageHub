import React from 'react';
import type { Ticket } from '../../../core/entities/ticket';
import type { UserState } from '../../../core/entities/user';
import { ChatFeed } from '../chat/ChatFeed';
import { ChatInput } from '../chat/ChatInput';
import { ChatSystemLog } from '../chat/ChatSystemLog';
import { getPriorityBadge } from './helpers';

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
    </div>
  );
};
