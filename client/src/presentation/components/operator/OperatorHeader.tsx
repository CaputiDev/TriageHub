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
    <header className="border-b border-border-subtle bg-bg-panel px-6 py-3 flex items-center justify-between sticky top-0 z-10 shrink-0 transition-colors">
      {/* Esquerda: Logo + identidade do atendente */}
      <div className="flex items-center gap-4">
        <div className="p-1 border border-border-subtle rounded shrink-0">
          <img src={logoUrl} alt="TriageHub" className="w-8 h-8 object-contain rounded-lg" />
        </div>

        {/* Divisor vertical */}
        <div className="h-8 w-px bg-border-subtle" />

        {/* Nome e cargo */}
        <div>
          <h1 className="text-base font-bold text-text-main leading-tight">
            {currentUser.name}
          </h1>
          {currentUser.funcao && (
            <p className="text-xs text-secondary font-medium mt-0.5">
              {getFuncaoLabel(currentUser.funcao)}
            </p>
          )}
        </div>

        {/* ID de identificação em destaque */}
        {currentUser.codigoIdentificacao && (
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-[9px] uppercase tracking-widest text-text-muted font-semibold">
              Código
            </span>
            <span className="font-mono text-sm font-bold text-secondary tracking-widest">
              {currentUser.codigoIdentificacao}
            </span>
          </div>
        )}
      </div>

      {/* Direita: ações */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <button
          onClick={onOpenDrawer}
          className="flex items-center text-xs text-secondary hover:bg-secondary hover:text-white bg-transparent px-3 py-1.5 rounded border border-secondary font-medium cursor-pointer transition-colors"
        >
          <Activity className="w-3.5 h-3.5 mr-1.5" /> Métricas
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
