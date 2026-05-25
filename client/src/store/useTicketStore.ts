import { create } from 'zustand';
import type { Ticket, TriageLog } from '../types/ticket';

// Peso das prioridades para a ordenação secundária
const priorityWeight = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

/**
 * Função utilitária para ordenar os tickets:
 * 1. Prioridade 'critical' sempre no topo.
 * 2. Ordenado por 'stressLevel' decrescente (nível 5 primeiro).
 * 3. Ordenado pela prioridade nominal (high > medium > low).
 * 4. Ordenado pelo tempo de criação mais recente.
 */
const sortTickets = (tickets: Ticket[]): Ticket[] => {
  return [...tickets].sort((a, b) => {
    // 1. Críticos primeiro
    if (a.priority === 'critical' && b.priority !== 'critical') return -1;
    if (b.priority === 'critical' && a.priority !== 'critical') return 1;

    // 2. Maior nível de estresse primeiro
    if (b.stressLevel !== a.stressLevel) {
      return b.stressLevel - a.stressLevel;
    }

    // 3. Hierarquia de prioridades
    if (a.priority !== b.priority) {
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    }

    // 4. Mais recente primeiro
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

interface UserState {
  id: string;
  name: string;
  role: 'client' | 'agent';
  email: string;
  funcao?: string;
  codigoIdentificacao?: string;
}

interface TicketState {
  // Estado de Autenticação
  currentUser: UserState | null;
  
  // Estado dos Tickets
  tickets: Ticket[];
  activeTicketId: string | null;
  triageLogs: TriageLog[];
  isConnected: boolean;

  // Ações de Autenticação
  login: (id: string, name: string, role: 'client' | 'agent', email: string, funcao?: string, codigoIdentificacao?: string) => void;
  logout: () => void;

  // Ações de Tickets
  setTickets: (tickets: Ticket[]) => void;
  addOrUpdateTicket: (ticket: Ticket) => void;
  setActiveTicketId: (id: string | null) => void;
  addTriageLog: (log: TriageLog) => void;
  setConnected: (connected: boolean) => void;
  clearAll: () => void;
}

export const useTicketStore = create<TicketState>((set) => ({
  // Estado Inicial
  currentUser: null,
  tickets: [],
  activeTicketId: null,
  triageLogs: [],
  isConnected: false,

  // Ações de Autenticação
  login: (id, name, role, email, funcao, codigoIdentificacao) => set({ 
    currentUser: { id, name, role, email, funcao, codigoIdentificacao } 
  }),

  logout: () => set({ 
    currentUser: null,
    activeTicketId: null
  }),

  // Define a lista completa de tickets sincronizados
  setTickets: (tickets) => set({ 
    tickets: sortTickets(tickets) 
  }),

  // Adiciona ou atualiza um ticket individual e o reordena na fila
  addOrUpdateTicket: (updatedTicket) => set((state) => {
    const exists = state.tickets.some(t => t.id === updatedTicket.id);
    let newTicketsList: Ticket[];

    if (exists) {
      newTicketsList = state.tickets.map(t => 
        t.id === updatedTicket.id ? updatedTicket : t
      );
    } else {
      newTicketsList = [...state.tickets, updatedTicket];
    }

    return {
      tickets: sortTickets(newTicketsList)
    };
  }),

  setActiveTicketId: (id) => set({ activeTicketId: id }),

  addTriageLog: (log) => set((state) => ({
    triageLogs: [log, ...state.triageLogs].slice(0, 50)
  })),

  setConnected: (connected) => set({ isConnected: connected }),

  clearAll: () => set({ 
    tickets: [], 
    activeTicketId: null, 
    triageLogs: [],
    currentUser: null
  })
}));
