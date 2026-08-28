import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [fuelFormula, setFuelFormula] = useState('DOE PADD 1 Regional Index');
  const [targetTolerance, setTargetTolerance] = useState('5.0%');
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState('$100.00');

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1930]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#D8E1EB] overflow-hidden">
        <div className="px-6 py-4 bg-[#0B1930] text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1769FF]">settings</span>
            <h3 className="font-bold text-sm uppercase tracking-wider">Pricing Hub System Settings</h3>
          </div>
          <button onClick={onClose} className="text-[#7784a0] hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-[10px] text-[#45474d] uppercase block mb-1">Fuel Surcharge Standard Matrix</label>
            <select
              value={fuelFormula}
              onChange={(e) => setFuelFormula(e.target.value)}
              className="w-full bg-[#F4F7FA] border border-[#D8E1EB] rounded-lg p-2 font-bold text-[#0B1930]"
            >
              <option>DOE PADD 1 Regional Index</option>
              <option>DOE National Weekly Average</option>
              <option>Custom Contract Fuel Peg</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[10px] text-[#45474d] uppercase block mb-1">High Impact Variance Alert Threshold</label>
            <input
              type="text"
              value={targetTolerance}
              onChange={(e) => setTargetTolerance(e.target.value)}
              className="w-full bg-[#F4F7FA] border border-[#D8E1EB] rounded-lg p-2 font-bold text-[#0B1930]"
            />
          </div>

          <div>
            <label className="font-bold text-[10px] text-[#45474d] uppercase block mb-1">Auto-Approval Maximum Delta ($)</label>
            <input
              type="text"
              value={autoApprovalThreshold}
              onChange={(e) => setAutoApprovalThreshold(e.target.value)}
              className="w-full bg-[#F4F7FA] border border-[#D8E1EB] rounded-lg p-2 font-bold text-[#0B1930]"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-[#1769FF] text-white font-bold rounded-lg hover:bg-[#1769FF]/90 shadow-md"
            >
              Save System Parameters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
