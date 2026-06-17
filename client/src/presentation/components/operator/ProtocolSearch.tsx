import React from 'react';
import { Search } from 'lucide-react';

interface ProtocolSearchProps {
  protocolId: string;
  setProtocolId: (val: string) => void;
  isSearching: boolean;
  protocolError: string | null;
  handleProtocolSearch: (e: React.FormEvent) => void;
}

export const ProtocolSearch: React.FC<ProtocolSearchProps> = ({
  protocolId,
  setProtocolId,
  isSearching,
  protocolError,
  handleProtocolSearch
}) => {
  return (
    <div className="p-4 border-b border-border-subtle">
      <form onSubmit={handleProtocolSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Acessar protocolo..."
            value={protocolId}
            onChange={(e) => setProtocolId(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 text-xs bg-bg-panel border border-border-subtle rounded focus:outline-none focus:border-secondary text-text-main transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2" />
        </div>
        <button
          type="submit"
          disabled={isSearching || !protocolId.trim()}
          className="px-3 bg-secondary hover:opacity-90 disabled:opacity-50 text-white text-xs font-semibold rounded cursor-pointer transition-colors border border-secondary"
        >
          {isSearching ? '...' : 'Ir'}
        </button>
      </form>
      {protocolError && (
        <p className="text-[10px] text-red-500 font-semibold mt-1.5 leading-tight">{protocolError}</p>
      )}
    </div>
  );
};
