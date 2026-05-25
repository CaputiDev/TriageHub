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
  Activity,
  CheckCircle,
  WifiOff,
  Search,
  Bot,
  AlertOctagon,
  Sparkles,
  User,
  ArrowLeft,
  LogOut,
  FileText,
  Check,
  Lock,
  Mail,
  AlertTriangle,
  ChevronDown,
  X
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

const getOperatorColorClass = (name: string) => {
  const colors = [
    'text-amber-400',
    'text-emerald-400',
    'text-pink-400',
    'text-cyan-400',
    'text-violet-400',
    'text-rose-400',
    'text-teal-400',
    'text-sky-400'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// ==========================================
// 1. TELA DE LOGIN & CADASTRO SEGURE (/)
// ==========================================
function LoginPage() {
  const navigate = useNavigate();
  const { authenticate, isConnected, reconnect } = useWebSocket();
  
  // Estados Locais do Formulário
  const [isSignUp, setIsSignUp] = useState(false); // Toggle entre Login e Cadastro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [funcao, setFuncao] = useState('suporte_ti_1');
  const [role, setRole] = useState<'client' | 'agent'>('client');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Por favor, insira o e-mail e a senha.');
      return;
    }
    if (isSignUp && (!firstName.trim() || !lastName.trim())) {
      setError('Por favor, insira o nome e o sobrenome para cadastro.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Envia requisição via WebSocket e espera a Promessa resolver
      const user = await authenticate(
        email.trim().toLowerCase(),
        password,
        isSignUp ? firstName.trim() : undefined,
        isSignUp ? lastName.trim() : undefined,
        isSignUp ? role : undefined,
        isSignUp && role === 'agent' ? funcao : undefined,
        isSignUp
      );

      setLoading(false);
      
      // Redireciona de acordo com o papel do usuário logado
      if (user.role === 'client') {
        navigate('/client/create');
      } else {
        navigate('/operator/dashboard');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Erro ao tentar autenticar. Verifique a conexão.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Glow de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-900 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mb-3">
            <Sparkles className="w-8 h-8 text-indigo-400 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TriageHub Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Atendimento e Suporte Seguro em Tempo Real</p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {/* Nome e Sobrenome (Apenas modo cadastro) */}
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nome
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Seu nome..."
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200"
                  />
                  <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Sobrenome
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Sobrenome..."
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-4 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* E-mail */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Endereço de E-mail
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="Ex: seuemail@suporte.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200"
              />
              <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200"
              />
              <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Perfil e Cargo (Apenas Modo Cadastro) */}
          {isSignUp && (
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Escolha seu Cargo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    role === 'client'
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-400'
                      : 'bg-slate-900/30 border-slate-900 text-slate-500 hover:border-slate-800'
                  }`}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setRole('agent')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    role === 'agent'
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-400'
                      : 'bg-slate-900/30 border-slate-900 text-slate-500 hover:border-slate-800'
                  }`}
                >
                  Atendente
                </button>
              </div>
            </div>
          )}

          {/* Função do Atendente (Apenas Atendente e Cadastro) */}
          {isSignUp && role === 'agent' && (
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Função do Atendente
              </label>
              <div className="relative">
                <select
                  value={funcao}
                  onChange={(e) => setFuncao(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 appearance-none cursor-pointer"
                >
                  <option value="suporte_ti_1">🛡️ Suporte de TI 1</option>
                  <option value="suporte_ti_2">⚡ Suporte de TI 2</option>
                  <option value="suporte_ti_3">⚙️ Suporte de TI 3</option>
                  <option value="suporte_juridico">⚖️ Suporte Jurídico</option>
                  <option value="analista_consumidor">👤 Analista de Suporte ao Consumidor</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botão Principal */}
          <button
            type="submit"
            disabled={loading || !isConnected}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md hover:shadow-indigo-950 text-sm"
          >
            {loading ? 'Aguarde, autenticando...' : isSignUp ? 'Confirmar Cadastro' : 'Efetuar Login Seguro'}
          </button>
        </form>

        {/* Toggle de Modo Login/Registro */}
        <div className="mt-6 text-center border-t border-slate-900 pt-4">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer bg-transparent border-0"
          >
            {isSignUp ? 'Já tem uma conta? Faça Login' : 'Ainda não tem conta? Cadastre-se'}
          </button>
        </div>

        {/* Status do WebSocket */}
        {!isConnected && (
          <div className="mt-4 p-2 bg-red-950/15 border border-red-900/20 text-red-400 rounded-lg text-[10px] flex items-center justify-between">
            <span className="flex items-center gap-1"><WifiOff className="w-3 h-3 animate-pulse" /> Servidor Offline</span>
            <button onClick={reconnect} className="underline font-bold cursor-pointer">Reconectar</button>
          </div>
        )}

      </div>
    </div>
  );
}

// ==========================================
// 2. QUESTIONÁRIO DE SUPORTE EXPANDIDO (/client/create)
// ==========================================
function ClientCreatePage() {
  const navigate = useNavigate();
  const currentUser = useTicketStore((state) => state.currentUser);
  const { createTicket, isConnected } = useWebSocket();

  // Estados locais do questionário expandido (5 perguntas críticas!)
  const [category, setCategory] = useState('Dúvidas & Configurações');
  const [subject, setSubject] = useState(''); // Título resumido
  const [description, setDescription] = useState(''); // Descrição completa explicativa
  const [declaredUrgency, setDeclaredUrgency] = useState<number>(3); // Urgência autodeclarada pelo cliente (1 a 5)
  const [channel, setChannel] = useState<'WhatsApp' | 'Webchat'>('WhatsApp');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Segurança de rota
  if (!currentUser || currentUser.role !== 'client') {
    return <Navigate to="/" replace />;
  }

  // Palavras de estresse para exibição do alerta reativo visual
  const STRESS_KEYWORDS = ['procon', 'cancelar', 'urgente', 'ruim', 'advogado'];
  const hasStressKeyword = STRESS_KEYWORDS.some(word => description.toLowerCase().includes(word));

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Por favor, informe o título resumido do seu problema.');
      return;
    }
    if (!description.trim()) {
      setError('Por favor, digite a descrição detalhada do seu problema para a nossa triagem.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Envia o questionário expandido ao backend via WebSocket Promise
      const newTicket = await createTicket(
        currentUser.name,
        currentUser.email,
        channel,
        category,
        subject.trim(),
        description.trim(),
        declaredUrgency
      );
      
      setSubmitting(false);
      // Navega imediatamente para a rota de chat do ticket criado
      navigate(`/client/chat/${newTicket.id}`);
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar ticket. Tente novamente.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-900 bg-[#0c101b]/95 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h1 className="text-sm font-bold text-white">Central do Cliente TriageHub</h1>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Logado como: <strong>{currentUser.name}</strong> ({currentUser.email})</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 my-4">
        <div className="w-full max-w-2xl glass-panel p-8 rounded-3xl border border-slate-900 shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> Abertura de Ticket Expandida
            </h2>
            <p className="text-xs text-slate-400 mt-1">Responda ao questionário detalhado abaixo para fornecer o máximo de contexto ao especialista.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Linha 1: Título Resumido e Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  1. Título do Problema (Resumo)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Erro ao processar fatura do cartão"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  2. Categoria do Problema
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 cursor-pointer"
                >
                  <option value="Dúvidas & Configurações">Dúvidas & Configurações</option>
                  <option value="Técnico (Hardware/Software)">Técnico (Hardware/Software)</option>
                  <option value="Financeiro & Cobrança">Financeiro & Cobrança</option>
                  <option value="Reclamações & Cancelamento">Reclamações & Cancelamento</option>
                </select>
              </div>
            </div>

            {/* Linha 2: Urgência Declarada e Canal Preferencial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  3. Nível de Urgência (Sua Percepção)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const label = level === 1 ? 'Baixo' : level === 3 ? 'Moderado' : level === 5 ? 'Crítico' : '';
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDeclaredUrgency(level)}
                        className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                          declaredUrgency === level
                            ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-400'
                            : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        <span>{level}</span>
                        {label && <span className="text-[8px] opacity-75 font-normal">{label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  4. Canal Preferencial
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('WhatsApp')}
                    className={`flex-1 py-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                      channel === 'WhatsApp'
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('Webchat')}
                    className={`flex-1 py-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                      channel === 'Webchat'
                        ? 'bg-sky-950/20 border-sky-500/40 text-sky-400'
                        : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    Webchat
                  </button>
                </div>
              </div>
            </div>

            {/* Linha 3: Descrição Detalhada */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                5. Descrição Detalhada do Caso (Explique o que aconteceu)
              </label>
              <textarea
                rows={5}
                placeholder="Por favor, relate em detalhes o ocorrido para analisarmos sua solicitação com o motor de triagem inteligente..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 resize-none"
              />

              {/* Alerta de Urgência dinâmico reativo */}
              {hasStressKeyword && (
                <div className="mt-2.5 p-3.5 bg-red-950/20 border border-red-900/30 text-red-400 rounded-2xl text-xs flex items-start gap-2.5 animate-pulse-slow">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
                  <div>
                    <strong className="block text-red-300">⚠️ Triagem IA Prioritária Ativada!</strong>
                    Detectamos termos altamente urgentes em seu relato. Sua solicitação será encaminhada com prioridade crítica no topo da fila dos especialistas.
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={submitting || !isConnected}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md hover:shadow-indigo-950 text-sm"
            >
              {submitting ? 'Enviando Solicitação...' : 'Criar Solicitação e Entrar no Atendimento'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. CHAT EM TEMPO REAL DO CLIENTE (/client/chat/:ticketId)
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

  // Segurança de rota
  if (!currentUser || currentUser.role !== 'client') {
    return <Navigate to="/" replace />;
  }

  // Busca o ticket associado
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
          <h2 className="text-lg font-bold">Solicitação não encontrada</h2>
          <p className="text-xs text-slate-400">Verifique a sua conexão com o servidor.</p>
          <button onClick={() => navigate('/client/create')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold cursor-pointer">
            Voltar ao Formulário
          </button>
        </div>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

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
      <header className="border-b border-slate-900 bg-[#0c101b]/95 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center text-emerald-400 font-bold">
            WS
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              Atendimento em Tempo Real
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            </h2>
            <p className="text-xs text-slate-400">Designado: <strong>{ticket.operatorName}</strong></p>
          </div>
        </div>

        <button onClick={handleLeave} className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5 font-medium cursor-pointer">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </header>

      {/* Grid Principal com Informações Expandidas do Questionário */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 min-h-0">
        
        {/* Painel Lateral com Informações Expandidas do Pedido */}
        <aside className="md:col-span-1 border-r border-slate-900 bg-[#0c101b]/35 p-6 space-y-6 hidden md:block overflow-y-auto">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Dados da Solicitação</h3>
            
            <div className="space-y-4">
              {/* Categoria */}
              <div>
                <span className="text-[10px] text-slate-500 block">Categoria do Pedido:</span>
                <span className="inline-block mt-1 px-2.5 py-1 rounded bg-indigo-950/45 border border-indigo-900/40 text-xs font-semibold text-indigo-400">
                  {ticket.category || 'Não Informada'}
                </span>
              </div>

              {/* Urgência Declarada pelo Cliente */}
              <div>
                <span className="text-[10px] text-slate-500 block">Urgência Autodeclarada:</span>
                <span className="inline-block mt-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                  {ticket.declaredUrgency ? `${ticket.declaredUrgency}/5` : 'Não Declarada'}
                </span>
              </div>

              {/* Título Resumido */}
              <div>
                <span className="text-[10px] text-slate-500 block">Resumo do Caso:</span>
                <span className="font-semibold text-xs text-slate-200 block mt-0.5 leading-tight">{ticket.subject}</span>
              </div>

              {/* Descrição Detalhada */}
              <div>
                <span className="text-[10px] text-slate-500 block">Relato Completo:</span>
                <p className="text-xs text-slate-400 mt-1 p-3 bg-slate-950/50 border border-slate-900 rounded-xl leading-relaxed max-h-[220px] overflow-y-auto font-normal">
                  "{ticket.description || ticket.subject}"
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-slate-400 border-t border-slate-900 pt-5">
            <div className="flex justify-between">
              <span>ID do Protocolo:</span>
              <span className="font-mono text-slate-300">{ticket.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Canal:</span>
              <span className="font-semibold text-slate-300">{ticket.channel}</span>
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
          </div>
        </aside>

        {/* Painel do Chat */}
        <main className="md:col-span-3 flex flex-col bg-[#0a0d16]/10 min-h-0">
          
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
                      isMe ? 'text-indigo-200' : getOperatorColorClass(msg.senderName || 'Atendente')
                    }`}>
                      {isMe ? 'Você (Cliente)' : (msg.senderName || 'Atendente')}
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

          {/* Chat Input */}
          <div className="p-4 border-t border-slate-900 bg-slate-950/30">
            {ticket.status === 'resolved' ? (
              <div className="text-center p-3 bg-emerald-950/15 border border-emerald-900/30 text-emerald-400 rounded-xl text-xs flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Este ticket foi resolvido e finalizado pelo especialista.
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

function OperatorDashboardPage() {
  const navigate = useNavigate();
  const currentUser = useTicketStore((state) => state.currentUser);
  const tickets = useTicketStore((state) => state.tickets);
  const triageLogs = useTicketStore((state) => state.triageLogs);
  const logout = useTicketStore((state) => state.logout);
  const { 
    isConnected, 
    reconnect, 
    getTicket, 
    acceptTicket, 
    rejectTicket, 
    sendMessage, 
    resolveTicket 
  } = useWebSocket();

  // Filtros locais da barra lateral
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'WhatsApp' | 'Webchat'>('all');

  // Busca de Protocolo ID (8 caracteres)
  const [protocolId, setProtocolId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [protocolError, setProtocolError] = useState('');

  // Estados locais do Workspace Integrado
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [chatText, setChatText] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll das mensagens no chat ativo
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, tickets.find(t => t.id === activeChatId)?.messages]);

  // Segurança de Rota
  if (!currentUser || currentUser.role !== 'agent') {
    return <Navigate to="/" replace />;
  }

  // Métricas do Dashboard (usadas na Gaveta Retrátil)
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

  // Separação de Solicitações e Chats designados
  const pendingRequests = useMemo(() => {
    // Apenas solicitações pendentes de aceite encaminhadas para este atendente
    return tickets.filter((t) => t.status === 'pending_acceptance' && t.operatorId === currentUser.id);
  }, [tickets, currentUser.id]);

  const activeChats = useMemo(() => {
    // Tickets em progresso ou resolvidos designados a este atendente
    return tickets.filter((t) => t.status !== 'pending_acceptance' && t.operatorId === currentUser.id);
  }, [tickets, currentUser.id]);

  // Filtra as conversas ativas para a barra lateral
  const filteredActiveChats = useMemo(() => {
    return activeChats.filter((ticket) => {
      const matchesSearch =
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.category && ticket.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesChannel = channelFilter === 'all' || ticket.channel === channelFilter;

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [activeChats, searchTerm, statusFilter, channelFilter]);

  const handleProtocolSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = protocolId.trim();

    const protocolRegex = /^[0-9a-fA-F]{8}$/;
    if (!protocolRegex.test(cleanId)) {
      setProtocolError('O ID do protocolo deve conter exatamente 8 caracteres hexadecimais (ex: 83D6F392).');
      return;
    }

    setIsSearching(true);
    setProtocolError('');

    try {
      const ticket = await getTicket(cleanId);
      setIsSearching(false);
      setProtocolId('');
      // Seleciona o chat e limpa preview de solicitação se houver
      setActiveChatId(ticket.id);
      setActiveRequestId(null);
    } catch (err: any) {
      setIsSearching(false);
      setProtocolError(err.message || 'Erro ao buscar o protocolo informado.');
    }
  };

  const handleAccept = async (ticketId: string) => {
    setIsAccepting(true);
    setRequestError('');
    try {
      await acceptTicket(ticketId);
      setIsAccepting(false);
      setActiveRequestId(null);
      setActiveChatId(ticketId);
    } catch (err: any) {
      setIsAccepting(false);
      setRequestError(err.message || 'Erro ao aceitar o atendimento.');
    }
  };

  const handleReject = async (ticketId: string) => {
    setIsRejecting(true);
    setRequestError('');
    try {
      await rejectTicket(ticketId);
      setIsRejecting(false);
      setActiveRequestId(null);
    } catch (err: any) {
      setIsRejecting(false);
      setRequestError(err.message || 'Erro ao recusar o atendimento.');
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim() || !activeChatId) return;

    sendMessage(activeChatId, 'agent', chatText.trim());
    setChatText('');
  };

  const handleLeave = () => {
    logout();
    navigate('/');
  };

  const selectedChatTicket = activeChatId ? tickets.find(t => t.id === activeChatId) : null;
  const selectedRequestTicket = activeRequestId ? tickets.find(t => t.id === activeRequestId) : null;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 text-red-400 border border-red-800/80 animate-pulse-slow">
            Crítico
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/50">
            Alto
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950/50 text-indigo-400 border border-indigo-800/30">
            Médio
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700/50">
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
      <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <header className="border-b border-slate-900 bg-[#0c101b]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              TriageHub <span className="text-xs px-2 py-0.5 font-normal bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">Painel de Triagem</span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center flex-wrap gap-1.5 mt-0.5">
              Atendente: <strong>{currentUser.name}</strong> ({currentUser.email})
              {currentUser.codigoIdentificacao && (
                <span className="font-mono text-[9px] bg-slate-900 px-1.5 py-0.5 border border-slate-800 rounded text-indigo-400 font-bold ml-1">
                  ID: {currentUser.codigoIdentificacao}
                </span>
              )}
              {currentUser.funcao && (
                <span className="text-[9px] bg-indigo-950/40 px-1.5 py-0.5 border border-indigo-900/20 rounded text-slate-300 ml-1 font-bold">
                  {getFuncaoLabel(currentUser.funcao)}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 px-3 py-1.5 rounded-full border border-indigo-800/40 font-medium cursor-pointer transition-all hover:bg-indigo-950/60 shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5" /> Ver Métricas & Logs
          </button>

          <div>
            {isConnected ? (
              <span className="flex items-center text-xs text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-800/40 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
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

      {/* Workspace de Chat Integrado (Layout Dividido de Duas Colunas) */}
      <main className="flex-1 flex min-h-0 relative overflow-hidden bg-[#080b11]">
        
        {/* ====================================================
            BARRA LATERAL ESQUERDA (Solicitações & Conversas)
            ==================================================== */}
        <section className="w-[350px] md:w-[380px] bg-slate-950/40 border-r border-slate-900 flex flex-col h-full shrink-0 overflow-hidden">
          
          {/* 1. Painel de Solicitações Pendentes (Topo Esquerdo) */}
          <div className="p-4 border-b border-slate-900 bg-slate-950/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" /> Solicitações Recebidas
              </span>
              {pendingRequests.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-extrabold animate-pulse">
                  {pendingRequests.length} pendente(s)
                </span>
              )}
            </h3>
            
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {pendingRequests.length === 0 ? (
                <p className="text-slate-600 text-xs italic py-2 text-center">Nenhuma solicitação aguardando aceite.</p>
              ) : (
                pendingRequests.map((req) => {
                  const isSelected = activeRequestId === req.id;
                  return (
                    <button
                      key={req.id}
                      onClick={() => {
                        setActiveRequestId(req.id);
                        setActiveChatId(null);
                        setRequestError('');
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-950/20'
                          : 'bg-amber-950/5 border-amber-950/25 hover:border-amber-950/50 hover:bg-amber-950/10'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          {req.customerName}
                        </span>
                        <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                          {req.priority === 'critical' ? 'Crítico' : req.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-normal line-clamp-1">"{req.subject}"</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Campo Rápido de Acesso de Segurança por Protocolo (Alfanumérico 8 Caracteres) */}
          <div className="p-4 border-b border-slate-900 bg-slate-950/40">
            <form onSubmit={handleProtocolSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Acessar protocolo (ex: 83D6F392)..."
                  value={protocolId}
                  onChange={(e) => {
                    setProtocolId(e.target.value);
                    setProtocolError('');
                  }}
                  className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-900/60 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              </div>
              <button
                type="submit"
                disabled={isSearching || !protocolId.trim()}
                className="px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow"
              >
                {isSearching ? '...' : 'Ir'}
              </button>
            </form>
            {protocolError && (
              <p className="text-[10px] text-red-400 font-semibold mt-1.5 leading-tight">{protocolError}</p>
            )}
          </div>

          {/* 3. Lista de Filtros e Conversas Ativas */}
          <div className="p-4 border-b border-slate-900 bg-slate-950/20 space-y-2 flex flex-col shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar por nome/assunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-900/60 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 text-[10px] rounded-lg p-1.5 focus:outline-none"
              >
                <option value="all">Filtro status (Todos)</option>
                <option value="open">Abertos</option>
                <option value="in_progress">Em Progresso</option>
                <option value="resolved">Resolvidos</option>
              </select>

              <select
                value={channelFilter}
                onChange={(e: any) => setChannelFilter(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 text-[10px] rounded-lg p-1.5 focus:outline-none"
              >
                <option value="all">Filtro canal (Todos)</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Webchat">Webchat</option>
              </select>
            </div>
          </div>

          {/* Listagem de Chats Designados */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
              Conversas Ativas ({filteredActiveChats.length})
            </div>

            {filteredActiveChats.length === 0 ? (
              <div className="text-center py-12 text-slate-600 text-xs italic">Nenhum atendimento na fila.</div>
            ) : (
              filteredActiveChats.map((ticket) => {
                const isSelected = activeChatId === ticket.id;
                
                // Extrai última mensagem/resposta
                const lastMsg = ticket.messages[ticket.messages.length - 1];
                const lastTextSnippet = lastMsg 
                  ? (lastMsg.sender === 'agent' ? 'Você: ' : '') + lastMsg.text
                  : ticket.subject;
                const lastText = lastTextSnippet.length > 36 ? lastTextSnippet.slice(0, 36) + '...' : lastTextSnippet;
                const lastTime = lastMsg 
                  ? new Date(lastMsg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <button
                    key={ticket.id}
                    onClick={() => {
                      setActiveChatId(ticket.id);
                      setActiveRequestId(null);
                    }}
                    className={`w-full text-left p-3.5 border rounded-xl flex flex-col gap-1.5 relative transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/20 border-indigo-500/80 shadow-md shadow-indigo-950/20'
                        : 'bg-slate-900/20 border-slate-900 hover:border-slate-800 hover:bg-slate-900/40'
                    }`}
                  >
                    {/* Urgência Crítica */}
                    {ticket.priority === 'critical' && ticket.status !== 'resolved' && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-red-500 rounded-r-md animate-pulse"></div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-200 truncate pr-2 max-w-[180px]">
                        {ticket.customerName}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono shrink-0">
                        {lastTime || new Date(ticket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-normal line-clamp-1 italic shrink-0">
                      "{lastText}"
                    </p>

                    <div className="flex items-center justify-between gap-1 mt-1 shrink-0">
                      <div className="flex items-center space-x-1.5">
                        {getPriorityBadge(ticket.priority)}
                        <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700/50 px-1.5 py-0.5 rounded font-medium">
                          {ticket.channel}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${
                          ticket.status === 'in_progress' 
                            ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30'
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                        }`}>
                          {ticket.status === 'in_progress' ? 'Em Progresso' : 'Resolvido'}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500">Estresse: {ticket.stressLevel}/5</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* ====================================================
            COLUNA CENTRAL (Visualização de Chat ou Solicitação)
            ==================================================== */}
        <section className="flex-1 flex flex-col bg-[#080a0f] h-full overflow-hidden relative">
          
          {/* CASO A: Preview de Nova Solicitação Pendente */}
          {selectedRequestTicket ? (
            <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
              <div className="w-full max-w-xl glass-panel p-8 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 animate-pulse"></div>
                
                <div className="flex justify-between items-start mb-6 border-b border-slate-900 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-500" /> Nova Solicitação Recebida
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">ID do Protocolo: <strong className="font-mono text-slate-400">{selectedRequestTicket.id.slice(0, 8).toUpperCase()}</strong></p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    Aguardando Aceite
                  </span>
                </div>

                {/* Detalhes do Cliente */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Cliente</span>
                    <span className="text-sm font-bold text-slate-200 block mt-0.5">{selectedRequestTicket.customerName}</span>
                  </div>
                  <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Canal de Origem</span>
                    <span className="text-sm font-bold text-slate-200 block mt-0.5">{selectedRequestTicket.channel}</span>
                  </div>
                </div>

                {/* Detalhes da Triagem IA */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Prioridade IA</span>
                    <div className="mt-1">{getPriorityBadge(selectedRequestTicket.priority)}</div>
                  </div>
                  <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Nível de Estresse</span>
                    <span className="text-sm font-bold text-slate-200 mt-1">{selectedRequestTicket.stressLevel}/5</span>
                  </div>
                  <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Urgência Declarada</span>
                    <span className="text-sm font-bold text-slate-200 mt-1">{selectedRequestTicket.declaredUrgency || 0}/5</span>
                  </div>
                </div>

                {/* Relato do Caso */}
                <div className="mb-6 space-y-2">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Relato do Caso</span>
                  <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl">
                    <h4 className="text-xs font-bold text-slate-200 mb-2">Assunto: "{selectedRequestTicket.subject}"</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal overflow-y-auto max-h-[140px]">
                      "{selectedRequestTicket.description}"
                    </p>
                  </div>
                </div>

                {/* Alerta de erro */}
                {requestError && (
                  <div className="mb-6 p-3 bg-red-950/15 border border-red-900/30 text-red-400 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {requestError}
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-4">
                  <button
                    onClick={() => handleReject(selectedRequestTicket.id)}
                    disabled={isRejecting || isAccepting}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-50 text-slate-300 font-semibold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2 hover:text-red-400 font-bold"
                  >
                    {isRejecting ? 'Encaminhando...' : 'Recusar / Encaminhar'}
                  </button>
                  <button
                    onClick={() => handleAccept(selectedRequestTicket.id)}
                    disabled={isAccepting || isRejecting}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 font-bold"
                  >
                    {isAccepting ? 'Aceitando...' : 'Aceitar Atendimento'}
                  </button>
                </div>
              </div>
            </div>
          ) : selectedChatTicket ? (
            
            /* CASO B: Visualizador de Chat Ativo */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Header do Chat */}
              <div className="p-4 border-b border-slate-900 bg-slate-950/30 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    {selectedChatTicket.customerName}
                    <span className="text-[10px] text-slate-500 font-mono font-normal">
                      (Protocolo: {selectedChatTicket.id.slice(0, 8).toUpperCase()})
                    </span>
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    {getPriorityBadge(selectedChatTicket.priority)}
                    <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700/50 px-1.5 py-0.5 rounded">
                      {selectedChatTicket.channel}
                    </span>
                  </div>
                </div>

                <div>
                  {selectedChatTicket.status !== 'resolved' && (
                    <button
                      onClick={() => resolveTicket(selectedChatTicket.id)}
                      className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
                    >
                      Resolver e Encerrar
                    </button>
                  )}
                </div>
              </div>

              {/* Feed de Mensagens */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#080a0f]/20">
                {selectedChatTicket.messages.map((msg) => {
                  const isMe = msg.sender === 'agent' && msg.senderName === currentUser.name;
                  const isOtherAgent = msg.sender === 'agent' && msg.senderName !== currentUser.name;
                  const isSystem = msg.sender === 'system' || msg.senderName === 'Sistema';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="text-[10px] text-slate-500 bg-slate-950/30 border border-slate-900/50 px-3.5 py-1.5 rounded-full max-w-[85%] text-center">
                          ⚙️ {msg.text}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm relative ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                      }`}>
                        <div className={`text-[9px] font-extrabold uppercase mb-1 ${
                          isMe ? 'text-indigo-200' : getOperatorColorClass(msg.senderName || 'Atendente')
                        }`}>
                          {isMe 
                            ? 'Você (Atendente)' 
                            : isOtherAgent 
                              ? `${msg.senderName || 'Atendente'} (Atendente)` 
                              : `${msg.senderName || 'Cliente'} (Cliente)`}
                        </div>
                        <p className="leading-relaxed break-words text-xs font-normal">{msg.text}</p>
                        <span className="block text-[8px] text-right font-mono opacity-50 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input de Envio do Chat */}
              <div className="p-4 border-t border-slate-900 bg-slate-950/30 shrink-0">
                {selectedChatTicket.status === 'resolved' ? (
                  <div className="text-center p-3.5 bg-emerald-950/15 border border-emerald-900/30 text-emerald-400 rounded-xl text-xs flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    Este atendimento foi encerrado e finalizado.
                  </div>
                ) : (
                  <form onSubmit={handleSendChat} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Responda ao cliente..."
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                      className="flex-1 px-4 py-3 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200"
                    />
                    <button
                      type="submit"
                      disabled={!chatText.trim()}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>

            </div>
          ) : (
            
            /* CASO C: Estado Vazio Elegante (Splash) */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="space-y-4 max-w-sm">
                <div className="inline-flex p-4 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse">
                  <MessageSquare className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-white">Central de Atendimento Real</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Selecione uma conversa ativa na barra lateral para iniciar o chat em tempo real, ou clique em uma solicitação recebida para decidir sobre seu aceite.
                </p>
                <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 text-indigo-400 text-[10px] rounded-xl font-medium leading-relaxed">
                  💡 <strong>Dica:</strong> A barra de solicitações pendentes no topo esquerdo listará novos atendimentos propostos pela triagem inteligente da IA.
                </div>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* ====================================================
          PAINEL DRAWER RETRÁTIL (Métricas & Logs Opcionais)
          ==================================================== */}
      {isDrawerOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel Body */}
          <div className="fixed top-0 right-0 h-full w-[420px] bg-[#0c101b] border-l border-slate-900 z-50 flex flex-col p-6 overflow-hidden shadow-2xl transition-all duration-300 transform animate-slide-in">
            
            {/* Header Drawer */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-900 shrink-0">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" /> Painel de Métricas & Triagem IA
              </h3>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo Scrollable */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
              
              {/* 1. Grade de Métricas */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Estatísticas Operacionais</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/60 p-3.5 border border-slate-900 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-medium">Acumulado Fila</p>
                    <p className="text-xl font-bold text-white mt-1">{metrics.total}</p>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 border border-slate-900 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-medium">Fila Sem Técnico</p>
                    <p className="text-xl font-bold text-sky-400 mt-1">{metrics.open}</p>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 border border-slate-900 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-medium">Meus Atendimentos</p>
                    <p className="text-xl font-bold text-indigo-400 mt-1">{activeChats.length}</p>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 border border-slate-900 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-medium">Críticos Triados</p>
                    <p className="text-xl font-bold text-red-400 mt-1">{metrics.criticalCount}</p>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3.5 border border-slate-900 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] text-slate-400 font-medium">Estresse Médio da Fila</p>
                    <span className="text-xs font-bold text-slate-300">{metrics.avgStress}/5</span>
                  </div>
                  {getStressProgressBar(Math.round(Number(metrics.avgStress)))}
                </div>
              </div>

              {/* 2. Logs de Triagem */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Histórico de Logs IA</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold tracking-widest animate-pulse">LIVE</span>
                </div>

                <div className="space-y-2.5 font-mono text-[9px]">
                  {triageLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-700 italic">Aguardando atividades de clientes...</div>
                  ) : (
                    triageLogs.map((log) => {
                      const isStress = log.stressLevel === 5;
                      return (
                        <div 
                          key={log.id} 
                          className={`p-3 rounded-lg border ${
                            isStress 
                              ? 'bg-red-950/15 border-red-900/30' 
                              : 'bg-slate-950/30 border-slate-900/80'
                          }`}
                        >
                          <div className="flex justify-between mb-1">
                            <span className={isStress ? 'text-red-400 font-bold' : 'text-slate-400'}>
                              {isStress ? '⚠️ ALERTA IA CRÍTICO' : 'ℹ️ TRIADO'}
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
                                Alertas: <span className="text-red-400 bg-red-950/30 px-1 py-0.5 rounded">{log.detectedKeywords.join(', ')}</span>
                              </div>
                            )}
                            <div className="pt-1.5 mt-1.5 border-t border-slate-950 flex justify-between font-bold text-slate-400">
                              <span>PRIORIDADE: {log.priority.toUpperCase()}</span>
                              <span>ESTRESSE: {log.stressLevel}/5</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        </>
      )}

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

  // Segurança de rota
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
          <p className="text-xs text-slate-400">Verifique se o ticket ainda existe e está ativo.</p>
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
            <p className="text-xs text-slate-400">Canal: <strong>{ticket.channel}</strong> | Operador: <strong>{ticket.operatorName}</strong></p>
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

      {/* Grid Principal com Informações Expandidas do Questionário */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 min-h-0">
        
        {/* Painel Informações Fila */}
        <aside className="md:col-span-1 border-r border-slate-900 bg-[#0c101b]/35 p-6 space-y-6 hidden md:block overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dados da Solicitação</h3>
            
            <div className="space-y-4">
              {/* Categoria */}
              <div>
                <span className="text-[10px] text-slate-500 block">Categoria do Pedido:</span>
                <span className="inline-block mt-1 px-2.5 py-1 rounded bg-indigo-950/45 border border-indigo-900/40 text-xs font-semibold text-indigo-400">
                  {ticket.category || 'Não Informada'}
                </span>
              </div>

              {/* Urgência Declarada pelo Cliente */}
              <div>
                <span className="text-[10px] text-slate-500 block">Urgência Autodeclarada:</span>
                <span className="inline-block mt-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                  {ticket.declaredUrgency ? `${ticket.declaredUrgency}/5` : 'Não Declarada'}
                </span>
              </div>

              {/* Título Resumido */}
              <div>
                <span className="text-[10px] text-slate-500 block">Resumo do Caso:</span>
                <span className="font-semibold text-xs text-slate-200 block mt-0.5 leading-tight">{ticket.subject}</span>
              </div>

              {/* Descrição Detalhada */}
              <div>
                <span className="text-[10px] text-slate-500 block">Relato Completo:</span>
                <p className="text-xs text-slate-400 mt-1 p-3 bg-slate-950/50 border border-slate-900 rounded-xl leading-relaxed max-h-[220px] overflow-y-auto font-normal">
                  "{ticket.description || ticket.subject}"
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-400 border-t border-slate-900 pt-5">
            <div className="flex justify-between">
              <span>Prioridade de Triagem IA:</span>
              <span className="font-bold text-slate-200 uppercase">{ticket.priority}</span>
            </div>
            <div className="flex justify-between">
              <span>Estresse do Cliente:</span>
              <span className="font-bold text-slate-200">{ticket.stressLevel}/5</span>
            </div>
            <div className="flex justify-between">
              <span>ID do Protocolo:</span>
              <span className="font-mono text-slate-300">{ticket.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </aside>

        {/* Painel do Chat */}
        <main className="md:col-span-3 flex flex-col bg-[#0a0d16]/10 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {ticket.messages.map((msg) => {
              const isMe = msg.sender === 'agent' && msg.senderName === currentUser.name;
              const isOtherAgent = msg.sender === 'agent' && msg.senderName !== currentUser.name;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm relative ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                  }`}>
                    <div className={`text-[9px] font-bold uppercase mb-1 ${
                      isMe 
                        ? 'text-indigo-200' 
                        : isOtherAgent 
                          ? getOperatorColorClass(msg.senderName || 'Atendente') 
                          : 'text-indigo-400'
                    }`}>
                      {isMe 
                        ? 'Você (Atendente)' 
                        : isOtherAgent 
                          ? (msg.senderName || 'Atendente') 
                          : `${ticket.customerName} (Cliente)`}
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
                Este ticket de suporte já foi resolvido e finalizado.
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
        {/* Rota 1: Login e Identificação com Email/Senha */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Rota 2: Formulário de Solicitação de Suporte Expandido */}
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
