import { Navigate } from 'react-router-dom';
import { useClientChatController } from '../../controllers/useClientChatController';
import { ChatFeed } from '../../components/chat/ChatFeed';
import { ChatInput } from '../../components/chat/ChatInput';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { Button } from '../../components/common/Button';
import logoUrl from '../../../assets/logo.png';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { TicketDetailSummary } from '../../components/dashboard/TicketDetailSummary';

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
      <div className="min-h-screen bg-bg-base text-text-main flex items-center justify-center p-6 text-center transition-colors duration-200">
        <div className="space-y-3">
          <h2 className="text-base font-bold">Solicitação não encontrada</h2>
          <Button onClick={handleLeave}>
            Voltar ao Portal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col font-sans transition-colors duration-200">
      {/* Header do Chat */}
      <header className="border-b border-border-subtle bg-bg-panel px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleLeave}
            variant="text"
            size="sm"
            className="flex items-center gap-1"
            title="Voltar ao Portal"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar ao Portal</span>
          </Button>
          <div className="w-8 h-8 rounded-full bg-bg-base border border-border-subtle flex items-center justify-center overflow-hidden shrink-0">
            <img src={logoUrl} alt="TriageHub" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-text-main flex items-center gap-1.5 animate-none">
              {ticket.operatorName ? `Atendente: ${ticket.operatorName}` : 'Procurando atendente...'}
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileInfoOpen(true)}
            className="p-1.5 rounded border border-secondary bg-bg-panel text-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer text-xs flex items-center justify-center"
            title="Ver detalhes"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Overlay de Detalhes do Chamado */}
      {mobileInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-sm" onClick={() => setMobileInfoOpen(false)}>
          <div
            className="relative w-full max-w-md bg-bg-panel border border-border-subtle rounded p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">Detalhes do Chamado</h3>
              <Button
                onClick={() => setMobileInfoOpen(false)}
                variant="text"
                size="sm"
                className="font-bold"
              >
                Fechar
              </Button>
            </div>

            <TicketDetailSummary ticket={ticket} showStatus />
          </div>
        </div>
      )}

      {/* Painel do Chat (Ocupa 100% de largura) */}
      <main className="flex-1 flex flex-col bg-bg-panel min-h-0">
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

