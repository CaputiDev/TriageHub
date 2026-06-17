import { Navigate } from 'react-router-dom';
import { useClientCreateController } from '../../controllers/useClientCreateController';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';

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
      <Header
        userName={currentUser.name}
        onBack={navigateBack}
      />

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-3xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-text-main">Abertura de Chamado</h2>
            <p className="text-[11px] text-text-muted">Explique detalhadamente o seu problema técnico ou financeiro.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Linha 1: Título Resumido e Categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="1. Título do Chamado"
                placeholder="Ex: Erro de login no sistema"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setError('');
                }}
              />

              <Select
                label="2. Categoria"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Dúvidas & Configurações', label: 'Dúvidas & Configurações' },
                  { value: 'Técnico (Hardware/Software)', label: 'Técnico (Hardware/Software)' },
                  { value: 'Financeiro & Cobrança', label: 'Financeiro & Cobrança' },
                  { value: 'Reclamações & Cancelamento', label: 'Reclamações & Cancelamento' }
                ]}
              />
            </div>

            {/* Linha 2: Canal Preferencial */}
            <div>
              <label className="block text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                3. Canal Preferencial
              </label>
              <div className="flex gap-2 max-w-xs">
                <Button
                  type="button"
                  onClick={() => setChannel('WhatsApp')}
                  variant={channel === 'WhatsApp' ? 'primary' : 'outline'}
                  size="sm"
                  className="flex-1"
                >
                  WhatsApp
                </Button>
                <Button
                  type="button"
                  onClick={() => setChannel('Webchat')}
                  variant={channel === 'Webchat' ? 'primary' : 'outline'}
                  size="sm"
                  className="flex-1"
                >
                  Webchat
                </Button>
              </div>
            </div>

            {/* Linha 3: Descrição Detalhada */}
            <Textarea
              label="4. Relato Completo (O que aconteceu?)"
              rows={4}
              placeholder="Descreva em detalhes o ocorrido..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError('');
              }}
            />

            {/* Alerta de Urgência dinâmico reativo */}
            {hasStressKeyword && (
              <div className="mt-2 text-[10px] text-text-muted italic">
                * Note: Foram detectados termos prioritários em seu relato. A triagem automática da IA classificará este ticket como alta urgência na fila.
              </div>
            )}

            {error && (
              <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded text-[10px]">
                <span>{error}</span>
              </div>
            )}

            {/* Botão de Envio */}
            <Button
              type="submit"
              disabled={submitting || !isConnected}
              loading={submitting}
              className="w-full"
            >
              Iniciar chamado
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

