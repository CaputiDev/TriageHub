import React, { useRef, useEffect } from 'react';
import type { Message } from '../../../core/entities/ticket';

interface ChatFeedProps {
  messages: Message[];
  currentUserName: string;
  currentUserRole: 'client' | 'agent';
  customerName?: string;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  messages,
  currentUserName,
  currentUserRole,
  customerName
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => {
        const isSystem = msg.sender === 'system' || msg.senderName === 'Sistema';

        if (isSystem) {
          return (
            <div key={msg.id} className="flex justify-center my-1">
              <span className="text-[10px] text-text-muted font-mono tracking-tight">
                {msg.text}
              </span>
            </div>
          );
        }

        const isMe = currentUserRole === 'client' 
          ? msg.sender === 'client'
          : msg.sender === 'agent' && msg.senderName === currentUserName;

        const isOtherAgent = currentUserRole === 'agent' && msg.sender === 'agent' && msg.senderName !== currentUserName;

        let senderLabel: string;
        if (currentUserRole === 'client') {
          senderLabel = isMe ? 'Você' : (msg.senderName || 'Atendente');
        } else {
          senderLabel = isMe 
            ? 'Você'
            : isOtherAgent
              ? `${msg.senderName || 'Atendente'}`
              : `${msg.senderName || customerName || 'Cliente'}`;
        }

        return (
          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className="flex flex-col gap-0.5 max-w-[75%]">
              {/* Sender name above bubble */}
              <span className={`text-[9px] text-text-muted font-medium ${isMe ? 'text-right' : 'text-left'}`}>
                {senderLabel}
              </span>
              
              <div className={`px-3 py-2 rounded text-xs shadow-none border ${
                isMe
                  ? 'bg-secondary text-white border-secondary'
                  : 'bg-tertiary text-primary border-tertiary'
              }`}>
                <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                
                <span className={`block text-[8px] opacity-60 mt-1 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={chatEndRef} />
    </div>
  );
};
