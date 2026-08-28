import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, variant, size = 'sm' }: StatusBadgeProps) {
  // Infer semantic variant if not explicitly provided
  const resolvedVariant = variant || (() => {
    const s = status.toLowerCase();
    if (s.includes('under') || s.includes('healthy') || s.includes('awarded') || s.includes('verified') || s.includes('active') || s.includes('pass')) {
      return 'success';
    }
    if (s.includes('0-5%') || s.includes('pending') || s.includes('mapped') || s.includes('review') || s.includes('spot')) {
      return 'warning';
    }
    if (s.includes('5%+') || s.includes('tight') || s.includes('error') || s.includes('high') || s.includes('danger') || s.includes('expired')) {
      return 'danger';
    }
    if (s.includes('low confidence') || s.includes('syncing') || s.includes('info')) {
      return 'info';
    }
    return 'neutral';
  })();

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const variantClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md border whitespace-nowrap ${sizeClasses} ${variantClasses[resolvedVariant]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {status}
    </span>
  );
}
