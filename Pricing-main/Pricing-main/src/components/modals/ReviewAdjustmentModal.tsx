import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  UserCheck,
  FileText,
  AlertTriangle,
  X,
  TrendingUp,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { PlannedAdjustment } from '../../types';

interface ReviewAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjustment: PlannedAdjustment | null;
  onApprove: (
    id: string,
    effectiveDate: string,
    approvedBy: string,
    approvalNotes?: string,
    adjustedPercent?: number
  ) => void;
  onReject: (id: string, reason: string) => void;
}

export const ReviewAdjustmentModal: React.FC<ReviewAdjustmentModalProps> = ({
  isOpen,
  onClose,
  adjustment,
  onApprove,
  onReject
}) => {
  if (!isOpen || !adjustment) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const [effectiveDate, setEffectiveDate] = useState<string>(
    adjustment.effectiveDate.includes('-')
      ? adjustment.effectiveDate
      : adjustment.effectiveDate || todayStr
  );
  const [approverRole, setApproverRole] = useState<string>('General Manager');
  const [approvalNotes, setApprovalNotes] = useState<string>(
    'Approved by General Manager for immediate operational target rate sync.'
  );
  const [adjustedPercent, setAdjustedPercent] = useState<number>(adjustment.changePercent);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApprove(
      adjustment.id,
      effectiveDate,
      approverRole,
      approvalNotes,
      adjustedPercent !== adjustment.changePercent ? adjustedPercent : undefined
    );
    onClose();
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    onReject(adjustment.id, rejectionReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-[#CBD5E1] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B1930] text-white flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1769FF]/20 text-[#38BDF8] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">General Manager / VP Target Review</h3>
              <p className="text-[11px] text-[#94A3B8]">Approve, schedule, or put target adjustment into effect</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isRejecting ? (
          <form onSubmit={handleApproveSubmit} className="p-6 space-y-4 text-xs">
            {/* Adjustment Proposal Summary */}
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block">
                    Proposed Adjustment
                  </span>
                  <h4 className="font-extrabold text-sm text-[#0F172A] mt-0.5">{adjustment.title}</h4>
                </div>
                <div
                  className={`px-2.5 py-1 rounded-lg font-black text-xs flex items-center gap-1 ${
                    adjustedPercent >= 0
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                      : 'bg-[#EAF7EE] text-[#15803D] border border-[#BBF7D0]'
                  }`}
                >
                  {adjustedPercent >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>{adjustedPercent >= 0 ? `+${adjustedPercent}%` : `${adjustedPercent}%`}</span>
                </div>
              </div>

              {/* Submitter info */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#E2E8F0]">
                <div>
                  <span className="text-[#64748B]">Submitted By:</span>{' '}
                  <strong className="text-[#0F172A] font-semibold">
                    {adjustment.submittedBy || 'Pricing Team'}
                  </strong>
                </div>
                <div>
                  <span className="text-[#64748B]">Proposed Date:</span>{' '}
                  <strong className="text-[#0F172A] font-semibold">
                    {adjustment.effectiveDate}
                  </strong>
                </div>
              </div>

              {adjustment.notes && (
                <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] text-[#334155] text-[11px]">
                  <span className="font-bold text-[#64748B] block text-[10px] uppercase mb-0.5">
                    Pricing Team Justification:
                  </span>
                  {adjustment.notes}
                </div>
              )}
            </div>

            {/* General Manager Controls */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 text-[#0F172A] font-bold text-xs">
                <Sparkles className="w-4 h-4 text-[#1769FF]" />
                <span>Executive Approval Controls</span>
              </div>

              {/* Effective Date Selection */}
              <div>
                <label className="font-bold text-[10px] text-[#475569] uppercase block mb-1">
                  Target Effective Date (Select Date to Put In Effect)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="flex-1 bg-white border border-[#CBD5E1] rounded-lg p-2 font-bold text-[#0F172A] focus:ring-2 focus:ring-[#1769FF] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setEffectiveDate(todayStr)}
                    className="px-3 py-2 bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] font-bold text-[11px] rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Today / Immediate
                  </button>
                </div>
                <p className="text-[10px] text-[#64748B] mt-1">
                  Selected date will immediately update Control Tower benchmarks and active lanes.
                </p>
              </div>

              {/* Approver Role & Percentage Adjustment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[10px] text-[#475569] uppercase block mb-1">
                    Approver Authority
                  </label>
                  <select
                    value={approverRole}
                    onChange={(e) => setApproverRole(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-semibold text-[#0F172A] focus:ring-2 focus:ring-[#1769FF] focus:outline-none"
                  >
                    <option value="General Manager">General Manager</option>
                    <option value="VP of Logistics & Operations">VP of Logistics & Operations</option>
                    <option value="VP of Pricing">VP of Pricing</option>
                    <option value="Director of Drayage">Director of Drayage</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[10px] text-[#475569] uppercase block mb-1">
                    Confirmed Target Shift (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={adjustedPercent}
                    onChange={(e) => setAdjustedPercent(Number(e.target.value))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 font-bold text-[#0F172A] focus:ring-2 focus:ring-[#1769FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Executive Notes */}
              <div>
                <label className="font-bold text-[10px] text-[#475569] uppercase block mb-1">
                  General Manager Approval Notes & Instructions
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#0F172A] focus:ring-2 focus:ring-[#1769FF] focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-3.5 py-2 border border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEF2F2] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Put Into Effect</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Rejection Form */
          <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 text-xs">
            <div className="p-4 bg-[#FEF2F2] rounded-xl border border-[#FCA5A5] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-[#991B1B]">Reject Target Adjustment Proposal</h4>
                <p className="text-[11px] text-[#B91C1C] mt-0.5">
                  Provide feedback to the pricing team explaining why this target adjustment was declined.
                </p>
              </div>
            </div>

            <div>
              <label className="font-bold text-[10px] text-[#475569] uppercase block mb-1">
                Reason for Rejection *
              </label>
              <textarea
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Carrier market capacity has softened; hold current benchmark until next contract review."
                rows={3}
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:ring-2 focus:ring-[#DC2626] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRejecting(false)}
                className="px-4 py-2 border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] font-semibold rounded-lg cursor-pointer"
              >
                Back to Review
              </button>
              <button
                type="submit"
                disabled={!rejectionReason.trim()}
                className="px-5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-[#FCA5A5] text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
