import React from 'react';
import type { TriageLog } from '../../../core/entities/triage';

interface TriageLogListProps {
  logs: TriageLog[];
}

export const TriageLogList: React.FC<TriageLogListProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-slate-505 text-slate-500 dark:text-slate-705 dark:text-slate-700 italic">
        Aguardando atividades de clientes...
      </div>
    );
  }

  return (
    <div className="space-y-2.5 font-mono text-[9px]">
      {logs.map((log) => {
        const isStress = log.stressLevel === 5;
        return (
          <div
            key={log.id}
            className={`p-3 rounded-lg border transition-colors ${
              isStress
                ? 'bg-red-50 dark:bg-red-950/15 border-red-200 dark:border-red-900/30 text-red-705 text-red-700 dark:text-red-400'
                : 'bg-slate-100 dark:bg-slate-950/30 border-slate-205 border-slate-200 dark:border-slate-905 dark:border-slate-900/80 text-slate-705 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex justify-between mb-1">
              <span className={isStress ? 'text-red-655 text-red-650 dark:text-red-400 font-bold' : 'text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400'}>
                {isStress ? '⚠️ ALERTA IA CRÍTICO' : 'ℹ️ TRIADO'}
              </span>
              <span className="text-slate-405 text-slate-400 dark:text-slate-505 dark:text-slate-500">
                {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="space-y-1 text-slate-705 text-slate-700 dark:text-slate-300">
              <div>Cliente: {log.customerName}</div>
              <div className="line-clamp-1">Assunto: "{log.subject}"</div>
              {log.detectedKeywords.length > 0 && (
                <div>
                  Alertas:{' '}
                  <span className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30 px-1 py-0.5 rounded">
                    {log.detectedKeywords.join(', ')}
                  </span>
                </div>
              )}
              <div className="pt-1.5 mt-1.5 border-t border-slate-205 border-slate-200 dark:border-slate-955 dark:border-slate-950 flex justify-between font-bold text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400">
                <span>PRIORIDADE: {log.priority.toUpperCase()}</span>
                <span>ESTRESSE: {log.stressLevel}/5</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
