import React, { useState } from 'react';
import { Settings, X, Save } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Pricing Hub System Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-[10px] text-slate-600 uppercase block mb-1">Fuel Surcharge Standard Matrix</label>
            <select
              value={fuelFormula}
              onChange={(e) => setFuelFormula(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option>DOE PADD 1 Regional Index</option>
              <option>DOE National Weekly Average</option>
              <option>Custom Contract Fuel Peg</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[10px] text-slate-600 uppercase block mb-1">High Impact Variance Alert Threshold</label>
            <input
              type="text"
              value={targetTolerance}
              onChange={(e) => setTargetTolerance(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-[10px] text-slate-600 uppercase block mb-1">Auto-Approval Maximum Delta ($)</label>
            <input
              type="text"
              value={autoApprovalThreshold}
              onChange={(e) => setAutoApprovalThreshold(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save System Parameters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
