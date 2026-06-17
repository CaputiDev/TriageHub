import React from 'react';
import { Search } from 'lucide-react';

interface ChatsFilterProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: 'all' | 'open' | 'in_progress' | 'resolved';
  setStatusFilter: (val: 'all' | 'open' | 'in_progress' | 'resolved') => void;
  channelFilter: 'all' | 'WhatsApp' | 'Webchat';
  setChannelFilter: (val: 'all' | 'WhatsApp' | 'Webchat') => void;
}

export const ChatsFilter: React.FC<ChatsFilterProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  channelFilter,
  setChannelFilter
}) => {
  return (
    <div className="space-y-3 shrink-0">
      <div className="relative">
        <input
          type="text"
          placeholder="Filtrar por nome/assunto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-2 py-1.5 text-xs bg-bg-panel border border-border-subtle rounded focus:outline-none focus:border-secondary text-text-main transition-colors"
        />
        <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2" />
      </div>

      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setStatusFilter(e.target.value as 'all' | 'open' | 'in_progress' | 'resolved')
          }
          className="flex-1 bg-bg-panel border border-border-subtle text-text-main text-[10px] rounded p-1.5 focus:outline-none transition-colors"
        >
          <option value="all">Status: Todos</option>
          <option value="open">Abertos</option>
          <option value="in_progress">Em Progresso</option>
          <option value="resolved">Resolvidos</option>
        </select>

        <select
          value={channelFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setChannelFilter(e.target.value as 'all' | 'WhatsApp' | 'Webchat')
          }
          className="flex-1 bg-bg-panel border border-border-subtle text-text-main text-[10px] rounded p-1.5 focus:outline-none transition-colors"
        >
          <option value="all">Canal: Todos</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Webchat">Webchat</option>
        </select>
      </div>
    </div>
  );
};
