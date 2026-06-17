import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  valueColorClass?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  valueColorClass = 'text-text-main'
}) => {
  return (
    <div className="bg-bg-panel p-3.5 border border-border-subtle rounded-xl">
      <p className="text-[10px] text-text-muted font-medium">{label}</p>
      <p className={`text-xl font-bold mt-1 ${valueColorClass}`}>{value}</p>
    </div>
  );
};
