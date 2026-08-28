import React, { useState } from 'react';
import { Building2, X } from 'lucide-react';
import { Region } from '../../types';

export interface CustomerAccount {
  id: string;
  name: string;
  code: string;
  region: Region;
  defaultFuelSurcharge: number;
  contractTerms: string;
  activeLanesCount: number;
}

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomer: (customer: CustomerAccount) => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onAddCustomer
}) => {
  const [customerName, setCustomerName] = useState('');
  const [accountCode, setAccountCode] = useState('');
  const [region, setRegion] = useState<Region>('NW');
  const [fuelSurcharge, setFuelSurcharge] = useState<number>(15.0);
  const [contractTerms, setContractTerms] = useState('Net 30 - Annual Contract');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const code = accountCode.trim() || customerName.substring(0, 3).toUpperCase() + '-LOG';
    const newCust: CustomerAccount = {
      id: `cust-${Date.now()}`,
      name: customerName.trim(),
      code,
      region,
      defaultFuelSurcharge: fuelSurcharge,
      contractTerms,
      activeLanesCount: 0
    };

    onAddCustomer(newCust);
    onClose();
    setCustomerName('');
    setAccountCode('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Add New Customer Account</h3>
              <p className="text-[11px] text-slate-500">Register a new customer for contract rate management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-[10px] text-slate-700 mb-1 block uppercase tracking-wider">
              CUSTOMER / COMPANY NAME *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Target Fulfillment Logistics, Apple Inc."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[10px] text-slate-700 mb-1 block uppercase tracking-wider">
                ACCOUNT CODE / SCAC
              </label>
              <input
                type="text"
                placeholder="e.g., TGT-LOG"
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[10px] text-slate-700 mb-1 block uppercase tracking-wider">
                PRIMARY REGION
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as Region)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="USA">Nationwide (USA)</option>
                <option value="NW">Northwest (NW)</option>
                <option value="SW">Southwest (SW)</option>
                <option value="NE">Northeast (NE)</option>
                <option value="SE">Southeast (SE)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[10px] text-slate-700 mb-1 block uppercase tracking-wider">
                DEFAULT FSC %
              </label>
              <input
                type="number"
                step="0.1"
                value={fuelSurcharge}
                onChange={(e) => setFuelSurcharge(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[10px] text-slate-700 mb-1 block uppercase tracking-wider">
                CONTRACT TERMS
              </label>
              <select
                value={contractTerms}
                onChange={(e) => setContractTerms(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Net 30 - Annual Contract">Net 30 - Annual Contract</option>
                <option value="Net 15 - Spot Preferred">Net 15 - Spot Preferred</option>
                <option value="Net 60 - Enterprise Volume">Net 60 - Enterprise Volume</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 shadow-xs cursor-pointer"
            >
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
