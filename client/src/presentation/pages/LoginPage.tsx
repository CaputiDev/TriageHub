
import { useLoginController } from '../controllers/useLoginController';
import logoUrl from '../../assets/logo.png';
import { Mail, Lock, User, AlertOctagon, ChevronDown, WifiOff } from 'lucide-react';

export function LoginPage() {
  const {
    isSignUp,
    setIsSignUp,
    email,
    setEmail,
    password,
    setPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    funcao,
    setFuncao,
    role,
    setRole,
    loading,
    error,
    setError,
    isConnected,
    handleAuthSubmit,
    handleReconnect
  } = useLoginController();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080b11] text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Glow de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-200/80 dark:border-slate-900/60 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-1 bg-white/10 dark:bg-slate-955/20 border border-slate-200 dark:border-indigo-500/20 rounded-full mb-3 shadow-inner">
            <img src={logoUrl} alt="TriageHub Logo" className="w-20 h-20 object-contain rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">TriageHub Portal</h1>
          <p className="text-xs text-slate-555 dark:text-slate-400 mt-1">Atendimento e Suporte Seguro em Tempo Real</p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {/* Nome e Sobrenome (Apenas modo cadastro) */}
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-555 dark:text-slate-400 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-600 absolute left-3.5 top-3" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-555 dark:text-slate-400 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-4 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* E-mail */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-555 dark:text-slate-400 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-600 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-555 dark:text-slate-400 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-600 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Perfil e Cargo (Apenas Modo Cadastro) */}
          {isSignUp && (
            <div>
              <label className="block text-[10px] font-semibold text-slate-555 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Escolha seu Cargo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    role === 'client'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-900 text-slate-500 hover:border-slate-300 dark:hover:border-slate-800'
                  }`}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setRole('agent')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    role === 'agent'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-500/50 text-indigo-650 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-900 text-slate-500 hover:border-slate-300 dark:hover:border-slate-800'
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
              <label className="block text-[10px] font-semibold text-slate-555 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Função do Atendente
              </label>
              <div className="relative">
                <select
                  value={funcao}
                  onChange={(e) => setFuncao(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 appearance-none cursor-pointer transition-colors"
                >
                  <option value="suporte_ti_1" className="bg-white dark:bg-slate-950">🛡️ Suporte de TI 1</option>
                  <option value="suporte_ti_2" className="bg-white dark:bg-slate-950">⚡ Suporte de TI 2</option>
                  <option value="suporte_ti_3" className="bg-white dark:bg-slate-950">⚙️ Suporte de TI 3</option>
                  <option value="suporte_juridico" className="bg-white dark:bg-slate-950">⚖️ Suporte Jurídico</option>
                  <option value="analista_consumidor" className="bg-white dark:bg-slate-950">👤 Analista de Suporte ao Consumidor</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/15 border border-red-900/30 text-red-500 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
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
        <div className="mt-6 text-center border-t border-slate-200 dark:border-slate-900 pt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium underline cursor-pointer bg-transparent border-0"
          >
            {isSignUp ? 'Já tem uma conta? Faça Login' : 'Ainda não tem conta? Cadastre-se'}
          </button>
        </div>

        {/* Status do WebSocket */}
        {!isConnected && (
          <div className="mt-4 p-2 bg-red-950/15 border border-red-900/20 text-red-500 dark:text-red-400 rounded-lg text-[10px] flex items-center justify-between">
            <span className="flex items-center gap-1"><WifiOff className="w-3 h-3 animate-pulse" /> Servidor Offline</span>
            <button type="button" onClick={handleReconnect} className="underline font-bold cursor-pointer bg-transparent border-0 text-red-500">Reconectar</button>
          </div>
        )}
      </div>
    </div>
  );
}
