import React, { useState } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import { ValidationIssue } from '../../types';

interface MapManualModalProps {
  issue: ValidationIssue | null;
  onClose: () => void;
  onResolve: (issueId: string, mappedValue: string) => void;
}

export const MapManualModal: React.FC<MapManualModalProps> = ({ issue, onClose, onResolve }) => {
  if (!issue) return null;

  const [selectedValue, setSelectedValue] = useState<string>(issue.suggestedValue);
  const [customSearch, setCustomSearch] = useState<string>('');

  const suggestions = [
    issue.suggestedValue,
    'Chicago, IL',
    'Houston, TX',
    'Dallas, TX',
    'Atlanta, GA',
    'Seattle, WA',
    'Oakland, CA'
  ];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const finalVal = customSearch.trim() || selectedValue;
    onResolve(issue.id, finalVal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Manual Standardization Mapping</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-5 space-y-3.5 text-xs">
          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
            <span className="font-bold text-[10px] text-slate-500 uppercase block">Unmatched Raw Entry (Row {issue.rowNumber})</span>
            <div className="font-bold text-sm text-rose-600 font-mono mt-0.5">"{issue.originalValue}"</div>
          </div>

          <div>
            <label className="font-bold text-[10px] text-slate-600 uppercase tracking-wider block mb-1.5">
              Select Standard Global Geography Entity
            </label>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setSelectedValue(sug);
                    setCustomSearch('');
                  }}
                  className={`w-full text-left p-2 rounded-lg flex justify-between items-center transition-colors cursor-pointer text-xs ${
                    selectedValue === sug && !customSearch
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-300'
                      : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>{sug}</span>
                  {selectedValue === sug && !customSearch && (
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-[10px] text-slate-600 uppercase tracking-wider block mb-1">
              Or Type Custom City Standard
            </label>
            <input
              type="text"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder="e.g., Chicago, IL"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

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
              Map & Resolve
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
