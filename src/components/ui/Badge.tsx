import React from 'react';

type StatusType = 'Paid' | 'Pending' | 'Overdue' | 'Partial' | string;

export function StatusBadge({ status }: { status: StatusType }) {
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'paid') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold status-paid">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        Paid
      </span>
    );
  }
  if (statusLower === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold status-pending">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        Pending
      </span>
    );
  }
  if (statusLower === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold status-overdue">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
        Overdue
      </span>
    );
  }
  if (statusLower === 'partial') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold status-partial">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]" />
        Partial
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
      {status}
    </span>
  );
}

export function Chip({ children, variant = 'gray' }: { children: React.ReactNode, variant?: 'gray' | 'blue' | 'emerald' | 'amber' }) {
  const variants = {
    gray: 'bg-slate-100 text-slate-600 border border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold tracking-wide ${variants[variant]}`}>
      {children}
    </span>
  );
}
