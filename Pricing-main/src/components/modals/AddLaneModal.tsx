import React, { useState, useEffect } from 'react';
import { PlusCircle, X } from 'lucide-react';
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
    setOriginCity('');
    setDestinationCity('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Add New Rate Lane</h3>
              <p className="text-[11px] text-slate-500">Add a contract or spot rate lane for customer billing</p>
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
              CUSTOMER ACCOUNT *
            </label>
            <select
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              <label className="font-bold text-[10px] text-slate-700 mb-1 block uppercase tracking-wider">
                ORIGIN CITY & STATE *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Oakland"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="CA"
                  value={originState}
                  onChange={(e) => setOriginState(e.target.value)}
                  className="w-12 bg-slate-50 border border-slate-300 rounded-lg px-2 py-2 text-xs font-semibold uppercase text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[10px] text-slate-700 mb-1 block uppercase tracking-wider">
                DESTINATION CITY & STATE *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Reno"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="NV"
                  value={destinationState}
                  onChange={(e) => setDestinationState(e.target.value)}
                  className="w-12 bg-slate-50 border border-slate-300 rounded-lg px-2 py-2 text-xs font-semibold uppercase text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-[10px] text-slate-700 mb-1 block uppercase tracking-wider">
                BASE RATE ($)
              </label>
              <input
                type="number"
                value={baseRate}
                onChange={(e) => setBaseRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[10px] text-slate-700 mb-1 block uppercase tracking-wider">
                MILES
              </label>
              <input
                type="number"
                value={miles}
                onChange={(e) => setMiles(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[10px] text-slate-700 mb-1 block uppercase tracking-wider">
                FSC %
              </label>
              <input
                type="number"
                step="0.1"
                value={fuelSurchargePercent}
                onChange={(e) => setFuelSurchargePercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[10px] text-slate-700 mb-1 block uppercase tracking-wider">
                EQUIPMENT
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="40' HC Container">40' HC Container</option>
                <option value="20' Standard Container">20' Standard Container</option>
                <option value="45' HC Container">45' HC Container</option>
                <option value="53' Dry Van">53' Dry Van</option>
                <option value="Reefer">Reefer Container</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[10px] text-slate-700 mb-1 block uppercase tracking-wider">
                AWARD STATUS
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'AWARDED' | 'BACKUP' | 'SPOT')}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="AWARDED">AWARDED (Primary)</option>
                <option value="BACKUP">BACKUP (Secondary)</option>
                <option value="SPOT">SPOT (Market Rate)</option>
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
              Save Rate Lane
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
