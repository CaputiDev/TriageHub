import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  valueColorClass?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  valueColorClass = 'text-slate-850 dark:text-white text-slate-800'
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 border border-slate-205 border-slate-200 dark:border-slate-905 dark:border-slate-900 rounded-xl">
      <p className="text-[10px] text-slate-505 text-slate-500 dark:text-slate-405 dark:text-slate-400 font-medium">{label}</p>
      <p className={`text-xl font-bold mt-1 ${valueColorClass}`}>{value}</p>
    </div>
  );
};
