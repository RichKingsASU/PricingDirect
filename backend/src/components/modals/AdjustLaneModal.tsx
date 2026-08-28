import React, { useState } from 'react';
import { LaneException, MarketSummary, CustomerRateLane } from '../../types';

interface AdjustLaneModalProps {
  item: LaneException | MarketSummary | CustomerRateLane | null;
  onClose: () => void;
  onSave: (updatedData: { id: string; target: number; changePercent: number; notes: string; excludeKeyAccounts?: boolean }) => void;
}

export const AdjustLaneModal: React.FC<AdjustLaneModalProps> = ({ item, onClose, onSave }) => {
  if (!item) return null;

  const isMarket = 'avgTarget' in item;
  const isCustomerLane = 'baseRate' in item;

  const isKeyAccountItem = !isMarket && !isCustomerLane && (item as LaneException).isKeyAccount;

  const title = isMarket
    ? `Adjust Market Target: ${(item as MarketSummary).name}`
    : isCustomerLane
    ? `Edit Rate: ${(item as CustomerRateLane).originCity} → ${(item as CustomerRateLane).destinationCity}`
    : `Adjust Lane Target: ${(item as LaneException).origin} → ${(item as LaneException).destination}`;

  const routeLabel = isMarket
    ? `${(item as MarketSummary).name} Market (${(item as MarketSummary).region} Region)`
    : isCustomerLane
    ? `${(item as CustomerRateLane).customerName} | ${(item as CustomerRateLane).originCity}, ${(item as CustomerRateLane).originState} → ${(item as CustomerRateLane).destinationCity}, ${(item as CustomerRateLane).destinationState}`
    : `${(item as LaneException).origin} → ${(item as LaneException).destination} (${(item as LaneException).market} Market)`;

  const currentTargetVal = isMarket
    ? (item as MarketSummary).avgTarget
    : isCustomerLane
    ? (item as CustomerRateLane).baseRate
    : (item as LaneException).currentTarget;

  const actualPayVal = isMarket
    ? (item as MarketSummary).avgActual
    : isCustomerLane
    ? Math.round((item as CustomerRateLane).baseRate * 1.08)
    : (item as LaneException).avgActual;

  const varDollarsVal = isMarket
    ? (item as MarketSummary).varianceDollars
    : isCustomerLane
    ? (item as CustomerRateLane).baseRate - Math.round((item as CustomerRateLane).baseRate * 1.08)
    : (item as LaneException).varDollars;

  const loadCount = isMarket
    ? (item as MarketSummary).loads
    : isCustomerLane
    ? 24
    : (item as LaneException).loads;

  const confidenceScore = isMarket
    ? 94
    : isCustomerLane
    ? (item as CustomerRateLane).carrierTargetMatch.matchPercent
    : (item as LaneException).confidence;

  const [targetVal, setTargetVal] = useState<number>(currentTargetVal);
  const [percentChange, setPercentChange] = useState<number>(0);
  const [excludeKeyAccounts, setExcludeKeyAccounts] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>(
    isKeyAccountItem
      ? 'Key Volume Account target reviewed separately under 1-year contract terms.'
      : 'Adjusted target based on weekly carrier load pay export analytics.'
  );

  const handlePercentChange = (val: number) => {
    setPercentChange(val);
    const newTarget = Math.round(currentTargetVal * (1 + val / 100));
    setTargetVal(newTarget);
  };

  const handleTargetChange = (val: number) => {
    setTargetVal(val);
    const p = Math.round(((val - currentTargetVal) / currentTargetVal) * 1000) / 10;
    setPercentChange(p);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: item.id,
      target: targetVal,
      changePercent: percentChange,
      notes,
      excludeKeyAccounts
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1930]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-[#D8E1EB] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B1930] text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1769FF]">tune</span>
            <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
          </div>
          <button onClick={onClose} className="text-[#7784a0] hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Decision Making Facts Panel */}
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#D8E1EB] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <div>
                <span className="font-bold text-[10px] text-[#64748B] uppercase tracking-wider block">
                  Route / Market Scope
                </span>
                <span className="font-bold text-xs text-[#0F172A]">{routeLabel}</span>
              </div>
              <span className="bg-[#EAF2FF] text-[#1769FF] border border-[#1769FF]/20 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                {confidenceScore}% Confidence
              </span>
            </div>

            {/* Facts Grid */}
            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
                <span className="font-bold text-[9px] text-[#64748B] uppercase block">Target</span>
                <span className="font-extrabold text-sm text-[#0F172A] tabular-nums mt-0.5 block">
                  ${currentTargetVal.toLocaleString()}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
                <span className="font-bold text-[9px] text-[#64748B] uppercase block">Actual Pay</span>
                <span className="font-extrabold text-sm text-[#1769FF] tabular-nums mt-0.5 block">
                  ${actualPayVal.toLocaleString()}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
                <span className="font-bold text-[9px] text-[#64748B] uppercase block">Variance</span>
                <span
                  className={`font-extrabold text-sm tabular-nums mt-0.5 block ${
                    varDollarsVal > 0 ? 'text-[#D58A16]' : 'text-[#178A68]'
                  }`}
                >
                  {varDollarsVal > 0 ? `+$${varDollarsVal}` : `-$${Math.abs(varDollarsVal)}`}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
                <span className="font-bold text-[9px] text-[#64748B] uppercase block">Volume</span>
                <span className="font-extrabold text-sm text-[#0F172A] tabular-nums mt-0.5 block">
                  {loadCount} loads
                </span>
              </div>
            </div>
          </div>

          {/* Quick Target Preview */}
          <div className="p-3 bg-[#EAF2FF] rounded-xl border border-[#1769FF]/30 flex justify-between items-center">
            <div>
              <span className="font-bold text-[10px] text-[#45474d] uppercase block">Current Target</span>
              <span className="font-extrabold text-lg text-[#0B1930] tabular-nums">${currentTargetVal.toLocaleString()}</span>
            </div>
            <span className="material-symbols-outlined text-[#1769FF] text-xl">arrow_forward</span>
            <div className="text-right">
              <span className="font-bold text-[10px] text-[#45474d] uppercase block">New Target Adjustment</span>
              <span className="font-extrabold text-lg text-[#1769FF] tabular-nums">${targetVal.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick Percentage Shift */}
          <div>
            <label className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider block mb-1">
              Quick Percentage Adjustment
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[-5, -2.5, 0, 2.5, 5].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentChange(pct)}
                  className={`py-1.5 rounded-lg font-bold transition-all ${
                    percentChange === pct
                      ? 'bg-[#1769FF] text-white shadow-sm'
                      : 'bg-[#F4F7FA] text-[#0B1930] border border-[#D8E1EB] hover:bg-[#d3e4fe]'
                  }`}
                >
                  {pct > 0 ? `+${pct}%` : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Dollar Target */}
          <div>
            <label className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider block mb-1">
              Exact Target Rate ($ USD)
            </label>
            <input
              type="number"
              value={targetVal}
              onChange={(e) => handleTargetChange(Number(e.target.value))}
              className="w-full bg-white border border-[#D8E1EB] rounded-lg px-3 py-2 text-sm font-bold text-[#0B1930] focus:ring-[#1769FF] focus:border-[#1769FF] focus:outline-none"
            />
          </div>

          {/* Key Volume Accounts Contracted Rates Protection Toggle */}
          <div className="p-3.5 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl flex items-start gap-3">
            <input
              type="checkbox"
              id="excludeKeyAccounts"
              checked={excludeKeyAccounts}
              onChange={(e) => setExcludeKeyAccounts(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#312E81] text-[#1769FF] focus:ring-[#1769FF] cursor-pointer"
            />
            <div className="space-y-0.5">
              <label htmlFor="excludeKeyAccounts" className="font-extrabold text-xs text-[#0F172A] cursor-pointer flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#312E81]">lock</span>
                <span>Exclude Key Volume Accounts (Preserve 1-Year Contracted Rates)</span>
              </label>
              <p className="text-[11px] text-[#475569] leading-relaxed">
                Key accounts have locked 1-year contracted rates. When checked, general target adjustments will bypass key contracted accounts so their rates remain at original contracted amounts when viewed.
              </p>
            </div>
          </div>

          {/* Rationale & Notes */}
          <div>
            <label className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider block mb-1">
              Adjustment Rationale & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-[#D8E1EB] rounded-lg p-2.5 text-xs text-[#0B1930] focus:ring-[#1769FF] focus:outline-none"
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#D8E1EB] text-[#0B1930] font-bold rounded-xl hover:bg-[#F4F7FA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#1769FF] text-white font-bold rounded-xl hover:bg-[#1769FF]/90 shadow-md"
            >
              Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

