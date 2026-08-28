import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  actions?: PageHeaderAction[];
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  actions = [],
  children
}: PageHeaderProps) {
  return (
    <div className="border-b border-slate-200/80 bg-white px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {badge && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-slate-500 font-normal">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            const isPrimary = action.variant === 'primary';
            const isDanger = action.variant === 'danger';

            let btnClass = 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200';
            if (isPrimary) {
              btnClass = 'bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-xs';
            } else if (isDanger) {
              btnClass = 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200';
            }

            return (
              <button
                key={idx}
                onClick={action.onClick}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${btnClass}`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {action.label}
              </button>
            );
          })}
          {children}
        </div>
      </div>
    </div>
  );
}
