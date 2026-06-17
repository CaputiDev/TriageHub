import { Navigate } from 'react-router-dom';
import { useClientChatController } from '../../controllers/useClientChatController';
import { ChatFeed } from '../../components/chat/ChatFeed';
import { ChatInput } from '../../components/chat/ChatInput';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import logoUrl from '../../../assets/logo.png';
import { ArrowLeft } from 'lucide-react';

export function ClientChatPage() {
  const {
    currentUser,
    isConnected,
    mobileInfoOpen,
    setMobileInfoOpen,
    ticket,
    handleSend,
    handleLeave
  } = useClientChatController();

  if (!currentUser || currentUser.role !== 'client') {
    return <Navigate to="/" replace />;
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex items-center justify-center p-6 text-center transition-colors duration-200">
        <div className="space-y-3">
          <h2 className="text-base font-bold">Solicitação não encontrada</h2>
          <button
            onClick={handleLeave}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white text-xs font-semibold rounded cursor-pointer border-0"
          >
            Voltar ao Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex flex-col font-sans transition-colors duration-200">
      {/* Header do Chat */}
      <header className="border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
            <img src={logoUrl} alt="TriageHub" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              Atendimento em tempo real
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </h2>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Especialista: {ticket.operatorName || 'Aguardando...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileInfoOpen(true)}
            className="md:hidden p-1.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer text-xs"
          >
            Info
          </button>
          <ThemeToggle />
          <button
            onClick={handleLeave}
            className="text-xs text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 font-medium cursor-pointer bg-transparent border-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Portal
          </button>
        </div>
      </header>

      {/* Mobile Bottom Sheet */}
      {mobileInfoOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setMobileInfoOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Detalhes do chamado</h3>
              <button
                onClick={() => setMobileInfoOpen(false)}
                className="text-xs text-zinc-400 hover:text-zinc-650 cursor-pointer bg-transparent border-0"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-2 text-[11px] text-zinc-600 dark:text-zinc-300">
              <div><strong>Protocolo:</strong> {ticket.id.slice(0, 8).toUpperCase()}</div>
              <div><strong>Status:</strong> {ticket.status}</div>
              <div><strong>Canal:</strong> {ticket.channel}</div>
              <div><strong>Categoria:</strong> {ticket.category || 'Não Informada'}</div>
              <div><strong>Título:</strong> {ticket.subject}</div>
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-2">
                <strong>Relato Completo:</strong>
                <p className="mt-1 text-zinc-500 dark:text-zinc-400 italic">"{ticket.description}"</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Principal */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 min-h-0">
        {/* Painel Lateral */}
        <aside className="md:col-span-1 border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-5 space-y-5 hidden md:block overflow-y-auto">
          <div className="space-y-4 text-xs">
            <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-1.5">Dados da Solicitação</h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-zinc-400 block">Categoria:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{ticket.category || 'Não Informada'}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block">Assunto:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{ticket.subject}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block">Relato:</span>
                <p className="mt-1 text-zinc-500 dark:text-zinc-400 italic leading-relaxed">
                  "{ticket.description || ticket.subject}"
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-900 pt-4 text-[10px] text-zinc-500">
              <div className="flex justify-between">
                <span>Protocolo:</span>
                <span className="font-mono">{ticket.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Canal:</span>
                <span>{ticket.channel}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Painel do Chat */}
        <main className="md:col-span-3 flex flex-col bg-white dark:bg-zinc-950/20 min-h-0">
          <ChatFeed
            messages={ticket.messages}
            currentUserName={currentUser.name}
            currentUserRole="client"
          />

          <ChatInput
            status={ticket.status}
            operatorName={ticket.operatorName}
            customerName={ticket.customerName}
            currentUserRole="client"
            onSend={handleSend}
          />
        </main>
      </div>
    </div>
  );
}
