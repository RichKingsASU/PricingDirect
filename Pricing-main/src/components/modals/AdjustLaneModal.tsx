import React, { useState } from 'react';
import { Sliders, X, ArrowRight, Lock } from 'lucide-react';
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
  const [applyToAllCustomerLanes, setApplyToAllCustomerLanes] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>(
    'Target carrier benchmark adjusted and synchronized across all matching customer lanes and key accounts.'
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
      excludeKeyAccounts: !applyToAllCustomerLanes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Decision Making Facts Panel */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block">
                  Route / Market Scope
                </span>
                <span className="font-bold text-xs text-slate-900">{routeLabel}</span>
              </div>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {confidenceScore}% Confidence
              </span>
            </div>

            {/* Facts Grid */}
            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-[9px] text-slate-500 uppercase block">Target</span>
                <span className="font-bold text-sm text-slate-900 tabular-nums mt-0.5 block">
                  ${currentTargetVal.toLocaleString()}
                </span>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-[9px] text-slate-500 uppercase block">Actual Pay</span>
                <span className="font-bold text-sm text-blue-600 tabular-nums mt-0.5 block">
                  ${actualPayVal.toLocaleString()}
                </span>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-[9px] text-slate-500 uppercase block">Variance</span>
                <span
                  className={`font-bold text-sm tabular-nums mt-0.5 block ${
                    varDollarsVal > 0 ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {varDollarsVal > 0 ? `+$${varDollarsVal}` : `-$${Math.abs(varDollarsVal)}`}
                </span>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-[9px] text-slate-500 uppercase block">Volume</span>
                <span className="font-bold text-sm text-slate-900 tabular-nums mt-0.5 block">
                  {loadCount} loads
                </span>
              </div>
            </div>
          </div>

          {/* Quick Target Preview */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex justify-between items-center">
            <div>
              <span className="font-bold text-[10px] text-slate-500 uppercase block">Current Target</span>
              <span className="font-bold text-base text-slate-900 tabular-nums">${currentTargetVal.toLocaleString()}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600" />
            <div className="text-right">
              <span className="font-bold text-[10px] text-slate-500 uppercase block">New Target Adjustment</span>
              <span className="font-bold text-base text-blue-600 tabular-nums">${targetVal.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick Percentage Shift */}
          <div>
            <label className="font-bold text-[10px] text-slate-600 uppercase tracking-wider block mb-1">
              Quick Percentage Adjustment
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[-5, -2.5, 0, 2.5, 5].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentChange(pct)}
                  className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    percentChange === pct
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {pct > 0 ? `+${pct}%` : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Dollar Target */}
          <div>
            <label className="font-bold text-[10px] text-slate-600 uppercase tracking-wider block mb-1">
              Exact Target Rate ($ USD)
            </label>
            <input
              type="number"
              value={targetVal}
              onChange={(e) => handleTargetChange(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Target Rate Sync to All Applicable Customer Lanes & Key Accounts */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="applyToAllCustomerLanes"
              checked={applyToAllCustomerLanes}
              onChange={(e) => setApplyToAllCustomerLanes(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div className="space-y-0.5">
              <label htmlFor="applyToAllCustomerLanes" className="font-bold text-xs text-slate-900 cursor-pointer flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>Apply Target Rate to All Applicable Customer Lanes (Including Key Accounts)</span>
              </label>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                When selected, publishing this target update automatically aligns the carrier target benchmark across all matching customer lanes and key accounts operating on this corridor.
              </p>
            </div>
          </div>

          {/* Rationale & Notes */}
          <div>
            <label className="font-bold text-[10px] text-slate-600 uppercase tracking-wider block mb-1">
              Adjustment Rationale & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-xs cursor-pointer"
            >
              Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
