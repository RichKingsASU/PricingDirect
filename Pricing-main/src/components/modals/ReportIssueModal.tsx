import React, { useState, useEffect } from 'react';
import { Flag, X, Check, Send } from 'lucide-react';
import { ReportedIssue } from '../../types';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmit: (report: ReportedIssue) => void;
  prefilledLane?: string;
  prefilledLoadNo?: string;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  onReportSubmit,
  prefilledLane = '',
  prefilledLoadNo = ''
}) => {
  const [issueType, setIssueType] = useState<string>('Target Rate Too Low (Under Market)');
  const [laneInfo, setLaneInfo] = useState<string>(prefilledLane);
  const [loadNo, setLoadNo] = useState<string>(prefilledLoadNo);
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High (Active Load)' | 'Urgent / Ship Today'>('High (Active Load)');
  const [description, setDescription] = useState<string>('');
  const [reportedBy, setReportedBy] = useState<string>('Operations Analyst / Dispatch');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (prefilledLane) setLaneInfo(prefilledLane);
      if (prefilledLoadNo) setLoadNo(prefilledLoadNo);
      setSubmittedMessage(null);
    }
  }, [isOpen, prefilledLane, prefilledLoadNo]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter a brief description of the issue.');
      return;
    }

    const reportId = `RPT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport: ReportedIssue = {
      id: reportId,
      issueType,
      laneInfo: laneInfo.trim() || 'General Market Corridor',
      loadNo: loadNo.trim() || undefined,
      urgency,
      description: description.trim(),
      reportedBy: reportedBy.trim() || 'Operations Dispatch',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Open / Dispatched to Pricing'
    };

    onReportSubmit(newReport);
    setSubmittedMessage(`Issue #${reportId} successfully reported & dispatched to Pricing Team!`);

    setTimeout(() => {
      setSubmittedMessage(null);
      setDescription('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Report Issue to Pricing Team</h2>
              <p className="text-[11px] text-slate-400">Alert pricing analysts to target rate or capacity discrepancies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {submittedMessage ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">{submittedMessage}</h3>
            <p className="text-xs text-slate-500">An urgent notification alert has been sent to the Pricing Team queue.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
            {/* Issue Type */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 uppercase text-[10px] tracking-wider">
                Issue Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Target Rate Too Low (Under Market)">Target Rate Too Low (Carriers rejecting rate)</option>
                <option value="Target Rate Too High (Over Paying)">Target Rate Too High (Over market target)</option>
                <option value="Missing Rate Lane / Tariff">Missing Customer Rate / Tariff Schedule</option>
                <option value="Carrier Capacity / Dwell Issue">Carrier Capacity / Port Dwell Bottleneck</option>
                <option value="Chassis Tariff Discrepancy">Chassis Tariff Discrepancy</option>
                <option value="Other Operations Inquiry">Other Operations Inquiry</option>
              </select>
            </div>

            {/* Lane & Load Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase text-[10px] tracking-wider">
                  Origin → Destination / Lane
                </label>
                <input
                  type="text"
                  placeholder="e.g. Oakland, CA → Stockton, CA"
                  value={laneInfo}
                  onChange={(e) => setLaneInfo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase text-[10px] tracking-wider">
                  Load # / Container # (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. LD483410 / MSCU982140"
                  value={loadNo}
                  onChange={(e) => setLoadNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 uppercase text-[10px] tracking-wider">
                Urgency Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Low', label: 'Low', color: 'bg-slate-100 text-slate-700' },
                  { id: 'Medium', label: 'Medium', color: 'bg-blue-50 text-blue-700' },
                  { id: 'High (Active Load)', label: 'High', color: 'bg-amber-50 text-amber-800' },
                  { id: 'Urgent / Ship Today', label: 'Urgent', color: 'bg-rose-50 text-rose-700' }
                ].map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUrgency(u.id as any)}
                    className={`py-1.5 px-2 rounded-lg border font-bold text-[11px] transition-all text-center cursor-pointer ${
                      urgency === u.id
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : `border-slate-200 ${u.color} hover:border-blue-400`
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 uppercase text-[10px] tracking-wider">
                Detailed Issue Description / Reason <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe the discrepancy, market conditions, carrier feedback, or requested rate override..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                required
              />
            </div>

            {/* Reported By */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 uppercase text-[10px] tracking-wider">
                Your Name / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Operations Dispatch (Mike R.)"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Report to Pricing Team</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
