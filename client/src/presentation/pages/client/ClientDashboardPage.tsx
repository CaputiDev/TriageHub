
import { Navigate } from 'react-router-dom';
import { useClientDashboardController } from '../../controllers/useClientDashboardController';
import { ClientTicketCard } from '../../components/dashboard/ClientTicketCard';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import logoUrl from '../../../assets/logo.png';
import { LogOut, Plus, MessageSquare, Clock, Bot, CheckCircle } from 'lucide-react';

export function ClientDashboardPage() {
  const {
    currentUser,
    activeTickets,
    resolvedTickets,
    handleLogout,
    navigateToCreate,
    navigateToChat
  } = useClientDashboardController();

  // Route protection
  if (!currentUser || currentUser.role !== 'client') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080b11] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-305 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 bg-white/95 dark:bg-[#0c101b]/95 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center space-x-2">
          <img src={logoUrl} alt="TriageHub Logo" className="w-6 h-6 object-contain rounded-full border border-indigo-500/20" />
          <h1 className="text-sm font-bold text-slate-901 text-slate-900 dark:text-white">Central do Cliente TriageHub</h1>
        </div>
        <div className="text-xs text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 flex items-center gap-3">
          <span>Logado como: <strong>{currentUser.name}</strong> ({currentUser.email})</span>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="text-xs text-slate-505 text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 font-medium cursor-pointer bg-transparent border-0"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Welcome Hero Widget */}
        <section className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-900/60 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="space-y-2 relative z-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-901 text-slate-900 dark:text-white">Olá, {currentUser.name}!</h2>
            <p className="text-xs text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 max-w-xl leading-relaxed">
              Bem-vindo à sua central de suporte em tempo real. Veja abaixo o andamento dos seus tickets ativos ou abra uma nova solicitação com nosso motor de triagem inteligente.
            </p>
          </div>

          <button
            onClick={navigateToCreate}
            className="relative z-10 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-indigo-950/30 shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Abrir Nova Solicitação
          </button>
        </section>

        {/* Tickets Grid Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
          {/* Column A: Atendimento Ativo */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-500" /> Solicitações Ativas ({activeTickets.length})
              </h3>
            </div>

            <div className="space-y-3">
              {activeTickets.length === 0 ? (
                <div className="text-center py-16 bg-white/20 dark:bg-slate-900/10 border border-dashed border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 rounded-2xl p-6">
                  <Bot className="w-10 h-10 text-slate-400 dark:text-slate-606 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-xs text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 font-medium">Nenhum atendimento ativo no momento.</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-505 dark:text-slate-500 mt-1">Caso precise de ajuda com faturamento, acessos ou suporte técnico, abra um novo ticket.</p>
                </div>
              ) : (
                activeTickets.map((ticket) => (
                  <ClientTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onEnterChat={navigateToChat}
                  />
                ))
              )}
            </div>
          </section>

          {/* Column B: Atendimento Resolvido */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" /> Histórico Resolvido ({resolvedTickets.length})
              </h3>
            </div>

            <div className="space-y-3">
              {resolvedTickets.length === 0 ? (
                <div className="text-center py-16 bg-white/20 dark:bg-slate-900/10 border border-dashed border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 rounded-2xl p-6">
                  <CheckCircle className="w-10 h-10 text-slate-300 dark:text-slate-706 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-xs text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 font-medium">Nenhum ticket finalizado anteriormente.</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-505 dark:text-slate-500 mt-1">Quando um atendente concluir e resolver sua solicitação, ela aparecerá aqui.</p>
                </div>
              ) : (
                resolvedTickets.map((ticket) => (
                  <ClientTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onEnterChat={navigateToChat}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
