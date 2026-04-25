import React from 'react';
type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
};
export function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <span className="text-zinc-400 text-sm font-medium">{title}</span>
        {icon && <div className="text-lime-400">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
      {subtitle && <div className="text-zinc-500 text-xs mt-2">{subtitle}</div>}
    </div>);

}