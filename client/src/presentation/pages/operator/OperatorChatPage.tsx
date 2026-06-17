import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useOperatorChatController } from '../../controllers/useOperatorChatController';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { ChatFeed } from '../../components/chat/ChatFeed';
import { ChatInput } from '../../components/chat/ChatInput';
import { ChatSystemLog } from '../../components/chat/ChatSystemLog';
import { Button } from '../../components/common/Button';
import { ArrowLeft, Check, Bot, MoreHorizontal } from 'lucide-react';
import { TicketDetailSummary } from '../../components/dashboard/TicketDetailSummary';

export function OperatorChatPage() {
  const {
    currentUser,
    ticket,
    handleSend,
    handleResolve,
    handleLeave
  } = useOperatorChatController();

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
          <ChatSystemLog logs={ticket.logs ?? []} />
          <button
            onClick={() => setIsDetailsOpen(true)}
            className="p-1.5 rounded border border-secondary bg-bg-panel text-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Ver detalhes"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
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

      {/* Modal de Detalhes do Chamado */}
      {isDetailsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
          onClick={() => setIsDetailsOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-bg-panel border border-border-subtle rounded p-6 space-y-4 shadow-xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">Detalhes do Chamado</h3>
              <Button onClick={() => setIsDetailsOpen(false)} variant="text" size="sm" className="font-bold">
                Fechar
              </Button>
            </div>
            <TicketDetailSummary ticket={ticket} showPriority showCustomer showStatus />
          </div>
        </div>
      )}
    </div>
  );
}

