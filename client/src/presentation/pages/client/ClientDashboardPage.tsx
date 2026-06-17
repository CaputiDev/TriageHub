import { Navigate } from 'react-router-dom';
import { useClientDashboardController } from '../../controllers/useClientDashboardController';
import { ClientTicketCard } from '../../components/dashboard/ClientTicketCard';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import logoUrl from '../../../assets/logo.png';
import { LogOut, Plus } from 'lucide-react';

export function ClientDashboardPage() {
  const {
    currentUser,
    activeTickets,
    resolvedTickets,
    handleLogout,
    navigateToCreate,
    navigateToChat
  } = useClientDashboardController();

  if (!currentUser || currentUser.role !== 'client') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center space-x-2">
          <img src={logoUrl} alt="TriageHub" className="w-5 h-5 object-contain opacity-80" />
          <h1 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">TriageHub</h1>
        </div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-3">
          <span>{currentUser.name}</span>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="text-[11px] text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 font-medium cursor-pointer bg-transparent border-0"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        {/* Simple text greeting instead of giant banner */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-zinc-200 dark:border-zinc-900">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Olá, {currentUser.name}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-450">
              Gerencie seus chamados de suporte em tempo real ou crie uma nova solicitação.
            </p>
          </div>
          <button
            onClick={navigateToCreate}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1 shadow-none border-0"
          >
            <Plus className="w-3.5 h-3.5" /> Nova solicitação
          </button>
        </section>

        {/* Tickets Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column A: Atendimento Ativo */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Solicitações Ativas ({activeTickets.length})
            </h3>

            <div className="space-y-3">
              {activeTickets.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded p-6">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Nenhum atendimento ativo no momento.</p>
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
          <section className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Histórico Resolvido ({resolvedTickets.length})
            </h3>

            <div className="space-y-3">
              {resolvedTickets.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded p-6">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Nenhum ticket finalizado anteriormente.</p>
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
