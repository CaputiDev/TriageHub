import { create } from 'zustand';
import type { Ticket, TriageLog } from '../types/ticket';

// Ordem de prioridade para classificação secundária
const priorityWeight = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

/**
 * Função utilitária para ordenar os tickets estritamente conforme as regras de negócio:
 * 1. Prioridade 'critical' sempre no topo.
 * 2. Ordenado por 'stressLevel' de forma decrescente (nível 5 primeiro).
 * 3. Ordenado pela hierarquia de prioridades secundárias (high > medium > low).
 * 4. Ordenado pelo tempo de criação mais recente (novos tickets primeiro).
 */
const sortTickets = (tickets: Ticket[]): Ticket[] => {
  return [...tickets].sort((a, b) => {
    // 1. Prioridade Crítica Primeiro
    if (a.priority === 'critical' && b.priority !== 'critical') return -1;
    if (b.priority === 'critical' && a.priority !== 'critical') return 1;

    // 2. Maior Nível de Estresse Primeiro (5 -> 1)
    if (b.stressLevel !== a.stressLevel) {
      return b.stressLevel - a.stressLevel;
    }

    // 3. Hierarquia de Prioridades (High > Medium > Low)
    if (a.priority !== b.priority) {
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    }

    // 4. Mais Recente Primeiro
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

interface TicketState {
  // Estado
  tickets: Ticket[];
  activeTicketId: string | null;
  triageLogs: TriageLog[];
  isConnected: boolean;

  // Ações
  setTickets: (tickets: Ticket[]) => void;
  addOrUpdateTicket: (ticket: Ticket) => void;
  setActiveTicketId: (id: string | null) => void;
  addTriageLog: (log: TriageLog) => void;
  setConnected: (connected: boolean) => void;
  clearAll: () => void;
}

export const useTicketStore = create<TicketState>((set) => ({
  // Estado Inicial
  tickets: [],
  activeTicketId: null,
  triageLogs: [],
  isConnected: false,

  // Define a lista completa de tickets (sincronização inicial)
  setTickets: (tickets) => set({ 
    tickets: sortTickets(tickets) 
  }),

  // Adiciona ou atualiza um ticket individual e ordena a lista
  addOrUpdateTicket: (updatedTicket) => set((state) => {
    const exists = state.tickets.some(t => t.id === updatedTicket.id);
    let newTicketsList: Ticket[];

    if (exists) {
      // Se já existe, atualiza as informações mesclando ou substituindo
      newTicketsList = state.tickets.map(t => 
        t.id === updatedTicket.id ? updatedTicket : t
      );
    } else {
      // Se não existe, adiciona à lista
      newTicketsList = [...state.tickets, updatedTicket];
    }

    return {
      tickets: sortTickets(newTicketsList)
    };
  }),

  // Define o ticket que está sendo operado no momento
  setActiveTicketId: (id) => set({ activeTicketId: id }),

  // Adiciona um log de triagem automática do backend
  addTriageLog: (log) => set((state) => ({
    triageLogs: [log, ...state.triageLogs].slice(0, 50) // Mantém no máximo os últimos 50 logs
  })),

  // Altera o estado da conexão WebSocket
  setConnected: (connected) => set({ isConnected: connected }),

  // Limpa o estado (útil se necessário reiniciar)
  clearAll: () => set({ tickets: [], activeTicketId: null, triageLogs: [] })
}));
