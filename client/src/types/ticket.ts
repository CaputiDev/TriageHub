export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'pending_acceptance';

export interface Message {
  id: string;
  sender: 'client' | 'agent' | 'system';
  senderName?: string;
  text: string;
  timestamp: string; // ISO String
}

export interface Ticket {
  id: string;
  customerName: string;
  customerEmail: string;
  channel: 'WhatsApp' | 'Webchat';
  category: string;
  subject: string;
  description: string;
  declaredUrgency: number;
  priority: TicketPriority;
  status: TicketStatus;
  stressLevel: 1 | 2 | 3 | 4 | 5;
  operatorId?: string;
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
