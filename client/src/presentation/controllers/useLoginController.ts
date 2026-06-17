import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketRepository } from '../../data/repositories/ticketRepository';
import { useTicketStore } from '../../store/useTicketStore';

export function useLoginController() {
  const navigate = useNavigate();
  const isConnected = useTicketStore((state) => state.isConnected);

  // Local state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [funcao, setFuncao] = useState('suporte_ti_1');
  const [role, setRole] = useState<'client' | 'agent'>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default theme is dark before log in
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

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
      const user = await ticketRepository.authenticate(
        email.trim().toLowerCase(),
        password,
        isSignUp ? firstName.trim() : undefined,
        isSignUp ? lastName.trim() : undefined,
        isSignUp ? role : undefined,
        isSignUp && role === 'agent' ? funcao : undefined,
        isSignUp
      );

      setLoading(false);

      if (user.role === 'client') {
        navigate('/client/dashboard');
      } else {
        navigate('/operator/dashboard');
      }
    } catch (err) {
      setLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Erro ao tentar autenticar. Verifique a conexão.';
      setError(errorMsg);
    }
  };

  const handleReconnect = () => {
    ticketRepository.connect();
  };

  return {
    isSignUp,
    setIsSignUp: (val: boolean) => {
      setIsSignUp(val);
      setError('');
    },
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
  };
}
