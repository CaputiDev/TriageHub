import React from 'react';
import type { TriageLog } from '../../../core/entities/triage';
import { TriageLogList } from '../dashboard/TriageLogList';
import { Activity, X } from 'lucide-react';
import { getStressProgressBar } from './helpers';

interface MetricsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: {
    total: number;
    open: number;
    avgStress: string;
    criticalCount: number;
  };
  activeChatsCount: number;
  triageLogs: TriageLog[];
}

export const MetricsDrawer: React.FC<MetricsDrawerProps> = ({
  isOpen,
  onClose,
  metrics,
  activeChatsCount,
  triageLogs
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[420px] bg-bg-panel border-l border-border-subtle z-50 flex flex-col p-6 overflow-hidden transition-all duration-300 transform">
        <div className="flex justify-between items-center pb-4 border-b border-border-subtle shrink-0">
          <h3 className="font-bold text-sm text-text-main flex items-center gap-2">
            <Activity className="w-4 h-4 text-text-muted" /> Métricas e Logs de Triagem
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-secondary hover:opacity-80 rounded cursor-pointer bg-transparent border-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo Scrollable */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
          {/* 1. Estatísticas Operacionais */}
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
              Estatísticas Operacionais
            </span>

            <div className="space-y-2 py-2 border-t border-b border-border-subtle">
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-text-muted">Acumulado Fila</span>
                <span className="font-bold text-text-main">{metrics.total}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-text-muted">Fila Sem Técnico</span>
                <span className="font-bold text-text-main">{metrics.open}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-text-muted">Meus Atendimentos</span>
                <span className="font-bold text-text-main">{activeChatsCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-text-muted">Críticos Triados</span>
                <span className="font-bold text-red-500">{metrics.criticalCount}</span>
              </div>
            </div>

            <div className="py-2">
              <div className="flex justify-between items-center mb-2 text-xs">
                <span className="text-text-muted">Estresse Médio da Fila</span>
                <span className="font-bold text-text-main">{metrics.avgStress}/5</span>
              </div>
              {getStressProgressBar(Math.round(Number(metrics.avgStress)))}
            </div>
          </div>

          {/* 2. Logs de Triagem */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                Histórico de Logs IA
              </span>
              <span className="text-[10px] text-text-muted font-mono tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                live
              </span>
            </div>

            <TriageLogList logs={triageLogs} />
          </div>
        </div>
      </div>
    </>
  );
};
