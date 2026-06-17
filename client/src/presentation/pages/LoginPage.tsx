import { useLoginController } from '../controllers/useLoginController';
import logoUrl from '../../assets/logo.png';
import { WifiOff } from 'lucide-react';

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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex items-center justify-center p-6 font-sans transition-colors duration-200">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-zinc-900 border border-zinc-250 border-zinc-200 dark:border-zinc-800 rounded-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <img src={logoUrl} alt="TriageHub" className="w-12 h-12 object-contain rounded-full mx-auto mb-2 opacity-90" />
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">TriageHub</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold tracking-wider mt-0.5">Atendimento em Tempo Real</p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {/* Nome e Sobrenome (Apenas modo cadastro) */}
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <div>
                <label className="block text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  placeholder="Nome"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-850 dark:text-zinc-200 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Sobrenome
                </label>
                <input
                  type="text"
                  placeholder="Sobrenome"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-850 dark:text-zinc-200 transition-colors"
                />
              </div>
            </div>
          )}

          {/* E-mail */}
          <div>
            <label className="block text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Endereço de E-mail
            </label>
            <input
              type="email"
              placeholder="seuemail@suporte.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-850 dark:text-zinc-200 transition-colors"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Senha de Acesso
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-955 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-808 dark:border-zinc-800 rounded focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-850 dark:text-zinc-200 transition-colors"
            />
          </div>

          {/* Perfil e Cargo (Apenas Modo Cadastro) */}
          {isSignUp && (
            <div className="animate-fade-in">
              <label className="block text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Escolha seu Cargo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`py-1.5 px-3 rounded border text-[10px] font-semibold transition-colors cursor-pointer ${
                    role === 'client'
                      ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900'
                      : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-350 dark:hover:border-zinc-700'
                  }`}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setRole('agent')}
                  className={`py-1.5 px-3 rounded border text-[10px] font-semibold transition-colors cursor-pointer ${
                    role === 'agent'
                      ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900'
                      : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-350 dark:hover:border-zinc-700'
                  }`}
                >
                  Atendente
                </button>
              </div>
            </div>
          )}

          {/* Função do Atendente (Apenas Atendente e Cadastro) */}
          {isSignUp && role === 'agent' && (
            <div className="animate-fade-in">
              <label className="block text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Função do Atendente
              </label>
              <select
                value={funcao}
                onChange={(e) => setFuncao(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-808 dark:border-zinc-800 rounded focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-850 dark:text-zinc-200 cursor-pointer transition-colors"
              >
                <option value="suporte_ti_1" className="bg-white dark:bg-zinc-900">🛡️ Suporte de TI 1</option>
                <option value="suporte_ti_2" className="bg-white dark:bg-zinc-900">⚡ Suporte de TI 2</option>
                <option value="suporte_ti_3" className="bg-white dark:bg-zinc-900">⚙️ Suporte de TI 3</option>
                <option value="suporte_juridico" className="bg-white dark:bg-zinc-900">⚖️ Suporte Jurídico</option>
                <option value="analista_consumidor" className="bg-white dark:bg-zinc-900">👤 Analista de Suporte ao Consumidor</option>
              </select>
            </div>
          )}

          {error && (
            <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded text-[10px]">
              <span>{error}</span>
            </div>
          )}

          {/* Botão Principal */}
          <button
            type="submit"
            disabled={loading || !isConnected}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 text-white font-semibold rounded transition-colors cursor-pointer text-xs"
          >
            {loading ? 'Aguarde...' : isSignUp ? 'Confirmar Cadastro' : 'Efetuar Login'}
          </button>
        </form>

        {/* Toggle de Modo Login/Registro */}
        <div className="mt-4 text-center border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-medium underline cursor-pointer bg-transparent border-0"
          >
            {isSignUp ? 'Já tem uma conta? Faça Login' : 'Ainda não tem conta? Cadastre-se'}
          </button>
        </div>

        {/* Status do WebSocket */}
        {!isConnected && (
          <div className="mt-3 p-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 rounded text-[9px] flex items-center justify-between">
            <span className="flex items-center gap-1"><WifiOff className="w-3 h-3 text-red-500" /> Servidor Offline</span>
            <button type="button" onClick={handleReconnect} className="underline font-bold cursor-pointer bg-transparent border-0 text-zinc-700 dark:text-zinc-300">Reconectar</button>
          </div>
        )}
      </div>
    </div>
  );
}
