import { useState } from 'react';
import { History, X, Clock } from 'lucide-react';
import type { SystemLog } from '../../../core/entities/ticket';

interface ChatSystemLogProps {
  logs: SystemLog[];
}

export function ChatSystemLog({ logs }: ChatSystemLogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Ícone de histórico — sempre visível no header via render externo,
          mas o botão gatilho aqui é para uso autônomo se necessário */}
      <button
        id="chat-system-log-trigger"
        onClick={() => setOpen(true)}
        className="p-1.5 rounded border border-secondary bg-bg-panel text-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer flex items-center justify-center relative"
        title="Histórico do sistema"
      >
        <History className="w-4 h-4" />
        {logs.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-secondary text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
            {logs.length > 9 ? '9+' : logs.length}
          </span>
        )}
      </button>

      {/* Modal de histórico */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-bg-panel border border-border-subtle rounded p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do modal */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-secondary" />
                Histórico do Sistema
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de logs */}
            {logs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-text-muted">
                <Clock className="w-8 h-8 opacity-30" />
                <p className="text-xs">Nenhum evento registrado ainda.</p>
              </div>
            ) : (
              <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-start gap-2.5 text-xs text-text-muted border-l-2 border-secondary/40 pl-3"
                  >
                    <span className="shrink-0 font-mono text-[10px] opacity-60 mt-0.5 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="leading-snug">{log.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
