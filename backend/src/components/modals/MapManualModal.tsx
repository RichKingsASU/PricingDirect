import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 bg-[#0B1930]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#D8E1EB] overflow-hidden">
        <div className="px-6 py-4 bg-[#0B1930] text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D58A16]">warning</span>
            <h3 className="font-bold text-sm uppercase tracking-wider">Manual Standardization Mapping</h3>
          </div>
          <button onClick={onClose} className="text-[#7784a0] hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleApply} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-[#E5EEFF] rounded-lg border border-[#D8E1EB]">
            <span className="font-bold text-[10px] text-[#45474d] uppercase block">Unmatched Raw Entry (Row {issue.rowNumber})</span>
            <div className="font-bold text-base text-[#D64545] font-mono mt-0.5">"{issue.originalValue}"</div>
          </div>

          <div>
            <label className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider block mb-2">
              Select Standard Global Geography Entity
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setSelectedValue(sug);
                    setCustomSearch('');
                  }}
                  className={`w-full text-left p-2 rounded flex justify-between items-center transition-colors ${
                    selectedValue === sug && !customSearch
                      ? 'bg-[#EAF2FF] text-[#1769FF] font-bold border border-[#1769FF]/30'
                      : 'bg-[#F4F7FA] text-[#0B1930] hover:bg-[#d3e4fe]'
                  }`}
                >
                  <span>{sug}</span>
                  {selectedValue === sug && !customSearch && (
                    <span className="material-symbols-outlined text-sm text-[#1769FF]">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider block mb-1">
              Or Type Custom City Standard
            </label>
            <input
              type="text"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder="e.g., Chicago, IL"
              className="w-full bg-white border border-[#D8E1EB] rounded-lg px-3 py-2 text-xs text-[#0B1930] focus:ring-[#1769FF] focus:outline-none"
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
              Map & Resolve
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
