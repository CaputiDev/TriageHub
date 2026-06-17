import { Navigate } from 'react-router-dom';
import { useOperatorChatController } from '../../controllers/useOperatorChatController';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { ChatFeed } from '../../components/chat/ChatFeed';
import { ChatInput } from '../../components/chat/ChatInput';
import { ArrowLeft, Check, Bot } from 'lucide-react';

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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 flex items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="space-y-4">
          <Bot className="w-12 h-12 text-zinc-500 mx-auto" />
          <h2 className="text-lg font-bold">Ticket não encontrado</h2>
          <p className="text-xs text-zinc-500">Verifique se o ticket ainda existe e está ativo.</p>
          <button
            onClick={handleLeave}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded text-xs font-semibold cursor-pointer border-0"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      {/* Header do Chat */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleLeave}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent rounded transition-colors cursor-pointer bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-500" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 animate-none">
              Atendendo: {ticket.customerName}
              <span className="text-[10px] text-zinc-500 font-mono font-normal">
                {ticket.status === 'open' ? '[Em Espera]' :
                  ticket.status === 'in_progress' ? '[Em Atendimento]' : '[Resolvido]'}
              </span>
            </h2>
            <p className="text-xs text-zinc-550 mt-0.5">
              Canal: <strong className="text-zinc-700 dark:text-zinc-350">{ticket.channel}</strong> | Operador: <strong className="text-zinc-700 dark:text-zinc-350">{ticket.operatorName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {ticket.status !== 'resolved' && (
            <button
              onClick={handleResolve}
              className="text-xs px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer border-0"
            >
              <Check className="w-3.5 h-3.5" /> Finalizar Atendimento
            </button>
          )}
        </div>
      </header>

      {/* Grid Principal com Informações Expandidas do Questionário */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 min-h-0">
        {/* Painel Informações Fila */}
        <aside className="md:col-span-1 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10 p-6 space-y-6 hidden md:block overflow-y-auto transition-colors">
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Dados da Solicitação</h3>

            <div className="space-y-4">
              {/* Categoria */}
              <div>
                <span className="text-[10px] text-zinc-500 block">Categoria do Pedido:</span>
                <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 mt-1 block">
                  {ticket.category || 'Não Informada'}
                </span>
              </div>

              {/* Título Resumido */}
              <div>
                <span className="text-[10px] text-zinc-500 block">Resumo do Caso:</span>
                <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 block mt-0.5 leading-tight">{ticket.subject}</span>
              </div>

              {/* Descrição Detalhada */}
              <div>
                <span className="text-[10px] text-zinc-500 block">Relato Completo:</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded leading-relaxed max-h-[220px] overflow-y-auto font-normal">
                  "{ticket.description || ticket.subject}"
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 pt-5">
            <div className="flex justify-between">
              <span>Prioridade de Triagem IA:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase">{ticket.priority}</span>
            </div>
            <div className="flex justify-between">
              <span>Estresse do Cliente:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{ticket.stressLevel}/5</span>
            </div>
            <div className="flex justify-between">
              <span>ID do Protocolo:</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300">#{ticket.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </aside>

        {/* Painel do Chat */}
        <main className="md:col-span-3 flex flex-col bg-white dark:bg-zinc-950 min-h-0 transition-colors">
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
