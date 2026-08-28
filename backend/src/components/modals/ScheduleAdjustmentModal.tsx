import React, { useState } from 'react';
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

  const [title, setTitle] = useState('LA/LB Market Target Shift +1.5%');
  const [changePercent, setChangePercent] = useState<number>(1.5);
  const [effectiveDate, setEffectiveDate] = useState('7/15/2026');
  const [notes, setNotes] = useState('Target rate adjustment based on weekly carrier load pay export');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPlannedAdjustment({
      id: `adj-${Date.now()}`,
      title,
      changePercent,
      status: 'Pending Approval',
      effectiveDate,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1930]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#D8E1EB] overflow-hidden">
        <div className="px-6 py-4 bg-[#0B1930] text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1769FF]">event_repeat</span>
            <h3 className="font-bold text-sm uppercase tracking-wider">Schedule New Target Adjustment</h3>
          </div>
          <button onClick={onClose} className="text-[#7784a0] hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Decision Facts Benchmark */}
          <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#D8E1EB] space-y-2">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-1.5">
              <span className="font-bold text-[10px] text-[#64748B] uppercase tracking-wider block">
                Decision Benchmark Facts
              </span>
              <span className="bg-[#178A68]/10 text-[#178A68] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Active Week 27 Data
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                <span className="font-bold text-[9px] text-[#64748B] uppercase block">Target</span>
                <span className="font-bold text-xs text-[#0F172A] tabular-nums mt-0.5 block">$1,420</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                <span className="font-bold text-[9px] text-[#64748B] uppercase block">Actual Pay</span>
                <span className="font-bold text-xs text-[#1769FF] tabular-nums mt-0.5 block">$1,680</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                <span className="font-bold text-[9px] text-[#64748B] uppercase block">Variance</span>
                <span className="font-bold text-xs text-[#D58A16] tabular-nums mt-0.5 block">+$260</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                <span className="font-bold text-[9px] text-[#64748B] uppercase block">Volume</span>
                <span className="font-bold text-xs text-[#0F172A] tabular-nums mt-0.5 block">184 loads</span>
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-[10px] text-[#45474d] uppercase block mb-1">Adjustment Description / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. LA/LB Market Target Shift +1.5%"
              className="w-full bg-white border border-[#D8E1EB] rounded-lg p-2 font-bold text-[#0B1930] focus:ring-[#1769FF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[10px] text-[#45474d] uppercase block mb-1">Percentage Shift (%)</label>
              <input
                type="number"
                step="0.1"
                value={changePercent}
                onChange={(e) => setChangePercent(Number(e.target.value))}
                className="w-full bg-white border border-[#D8E1EB] rounded-lg p-2 font-bold text-[#0B1930]"
              />
            </div>

            <div>
              <label className="font-bold text-[10px] text-[#45474d] uppercase block mb-1">Effective Date</label>
              <input
                type="text"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full bg-white border border-[#D8E1EB] rounded-lg p-2 font-bold text-[#0B1930]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[10px] text-[#45474d] uppercase block mb-1">Reason / Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-white border border-[#D8E1EB] rounded-lg p-2 text-[#0B1930]"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-[#D8E1EB] text-[#0B1930] font-bold rounded-lg hover:bg-[#F4F7FA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-[#1769FF] text-white font-bold rounded-lg hover:bg-[#1769FF]/90 shadow-md"
            >
              Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
