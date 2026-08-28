import React, { useState, useEffect } from 'react';
import { CustomerRateLane } from '../../types';

interface AddLaneModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: string[];
  selectedCustomer: string;
  onAddLane: (lane: CustomerRateLane) => void;
  initialValues?: {
    originCity?: string;
    originState?: string;
    destinationCity?: string;
    destinationState?: string;
    baseRate?: number;
    miles?: number;
  };
}

export const AddLaneModal: React.FC<AddLaneModalProps> = ({
  isOpen,
  onClose,
  customers,
  selectedCustomer,
  onAddLane,
  initialValues
}) => {
  const [customerName, setCustomerName] = useState(selectedCustomer || customers[0] || 'Amazon Logistics, Inc.');
  const [originCity, setOriginCity] = useState(initialValues?.originCity || '');
  const [originState, setOriginState] = useState(initialValues?.originState || 'CA');
  const [destinationCity, setDestinationCity] = useState(initialValues?.destinationCity || '');
  const [destinationState, setDestinationState] = useState(initialValues?.destinationState || 'NV');
  const [baseRate, setBaseRate] = useState<number>(initialValues?.baseRate || 1200);
  const [miles, setMiles] = useState<number>(initialValues?.miles || 250);
  const [equipment, setEquipment] = useState("40' HC Container");
  const [serviceType, setServiceType] = useState('Import Drayage');
  const [status, setStatus] = useState<'AWARDED' | 'BACKUP' | 'SPOT'>('AWARDED');
  const [fuelSurchargePercent, setFuelSurchargePercent] = useState<number>(15.5);

  useEffect(() => {
    if (isOpen && initialValues) {
      if (initialValues.originCity) setOriginCity(initialValues.originCity);
      if (initialValues.originState) setOriginState(initialValues.originState);
      if (initialValues.destinationCity) setDestinationCity(initialValues.destinationCity);
      if (initialValues.destinationState) setDestinationState(initialValues.destinationState);
      if (initialValues.baseRate) setBaseRate(initialValues.baseRate);
      if (initialValues.miles) setMiles(initialValues.miles);
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originCity.trim() || !destinationCity.trim()) return;

    const laneCode = `${originCity.substring(0, 3).toUpperCase()}-${destinationCity.substring(0, 3).toUpperCase()}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const fuelAmt = Math.round((baseRate * (fuelSurchargePercent / 100)) * 100) / 100;
    const total = baseRate + fuelAmt;

    const newLane: CustomerRateLane = {
      id: `lane-${Date.now()}`,
      laneId: laneCode,
      originCity: originCity.trim(),
      originState: originState.trim().toUpperCase(),
      destinationCity: destinationCity.trim(),
      destinationState: destinationState.trim().toUpperCase(),
      rawOrigin: `${originCity.trim()}, ${originState.trim().toUpperCase()}`,
      rawDestination: `${destinationCity.trim()}, ${destinationState.trim().toUpperCase()}`,
      baseRate,
      equipment,
      serviceType,
      miles,
      status,
      activeState: 'Active',
      effectiveDate: new Date().toISOString().split('T')[0],
      expirationDate: '2027-06-30',
      reviewDate: '2027-05-15',
      customerName,
      fuelSurchargePercent,
      fuelAmount: fuelAmt,
      totalBilling: total,
      accessorials: [
        { id: `acc-${Date.now()}-1`, name: 'Bobtail Fee', rate: 100, applicability: 'Per Occurrence', effectiveDate: '2026-07-01' },
        { id: `acc-${Date.now()}-2`, name: 'Driver Detention', rate: 85, applicability: 'Hourly after 2 hrs free', effectiveDate: '2026-07-01' }
      ],
      carrierTargetMatch: {
        targetAmount: Math.round(baseRate * 0.95),
        matchPercent: 97,
        nearestLane: `${originCity.trim()} → ${destinationCity.trim()} (Direct Benchmark)`
      },
      rateHistory: [
        { amount: baseRate, effectiveRange: `Effective: ${new Date().toLocaleDateString()} - 06/30/2027`, status: 'Current' }
      ],
      recommendedCarriers: [
        {
          id: `carr-${Date.now()}`,
          name: 'Forrest Preferred Express',
          rank: 1,
          reliability: 98.5,
          serviceArea: 'Nationwide',
          notes: 'High reliability dedicated contract fleet',
          statusColor: '#178A68'
        }
      ]
    };

    onAddLane(newLane);
    onClose();
    // Reset form
    setOriginCity('');
    setDestinationCity('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#D8E1EB]">
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#1769FF] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">add_road</span>
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#0F172A]">Add New Rate Lane</h3>
              <p className="text-xs text-[#64748B]">Add a contract or spot rate lane for customer billing</p>
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
              CUSTOMER ACCOUNT *
            </label>
            <select
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0F172A] focus:border-[#1769FF] focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-xs text-[#0B1930] mb-1 block uppercase tracking-wider">
                ORIGIN CITY & STATE *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Oakland"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="flex-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#1769FF] focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="CA"
                  value={originState}
                  onChange={(e) => setOriginState(e.target.value)}
                  className="w-14 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-2 py-2 text-xs font-semibold uppercase text-center focus:border-[#1769FF] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-xs text-[#0B1930] mb-1 block uppercase tracking-wider">
                DESTINATION CITY & STATE *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Reno"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  className="flex-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#1769FF] focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="NV"
                  value={destinationState}
                  onChange={(e) => setDestinationState(e.target.value)}
                  className="w-14 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-2 py-2 text-xs font-semibold uppercase text-center focus:border-[#1769FF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-xs text-[#0B1930] mb-1 block uppercase tracking-wider">
                BASE RATE ($)
              </label>
              <input
                type="number"
                value={baseRate}
                onChange={(e) => setBaseRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#1769FF] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-xs text-[#0B1930] mb-1 block uppercase tracking-wider">
                MILES
              </label>
              <input
                type="number"
                value={miles}
                onChange={(e) => setMiles(parseInt(e.target.value) || 0)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#1769FF] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-xs text-[#0B1930] mb-1 block uppercase tracking-wider">
                FSC %
              </label>
              <input
                type="number"
                step="0.1"
                value={fuelSurchargePercent}
                onChange={(e) => setFuelSurchargePercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#1769FF] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-xs text-[#0B1930] mb-1 block uppercase tracking-wider">
                EQUIPMENT
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#1769FF] focus:outline-none"
              >
                <option value="40' HC Container">40' HC Container</option>
                <option value="20' Standard Container">20' Standard Container</option>
                <option value="45' HC Container">45' HC Container</option>
                <option value="53' Dry Van">53' Dry Van</option>
                <option value="Reefer">Reefer Container</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-xs text-[#0B1930] mb-1 block uppercase tracking-wider">
                AWARD STATUS
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'AWARDED' | 'BACKUP' | 'SPOT')}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#1769FF] focus:outline-none"
              >
                <option value="AWARDED">AWARDED (Primary)</option>
                <option value="BACKUP">BACKUP (Secondary)</option>
                <option value="SPOT">SPOT (Market Rate)</option>
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
              Save Rate Lane
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
