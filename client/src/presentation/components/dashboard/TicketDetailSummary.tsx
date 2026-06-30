import React from 'react';
import type { Ticket } from '../../../core/entities/ticket';

interface TicketDetailSummaryProps {
  ticket: Ticket;
  showPriority?: boolean;
  showCustomer?: boolean;
  showStatus?: boolean;
  showStress?: boolean;
  layout?: 'grid' | 'stack';
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'critical':
      return <span className="text-xs font-bold text-red-500">[Crítico]</span>;
    case 'high':
      return <span className="text-xs font-semibold text-amber-500">[Alto]</span>;
    case 'medium':
      return <span className="text-xs text-text-muted">[Médio]</span>;
    default:
      return <span className="text-xs text-text-muted">[Baixo]</span>;
  }
};

export const TicketDetailSummary: React.FC<TicketDetailSummaryProps> = ({
  ticket,
  showPriority = false,
  showCustomer = false,
  showStatus = false,
  showStress = true,
  layout = 'stack'
}) => {
  const isGrid = layout === 'grid';

  return (
    <div className="space-y-4">
      <div className={isGrid ? 'grid grid-cols-2 gap-4 text-xs' : 'space-y-3.5 text-xs'}>
        <div>
          <span className="text-text-muted block text-xs uppercase tracking-wider">Protocolo</span>
          <span className="font-mono text-text-main">#{ticket.id.slice(0, 8).toUpperCase()}</span>
        </div>

        {showStatus && (
          <div>
            <span className="text-text-muted block text-xs uppercase tracking-wider">Status</span>
            <span className="capitalize text-text-main">{ticket.status.replace('_', ' ')}</span>
          </div>
        )}

        <div>
          <span className="text-text-muted block text-xs uppercase tracking-wider">Canal</span>
          <span className="text-text-main">{ticket.channel}</span>
        </div>

        {showCustomer && (
          <div>
            <span className="text-text-muted block text-xs uppercase tracking-wider">Cliente</span>
            <span className="text-text-main">{ticket.customerName}</span>
          </div>
        )}

        <div>
          <span className="text-text-muted block text-xs uppercase tracking-wider">Categoria</span>
          <span className="text-text-main font-semibold">{ticket.category || 'Não Informada'}</span>
        </div>

        {showPriority && (
          <div>
            <span className="text-text-muted block text-xs uppercase tracking-wider">Prioridade Triagem IA</span>
            <span className="uppercase block mt-0.5">{getPriorityBadge(ticket.priority)}</span>
          </div>
        )}

        {showStress && (
          <div>
            <span className="text-text-muted block text-xs uppercase tracking-wider">Estresse do Cliente</span>
            <span className="text-text-main font-bold block mt-0.5">{ticket.stressLevel}/5</span>
          </div>
        )}
      </div>

      <div className="border-t border-border-subtle pt-3 mt-1">
        <span className="text-text-muted block text-xs uppercase tracking-wider mb-1">Relato Completo</span>
        <p className="text-text-muted italic bg-bg-base p-3 rounded border border-border-subtle leading-relaxed text-xs break-words">
          "{ticket.description || ticket.subject}"
        </p>
      </div>
    </div>
  );
};
export default TicketDetailSummary;

