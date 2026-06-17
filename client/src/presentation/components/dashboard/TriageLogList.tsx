import React from 'react';
import type { TriageLog } from '../../../core/entities/triage';

interface TriageLogListProps {
  logs: TriageLog[];
}

export const TriageLogList: React.FC<TriageLogListProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted italic">
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
            className={`p-3 rounded border transition-colors ${
              isStress
                ? 'bg-red-500/5 border-red-500/20 text-red-500'
                : 'bg-bg-panel border-border-subtle text-text-main'
            }`}
          >
            <div className="flex justify-between mb-1">
              <span className={isStress ? 'text-red-500 font-bold' : 'text-text-muted'}>
                {isStress ? 'ALERTA IA CRÍTICO' : 'TRIADO'}
              </span>
              <span className="text-text-muted">
                {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="space-y-1 text-text-main">
              <div>Cliente: {log.customerName}</div>
              <div className="line-clamp-1">Assunto: "{log.subject}"</div>
              {log.detectedKeywords.length > 0 && (
                <div>
                  Alertas:{' '}
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    {log.detectedKeywords.join(', ')}
                  </span>
                </div>
              )}
              <div className="pt-1.5 mt-1.5 border-t border-border-subtle flex justify-between font-bold text-text-muted">
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
