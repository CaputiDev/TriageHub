export interface UserState {
  id: string;
  name: string;
  role: 'client' | 'agent';
  email: string;
  funcao?: string;
  codigoIdentificacao?: string;
}
