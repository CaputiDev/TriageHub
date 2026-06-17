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
      <div className="min-h-screen bg-slate-50 dark:bg-[#080b11] text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="space-y-4">
          <Bot className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold">Ticket não encontrado</h2>
          <p className="text-xs text-slate-405 text-slate-400">Verifique se o ticket ainda existe e está ativo.</p>
          <button
            onClick={handleLeave}
            className="px-4 py-2 bg-indigo-605 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 rounded-lg text-xs font-semibold cursor-pointer text-white border-0"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080b11] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Header do Chat */}
      <header className="border-b border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 bg-white/95 dark:bg-[#0c101b]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleLeave}
            className="p-2 hover:bg-slate-101 hover:bg-slate-100 dark:hover:bg-slate-905 dark:hover:bg-slate-900 border border-transparent hover:border-slate-202 dark:hover:border-slate-808 rounded-lg transition-colors cursor-pointer bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-901 text-slate-900 dark:text-white flex items-center gap-1.5">
              Atendendo: {ticket.customerName}
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                ticket.status === 'open' ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-606 text-sky-600 dark:text-sky-404 border border-sky-202 border-sky-200 dark:border-sky-500/20' :
                ticket.status === 'in_progress' ? 'bg-indigo-55 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-606 text-indigo-600 dark:text-indigo-404 border border-indigo-202 border-indigo-200 dark:border-indigo-500/20' :
                'bg-emerald-55 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-606 text-emerald-600 dark:text-emerald-404 border border-emerald-202 border-emerald-200 dark:border-emerald-500/20'
              }`}>
                {ticket.status === 'open' ? 'Em Espera' :
                  ticket.status === 'in_progress' ? 'Em Atendimento' : 'Resolvido'}
              </span>
            </h2>
            <p className="text-xs text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400">
              Canal: <strong>{ticket.channel}</strong> | Operador: <strong>{ticket.operatorName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {ticket.status !== 'resolved' && (
            <button
              onClick={handleResolve}
              className="text-xs px-3.5 py-2 bg-emerald-606 bg-emerald-600 hover:bg-emerald-505 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-md hover:shadow-emerald-955 border-0"
            >
              <Check className="w-3.5 h-3.5" /> Finalizar Atendimento
            </button>
          )}
        </div>
      </header>

      {/* Grid Principal com Informações Expandidas do Questionário */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 min-h-0">
        {/* Painel Informações Fila */}
        <aside className="md:col-span-1 border-r border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 bg-white/40 dark:bg-[#0c101b]/35 p-6 space-y-6 hidden md:block overflow-y-auto transition-colors">
          <div>
            <h3 className="text-xs font-bold text-slate-505 text-slate-500 uppercase tracking-wider mb-2">Dados da Solicitação</h3>

            <div className="space-y-4">
              {/* Categoria */}
              <div>
                <span className="text-[10px] text-slate-505 text-slate-500 block">Categoria do Pedido:</span>
                <span className="inline-block mt-1 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/45 border border-indigo-102 border-indigo-100 dark:border-indigo-900/40 text-xs font-semibold text-indigo-606 text-indigo-600 dark:text-indigo-404">
                  {ticket.category || 'Não Informada'}
                </span>
              </div>

              {/* Título Resumido */}
              <div>
                <span className="text-[10px] text-slate-505 text-slate-500 block">Resumo do Caso:</span>
                <span className="font-semibold text-xs text-slate-801 text-slate-800 dark:text-slate-200 block mt-0.5 leading-tight">{ticket.subject}</span>
              </div>

              {/* Descrição Detalhada */}
              <div>
                <span className="text-[10px] text-slate-505 text-slate-500 block">Relato Completo:</span>
                <p className="text-xs text-slate-606 text-slate-600 dark:text-slate-405 dark:text-slate-400 mt-1 p-3 bg-slate-101/50 bg-slate-100/50 dark:bg-slate-955/50 dark:bg-slate-955/50 dark:bg-slate-950/50 border border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 rounded-xl leading-relaxed max-h-[220px] overflow-y-auto font-normal">
                  "{ticket.description || ticket.subject}"
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 border-t border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 pt-5 animate-fade-in">
            <div className="flex justify-between">
              <span>Prioridade de Triagem IA:</span>
              <span className="font-bold text-slate-801 text-slate-800 dark:text-slate-200 uppercase">{ticket.priority}</span>
            </div>
            <div className="flex justify-between">
              <span>Estresse do Cliente:</span>
              <span className="font-bold text-slate-801 text-slate-800 dark:text-slate-200">{ticket.stressLevel}/5</span>
            </div>
            <div className="flex justify-between">
              <span>ID do Protocolo:</span>
              <span className="font-mono text-slate-701 text-slate-700 dark:text-slate-300">{ticket.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </aside>

        {/* Painel do Chat */}
        <main className="md:col-span-3 flex flex-col bg-slate-50/50 dark:bg-[#0a0d16]/10 min-h-0 transition-colors">
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
