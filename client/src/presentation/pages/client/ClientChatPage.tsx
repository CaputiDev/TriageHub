import { Navigate } from 'react-router-dom';
import { useClientChatController } from '../../controllers/useClientChatController';
import { ChatFeed } from '../../components/chat/ChatFeed';
import { ChatInput } from '../../components/chat/ChatInput';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import logoUrl from '../../../assets/logo.png';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';

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
            <h2 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 animate-none">
              {ticket.operatorName ? `Atendente: ${ticket.operatorName}` : 'Procurando atendente...'}
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileInfoOpen(true)}
            className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-xs flex items-center justify-center"
            title="Ver detalhes"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <ThemeToggle />
          <button
            onClick={handleLeave}
            className="text-xs text-zinc-500 hover:text-red-500 dark:hover:text-red-404 transition-colors flex items-center gap-1 font-medium cursor-pointer bg-transparent border-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Portal
          </button>
        </div>
      </header>

      {/* Overlay de Detalhes do Chamado */}
      {mobileInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-sm" onClick={() => setMobileInfoOpen(false)}>
          <div
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Detalhes do Chamado</h3>
              <button
                onClick={() => setMobileInfoOpen(false)}
                className="text-xs text-zinc-405 hover:text-zinc-650 cursor-pointer bg-transparent border-0 font-bold"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-650 dark:text-zinc-300">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">Protocolo</span>
                <span className="font-mono">#{ticket.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase">Status</span>
                  <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase">Canal</span>
                  <span>{ticket.channel}</span>
                </div>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">Categoria</span>
                <span>{ticket.category || 'Não Informada'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">Assunto</span>
                <span className="font-bold">{ticket.subject}</span>
              </div>
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <span className="text-zinc-400 block text-[10px] uppercase mb-1">Relato Completo</span>
                <p className="text-zinc-550 dark:text-zinc-400 italic bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-100 dark:border-zinc-900 leading-relaxed">
                  "{ticket.description || ticket.subject}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Painel do Chat (Ocupa 100% de largura) */}
      <main className="flex-1 flex flex-col bg-white dark:bg-zinc-950/20 min-h-0">
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
  );
}
