import { Navigate } from 'react-router-dom';
import { useOperatorDashboardController } from '../../controllers/useOperatorDashboardController';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { TriageLogList } from '../../components/dashboard/TriageLogList';
import { OperatorTicketListItem } from '../../components/dashboard/OperatorTicketListItem';
import { ChatFeed } from '../../components/chat/ChatFeed';
import { ChatInput } from '../../components/chat/ChatInput';
import logoUrl from '../../../assets/logo.png';
import {
  Activity,
  WifiOff,
  LogOut,
  Lock,
  Search,
  X,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

const getFuncaoLabel = (funcao?: string) => {
  switch (funcao) {
    case 'suporte_ti_1': return '🛡️ Suporte de TI 1';
    case 'suporte_ti_2': return '⚡ Suporte de TI 2';
    case 'suporte_ti_3': return '⚙️ Suporte de TI 3';
    case 'suporte_juridico': return '⚖️ Suporte Jurídico';
    case 'analista_consumidor': return '👤 Analista de Suporte ao Consumidor';
    default: return 'Atendente';
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'critical':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 animate-pulse-slow">
          Crítico
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-955/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
          Alto
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-808/30">
          Médio
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-105 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-202 border-slate-200 dark:border-slate-700/50">
          Baixo
        </span>
      );
  }
};

const getStressProgressBar = (level: number) => {
  const percentage = (level / 5) * 100;
  let color: string;
  if (level === 5) color = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
  else if (level >= 3) color = 'bg-amber-550';
  else color = 'bg-emerald-500';

  return (
    <div className="w-full bg-slate-202 bg-slate-200 dark:bg-slate-955 dark:bg-slate-950 rounded-full h-1 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

export function OperatorDashboardPage() {
  const {
    currentUser,
    triageLogs,
    isConnected,
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
    handleLeave,
    handleReconnect
  } = useOperatorDashboardController();

  // Route protection
  if (!currentUser || currentUser.role !== 'agent') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen h-screen bg-slate-50 dark:bg-[#080b11] text-slate-800 dark:text-slate-100 flex flex-col font-sans overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 bg-white/95 dark:bg-[#0c101b]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-white/10 dark:bg-slate-955/20 border border-slate-202 border-slate-200 dark:border-indigo-500/20 rounded-xl shadow-sm">
            <img src={logoUrl} alt="TriageHub Logo" className="w-8 h-8 object-contain rounded-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-901 text-slate-900 dark:text-white flex items-center gap-2">
              TriageHub <span className="text-xs px-2 py-0.5 font-normal bg-indigo-50 dark:bg-indigo-500/10 text-indigo-606 text-indigo-600 dark:text-indigo-404 border border-indigo-102 border-indigo-100 dark:border-indigo-500/20 rounded-md">Painel de Triagem</span>
            </h1>
            <p className="text-xs text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 flex items-center flex-wrap gap-1.5 mt-0.5">
              Atendente: <strong>{currentUser.name}</strong> ({currentUser.email})
              {currentUser.codigoIdentificacao && (
                <span className="font-mono text-[9px] bg-slate-101 bg-slate-100 dark:bg-slate-955 dark:bg-slate-905 px-1.5 py-0.5 border border-slate-202 border-slate-200 dark:border-slate-808 rounded text-indigo-606 text-indigo-600 dark:text-indigo-404 font-bold ml-1">
                  ID: {currentUser.codigoIdentificacao}
                </span>
              )}
              {currentUser.funcao && (
                <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 border border-indigo-102 border-indigo-100 dark:border-indigo-900/20 rounded text-indigo-706 text-indigo-700 dark:text-slate-300 ml-1 font-bold">
                  {getFuncaoLabel(currentUser.funcao)}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center text-xs text-indigo-606 text-indigo-600 dark:text-indigo-404 hover:text-indigo-706 dark:hover:text-indigo-303 bg-indigo-55 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-full border border-indigo-202 border-indigo-200 dark:border-indigo-808/40 font-medium cursor-pointer transition-all hover:bg-indigo-101 dark:hover:bg-indigo-950/60 shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5" /> Ver Métricas & Logs
          </button>

          <div>
            {isConnected ? (
              <span className="flex items-center text-xs text-emerald-606 text-emerald-600 dark:text-emerald-404 bg-emerald-55 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-202 border-emerald-200 dark:border-emerald-808/40 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                Servidor Conectado
              </span>
            ) : (
              <button
                onClick={handleReconnect}
                className="flex items-center text-xs text-red-656 text-red-650 dark:text-red-404 hover:text-red-756 dark:hover:text-red-303 bg-red-55 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-full border border-red-202 border-red-200 dark:border-red-808/40 font-medium cursor-pointer"
              >
                <WifiOff className="w-3.5 h-3.5 mr-2 animate-pulse" /> Reconectar WS
              </button>
            )}
          </div>
          <button
            onClick={handleLeave}
            className="text-xs text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      {/* Workspace de Chat Integrado (Layout Dividido de Duas Colunas) */}
      <main className="flex-1 flex min-h-0 relative overflow-hidden bg-slate-50 dark:bg-[#080b11]">
        {/* BARRA LATERAL ESQUERDA (Solicitações & Conversas) */}
        <section className="w-[350px] md:w-[380px] bg-white/40 dark:bg-[#0c101b]/35 border-r border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 flex flex-col h-full shrink-0 overflow-hidden transition-colors">
          {/* 1. Painel de Solicitações Pendentes (Topo Esquerdo) */}
          <div className="p-4 border-b border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 bg-slate-101/50 bg-slate-100/50 dark:bg-slate-955/80 dark:bg-slate-950/80 transition-colors">
            <h3 className="text-xs font-bold text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-656 text-indigo-650 dark:text-indigo-404" /> Solicitações Recebidas
              </span>
              {pendingRequests.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-955 font-extrabold animate-pulse">
                  {pendingRequests.length} pendente(s)
                </span>
              )}
            </h3>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {pendingRequests.length === 0 ? (
                <p className="text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 text-xs italic py-2 text-center">Nenhuma solicitação aguardando aceite.</p>
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
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-400 dark:border-amber-500/50 shadow-md shadow-amber-101 shadow-amber-100 dark:shadow-amber-950/20'
                          : 'bg-amber-55 bg-amber-50/30 dark:bg-amber-950/5 border-amber-101 border-amber-100 dark:border-amber-955/25 dark:border-amber-950/25 hover:border-amber-202 hover:border-amber-200 dark:hover:border-amber-955/50 dark:hover:border-amber-950/50 hover:bg-amber-55 hover:bg-amber-50 dark:hover:bg-amber-950/10'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-amber-606 text-amber-600 dark:text-amber-404 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          {req.customerName}
                        </span>
                        <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 border border-amber-202 border-amber-200 dark:border-amber-500/20 text-amber-606 text-amber-600 dark:text-amber-404">
                          {req.priority === 'critical' ? 'Crítico' : req.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-606 text-slate-600 dark:text-slate-300 font-normal line-clamp-1">"{req.subject}"</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Campo Rápido de Acesso de Segurança por Protocolo */}
          <div className="p-4 border-b border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 bg-slate-101/30 bg-slate-100/30 dark:bg-slate-955/40 dark:bg-slate-954/40">
            <form onSubmit={handleProtocolSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Acessar protocolo (ex: 83D6F392)..."
                  value={protocolId}
                  onChange={(e) => {
                    setProtocolId(e.target.value);
                  }}
                  className="w-full pl-8 pr-2 py-1.5 text-xs bg-white dark:bg-slate-900/60 border border-slate-202 border-slate-200 dark:border-slate-808 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2" />
              </div>
              <button
                type="submit"
                disabled={isSearching || !protocolId.trim()}
                className="px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow border-0"
              >
                {isSearching ? '...' : 'Ir'}
              </button>
            </form>
            {protocolError && (
              <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold mt-1.5 leading-tight">{protocolError}</p>
            )}
          </div>

          {/* 3. Lista de Filtros e Conversas Ativas */}
          <div className="p-4 border-b border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 bg-slate-50/40 dark:bg-slate-955/20 dark:bg-slate-950/20 space-y-2 flex flex-col shrink-0 transition-colors">
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar por nome/assunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-white dark:bg-slate-900/60 border border-slate-202 border-slate-200 dark:border-slate-808 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2" />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as 'all' | 'open' | 'in_progress' | 'resolved')}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-202 border-slate-200 dark:border-slate-808 text-slate-701 text-slate-700 dark:text-slate-300 text-[10px] rounded-lg p-1.5 focus:outline-none transition-colors"
              >
                <option value="all" className="bg-white dark:bg-slate-950">Filtro status (Todos)</option>
                <option value="open" className="bg-white dark:bg-slate-950">Abertos</option>
                <option value="in_progress" className="bg-white dark:bg-slate-950">Em Progresso</option>
                <option value="resolved" className="bg-white dark:bg-slate-950">Resolvidos</option>
              </select>

              <select
                value={channelFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setChannelFilter(e.target.value as 'all' | 'WhatsApp' | 'Webchat')}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-202 border-slate-200 dark:border-slate-808 text-slate-701 text-slate-700 dark:text-slate-300 text-[10px] rounded-lg p-1.5 focus:outline-none transition-colors"
              >
                <option value="all" className="bg-white dark:bg-slate-950">Filtro canal (Todos)</option>
                <option value="WhatsApp" className="bg-white dark:bg-slate-950">WhatsApp</option>
                <option value="Webchat" className="bg-white dark:bg-slate-950">Webchat</option>
              </select>
            </div>
          </div>

          {/* Listagem de Chats Designados */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-555 text-slate-550 text-slate-500 dark:text-slate-400 tracking-wider mb-2 flex items-center justify-between">
              <span>
                {statusFilter === 'resolved' ? 'Conversas Resolvidas' : statusFilter === 'all' ? 'Todos os Atendimentos' : 'Conversas Ativas'}
                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-101 bg-slate-100 dark:bg-slate-800 text-slate-606 text-slate-600 dark:text-slate-400 border border-slate-202 border-slate-200 dark:border-slate-700 font-mono">{filteredActiveChats.length}</span>
              </span>
            </div>

            {filteredActiveChats.length === 0 ? (
              <div className="text-center py-12 text-slate-505 text-slate-500 dark:text-slate-606 dark:text-slate-600 text-xs italic">
                {statusFilter === 'resolved' ? 'Nenhum atendimento resolvido encontrado.' : 'Nenhum atendimento na fila.'}
              </div>
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
        </section>

        {/* COLUNA CENTRAL (Visualização de Chat ou Solicitação) */}
        <section className="flex-1 flex flex-col bg-white dark:bg-[#080a0f] h-full overflow-hidden relative transition-colors">
          {/* CASO A: Preview de Nova Solicitação Pendente */}
          {selectedRequestTicket ? (
            <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
              <div className="w-full max-w-xl glass-panel p-8 rounded-2xl border border-slate-200/80 dark:border-slate-900/60 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 animate-pulse"></div>

                <div className="flex justify-between items-start mb-6 border-b border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-955 dark:text-white tracking-tight flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-500" /> Nova Solicitação Recebida
                    </h2>
                    <p className="text-xs text-slate-505 text-slate-500 mt-1">ID do Protocolo: <strong className="font-mono text-slate-606 dark:text-slate-404">{selectedRequestTicket.id.slice(0, 8).toUpperCase()}</strong></p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-606 text-amber-600 dark:text-amber-404">
                    Aguardando Aceite
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-202 border-slate-200 dark:border-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-505 text-slate-500 block uppercase font-bold tracking-wider">Cliente</span>
                    <span className="text-sm font-bold text-slate-801 text-slate-800 dark:text-slate-200 block mt-0.5">{selectedRequestTicket.customerName}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-202 border-slate-200 dark:border-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-505 text-slate-500 block uppercase font-bold tracking-wider">Canal de Origem</span>
                    <span className="text-sm font-bold text-slate-801 text-slate-800 dark:text-slate-200 block mt-0.5">{selectedRequestTicket.channel}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-202 border-slate-200 dark:border-slate-900 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] text-slate-555 text-slate-500 block uppercase font-bold tracking-wider">Prioridade IA</span>
                    <div className="mt-1">{getPriorityBadge(selectedRequestTicket.priority)}</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-202 border-slate-200 dark:border-slate-900 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] text-slate-555 text-slate-500 block uppercase font-bold tracking-wider">Nível de Estresse</span>
                    <span className="text-sm font-bold text-slate-801 text-slate-800 dark:text-slate-200 mt-1">{selectedRequestTicket.stressLevel}/5</span>
                  </div>
                </div>

                <div className="mb-6 space-y-2">
                  <span className="text-[10px] text-slate-555 text-slate-500 block uppercase font-bold tracking-wider">Relato do Caso</span>
                  <div className="p-4 bg-slate-101/50 bg-slate-100/50 dark:bg-slate-955/80 dark:bg-slate-950/80 border border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 rounded-xl">
                    <h4 className="text-xs font-bold text-slate-801 text-slate-800 dark:text-slate-200 mb-2">Assunto: "{selectedRequestTicket.subject}"</h4>
                    <p className="text-xs text-slate-606 text-slate-600 dark:text-slate-405 dark:text-slate-400 leading-relaxed font-normal overflow-y-auto max-h-[140px]">
                      "{selectedRequestTicket.description}"
                    </p>
                  </div>
                </div>

                {requestError && (
                  <div className="mb-6 p-3 bg-red-55 bg-red-50 dark:bg-red-955/15 dark:bg-red-950/15 border border-red-202 border-red-200 dark:border-red-905 dark:border-red-900/30 text-red-606 text-red-650 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {requestError}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => handleReject(selectedRequestTicket.id)}
                    disabled={isRejecting || isAccepting}
                    className="flex-1 py-3 bg-slate-101 hover:bg-slate-202 hover:bg-slate-200 border border-slate-202 disabled:opacity-50 text-slate-701 dark:bg-slate-900 dark:hover:bg-slate-808 dark:border-slate-808 dark:text-slate-300 font-semibold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2 hover:text-red-500 dark:hover:text-red-405 font-bold"
                  >
                    {isRejecting ? 'Encaminhando...' : 'Recusar / Encaminhar'}
                  </button>
                  <button
                    onClick={() => handleAccept(selectedRequestTicket.id)}
                    disabled={isAccepting || isRejecting}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 font-bold border-0"
                  >
                    {isAccepting ? 'Aceitando...' : 'Aceitar Atendimento'}
                  </button>
                </div>
              </div>
            </div>
          ) : selectedChatTicket ? (
            /* CASO B: Visualizador de Chat Ativo */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 bg-slate-55/40 bg-slate-50/40 dark:bg-slate-955/30 dark:bg-slate-950/30 flex justify-between items-center shrink-0 transition-colors">
                <div>
                  <h3 className="font-bold text-sm text-slate-901 text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedChatTicket.customerName}
                    <span className="text-[10px] text-slate-505 text-slate-500 font-mono font-normal">
                      (Protocolo: {selectedChatTicket.id.slice(0, 8).toUpperCase()})
                    </span>
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    {getPriorityBadge(selectedChatTicket.priority)}
                    <span className="text-[9px] bg-slate-101 bg-slate-100 dark:bg-slate-800 text-slate-505 text-slate-550 text-slate-550 text-slate-500 dark:text-slate-405 dark:text-slate-400 border border-slate-202 border-slate-200 dark:border-slate-700/50 px-1.5 py-0.5 rounded">
                      {selectedChatTicket.channel}
                    </span>
                  </div>
                </div>

                <div>
                  {selectedChatTicket.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(selectedChatTicket.id)}
                      className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-606 text-emerald-600 hover:text-white dark:text-emerald-404 dark:hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
                    >
                      Resolver e Encerrar
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
            /* CASO C: Estado Vazio Elegante (Splash) */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="space-y-4 max-w-sm">
                <div className="inline-flex p-4 bg-slate-101 bg-slate-100 dark:bg-slate-905 dark:bg-slate-900/50 border border-slate-202 border-slate-200 dark:border-slate-808 rounded-2xl animate-pulse">
                  <MessageSquare className="w-8 h-8 text-indigo-500 dark:text-indigo-404" />
                </div>
                <h3 className="text-base font-bold text-slate-801 text-slate-800 dark:text-white">Central de Atendimento Real</h3>
                <p className="text-xs text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 leading-relaxed font-normal">
                  Selecione uma conversa ativa na barra lateral para iniciar o chat em tempo real, ou clique em uma solicitação recebida para decidir sobre seu aceite.
                </p>
                <div className="p-3 bg-indigo-55 bg-indigo-50 dark:bg-indigo-955/10 dark:bg-indigo-950/10 border border-indigo-101 border-indigo-100 dark:border-indigo-900/20 text-indigo-606 text-indigo-600 dark:text-indigo-404 text-[10px] rounded-xl font-medium leading-relaxed">
                  💡 <strong>Dica:</strong> A barra de solicitações pendentes no topo esquerdo listará novos atendimentos propostos pela triagem inteligente da IA.
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* PAINEL DRAWER RETRÁTIL (Métricas & Logs Opcionais) */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed top-0 right-0 h-full w-[420px] bg-white dark:bg-[#0c101b] border-l border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 z-50 flex flex-col p-6 overflow-hidden shadow-2xl transition-all duration-300 transform animate-slide-in">
            {/* Header Drawer */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 shrink-0">
              <h3 className="font-bold text-sm text-slate-901 text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-404" /> Painel de Métricas & Triagem IA
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 hover:bg-slate-101 hover:bg-slate-100 dark:hover:bg-slate-905 dark:hover:bg-slate-900 text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 hover:text-slate-801 hover:text-slate-800 dark:hover:text-white rounded-lg cursor-pointer bg-transparent border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo Scrollable */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
              {/* 1. Grade de Métricas */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550 dark:text-slate-500 tracking-wider">Estatísticas Operacionais</span>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="Acumulado Fila" value={metrics.total} />
                  <MetricCard label="Fila Sem Técnico" value={metrics.open} valueColorClass="text-sky-600 dark:text-sky-404" />
                  <MetricCard label="Meus Atendimentos" value={filteredActiveChats.length} valueColorClass="text-indigo-606 text-indigo-600 dark:text-indigo-404" />
                  <MetricCard label="Críticos Triados" value={metrics.criticalCount} valueColorClass="text-red-500 dark:text-red-404" />
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 border border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 font-medium">Estresse Médio da Fila</p>
                    <span className="text-xs font-bold text-slate-701 text-slate-700 dark:text-slate-300">{metrics.avgStress}/5</span>
                  </div>
                  {getStressProgressBar(Math.round(Number(metrics.avgStress)))}
                </div>
              </div>

              {/* 2. Logs de Triagem */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550 dark:text-slate-500 tracking-wider">Histórico de Logs IA</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-404 font-bold tracking-widest animate-pulse">LIVE</span>
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
