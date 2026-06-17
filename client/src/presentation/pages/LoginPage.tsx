import { useLoginController } from '../controllers/useLoginController';
import logoUrl from '../../assets/logo.png';
import { WifiOff } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';

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
    <div className="min-h-screen bg-bg-base text-text-main flex items-center justify-center p-6 font-sans transition-colors duration-200">
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <img src={logoUrl} alt="TriageHub" className="w-12 h-12 object-contain rounded-full mx-auto mb-2 opacity-90" />
          <h1 className="text-lg font-bold text-text-main tracking-tight">TriageHub</h1>
          <p className="text-[10px] text-text-muted uppercase font-semibold tracking-wider mt-0.5">Atendimento em Tempo Real</p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {/* Nome e Sobrenome (Apenas modo cadastro) */}
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <Input
                label="Nome"
                placeholder="Nome"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setError(''); }}
              />
              <Input
                label="Sobrenome"
                placeholder="Sobrenome"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setError(''); }}
              />
            </div>
          )}

          {/* E-mail */}
          <Input
            label="Endereço de E-mail"
            type="email"
            placeholder="seuemail@suporte.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
          />

          {/* Senha */}
          <Input
            label="Senha de Acesso"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
          />

          {/* Perfil e Cargo (Apenas Modo Cadastro) */}
          {isSignUp && (
            <div className="animate-fade-in space-y-1">
              <label className="block text-[9px] font-semibold text-text-muted uppercase tracking-wider">
                Escolha seu Cargo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={() => setRole('client')}
                  variant={role === 'client' ? 'primary' : 'outline'}
                  size="sm"
                >
                  Cliente
                </Button>
                <Button
                  type="button"
                  onClick={() => setRole('agent')}
                  variant={role === 'agent' ? 'primary' : 'outline'}
                  size="sm"
                >
                  Atendente
                </Button>
              </div>
            </div>
          )}

          {/* Função do Atendente (Apenas Atendente e Cadastro) */}
          {isSignUp && role === 'agent' && (
            <div className="animate-fade-in">
              <Select
                label="Função do Atendente"
                value={funcao}
                onChange={(e) => setFuncao(e.target.value)}
                options={[
                  { value: 'suporte_ti_1', label: 'Suporte de TI 1', icon: '🛡️' },
                  { value: 'suporte_ti_2', label: 'Suporte de TI 2', icon: '⚡' },
                  { value: 'suporte_ti_3', label: 'Suporte de TI 3', icon: '⚙️' },
                  { value: 'suporte_juridico', label: 'Suporte Jurídico', icon: '⚖️' },
                  { value: 'analista_consumidor', label: 'Analista de Suporte ao Consumidor', icon: '👤' }
                ]}
              />
            </div>
          )}

          {error && (
            <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded text-[10px]">
              <span>{error}</span>
            </div>
          )}

          {/* Botão Principal */}
          <Button
            type="submit"
            disabled={loading || !isConnected}
            loading={loading}
            className="w-full font-semibold"
          >
            {isSignUp ? 'Confirmar Cadastro' : 'Efetuar Login'}
          </Button>
        </form>

        {/* Toggle de Modo Login/Registro */}
        <div className="mt-4 text-center border-t border-border-subtle pt-3">
          <Button
            onClick={() => setIsSignUp(!isSignUp)}
            variant="text"
            size="sm"
            className="underline"
          >
            {isSignUp ? 'Já tem uma conta? Faça Login' : 'Ainda não tem conta? Cadastre-se'}
          </Button>
        </div>

        {/* Status do WebSocket */}
        {!isConnected && (
          <div className="mt-3 p-2 bg-bg-base border border-border-subtle text-text-muted rounded text-[9px] flex items-center justify-between">
            <span className="flex items-center gap-1"><WifiOff className="w-3.5 h-3.5 text-red-500" /> Servidor Offline</span>
            <Button
              type="button"
              onClick={handleReconnect}
              variant="text"
              size="sm"
              className="underline font-bold"
            >
              Reconectar
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
