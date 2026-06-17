import { Navigate } from 'react-router-dom';
import { useClientCreateController } from '../../controllers/useClientCreateController';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import logoUrl from '../../../assets/logo.png';
import { ArrowLeft } from 'lucide-react';

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

  if (!currentUser || currentUser.role !== 'client') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center space-x-3">
          <button
            onClick={navigateBack}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent rounded transition-colors cursor-pointer flex items-center justify-center bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-500" />
          </button>
          <div className="flex items-center space-x-2">
            <img src={logoUrl} alt="TriageHub" className="w-5 h-5 object-contain opacity-80" />
            <h1 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">TriageHub</h1>
          </div>
        </div>
        <div className="text-[11px] text-zinc-505 text-zinc-500 dark:text-zinc-400 flex items-center gap-3">
          <span>{currentUser.name}</span>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-808 dark:border-zinc-800 rounded-lg space-y-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Abertura de Chamado</h2>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Explique detalhadamente o seu problema técnico ou financeiro.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Linha 1: Título Resumido e Categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  1. Título do Chamado
                </label>
                <input
                  type="text"
                  placeholder="Ex: Erro de login no sistema"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  2. Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-808 dark:border-zinc-800 rounded focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer transition-colors"
                >
                  <option value="Dúvidas & Configurações" className="bg-white dark:bg-zinc-900">Dúvidas & Configurações</option>
                  <option value="Técnico (Hardware/Software)" className="bg-white dark:bg-zinc-900">Técnico (Hardware/Software)</option>
                  <option value="Financeiro & Cobrança" className="bg-white dark:bg-zinc-900">Financeiro & Cobrança</option>
                  <option value="Reclamações & Cancelamento" className="bg-white dark:bg-zinc-900">Reclamações & Cancelamento</option>
                </select>
              </div>
            </div>

            {/* Linha 2: Canal Preferencial */}
            <div>
              <label className="block text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                3. Canal Preferencial
              </label>
              <div className="flex gap-2 max-w-xs">
                <button
                  type="button"
                  onClick={() => setChannel('WhatsApp')}
                  className={`flex-1 py-1 px-3 rounded border text-[10px] font-medium transition-colors cursor-pointer ${
                    channel === 'WhatsApp'
                      ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900'
                      : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('Webchat')}
                  className={`flex-1 py-1 px-3 rounded border text-[10px] font-medium transition-colors cursor-pointer ${
                    channel === 'Webchat'
                      ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900'
                      : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  Webchat
                </button>
              </div>
            </div>

            {/* Linha 3: Descrição Detalhada */}
            <div>
              <label className="block text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                4. Relato Completo (O que aconteceu?)
              </label>
              <textarea
                rows={4}
                placeholder="Descreva em detalhes o ocorrido..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-955 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 resize-none transition-colors"
              />

              {/* Alerta de Urgência dinâmico reativo - Simplificado sem piscar/vermelho */}
              {hasStressKeyword && (
                <div className="mt-2 text-[10px] text-zinc-500 dark:text-zinc-450 italic">
                  * Note: Foram detectados termos prioritários em seu relato. A triagem automática da IA classificará este ticket como alta urgência na fila.
                </div>
              )}
            </div>

            {error && (
              <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-655 text-red-650 dark:text-red-400 rounded text-[10px]">
                <span>{error}</span>
              </div>
            )}

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={submitting || !isConnected}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 text-white font-semibold rounded transition-colors cursor-pointer text-xs border-0"
            >
              {submitting ? 'Enviando...' : 'Iniciar chamado'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
