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
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-panel px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center space-x-3">
          <button
            onClick={navigateBack}
            className="p-1 hover:bg-secondary/10 border border-transparent rounded transition-colors cursor-pointer flex items-center justify-center bg-transparent text-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            <img src={logoUrl} alt="TriageHub" className="w-5 h-5 object-contain opacity-80" />
            <h1 className="text-xs font-bold text-text-main uppercase tracking-wider">TriageHub</h1>
          </div>
        </div>
        <div className="text-[11px] text-text-muted flex items-center gap-3">
          <span>{currentUser.name}</span>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg p-6 bg-bg-panel border border-border-subtle rounded-lg space-y-4">
          <div>
            <h2 className="text-base font-bold text-text-main">Abertura de Chamado</h2>
            <p className="text-[11px] text-text-muted">Explique detalhadamente o seu problema técnico ou financeiro.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Linha 1: Título Resumido e Categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1">
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
                  className="w-full px-3 py-2 text-xs bg-bg-panel border border-border-subtle rounded focus:outline-none focus:border-secondary text-text-main placeholder-text-muted transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                  2. Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-bg-panel border border-border-subtle rounded focus:outline-none focus:border-secondary text-text-main cursor-pointer transition-colors"
                >
                  <option value="Dúvidas & Configurações" className="bg-bg-panel text-text-main">Dúvidas & Configurações</option>
                  <option value="Técnico (Hardware/Software)" className="bg-bg-panel text-text-main">Técnico (Hardware/Software)</option>
                  <option value="Financeiro & Cobrança" className="bg-bg-panel text-text-main">Financeiro & Cobrança</option>
                  <option value="Reclamações & Cancelamento" className="bg-bg-panel text-text-main">Reclamações & Cancelamento</option>
                </select>
              </div>
            </div>

            {/* Linha 2: Canal Preferencial */}
            <div>
              <label className="block text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                3. Canal Preferencial
              </label>
              <div className="flex gap-2 max-w-xs">
                <button
                  type="button"
                  onClick={() => setChannel('WhatsApp')}
                  className={`flex-1 py-1 px-3 rounded border text-[10px] font-medium transition-colors cursor-pointer ${
                    channel === 'WhatsApp'
                      ? 'bg-secondary border-secondary text-white'
                      : 'bg-bg-panel border-secondary text-secondary hover:bg-secondary/10'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('Webchat')}
                  className={`flex-1 py-1 px-3 rounded border text-[10px] font-medium transition-colors cursor-pointer ${
                    channel === 'Webchat'
                      ? 'bg-secondary border-secondary text-white'
                      : 'bg-bg-panel border-secondary text-secondary hover:bg-secondary/10'
                  }`}
                >
                  Webchat
                </button>
              </div>
            </div>

            {/* Linha 3: Descrição Detalhada */}
            <div>
              <label className="block text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1">
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
                className="w-full px-3 py-2 text-xs bg-bg-panel border border-border-subtle rounded focus:outline-none focus:border-secondary text-text-main placeholder-text-muted resize-none transition-colors"
              />

              {/* Alerta de Urgência dinâmico reativo - Simplificado sem piscar/vermelho */}
              {hasStressKeyword && (
                <div className="mt-2 text-[10px] text-text-muted italic">
                  * Note: Foram detectados termos prioritários em seu relato. A triagem automática da IA classificará este ticket como alta urgência na fila.
                </div>
              )}
            </div>

            {error && (
              <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded text-[10px]">
                <span>{error}</span>
              </div>
            )}

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={submitting || !isConnected}
              className="w-full py-2 bg-secondary hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded transition-colors cursor-pointer text-xs border-0"
            >
              {submitting ? 'Enviando...' : 'Iniciar chamado'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
