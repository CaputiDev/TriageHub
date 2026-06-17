import { Navigate } from 'react-router-dom';
import { useOperatorChatController } from '../../controllers/useOperatorChatController';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { ChatFeed } from '../../components/chat/ChatFeed';
import { ChatInput } from '../../components/chat/ChatInput';
import { Button } from '../../components/common/Button';
import { ArrowLeft, Check, Bot } from 'lucide-react';
import { TicketDetailSummary } from '../../components/dashboard/TicketDetailSummary';

export function OperatorChatPage() {
  const {
    currentUser,
    ticket,
    handleSend,
    handleResolve,
    handleLeave
  } = useOperatorChatController();

  // Route protection
  if (!currentUser || currentUser.role !== 'agent') {
    return <Navigate to="/" replace />;
  }

  // Not found fallback
  if (!ticket) {
    return (
      <div className="min-h-screen bg-bg-base text-text-main flex items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="space-y-4">
          <Bot className="w-12 h-12 text-text-muted mx-auto" />
          <h2 className="text-lg font-bold">Ticket não encontrado</h2>
          <p className="text-xs text-text-muted">Verifique se o ticket ainda existe e está ativo.</p>
          <Button onClick={handleLeave}>
            Voltar ao Painel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col font-sans transition-colors duration-300">
      {/* Header do Chat */}
      <header className="border-b border-border-subtle bg-bg-panel px-6 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleLeave}
            variant="text"
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-sm font-bold text-text-main flex items-center gap-1.5 animate-none">
              Atendendo: {ticket.customerName}
              <span className="text-[10px] text-text-muted font-mono font-normal">
                {ticket.status === 'open' ? '[Em Espera]' :
                  ticket.status === 'in_progress' ? '[Em Atendimento]' : '[Resolvido]'}
              </span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Canal: <strong>{ticket.channel}</strong> | Operador: <strong>{ticket.operatorName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {ticket.status !== 'resolved' && (
            <Button
              onClick={handleResolve}
              className="flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Finalizar Atendimento
            </Button>
          )}
        </div>
      </header>

      {/* Grid Principal com Informações Expandidas do Questionário */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 min-h-0">
        {/* Painel Informações Fila */}
        <aside className="md:col-span-1 border-r border-border-subtle bg-bg-base/30 p-6 hidden md:block overflow-y-auto transition-colors">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Dados da Solicitação</h3>
          <TicketDetailSummary ticket={ticket} showPriority />
        </aside>

        {/* Painel do Chat */}
        <main className="md:col-span-3 flex flex-col bg-bg-panel min-h-0 transition-colors">
          <ChatFeed
            messages={ticket.messages}
            currentUserName={currentUser.name}
            currentUserRole="agent"
            customerName={ticket.customerName}
          />

          <ChatInput
            status={ticket.status}
            operatorName={ticket.operatorName}
            customerName={ticket.customerName}
            currentUserRole="agent"
            onSend={handleSend}
          />
        </main>
      </div>
    </div>
  );
}

