import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams
} from 'react-router-dom';
import { useTicketStore } from './store/useTicketStore';
import { useWebSocket } from './hooks/useWebSocket';

import {
  Send,
  MessageSquare,
  Clock,
  Activity,
  CheckCircle,
  WifiOff,
  Search,
  Bot,
  AlertOctagon,
  Sparkles,
  Zap,
  User,
  ArrowLeft,
  LogOut,
  FileText,
  Check
} from 'lucide-react';

// ==========================================
// 1. TELA DE LOGIN & IDENTIFICAÇÃO (/)
// ==========================================
function LoginPage() {
  const navigate = useNavigate();
  const login = useTicketStore((state) => state.login);
  
  const [name, setName] = useState('');
  const [role, setRole] = useState<'client' | 'agent'>('client');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, insira o seu nome para continuar.');
      return;
    }
    
    // Salva na store global do Zustand
    login(name.trim(), role);

    if (role === 'client') {
      navigate('/client/create');
    } else {
      navigate('/operator/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-900 shadow-2xl relative z-10">
        
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mb-3">
            <Sparkles className="w-8 h-8 text-indigo-400 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TriageHub Central</h1>
          <p className="text-xs text-slate-400 mt-1">Conexão em Tempo Real & Triagem Automatizada</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Seu Nome Completo
            </label>
            <input
              type="text"
              placeholder="Digite seu nome..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500"
            />
            {error && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-semibold"><AlertOctagon className="w-3.5 h-3.5" /> {error}</p>}
          </div>

          {/* Tipo de Perfil */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quem é você no sistema?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Opção Cliente */}
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  role === 'client'
                    ? 'bg-indigo-950/30 border-indigo-500/50 text-white'
                    : 'bg-slate-900/30 border-slate-900 hover:bg-slate-900/60 hover:border-slate-800 text-slate-400'
                }`}
              >
                <User className={`w-5 h-5 mb-2 ${role === 'client' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div className="font-semibold text-sm">Cliente</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Abrir pedido de suporte</div>
              </button>

              {/* Opção Atendente */}
              <button
                type="button"
                onClick={() => setRole('agent')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  role === 'agent'
                    ? 'bg-indigo-950/30 border-indigo-500/50 text-white'
                    : 'bg-slate-900/30 border-slate-900 hover:bg-slate-900/60 hover:border-slate-800 text-slate-400'
                }`}
              >
                <Bot className={`w-5 h-5 mb-2 ${role === 'agent' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div className="font-semibold text-sm">Atendente</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Fila de triagem & suporte</div>
              </button>
            </div>
          </div>

          {/* Botão Acessar */}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md hover:shadow-indigo-950"
          >
            Acessar Sistema
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 2. FORMULÁRIO DE PEDIDO DE SUPORTE (/client/create)
// ==========================================
function ClientCreatePage() {
  const navigate = useNavigate();
  const currentUser = useTicketStore((state) => state.currentUser);
  const { createTicket, isConnected, reconnect } = useWebSocket();

  const [channel, setChannel] = useState<'WhatsApp' | 'Webchat'>('WhatsApp');
  const [subject, setSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Segurança de rota: verifica se é cliente
  if (!currentUser || currentUser.role !== 'client') {
    return <Navigate to="/" replace />;
  }

  // Palavras de estresse monitoradas
  const STRESS_WORDS = ['procon', 'cancelar', 'urgente', 'ruim', 'advogado'];
  const hasStressKeyword = STRESS_WORDS.some(word => subject.toLowerCase().includes(word));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Por favor, descreva qual é o problema ou solicitação.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Envia via WS e espera a promessa ser resolvida com o ticket criado
      const newTicket = await createTicket(currentUser.name, channel, subject.trim());
      setSubmitting(false);
      
      // Redireciona o cliente para o chat específico do ticket
      navigate(`/client/chat/${newTicket.id}`);
    } catch (err: any) {
      setError(err.message || 'Falha ao abrir suporte. WebSocket fora do ar.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-900 bg-[#0c101b]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h1 className="text-sm font-bold text-white">Central do Cliente</h1>
        </div>
        <span className="text-xs text-slate-400">Olá, <strong>{currentUser.name}</strong></span>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl glass-panel p-8 rounded-2xl border border-slate-900 shadow-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> Solicitar Novo Atendimento
            </h2>
            <p className="text-xs text-slate-400 mt-1">Preencha os detalhes do seu pedido para iniciarmos a triagem automática de suporte.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Canal de Atendimento */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Canal de Entrada
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('WhatsApp')}
                  className={`py-3 rounded-xl border text-center transition-all cursor-pointer font-semibold text-sm ${
                    channel === 'WhatsApp'
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-900/30 border-slate-900 hover:bg-slate-900/60 hover:border-slate-800 text-slate-400'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('Webchat')}
                  className={`py-3 rounded-xl border text-center transition-all cursor-pointer font-semibold text-sm ${
                    channel === 'Webchat'
                      ? 'bg-sky-950/20 border-sky-500/40 text-sky-400'
                      : 'bg-slate-900/30 border-slate-900 hover:bg-slate-900/60 hover:border-slate-800 text-slate-400'
                  }`}
                >
                  Webchat
                </button>
              </div>
            </div>

            {/* Descrição do Assunto */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Qual é a sua solicitação? (Escreva detalhadamente)
              </label>
              <textarea
                rows={4}
                placeholder="Ex: Preciso de suporte urgente para cancelar meu plano..."
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 resize-none"
              />

              {/* Dynamic warning system (WOW factor micro-interaction) */}
              {hasStressKeyword && (
                <div className="mt-2.5 p-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl text-xs flex items-start gap-2 animate-pulse-slow">
                  <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Urgência Máxima Detectada!</strong> Termos de alta criticidade foram digitados. Seu ticket será triado na fila de prioridade emergencial.
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3.5 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                <span>{error}</span>
                {!isConnected && (
                  <button type="button" onClick={reconnect} className="ml-auto underline font-bold cursor-pointer">
                    Conectar WS
                  </button>
                )}
              </div>
            )}

            {/* Botão Enviar */}
            <button
              type="submit"
              disabled={submitting || !isConnected}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md hover:shadow-indigo-950"
            >
              {submitting ? 'Abrindo Canal...' : 'Enviar Solicitação de Suporte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. TELA DE CHAT EM TEMPO REAL DO CLIENTE (/client/chat/:ticketId)
// ==========================================
function ClientChatPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  
  const currentUser = useTicketStore((state) => state.currentUser);
  const tickets = useTicketStore((state) => state.tickets);
  const logout = useTicketStore((state) => state.logout);
  const { sendMessage, isConnected } = useWebSocket();

  const [text, setText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Segurança de rota: verifica se é cliente
  if (!currentUser || currentUser.role !== 'client') {
    return <Navigate to="/" replace />;
  }

  // Busca o ticket do cliente atual
  const ticket = tickets.find((t) => t.id === ticketId);

  // Auto-scroll para o final
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#080b11] text-slate-100 flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <Bot className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold">Solicitação não encontrada</h2>
          <p className="text-xs text-slate-400">Verifique a conexão com o servidor de dados.</p>
          <button onClick={() => navigate('/client/create')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold cursor-pointer">
            Criar Nova Solicitação
          </button>
        </div>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Envia mensagem via WS indicando que o remetente é o 'client'
    const success = sendMessage(ticket.id, 'client', text.trim());
    if (success) {
      setText('');
    }
  };

  const handleLeave = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      
      {/* Header do Chat */}
      <header className="border-b border-slate-900 bg-[#0c101b]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center text-emerald-400 font-bold">
            WS
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              Atendimento Técnico
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            </h2>
            <p className="text-xs text-slate-400">Designado: <strong>{ticket.operatorName}</strong></p>
          </div>
        </div>

        <button onClick={handleLeave} className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5 font-medium cursor-pointer">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </header>

      {/* Grid Principal */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 min-h-0">
        
        {/* Painel Lateral com Informações da Solicitação */}
        <aside className="md:col-span-1 border-r border-slate-900 bg-[#0c101b]/35 p-6 space-y-6 hidden md:block">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição do Problema</h3>
            <p className="text-sm text-slate-200 mt-2 p-3 bg-slate-900/60 border border-slate-800/40 rounded-xl leading-relaxed">
              "{ticket.subject}"
            </p>
          </div>

          <div className="space-y-3.5 text-xs text-slate-400 border-t border-slate-900 pt-5">
            <div className="flex justify-between">
              <span>Protocolo:</span>
              <span className="font-mono text-slate-300">{ticket.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-semibold ${
                ticket.status === 'open' ? 'text-sky-400' :
                ticket.status === 'in_progress' ? 'text-indigo-400' : 'text-emerald-400'
              }`}>
                {ticket.status === 'open' ? 'Aberto' :
                 ticket.status === 'in_progress' ? 'Em Progresso' : 'Resolvido'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Canal:</span>
              <span className="font-semibold text-slate-300">{ticket.channel}</span>
            </div>
          </div>
        </aside>

        {/* Painel do Chat */}
        <main className="md:col-span-3 flex flex-col bg-[#0a0d16]/10 min-h-0 relative">
          
          {/* Mensagem de boas-vindas do atendente designada */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {ticket.messages.map((msg) => {
              const isMe = msg.sender === 'client';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm relative ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                  }`}>
                    <div className={`text-[9px] font-bold uppercase mb-1 ${
                      isMe ? 'text-indigo-200' : 'text-indigo-400'
                    }`}>
                      {isMe ? 'Você (Cliente)' : ticket.operatorName}
                    </div>
                    <p className="leading-relaxed break-words">{msg.text}</p>
                    <span className="block text-[8px] text-right font-mono opacity-50 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input do Chat */}
          <div className="p-4 border-t border-slate-900 bg-slate-950/30">
            {ticket.status === 'resolved' ? (
              <div className="text-center p-3 bg-emerald-950/15 border border-emerald-900/30 text-emerald-400 rounded-xl text-xs flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Este ticket de suporte foi resolvido e finalizado pelo especialista.
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Mensagem para ${ticket.operatorName}...`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 px-4 py-3 text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md hover:shadow-indigo-950"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}

// ==========================================
// 4. PAINEL DE CONTROLE DO ATENDENTE (/operator/dashboard)
// ==========================================
function OperatorDashboardPage() {
  const navigate = useNavigate();
  const currentUser = useTicketStore((state) => state.currentUser);
  const tickets = useTicketStore((state) => state.tickets);
  const triageLogs = useTicketStore((state) => state.triageLogs);
  const logout = useTicketStore((state) => state.logout);
  const { isConnected, reconnect } = useWebSocket();

  // Estados locais de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'WhatsApp' | 'Webchat'>('all');

  // Segurança de rota: verifica se é atendente
  if (!currentUser || currentUser.role !== 'agent') {
    return <Navigate to="/" replace />;
  }

  // Estatísticas de Fila baseadas nos dados reais persistidos
  const metrics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'open').length;
    const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
    const resolved = tickets.filter((t) => t.status === 'resolved').length;
    
    const active = tickets.filter((t) => t.status !== 'resolved');
    const avgStress = active.length > 0
      ? (active.reduce((acc, t) => acc + t.stressLevel, 0) / active.length).toFixed(1)
      : '0.0';

    const criticalCount = tickets.filter((t) => t.priority === 'critical' && t.status !== 'resolved').length;

    return { total, open, inProgress, resolved, avgStress, criticalCount };
  }, [tickets]);

  // Filtra os tickets para exibição
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

  const handleLeave = () => {
    logout();
    navigate('/');
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

  const getStressProgressBar = (level: number) => {
    const percentage = (level / 5) * 100;
    let color = 'bg-slate-500';
    if (level === 5) color = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
    else if (level >= 3) color = 'bg-amber-500';
    else color = 'bg-emerald-500';

    return (
      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="border-b border-slate-900 bg-[#0c101b]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              TriageHub <span className="text-xs px-2 py-0.5 font-normal bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">Persistência SQLite</span>
            </h1>
            <p className="text-xs text-slate-400">Atendente logado: <strong>{currentUser.name}</strong></p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div>
            {isConnected ? (
              <span className="flex items-center text-xs text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-800/40 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                Servidor Conectado
              </span>
            ) : (
              <button onClick={reconnect} className="flex items-center text-xs text-red-400 hover:text-red-300 bg-red-950/30 px-3 py-1.5 rounded-full border border-red-800/40 font-medium cursor-pointer">
                <WifiOff className="w-3.5 h-3.5 mr-2 animate-pulse" /> Reconectar WS
              </button>
            )}
          </div>
          <button onClick={handleLeave} className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      {/* Métricas */}
      <section className="px-6 pt-6 grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Fila Acumulada</p>
            <p className="text-2xl font-bold text-white mt-1">{metrics.total}</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-lg text-slate-400"><MessageSquare className="w-5 h-5" /></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Aguardando Triagem</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">{metrics.open}</p>
          </div>
          <div className="p-3 bg-sky-950/20 rounded-lg text-sky-400"><Clock className="w-5 h-5" /></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Críticos Triados</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{metrics.criticalCount}</p>
          </div>
          <div className="p-3 bg-red-950/20 rounded-lg text-red-400"><AlertOctagon className="w-5 h-5" /></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Em Atendimento</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{metrics.inProgress}</p>
          </div>
          <div className="p-3 bg-indigo-950/20 rounded-lg text-indigo-400"><Activity className="w-5 h-5" /></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Atendidos (Resolvidos)</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{metrics.resolved}</p>
          </div>
          <div className="p-3 bg-emerald-950/20 rounded-lg text-emerald-400"><CheckCircle className="w-5 h-5" /></div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">Média Estresse Fila</p>
            <span className="text-xs font-bold text-slate-200">{metrics.avgStress}/5</span>
          </div>
          <div className="mt-2.5">{getStressProgressBar(Math.round(Number(metrics.avgStress)))}</div>
        </div>
      </section>

      {/* Grid do Dashboard */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-6 min-h-0">
        
        {/* Coluna 1: Fila de Tickets */}
        <section className="lg:col-span-8 flex flex-col glass-panel rounded-2xl overflow-hidden border border-slate-900">
          <div className="p-4 border-b border-slate-900 bg-[#0b0f19]/50 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por cliente ou assunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/60 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg p-1.5"
              >
                <option value="all">Todos os Status</option>
                <option value="open">Abertos</option>
                <option value="in_progress">Em Progresso</option>
                <option value="resolved">Resolvidos</option>
              </select>

              <select
                value={channelFilter}
                onChange={(e: any) => setChannelFilter(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg p-1.5"
              >
                <option value="all">Todos os Canais</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Webchat">Webchat</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
              Fila de Suporte Ativa ({filteredTickets.length})
            </div>

            {filteredTickets.length === 0 ? (
              <div className="text-center py-16 text-slate-500">Nenhum ticket pendente.</div>
            ) : (
              filteredTickets.map((ticket) => {
                const isDesignatedToMe = ticket.operatorName.includes(currentUser.name);
                
                return (
                  <button
                    key={ticket.id}
                    onClick={() => navigate(`/operator/chat/${ticket.id}`)}
                    className="w-full text-left p-4 bg-slate-900/20 border border-slate-900/60 hover:border-slate-800/80 rounded-xl flex flex-col gap-2 relative transition-all hover:bg-slate-900/40"
                  >
                    {/* Urgência emergencial */}
                    {ticket.priority === 'critical' && ticket.status !== 'resolved' && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-red-500 rounded-r-md animate-pulse"></div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-200">
                        {ticket.customerName}{' '}
                        {isDesignatedToMe && (
                          <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold ml-1.5">
                            Meu Atendimento
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(ticket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-normal line-clamp-1">"{ticket.subject}"</p>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="flex items-center space-x-1.5">
                        {getPriorityBadge(ticket.priority)}
                        <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700/50 px-2 py-0.5 rounded-md font-medium">
                          {ticket.channel}
                        </span>
                        <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700/50 px-2 py-0.5 rounded-md">
                          Designado: {ticket.operatorName.replace('Técnico ', '').replace('Técnica ', '')}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Estresse: {ticket.stressLevel}/5</span>
                    </div>

                    <div className="w-full mt-0.5">{getStressProgressBar(ticket.stressLevel)}</div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Coluna 2: Logs de Triagem */}
        <section className="lg:col-span-4 flex flex-col glass-panel rounded-2xl overflow-hidden border border-slate-900">
          <div className="p-4 border-b border-slate-900 bg-[#0b0f19]/50 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-400" /> Histórico Logs IA
            </h3>
            <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-widest animate-pulse-slow">
              Tempo Real
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[10px]">
            {triageLogs.length === 0 ? (
              <div className="py-20 text-slate-600 text-center text-[10px]">Aguardando atividades do SQLite...</div>
            ) : (
              triageLogs.map((log) => {
                const isStress = log.stressLevel === 5;
                return (
                  <div key={log.id} className={`p-3 rounded-lg border ${isStress ? 'bg-red-950/10 border-red-900/30' : 'bg-slate-900/20 border-slate-800/40'}`}>
                    <div className="flex justify-between text-[9px] mb-1.5 font-bold">
                      <span className={isStress ? 'text-red-400' : 'text-slate-400'}>
                        {isStress ? '⚠️ ALERTA URGENTE' : 'ℹ️ TRIADO'}
                      </span>
                      <span className="text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="space-y-1 text-slate-300">
                      <div>Cliente: {log.customerName}</div>
                      <div className="line-clamp-1">Assunto: "{log.subject}"</div>
                      {log.detectedKeywords.length > 0 && (
                        <div>
                          Keywords: <span className="text-red-400 bg-red-950/30 px-1 py-0.5 rounded">{log.detectedKeywords.join(', ')}</span>
                        </div>
                      )}
                      <div className="pt-1.5 mt-1.5 border-t border-slate-950 flex justify-between font-bold">
                        <span>PR: {log.priority.toUpperCase()}</span>
                        <span>ESTRESSE: {log.stressLevel}/5</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

// ==========================================
// 5. CHAT DE ATENDIMENTO DO ATENDENTE (/operator/chat/:ticketId)
// ==========================================
function OperatorChatPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const currentUser = useTicketStore((state) => state.currentUser);
  const tickets = useTicketStore((state) => state.tickets);
  const { sendMessage, resolveTicket } = useWebSocket();

  const [text, setText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Segurança de rota: verifica se é atendente
  if (!currentUser || currentUser.role !== 'agent') {
    return <Navigate to="/" replace />;
  }

  // Busca o ticket selecionado na store
  const ticket = tickets.find((t) => t.id === ticketId);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#080b11] text-slate-100 flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <Bot className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold">Ticket não encontrado</h2>
          <p className="text-xs text-slate-400">Verifique se o ticket ainda existe na base SQLite.</p>
          <button onClick={() => navigate('/operator/dashboard')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold cursor-pointer">
            Voltar ao Painel
          </button>
        </div>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Envia mensagem indicando que o remetente é o operador ('agent')
    const success = sendMessage(ticket.id, 'agent', text.trim());
    if (success) {
      setText('');
    }
  };

  const handleResolve = () => {
    resolveTicket(ticket.id);
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      {/* Header do Chat */}
      <header className="border-b border-slate-900 bg-[#0c101b]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/operator/dashboard')} className="p-2 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              Atendendo: {ticket.customerName}
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                ticket.status === 'open' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                ticket.status === 'in_progress' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {ticket.status === 'open' ? 'Em Espera' :
                 ticket.status === 'in_progress' ? 'Em Atendimento' : 'Resolvido'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">Canal: <strong>{ticket.channel}</strong> | Operador Designado: <strong>{ticket.operatorName}</strong></p>
          </div>
        </div>

        {ticket.status !== 'resolved' && (
          <button
            onClick={handleResolve}
            className="text-xs px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-md hover:shadow-emerald-950"
          >
            <Check className="w-3.5 h-3.5" /> Finalizar Atendimento
          </button>
        )}
      </header>

      {/* Grid Principal */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 min-h-0">
        {/* Painel Informações Fila */}
        <aside className="md:col-span-1 border-r border-slate-900 bg-[#0c101b]/35 p-6 space-y-6 hidden md:block">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição Inicial do Cliente</h3>
            <p className="text-sm text-slate-200 mt-2 p-3 bg-slate-900/60 border border-slate-800/40 rounded-xl leading-relaxed">
              "{ticket.subject}"
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-400 border-t border-slate-900 pt-5">
            <div className="flex justify-between">
              <span>Prioridade de Triagem:</span>
              <span className="font-bold text-slate-200 uppercase">{ticket.priority}</span>
            </div>
            <div className="flex justify-between">
              <span>Estresse do Cliente:</span>
              <span className="font-bold text-slate-200">{ticket.stressLevel}/5</span>
            </div>
            <div className="flex justify-between">
              <span>Protocolo SQLite:</span>
              <span className="font-mono text-slate-300">{ticket.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </aside>

        {/* Painel do Chat */}
        <main className="md:col-span-3 flex flex-col bg-[#0a0d16]/10 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {ticket.messages.map((msg) => {
              const isMe = msg.sender === 'agent';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm relative ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                  }`}>
                    <div className={`text-[9px] font-bold uppercase mb-1 ${
                      isMe ? 'text-indigo-200' : 'text-indigo-400'
                    }`}>
                      {isMe ? `${currentUser.name} (Atendente)` : ticket.customerName}
                    </div>
                    <p className="leading-relaxed break-words">{msg.text}</p>
                    <span className="block text-[8px] text-right font-mono opacity-50 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Box */}
          <div className="p-4 border-t border-slate-900 bg-slate-950/30">
            {ticket.status === 'resolved' ? (
              <div className="text-center p-3 bg-emerald-950/15 border border-emerald-900/30 text-emerald-400 rounded-xl text-xs flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Este ticket de suporte já foi resolvido e finalizado na base de dados.
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Responder a ${ticket.customerName}...`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 px-4 py-3 text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md hover:shadow-indigo-950"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ==========================================
// 6. COMPONENTE PRINCIPAL COM HASHROUTER (App)
// ==========================================
export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Rota 1: Login e Identificação */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Rota 2: Formulário de Solicitação de Suporte */}
        <Route path="/client/create" element={<ClientCreatePage />} />
        
        {/* Rota 3: Chat em Tempo Real do Cliente */}
        <Route path="/client/chat/:ticketId" element={<ClientChatPage />} />
        
        {/* Rota 4: Painel de Controle do Atendente */}
        <Route path="/operator/dashboard" element={<OperatorDashboardPage />} />
        
        {/* Rota 5: Chat de Atendimento do Atendente */}
        <Route path="/operator/chat/:ticketId" element={<OperatorChatPage />} />
        
        {/* Fallback de rotas inválidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
