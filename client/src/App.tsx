import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTicketStore } from './store/useTicketStore';
import { useWebSocket } from './hooks/useWebSocket';
import type { Ticket } from './types/ticket';
import {
  Send,
  MessageSquare,
  Clock,
  Activity,
  CheckCircle,
  WifiOff,
  Search,
  Bot,
  RefreshCw,
  MessageCircle,
  AlertOctagon,
  Sparkles,
  Zap
} from 'lucide-react';

export default function App() {
  // Inicializa o hook de WebSocket
  const { isConnected, sendResponse, reconnect } = useWebSocket();

  // Estado global do Zustand
  const { tickets, activeTicketId, triageLogs, setActiveTicketId, addOrUpdateTicket } = useTicketStore();

  // Estados locais da interface
  const [responseText, setResponseText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'WhatsApp' | 'Webchat'>('all');

  // Referência para rolar o chat para o final automaticamente
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Encontra o ticket ativo
  const activeTicket = useMemo(() => {
    return tickets.find((t) => t.id === activeTicketId) || null;
  }, [tickets, activeTicketId]);

  // Rola o chat para o final sempre que o ticket ativo ou suas mensagens mudarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages]);

  // Cálculos de Métricas em Tempo Real
  const metrics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'open').length;
    const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
    const resolved = tickets.filter((t) => t.status === 'resolved').length;
    
    // Média de estresse dos tickets ativos (não resolvidos)
    const activeTickets = tickets.filter((t) => t.status !== 'resolved');
    const avgStress = activeTickets.length > 0
      ? (activeTickets.reduce((acc, t) => acc + t.stressLevel, 0) / activeTickets.length).toFixed(1)
      : '0.0';

    // Total de tickets triados como críticos
    const criticalCount = tickets.filter((t) => t.priority === 'critical').length;

    return { total, open, inProgress, resolved, avgStress, criticalCount };
  }, [tickets]);

  // Filtra os tickets para exibição na lista lateral
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesChannel = channelFilter === 'all' || ticket.channel === channelFilter;

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [tickets, searchTerm, statusFilter, channelFilter]);

  // Manipulador de envio de resposta do agente
  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !responseText.trim()) return;

    // Envia resposta via WebSocket
    const success = sendResponse(activeTicket.id, responseText.trim());

    if (success) {
      setResponseText('');
    }
  };

  // Simulação local para marcar o ticket como resolvido
  const handleResolveTicket = () => {
    if (!activeTicket) return;

    // Envia uma mensagem final sinalizando resolução automática no backend
    sendResponse(activeTicket.id, "Prezado cliente, identificamos que sua solicitação foi atendida. Este ticket foi encerrado. Obrigado!");
    
    // Atualiza localmente o status do ticket para 'resolved'
    const updatedTicket: Ticket = {
      ...activeTicket,
      status: 'resolved',
      stressLevel: 1 // O estresse cai ao resolver
    };
    
    // Atualiza a store
    addOrUpdateTicket(updatedTicket);
  };

  // Formatação de data legível
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-800/80 animate-pulse-slow">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
            Crítico
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/50">
            Alto
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/50 text-indigo-400 border border-indigo-800/30">
            Médio
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/50">
            Baixo
          </span>
        );
    }
  };

  const getChannelBadge = (channel: 'WhatsApp' | 'Webchat') => {
    if (channel === 'WhatsApp') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
          WhatsApp
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-sky-950/40 text-sky-400 border border-sky-900/30">
        Webchat
      </span>
    );
  };

  const getStressProgressBar = (level: number) => {
    const percentage = (level / 5) * 100;
    let color = 'bg-slate-500';
    if (level === 5) color = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
    else if (level >= 3) color = 'bg-amber-500';
    else color = 'bg-emerald-500';

    return (
      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans antialiased Selection:bg-indigo-500/30">
      
      {/* HEADER PRINCIPAL */}
      <header className="border-b border-slate-900 bg-[#0c101b]/90 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              TriageHub <span className="text-xs px-2 py-0.5 font-normal bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">Vite + React 19</span>
            </h1>
            <p className="text-xs text-slate-400">Central de Triagem Automatizada de Suporte ao Cliente</p>
          </div>
        </div>

        {/* STATUS DA CONEXÃO WS */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <span className="flex items-center text-xs text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-800/40 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 absolute"></span>
                Servidor Conectado
              </span>
            ) : (
              <button 
                onClick={reconnect}
                className="flex items-center text-xs text-red-400 hover:text-red-300 bg-red-950/30 px-3 py-1.5 rounded-full border border-red-800/40 hover:border-red-700 transition-all font-medium group cursor-pointer"
              >
                <WifiOff className="w-3.5 h-3.5 mr-2 animate-pulse" />
                Desconectado (Reconectar)
                <RefreshCw className="w-3 h-3 ml-2 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* PAINEL DE MÉTRICAS EM TEMPO REAL */}
      <section className="px-6 pt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total de Tickets */}
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total de Tickets</p>
            <p className="text-2xl font-bold text-white mt-1">{metrics.total}</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-lg text-slate-400">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Tickets em Aberto */}
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Aguardando Triagem</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">{metrics.open}</p>
          </div>
          <div className="p-3 bg-sky-950/20 rounded-lg text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Tickets Críticos */}
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Críticos Triados</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{metrics.criticalCount}</p>
          </div>
          <div className="p-3 bg-red-950/20 rounded-lg text-red-400">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Tickets Em Atendimento */}
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Em Atendimento</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{metrics.inProgress}</p>
          </div>
          <div className="p-3 bg-indigo-950/20 rounded-lg text-indigo-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Tickets Resolvidos */}
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Resolvidos</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{metrics.resolved}</p>
          </div>
          <div className="p-3 bg-emerald-950/20 rounded-lg text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Nível Médio de Estresse */}
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">Média Estresse Fila</p>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              Number(metrics.avgStress) >= 4.0 ? 'text-red-400 bg-red-950/30' :
              Number(metrics.avgStress) >= 2.5 ? 'text-amber-400 bg-amber-950/30' :
              'text-emerald-400 bg-emerald-950/30'
            }`}>
              {metrics.avgStress}/5
            </span>
          </div>
          <div className="mt-2.5">
            {getStressProgressBar(Math.round(Number(metrics.avgStress)))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PRINCIPAL EM TRÊS COLUNAS */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-6 min-h-0">
        
        {/* COLUNA 1: QUEUE / LISTA DE TICKETS (4/12 colunas) */}
        <section className="lg:col-span-4 flex flex-col glass-panel rounded-2xl overflow-hidden border border-slate-900">
          
          {/* CONTROLES DE FILTRO E BUSCA */}
          <div className="p-4 border-b border-slate-900 bg-[#0b0f19]/50 space-y-3">
            {/* Campo de Busca */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por cliente ou assunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/60 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>

            {/* Filtros Status e Canais */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg p-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Todos os Status</option>
                <option value="open">Abertos</option>
                <option value="in_progress">Em Progresso</option>
                <option value="resolved">Resolvidos</option>
              </select>

              <select
                value={channelFilter}
                onChange={(e: any) => setChannelFilter(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg p-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Todos os Canais</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Webchat">Webchat</option>
              </select>
            </div>
          </div>

          {/* FILA DE TICKETS */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 px-2 tracking-wider">
              Tickets Ordenados por Urgência ({filteredTickets.length})
            </div>

            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                <MessageCircle className="w-8 h-8 mb-2 opacity-30 text-indigo-400" />
                <p className="text-xs">Nenhum ticket encontrado com os filtros atuais.</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isActive = ticket.id === activeTicketId;
                const lastMessage = ticket.messages[ticket.messages.length - 1];

                return (
                  <button
                    key={ticket.id}
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-2 relative ${
                      isActive
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                        : 'bg-slate-900/30 border-slate-900 hover:bg-slate-900/60 hover:border-slate-800'
                    }`}
                  >
                    {/* Alerta de Urgência Pulsa na Borda Esquerda para Critical */}
                    {ticket.priority === 'critical' && ticket.status !== 'resolved' && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-red-500 rounded-r-md animate-pulse"></div>
                    )}

                    {/* Linha Superior: Nome e Tempo */}
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-200 truncate pr-2 max-w-[170px]">
                        {ticket.customerName}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-600" />
                        {formatTime(ticket.createdAt)}
                      </span>
                    </div>

                    {/* Assunto */}
                    <p className="text-xs text-slate-400 font-normal line-clamp-1">
                      {ticket.subject}
                    </p>

                    {/* Badges de prioridade, canal e estresse */}
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="flex items-center space-x-1.5">
                        {getPriorityBadge(ticket.priority)}
                        {getChannelBadge(ticket.channel)}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-right">
                        <span className="text-[10px] font-semibold text-slate-400">
                          Estresse: {ticket.stressLevel}/5
                        </span>
                      </div>
                    </div>

                    {/* Barra de Estresse */}
                    <div className="w-full mt-0.5">
                      {getStressProgressBar(ticket.stressLevel)}
                    </div>

                    {/* Prévia da última mensagem */}
                    {lastMessage && (
                      <div className="text-[10px] text-slate-500 bg-slate-950/30 p-1.5 rounded border border-slate-900/55 flex items-center justify-between">
                        <span className="truncate max-w-[85%]">
                          <strong>{lastMessage.sender === 'client' ? 'Cliente' : 'Agente'}:</strong> {lastMessage.text}
                        </span>
                        <span className="text-[9px] font-mono shrink-0">
                          {formatTime(lastMessage.timestamp)}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* COLUNA 2: ÁREA DO CHAT ATIVO (5/12 colunas) */}
        <section className="lg:col-span-5 flex flex-col glass-panel rounded-2xl overflow-hidden border border-slate-900 min-h-[400px]">
          {activeTicket ? (
            <div className="flex-1 flex flex-col min-h-0 bg-[#0a0d16]/30">
              
              {/* Header do Chat */}
              <div className="p-4 border-b border-slate-900 bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-900 flex items-center justify-between justify-center text-indigo-400 font-bold text-sm select-none">
                    {activeTicket.customerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                      {activeTicket.customerName}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        activeTicket.status === 'open' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                        activeTicket.status === 'in_progress' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {activeTicket.status === 'open' ? 'Aguardando' :
                         activeTicket.status === 'in_progress' ? 'Em Progresso' : 'Resolvido'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 truncate max-w-[250px]">
                      {activeTicket.subject}
                    </p>
                  </div>
                </div>

                {/* Ações Rápidas de Operador */}
                {activeTicket.status !== 'resolved' && (
                  <button
                    onClick={handleResolveTicket}
                    className="text-xs px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm hover:shadow-emerald-950 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Resolver
                  </button>
                )}
              </div>

              {/* Informações de Triage Rápidas */}
              <div className="bg-slate-950/20 px-4 py-2 border-b border-slate-900 text-xs flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1">
                  Prioridade: <strong className="text-slate-200">{activeTicket.priority.toUpperCase()}</strong>
                </span>
                <span className="flex items-center gap-1">
                  Nível de Estresse: <strong className="text-slate-200">{activeTicket.stressLevel}/5</strong>
                </span>
                <span className="flex items-center gap-1">
                  Canal: <strong className="text-slate-200">{activeTicket.channel}</strong>
                </span>
              </div>

              {/* Mensagens de Chat */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {activeTicket.messages.map((msg) => {
                  const isClient = msg.sender === 'client';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative ${
                        isClient
                          ? 'bg-slate-900 text-slate-100 rounded-tl-none border border-slate-800'
                          : 'bg-indigo-600 text-white rounded-tr-none'
                      }`}>
                        {/* Nome do Remetente */}
                        <div className={`text-[9px] font-bold uppercase mb-1 ${
                          isClient ? 'text-indigo-400' : 'text-indigo-200'
                        }`}>
                          {isClient ? activeTicket.customerName : 'Operador'}
                        </div>

                        {/* Corpo da Mensagem */}
                        <p className="leading-relaxed break-words">{msg.text}</p>

                        {/* Carimbo de Tempo */}
                        <span className="block text-[9px] text-right font-mono mt-1 opacity-60">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Box para Mensagens */}
              <div className="p-4 border-t border-slate-900 bg-slate-950/30">
                {activeTicket.status === 'resolved' ? (
                  <div className="text-center p-3 bg-emerald-950/15 border border-emerald-900/30 text-emerald-400 rounded-xl text-xs flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    Este ticket já foi resolvido e encerrado pelo operador.
                  </div>
                ) : (
                  <form onSubmit={handleSendResponse} className="flex gap-2">
                    <input
                      type="text"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder={`Responder a ${activeTicket.customerName}...`}
                      className="flex-1 px-4 py-2 text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!responseText.trim()}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md hover:shadow-indigo-950"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0d16]/10 text-slate-500">
              <Bot className="w-16 h-16 text-indigo-500/25 mb-4 animate-bounce-slow" />
              <h3 className="text-base font-semibold text-slate-300">Central de Triagem Ativa</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Selecione um cliente na fila ao lado para analisar a triagem automática e iniciar o chat de atendimento em tempo real.
              </p>
            </div>
          )}
        </section>

        {/* COLUNA 3: LOGS DE TRIAGEM AUTOMÁTICA EM TEMPO REAL (3/12 colunas) */}
        <section className="lg:col-span-3 flex flex-col glass-panel rounded-2xl overflow-hidden border border-slate-900">
          
          {/* Header dos Logs */}
          <div className="p-4 border-b border-slate-900 bg-[#0b0f19]/50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
              <h3 className="font-bold text-sm text-white">Triagem em Ação</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold uppercase animate-pulse-slow">
              LOGS IA
            </span>
          </div>

          {/* Feed de Logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px]">
            <p className="text-[10px] text-slate-500 border-b border-slate-900 pb-1.5 font-bold uppercase tracking-wider">
              Análise em Tempo Real (10s)
            </p>

            {triageLogs.length === 0 ? (
              <div className="py-12 text-slate-600 text-center flex flex-col items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700 animate-ping"></div>
                <p className="text-[10px] text-slate-500">Aguardando novos tickets para triagem automática...</p>
              </div>
            ) : (
              triageLogs.map((log) => {
                const isStress = log.stressLevel === 5;
                return (
                  <div 
                    key={log.id} 
                    className={`p-2.5 rounded-lg border transition-all ${
                      isStress 
                        ? 'bg-red-950/10 border-red-900/30 hover:border-red-900/60' 
                        : 'bg-slate-900/25 border-slate-800/40 hover:border-slate-800'
                    }`}
                  >
                    {/* Linha Superior: Tipo de Alerta e Timestamp */}
                    <div className="flex items-center justify-between text-[9px] mb-1.5">
                      <span className={`font-bold ${isStress ? 'text-red-400' : 'text-slate-400'}`}>
                        {isStress ? '⚠️ URGÊNCIA DETECTADA' : 'ℹ️ TRIAGEM PADRÃO'}
                      </span>
                      <span className="text-slate-500">{formatTime(log.timestamp)}</span>
                    </div>

                    {/* Detalhes do Cliente */}
                    <div className="space-y-1 text-slate-300">
                      <div>
                        <span className="text-slate-500">Cliente:</span> {log.customerName}
                      </div>
                      <div className="line-clamp-1">
                        <span className="text-slate-500">Assunto:</span> "{log.subject}"
                      </div>
                      
                      {/* Palavras-chave Detectadas */}
                      {log.detectedKeywords.length > 0 && (
                        <div>
                          <span className="text-red-400 font-semibold">Keywords:</span>{' '}
                          <span className="text-red-300 bg-red-950/30 px-1 py-0.5 rounded border border-red-900/30 text-[9px]">
                            {log.detectedKeywords.join(', ')}
                          </span>
                        </div>
                      )}
                      
                      {/* Resultados da Decisão */}
                      <div className="pt-1.5 mt-1.5 border-t border-slate-900 flex justify-between items-center text-[10px]">
                        <span className="flex items-center gap-1">
                          Prioridade: <strong className={isStress ? 'text-red-400' : 'text-slate-400'}>
                            {log.priority.toUpperCase()}
                          </strong>
                        </span>
                        <span className="flex items-center gap-1">
                          Estresse: <strong className={isStress ? 'text-red-400 animate-pulse' : 'text-slate-400'}>
                            {log.stressLevel}/5
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-950 bg-[#05070c] px-6 py-3 flex items-center justify-between text-xs text-slate-600">
        <p>© 2026 TriageHub Communication System.</p>
        <p className="flex items-center gap-2">
          <span>Proxy: WS 8080</span>
          <span>•</span>
          <span>Frontend: React + Zustand + Tailwind</span>
        </p>
      </footer>

    </div>
  );
}
