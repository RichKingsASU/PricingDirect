import React, { useState } from 'react';
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
    // Reset form
    setCustomerName('');
    setAccountCode('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#D8E1EB]">
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#1769FF] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">domain_add</span>
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#0F172A]">Add New Customer Account</h3>
              <p className="text-xs text-[#64748B]">Register a new customer for contract rate management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#E2E8F0] flex items-center justify-center text-[#64748B]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="font-bold text-xs text-[#0B1930] mb-1 block uppercase tracking-wider">
              CUSTOMER / COMPANY NAME *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Target Fulfillment Logistics, Apple Inc."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0F172A] focus:border-[#1769FF] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-xs text-[#0B1930] mb-1 block uppercase tracking-wider">
                ACCOUNT CODE / SCAC
              </label>
              <input
                type="text"
                placeholder="e.g., TGT-LOG"
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0F172A] focus:border-[#1769FF] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-xs text-[#0B1930] mb-1 block uppercase tracking-wider">
                PRIMARY REGION
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as Region)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0F172A] focus:border-[#1769FF] focus:outline-none"
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
              <label className="font-bold text-xs text-[#0B1930] mb-1 block uppercase tracking-wider">
                DEFAULT FSC %
              </label>
              <input
                type="number"
                step="0.1"
                value={fuelSurcharge}
                onChange={(e) => setFuelSurcharge(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0F172A] focus:border-[#1769FF] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-xs text-[#0B1930] mb-1 block uppercase tracking-wider">
                CONTRACT TERMS
              </label>
              <select
                value={contractTerms}
                onChange={(e) => setContractTerms(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0F172A] focus:border-[#1769FF] focus:outline-none"
              >
                <option value="Net 30 - Annual Contract">Net 30 - Annual Contract</option>
                <option value="Net 15 - Spot Preferred">Net 15 - Spot Preferred</option>
                <option value="Net 60 - Enterprise Volume">Net 60 - Enterprise Volume</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1769FF] text-white rounded-xl font-bold text-xs hover:bg-[#1769FF]/90 shadow-md active:scale-[0.98] transition-all"
            >
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
