
import { Navigate } from 'react-router-dom';
import { useClientCreateController } from '../../controllers/useClientCreateController';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import logoUrl from '../../../assets/logo.png';
import { ArrowLeft, FileText, AlertTriangle, AlertOctagon } from 'lucide-react';

export function ClientCreatePage() {
  const {
    currentUser,
    category,
    setCategory,
    subject,
    setSubject,
    description,
    setDescription,
    channel,
    setChannel,
    submitting,
    error,
    setError,
    isConnected,
    hasStressKeyword,
    handleFormSubmit,
    navigateBack
  } = useClientCreateController();

  // Route protection
  if (!currentUser || currentUser.role !== 'client') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080b11] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <header className="border-b border-slate-202 border-slate-200 dark:border-slate-905 dark:border-slate-900 bg-white/95 dark:bg-[#0c101b]/95 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center space-x-3">
          <button
            onClick={navigateBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-202 dark:hover:border-slate-808 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-slate-555 dark:text-slate-400" />
          </button>
          <div className="flex items-center space-x-2">
            <img src={logoUrl} alt="TriageHub Logo" className="w-6 h-6 object-contain rounded-full border border-indigo-500/20" />
            <h1 className="text-sm font-bold text-slate-901 text-slate-900 dark:text-white">Central do Cliente TriageHub</h1>
          </div>
        </div>
        <div className="text-xs text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 flex items-center gap-3">
          <span>Logado como: <strong>{currentUser.name}</strong> ({currentUser.email})</span>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 my-4">
        <div className="w-full max-w-2xl glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-900/60 shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-901 text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Abertura de Ticket Expandida
            </h2>
            <p className="text-xs text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 mt-1">
              Responda ao questionário detalhado abaixo para fornecer o máximo de contexto ao especialista.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Linha 1: Título Resumido e Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 uppercase tracking-wider mb-2">
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
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-202 border-slate-200 dark:border-slate-808 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 uppercase tracking-wider mb-2">
                  2. Categoria do Problema
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-202 border-slate-200 dark:border-slate-808 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 cursor-pointer transition-colors"
                >
                  <option value="Dúvidas & Configurações" className="bg-white dark:bg-slate-950">Dúvidas & Configurações</option>
                  <option value="Técnico (Hardware/Software)" className="bg-white dark:bg-slate-950">Técnico (Hardware/Software)</option>
                  <option value="Financeiro & Cobrança" className="bg-white dark:bg-slate-950">Financeiro & Cobrança</option>
                  <option value="Reclamações & Cancelamento" className="bg-white dark:bg-slate-950">Reclamações & Cancelamento</option>
                </select>
              </div>
            </div>

            {/* Linha 2: Canal Preferencial */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 uppercase tracking-wider mb-2">
                3. Canal Preferencial
              </label>
              <div className="flex gap-2 max-w-md">
                <button
                  type="button"
                  onClick={() => setChannel('WhatsApp')}
                  className={`flex-1 py-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                    channel === 'WhatsApp'
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-202 border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-302 dark:hover:border-slate-808'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('Webchat')}
                  className={`flex-1 py-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                    channel === 'Webchat'
                      ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-500/40 text-sky-650 text-sky-600 dark:text-sky-400'
                      : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-202 border-slate-200 dark:border-slate-900 hover:border-slate-302 dark:hover:border-slate-808 text-slate-505 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Webchat
                </button>
              </div>
            </div>

            {/* Linha 3: Descrição Detalhada */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 uppercase tracking-wider mb-2">
                4. Descrição Detalhada do Caso (Explique o que aconteceu)
              </label>
              <textarea
                rows={5}
                placeholder="Por favor, relate em detalhes o ocorrido para analisarmos sua solicitação com o motor de triagem inteligente..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-202 border-slate-200 dark:border-slate-888 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 resize-none transition-colors"
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
