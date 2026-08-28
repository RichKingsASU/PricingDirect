import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  isActive?: boolean;
  onClick?: () => void;
  badge?: string;
}

export function MetricCard({
  label,
  value,
  subValue,
  icon: Icon,
  variant = 'default',
  trendText,
  isActive = false,
  onClick,
  badge
}: MetricCardProps) {
  const variantStyles = {
    default: 'border-slate-200 hover:border-slate-300 text-slate-900',
    success: 'border-emerald-200 bg-emerald-50/40 text-emerald-950',
    warning: 'border-amber-200 bg-amber-50/40 text-amber-950',
    danger: 'border-rose-200 bg-rose-50/40 text-rose-950',
    info: 'border-sky-200 bg-sky-50/40 text-sky-950'
  };

  const iconColors = {
    default: 'text-slate-600 bg-slate-100',
    success: 'text-emerald-700 bg-emerald-100',
    warning: 'text-amber-700 bg-amber-100',
    danger: 'text-rose-700 bg-rose-100',
    info: 'text-sky-700 bg-sky-100'
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all duration-150 bg-white ${
        variantStyles[variant]
      } ${
        onClick ? 'cursor-pointer hover:shadow-sm' : ''
      } ${
        isActive ? 'ring-2 ring-blue-600 border-transparent shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          {label}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-lg ${iconColors[variant]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </span>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
            {badge}
          </span>
        )}
      </div>

      {(subValue || trendText) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
          {subValue && <span>{subValue}</span>}
          {trendText && (
            <span className="font-medium text-slate-500">{trendText}</span>
          )}
        </div>
      )}
    </div>
  );
}
