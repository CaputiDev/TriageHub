import { Navigate } from 'react-router-dom';
import { useClientDashboardController } from '../../controllers/useClientDashboardController';
import { ClientTicketCard } from '../../components/dashboard/ClientTicketCard';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
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
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <Header
        userName={currentUser.name}
        rightActions={
          <Button
            onClick={handleLogout}
            variant="text"
            size="sm"
            className="flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </Button>
        }
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Simple text greeting instead of giant banner */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border-subtle">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-text-main">Olá, {currentUser.name}</h2>
            <p className="text-xs text-text-muted">
              Gerencie seus chamados de suporte em tempo real ou crie uma nova solicitação.
            </p>
          </div>
          <Button
            onClick={navigateToCreate}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Nova solicitação
          </Button>
        </section>

        {/* Tickets Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column A: Atendimento Ativo */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Solicitações Ativas ({activeTickets.length})
            </h3>

            <div className="space-y-3">
              {activeTickets.length === 0 ? (
                <div className="text-center py-10 bg-bg-panel border border-dashed border-border-subtle rounded p-6">
                  <p className="text-xs text-text-muted">Nenhum atendimento ativo no momento.</p>
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
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Histórico Resolvido ({resolvedTickets.length})
            </h3>

            <div className="space-y-3">
              {resolvedTickets.length === 0 ? (
                <div className="text-center py-10 bg-bg-panel border border-dashed border-border-subtle rounded p-6">
                  <p className="text-xs text-text-muted">Nenhum ticket finalizado anteriormente.</p>
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

