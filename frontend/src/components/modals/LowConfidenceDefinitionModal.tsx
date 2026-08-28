import React from 'react';
import {
  HelpCircle,
  X,
  AlertTriangle,
  Layers,
  TrendingDown,
  FileQuestion,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  BarChart3
} from 'lucide-react';

interface LowConfidenceDefinitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterLowConfidence?: () => void;
  lowConfidenceCount?: number;
  lowConfidencePercent?: number;
}

export const LowConfidenceDefinitionModal: React.FC<LowConfidenceDefinitionModalProps> = ({
  isOpen,
  onClose,
  onFilterLowConfidence,
  lowConfidenceCount = 40,
  lowConfidencePercent = 4
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="low-confidence-definition-modal"
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-[#D8E1EB] overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1930] to-[#14213D] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center text-[#FBBF24]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Low Confidence Benchmark Definition
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Understanding statistical criteria, sample thresholds, and operational review
              </p>
            </div>
          </div>
          <button
            id="close-low-confidence-modal-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#CBD5E1] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Overview Banner */}
          <div className="bg-[#FFFBEB] border border-[#FCD34D] p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div className="text-xs text-[#92400E] leading-relaxed">
              <strong className="font-bold text-[#78350F] block text-sm mb-1">
                What does the Low Confidence metric mean?
              </strong>
              The <strong>Low Confidence</strong> card highlights freight lanes and rate benchmarks that lack sufficient statistical density, carrier stability, or contractual rate history to establish an authoritative target rate with high certainty.
            </div>
          </div>

          {/* Current Snapshot Stats */}
          <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
            <div>
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Current Low Confidence Volume
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#0F172A] tabular-nums">
                  {lowConfidenceCount}
                </span>
                <span className="text-xs font-bold text-[#64748B]">loads / exceptions</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Share of Total Network Volume
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#D97706] tabular-nums">
                  {lowConfidencePercent}%
                </span>
                <span className="text-xs font-bold text-[#64748B]">of analyzed volume</span>
              </div>
            </div>
          </div>

          {/* 4 Core Classification Criteria */}
          <div>
            <h3 className="text-xs font-extrabold text-[#0B1930] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#1769FF]" />
              <span>4 Criteria Triggering Low Confidence</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Criterion 1 */}
              <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl hover:border-[#1769FF]/40 transition-all shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-[#EAF2FF] text-[#1769FF] flex items-center justify-center font-black text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-xs text-[#0B1930]">Low Sample Volume (&lt; 5 Loads)</h4>
                </div>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  Lanes with fewer than 5 recorded runs in the target week. Thin transaction counts mean one outlier spot move can artificially skew the average.
                </p>
              </div>

              {/* Criterion 2 */}
              <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl hover:border-[#1769FF]/40 transition-all shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-black text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-xs text-[#0B1930]">High Spot Rate Dispersion (&gt; 20%)</h4>
                </div>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  Lanes where actual paid carrier rates exhibit high volatility between runs without a dedicated primary contracted carrier.
                </p>
              </div>

              {/* Criterion 3 */}
              <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl hover:border-[#1769FF]/40 transition-all shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-[#F1F5F9] text-[#475569] flex items-center justify-center font-black text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-xs text-[#0B1930]">Unmatched Contract Benchmark</h4>
                </div>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  Newly observed Origin-Destination pairings without a signed tariff in the Customer Rate Directory, relying on regional fallback formulas.
                </p>
              </div>

              {/* Criterion 4 */}
              <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl hover:border-[#1769FF]/40 transition-all shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center font-black text-xs">
                    4
                  </div>
                  <h4 className="font-bold text-xs text-[#0B1930]">Accessorial or Detour Distortions</h4>
                </div>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  Loads with temporary chassis split fees, extreme port wait times, or hazmat detours that temporarily distort true baseline linehaul costs.
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Operational Workflows */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-4 rounded-xl">
            <h4 className="text-xs font-bold text-[#166534] mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#15803D]" />
              <span>Recommended Operational Next Steps</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-[#14532D]">
              <li className="flex items-start gap-1.5">
                <span className="text-[#15803D] font-bold">•</span>
                <span><strong>Pricing Review:</strong> Dispatch spot loads to Pricing Analyst for manual rate validation before adjusting the master target.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#15803D] font-bold">•</span>
                <span><strong>Mini-Bids:</strong> Request mini-bids from top preferred carriers to establish a firm contractual baseline.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#15803D] font-bold">•</span>
                <span><strong>Rate Directory Entry:</strong> Once 5+ loads are run consistently, formalize the lane in the Rate Directory.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#F8FAFC] px-6 py-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
          <button
            id="close-low-confidence-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#CBD5E1] text-[#475569] hover:text-[#0B1930] hover:bg-[#F1F5F9] font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>

          {onFilterLowConfidence && (
            <button
              id="filter-low-confidence-action-btn"
              type="button"
              onClick={() => {
                onFilterLowConfidence();
                onClose();
              }}
              className="px-4 py-2 bg-[#1769FF] hover:bg-[#1769FF]/90 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Filter & Inspect Low Confidence Lanes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
