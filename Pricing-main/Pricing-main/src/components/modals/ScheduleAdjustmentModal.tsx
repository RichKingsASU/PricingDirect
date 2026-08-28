import React, { useState } from 'react';
import { CalendarClock, X, ArrowUpRight, ArrowDownRight, Send } from 'lucide-react';
import { PlannedAdjustment } from '../../types';

interface ScheduleAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlannedAdjustment: (adj: PlannedAdjustment) => void;
}

export const ScheduleAdjustmentModal: React.FC<ScheduleAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onAddPlannedAdjustment
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const [targetScope, setTargetScope] = useState<string>('Oakland Market');
  const [title, setTitle] = useState('Oakland Port Drayage Target Shift +2.0%');
  const [changePercent, setChangePercent] = useState<number>(2.0);
  const [effectiveDate, setEffectiveDate] = useState('2026-07-06');
  const [submitterName, setSubmitterName] = useState('Pricing Team (Pricing Analyst)');
  const [notes, setNotes] = useState(
    'Target benchmark adjustment based on weekly carrier load pay variance and terminal wait times.'
  );

  const handleScopeChange = (scope: string) => {
    setTargetScope(scope);
    if (scope === 'Oakland Market') {
      setTitle('Oakland Port Drayage Target Shift +2.0%');
    } else if (scope === 'LA/LB Corridor') {
      setTitle('LA/LB → Inland Empire Target Shift +1.5%');
    } else if (scope === 'Seattle Port') {
      setTitle('Seattle Port Local Drayage Target Shift +1.8%');
    } else if (scope === 'Chicago Hub') {
      setTitle('Chicago Rail Ramp Target Shift -1.0%');
    } else {
      setTitle(`${scope} Rate Target Shift ${changePercent >= 0 ? '+' : ''}${changePercent}%`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPlannedAdjustment({
      id: `adj-${Date.now()}`,
      title,
      targetMarketOrLane: targetScope,
      changePercent,
      status: 'Pending Approval',
      effectiveDate,
      submittedBy: submitterName,
      submittedDate: new Date().toLocaleDateString('en-US'),
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-[#CBD5E1] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B1930] text-white flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1769FF]/20 text-[#38BDF8] flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Enter New Target Rate Adjustment</h3>
              <p className="text-[11px] text-[#94A3B8]">Submit pricing proposal for General Manager / VP approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Scope / Market */}
          <div>
            <label className="font-bold text-[10px] text-[#475569] uppercase block mb-1">
              Target Market or Corridor
            </label>
            <select
              value={targetScope}
              onChange={(e) => handleScopeChange(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-bold text-[#0F172A] focus:ring-2 focus:ring-[#1769FF] focus:outline-none"
            >
              <option value="Oakland Market">Oakland Market (Northern California)</option>
              <option value="LA/LB Corridor">LA/LB Corridor (Southern California / Inland Empire)</option>
              <option value="Seattle Port">Seattle / Tacoma Port (Pacific NW)</option>
              <option value="Chicago Hub">Chicago Midwest Rail Ramp</option>
              <option value="All Southwest Corridors">All Southwest Corridors (SW Region)</option>
              <option value="All Southeast Corridors">All Southeast Corridors (SE Region)</option>
            </select>
          </div>

          {/* Adjustment Title */}
          <div>
            <label className="font-bold text-[10px] text-[#475569] uppercase block mb-1">
              Adjustment Description / Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Oakland Port Drayage Target Shift +2.0%"
              className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-bold text-[#0F172A] focus:ring-2 focus:ring-[#1769FF] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Percentage Shift */}
            <div>
              <label className="font-bold text-[10px] text-[#475569] uppercase block mb-1">
                Target Shift (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={changePercent}
                  onChange={(e) => setChangePercent(Number(e.target.value))}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-bold text-[#0F172A] focus:ring-2 focus:ring-[#1769FF] focus:outline-none pr-8"
                />
                <span className="absolute right-2.5 top-2 text-[#64748B] font-bold">%</span>
              </div>
            </div>

            {/* Proposed Effective Date */}
            <div>
              <label className="font-bold text-[10px] text-[#475569] uppercase block mb-1">
                Proposed Effective Date
              </label>
              <input
                type="date"
                required
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-bold text-[#0F172A] focus:ring-2 focus:ring-[#1769FF] focus:outline-none"
              />
            </div>
          </div>

          {/* Submitter info */}
          <div>
            <label className="font-bold text-[10px] text-[#475569] uppercase block mb-1">
              Pricing Submitter / Analyst
            </label>
            <input
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-semibold text-[#0F172A] focus:ring-2 focus:ring-[#1769FF] focus:outline-none"
            />
          </div>

          {/* Pricing Justification */}
          <div>
            <label className="font-bold text-[10px] text-[#475569] uppercase block mb-1">
              Pricing Reason / Analysis Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#0F172A] focus:ring-2 focus:ring-[#1769FF] focus:outline-none"
            />
          </div>

          {/* Workflow Explanation Banner */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3 text-[11px] text-[#1E40AF] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-base text-[#1D4ED8] mt-0.5">verified_user</span>
            <div>
              <span className="font-bold block">Approval Workflow:</span>
              Once saved, this adjustment enters <strong>Pending GM Approval</strong> status. The General Manager or VP can review, choose/override the effective date, and make it active anytime.
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 border-t border-[#E2E8F0] flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] font-semibold rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#1769FF] text-white font-bold rounded-lg hover:bg-[#1769FF]/90 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Submit for GM Approval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
