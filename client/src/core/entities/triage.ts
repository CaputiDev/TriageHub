import type { TicketPriority } from './ticket';

export interface TriageLog {
  id: string;
  timestamp: string;
  customerName: string;
  subject: string;
  detectedKeywords: string[];
  priority: TicketPriority;
  stressLevel: number;
}
