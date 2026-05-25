export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export interface Message {
  id: string;
  sender: 'client' | 'agent';
  text: string;
  timestamp: string; // ISO String
}

export interface Ticket {
  id: string;
  customerName: string;
  channel: 'WhatsApp' | 'Webchat';
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  stressLevel: 1 | 2 | 3 | 4 | 5;
  operatorName: string;
  messages: Message[];
  createdAt: string; // ISO String
}

export interface TriageLog {
  id: string;
  timestamp: string;
  customerName: string;
  subject: string;
  detectedKeywords: string[];
  priority: TicketPriority;
  stressLevel: number;
}
