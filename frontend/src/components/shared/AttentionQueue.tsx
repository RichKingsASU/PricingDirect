import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AttentionItem {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  details: string;
  metric?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface AttentionQueueProps {
  title?: string;
  count?: number;
  items: AttentionItem[];
}

export function AttentionQueue({
  title = 'Attention Queue',
  count,
  items
}: AttentionQueueProps) {
  const severityBadge = {
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    medium: 'bg-amber-50 text-amber-800 border-amber-200',
    low: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
            {title}
          </h3>
          {(count !== undefined ? count : items.length) > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
              {count !== undefined ? count : items.length}
            </span>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500">
          No active blockers or alerts in queue.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border ${
                      severityBadge[item.severity]
                    }`}
                  >
                    {item.severity}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {item.details}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {item.metric && (
                  <span className="text-xs font-bold tabular-nums text-rose-600">
                    {item.metric}
                  </span>
                )}
                {item.actionLabel && (
                  <button
                    onClick={item.onAction}
                    className="px-2 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  >
                    {item.actionLabel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
