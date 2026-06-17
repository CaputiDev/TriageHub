
import { Navigate } from 'react-router-dom';
import { useClientChatController } from '../../controllers/useClientChatController';
import { ChatFeed } from '../../components/chat/ChatFeed';
import { ChatInput } from '../../components/chat/ChatInput';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import logoUrl from '../../../assets/logo.png';
import { Bot, FileText, X, ArrowLeft } from 'lucide-react';

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

  // Route protection
  if (!currentUser || currentUser.role !== 'client') {
    return <Navigate to="/" replace />;
  }

  // Not found fallback
  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080b11] text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="space-y-4">
          <Bot className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold">Solicitação não encontrada</h2>
          <p className="text-xs text-slate-405 text-slate-400">Verifique a sua conexão com o servidor.</p>
          <button
            onClick={handleLeave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold cursor-pointer text-white border-0"
          >
            Voltar ao Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080b11] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Header do Chat */}
      <header className="border-b border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 bg-white/95 dark:bg-[#0c101b]/95 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/40 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <img src={logoUrl} alt="TriageHub" className="w-8 h-8 object-contain rounded-full" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-901 text-slate-900 dark:text-white flex items-center gap-1.5">
              Atendimento em Tempo Real
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            </h2>
            <p className="text-xs text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400">
              Designado: <strong>{ticket.operatorName || 'Aguardando...'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de info mobile - apenas visível em telas pequenas */}
          <button
            id="btn-ticket-info-mobile"
            onClick={() => setMobileInfoOpen(true)}
            className="md:hidden p-2 rounded-xl border border-slate-202 border-slate-200 dark:border-slate-808 bg-white dark:bg-slate-900 text-slate-606 text-slate-600 dark:text-slate-405 dark:text-slate-400 hover:border-indigo-302 dark:hover:border-indigo-708 hover:text-indigo-606 dark:hover:text-indigo-404 transition-all cursor-pointer shadow-sm"
            title="Ver detalhes do chamado"
          >
            <FileText className="w-4 h-4" />
          </button>
          <ThemeToggle />
          <button
            onClick={handleLeave}
            className="text-xs text-slate-505 text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 font-medium cursor-pointer hidden md:flex bg-transparent border-0"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Portal
          </button>
          <button
            onClick={handleLeave}
            className="md:hidden p-2 rounded-xl border border-slate-202 border-slate-200 dark:border-slate-808 bg-white dark:bg-slate-900 text-red-404 hover:text-red-505 hover:border-red-202 dark:hover:border-red-808 transition-all cursor-pointer shadow-sm bg-transparent"
            title="Voltar ao Portal"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Sheet: Detalhes do Chamado */}
      {mobileInfoOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setMobileInfoOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-white dark:bg-[#0e1220] border-t border-slate-202 border-slate-200 dark:border-slate-808 rounded-t-3xl p-6 space-y-5 max-h-[80vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-707 dark:bg-slate-700 rounded-full mx-auto mb-2" />

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-901 text-slate-900 dark:text-white">Detalhes do Chamado</h3>
              <button
                onClick={() => setMobileInfoOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-808 text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 transition-colors cursor-pointer bg-transparent border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-101 border-slate-100 dark:border-slate-808">
              <span className="text-[11px] text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 font-medium">Protocolo</span>
              <span className="font-mono text-xs font-bold text-indigo-606 dark:text-indigo-404 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-lg border border-indigo-102 border-indigo-100 dark:border-indigo-900/40">
                {ticket.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-101 border-slate-100 dark:border-slate-808">
              <span className="text-[11px] text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 font-medium">Status</span>
              <span className={`text-xs font-bold ${
                ticket.status === 'open' ? 'text-sky-600 dark:text-sky-400' :
                ticket.status === 'in_progress' ? 'text-indigo-600 dark:text-indigo-400' :
                ticket.status === 'pending_acceptance' ? 'text-amber-600 dark:text-amber-400' :
                'text-emerald-600 dark:text-emerald-400'
              }`}>
                {ticket.status === 'open' ? 'Aberto' :
                  ticket.status === 'in_progress' ? 'Em Progresso' :
                  ticket.status === 'pending_acceptance' ? 'Triando Especialista' :
                  'Resolvido'}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-101 border-slate-100 dark:border-slate-808">
              <span className="text-[11px] text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 font-medium">Canal</span>
              <span className="text-xs font-semibold text-slate-701 text-slate-700 dark:text-slate-300">{ticket.channel}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-101 border-slate-100 dark:border-slate-808">
              <span className="text-[11px] text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 font-medium">Categoria</span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-404 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-lg border border-indigo-102 border-indigo-100 dark:border-indigo-900/40">
                {ticket.category || 'Não Informada'}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 font-medium block">Título do Problema</span>
              <p className="text-sm font-semibold text-slate-801 text-slate-800 dark:text-slate-200 leading-snug">{ticket.subject}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 font-medium block">Descrição Detalhada</span>
              <p className="text-xs text-slate-606 text-slate-600 dark:text-slate-405 dark:text-slate-400 leading-relaxed p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-102 border-slate-100 dark:border-slate-808 rounded-xl">
                {ticket.description || ticket.subject}
              </p>
            </div>

            <button
              onClick={() => setMobileInfoOpen(false)}
              className="w-full py-3.5 bg-indigo-605 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all cursor-pointer mt-2 border-0"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Grid Principal com Informações Expandidas do Questionário */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 min-h-0">
        {/* Painel Lateral com Informações Expandidas do Pedido */}
        <aside className="md:col-span-1 border-r border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 bg-white/40 dark:bg-[#0c101b]/35 p-6 space-y-6 hidden md:block overflow-y-auto transition-colors">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Dados da Solicitação</h3>

            <div className="space-y-4">
              {/* Categoria */}
              <div>
                <span className="text-[10px] text-slate-555 text-slate-500 block">Categoria do Pedido:</span>
                <span className="inline-block mt-1 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/45 border border-indigo-102 border-indigo-100 dark:border-indigo-900/40 text-xs font-semibold text-indigo-606 text-indigo-600 dark:text-indigo-404">
                  {ticket.category || 'Não Informada'}
                </span>
              </div>

              {/* Título Resumido */}
              <div>
                <span className="text-[10px] text-slate-555 text-slate-500 block">Resumo do Caso:</span>
                <span className="font-semibold text-xs text-slate-801 text-slate-800 dark:text-slate-200 block mt-0.5 leading-tight">{ticket.subject}</span>
              </div>

              {/* Descrição Detalhada */}
              <div>
                <span className="text-[10px] text-slate-555 text-slate-500 block">Relato Completo:</span>
                <p className="text-xs text-slate-606 text-slate-600 dark:text-slate-405 dark:text-slate-400 mt-1 p-3 bg-slate-101/50 bg-slate-100/50 dark:bg-slate-955/50 dark:bg-slate-950/50 border border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 rounded-xl leading-relaxed max-h-[220px] overflow-y-auto font-normal">
                  "{ticket.description || ticket.subject}"
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 border-t border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 pt-5">
            <div className="flex justify-between">
              <span>ID do Protocolo:</span>
              <span className="font-mono text-slate-701 text-slate-700 dark:text-slate-300">{ticket.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Canal:</span>
              <span className="font-semibold text-slate-701 text-slate-700 dark:text-slate-300">{ticket.channel}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-semibold ${
                ticket.status === 'open' ? 'text-sky-600 dark:text-sky-400' :
                ticket.status === 'in_progress' ? 'text-indigo-600 dark:text-indigo-400' :
                ticket.status === 'pending_acceptance' ? 'text-amber-600 dark:text-amber-400' :
                'text-emerald-600 dark:text-emerald-400'
              }`}>
                {ticket.status === 'open' ? 'Aberto' :
                  ticket.status === 'in_progress' ? 'Em Progresso' :
                  ticket.status === 'pending_acceptance' ? 'Triando Especialista' :
                  'Resolvido'}
              </span>
            </div>
          </div>
        </aside>

        {/* Painel do Chat */}
        <main className="md:col-span-3 flex flex-col bg-slate-50/50 dark:bg-[#0a0d16]/10 min-h-0 transition-colors">
          <ChatFeed
            messages={ticket.messages}
            currentUserName={currentUser.name}
            currentUserRole="client"
          />

          {/* Chat Input */}
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
