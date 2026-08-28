import React, { useState, useEffect, useMemo } from 'react';
import {
  Region,
  KPIStats,
  MarketSummary,
  LaneException,
  PlannedAdjustment,
  LoadDetail
} from '../types';
import { USAMapSVG, CITY_COORDINATES, getAlbersProjection } from './USAMapSVG';
import { ExportCarrierTargetsModal } from './modals/ExportCarrierTargetsModal';
import { DashboardCharts } from './DashboardCharts';

interface TargetControlTowerProps {
  kpis: KPIStats;
  markets: MarketSummary[];
  laneExceptions: LaneException[];
  plannedAdjustments: PlannedAdjustment[];
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  onAdjustLane: (exception: LaneException) => void;
  onAdjustMarket: (market: MarketSummary) => void;
  onScheduleNewChange: () => void;
  onUploadData: () => void;
  onExportTargets: () => void;
  searchQuery: string;
  teamContext?: 'Pricing Team' | 'Operations';
}

// Market visual coordinates mapped precisely to USA SVG Map (0-100% scale)
const MARKET_MAP_CONFIG: Record<
  string,
  { left: string; top: string; name: string; region: Region }
> = {
  // NW Region (WA, OR, ID, MT, WY, CO, UT, AK + Oakland/NorCal + Reno/NorNV)
  'mkt-seattle': { left: '13.0%', top: '16.0%', name: 'Seattle', region: 'NW' },
  'mkt-portland': { left: '12.0%', top: '24.0%', name: 'Portland', region: 'NW' },
  'mkt-boise': { left: '21.0%', top: '25.0%', name: 'Boise', region: 'NW' },
  'mkt-oakland': { left: '9.5%', top: '48.0%', name: 'Oakland', region: 'NW' },
  'mkt-reno': { left: '18.5%', top: '43.0%', name: 'Reno', region: 'NW' },
  'mkt-saltlake': { left: '28.0%', top: '38.0%', name: 'Salt Lake', region: 'NW' },
  'mkt-denver': { left: '37.0%', top: '46.0%', name: 'Denver', region: 'NW' },

  // SW Region (AZ, NM, HI + LA/SoCal + Las Vegas/SoNV)
  'mkt-losangeles': { left: '11.5%', top: '61.0%', name: 'LA/LB', region: 'SW' },
  'mkt-lasvegas': { left: '18.0%', top: '51.0%', name: 'Las Vegas', region: 'SW' },
  'mkt-phoenix': { left: '21.5%', top: '62.0%', name: 'Phoenix', region: 'SW' },

  // NE Region (IL, NY, MD, MA, etc.)
  'mkt-chicago': { left: '58.0%', top: '38.0%', name: 'Chicago', region: 'NE' },
  'mkt-newyork': { left: '81.5%', top: '32.0%', name: 'NY/NJ', region: 'NE' },
  'mkt-baltimore': { left: '79.5%', top: '41.0%', name: 'Baltimore', region: 'NE' },
  'mkt-norfolk': { left: '79.0%', top: '48.0%', name: 'Norfolk', region: 'NE' },

  // SE Region (TX, TN, GA, FL, etc.)
  'mkt-dallas': { left: '46.0%', top: '64.0%', name: 'Dallas', region: 'SE' },
  'mkt-houston': { left: '48.5%', top: '75.0%', name: 'Houston', region: 'SE' },
  'mkt-charleston': { left: '75.5%', top: '60.0%', name: 'Charleston', region: 'SE' },
  'mkt-savannah': { left: '73.5%', top: '66.0%', name: 'Savannah', region: 'SE' },
  'mkt-atlanta': { left: '71.0%', top: '62.0%', name: 'Atlanta', region: 'SE' },
  'mkt-miami': { left: '78.5%', top: '88.0%', name: 'Miami', region: 'SE' }
};

type KpiFilterType = 'all' | 'at_under' | '0_5_over' | 'over_5' | 'low_confidence';

export const TargetControlTower: React.FC<TargetControlTowerProps> = ({
  kpis,
  markets,
  laneExceptions,
  plannedAdjustments,
  selectedRegion,
  setSelectedRegion,
  onAdjustLane,
  onAdjustMarket,
  onScheduleNewChange,
  onUploadData,
  onExportTargets,
  searchQuery,
  teamContext = 'Pricing Team'
}) => {
  const [selectedMarketId, setSelectedMarketId] = useState<string>('mkt-oakland');
  const [dateRange, setDateRange] = useState<string>('Jun 21 - Jun 27, 2026');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [tableFilter, setTableFilter] = useState<'all' | 'high_var'>('all');
  const [filterToSelectedMarket, setFilterToSelectedMarket] = useState<boolean>(false);
  const [kpiFilter, setKpiFilter] = useState<KpiFilterType>('all');
  const [adjustmentFilter, setAdjustmentFilter] = useState<'all' | 'unadjusted' | 'adjusted'>('all');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // New Filters requested: Account Manager, Customer, Carrier & Key Account adjustment toggle
  const [selectedAccountManager, setSelectedAccountManager] = useState<string>('all');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>('all');
  const [selectedCarrierFilter, setSelectedCarrierFilter] = useState<string>('all');
  const [keyAccountFilter, setKeyAccountFilter] = useState<'all' | 'exclude_key' | 'key_only'>('all');

  // Track expanded load detail dropdown state for table rows
  const [expandedLaneIds, setExpandedLaneIds] = useState<Record<string, boolean>>({});

  const toggleLaneExpand = (id: string) => {
    setExpandedLaneIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const generateLoadRows = (exc: LaneException): LoadDetail[] => {
    if (exc.loadsDetail && exc.loadsDetail.length > 0) return exc.loadsDetail;
    const hash = exc.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const containers = ['NYKU4803437', 'TRHU5175377', 'FFAU1450200', 'MRSU2938104', 'TCNU8830192'];
    const carriersList = [
      'Alliance Worldwide Corp',
      'Pacific Freight Logistics',
      "Brosky's Trucking Inc",
      'Amaral Transport LLC',
      'Trokiando Transportation',
      'Flat-line Xpress LLC',
      'Big Boss Transportation',
      'J.B. Hunt Intermodal',
      'Schneider National',
      'Swift Transportation'
    ];
    const customersList = [
      'UPS Supply Chain Solutions',
      'Amazon Logistics, Inc.',
      'Target Supply Chain',
      'Walmart Distribution',
      'Home Depot Supply',
      'FedEx Freight Services',
      'Wayfair Fulfillment'
    ];
    const amList = [
      'Kevin Plummer',
      'Sarah Jenkins',
      'Marcus Vance',
      'Elena Rostova',
      'David Miller'
    ];
    const originClean = exc.origin.replace(/,/g, '').toUpperCase();
    const destClean = exc.destination.replace(/,/g, '').toUpperCase();
    const chargedPct = Math.min(65, Math.max(12, Math.abs(exc.varPercent) + 32));

    const loadCount = Math.max(1, exc.loads || 1);
    const rows: LoadDetail[] = [];
    for (let i = 0; i < loadCount; i++) {
      const rowHash = hash + i * 19;
      const day = 14 + (i % 10);
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      rows.push({
        loadNo: `LD${483410 + ((rowHash * 13) % 8000)}`,
        containerNo: containers[i % containers.length] || `MSCU${782100 + i}`,
        customer: i === 0 && exc.customer ? exc.customer : customersList[rowHash % customersList.length],
        accountManager: exc.accountManager || amList[rowHash % amList.length],
        carrier: exc.carrier || carriersList[rowHash % carriersList.length],
        outgateDate: `2026-03-${dayStr}`,
        origin: originClean,
        destination: destClean,
        chargedPercent: chargedPct,
        isKeyAccount: i % 3 === 0 ? (exc.isKeyAccount ?? true) : false
      });
    }

    return rows;
  };

  // Sync selected market when region changes
  useEffect(() => {
    if (selectedRegion !== 'USA') {
      const regionMarkets = markets.filter((m) => m.region === selectedRegion);
      if (regionMarkets.length > 0) {
        // If current market is not in selected region, pick the first market in the region
        const currentInRegion = regionMarkets.find((m) => m.id === selectedMarketId);
        if (!currentInRegion) {
          setSelectedMarketId(regionMarkets[0].id);
        }
      }
    }
  }, [selectedRegion, markets, selectedMarketId]);

  const handleRegionSelect = (r: Region) => {
    setSelectedRegion(r);
    setFilterToSelectedMarket(false);
    if (r !== 'USA') {
      const firstMarketInRegion = markets.find((m) => m.region === r);
      if (firstMarketInRegion) {
        setSelectedMarketId(firstMarketInRegion.id);
      }
    }
  };

  const handleMarketClick = (mktId: string) => {
    setSelectedMarketId(mktId);
    setFilterToSelectedMarket(true);
    const mkt = markets.find((m) => m.id === mktId);
    if (mkt && selectedRegion !== 'USA' && mkt.region !== selectedRegion) {
      setSelectedRegion(mkt.region);
    }
  };

  const activeMarket = markets.find((m) => m.id === selectedMarketId) || markets[0];
  if (!activeMarket) {
    return <div className="p-4 text-gray-500">No market data available.</div>;
  }

  const activeMarketNameClean = activeMarket.name.replace(/( Market| Hub| Port| Terminal| City)/g, '');

  // Helper to match lane exceptions to market
  const isLaneInMarket = (lane: LaneException, mktId: string, mktName: string): boolean => {
    const nameClean = mktName.replace(/( Market| Hub| Port| Terminal| City)/g, '').toLowerCase();
    const orig = lane.origin.toLowerCase();
    const dest = lane.destination.toLowerCase();

    if (mktId === 'mkt-losangeles' || nameClean.includes('los angeles') || nameClean.includes('la/lb')) {
      const laKeywords = [
        'la/lb',
        'los angeles',
        'long beach',
        'san pedro',
        'shafter',
        'desert hot springs',
        'nogales',
        'san bernardino',
        'perris',
        'fontana',
        'inland empire',
        'ontario'
      ];
      return laKeywords.some((kw) => orig.includes(kw) || dest.includes(kw));
    }

    if (mktId === 'mkt-oakland' || nameClean.includes('oakland')) {
      const oakKeywords = ['oakland', 'stockton', 'reno', 'sparks', 'hollister', 'sacramento', 'san jose', 'benicia'];
      return oakKeywords.some((kw) => orig.includes(kw) || dest.includes(kw));
    }

    if (mktId === 'mkt-seattle' || nameClean.includes('seattle')) {
      const seaKeywords = ['seattle', 'tacoma', 'olympia', 'spokane', 'brighton', 'hubbard', 'portland'];
      return seaKeywords.some((kw) => orig.includes(kw) || dest.includes(kw));
    }

    if (mktId === 'mkt-chicago' || nameClean.includes('chicago')) {
      const chiKeywords = ['chicago', 'joliet', 'elwood', 'battle creek'];
      return chiKeywords.some((kw) => orig.includes(kw) || dest.includes(kw));
    }

    if (mktId === 'mkt-newyork' || nameClean.includes('new york') || nameClean.includes('ny/nj')) {
      const nyKeywords = ['new york', 'ny/nj', 'ny', 'nj', 'newark', 'elizabeth', 'hopewell'];
      return nyKeywords.some((kw) => orig.includes(kw) || dest.includes(kw));
    }

    return orig.includes(nameClean) || dest.includes(nameClean);
  };

  const matchesKpiFilter = (exc: LaneException, filter: KpiFilterType): boolean => {
    if (filter === 'all') return true;
    if (filter === 'at_under') return exc.varPercent <= 0;
    if (filter === '0_5_over') return exc.varPercent > 0 && exc.varPercent <= 5.0;
    if (filter === 'over_5') return exc.varPercent > 5.0;
    if (filter === 'low_confidence') return exc.confidence === 'Low';
    return true;
  };

  // Base Lanes filtered strictly by Region, Market, Account Manager, Customer, Carrier, and Key Account selection
  const regionAndMarketLanes = useMemo(() => {
    return laneExceptions.filter((exc) => {
      const matchesRegion = selectedRegion === 'USA' || exc.market === selectedRegion;
      const matchesMarketFilter =
        !filterToSelectedMarket || isLaneInMarket(exc, activeMarket.id, activeMarket.name);
      const matchesAcctMgr =
        selectedAccountManager === 'all' || exc.accountManager === selectedAccountManager;
      const matchesCust =
        selectedCustomerFilter === 'all' || exc.customer === selectedCustomerFilter;
      const matchesCarr =
        selectedCarrierFilter === 'all' || exc.carrier === selectedCarrierFilter;
      const matchesKeyAccount =
        keyAccountFilter === 'all'
          ? true
          : keyAccountFilter === 'exclude_key'
          ? !exc.isKeyAccount
          : !!exc.isKeyAccount;

      return (
        matchesRegion &&
        matchesMarketFilter &&
        matchesAcctMgr &&
        matchesCust &&
        matchesCarr &&
        matchesKeyAccount
      );
    });
  }, [
    laneExceptions,
    selectedRegion,
    filterToSelectedMarket,
    activeMarket,
    selectedAccountManager,
    selectedCustomerFilter,
    selectedCarrierFilter,
    keyAccountFilter
  ]);

  // Dynamic KPI Stats based on selected top Region / Market
  const displayKpis = useMemo(() => {
    const totalLoads = regionAndMarketLanes.reduce((sum, l) => sum + (l.loads || 0), 0);
    const atUnderLoads = regionAndMarketLanes.filter((l) => l.varPercent <= 0).reduce((sum, l) => sum + (l.loads || 0), 0);
    const over0To5Loads = regionAndMarketLanes.filter((l) => l.varPercent > 0 && l.varPercent <= 5.0).reduce((sum, l) => sum + (l.loads || 0), 0);
    const over5Loads = regionAndMarketLanes.filter((l) => l.varPercent > 5.0).reduce((sum, l) => sum + (l.loads || 0), 0);
    const lowConfLoads = regionAndMarketLanes.filter((l) => l.confidence === 'Low').reduce((sum, l) => sum + (l.loads || 0), 0);

    const safePct = (val: number) => (totalLoads > 0 ? Math.round((val / totalLoads) * 100) : 0);

    return {
      loadsAnalyzed: totalLoads,
      loadsAnalyzedChange: '+4.2%',
      atUnderTarget: atUnderLoads,
      atUnderTargetPercent: safePct(atUnderLoads),
      overTarget0to5: over0To5Loads,
      overTarget0to5Percent: safePct(over0To5Loads),
      overTarget5Plus: over5Loads,
      overTarget5PlusPercent: safePct(over5Loads),
      lowConfidenceLanes: lowConfLoads,
      lowConfidencePercent: safePct(lowConfLoads)
    };
  }, [regionAndMarketLanes]);

  // Market Lanes specifically for active market (and matching KPI filter)
  const activeMarketLanes = laneExceptions.filter(
    (l) => isLaneInMarket(l, activeMarket.id, activeMarket.name) && matchesKpiFilter(l, kpiFilter)
  );

  // Filter exceptions by region, selected market toggle, KPI filter, adjustment status & global search
  const filteredExceptions = laneExceptions.filter((exc) => {
    const matchesRegion = selectedRegion === 'USA' || exc.market === selectedRegion;
    const matchesMarketFilter =
      !filterToSelectedMarket || isLaneInMarket(exc, activeMarket.id, activeMarket.name);
    const matchesAcctMgr =
      selectedAccountManager === 'all' || exc.accountManager === selectedAccountManager;
    const matchesCust =
      selectedCustomerFilter === 'all' || exc.customer === selectedCustomerFilter;
    const matchesCarr =
      selectedCarrierFilter === 'all' || exc.carrier === selectedCarrierFilter;
    const matchesKeyAccount =
      keyAccountFilter === 'all'
        ? true
        : keyAccountFilter === 'exclude_key'
        ? !exc.isKeyAccount
        : !!exc.isKeyAccount;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      exc.origin.toLowerCase().includes(query) ||
      exc.destination.toLowerCase().includes(query) ||
      exc.market.toLowerCase().includes(query) ||
      (exc.customer && exc.customer.toLowerCase().includes(query)) ||
      (exc.carrier && exc.carrier.toLowerCase().includes(query));
    const matchesFilter = tableFilter === 'all' || exc.varPercent > 4.0;
    const matchesKpi = matchesKpiFilter(exc, kpiFilter);
    const matchesAdjustment =
      adjustmentFilter === 'all'
        ? true
        : adjustmentFilter === 'unadjusted'
        ? exc.adjustmentStatus !== 'Adjusted'
        : exc.adjustmentStatus === 'Adjusted';

    return (
      matchesRegion &&
      matchesMarketFilter &&
      matchesAcctMgr &&
      matchesCust &&
      matchesCarr &&
      matchesKeyAccount &&
      matchesSearch &&
      matchesFilter &&
      matchesKpi &&
      matchesAdjustment
    );
  });

  // Calculate adjusted/unadjusted counts on the filtered region/market view to eliminate count conflicts!
  const adjustedLanesCount = regionAndMarketLanes.filter((l) => l.adjustmentStatus === 'Adjusted').length;
  const unadjustedLanesCount = regionAndMarketLanes.filter((l) => l.adjustmentStatus !== 'Adjusted').length;

  const filteredTotalLoads = useMemo(() => {
    return filteredExceptions.reduce((sum, exc) => sum + (exc.loads || 0), 0);
  }, [filteredExceptions]);

  const handleKpiBucketClick = (targetFilter: KpiFilterType) => {
    setKpiFilter((prev) => (prev === targetFilter ? 'all' : targetFilter));
    setTableFilter('all');
    setAdjustmentFilter('all');
  };

  const getKpiFilterName = (filter: KpiFilterType): string => {
    switch (filter) {
      case 'at_under':
        return 'At / Under Target';
      case '0_5_over':
        return '0–5% Over Target';
      case 'over_5':
        return 'More Than 5% Over';
      case 'low_confidence':
        return 'Low Confidence Lanes';
      default:
        return 'All Analyzed Loads';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
<DashboardCharts markets={markets} />

      {/* Controls & Region Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center bg-white border border-[#D8E1EB] rounded-lg px-3 py-1.5 hover:bg-[#E5EEFF] transition-colors shadow-sm text-xs font-semibold text-[#14213D]"
            >
              <span className="material-symbols-outlined text-[#1769FF] mr-2 text-base">calendar_today</span>
              <span>{dateRange}</span>
              <span className="material-symbols-outlined ml-2 text-sm text-[#75777e]">expand_more</span>
            </button>

            {showDatePicker && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-[#D8E1EB] rounded-xl shadow-xl p-3 z-30 text-xs">
                <div className="font-bold text-[#0B1930] mb-2">Select Target Week</div>
                <div className="space-y-1">
                  {['Jun 21 - Jun 27, 2026', 'Jun 14 - Jun 20, 2026', 'Jun 07 - Jun 13, 2026', 'Jul 01 - Jul 07, 2026'].map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setDateRange(d);
                        setShowDatePicker(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded transition-colors ${
                        dateRange === d ? 'bg-[#EAF2FF] text-[#1769FF] font-bold' : 'hover:bg-[#F4F7FA]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Region Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777e] mr-1">Region:</span>
            <div className="flex bg-[#E5EEFF] rounded-lg p-1 border border-[#D8E1EB]">
              {(['USA', 'NW', 'SW', 'NE', 'SE'] as Region[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRegionSelect(r)}
                  className={`px-3 py-1 text-xs uppercase tracking-wider font-bold rounded-lg transition-all ${
                    selectedRegion === r
                      ? 'bg-[#1769FF] text-white shadow-sm'
                      : 'text-[#0B1930] hover:text-[#1769FF]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Market Dropdown Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777e] mr-1">Market:</span>
            <select
              value={filterToSelectedMarket ? selectedMarketId : 'all'}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setFilterToSelectedMarket(false);
                } else {
                  setSelectedMarketId(e.target.value);
                  setFilterToSelectedMarket(true);
                }
              }}
              className="bg-white border border-[#D8E1EB] text-xs font-bold py-1.5 px-3 rounded-lg text-[#0B1930] focus:ring-[#1769FF] shadow-sm"
            >
              <option value="all">
                {selectedRegion === 'USA' ? 'All Markets Nationwide' : `All ${selectedRegion} Markets`}
              </option>
              {markets
                .filter((m) => selectedRegion === 'USA' || m.region === selectedRegion)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Account Manager Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777e] mr-1">Acct Mgr:</span>
            <select
              value={selectedAccountManager}
              onChange={(e) => setSelectedAccountManager(e.target.value)}
              className="bg-white border border-[#D8E1EB] text-xs font-bold py-1.5 px-2.5 rounded-lg text-[#0B1930] focus:ring-[#1769FF] shadow-sm"
            >
              <option value="all">All Account Managers</option>
              <option value="Drayage Ops">Drayage Ops</option>
              <option value="Sarah Jenkins">Sarah Jenkins</option>
              <option value="Mike Ross">Mike Ross</option>
              <option value="Alex Vance">Alex Vance</option>
            </select>
          </div>

          {/* Customer Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777e] mr-1">Customer:</span>
            <select
              value={selectedCustomerFilter}
              onChange={(e) => setSelectedCustomerFilter(e.target.value)}
              className="bg-white border border-[#D8E1EB] text-xs font-bold py-1.5 px-2.5 rounded-lg text-[#0B1930] focus:ring-[#1769FF] shadow-sm max-w-[170px] truncate"
            >
              <option value="all">All Customers</option>
              <option value="Dollar Tree Distribution Inc">Dollar Tree Distribution Inc</option>
              <option value="Target Corp">Target Corp</option>
              <option value="Walmart Logistics">Walmart Logistics</option>
              <option value="Home Depot">Home Depot</option>
              <option value="Wayfair">Wayfair</option>
              <option value="LKQ CORPORATION">LKQ CORPORATION</option>
            </select>
          </div>

          {/* Carrier Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777e] mr-1">Carrier:</span>
            <select
              value={selectedCarrierFilter}
              onChange={(e) => setSelectedCarrierFilter(e.target.value)}
              className="bg-white border border-[#D8E1EB] text-xs font-bold py-1.5 px-2.5 rounded-lg text-[#0B1930] focus:ring-[#1769FF] shadow-sm max-w-[160px] truncate"
            >
              <option value="all">All Carriers</option>
              <option value="FLAT-LINE XPRESS LLC">FLAT-LINE XPRESS LLC</option>
              <option value="JED LOGISTICS INC">JED LOGISTICS INC</option>
              <option value="Swift Transportation">Swift Transportation</option>
              <option value="JB Hunt">JB Hunt</option>
              <option value="Schneider">Schneider</option>
              <option value="Knight Transportation">Knight Transportation</option>
            </select>
          </div>

          {/* Key Volume Accounts Toggle */}
          <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-lg border border-[#CBD5E1]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] px-1">Key Accounts:</span>
            <button
              type="button"
              onClick={() => setKeyAccountFilter('all')}
              className={`px-2 py-0.5 text-[11px] font-extrabold rounded ${
                keyAccountFilter === 'all'
                  ? 'bg-white text-[#0B1930] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0B1930]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setKeyAccountFilter('exclude_key')}
              className={`px-2 py-0.5 text-[11px] font-extrabold rounded flex items-center gap-1 ${
                keyAccountFilter === 'exclude_key'
                  ? 'bg-[#1769FF] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0B1930]'
              }`}
              title="Exclude key contracted accounts from general target adjustments to preserve lower contract rates"
            >
              <span>Exclude Key</span>
              <span className="material-symbols-outlined text-[12px]">lock</span>
            </button>
            <button
              type="button"
              onClick={() => setKeyAccountFilter('key_only')}
              className={`px-2 py-0.5 text-[11px] font-extrabold rounded ${
                keyAccountFilter === 'key_only'
                  ? 'bg-[#0B1930] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0B1930]'
              }`}
            >
              Key Only
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {teamContext !== 'Operations' ? (
            <>
              <button
                onClick={onUploadData}
                className="flex items-center gap-2 px-4 py-2 border border-[#D8E1EB] bg-white text-[#14213D] rounded-lg text-xs font-bold hover:bg-[#F4F7FA] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">upload</span>
                <span>Upload Weekly Load Data</span>
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1769FF] text-white rounded-lg text-xs font-bold hover:bg-[#1769FF]/90 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">download</span>
                <span>Export Carrier Targets</span>
              </button>
            </>
          ) : (
            <span className="bg-[#D58A16]/15 text-[#D58A16] border border-[#D58A16]/30 px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase flex items-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-sm">visibility</span>
              <span>Operations View (Read-Only)</span>
            </span>
          )}
        </div>
      </div>

      {/* KPI Row (Clickable filter cards - dynamic based on selected Region/Market) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Loads Analyzed */}
        <button
          onClick={() => handleKpiBucketClick('all')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            kpiFilter === 'all'
              ? 'bg-[#EAF2FF] border-[#1769FF] ring-2 ring-[#1769FF]/40 shadow-md scale-[1.02]'
              : 'bg-white border-[#D8E1EB] hover:border-[#1769FF]/60 hover:shadow-md'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">Loads Analyzed</span>
            {kpiFilter === 'all' && (
              <span className="material-symbols-outlined text-sm text-[#1769FF]">check_circle</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-2xl text-[#0B1930] tabular-nums">{displayKpis.loadsAnalyzed.toLocaleString()}</span>
            <span className="text-[#178A68] font-medium text-[11px] tabular-nums">{displayKpis.loadsAnalyzedChange}</span>
          </div>
          <div className="text-[10px] text-[#1769FF] font-bold mt-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">filter_list</span>
            <span>Show all on Map & List</span>
          </div>
        </button>

        {/* At / Under Target */}
        <button
          onClick={() => handleKpiBucketClick('at_under')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            kpiFilter === 'at_under'
              ? 'bg-[#EAFDF5] border-[#178A68] ring-2 ring-[#178A68]/40 shadow-md scale-[1.02]'
              : 'bg-white border-[#D8E1EB] hover:border-[#178A68]/60 hover:shadow-md'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">At / Under Target</span>
            {kpiFilter === 'at_under' && (
              <span className="material-symbols-outlined text-sm text-[#178A68]">check_circle</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-2xl text-[#178A68] tabular-nums">{displayKpis.atUnderTarget}</span>
            <span className="bg-[#178A68]/10 text-[#178A68] px-1.5 py-0.5 rounded text-[10px] font-bold">
              {displayKpis.atUnderTargetPercent}%
            </span>
          </div>
          <div className="text-[10px] text-[#178A68] font-bold mt-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">map</span>
            <span>{kpiFilter === 'at_under' ? 'Active Map & List Filter' : 'Filter Map & List'}</span>
          </div>
        </button>

        {/* 0-5% Over Target */}
        <button
          onClick={() => handleKpiBucketClick('0_5_over')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            kpiFilter === '0_5_over'
              ? 'bg-[#FFFBEB] border-[#D58A16] ring-2 ring-[#D58A16]/40 shadow-md scale-[1.02]'
              : 'bg-white border-[#D8E1EB] hover:border-[#D58A16]/60 hover:shadow-md'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">0-5% Over Target</span>
            {kpiFilter === '0_5_over' && (
              <span className="material-symbols-outlined text-sm text-[#D58A16]">check_circle</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-2xl text-[#D58A16] tabular-nums">{displayKpis.overTarget0to5}</span>
            <span className="bg-[#D58A16]/10 text-[#D58A16] px-1.5 py-0.5 rounded text-[10px] font-bold">
              {displayKpis.overTarget0to5Percent}%
            </span>
          </div>
          <div className="text-[10px] text-[#D58A16] font-bold mt-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">map</span>
            <span>{kpiFilter === '0_5_over' ? 'Active Map & List Filter' : 'Filter Map & List'}</span>
          </div>
        </button>

        {/* More Than 5% Over */}
        <button
          onClick={() => handleKpiBucketClick('over_5')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            kpiFilter === 'over_5'
              ? 'bg-[#FEF2F2] border-[#D64545] ring-2 ring-[#D64545]/40 shadow-md scale-[1.02]'
              : 'bg-white border-[#D8E1EB] hover:border-[#D64545]/60 hover:shadow-md'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">More Than 5% Over</span>
            {kpiFilter === 'over_5' && (
              <span className="material-symbols-outlined text-sm text-[#D64545]">check_circle</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-2xl text-[#D64545] tabular-nums">{displayKpis.overTarget5Plus}</span>
            <span className="bg-[#D64545]/10 text-[#D64545] px-1.5 py-0.5 rounded text-[10px] font-bold">
              {displayKpis.overTarget5PlusPercent}%
            </span>
          </div>
          <div className="text-[10px] text-[#D64545] font-bold mt-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">map</span>
            <span>{kpiFilter === 'over_5' ? 'Active Map & List Filter' : 'Filter Map & List'}</span>
          </div>
        </button>

        {/* Low Confidence */}
        <button
          onClick={() => handleKpiBucketClick('low_confidence')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer col-span-2 md:col-span-1 ${
            kpiFilter === 'low_confidence'
              ? 'bg-[#F1F5F9] border-[#475569] ring-2 ring-[#475569]/40 shadow-md scale-[1.02]'
              : 'bg-white border-[#D8E1EB] hover:border-[#475569]/60 hover:shadow-md'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">Low Confidence</span>
            {kpiFilter === 'low_confidence' && (
              <span className="material-symbols-outlined text-sm text-[#475569]">check_circle</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-2xl text-[#0B1930] tabular-nums">{displayKpis.lowConfidenceLanes}</span>
            <span className="bg-[#E5EEFF] text-[#45474d] px-1.5 py-0.5 rounded text-[10px] font-bold">
              {displayKpis.lowConfidencePercent}%
            </span>
          </div>
          <div className="text-[10px] text-[#475569] font-bold mt-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">map</span>
            <span>{kpiFilter === 'low_confidence' ? 'Active Map & List Filter' : 'Filter Map & List'}</span>
          </div>
        </button>
      </div>

      {/* Active Filter Banner when KPI card is selected */}
      {kpiFilter !== 'all' && (
        <div className="bg-[#EAF2FF] border border-[#1769FF]/30 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1769FF]">filter_alt</span>
            <span className="text-xs font-bold text-[#0B1930]">
              Active KPI Bucket:{' '}
              <span className="text-[#1769FF] font-extrabold uppercase">{getKpiFilterName(kpiFilter)}</span>
              <span className="ml-2 font-bold text-[#45474d]">
                ({filteredExceptions.length} Lanes shown, {filteredTotalLoads} Total Loads)
              </span>
            </span>
          </div>
          <button
            onClick={() => handleKpiBucketClick('all')}
            className="px-3 py-1 bg-white border border-[#D8E1EB] hover:border-[#1769FF] text-[#1769FF] font-bold text-xs rounded-lg shadow-2xs hover:bg-[#1769FF] hover:text-white transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            <span>Show All Loads</span>
          </button>
        </div>
      )}

      {/* Map & Market Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Interactive Regional Control Map */}
        <div className="lg:col-span-8 bg-white border border-[#D8E1EB] rounded-2xl relative overflow-hidden shadow-sm flex flex-col p-5">
          {/* Top Title & Legend Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#1769FF]">
                NATIONAL SIGNAL MAP
              </div>
              <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
                Actual pay vs. carrier target
              </h2>
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#475569]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
                <span>Monitored origin state</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                <span>At / under</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div>
                <span>0–5% over</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></div>
                <span>&gt;5% over</span>
              </div>
            </div>
          </div>

          {/* Region Tabs Header Row */}
          <div className="grid grid-cols-5 gap-2.5 mb-5">
            {[
              { id: 'USA', name: 'USA', desc: 'All origin regions' },
              { id: 'NW', name: 'NW', desc: '8 states + Oakland / Reno' },
              { id: 'SW', name: 'SW', desc: '3 states + LA/LB / Las Vegas' },
              { id: 'NE', name: 'NE', desc: '26 states' },
              { id: 'SE', name: 'SE', desc: '11 states' }
            ].map((reg) => {
              const isSelected = selectedRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => handleRegionSelect(reg.id as Region)}
                  className={`py-3 px-2 rounded-xl text-center transition-all border ${
                    isSelected
                      ? 'bg-[#3B629B] text-white border-[#3B629B] shadow-md'
                      : 'bg-[#F8FAFC] text-[#334155] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <div className="text-sm font-extrabold tracking-wide">{reg.name}</div>
                  <div
                    className={`text-[10px] mt-0.5 truncate ${
                      isSelected ? 'text-blue-100 font-medium' : 'text-[#64748B]'
                    }`}
                  >
                    {reg.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Map Surface */}
          <div className="w-full flex-1 bg-[#F1F5F9] rounded-xl relative overflow-hidden flex items-center justify-center p-2 min-h-[480px]">
            {/* Vector USA Map Background */}
            <USAMapSVG selectedRegion={selectedRegion} />

            {/* City Pins on Map */}
            {markets.map((mkt) => {
              const coords = CITY_COORDINATES[mkt.id];
              const point = coords ? getAlbersProjection()(coords) : null;
              if (!point) return null;

              const leftPos = `${(point[0] / 960) * 100}%`;
              const topPos = `${(point[1] / 560) * 100}%`;

              const isSelected = mkt.id === selectedMarketId;
              const isRegionMatched = selectedRegion === 'USA' || mkt.region === selectedRegion;

              const matchingMarketLanes = laneExceptions.filter(
                (l) => isLaneInMarket(l, mkt.id, mkt.name) && matchesKpiFilter(l, kpiFilter)
              );
              const matchesKpiFilterActive = kpiFilter === 'all' || matchingMarketLanes.length > 0;

              // Color coding matching legend
              let dotColor = '#10B981'; // Green: At / under
              if (mkt.variancePercent > 0 && mkt.variancePercent <= 5.0) {
                dotColor = '#F59E0B'; // Orange: 0-5% over
              } else if (mkt.variancePercent > 5.0 || mkt.status === 'Tight Capacity') {
                dotColor = '#EF4444'; // Red: >5% over
              }

              // Display name overrides matching reference image
              let displayName = mkt.name.replace(' Market', '');
              if (mkt.id === 'mkt-losangeles') displayName = 'LA/LB';
              if (mkt.id === 'mkt-newyork') displayName = 'NY/NJ';

              return (
                <div
                  key={mkt.id}
                  onClick={() => handleMarketClick(mkt.id)}
                  style={{ left: leftPos, top: topPos }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all duration-200 group ${
                    !isRegionMatched || !matchesKpiFilterActive
                      ? 'opacity-25 hover:opacity-100 scale-90 grayscale-[0.5]'
                      : 'opacity-100 scale-100'
                  }`}
                  title={`${mkt.name} (${mkt.region}) - ${matchingMarketLanes.length} matching lanes`}
                >
                  {/* Pin Circle & Clean Label Above/Below */}
                  <div className="relative flex flex-col items-center">
                    {/* City Name Label Above Pin */}
                    <div
                      className={`text-[12px] font-extrabold whitespace-nowrap mb-1 transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'text-[#0F172A] scale-105'
                          : 'text-[#1E293B] group-hover:text-[#2563EB]'
                      }`}
                      style={{
                        textShadow: '0 1px 2px rgba(255,255,255,0.9), 0 -1px 2px rgba(255,255,255,0.9)'
                      }}
                    >
                      <span>{displayName}</span>
                      {kpiFilter !== 'all' && matchingMarketLanes.length > 0 && (
                        <span className="bg-[#1769FF] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                          {matchingMarketLanes.length}
                        </span>
                      )}
                    </div>

                    {/* Dot Marker with Active Blue Ring */}
                    <div className="relative flex items-center justify-center">
                      {isSelected && (
                        <div className="absolute w-7 h-7 rounded-full bg-[#3B82F6]/30 animate-pulse pointer-events-none"></div>
                      )}
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-transform ${
                          isSelected ? 'ring-2 ring-[#2563EB] scale-125 z-30' : 'group-hover:scale-110'
                        }`}
                        style={{ backgroundColor: isSelected ? '#3B82F6' : dotColor }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Selected Market & Lane Info Panel */}
        <div className="lg:col-span-4 bg-white border border-[#D8E1EB] rounded-2xl flex flex-col shadow-sm">
          {/* Header */}
          <div className="p-4 border-b border-[#D8E1EB] flex justify-between items-center bg-[#F4F7FA]/50">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#75777e]">
                Selected Market & Region
              </div>
              <h3 className="font-bold text-base text-[#0B1930] flex items-center gap-2">
                <span>{activeMarket.name}</span>
                <span className="text-[10px] bg-[#EAF2FF] text-[#1769FF] px-2 py-0.5 rounded-full font-extrabold border border-[#1769FF]/20">
                  {activeMarket.region}
                </span>
              </h3>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                activeMarket.status === 'Balanced Market'
                  ? 'bg-[#178A68]/10 text-[#178A68]'
                  : activeMarket.status === 'Tight Capacity'
                  ? 'bg-[#D64545]/10 text-[#D64545]'
                  : 'bg-[#D58A16]/10 text-[#D58A16]'
              }`}
            >
              {activeMarket.status}
            </span>
          </div>

          <div className="p-4 flex-grow space-y-4">
            {/* Rates Overview Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#F4F7FA] rounded-lg border border-[#D8E1EB]">
                <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider block mb-0.5">Avg Actual</span>
                <span className="font-bold text-xl text-[#0B1930] tabular-nums">${activeMarket.avgActual.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-[#F4F7FA] rounded-lg border border-[#D8E1EB]">
                <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider block mb-0.5">Avg Target</span>
                <span className="font-bold text-xl text-[#0B1930] tabular-nums">${activeMarket.avgTarget.toLocaleString()}</span>
              </div>
            </div>

            {/* Variance & Volume Banner */}
            <div className="p-3 bg-[#EAF2FF] rounded-lg border border-[#1769FF]/20 flex justify-between items-center">
              <div>
                <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider block">Target Variance</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`font-bold text-base ${activeMarket.varianceDollars >= 0 ? 'text-[#D58A16]' : 'text-[#178A68]'}`}>
                    {activeMarket.varianceDollars >= 0 ? `+$${activeMarket.varianceDollars}` : `-$${Math.abs(activeMarket.varianceDollars)}`}
                  </span>
                  <span className={`text-xs font-extrabold ${activeMarket.varianceDollars >= 0 ? 'text-[#D58A16]' : 'text-[#178A68]'}`}>
                    ({activeMarket.variancePercent}%)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider block">Weekly Loads</span>
                <span className="font-bold text-base text-[#0B1930] tabular-nums">{activeMarket.loads}</span>
              </div>
            </div>

            {/* Sparkline Trend */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">4-Week Rate Trend</span>
                <span className="text-[10px] font-bold text-[#178A68] bg-[#178A68]/10 px-2 py-0.5 rounded-full">
                  {activeMarket.trendStatus}
                </span>
              </div>
              <div className="sparkline-container items-end h-7 gap-1.5 pt-1 bg-[#F4F7FA] p-1.5 rounded-lg border border-[#D8E1EB]">
                {activeMarket.trendData.map((val, idx) => (
                  <div
                    key={idx}
                    className="spark-bar flex-1 rounded-t transition-all hover:opacity-80"
                    style={{
                      height: `${val}%`,
                      backgroundColor: idx >= activeMarket.trendData.length - 2 ? '#D58A16' : '#1769FF'
                    }}
                    title={`Week ${idx + 1}: ${val}% index`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Dedicated Selected Market Lane Info List */}
            <div className="pt-2 border-t border-[#D8E1EB]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[11px] text-[#0B1930] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#1769FF]">alt_route</span>
                  Lane Info for {activeMarketNameClean}
                </span>
                <span className="text-[10px] text-[#75777e] font-semibold">
                  {activeMarketLanes.length} Active Lanes
                </span>
              </div>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {activeMarketLanes.length > 0 ? (
                  activeMarketLanes.map((lane) => (
                    <div
                      key={lane.id}
                      className={`p-2 border rounded-lg flex items-center justify-between text-xs transition-colors group ${
                        teamContext !== 'Operations' ? 'cursor-pointer' : ''
                      } ${
                        lane.adjustmentStatus === 'Adjusted'
                          ? 'bg-[#EAFDF5] border-[#178A68]/40 hover:bg-[#D1F7E5]'
                          : 'bg-[#F4F7FA] hover:bg-[#EAF2FF] border-[#D8E1EB]'
                      }`}
                      onClick={() => {
                        if (teamContext !== 'Operations') {
                          onAdjustLane(lane);
                        }
                      }}
                    >
                      <div>
                        <div className="font-bold text-[#0B1930] group-hover:text-[#1769FF] flex items-center gap-1.5">
                          <span>{lane.origin} → {lane.destination}</span>
                          {lane.adjustmentStatus === 'Adjusted' && (
                            <span className="bg-[#178A68]/20 text-[#178A68] border border-[#178A68]/30 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shrink-0">
                              <span className="material-symbols-outlined text-[10px]">check</span>
                              <span>Adjusted</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#75777e]">
                          Target: ${lane.currentTarget} | Actual: ${lane.avgActual} ({lane.loads} loads)
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-bold text-xs ${
                            lane.varDollars > 0 ? 'text-[#D58A16]' : 'text-[#178A68]'
                          }`}
                        >
                          {lane.varDollars > 0 ? `+$${lane.varDollars}` : `-$${Math.abs(lane.varDollars)}`}
                        </span>
                        {teamContext !== 'Operations' && (
                          <div className="text-[9px] uppercase font-bold text-[#1769FF] group-hover:underline">
                            {lane.adjustmentStatus === 'Adjusted' ? 'Revise' : 'Adjust'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-[#75777e] bg-[#F4F7FA] rounded-lg border border-dashed border-[#D8E1EB]">
                    No exception lanes flagged for this market.
                  </div>
                )}
              </div>
            </div>
          </div>

          {teamContext !== 'Operations' && (
            <div className="p-4 bg-[#F4F7FA] border-t border-[#D8E1EB] mt-auto">
              <button
                onClick={() => onAdjustMarket(activeMarket)}
                className="w-full py-2.5 bg-[#1769FF] text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#1769FF]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">tune</span>
                <span>Adjust Target for Entire {activeMarket.name}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Queue Table */}
      <div className="bg-white border border-[#D8E1EB] rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#D8E1EB] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-bold text-base text-[#0B1930]">Lane Exceptions & Rates Directory</h3>
            <div className="flex items-center gap-1.5 bg-[#EAF2FF] text-[#1769FF] px-2.5 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider border border-[#1769FF]/20">
              <span>{filteredExceptions.length} Lanes Shown</span>
              <span>•</span>
              <span>{filteredTotalLoads} Total Loads</span>
            </div>
            {selectedRegion !== 'USA' && (
              <span className="text-xs text-[#75777e] font-semibold">
                Region: <strong className="text-[#1769FF]">{selectedRegion}</strong>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Adjustment Status Filter Pills */}
            <div className="flex items-center bg-[#F4F7FA] border border-[#D8E1EB] p-0.5 rounded-lg text-xs font-bold">
              <button
                onClick={() => setAdjustmentFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  adjustmentFilter === 'all'
                    ? 'bg-[#0B1930] text-white shadow-2xs'
                    : 'text-[#45474d] hover:text-[#0B1930]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAdjustmentFilter('unadjusted')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  adjustmentFilter === 'unadjusted'
                    ? 'bg-[#1769FF] text-white shadow-2xs'
                    : 'text-[#45474d] hover:text-[#0B1930]'
                }`}
              >
                <span>Needs Adjustment</span>
                <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                  {unadjustedLanesCount}
                </span>
              </button>
              <button
                onClick={() => setAdjustmentFilter('adjusted')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  adjustmentFilter === 'adjusted'
                    ? 'bg-[#178A68] text-white shadow-2xs'
                    : 'text-[#178A68] hover:text-[#178A68]'
                }`}
              >
                <span className="material-symbols-outlined text-xs">check_circle</span>
                <span>Submitted</span>
                <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                  {adjustedLanesCount}
                </span>
              </button>
            </div>

            <button
              onClick={() => setFilterToSelectedMarket(!filterToSelectedMarket)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                filterToSelectedMarket
                  ? 'bg-[#0B1930] text-white border-[#0B1930]'
                  : 'bg-white border-[#D8E1EB] text-[#45474d] hover:bg-[#F4F7FA]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">filter_alt</span>
              <span>
                {filterToSelectedMarket
                  ? `Filtered to ${activeMarketNameClean}`
                  : `Filter to ${activeMarketNameClean}`}
              </span>
            </button>

            <button
              onClick={() => setTableFilter(tableFilter === 'all' ? 'high_var' : 'all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                tableFilter === 'high_var'
                  ? 'bg-[#1769FF] text-white border-[#1769FF]'
                  : 'bg-white border-[#D8E1EB] text-[#45474d] hover:bg-[#F4F7FA]'
              }`}
            >
              {tableFilter === 'high_var' ? 'Showing >4% Variance' : 'Filter High Variance'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#eff4ff] border-b border-[#D8E1EB]">
              <tr>
                <th className="px-5 py-3 font-bold text-[11px] text-[#45474d] uppercase tracking-wider">Lane & Status</th>
                <th className="px-5 py-3 font-bold text-[11px] text-[#45474d] uppercase tracking-wider">Region / Market</th>
                <th className="px-5 py-3 font-bold text-[11px] text-[#45474d] uppercase tracking-wider text-right">Loads</th>
                <th className="px-5 py-3 font-bold text-[11px] text-[#45474d] uppercase tracking-wider text-right">Current Target</th>
                <th className="px-5 py-3 font-bold text-[11px] text-[#45474d] uppercase tracking-wider text-right">Avg Actual</th>
                <th className="px-5 py-3 font-bold text-[11px] text-[#45474d] uppercase tracking-wider text-right">Var ($)</th>
                <th className="px-5 py-3 font-bold text-[11px] text-[#45474d] uppercase tracking-wider text-right">Var (%)</th>
                <th className="px-5 py-3 font-bold text-[11px] text-[#45474d] uppercase tracking-wider text-center">Confidence</th>
                <th className="px-5 py-3 font-bold text-[11px] text-[#45474d] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E1EB]">
              {filteredExceptions.length > 0 ? (
                filteredExceptions.map((exc) => {
                  const isCurrentMarketLane =
                    exc.origin.toLowerCase().includes(activeMarketNameClean.toLowerCase()) ||
                    exc.destination.toLowerCase().includes(activeMarketNameClean.toLowerCase());
                  const isAdjusted = exc.adjustmentStatus === 'Adjusted';
                  const isPending = exc.adjustmentStatus === 'Pending Approval';

                  return (
                    <React.Fragment key={exc.id}>
                      <tr
                        className={`hover:bg-[#F4F7FA] transition-all group ${
                          isAdjusted
                            ? 'bg-[#EAFDF5]/50 border-l-4 border-l-[#178A68]'
                            : isPending
                            ? 'bg-[#FFFBEB]/50 border-l-4 border-l-[#D58A16]'
                            : isCurrentMarketLane
                            ? 'bg-[#EAF2FF]/30'
                            : ''
                        }`}
                      >
                        <td className="px-5 py-3 font-bold text-[#0B1930]">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Dropdown Arrow for Load Detail Expansion */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLaneExpand(exc.id);
                              }}
                              className="text-[#D58A16] hover:text-[#B46E0E] transition-all cursor-pointer inline-flex items-center justify-center p-0.5 rounded hover:bg-[#D58A16]/10 mr-0.5"
                              title={expandedLaneIds[exc.id] ? "Collapse Load Details" : "Expand Load Details"}
                            >
                              <span
                                className={`material-symbols-outlined text-lg font-black transition-transform duration-200 ${
                                  expandedLaneIds[exc.id] ? 'rotate-180 text-[#D58A16]' : 'text-[#D58A16]'
                                }`}
                              >
                                arrow_drop_down
                              </span>
                            </button>

                            {isCurrentMarketLane && !isAdjusted && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1769FF]"></span>
                            )}
                            <span className="text-xs font-bold text-[#0B1930]">
                              {exc.origin} → {exc.destination}
                            </span>

                            {/* Key Account Badge */}
                            {exc.isKeyAccount && (
                              <span className="bg-[#1E1B4B] text-[#A5B4FC] border border-[#312E81] font-extrabold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <span className="material-symbols-outlined text-[10px]">key</span>
                                <span>Key Volume Account</span>
                              </span>
                            )}

                            {/* Prominent Submitted Badge */}
                            {isAdjusted && (
                              <span className="bg-[#178A68]/15 text-[#178A68] border border-[#178A68]/30 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 shadow-2xs">
                                <span className="material-symbols-outlined text-xs">check_circle</span>
                                <span>Adjustment Submitted (${exc.currentTarget.toLocaleString()})</span>
                              </span>
                            )}

                            {isPending && (
                              <span className="bg-[#D58A16]/15 text-[#D58A16] border border-[#D58A16]/30 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <span className="material-symbols-outlined text-xs">hourglass_top</span>
                                <span>Pending Review</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[#45474d]">
                          <span className="px-2 py-0.5 rounded bg-[#F4F7FA] border border-[#D8E1EB] font-bold text-[10px]">
                            {exc.market}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-medium tabular-nums">{exc.loads}</td>
                        <td className="px-5 py-3 text-right font-medium tabular-nums">${exc.currentTarget.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right font-medium tabular-nums">${exc.avgActual.toLocaleString()}</td>
                        <td
                          className={`px-5 py-3 text-right font-bold tabular-nums ${
                            exc.varDollars > 0 ? 'text-[#D58A16]' : 'text-[#178A68]'
                          }`}
                        >
                          {exc.varDollars > 0 ? `+$${exc.varDollars}` : `-$${Math.abs(exc.varDollars)}`}
                        </td>
                        <td
                          className={`px-5 py-3 text-right font-bold tabular-nums ${
                            exc.varPercent > 4 ? 'text-[#D64545]' : exc.varPercent > 0 ? 'text-[#D58A16]' : 'text-[#178A68]'
                          }`}
                        >
                          {exc.varPercent}%
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              exc.confidence === 'High'
                                ? 'bg-[#178A68]/10 text-[#178A68]'
                                : 'bg-[#E5EEFF] text-[#45474d]'
                            }`}
                          >
                            {exc.confidence}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {teamContext === 'Operations' ? (
                            <span className="text-[#94A3B8] font-bold text-xs">
                              {isAdjusted ? (
                                <span className="text-[#178A68] font-bold text-[11px] uppercase">Submitted</span>
                              ) : isPending ? (
                                <span className="text-[#D58A16] font-bold text-[11px] uppercase">Pending</span>
                              ) : (
                                '—'
                              )}
                            </span>
                          ) : isAdjusted ? (
                            <button
                              onClick={() => onAdjustLane(exc)}
                              className="px-3 py-1 bg-[#178A68]/15 text-[#178A68] border border-[#178A68]/40 hover:bg-[#178A68] hover:text-white rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-2xs ml-auto group/btn cursor-pointer"
                              title="Click to edit or revise submitted adjustment"
                            >
                              <span className="material-symbols-outlined text-xs">check_circle</span>
                              <span>Submitted</span>
                            </button>
                          ) : isPending ? (
                            <button
                              onClick={() => onAdjustLane(exc)}
                              className="px-3 py-1 bg-[#D58A16]/15 text-[#D58A16] border border-[#D58A16]/40 hover:bg-[#D58A16] hover:text-white rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-2xs ml-auto cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs">hourglass_top</span>
                              <span>Pending</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onAdjustLane(exc)}
                              className="px-3 py-1 bg-[#1769FF] text-white rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-[#1769FF]/90 transition-all shadow-sm cursor-pointer"
                            >
                              Adjust Lane
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Load Detail Dropdown Table */}
                      {expandedLaneIds[exc.id] && (
                        <tr className="bg-[#0F172A] text-white animate-in fade-in duration-200">
                          <td colSpan={9} className="p-4 border-t border-b border-[#1E293B]">
                            <div className="space-y-3 font-mono">
                              {/* Top Summary Bar */}
                              <div className="flex flex-wrap items-center justify-between text-xs border-b border-[#1E293B] pb-2 font-mono gap-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-[#38BDF8] font-extrabold flex items-center gap-1.5 text-xs">
                                    <span className="text-xs">▼</span>
                                    <span>{exc.origin} → {exc.destination} ({exc.loads} Active Loads)</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="bg-[#1E3A8A] text-[#93C5FD] border border-[#3B82F6]/30 px-2.5 py-0.5 rounded text-[10px] font-bold">
                                    {exc.market || 'PADD 2 - Midwest'}
                                  </span>
                                  <span className="text-[#94A3B8] text-[11px] font-mono">2026-03-16</span>
                                </div>
                              </div>

                              {/* Load Details Table */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs font-mono">
                                  <thead>
                                    <tr className="text-[#94A3B8] text-[10px] uppercase border-b border-[#1E293B]">
                                      <th className="py-2 px-3 font-bold">LOAD #</th>
                                      <th className="py-2 px-3 font-bold text-[#38BDF8]">CONTAINER</th>
                                      <th className="py-2 px-3 font-bold text-[#F59E0B]">CUSTOMER</th>
                                      <th className="py-2 px-3 font-bold text-[#38BDF8]">ACCOUNT MANAGER</th>
                                      <th className="py-2 px-3 font-bold text-[#A5B4FC]">CARRIER</th>
                                      <th className="py-2 px-3 font-bold">OUTGATE DATE</th>
                                      <th className="py-2 px-3 font-bold">ORIGIN</th>
                                      <th className="py-2 px-3 font-bold">DEST</th>
                                      <th className="py-2 px-3 font-bold text-right text-[#38BDF8]">CHARGED%</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#1E293B] text-xs">
                                    {generateLoadRows(exc).map((ld, idx) => (
                                      <tr key={idx} className="hover:bg-[#1E293B]/60 transition-colors">
                                        <td className="py-2 px-3 text-[#38BDF8] font-bold hover:underline cursor-pointer">
                                          {ld.loadNo}
                                        </td>
                                        <td className="py-2 px-3 text-[#00E5FF] font-extrabold">{ld.containerNo}</td>
                                        <td className="py-2 px-3">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[#F59E0B] font-extrabold">{ld.customer || exc.customer || 'UPS Supply Chain Solutions'}</span>
                                            {ld.isKeyAccount && (
                                              <span className="bg-[#1E1B4B] text-[#A5B4FC] border border-[#312E81] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 shrink-0" title="Key Volume Account Load">
                                                <span className="material-symbols-outlined text-[9px]">key</span>
                                                <span>KEY</span>
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-2 px-3 text-[#CBD5E1] font-medium">{ld.accountManager || exc.accountManager || 'Kevin Plummer'}</td>
                                        <td className="py-2 px-3 text-[#E2E8F0] font-semibold">{ld.carrier || exc.carrier || 'Alliance Worldwide Corp'}</td>
                                        <td className="py-2 px-3 text-[#94A3B8]">{ld.outgateDate}</td>
                                        <td className="py-2 px-3 text-[#E2E8F0] font-bold">{ld.origin}</td>
                                        <td className="py-2 px-3 text-[#E2E8F0] font-bold">{ld.destination}</td>
                                        <td className="py-2 px-3 text-right text-[#38BDF8] font-extrabold">
                                          {ld.chargedPercent.toFixed(2)}%
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-[#75777e]">
                    No lane exceptions match current region, market, or adjustment status filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 bg-[#eff4ff] border-t border-[#D8E1EB] flex justify-between items-center text-xs text-[#45474d]">
          <span>Showing {filteredExceptions.length} Exception Lanes</span>
          <div className="flex gap-2">
            <button className="p-1 border border-[#D8E1EB] rounded hover:bg-white transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="p-1 border border-[#D8E1EB] rounded hover:bg-white transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* List of Entered Adjustments */}
      <div className="bg-[#0B1930] text-white p-6 rounded-xl relative overflow-hidden shadow-lg border border-white/10">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#1769FF 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        ></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#1769FF] text-2xl">event_repeat</span>
              <div>
                <h3 className="font-bold text-lg">List of Entered Adjustments</h3>
                <p className="text-xs text-[#7784a0]">All scheduled rate shift & target benchmark adjustments</p>
              </div>
            </div>
            {teamContext !== 'Operations' && (
              <button
                onClick={onScheduleNewChange}
                className="px-3.5 py-2 bg-[#1769FF] text-white font-bold text-xs rounded-lg hover:bg-[#1769FF]/90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>+ Schedule Adjustment</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plannedAdjustments.map((adj) => (
              <div
                key={adj.id}
                className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="font-bold text-xs text-white leading-snug">{adj.title}</h4>
                    <span
                      className={`font-bold text-[10px] px-2 py-0.5 rounded shrink-0 ${
                        adj.status === 'Pending Approval'
                          ? 'bg-[#D58A16]/20 text-[#D58A16] border border-[#D58A16]/30'
                          : 'bg-[#178A68]/20 text-[#178A68] border border-[#178A68]/30'
                      }`}
                    >
                      {adj.status}
                    </span>
                  </div>
                  {adj.notes && (
                    <p className="text-[11px] text-[#94A3B8] mb-3 line-clamp-2 leading-relaxed">{adj.notes}</p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-[#7784a0]">
                  <span>
                    Effective: <strong className="text-white font-semibold">{adj.effectiveDate}</strong>
                  </span>
                  <span
                    className={`font-extrabold tabular-nums px-2 py-0.5 rounded ${
                      adj.changePercent >= 0 ? 'bg-[#1769FF]/20 text-[#38BDF8]' : 'bg-[#178A68]/20 text-[#34D399]'
                    }`}
                  >
                    {adj.changePercent >= 0 ? `+${adj.changePercent}%` : `${adj.changePercent}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options Modal for Carrier Targets */}
      <ExportCarrierTargetsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        selectedRegion={selectedRegion}
        laneExceptions={laneExceptions}
        customerLanes={[]}
      />
    </div>
  );
};
