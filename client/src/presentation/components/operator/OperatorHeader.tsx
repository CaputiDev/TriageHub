import React from 'react';
import type { UserState } from '../../../core/entities/user';
import { ThemeToggle } from '../common/ThemeToggle';
import logoUrl from '../../../assets/logo.png';
import { Activity, LogOut } from 'lucide-react';
import { getFuncaoLabel } from './helpers';

interface OperatorHeaderProps {
  currentUser: UserState;
  onOpenDrawer: () => void;
  onLogout: () => void;
}

export const OperatorHeader: React.FC<OperatorHeaderProps> = ({
  currentUser,
  onOpenDrawer,
  onLogout
}) => {
  return (
    <header className="border-b border-border-subtle bg-bg-panel px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="p-1 border border-border-subtle rounded">
          <img src={logoUrl} alt="TriageHub Logo" className="w-8 h-8 object-contain rounded-lg" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-text-main flex items-center gap-2">
            TriageHub <span className="text-[10px] font-mono font-normal text-text-muted uppercase tracking-wider">[Painel de Triagem]</span>
          </h1>
          <p className="text-xs text-text-muted flex items-center flex-wrap gap-1.5 mt-0.5">
            Atendente: <strong>{currentUser.name}</strong> ({currentUser.email})
            {currentUser.codigoIdentificacao && (
              <span className="font-mono text-[9px] text-text-muted ml-1">
                ID: {currentUser.codigoIdentificacao}
              </span>
            )}
            {currentUser.funcao && (
              <span className="text-[9px] text-text-muted ml-1">
                • {getFuncaoLabel(currentUser.funcao)}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />

        <button
          onClick={onOpenDrawer}
          className="flex items-center text-xs text-secondary hover:bg-secondary hover:text-white bg-transparent px-3 py-1.5 rounded border border-secondary font-medium cursor-pointer transition-colors"
        >
          <Activity className="w-3.5 h-3.5 mr-1.5" /> Métricas e Logs
        </button>

        <button
          onClick={onLogout}
          className="text-xs text-secondary hover:opacity-80 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0"
        >
          <LogOut className="w-3.5 h-3.5" /> Sair
        </button>
      </div>
    </header>
  );
};
