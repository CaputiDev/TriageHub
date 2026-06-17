import { Navigate } from 'react-router-dom';
import { useOperatorDashboardController } from '../../controllers/useOperatorDashboardController';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { TriageLogList } from '../../components/dashboard/TriageLogList';
import { OperatorTicketListItem } from '../../components/dashboard/OperatorTicketListItem';
import { ChatFeed } from '../../components/chat/ChatFeed';
import { ChatInput } from '../../components/chat/ChatInput';
import logoUrl from '../../../assets/logo.png';
import {
  Activity,
  LogOut,
  Lock,
  Search,
  X
} from 'lucide-react';

const getFuncaoLabel = (funcao?: string) => {
  switch (funcao) {
    case 'suporte_ti_1': return 'Suporte de TI 1';
    case 'suporte_ti_2': return 'Suporte de TI 2';
    case 'suporte_ti_3': return 'Suporte de TI 3';
    case 'suporte_juridico': return 'Suporte Jurídico';
    case 'analista_consumidor': return 'Analista de Suporte ao Consumidor';
    default: return 'Atendente';
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'critical':
      return <span className="text-[10px] font-bold text-red-500">[Crítico]</span>;
    case 'high':
      return <span className="text-[10px] font-semibold text-amber-500">[Alto]</span>;
    case 'medium':
      return <span className="text-[10px] text-zinc-600 dark:text-zinc-350">[Médio]</span>;
    default:
      return <span className="text-[10px] text-zinc-400 dark:text-zinc-550">[Baixo]</span>;
  }
};

const getStressProgressBar = (level: number) => {
  const percentage = (level / 5) * 100;
  let color: string;
  if (level === 5) color = 'bg-red-500';
  else if (level >= 3) color = 'bg-amber-500';
  else color = 'bg-zinc-500';

  return (
    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

export function OperatorDashboardPage() {
  const {
    currentUser,
    triageLogs,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    channelFilter,
    setChannelFilter,
    protocolId,
    setProtocolId,
    isSearching,
    protocolError,
    activeChatId,
    setActiveChatId,
    activeRequestId,
    setActiveRequestId,
    isDrawerOpen,
    setIsDrawerOpen,
    requestError,
    isAccepting,
    isRejecting,
    metrics,
    pendingRequests,
    filteredActiveChats,
    selectedChatTicket,
    selectedRequestTicket,
    handleProtocolSearch,
    handleAccept,
    handleReject,
    handleSendChat,
    handleResolve,
    handleLeave
  } = useOperatorDashboardController();

  // Route protection
  if (!currentUser || currentUser.role !== 'agent') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 flex flex-col font-sans overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="p-1 border border-zinc-200 dark:border-zinc-800 rounded">
            <img src={logoUrl} alt="TriageHub Logo" className="w-8 h-8 object-contain rounded-lg" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              TriageHub <span className="text-[10px] font-mono font-normal text-zinc-500 uppercase tracking-wider">[Painel de Triagem]</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center flex-wrap gap-1.5 mt-0.5">
              Atendente: <strong>{currentUser.name}</strong> ({currentUser.email})
              {currentUser.codigoIdentificacao && (
                <span className="font-mono text-[9px] text-zinc-400 ml-1">
                  ID: {currentUser.codigoIdentificacao}
                </span>
              )}
              {currentUser.funcao && (
                <span className="text-[9px] text-zinc-500 dark:text-zinc-350 ml-1">
                  • {getFuncaoLabel(currentUser.funcao)}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center text-xs text-zinc-650 dark:text-zinc-355 hover:text-zinc-900 dark:hover:text-white bg-transparent px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 font-medium cursor-pointer transition-colors"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5" /> Métricas e Logs
          </button>

          <button
            onClick={handleLeave}
            className="text-xs text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </header>

      {/* Workspace de Chat Integrado (Layout Dividido de Duas Colunas) */}
      <main className="flex-1 flex min-h-0 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        {/* BARRA LATERAL ESQUERDA (Solicitações & Conversas) */}
        <section className="w-[350px] md:w-[380px] bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full shrink-0 overflow-hidden transition-colors">
          {/* 1. Painel de Solicitações Pendentes (Topo Esquerdo) */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/30 dark:bg-zinc-900/10 transition-colors">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Solicitações
              </span>
              {pendingRequests.length > 0 && (
                <span className="text-[10px] text-amber-500 font-mono">
                  [{pendingRequests.length} pendente]
                </span>
              )}
            </h3>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {pendingRequests.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-405 text-xs italic py-2 text-center">Nenhuma solicitação aguardando.</p>
              ) : (
                pendingRequests.map((req) => {
                  const isSelected = activeRequestId === req.id;
                  return (
                    <button
                      key={req.id}
                      onClick={() => {
                        setActiveRequestId(req.id);
                        setActiveChatId(null);
                      }}
                      className={`w-full text-left p-3 rounded border transition-colors cursor-pointer flex flex-col gap-1.5 ${isSelected
                        ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700'
                        : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                          {req.customerName}
                        </span>
                        {getPriorityBadge(req.priority)}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-normal line-clamp-1">"{req.subject}"</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Campo Rápido de Acesso de Segurança por Protocolo */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <form onSubmit={handleProtocolSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Acessar protocolo..."
                  value={protocolId}
                  onChange={(e) => {
                    setProtocolId(e.target.value);
                  }}
                  className="w-full pl-8 pr-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-550 absolute left-2.5 top-2" />
              </div>
              <button
                type="submit"
                disabled={isSearching || !protocolId.trim()}
                className="px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded cursor-pointer transition-colors"
              >
                {isSearching ? '...' : 'Ir'}
              </button>
            </form>
            {protocolError && (
              <p className="text-[10px] text-red-500 font-semibold mt-1.5 leading-tight">{protocolError}</p>
            )}
          </div>

          {/* 3. Lista de Filtros e Conversas Ativas */}
          <div className="p-4 flex flex-col flex-1 overflow-hidden">
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Filtrar por nome/assunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-550 absolute left-2.5 top-2" />
            </div>

            <div className="flex gap-2 mb-4">
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as 'all' | 'open' | 'in_progress' | 'resolved')}
                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] rounded p-1.5 focus:outline-none transition-colors"
              >
                <option value="all">Status: Todos</option>
                <option value="open">Abertos</option>
                <option value="in_progress">Em Progresso</option>
                <option value="resolved">Resolvidos</option>
              </select>

              <select
                value={channelFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setChannelFilter(e.target.value as 'all' | 'WhatsApp' | 'Webchat')}
                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] rounded p-1.5 focus:outline-none transition-colors"
              >
                <option value="all">Canal: Todos</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Webchat">Webchat</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {filteredActiveChats.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs italic">Nenhum chat.</div>
              ) : (
                filteredActiveChats.map((ticket) => (
                  <OperatorTicketListItem
                    key={ticket.id}
                    ticket={ticket}
                    isSelected={activeChatId === ticket.id}
                    onSelect={(id) => {
                      setActiveChatId(id);
                      setActiveRequestId(null);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* COLUNA CENTRAL (Visualização de Chat ou Solicitação) */}
        <section className="flex-1 flex flex-col bg-white dark:bg-zinc-950 h-full overflow-hidden relative">
          {selectedRequestTicket ? (
            <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
              <div className="w-full max-w-xl p-6 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/10">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-zinc-400" /> Solicitação #{selectedRequestTicket.id.slice(0, 8).toUpperCase()}
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                  <div><span className="text-zinc-500 block">Cliente</span> {selectedRequestTicket.customerName}</div>
                  <div><span className="text-zinc-500 block">Canal</span> {selectedRequestTicket.channel}</div>
                  <div><span className="text-zinc-500 block">Prioridade</span> {getPriorityBadge(selectedRequestTicket.priority)}</div>
                  <div><span className="text-zinc-500 block">Estresse</span> {selectedRequestTicket.stressLevel}/5</div>
                </div>
                <div className="mb-6">
                  <span className="text-[10px] text-zinc-500 block">Assunto</span>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{selectedRequestTicket.subject}</p>
                  <p className="text-xs text-zinc-650 dark:text-zinc-405 mt-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded">{selectedRequestTicket.description}</p>
                </div>
                {requestError && (
                  <div className="mb-4 text-xs text-red-500 font-semibold">{requestError}</div>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={() => handleReject(selectedRequestTicket.id)}
                    disabled={isRejecting || isAccepting}
                    className="flex-1 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded font-semibold text-zinc-700 dark:text-zinc-300 disabled:opacity-50 cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    {isRejecting ? 'Recusando...' : 'Recusar'}
                  </button>
                  <button
                    onClick={() => handleAccept(selectedRequestTicket.id)}
                    disabled={isAccepting || isRejecting}
                    className="flex-1 py-2 text-xs bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white rounded font-semibold disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {isAccepting ? 'Aceitando...' : 'Aceitar'}
                  </button>
                </div>
              </div>
            </div>
          ) : selectedChatTicket ? (
            /* CASO B: Visualizador de Chat Ativo */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    {selectedChatTicket.customerName}
                    <span className="text-[10px] text-zinc-400 font-mono font-normal">
                      #{selectedChatTicket.id.slice(0, 8).toUpperCase()}
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getPriorityBadge(selectedChatTicket.priority)}
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">
                      {selectedChatTicket.channel}
                    </span>
                  </div>
                </div>

                <div>
                  {selectedChatTicket.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(selectedChatTicket.id)}
                      className="px-3 py-1.5 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs font-medium cursor-pointer transition-colors"
                    >
                      Resolver
                    </button>
                  )}
                </div>
              </div>

              <ChatFeed
                messages={selectedChatTicket.messages}
                currentUserName={currentUser.name}
                currentUserRole="agent"
                customerName={selectedChatTicket.customerName}
              />

              <ChatInput
                status={selectedChatTicket.status}
                operatorName={selectedChatTicket.operatorName}
                customerName={selectedChatTicket.customerName}
                currentUserRole="agent"
                onSend={handleSendChat}
              />
            </div>
          ) : (
            /* CASO C: Estado Vazio */
            <div className="flex-1 flex items-center justify-center text-zinc-400 text-xs">Selecione um item.</div>
          )}
        </section>
      </main>

      {/* PAINEL DRAWER RETRÁTIL (Métricas & Logs Opcionais) */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-[420px] bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 z-50 flex flex-col p-6 overflow-hidden transition-all duration-300 transform">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-400" /> Métricas e Logs de Triagem
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-white rounded cursor-pointer bg-transparent border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo Scrollable */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
              {/* 1. Estatísticas Operacionais */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Estatísticas Operacionais</span>

                <div className="space-y-2 py-2 border-t border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between items-center text-xs py-1">
                    <span className="text-zinc-500">Acumulado Fila</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{metrics.total}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-1">
                    <span className="text-zinc-500">Fila Sem Técnico</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{metrics.open}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-1">
                    <span className="text-zinc-500">Meus Atendimentos</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{filteredActiveChats.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-1">
                    <span className="text-zinc-500">Críticos Triados</span>
                    <span className="font-bold text-red-500">{metrics.criticalCount}</span>
                  </div>
                </div>

                <div className="py-2">
                  <div className="flex justify-between items-center mb-2 text-xs">
                    <span className="text-zinc-500">Estresse Médio da Fila</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{metrics.avgStress}/5</span>
                  </div>
                  {getStressProgressBar(Math.round(Number(metrics.avgStress)))}
                </div>
              </div>

              {/* 2. Logs de Triagem */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Histórico de Logs IA</span>
                  <span className="text-[10px] text-zinc-400 font-mono tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>live</span>
                </div>

                <TriageLogList logs={triageLogs} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
