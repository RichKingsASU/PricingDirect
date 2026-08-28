import React from 'react';
import { 
  BarChart3, 
  Table, 
  Database, 
  Layers, 
  FileText, 
  Settings, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenReportModal?: () => void;
  onOpenSettingsModal?: () => void;
  onOpenReportsHubModal?: () => void;
  openIssuesCount?: number;
}

export function Sidebar({
  activeTab,
  onTabChange,
  onOpenReportModal,
  onOpenSettingsModal,
  onOpenReportsHubModal,
  openIssuesCount = 0
}: SidebarProps) {
  const primaryNavItems = [
    {
      id: 'target_control_tower' as ActiveTab,
      label: 'Target Control Tower',
      description: 'Variance analytics & lane triage',
      icon: BarChart3,
      badge: 'Live'
    },
    {
      id: 'rate_directory' as ActiveTab,
      label: 'Rate & Carrier Target Directory',
      description: 'Customer contracts & carrier targets',
      icon: Table
    },
    {
      id: 'data_management' as ActiveTab,
      label: 'Data & Capacity Matrix',
      description: 'Data ingestion & carrier networks',
      icon: Database
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black shadow-xs">
            FL
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight leading-none">
              FORREST
            </div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
              Capacity & Pricing AI
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Group */}
      <div className="px-3 py-4 flex-1 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Operational Workspaces
          </div>
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Tools & Intelligence */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Governance & Reports
          </div>
          <div className="space-y-1">
            <button
              onClick={onOpenReportsHubModal}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Reports & Exports</span>
              </div>
            </button>

            <button
              onClick={onOpenReportModal}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <span>Report Pricing Issue</span>
              </div>
              {openIssuesCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {openIssuesCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenSettingsModal}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>System Parameters</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-slate-300">Rate Engine Active</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold">2026.Q3</span>
        </div>
      </div>
    </aside>
  );
}
