import React, { useState } from 'react';
import { CustomerRateLane } from '../types';
import { AddCustomerModal, CustomerAccount } from './modals/AddCustomerModal';
import { AddLaneModal } from './modals/AddLaneModal';
import { matchCarriersByOrigin } from '../data/recommendedCarriersData';
import { SYSTEM_TARGET_RATES, TargetRateItem } from '../data/targetMasterData';

export const getLaneRegion = (state: string, city: string): 'NE' | 'NW' | 'SE' | 'SW' => {
  const s = (state || '').toUpperCase().trim();
  const c = (city || '').toUpperCase().trim();

  if (s === 'CA') {
    if (c.includes('OAKLAND') || c.includes('SAN FRANCISCO') || c.includes('SACRAMENTO') || c.includes('STOCKTON') || c.includes('OICT') || c.includes('TRACY')) {
      return 'NW';
    }
    return 'SW';
  }
  if (['WA', 'OR', 'ID', 'MT', 'WY', 'AK'].includes(s)) return 'NW';
  if (['AZ', 'NV', 'UT', 'NM', 'CO', 'HI'].includes(s)) return 'SW';
  if (['NY', 'NJ', 'PA', 'MA', 'CT', 'ME', 'NH', 'VT', 'RI', 'OH', 'MI', 'IN', 'IL', 'WI'].includes(s)) return 'NE';
  return 'SE';
};


interface RateDirectoryProps {
  lanes: CustomerRateLane[];
  onEditLane: (lane: CustomerRateLane) => void;
  onUploadData: () => void;
  onExport: () => void;
  searchQuery: string;
  customersList?: string[];
  onAddCustomer?: (customer: CustomerAccount) => void;
  onAddLane?: (lane: CustomerRateLane) => void;
  teamContext?: 'Pricing Team' | 'Operations';
}

export const RateDirectory: React.FC<RateDirectoryProps> = ({
  lanes,
  onEditLane,
  onUploadData,
  onExport,
  searchQuery,
  customersList = [
    'Amazon Logistics, Inc.',
    'Ross Stores, Inc.',
    'Dollar Tree Distribution Inc',
    'Discount Tire',
    'Walmart Distribution',
    'FedEx Ground',
    'Home Depot Ops'
  ],
  onAddCustomer,
  onAddLane,
  teamContext = 'Pricing Team'
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [effectiveDateFilter, setEffectiveDateFilter] = useState<string>('2026-07-01');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Future' | 'Expired'>('Active');
  const [selectedLaneId, setSelectedLaneId] = useState<string>(lanes[0]?.id || 'lane-amz-1');

  // Search by Origin, Destination, and Miles for Carrier Target Benchmark
  const [originQuery, setOriginQuery] = useState<string>('');
  const [destinationQuery, setDestinationQuery] = useState<string>('');
  const [milesQuery, setMilesQuery] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<'contract_lane' | 'target_benchmark'>('contract_lane');
  const [prefillValues, setPrefillValues] = useState<{
    originCity?: string;
    originState?: string;
    destinationCity?: string;
    destinationState?: string;
    baseRate?: number;
    miles?: number;
  }>({});

  // Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
  const [showAddLaneModal, setShowAddLaneModal] = useState<boolean>(false);

  // Extract unique customer names
  const allCustomerNames = Array.from(
    new Set([...customersList, ...lanes.map((l) => l.customerName)])
  );

  const oQuery = originQuery.trim().toLowerCase();
  const dQuery = destinationQuery.trim().toLowerCase();
  const mVal = parseFloat(milesQuery.trim()) || 0;

  // Filter lanes by customer, status, search query, and origin/destination/miles
  const filteredLanes = lanes.filter((lane) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesTopSearch =
      !query ||
      lane.originCity.toLowerCase().includes(query) ||
      lane.destinationCity.toLowerCase().includes(query) ||
      lane.laneId.toLowerCase().includes(query) ||
      lane.equipment.toLowerCase().includes(query) ||
      lane.customerName.toLowerCase().includes(query) ||
      lane.originState.toLowerCase().includes(query) ||
      lane.destinationState.toLowerCase().includes(query);

    const matchesCustomer =
      selectedCustomer === 'all' || query.length > 0 || lane.customerName === selectedCustomer;

    const matchesStatus = lane.activeState === statusFilter;

    const matchesOrigin = !oQuery || lane.originCity.toLowerCase().includes(oQuery) || lane.originState.toLowerCase().includes(oQuery);
    const matchesDest = !dQuery || lane.destinationCity.toLowerCase().includes(dQuery) || lane.destinationState.toLowerCase().includes(dQuery);
    const matchesMiles = !mVal || Math.abs(lane.miles - mVal) <= 60;

    return matchesCustomer && matchesStatus && matchesTopSearch && matchesOrigin && matchesDest && matchesMiles;
  });

  const selectedLane =
    lanes.find((l) => l.id === selectedLaneId) || filteredLanes[0] || lanes[0];

  // Carrier Target Benchmark Calculation & Lookup
  const activeTargetBenchmark = (() => {
    const lookupOrigin = oQuery || searchQuery.trim().toLowerCase();
    const lookupDest = dQuery || searchQuery.trim().toLowerCase();

    if (!lookupOrigin && !lookupDest && !mVal) {
      return null;
    }

    let matchedRate: TargetRateItem | undefined = undefined;
    if (lookupOrigin && lookupDest) {
      matchedRate = SYSTEM_TARGET_RATES.find((t) => {
        const oMatch = t.pickupCity.toLowerCase().includes(lookupOrigin) || lookupOrigin.includes(t.pickupCity.toLowerCase());
        const dMatch = t.deliveryCity.toLowerCase().includes(lookupDest) || lookupDest.includes(t.deliveryCity.toLowerCase());
        return oMatch && dMatch;
      });
    }

    if (!matchedRate && lookupOrigin) {
      matchedRate = SYSTEM_TARGET_RATES.find((t) =>
        t.pickupCity.toLowerCase().includes(lookupOrigin) || lookupOrigin.includes(t.pickupCity.toLowerCase())
      );
    }

    if (!matchedRate && lookupDest) {
      matchedRate = SYSTEM_TARGET_RATES.find((t) =>
        t.deliveryCity.toLowerCase().includes(lookupDest) || lookupDest.includes(t.deliveryCity.toLowerCase())
      );
    }

    const milesNumber = mVal > 0 ? mVal : matchedRate ? 120 : 100;
    let targetPay = 0;
    let sourceLabel = '';

    if (matchedRate) {
      targetPay = matchedRate.targetCarrierPay;
      sourceLabel = 'Forrest Master System Target Directory';
    } else if (mVal > 0) {
      targetPay = Math.max(350, Math.round(320 + mVal * 3.8));
      sourceLabel = `Calculated Mileage Benchmark ($320 base + $3.80/mi)`;
    } else {
      targetPay = 750;
      sourceLabel = 'Regional Drayage Market Benchmark';
    }

    const originCityName = matchedRate ? matchedRate.pickupCity : (originQuery.trim() || searchQuery.trim() || 'Origin');
    const originStateName = matchedRate ? matchedRate.pickupState : 'CA';
    const destCityName = matchedRate ? matchedRate.deliveryCity : (destinationQuery.trim() || 'Destination');
    const destStateName = matchedRate ? matchedRate.deliveryState : 'NV';
    const regionCode = matchedRate ? matchedRate.pickupRegion : getLaneRegion(originStateName, originCityName);

    return {
      originCity: originCityName,
      originState: originStateName,
      destinationCity: destCityName,
      destinationState: destStateName,
      targetCarrierPay: targetPay,
      miles: milesNumber,
      ratePerMile: (targetPay / milesNumber).toFixed(2),
      sourceLabel,
      regionCode,
      isMasterMatched: !!matchedRate
    };
  })();

  const handleCreateCustomer = (cust: CustomerAccount) => {
    if (onAddCustomer) {
      onAddCustomer(cust);
    }
    setSelectedCustomer(cust.name);
  };

  const handleCreateLane = (newLane: CustomerRateLane) => {
    if (onAddLane) {
      onAddLane(newLane);
    }
    setSelectedLaneId(newLane.id);
    setSelectedMode('contract_lane');
  };

  const isShowingTargetBenchmark =
    selectedMode === 'target_benchmark' || (filteredLanes.length === 0 && !!activeTargetBenchmark);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden animate-in fade-in duration-200">
      {/* Top Filter & Toolbar Area */}
      <div className="bg-white border-b border-[#D8E1EB] px-6 py-3 z-10 shrink-0">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Customer Dropdown */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">
                  Customer Account
                </span>
                {teamContext !== 'Operations' && (
                  <button
                    onClick={() => setShowAddCustomerModal(true)}
                    className="text-[10px] font-bold text-[#1769FF] hover:underline flex items-center gap-0.5 ml-2"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    <span>New</span>
                  </button>
                )}
              </div>
              <select
                value={selectedCustomer}
                onChange={(e) => {
                  if (e.target.value === '__ADD_NEW__') {
                    if (teamContext !== 'Operations') setShowAddCustomerModal(true);
                  } else {
                    setSelectedCustomer(e.target.value);
                  }
                }}
                className="text-xs font-semibold py-1.5 pl-3 pr-8 border border-[#D8E1EB] rounded-lg bg-[#F4F7FA] focus:ring-[#1769FF] min-w-[220px] cursor-pointer"
              >
                <option value="all">All Customer Accounts ({allCustomerNames.length})</option>
                {allCustomerNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                {teamContext !== 'Operations' && (
                  <option value="__ADD_NEW__" className="font-bold text-[#1769FF]">
                    + Add New Customer Account...
                  </option>
                )}
              </select>
            </div>

            {/* Effective Date Filter */}
            <div className="flex flex-col">
              <span className="font-bold text-[10px] text-[#45474d] mb-1 uppercase tracking-wider">
                Rates Effective On
              </span>
              <input
                type="date"
                value={effectiveDateFilter}
                onChange={(e) => setEffectiveDateFilter(e.target.value)}
                className="text-xs font-semibold py-1 border border-[#D8E1EB] rounded-lg bg-[#F4F7FA] focus:ring-[#1769FF] px-2"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex flex-col">
              <span className="font-bold text-[10px] text-[#45474d] mb-1 uppercase tracking-wider">
                Status
              </span>
              <div className="flex gap-1">
                {(['Active', 'Future', 'Expired'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      statusFilter === st
                        ? 'bg-[#EAF2FF] text-[#1769FF] border border-[#1769FF]/30 shadow-sm'
                        : 'bg-[#F4F7FA] text-[#45474d] border border-[#D8E1EB] hover:bg-[#d3e4fe]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {teamContext !== 'Operations' ? (
              <>
                <button
                  onClick={() => {
                    setPrefillValues({});
                    setShowAddLaneModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1769FF] text-white font-bold text-xs rounded-lg hover:bg-[#1769FF]/90 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add_road</span>
                  <span>+ Add Rate Lane</span>
                </button>

                <button
                  onClick={onUploadData}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F7FA] border border-[#D8E1EB] text-[#14213D] font-bold text-xs rounded-lg hover:bg-[#d3e4fe] transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  <span>Upload Data</span>
                </button>

                <button
                  onClick={onExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F7FA] border border-[#D8E1EB] text-[#14213D] font-bold text-xs rounded-lg hover:bg-[#d3e4fe] transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Export CSV</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="bg-[#D58A16]/15 text-[#D58A16] border border-[#D58A16]/30 px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase flex items-center gap-1.5 shadow-2xs">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>Operations View (Read-Only)</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Carrier Target Rate Search Bar (Origin, Destination & Miles) */}
        <div className="max-w-[1440px] mx-auto mt-2.5 pt-2 border-t border-[#D8E1EB] flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1769FF] text-lg">search_check</span>
            <div>
              <span className="font-extrabold text-xs text-[#0F172A] block leading-tight">Carrier Target Rate Quick Lookup</span>
              <span className="text-[10px] text-[#64748B]">Search target rates by Origin, Destination & Miles (when no customer rate exists)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1 shadow-2xs focus-within:border-[#1769FF]">
              <span className="text-[10px] font-bold text-[#64748B] uppercase mr-1.5">Origin:</span>
              <input
                type="text"
                placeholder="e.g. Oakland or LA/LB"
                value={originQuery}
                onChange={(e) => {
                  setOriginQuery(e.target.value);
                  if (e.target.value.trim()) setSelectedMode('target_benchmark');
                }}
                className="text-xs font-bold text-[#0F172A] bg-transparent focus:outline-none w-28"
              />
            </div>

            <div className="flex items-center bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1 shadow-2xs focus-within:border-[#1769FF]">
              <span className="text-[10px] font-bold text-[#64748B] uppercase mr-1.5">Dest:</span>
              <input
                type="text"
                placeholder="e.g. Stockton or Phoenix"
                value={destinationQuery}
                onChange={(e) => {
                  setDestinationQuery(e.target.value);
                  if (e.target.value.trim()) setSelectedMode('target_benchmark');
                }}
                className="text-xs font-bold text-[#0F172A] bg-transparent focus:outline-none w-28"
              />
            </div>

            <div className="flex items-center bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1 shadow-2xs focus-within:border-[#1769FF]">
              <span className="text-[10px] font-bold text-[#64748B] uppercase mr-1.5">Miles:</span>
              <input
                type="number"
                placeholder="e.g. 80"
                value={milesQuery}
                onChange={(e) => {
                  setMilesQuery(e.target.value);
                  if (e.target.value.trim()) setSelectedMode('target_benchmark');
                }}
                className="text-xs font-bold text-[#0F172A] bg-transparent focus:outline-none w-16"
              />
            </div>

            {(originQuery || destinationQuery || milesQuery) && (
              <button
                onClick={() => {
                  setOriginQuery('');
                  setDestinationQuery('');
                  setMilesQuery('');
                  setSelectedMode('contract_lane');
                }}
                className="px-2.5 py-1 bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0F172A] text-xs font-bold rounded-lg transition-all"
                title="Clear Search"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {searchQuery && (
          <div className="max-w-[1440px] mx-auto mt-2 pt-2 border-t border-[#D8E1EB] flex items-center justify-between text-xs text-[#1769FF] font-semibold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">search</span>
              <span>
                Search active for <strong>"{searchQuery}"</strong> — showing {filteredLanes.length} matching rate lanes
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Master Detail Main Split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Master List */}
        <div className="w-1/3 min-w-[360px] max-w-md border-r border-[#D8E1EB] bg-white overflow-y-auto">
          {/* Target Rate Benchmark Top Card (if activeTargetBenchmark exists) */}
          {activeTargetBenchmark && (
            <div
              onClick={() => setSelectedMode('target_benchmark')}
              className={`p-3.5 border-b cursor-pointer transition-all ${
                selectedMode === 'target_benchmark'
                  ? 'bg-[#0F172A] text-white border-l-4 border-l-[#1769FF] shadow-sm'
                  : 'bg-[#EFF6FF] border-[#BFDBFE] hover:bg-[#E0F2FE]'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      selectedMode === 'target_benchmark' ? 'bg-[#1769FF] text-white' : 'bg-[#1769FF]/15 text-[#1769FF]'
                    }`}>
                      Target Rate Benchmark
                    </span>
                    <span className="text-[10px] font-bold text-[#178A68] bg-[#DCFCE7] px-1.5 py-0.2 rounded">
                      Carrier Target Only
                    </span>
                  </div>
                  <h3 className={`font-black text-sm flex items-center gap-1.5 ${
                    selectedMode === 'target_benchmark' ? 'text-white' : 'text-[#0B1930]'
                  }`}>
                    <span>{activeTargetBenchmark.originCity}, {activeTargetBenchmark.originState}</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    <span>{activeTargetBenchmark.destinationCity}, {activeTargetBenchmark.destinationState}</span>
                  </h3>
                </div>
                <div className="text-right">
                  <div className={`text-base font-black tabular-nums ${
                    selectedMode === 'target_benchmark' ? 'text-[#38BDF8]' : 'text-[#1769FF]'
                  }`}>
                    ${activeTargetBenchmark.targetCarrierPay.toLocaleString()}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider block opacity-80">
                    Target Carrier Pay
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] mt-2 font-semibold">
                <span className={selectedMode === 'target_benchmark' ? 'text-[#94A3B8]' : 'text-[#64748B]'}>
                  {activeTargetBenchmark.sourceLabel}
                </span>
                <span className={`font-mono font-bold ${selectedMode === 'target_benchmark' ? 'text-[#38BDF8]' : 'text-[#0F172A]'}`}>
                  {activeTargetBenchmark.miles} Mi (${activeTargetBenchmark.ratePerMile}/mi)
                </span>
              </div>
            </div>
          )}

          {filteredLanes.length === 0 ? (
            !activeTargetBenchmark && (
              <div className="p-8 text-center text-xs text-[#45474d] flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-3xl text-[#94A3B8]">search_off</span>
                <p className="font-semibold text-[#0F172A]">No customer rate lanes found</p>
                <p className="text-[11px] text-[#64748B]">
                  Use the Carrier Target Quick Lookup above to search by Origin, Destination, and Miles.
                </p>
                <button
                  onClick={() => setShowAddLaneModal(true)}
                  className="mt-2 px-3 py-1.5 bg-[#1769FF] text-white text-xs font-bold rounded-lg"
                >
                  + Add Customer Lane for {selectedCustomer === 'all' ? 'New Customer' : selectedCustomer}
                </button>
              </div>
            )
          ) : (
            <div className="divide-y divide-[#D8E1EB]">
              {filteredLanes.map((lane) => {
                const isSelected = selectedMode === 'contract_lane' && selectedLane?.id === lane.id;
                return (
                  <div
                    key={lane.id}
                    onClick={() => {
                      setSelectedLaneId(lane.id);
                      setSelectedMode('contract_lane');
                    }}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EAF2FF] border-l-4 border-l-[#1769FF]'
                        : 'hover:bg-[#F4F7FA]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="text-[10px] font-extrabold text-[#1769FF] uppercase tracking-wider mb-0.5">
                          {lane.customerName}
                        </div>
                        <h3 className="font-bold text-sm text-[#0B1930] flex items-center gap-1.5">
                          <span>
                            {lane.originCity}, {lane.originState}
                          </span>
                          <span className="material-symbols-outlined text-xs text-[#45474d]">
                            arrow_forward
                          </span>
                          <span>
                            {lane.destinationCity}, {lane.destinationState}
                          </span>
                        </h3>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span
                            className={`font-black text-sm tabular-nums ${
                              isSelected ? 'text-[#1769FF]' : 'text-[#0B1930]'
                            }`}
                          >
                            ${lane.totalBilling.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <span className="font-extrabold text-[9px] text-[#1769FF] block uppercase tracking-wider">
                          TOTAL BILLING (COMBINED)
                        </span>
                        <div className="text-[10px] text-[#64748B] font-semibold mt-0.5">
                          LH ${lane.baseRate} + FSC ${lane.fuelAmount.toFixed(1)} ({lane.fuelSurchargePercent}%)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="bg-[#1769FF]/10 text-[#1769FF] font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                        {lane.status}
                      </span>
                      <span className="bg-[#178A68]/10 text-[#178A68] font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                        {lane.activeState}
                      </span>
                      <span className="bg-[#0F172A]/5 text-[#0F172A] font-extrabold text-[10px] px-2 py-0.5 rounded uppercase border border-[#CBD5E1]">
                        LH: ${lane.baseRate}
                      </span>
                      <span className="bg-[#DCFCE7] text-[#166534] font-extrabold text-[10px] px-2 py-0.5 rounded uppercase border border-[#BBF7D0]">
                        FSC: ${lane.fuelAmount.toFixed(1)}
                      </span>
                      <div className="flex items-center gap-1 ml-auto text-[#45474d]">
                        <span className="material-symbols-outlined text-[14px]">
                          straighten
                        </span>
                        <span className="text-xs font-semibold tabular-nums">
                          {lane.miles} Mi
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex gap-3 text-[#45474d] text-[11px] font-medium">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">
                          forklift
                        </span>
                        <span>{lane.serviceType}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Detail Panel */}
        <div className="flex-1 bg-[#F4F7FA] overflow-y-auto p-6">
          {isShowingTargetBenchmark && activeTargetBenchmark ? (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
              {/* Target Banner Header */}
              <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#1769FF] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-xs">
                      Carrier Target Benchmark Result
                    </span>
                    <span className="bg-[#178A68] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                      No Customer Rate Required
                    </span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>{activeTargetBenchmark.originCity}, {activeTargetBenchmark.originState}</span>
                    <span className="material-symbols-outlined text-xl text-[#38BDF8]">arrow_forward</span>
                    <span>{activeTargetBenchmark.destinationCity}, {activeTargetBenchmark.destinationState}</span>
                  </h1>
                  <p className="text-xs text-[#94A3B8] mt-1.5 flex items-center gap-2 flex-wrap">
                    <span>Distance: <strong className="text-white">{activeTargetBenchmark.miles} Miles</strong></span>
                    <span>•</span>
                    <span>Region: <strong className="text-white">{activeTargetBenchmark.regionCode} Market</strong></span>
                    <span>•</span>
                    <span>Source: <strong className="text-white">{activeTargetBenchmark.sourceLabel}</strong></span>
                  </p>
                </div>

                {teamContext !== 'Operations' && (
                  <button
                    onClick={() => {
                      setPrefillValues({
                        originCity: activeTargetBenchmark.originCity,
                        originState: activeTargetBenchmark.originState,
                        destinationCity: activeTargetBenchmark.destinationCity,
                        destinationState: activeTargetBenchmark.destinationState,
                        baseRate: activeTargetBenchmark.targetCarrierPay,
                        miles: activeTargetBenchmark.miles
                      });
                      setShowAddLaneModal(true);
                    }}
                    className="px-5 py-3 bg-[#1769FF] text-white rounded-xl font-extrabold text-xs hover:bg-[#1769FF]/90 shadow-md active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">add_road</span>
                    <span>+ Create Customer Rate Lane from Target</span>
                  </button>
                )}
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border-2 border-[#1769FF] rounded-2xl p-5 shadow-sm">
                  <div className="font-extrabold text-[11px] text-[#1769FF] uppercase tracking-wider mb-1">
                    Carrier Target Pay Benchmark
                  </div>
                  <div className="text-3xl font-black text-[#0B1930] tabular-nums mt-1">
                    ${activeTargetBenchmark.targetCarrierPay.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs font-semibold text-[#64748B] mt-3 pt-3 border-t border-[#E2E8F0]">
                    Recommended maximum carrier buy rate
                  </div>
                </div>

                <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-sm">
                  <div className="font-extrabold text-[11px] text-[#64748B] uppercase tracking-wider mb-1">
                    Target Rate Per Mile
                  </div>
                  <div className="text-3xl font-black text-[#0F172A] tabular-nums mt-1">
                    ${activeTargetBenchmark.ratePerMile} <span className="text-sm font-bold text-[#64748B]">/ mi</span>
                  </div>
                  <div className="text-xs font-semibold text-[#64748B] mt-3 pt-3 border-t border-[#E2E8F0]">
                    Calculated across {activeTargetBenchmark.miles} miles
                  </div>
                </div>

                <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-sm">
                  <div className="font-extrabold text-[11px] text-[#64748B] uppercase tracking-wider mb-1">
                    Market Region
                  </div>
                  <div className="text-2xl font-black text-[#0F172A] mt-1">
                    {activeTargetBenchmark.regionCode} Region
                  </div>
                  <div className="text-xs font-semibold text-[#178A68] mt-3 pt-3 border-t border-[#E2E8F0]">
                    Active Forrest drayage corridor
                  </div>
                </div>
              </div>

              {/* Regional Chassis Tariff Schedule */}
              <div className="bg-white rounded-xl border border-[#D8E1EB] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#0B1930] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#1769FF] text-base">directions_bus</span>
                    <span>Regional Chassis Schedule ({activeTargetBenchmark.regionCode} Market)</span>
                  </h3>
                  <span className="text-[10px] font-extrabold text-[#1769FF] bg-[#EAF2FF] px-2.5 py-0.5 rounded-md border border-[#1769FF]/20 uppercase">
                    {activeTargetBenchmark.regionCode} Tariffs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">Pool Chassis</div>
                    <div className="text-base font-black text-[#0F172A] mt-0.5">$0.00 <span className="text-[10px] font-semibold text-[#178A68]">(Not Billable)</span></div>
                    <div className="text-[10px] text-[#94A3B8] mt-1">Standard carrier pool allowance</div>
                  </div>

                  <div className="p-3 bg-[#F0F7FF] rounded-lg border border-[#B8D9FF]">
                    <div className="text-[10px] font-extrabold text-[#1E40AF] uppercase">Private Chassis ({activeTargetBenchmark.regionCode})</div>
                    <div className="text-base font-black text-[#1E3A8A] mt-0.5">
                      {activeTargetBenchmark.regionCode === 'NW' ? '$40.00 / day' : activeTargetBenchmark.regionCode === 'SW' ? '$40.00 / day' : '$38.00 / day'}
                    </div>
                    <div className="text-[10px] text-[#2563EB] font-medium mt-1">Billable private fleet rate</div>
                  </div>

                  <div className="p-3 bg-[#FFFBEB] rounded-lg border border-[#FDE68A]">
                    <div className="text-[10px] font-extrabold text-[#92400E] uppercase">Triaxle Chassis ({activeTargetBenchmark.regionCode})</div>
                    <div className="text-base font-black text-[#78350F] mt-0.5">$85.00 / day</div>
                    <div className="text-[10px] text-[#B45309] font-medium mt-1">Heavy-haul triaxle charge</div>
                  </div>
                </div>
              </div>

              {/* Matched Carriers */}
              {(() => {
                const matchedCarriers = matchCarriersByOrigin(activeTargetBenchmark.originState).slice(0, 4);
                return (
                  <div className="bg-white rounded-xl border border-[#D8E1EB] p-5 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#0B1930] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#1769FF] text-base">verified</span>
                        <span>Recommended Carrier Capacity (Origin State: {activeTargetBenchmark.originState})</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {matchedCarriers.map((match) => (
                        <div
                          key={match.carrier.id}
                          className="p-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex items-center justify-between hover:border-[#1769FF] transition-all"
                        >
                          <div className="space-y-1">
                            <div className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#178A68]" />
                              <span>{match.carrier.carrierName}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              <span className="bg-[#0F172A] text-white px-1.5 py-0.2 rounded font-mono font-bold">
                                DOT# {match.carrier.dotNumber}
                              </span>
                              <span className="bg-[#EAF2FF] text-[#1769FF] px-1.5 py-0.2 rounded font-extrabold">
                                Home: {match.carrier.homeState}
                              </span>
                              <span className="text-[#64748B]">
                                {match.carrier.truckCount} trucks • {match.carrier.loadsHauled2026} loads (2026)
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 ml-2">
                            <div className="font-extrabold text-xs text-[#178A68] tabular-nums">
                              {match.matchScore}%
                            </div>
                            <div className="text-[9px] text-[#64748B] uppercase font-bold">
                              Origin Match
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : selectedLane ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Card Header */}
              <div className="bg-white rounded-xl border border-[#D8E1EB] p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#EAF2FF] text-[#1769FF] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border border-[#1769FF]/20">
                      {selectedLane.customerName}
                    </span>
                    <span className="bg-[#178A68]/10 text-[#178A68] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border border-[#178A68]/20">
                      {selectedLane.status}
                    </span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-[#0B1930] flex items-center gap-2">
                    <span>
                      {selectedLane.originCity}, {selectedLane.originState}
                    </span>
                    <span className="material-symbols-outlined text-lg text-[#1769FF]">
                      arrow_forward
                    </span>
                    <span>
                      {selectedLane.destinationCity}, {selectedLane.destinationState}
                    </span>
                  </h1>
                  <p className="text-xs text-[#75777e] mt-1">
                    Raw Origin: <span className="font-semibold">{selectedLane.rawOrigin}</span> |
                    Raw Destination: <span className="font-semibold">{selectedLane.rawDestination}</span>
                  </p>
                </div>

                {teamContext !== 'Operations' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onEditLane(selectedLane)}
                      className="px-5 py-2.5 bg-[#1769FF] text-white rounded-xl font-extrabold text-xs hover:bg-[#1769FF]/90 shadow-sm active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      <span>Edit Rate & Target</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Separated Linehaul, Fuel Surcharge, and Total Customer Billing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Linehaul Rate (Base) */}
                <div className="bg-[#F0F7FF] border border-[#B8D9FF] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="font-extrabold text-[11px] text-[#2563EB] uppercase tracking-wider mb-1">
                      LINEHAUL RATE (BASE)
                    </div>
                    <div className="text-3xl font-black text-[#1E3A8A] tabular-nums mt-1">
                      ${selectedLane.baseRate.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-[#64748B] mt-3 pt-3 border-t border-[#B8D9FF]/40">
                    Contractual flat billing dray
                  </div>
                </div>

                {/* 2. Fuel Surcharge (FSC) */}
                <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-5 shadow-2xs relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-[11px] text-[#0F172A] uppercase tracking-wider">
                        FUEL SURCHARGE (FSC)
                      </span>
                      <span className="bg-[#DCFCE7] text-[#166534] font-black text-xs px-2.5 py-0.5 rounded-md border border-[#BBF7D0]">
                        {selectedLane.fuelSurchargePercent}%
                      </span>
                    </div>
                    <div className="text-3xl font-black text-[#0F172A] tabular-nums mt-1">
                      ${selectedLane.fuelAmount.toFixed(selectedLane.fuelAmount % 1 === 0 ? 0 : 1)}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-[#64748B] mt-3 pt-3 border-t border-[#E2E8F0]">
                    Indexed against current DOE index
                  </div>
                </div>

                {/* 3. Total Customer Billing */}
                <div className="bg-[#0F172A] text-white rounded-2xl p-5 relative shadow-md flex flex-col justify-between">
                  <span className="bg-[#1D4ED8] text-white font-black text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wide absolute top-4 right-4 shadow-xs">
                    LH+FSC COMBINED
                  </span>
                  <div>
                    <div className="font-extrabold text-[11px] text-[#94A3B8] uppercase tracking-wider mb-1">
                      TOTAL CUSTOMER BILLING
                    </div>
                    <div className="text-3xl font-black text-white tabular-nums mt-1">
                      ${selectedLane.totalBilling.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-[#94A3B8] mt-3 pt-3 border-t border-white/10">
                    Subject to accessory compliance
                  </div>
                </div>
              </div>

              {/* Carrier Target Benchmark Match */}
              <div className="bg-white rounded-xl border border-[#D8E1EB] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#0B1930] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#1769FF] text-base">analytics</span>
                    <span>System Target Benchmark & Variance Analysis</span>
                  </h3>
                  <span className="text-xs font-bold text-[#178A68] bg-[#178A68]/10 px-2.5 py-0.5 rounded-full">
                    {selectedLane.carrierTargetMatch.matchPercent}% Target Alignment
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">
                      Contract Base Rate
                    </div>
                    <div className="text-xl font-extrabold text-[#0F172A] tabular-nums mt-0.5">
                      ${selectedLane.baseRate.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">
                      Control Tower Carrier Target
                    </div>
                    <div className="text-xl font-extrabold text-[#1769FF] tabular-nums mt-0.5">
                      ${selectedLane.carrierTargetMatch.targetAmount.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">
                      Nearest System Benchmark
                    </div>
                    <div className="text-xs font-bold text-[#0F172A] mt-1.5 truncate">
                      {selectedLane.carrierTargetMatch.nearestLane}
                    </div>
                  </div>
                </div>
              </div>

              {/* Regional Chassis Schedule & Fees */}
              <div className="bg-white rounded-xl border border-[#D8E1EB] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#0B1930] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#1769FF] text-base">directions_bus</span>
                    <span>Regional Chassis Schedule ({getLaneRegion(selectedLane.originState, selectedLane.originCity)} Market)</span>
                  </h3>
                  <span className="text-[10px] font-extrabold text-[#1769FF] bg-[#EAF2FF] px-2.5 py-0.5 rounded-md border border-[#1769FF]/20 uppercase">
                    {getLaneRegion(selectedLane.originState, selectedLane.originCity)} Regional Tariffs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">Pool Chassis</div>
                    <div className="text-base font-black text-[#0F172A] mt-0.5">$0.00 <span className="text-[10px] font-semibold text-[#178A68]">(Not Billable)</span></div>
                    <div className="text-[10px] text-[#94A3B8] mt-1">Standard carrier pool allowance</div>
                  </div>

                  <div className="p-3 bg-[#F0F7FF] rounded-lg border border-[#B8D9FF]">
                    <div className="text-[10px] font-extrabold text-[#1E40AF] uppercase">Private Chassis ({getLaneRegion(selectedLane.originState, selectedLane.originCity)})</div>
                    <div className="text-base font-black text-[#1E3A8A] mt-0.5">
                      {getLaneRegion(selectedLane.originState, selectedLane.originCity) === 'NW' ? '$40.00 / day' : getLaneRegion(selectedLane.originState, selectedLane.originCity) === 'SW' ? '$40.00 / day' : '$38.00 / day'}
                    </div>
                    <div className="text-[10px] text-[#2563EB] font-medium mt-1">Billable private fleet rate</div>
                  </div>

                  <div className="p-3 bg-[#FFFBEB] rounded-lg border border-[#FDE68A]">
                    <div className="text-[10px] font-extrabold text-[#92400E] uppercase">Triaxle Chassis ({getLaneRegion(selectedLane.originState, selectedLane.originCity)})</div>
                    <div className="text-base font-black text-[#78350F] mt-0.5">$85.00 / day</div>
                    <div className="text-[10px] text-[#B45309] font-medium mt-1">Heavy-haul triaxle charge</div>
                  </div>
                </div>
              </div>

              {/* Accessorials & Surcharges */}
              <div className="bg-white rounded-xl border border-[#D8E1EB] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#0B1930] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#1769FF] text-base">receipt_long</span>
                    <span>Accessorial Schedule ({selectedLane.accessorials.length})</span>
                  </h3>
                </div>

                <div className="divide-y divide-[#E2E8F0]">
                  {selectedLane.accessorials.map((acc) => (
                    <div key={acc.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[#0F172A]">{acc.name}</div>
                        <div className="text-[11px] text-[#64748B]">{acc.applicability}</div>
                      </div>
                      <div className="font-extrabold text-[#0F172A] tabular-nums">
                        ${acc.rate.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Carriers Matched by Origin State */}
              {(() => {
                const matchedCarriers = matchCarriersByOrigin(selectedLane.originState).slice(0, 4);
                return (
                  <div className="bg-white rounded-xl border border-[#D8E1EB] p-5 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#0B1930] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#1769FF] text-base">verified</span>
                        <span>Recommended Carrier Capacity (Origin: {selectedLane.originState})</span>
                      </h3>
                      <span className="text-[10px] font-extrabold bg-[#EAF2FF] text-[#1769FF] px-2.5 py-0.5 rounded-full border border-[#1769FF]/30">
                        Home State Origin Matched
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {matchedCarriers.map((match) => (
                        <div
                          key={match.carrier.id}
                          className="p-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex items-center justify-between hover:border-[#1769FF] transition-all"
                        >
                          <div className="space-y-1">
                            <div className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#178A68]" />
                              <span>{match.carrier.carrierName}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              <span className="bg-[#0F172A] text-white px-1.5 py-0.2 rounded font-mono font-bold">
                                DOT# {match.carrier.dotNumber}
                              </span>
                              <span className="bg-[#EAF2FF] text-[#1769FF] px-1.5 py-0.2 rounded font-extrabold">
                                Home: {match.carrier.homeState}
                              </span>
                              <span className="text-[#64748B]">
                                {match.carrier.truckCount} trucks • {match.carrier.loadsHauled2026} loads (2026)
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 ml-2">
                            <div className="font-extrabold text-xs text-[#178A68] tabular-nums">
                              {match.matchScore}%
                            </div>
                            <div className="text-[9px] text-[#64748B] uppercase font-bold">
                              {match.matchType === 'Exact Home State' ? 'Origin Match' : 'Regional'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2">touch_app</span>
              <p className="text-xs">Select a rate lane from the list or search a carrier target benchmark above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddCustomerModal
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onAddCustomer={handleCreateCustomer}
      />

      <AddLaneModal
        isOpen={showAddLaneModal}
        onClose={() => setShowAddLaneModal(false)}
        customers={allCustomerNames}
        selectedCustomer={selectedCustomer === 'all' ? allCustomerNames[0] || 'Amazon Logistics, Inc.' : selectedCustomer}
        onAddLane={handleCreateLane}
        initialValues={prefillValues}
      />
    </div>
  );
};

