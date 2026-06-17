import React, { useRef, useEffect } from 'react';
import type { Message } from '../../../core/entities/ticket';

interface ChatFeedProps {
  messages: Message[];
  currentUserName: string;
  currentUserRole: 'client' | 'agent';
  customerName?: string; // Used to label client in operator view
}

const getOperatorColorClass = (name: string) => {
  const colors = [
    'text-amber-400',
    'text-emerald-400',
    'text-pink-400',
    'text-cyan-400',
    'text-violet-400',
    'text-rose-400',
    'text-teal-400',
    'text-sky-400'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

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
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((msg) => {
        const isSystem = msg.sender === 'system' || msg.senderName === 'Sistema';

        if (isSystem) {
          return (
            <div key={msg.id} className="flex justify-center my-2">
              <div className="text-[10px] text-slate-650 dark:text-slate-500 bg-slate-100 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-900/50 px-3.5 py-1.5 rounded-full max-w-[85%] text-center">
                ⚙️ {msg.text}
              </div>
            </div>
          );
        }

        // Determine if message is from the logged-in user
        const isMe = currentUserRole === 'client' 
          ? msg.sender === 'client'
          : msg.sender === 'agent' && msg.senderName === currentUserName;

        const isOtherAgent = currentUserRole === 'agent' && msg.sender === 'agent' && msg.senderName !== currentUserName;

        // Label for sender
        let senderLabel: string;
        if (currentUserRole === 'client') {
          senderLabel = isMe ? 'Você (Cliente)' : (msg.senderName || 'Atendente');
        } else {
          senderLabel = isMe 
            ? 'Você (Atendente)'
            : isOtherAgent
              ? `${msg.senderName || 'Atendente'} (Atendente)`
              : `${msg.senderName || customerName || 'Cliente'} (Cliente)`;
        }

        return (
          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm relative ${isMe
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-none'
              }`}>
              <div className={`text-[9px] font-bold uppercase mb-1 ${isMe 
                ? 'text-indigo-200' 
                : getOperatorColorClass(msg.senderName || 'Atendente')
              }`}>
                {senderLabel}
              </div>
              <p className="leading-relaxed break-words text-xs font-normal">{msg.text}</p>
              <span className="block text-[8px] text-right font-mono opacity-50 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={chatEndRef} />
    </div>
  );
};
