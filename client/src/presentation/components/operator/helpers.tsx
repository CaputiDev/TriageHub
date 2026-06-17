

export const getFuncaoLabel = (funcao?: string) => {
  switch (funcao) {
    case 'suporte_ti_1': return 'Suporte de TI 1';
    case 'suporte_ti_2': return 'Suporte de TI 2';
    case 'suporte_ti_3': return 'Suporte de TI 3';
    case 'suporte_juridico': return 'Suporte Jurídico';
    case 'analista_consumidor': return 'Analista de Suporte ao Consumidor';
    default: return 'Atendente';
  }
};

export const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'critical':
      return <span className="text-[10px] font-bold text-red-500">[Crítico]</span>;
    case 'high':
      return <span className="text-[10px] font-semibold text-amber-500">[Alto]</span>;
    case 'medium':
      return <span className="text-[10px] text-text-muted">[Médio]</span>;
    default:
      return <span className="text-[10px] text-text-muted">[Baixo]</span>;
  }
};

export const getStressProgressBar = (level: number) => {
  const percentage = (level / 5) * 100;
  let color: string;
  if (level === 5) color = 'bg-red-500';
  else if (level >= 3) color = 'bg-amber-500';
  else color = 'bg-secondary';

  return (
    <div className="w-full bg-border-subtle rounded-full h-1 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};
