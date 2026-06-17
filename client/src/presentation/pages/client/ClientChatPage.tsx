import { Navigate } from 'react-router-dom';
import { useClientChatController } from '../../controllers/useClientChatController';
import { ChatFeed } from '../../components/chat/ChatFeed';
import { ChatInput } from '../../components/chat/ChatInput';
import { ChatSystemLog } from '../../components/chat/ChatSystemLog';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { Button } from '../../components/common/Button';
import logoUrl from '../../../assets/logo.png';
import { ArrowLeft, MoreHorizontal, Clock } from 'lucide-react';
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
          <Button onClick={handleLeave}>Voltar ao Portal</Button>
        </div>
      </div>
    );
  }

  const waitingForOperator = ticket.status === 'open';

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
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
            <h2 className="text-xs font-bold text-text-main flex items-center gap-1.5">
              {waitingForOperator ? 'Procurando atendente...' : `Atendente: ${ticket.operatorName}`}
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ícone de Histórico do Sistema */}
          <ChatSystemLog logs={ticket.logs ?? []} />
          <button
            onClick={() => setMobileInfoOpen(true)}
            className="p-1.5 rounded border border-secondary bg-bg-panel text-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Ver detalhes"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Modal de Detalhes do Chamado */}
      {mobileInfoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileInfoOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-bg-panel border border-border-subtle rounded p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">Detalhes do Chamado</h3>
              <Button onClick={() => setMobileInfoOpen(false)} variant="text" size="sm" className="font-bold">
                Fechar
              </Button>
            </div>
            <TicketDetailSummary ticket={ticket} showStatus />
          </div>
        </div>
      )}

      {/* Painel do Chat */}
      <main className="flex-1 flex flex-col bg-bg-panel min-h-0 border-t border-border-subtle">
        <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto bg-bg-panel md:border-x md:border-border-subtle">

          <ChatFeed
            messages={ticket.messages}
            currentUserName={currentUser.name}
            currentUserRole="client"
          />

          {/* Aviso de fila — visível somente enquanto não há atendente */}
          {waitingForOperator && (
            <div className="flex items-start gap-3 px-4 py-3 bg-detail-specific/40 border-t border-border-subtle text-primary animate-fade-in">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-secondary" />
              <p className="text-xs leading-snug">
                <span className="font-semibold">Aguardando atendente.</span>{' '}
                Sua solicitação foi registrada e o primeiro especialista disponível assumirá o seu atendimento em breve.
              </p>
            </div>
          )}

          <ChatInput
            status={ticket.status}
            operatorName={ticket.operatorName}
            customerName={ticket.customerName}
            currentUserRole="client"
            onSend={handleSend}
          />
        </div>
      </main>
    </div>
  );
}
