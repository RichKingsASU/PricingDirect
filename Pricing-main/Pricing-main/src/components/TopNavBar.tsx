import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  Flag, 
  Lock, 
  X,
  Truck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ActiveTab } from '../types';

interface TopNavBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  teamContext: 'Pricing Team' | 'Operations';
  setTeamContext: (context: 'Pricing Team' | 'Operations') => void;
  onOpenSettings: () => void;
  onOpenReportIssue?: () => void;
  reportedCount?: number;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  teamContext,
  setTeamContext,
  onOpenSettings,
  onOpenReportIssue,
  reportedCount = 0
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    ...(reportedCount > 0
      ? [{ id: 'nr1', title: `${reportedCount} Operations Issue(s) Dispatched to Pricing`, time: 'Just now', unread: true }]
      : []),
    { id: 'n1', title: 'Oakland Market variance high (+6.2% vs target)', time: '10 mins ago', unread: true },
    { id: 'n2', title: 'Direct Carrier Bids imported for Q3 baseline', time: '1 hour ago', unread: true },
    { id: 'n3', title: 'Target adjustment for Chicago -> Atlanta scheduled', time: '3 hours ago', unread: false }
  ];

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-xs">
      <div className="flex items-center h-14 w-full px-4 sm:px-6 gap-3">
        {/* Navigation Switcher Tabs */}
        <nav className="hidden lg:flex items-center h-full space-x-1 shrink-0">
          <button
            onClick={() => setActiveTab('target_control_tower')}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
              activeTab === 'target_control_tower'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Control Tower
          </button>
          <button
            onClick={() => setActiveTab('rate_directory')}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
              activeTab === 'rate_directory'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Rate Directory
          </button>

          {teamContext !== 'Operations' ? (
            <button
              onClick={() => setActiveTab('data_management')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                activeTab === 'data_management'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Data & Capacity
            </button>
          ) : (
            <span
              className="px-3 py-1.5 rounded-md font-semibold text-xs text-slate-500 cursor-not-allowed opacity-60 flex items-center gap-1"
              title="Data Management is restricted in Operations View"
            >
              <Lock className="w-3 h-3" />
              <span>Data & Capacity</span>
            </span>
          )}
        </nav>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl mx-2 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, origin, destination, ZIP, lane ID, carrier target..."
            className="w-full bg-slate-950/70 border border-slate-700/80 rounded-lg py-1.5 pl-8 pr-7 text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right Utility Actions */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          {/* Persona Role Switcher */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setTeamContext('Pricing Team')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                teamContext === 'Pricing Team'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => setTeamContext('Operations')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                teamContext === 'Operations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Operations
            </button>
          </div>

          {/* Report Issue Button */}
          {onOpenReportIssue && (
            <button
              onClick={onOpenReportIssue}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                teamContext === 'Operations'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Report an issue or target rate override request to Pricing Team"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report Issue</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    Governance & Event Log
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                    3 Active
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer ${
                        n.unread ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="font-semibold text-slate-900">{n.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[11px] font-bold text-white shadow-xs">
              KR
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
