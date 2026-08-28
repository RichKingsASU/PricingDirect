import React from 'react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenReports: () => void;
  onOpenSettings: () => void;
  teamContext?: 'Pricing Team' | 'Operations';
  onOpenReportIssue?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReports,
  onOpenSettings,
  teamContext = 'Pricing Team',
  onOpenReportIssue
}) => {
  return (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-[#D8E1EB] w-64 z-40 shrink-0">
      <div className="p-6 border-b border-[#D8E1EB]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 bg-[#1769FF] rounded flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          </div>
          <h2 className="font-bold text-lg text-[#0B1930] tracking-tight">Forrest Logistics</h2>
        </div>
        <div className="flex items-center justify-between ml-9">
          <p className="font-bold text-[10px] text-[#45474d] tracking-widest uppercase">
            {teamContext === 'Operations' ? 'Operations View' : 'Pricing Analyst Hub'}
          </p>
          {teamContext === 'Operations' && (
            <span className="bg-[#D58A16]/15 text-[#D58A16] font-extrabold text-[9px] px-1.5 py-0.2 rounded border border-[#D58A16]/30 uppercase">
              Read-Only
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 space-y-1">
        <button
          onClick={() => setActiveTab('target_control_tower')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
            activeTab === 'target_control_tower'
              ? 'text-[#1769FF] font-bold border-r-4 border-[#1769FF] bg-[#EAF2FF] shadow-sm'
              : 'text-[#45474d] hover:bg-[#F4F7FA] hover:text-[#0B1930]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          <span className="font-bold text-xs uppercase tracking-wider">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('rate_directory')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
            activeTab === 'rate_directory'
              ? 'text-[#1769FF] font-bold border-r-4 border-[#1769FF] bg-[#EAF2FF] shadow-sm'
              : 'text-[#45474d] hover:bg-[#F4F7FA] hover:text-[#0B1930]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          <span className="font-bold text-xs uppercase tracking-wider">Rate Directory</span>
        </button>

        {teamContext !== 'Operations' ? (
          <button
            onClick={() => setActiveTab('data_management')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
              activeTab === 'data_management'
                ? 'text-[#1769FF] font-bold border-r-4 border-[#1769FF] bg-[#EAF2FF] shadow-sm'
                : 'text-[#45474d] hover:bg-[#F4F7FA] hover:text-[#0B1930]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">database</span>
            <span className="font-bold text-xs uppercase tracking-wider">Data Management</span>
          </button>
        ) : (
          <div
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-[#94A3B8] bg-[#F8FAFC] border border-[#E2E8F0] cursor-not-allowed opacity-75"
            title="Data Management is restricted for Operations role"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">database</span>
              <span className="font-bold text-xs uppercase tracking-wider line-through">Data Management</span>
            </div>
            <span className="material-symbols-outlined text-xs text-[#94A3B8]">lock</span>
          </div>
        )}

        <button
          onClick={onOpenReports}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#45474d] hover:bg-[#F4F7FA] hover:text-[#0B1930] transition-all text-left"
        >
          <span className="material-symbols-outlined text-[20px]">description</span>
          <span className="font-bold text-xs uppercase tracking-wider">Reports</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#45474d] hover:bg-[#F4F7FA] hover:text-[#0B1930] transition-all text-left"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="font-bold text-xs uppercase tracking-wider">Settings</span>
        </button>

        {/* Dedicated Report Issue Section for Operations */}
        {onOpenReportIssue && (
          <div className="pt-4 border-t border-[#D8E1EB] mt-4">
            <button
              onClick={onOpenReportIssue}
              className="w-full py-2.5 px-3 bg-[#D58A16] hover:bg-[#B46E0E] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">flag</span>
              <span>Report Issue to Pricing</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#D8E1EB] space-y-1">
        <a
          href="#support"
          onClick={(e) => {
            e.preventDefault();
            alert('Forrest Logistics Support Hotline: 1-800-555-FORREST\nEmail: pricing-support@forrestlogistics.com');
          }}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-[#45474d] hover:bg-[#F4F7FA] transition-all text-xs font-medium"
        >
          <span className="material-symbols-outlined text-[18px]">help</span>
          <span>Support & Help</span>
        </a>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#64748B] text-xs bg-[#F8FAFC] border border-[#E2E8F0]/60 mt-1">
          <span className="material-symbols-outlined text-[18px] text-[#1769FF]">verified_user</span>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-[#0B1930] text-[11px]">Direct Access Mode</span>
            <span className="text-[10px] text-[#64748B]">All Modules Unlocked</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
