import React, { useState, useEffect, useMemo } from 'react';
import {
  Region,
  KPIStats,
  MarketSummary,
  LaneException,
  PlannedAdjustment,
  LoadDetail,
  ActualLoadIngestRecord
} from '../types';
import { USAMapSVG, CITY_COORDINATES, getAlbersProjection } from './USAMapSVG';
import { GoogleLogisticsMap } from './GoogleLogisticsMap';
import { ExportCarrierTargetsModal } from './modals/ExportCarrierTargetsModal';
import { UploadActualsModal } from './modals/UploadActualsModal';
import { TargetWeekDatePicker, DateRangeState } from './common/TargetWeekDatePicker';
import { ReviewAdjustmentModal } from './modals/ReviewAdjustmentModal';
import { LowConfidenceDefinitionModal } from './modals/LowConfidenceDefinitionModal';
import { isPickupDateInRange, formatDateIso } from '../utils/dateWeekUtils';

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
  onApprovePlannedAdjustment?: (
    id: string,
    effectiveDate: string,
    approvedBy?: string,
    approvalNotes?: string,
    adjustedPercent?: number
  ) => void;
  onRejectPlannedAdjustment?: (id: string, reason: string) => void;
  onUpdatePlannedAdjustment?: (id: string, updates: Partial<PlannedAdjustment>) => void;
  onDeletePlannedAdjustment?: (id: string) => void;
  onUploadData: () => void;
  onExportTargets: () => void;
  searchQuery: string;
  teamContext?: 'Pricing Team' | 'Operations';
  onIngestActuals?: (records: ActualLoadIngestRecord[]) => Promise<void>;
  onResetBaseline?: () => Promise<void>;
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
  onApprovePlannedAdjustment,
  onRejectPlannedAdjustment,
  onUpdatePlannedAdjustment,
  onDeletePlannedAdjustment,
  onUploadData,
  onExportTargets,
  searchQuery,
  teamContext = 'Pricing Team',
  onIngestActuals,
  onResetBaseline
}) => {
  const [selectedMarketId, setSelectedMarketId] = useState<string>('mkt-oakland');
  const [dateRangeState, setDateRangeState] = useState<DateRangeState>({
    startDate: '2026-06-21',
    endDate: '2026-06-27',
    label: 'Week 26 (Jun 21 - Jun 27, 2026)',
    weekNumber: 26,
    isCustom: false
  });
  const [tableFilter, setTableFilter] = useState<'all' | 'high_var'>('all');
  const [filterToSelectedMarket, setFilterToSelectedMarket] = useState<boolean>(false);
  const [kpiFilter, setKpiFilter] = useState<KpiFilterType>('all');
  const [adjustmentFilter, setAdjustmentFilter] = useState<'all' | 'unadjusted' | 'adjusted'>('all');
  const [adjustmentTabFilter, setAdjustmentTabFilter] = useState<'all' | 'pending' | 'active' | 'scheduled' | 'rejected'>('all');
  const [reviewAdjustment, setReviewAdjustment] = useState<PlannedAdjustment | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showUploadActualsModal, setShowUploadActualsModal] = useState<boolean>(false);
  const [showLowConfidenceModal, setShowLowConfidenceModal] = useState<boolean>(false);
  const [ingestToast, setIngestToast] = useState<string | null>(null);

  const handleIngestFromModal = async (records: ActualLoadIngestRecord[]) => {
    if (onIngestActuals) {
      await onIngestActuals(records);
    }
    setIngestToast(`Successfully ingested ${records.length} actual load lanes against current target rates!`);
    setTimeout(() => {
      setIngestToast(null);
    }, 5000);
  };

  const handleResetBaselineClick = async () => {
    if (onResetBaseline) {
      await onResetBaseline();
      setIngestToast('Target Control Tower restored to clean baseline data.');
      setTimeout(() => {
        setIngestToast(null);
      }, 4000);
    }
  };

  // Track expanded load detail dropdown state for table rows
  const [expandedLaneIds, setExpandedLaneIds] = useState<Record<string, boolean>>({});

  const toggleLaneExpand = (id: string) => {
    setExpandedLaneIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Multi-Week Load Master Generator: Creates realistic temporal load history across Weeks 20 to 35 (May to August 2026)
  const generateMultiWeekLoadHistory = (exc: LaneException): LoadDetail[] => {
    // If exc already has user-ingested real loads, keep them intact
    if (exc.allLoads && exc.allLoads.length > 0) {
      return exc.allLoads;
    }
    if (exc.loadsDetail && exc.loadsDetail.length > 0 && !exc.loadsDetail[0].loadNo.startsWith('SYN-')) {
      return exc.loadsDetail;
    }

    const hash = exc.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const containers = [
      'NYKU4803437', 'TRHU5175377', 'FFAU1450200', 'MRSU2938104', 'TCNU8830192',
      'OOLU9821034', 'MSKU7412980', 'CMAU3198421', 'ONEU6549210', 'EGLV1239845',
      'MEDU8912450', 'CSNU5620194', 'ZIMU3319082', 'HLCU9012488', 'TEMU4421890'
    ];
    const carriersList = [
      'FLAT-LINE XPRESS LLC', 'Swift Transportation', 'JB Hunt', 'Schneider',
      'JED LOGISTICS INC', 'Knight Transportation', 'Carvago LLC', 'Werner Enterprises',
      'Landstar System', 'Hub Group', 'Estes Forwarding', 'XPO Logistics',
      'Western Express', 'Heartland Express', 'CRST International', 'Marten Transport',
      'Pacific Freight Logistics', 'Amaral Transport LLC', 'Big Boss Transportation',
      'Bay Port Trucking Inc', 'Evergreen Drayage LLC', 'Cascade Intermodal',
      'Columbia River Hauling', 'Mile High Intermodal', 'Rnr Transportation',
      'Sandino Freight Services', 'Trokiando Transportation', 'Go Cargo LLC',
      'Rouse Trucking LLC', 'Brosky\'s Trucking Inc', 'Alliance Worldwide Corp'
    ];
    const customersList = [
      'Amazon Logistics, Inc.', 'Dollar Tree Distribution Inc', 'Target Corp',
      'Ross Stores, Inc.', 'Walmart Distribution', 'Home Depot Ops',
      'Wayfair Fulfillment', 'LKQ Corporation', 'Lowe\'s Companies',
      'Costco Wholesale', 'Best Buy Logistics', 'Sysco Corp',
      'Tyson Foods', 'Nike Inc', 'Procter & Gamble', 'UPS Supply Chain Solutions',
      'Discount Tire', 'FedEx Ground'
    ];
    const amList = [
      'Sarah Jenkins', 'Mike Ross', 'Alex Vance', 'Kevin Plummer',
      'Drayage Ops', 'Marcus Vance', 'Elena Rostova', 'David Miller',
      'Rachel Torres', 'Jordan Hayes', 'Brian Murphy', 'Lisa Chang',
      'Dan Reynolds', 'David Vance'
    ];

    const originClean = exc.origin.replace(/,/g, '').toUpperCase();
    const destClean = exc.destination.replace(/,/g, '').toUpperCase();
    const chargedPct = Math.min(65, Math.max(12, Math.abs(exc.varPercent) + 32));

    // Distribution across weeks: Week 20 (May 10) to Week 35 (Aug 29)
    const weekStartDates = [
      '2026-05-10', '2026-05-17', '2026-05-24', '2026-05-31',
      '2026-06-07', '2026-06-14', '2026-06-21', '2026-06-28',
      '2026-07-05', '2026-07-12', '2026-07-19', '2026-07-26',
      '2026-08-02', '2026-08-09', '2026-08-16', '2026-08-23'
    ];

    const allLoads: LoadDetail[] = [];
    const baseVolume = Math.max(1, exc.loads || 1);

    // Populate loads across the 16 calendar weeks
    weekStartDates.forEach((wStart, wIdx) => {
      const weekNo = 20 + wIdx;
      let weekVolume = Math.round(baseVolume * (weekNo === 26 ? 1.0 : weekNo === 25 ? 0.9 : weekNo === 28 ? 1.15 : (0.5 + ((hash + weekNo * 7) % 60) / 100)));
      if (weekVolume === 0 && (hash + weekNo) % 3 === 0) weekVolume = 1;

      const wStartDate = new Date(`${wStart}T00:00:00`);

      for (let i = 0; i < weekVolume; i++) {
        const rowHash = hash + wIdx * 37 + i * 19;
        const dayOffset = (i * 2 + (rowHash % 5)) % 6; // Mon-Sat
        const loadDate = new Date(wStartDate.getTime() + (dayOffset + 1) * 86400000);
        const outgateDate = formatDateIso(loadDate);

        const varianceFactor = 1 + (((rowHash % 21) - 10) / 100);
        const rateVariance = (exc.avgActual - exc.currentTarget) * varianceFactor;
        const actualPay = Math.round(Math.max(150, exc.currentTarget + rateVariance));

        allLoads.push({
          loadNo: `LD${483410 + ((rowHash * 13) % 8000)}`,
          containerNo: containers[(rowHash + i) % containers.length],
          customer: (i === 0 && exc.customer) ? exc.customer : customersList[(rowHash + i) % customersList.length],
          accountManager: (i === 0 && exc.accountManager) ? exc.accountManager : amList[(rowHash + i) % amList.length],
          carrier: (i === 0 && exc.carrier) ? exc.carrier : carriersList[(rowHash + i) % carriersList.length],
          outgateDate,
          origin: originClean,
          destination: destClean,
          chargedPercent: chargedPct,
          actualPay,
          targetRate: exc.currentTarget,
          isKeyAccount: i % 3 === 0 ? (exc.isKeyAccount ?? true) : false
        });
      }
    });

    return allLoads;
  };

  // Helper to filter out corrupted text lines and guarantee strictly unique IDs and multi-week loadsDetail
  const isCorrupted = (str: string) => /[\x00-\x1F\x7F-\x9F\uFFFD]/.test(str) || str.length > 55 || str.includes('ï¿½');
  
  // Master lanes with permanent multi-week load history
  const masterLaneExceptions = useMemo(() => {
    const seenIds = new Set<string>();
    return laneExceptions
      .filter((e) => !isCorrupted(e.origin) && !isCorrupted(e.destination))
      .map((e, idx) => {
        const uniqueId = (!e.id || seenIds.has(e.id))
          ? `exc-safe-${idx}-${e.id || 'gen'}-${Math.random().toString(36).slice(2, 7)}`
          : e.id;
        seenIds.add(uniqueId);
        const item = { ...e, id: uniqueId };
        const allLoads = (item.allLoads && item.allLoads.length > 0)
          ? item.allLoads
          : (item.loadsDetail && item.loadsDetail.length > 0 && !item.loadsDetail[0].loadNo.startsWith('SYN-'))
          ? item.loadsDetail
          : generateMultiWeekLoadHistory(item);
        return {
          ...item,
          allLoads
        };
      });
  }, [laneExceptions]);

  // Dynamically compute safeLaneExceptions filtered to current dateRangeState
  const safeLaneExceptions = useMemo(() => {
    return masterLaneExceptions.map((lane) => {
      const allLoads = lane.allLoads || lane.loadsDetail || [];
      const activeLoads = allLoads.filter((ld) =>
        isPickupDateInRange(ld.outgateDate, dateRangeState.startDate, dateRangeState.endDate)
      );

      const activeCount = activeLoads.length;
      if (activeCount > 0) {
        const avgActual = Math.round(
          activeLoads.reduce((sum, ld) => sum + (ld.actualPay || lane.currentTarget), 0) / activeCount
        );
        const varDollars = avgActual - lane.currentTarget;
        const varPercent = Number(((varDollars / lane.currentTarget) * 100).toFixed(1));

        return {
          ...lane,
          loads: activeCount,
          avgActual,
          varDollars,
          varPercent,
          confidence: activeCount >= 10 ? 'High' : activeCount >= 5 ? 'Medium' : 'Low',
          impact: Math.abs(varDollars) * activeCount > 3000 ? 'High' : Math.abs(varDollars) * activeCount > 1000 ? 'Medium' : 'Low',
          loadsDetail: activeLoads
        };
      }

      // If no loads in this specific date range, maintain lane record with 0 active loads
      return {
        ...lane,
        loads: 0,
        avgActual: lane.currentTarget,
        varDollars: 0,
        varPercent: 0,
        loadsDetail: []
      };
    });
  }, [masterLaneExceptions, dateRangeState]);

  // New Filters requested: Account Manager, Customer, Carrier & Key Account adjustment toggle
  const [selectedAccountManager, setSelectedAccountManager] = useState<string>('all');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>('all');
  const [selectedCarrierFilter, setSelectedCarrierFilter] = useState<string>('all');
  const [keyAccountFilter, setKeyAccountFilter] = useState<'all' | 'exclude_key' | 'key_only'>('all');

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

  const defaultFallbackMarket: MarketSummary = {
    id: 'mkt-oakland',
    name: 'Oakland Market',
    region: 'NW',
    avgTarget: 740,
    avgActual: 760,
    varianceDollars: 20,
    variancePercent: 2.7,
    loads: 284,
    trendStatus: 'Stabilizing',
    trendData: [45, 60, 55, 70, 65, 80, 75, 85],
    status: 'Balanced Market'
  };

  const activeMarket = (markets && markets.length > 0)
    ? (markets.find((m) => m.id === selectedMarketId) || markets[0])
    : defaultFallbackMarket;

  const activeMarketNameClean = (activeMarket?.name || 'Oakland Market').replace(/( Market| Hub| Port| Terminal| City)/g, '');

  // Helper to match lane exceptions to market
  const isLaneInMarket = (lane: LaneException, mktId?: string, mktName?: string): boolean => {
    if (!lane) return false;
    if (!mktId && !mktName) return true;

    const id = (mktId || '').toLowerCase();
    const nameClean = (mktName || '').replace(/( Market| Hub| Port| Terminal| City)/g, '').toLowerCase();
    const orig = (lane.origin || '').toLowerCase();
    const dest = (lane.destination || '').toLowerCase();

    // Northwest (NW)
    if (id === 'mkt-oakland' || nameClean.includes('oakland')) {
      const kw = ['oakland', 'stockton', 'reno', 'sparks', 'hollister', 'sacramento', 'san jose', 'benicia', 'modesto', 'fresno', 'tracy', 'lathrop', 'manteca', 'livermore', 'vallejo', 'richmond'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-seattle' || nameClean.includes('seattle')) {
      const kw = ['seattle', 'tacoma', 'olympia', 'spokane', 'brighton', 'hubbard', 'portland', 'kent', 'everett', 'auburn', 'fife', 'sumner'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-denver' || nameClean.includes('denver')) {
      const kw = ['denver', 'aurora', 'boulder', 'colorado springs', 'fort collins', 'cheyenne', 'pueblo', 'greeley', 'longmont', 'thornton', 'brighton'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-portland' || nameClean.includes('portland')) {
      const kw = ['portland', 'vancouver', 'salem', 'eugene', 'beaverton', 'hillsboro', 'gresham', 'tualatin', 'wilsonville'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-boise' || nameClean.includes('boise')) {
      const kw = ['boise', 'nampa', 'meridian', 'caldwell', 'twin falls', 'idaho falls', 'pocatello'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-saltlake' || nameClean.includes('salt lake')) {
      const kw = ['salt lake', 'slc', 'west valley', 'ogden', 'provo', 'sandy', 'orem', 'lehi', 'draper'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-reno' || nameClean.includes('reno')) {
      const kw = ['reno', 'sparks', 'carson city', 'fernley', 'tahoe', 'elko', 'winnemucca'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }

    // Southwest (SW)
    if (id === 'mkt-losangeles' || nameClean.includes('los angeles') || nameClean.includes('la/lb')) {
      const kw = ['la/lb', 'los angeles', 'long beach', 'san pedro', 'wilmington', 'terminal island', 'shafter', 'desert hot springs', 'nogales', 'san bernardino', 'perris', 'fontana', 'inland empire', 'ontario', 'riverside', 'compton', 'torrance', 'carson', 'industry', 'moreno valley', 'redlands', 'chino', 'pomona', 'bakersfield'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-phoenix' || nameClean.includes('phoenix')) {
      const kw = ['phoenix', 'mesa', 'chandler', 'glendale', 'scottsdale', 'tempe', 'tucson', 'nogales', 'peoria', 'surprise', 'yuma', 'flagstaff', 'casa grande', 'tolleson'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-lasvegas' || nameClean.includes('las vegas')) {
      const kw = ['las vegas', 'henderson', 'north las vegas', 'boulder city', 'paradise', 'spring valley', 'sunrise manor', 'enterprise'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }

    // Northeast (NE)
    if (id === 'mkt-chicago' || nameClean.includes('chicago')) {
      const kw = ['chicago', 'joliet', 'elwood', 'franklin park', 'harvey', 'north chicago', 'schiller park', 'battle creek', 'naperville', 'aurora', 'rockford', 'gary', 'hammond', 'cicero', 'bedford park', 'des plaines', 'elgin', 'bolingbrook'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-newyork' || nameClean.includes('new york') || nameClean.includes('ny/nj')) {
      const kw = ['new york', 'ny/nj', 'ny', 'nj', 'newark', 'elizabeth', 'jersey city', 'bayonne', 'staten island', 'hopewell', 'edison', 'kearny', 'carteret', 'paterson', 'trenton', 'brooklyn', 'queens', 'bronx'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-baltimore' || nameClean.includes('baltimore')) {
      const kw = ['baltimore', 'annapolis', 'columbia', 'silver spring', 'frederick', 'dundalk', 'essex', 'towson', 'glen burnie', 'hanover'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-norfolk' || nameClean.includes('norfolk')) {
      const kw = ['norfolk', 'portsmouth', 'chesapeake', 'newport news', 'hampton', 'virginia beach', 'suffolk'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }

    // Southeast (SE)
    if (id === 'mkt-atlanta' || nameClean.includes('atlanta')) {
      const kw = ['atlanta', 'austell', 'fairburn', 'macon', 'augusta', 'columbus', 'marietta', 'alpharetta', 'forest park', 'mcdonough', 'duluth', 'norcross', 'newnan'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-savannah' || nameClean.includes('savannah')) {
      const kw = ['savannah', 'garden city', 'pooler', 'brunswick', 'hilton head', 'port wentworth', 'rincon', 'statesboro'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-charleston' || nameClean.includes('charleston')) {
      const kw = ['charleston', 'mount pleasant', 'north charleston', 'summerville', 'goose creek', 'hanahan', 'moncks corner'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-miami' || nameClean.includes('miami')) {
      const kw = ['miami', 'port everglades', 'fort lauderdale', 'hialeah', 'hollywood', 'pompano beach', 'coral springs', 'miramar'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-memphis' || nameClean.includes('memphis')) {
      const kw = ['memphis', 'shelby', 'germantown', 'collierville', 'southaven', 'olive branch', 'nashville', 'west memphis', 'bartlett'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-dallas' || nameClean.includes('dallas')) {
      const kw = ['dallas', 'dfw', 'fort worth', 'haslet', 'wilmer', 'wylie', 'hutchins', 'mesquite', 'arlington', 'plano', 'irving', 'garland', 'grand prairie', 'carrollton', 'richardson', 'denton'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-houston' || nameClean.includes('houston')) {
      const kw = ['houston', 'seabrook', 'morgans point', 'pasadena', 'la porte', 'baytown', 'sugar land', 'pearland', 'beaumont', 'galveston', 'deer park', 'conroe', 'the woodlands', 'katy'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
    }
    if (id === 'mkt-sanantonio' || nameClean.includes('san antonio')) {
      const kw = ['san antonio', 'van ormy', 'new braunfels', 'schertz', 'cibolo', 'converse', 'universal city', 'seguin', 'boerne'];
      return kw.some((k) => orig.includes(k) || dest.includes(k));
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

  // Dynamically derive Account Managers from all loaded lane exceptions and load rows
  const dynamicAccountManagers = useMemo(() => {
    const amMap = new Map<string, { count: number; loads: number }>();
    safeLaneExceptions.forEach((exc) => {
      const am = (exc.accountManager || '').trim();
      if (am) {
        const cur = amMap.get(am) || { count: 0, loads: 0 };
        amMap.set(am, { count: cur.count + 1, loads: cur.loads + (exc.loads || 1) });
      }
      if (exc.loadsDetail) {
        exc.loadsDetail.forEach((ld) => {
          const ldAm = (ld.accountManager || '').trim();
          if (ldAm && !amMap.has(ldAm)) {
            amMap.set(ldAm, { count: 1, loads: 1 });
          }
        });
      }
    });

    return Array.from(amMap.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [safeLaneExceptions]);

  // Dynamically derive Customers from all loaded lane exceptions and load rows
  const dynamicCustomers = useMemo(() => {
    const custMap = new Map<string, { count: number; loads: number }>();
    safeLaneExceptions.forEach((exc) => {
      const cust = (exc.customer || '').trim();
      if (cust) {
        const cur = custMap.get(cust) || { count: 0, loads: 0 };
        custMap.set(cust, { count: cur.count + 1, loads: cur.loads + (exc.loads || 1) });
      }
      if (exc.loadsDetail) {
        exc.loadsDetail.forEach((ld) => {
          const ldCust = (ld.customer || '').trim();
          if (ldCust && !custMap.has(ldCust)) {
            custMap.set(ldCust, { count: 1, loads: 1 });
          }
        });
      }
    });

    return Array.from(custMap.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [safeLaneExceptions]);

  // Dynamically derive Carriers from all loaded lane exceptions and load rows
  const dynamicCarriers = useMemo(() => {
    const carrMap = new Map<string, { count: number; loads: number }>();
    safeLaneExceptions.forEach((exc) => {
      const carr = (exc.carrier || '').trim();
      if (carr) {
        const cur = carrMap.get(carr) || { count: 0, loads: 0 };
        carrMap.set(carr, { count: cur.count + 1, loads: cur.loads + (exc.loads || 1) });
      }
      if (exc.loadsDetail) {
        exc.loadsDetail.forEach((ld) => {
          const ldCarr = (ld.carrier || '').trim();
          if (ldCarr && !carrMap.has(ldCarr)) {
            carrMap.set(ldCarr, { count: 1, loads: 1 });
          }
        });
      }
    });

    return Array.from(carrMap.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [safeLaneExceptions]);

  // Dynamically derive all available Markets including any newly loaded region markets
  const dynamicMarkets = useMemo(() => {
    const marketList: MarketSummary[] = [...markets];
    const knownIds = new Set(marketList.map((m) => m.id));

    safeLaneExceptions.forEach((exc) => {
      if (exc.market && !marketList.some((m) => m.region === exc.market)) {
        const newId = `mkt-${exc.market.toLowerCase()}`;
        if (!knownIds.has(newId)) {
          knownIds.add(newId);
          marketList.push({
            id: newId,
            name: `${exc.market} Region Market`,
            region: exc.market,
            avgTarget: exc.currentTarget,
            avgActual: exc.avgActual,
            varianceDollars: exc.varDollars,
            variancePercent: exc.varPercent,
            loads: exc.loads,
            trendStatus: 'Stabilizing',
            trendData: [50, 55, 60, 65, 70],
            status: 'Balanced Market'
          });
        }
      }
    });

    return marketList;
  }, [markets, safeLaneExceptions]);

  // Available markets filtered by current Region selection
  const availableMarketsForDropdown = useMemo(() => {
    return dynamicMarkets.filter(
      (m) => selectedRegion === 'USA' || m.region === selectedRegion
    );
  }, [dynamicMarkets, selectedRegion]);

  const handleClearAllFilters = () => {
    setSelectedRegion('USA');
    setFilterToSelectedMarket(false);
    setSelectedAccountManager('all');
    setSelectedCustomerFilter('all');
    setSelectedCarrierFilter('all');
    setKeyAccountFilter('all');
    setKpiFilter('all');
    setTableFilter('all');
    setAdjustmentFilter('all');
  };

  const hasActiveTopFilters =
    selectedRegion !== 'USA' ||
    filterToSelectedMarket ||
    selectedAccountManager !== 'all' ||
    selectedCustomerFilter !== 'all' ||
    selectedCarrierFilter !== 'all' ||
    keyAccountFilter !== 'all';

  // Unified top filter matcher function
  const matchesTopFilters = (exc: LaneException): boolean => {
    // 1. Region
    if (selectedRegion !== 'USA' && exc.market !== selectedRegion) {
      return false;
    }

    // 2. Specific Market Filter
    if (filterToSelectedMarket && !isLaneInMarket(exc, activeMarket.id, activeMarket.name)) {
      return false;
    }

    // 3. Account Manager
    if (selectedAccountManager !== 'all') {
      const targetAm = selectedAccountManager.trim().toLowerCase();
      const directMatch = exc.accountManager && exc.accountManager.trim().toLowerCase() === targetAm;
      const detailMatch = exc.loadsDetail && exc.loadsDetail.some((ld) => ld.accountManager && ld.accountManager.trim().toLowerCase() === targetAm);
      if (!directMatch && !detailMatch) return false;
    }

    // 4. Customer
    if (selectedCustomerFilter !== 'all') {
      const targetCust = selectedCustomerFilter.trim().toLowerCase();
      const directMatch = exc.customer && exc.customer.trim().toLowerCase() === targetCust;
      const detailMatch = exc.loadsDetail && exc.loadsDetail.some((ld) => ld.customer && ld.customer.trim().toLowerCase() === targetCust);
      if (!directMatch && !detailMatch) return false;
    }

    // 5. Carrier
    if (selectedCarrierFilter !== 'all') {
      const targetCarr = selectedCarrierFilter.trim().toLowerCase();
      const directMatch = exc.carrier && exc.carrier.trim().toLowerCase() === targetCarr;
      const detailMatch = exc.loadsDetail && exc.loadsDetail.some((ld) => ld.carrier && ld.carrier.trim().toLowerCase() === targetCarr);
      if (!directMatch && !detailMatch) return false;
    }

    // 6. Key Account
    if (keyAccountFilter === 'exclude_key' && exc.isKeyAccount) return false;
    if (keyAccountFilter === 'key_only' && !exc.isKeyAccount) return false;

    return true;
  };

  // Base Lanes filtered strictly by Region, Market, Account Manager, Customer, Carrier, and Key Account selection
  const regionAndMarketLanes = useMemo(() => {
    return safeLaneExceptions.filter((exc) => matchesTopFilters(exc));
  }, [
    safeLaneExceptions,
    selectedRegion,
    filterToSelectedMarket,
    activeMarket,
    selectedAccountManager,
    selectedCustomerFilter,
    selectedCarrierFilter,
    keyAccountFilter,
    dateRangeState
  ]);

  // Dynamic KPI Stats based on all active top filters (Region, Market, Account Manager, Customer, Carrier, Key Account, and Date Range)
  const displayKpis = useMemo(() => {
    let totalLoads = 0;
    let atUnderLoads = 0;
    let over0To5Loads = 0;
    let over5Loads = 0;
    let lowConfLoads = 0;

    regionAndMarketLanes.forEach((l) => {
      const activeLoads = l.loadsDetail || [];
      const laneLoadCount = activeLoads.length;
      totalLoads += laneLoadCount;

      if (laneLoadCount > 0) {
        activeLoads.forEach((ld) => {
          const actual = ld.actualPay || l.avgActual;
          const target = ld.targetRate || l.currentTarget;
          const diffPct = target > 0 ? ((actual - target) / target) * 100 : 0;

          if (diffPct <= 0) {
            atUnderLoads += 1;
          } else if (diffPct <= 5.0) {
            over0To5Loads += 1;
          } else {
            over5Loads += 1;
          }
        });

        if (l.confidence === 'Low') {
          lowConfLoads += laneLoadCount;
        }
      }
    });

    const safePct = (val: number) => (totalLoads > 0 ? Math.round((val / totalLoads) * 100) : 0);

    // Compute dynamic week-over-week change based on active week
    let dynamicChange = '+4.2%';
    if (dateRangeState.weekNumber) {
      const w = dateRangeState.weekNumber;
      if (w === 26) dynamicChange = '+10.9%';
      else if (w === 25) dynamicChange = '+7.4%';
      else if (w === 27) dynamicChange = '-8.2%';
      else if (w === 28) dynamicChange = '+14.1%';
      else if (w === 22) dynamicChange = '-12.5%';
      else if (w > 26) dynamicChange = `+${((w * 3) % 15 + 2).toFixed(1)}%`;
      else dynamicChange = `-${((w * 2) % 10 + 1).toFixed(1)}%`;
    } else if (dateRangeState.isCustom) {
      dynamicChange = '+6.5%';
    }

    return {
      loadsAnalyzed: totalLoads,
      loadsAnalyzedChange: dynamicChange,
      atUnderTarget: atUnderLoads,
      atUnderTargetPercent: safePct(atUnderLoads),
      overTarget0to5: over0To5Loads,
      overTarget0to5Percent: safePct(over0To5Loads),
      overTarget5Plus: over5Loads,
      overTarget5PlusPercent: safePct(over5Loads),
      lowConfidenceLanes: lowConfLoads,
      lowConfidencePercent: safePct(lowConfLoads)
    };
  }, [regionAndMarketLanes, dateRangeState]);

  // Aggregated overview stats for Right Panel when on All Markets or regional overview
  const aggregateOverviewStats = useMemo(() => {
    const activeLanes = regionAndMarketLanes;
    if (activeLanes.length === 0) {
      return {
        avgActual: 0,
        avgTarget: 0,
        varianceDollars: 0,
        variancePercent: 0,
        totalLoads: 0
      };
    }
    const totalLoads = activeLanes.reduce((sum, l) => sum + (l.loads || 1), 0);
    const weightedActual = Math.round(
      activeLanes.reduce((sum, l) => sum + l.avgActual * (l.loads || 1), 0) / Math.max(1, totalLoads)
    );
    const weightedTarget = Math.round(
      activeLanes.reduce((sum, l) => sum + l.currentTarget * (l.loads || 1), 0) / Math.max(1, totalLoads)
    );
    const varDollars = weightedActual - weightedTarget;
    const varPercent = weightedTarget > 0 ? Number(((varDollars / weightedTarget) * 100).toFixed(1)) : 0;
    return {
      avgActual: weightedActual,
      avgTarget: weightedTarget,
      varianceDollars: varDollars,
      variancePercent: varPercent,
      totalLoads
    };
  }, [regionAndMarketLanes]);

  // Market Lanes specifically for active market (and matching KPI filter)
  const activeMarketLanes = safeLaneExceptions.filter(
    (l) => isLaneInMarket(l, activeMarket.id, activeMarket.name) && matchesKpiFilter(l, kpiFilter)
  );

  // Filter exceptions by region, selected market toggle, KPI filter, adjustment status & global search
  const filteredExceptions = useMemo(() => {
    return safeLaneExceptions.filter((exc) => {
      // 1. Must match top filters
      if (!matchesTopFilters(exc)) return false;

      // 2. Search query filter
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        exc.origin.toLowerCase().includes(query) ||
        exc.destination.toLowerCase().includes(query) ||
        exc.market.toLowerCase().includes(query) ||
        (exc.customer && exc.customer.toLowerCase().includes(query)) ||
        (exc.carrier && exc.carrier.toLowerCase().includes(query)) ||
        (exc.accountManager && exc.accountManager.toLowerCase().includes(query));
      if (!matchesSearch) return false;

      // 3. Table filter (High variance)
      if (tableFilter === 'high_variance' && exc.varPercent <= 4.0) return false;

      // 4. KPI Filter Card filter
      if (!matchesKpiFilter(exc, kpiFilter)) return false;

      // 5. Adjustment filter
      if (adjustmentFilter === 'unadjusted' && exc.adjustmentStatus === 'Adjusted') return false;
      if (adjustmentFilter === 'adjusted' && exc.adjustmentStatus !== 'Adjusted') return false;

      return true;
    });
  }, [
    safeLaneExceptions,
    selectedRegion,
    filterToSelectedMarket,
    activeMarket,
    selectedAccountManager,
    selectedCustomerFilter,
    selectedCarrierFilter,
    keyAccountFilter,
    dateRangeState,
    searchQuery,
    tableFilter,
    kpiFilter,
    adjustmentFilter
  ]);

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
      {/* Dynamic Toast Feedback for Actual Ingest */}
      {ingestToast && (
        <div className="bg-[#EAF7EE] border border-[#178A68] text-[#178A68] px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span>{ingestToast}</span>
          </div>
          <button
            onClick={() => setIngestToast(null)}
            className="text-[#178A68] hover:text-[#0B1930] text-sm"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Controls & Region Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Target Week and Calendar Picker */}
          <TargetWeekDatePicker
            currentRange={dateRangeState}
            onRangeChange={setDateRangeState}
          />

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
              id="market-filter-dropdown"
              value={filterToSelectedMarket ? selectedMarketId : 'all'}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setFilterToSelectedMarket(false);
                } else {
                  setSelectedMarketId(e.target.value);
                  setFilterToSelectedMarket(true);
                }
              }}
              className="bg-white border border-[#D8E1EB] text-xs font-bold py-1.5 px-3 rounded-lg text-[#0B1930] focus:ring-[#1769FF] shadow-sm max-w-[210px] truncate"
            >
              <option value="all">
                {selectedRegion === 'USA' ? 'All Markets Nationwide' : `All ${selectedRegion} Markets`}
              </option>
              {availableMarketsForDropdown.map((m) => {
                const matchingCount = safeLaneExceptions.filter(
                  (l) => (selectedRegion === 'USA' || l.market === selectedRegion) && isLaneInMarket(l, m.id, m.name)
                ).length;
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} ({matchingCount} lanes)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Account Manager Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777e] mr-1">Acct Mgr:</span>
            <select
              id="acct-mgr-filter-dropdown"
              value={selectedAccountManager}
              onChange={(e) => setSelectedAccountManager(e.target.value)}
              className="bg-white border border-[#D8E1EB] text-xs font-bold py-1.5 px-2.5 rounded-lg text-[#0B1930] focus:ring-[#1769FF] shadow-sm max-w-[190px] truncate"
            >
              <option value="all">All Acct Managers ({dynamicAccountManagers.length})</option>
              {dynamicAccountManagers.map((am) => (
                <option key={am.name} value={am.name}>
                  {am.name} ({am.loads} loads)
                </option>
              ))}
            </select>
          </div>

          {/* Customer Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777e] mr-1">Customer:</span>
            <select
              id="customer-filter-dropdown"
              value={selectedCustomerFilter}
              onChange={(e) => setSelectedCustomerFilter(e.target.value)}
              className="bg-white border border-[#D8E1EB] text-xs font-bold py-1.5 px-2.5 rounded-lg text-[#0B1930] focus:ring-[#1769FF] shadow-sm max-w-[200px] truncate"
            >
              <option value="all">All Customers ({dynamicCustomers.length})</option>
              {dynamicCustomers.map((cust) => (
                <option key={cust.name} value={cust.name}>
                  {cust.name} ({cust.loads} loads)
                </option>
              ))}
            </select>
          </div>

          {/* Carrier Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777e] mr-1">Carrier:</span>
            <select
              id="carrier-filter-dropdown"
              value={selectedCarrierFilter}
              onChange={(e) => setSelectedCarrierFilter(e.target.value)}
              className="bg-white border border-[#D8E1EB] text-xs font-bold py-1.5 px-2.5 rounded-lg text-[#0B1930] focus:ring-[#1769FF] shadow-sm max-w-[190px] truncate"
            >
              <option value="all">All Carriers ({dynamicCarriers.length})</option>
              {dynamicCarriers.map((carr) => (
                <option key={carr.name} value={carr.name}>
                  {carr.name} ({carr.loads} loads)
                </option>
              ))}
            </select>
          </div>

          {/* Key Volume Accounts Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-lg border border-[#CBD5E1]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] px-1">Accounts:</span>
            <button
              type="button"
              onClick={() => setKeyAccountFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-extrabold rounded cursor-pointer transition-all ${
                keyAccountFilter === 'all'
                  ? 'bg-white text-[#0B1930] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0B1930]'
              }`}
            >
              All Accounts
            </button>
            <button
              type="button"
              onClick={() => setKeyAccountFilter('key_only')}
              className={`px-2.5 py-1 text-[11px] font-extrabold rounded cursor-pointer transition-all flex items-center gap-1 ${
                keyAccountFilter === 'key_only'
                  ? 'bg-[#0B1930] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0B1930]'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">key</span>
              <span>Key Accounts</span>
            </button>
            <button
              type="button"
              onClick={() => setKeyAccountFilter('exclude_key')}
              className={`px-2.5 py-1 text-[11px] font-extrabold rounded cursor-pointer transition-all ${
                keyAccountFilter === 'exclude_key'
                  ? 'bg-[#1769FF] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0B1930]'
              }`}
            >
              Standard Accounts
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {teamContext !== 'Operations' ? (
            <>
              <button
                onClick={() => setShowUploadActualsModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#1769FF] bg-[#EAF2FF] text-[#1769FF] hover:bg-[#1769FF] hover:text-white rounded-lg text-xs font-bold active:scale-[0.98] transition-all shadow-xs cursor-pointer"
                title="Input actual carrier pay loads to compare against current target rates in Target Control Tower"
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

      {/* Active Filter Chips Summary Bar */}
      {hasActiveTopFilters && (
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] px-4 py-2 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-2xs animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-[#475569] text-[11px] uppercase tracking-wider mr-1">Active Filters:</span>
            {selectedRegion !== 'USA' && (
              <span className="bg-[#EAF2FF] text-[#1769FF] border border-[#1769FF]/30 px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1">
                Region: {selectedRegion}
                <button type="button" onClick={() => handleRegionSelect('USA')} className="hover:text-[#0B1930] ml-0.5 text-xs">×</button>
              </span>
            )}
            {filterToSelectedMarket && (
              <span className="bg-[#EAF2FF] text-[#1769FF] border border-[#1769FF]/30 px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1">
                Market: {activeMarket.name}
                <button type="button" onClick={() => setFilterToSelectedMarket(false)} className="hover:text-[#0B1930] ml-0.5 text-xs">×</button>
              </span>
            )}
            {selectedAccountManager !== 'all' && (
              <span className="bg-[#F1F5F9] text-[#0B1930] border border-[#CBD5E1] px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1">
                Acct Mgr: {selectedAccountManager}
                <button type="button" onClick={() => setSelectedAccountManager('all')} className="hover:text-[#D64545] ml-0.5 text-xs">×</button>
              </span>
            )}
            {selectedCustomerFilter !== 'all' && (
              <span className="bg-[#F1F5F9] text-[#0B1930] border border-[#CBD5E1] px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1">
                Customer: {selectedCustomerFilter}
                <button type="button" onClick={() => setSelectedCustomerFilter('all')} className="hover:text-[#D64545] ml-0.5 text-xs">×</button>
              </span>
            )}
            {selectedCarrierFilter !== 'all' && (
              <span className="bg-[#F1F5F9] text-[#0B1930] border border-[#CBD5E1] px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1">
                Carrier: {selectedCarrierFilter}
                <button type="button" onClick={() => setSelectedCarrierFilter('all')} className="hover:text-[#D64545] ml-0.5 text-xs">×</button>
              </span>
            )}
            {keyAccountFilter !== 'all' && (
              <span className="bg-[#F1F5F9] text-[#0B1930] border border-[#CBD5E1] px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1">
                Key Accounts: {keyAccountFilter === 'exclude_key' ? 'Excluded' : 'Key Only'}
                <button type="button" onClick={() => setKeyAccountFilter('all')} className="hover:text-[#D64545] ml-0.5 text-xs">×</button>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="text-xs font-bold text-[#D64545] hover:text-[#B91C1C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">filter_alt_off</span>
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

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
        <div className="relative col-span-2 md:col-span-1">
          <div
            id="kpi-filter-low-confidence-card"
            role="button"
            tabIndex={0}
            onClick={() => handleKpiBucketClick('low_confidence')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleKpiBucketClick('low_confidence');
              }
            }}
            className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer select-none outline-none focus:ring-2 focus:ring-[#1769FF] ${
              kpiFilter === 'low_confidence'
                ? 'bg-[#F1F5F9] border-[#475569] ring-2 ring-[#475569]/40 shadow-md scale-[1.02]'
                : 'bg-white border-[#D8E1EB] hover:border-[#475569]/60 hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">
                  Low Confidence
                </span>
                <button
                  id="low-confidence-help-btn"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLowConfidenceModal(true);
                  }}
                  className="w-4 h-4 rounded-full bg-[#E2E8F0] hover:bg-[#1769FF] hover:text-white text-[#475569] flex items-center justify-center text-[10px] font-extrabold transition-colors cursor-pointer"
                  title="Click to view full definition and criteria for Low Confidence benchmark"
                >
                  ?
                </button>
              </div>
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
            <div className="text-[10px] text-[#475569] font-bold mt-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">map</span>
                <span>{kpiFilter === 'low_confidence' ? 'Active Map & List Filter' : 'Filter Map & List'}</span>
              </div>
              <button
                id="low-confidence-def-link-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLowConfidenceModal(true);
                }}
                className="text-[10px] text-[#1769FF] hover:underline font-bold cursor-pointer"
              >
                Definition
              </button>
            </div>
          </div>
        </div>
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

          {/* Interactive Google Maps Surface */}
          <div className="w-full flex-1 min-h-[480px]">
            <GoogleLogisticsMap
              markets={dynamicMarkets}
              selectedRegion={selectedRegion}
              selectedMarketId={selectedMarketId}
              filterToSelectedMarket={filterToSelectedMarket}
              onSelectMarket={handleMarketClick}
              onRegionChange={handleRegionSelect}
              laneExceptions={safeLaneExceptions}
              kpiFilter={kpiFilter}
              matchesKpiFilter={matchesKpiFilter}
            />
          </div>
        </div>

        {/* Right Selected Market & Lane Info Panel */}
        <div className="lg:col-span-4 bg-white border border-[#D8E1EB] rounded-2xl flex flex-col shadow-sm">
          {/* Header */}
          <div className="p-4 border-b border-[#D8E1EB] flex justify-between items-center bg-[#F4F7FA]/50">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#75777e]">
                {filterToSelectedMarket ? 'Selected Market & Region' : 'Overview & Portfolio Status'}
              </div>
              <h3 className="font-bold text-base text-[#0B1930] flex items-center gap-2">
                <span>
                  {filterToSelectedMarket
                    ? activeMarket.name
                    : selectedRegion === 'USA'
                    ? 'All Markets Nationwide'
                    : `All ${selectedRegion} Markets`}
                </span>
                <span className="text-[10px] bg-[#EAF2FF] text-[#1769FF] px-2 py-0.5 rounded-full font-extrabold border border-[#1769FF]/20">
                  {filterToSelectedMarket ? activeMarket.region : selectedRegion}
                </span>
              </h3>
            </div>
            {filterToSelectedMarket ? (
              <div className="flex items-center gap-1.5">
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
                <button
                  type="button"
                  onClick={() => setFilterToSelectedMarket(false)}
                  className="text-[10px] font-bold text-[#1769FF] bg-[#EAF2FF] hover:bg-[#1769FF] hover:text-white px-2 py-1 rounded-md transition-colors border border-[#1769FF]/30 cursor-pointer"
                  title="Return to viewing all markets"
                >
                  Show All
                </button>
              </div>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[#178A68]/10 text-[#178A68]">
                {selectedRegion === 'USA' ? '18 Markets Monitored' : `${selectedRegion} Portfolio Active`}
              </span>
            )}
          </div>

          <div className="p-4 flex-grow space-y-4">
            {/* Rates Overview Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#F4F7FA] rounded-lg border border-[#D8E1EB]">
                <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider block mb-0.5">
                  {filterToSelectedMarket ? 'Avg Actual' : 'Portfolio Avg Actual'}
                </span>
                <span className="font-bold text-xl text-[#0B1930] tabular-nums">
                  ${(filterToSelectedMarket ? activeMarket.avgActual : aggregateOverviewStats.avgActual).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-[#F4F7FA] rounded-lg border border-[#D8E1EB]">
                <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider block mb-0.5">
                  {filterToSelectedMarket ? 'Avg Target' : 'Portfolio Avg Target'}
                </span>
                <span className="font-bold text-xl text-[#0B1930] tabular-nums">
                  ${(filterToSelectedMarket ? activeMarket.avgTarget : aggregateOverviewStats.avgTarget).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Variance & Volume Banner */}
            <div className="p-3 bg-[#EAF2FF] rounded-lg border border-[#1769FF]/20 flex justify-between items-center">
              <div>
                <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider block">Target Variance</span>
                <div className="flex items-center gap-2 mt-0.5">
                  {(() => {
                    const varDollars = filterToSelectedMarket ? activeMarket.varianceDollars : aggregateOverviewStats.varianceDollars;
                    const varPct = filterToSelectedMarket ? activeMarket.variancePercent : aggregateOverviewStats.variancePercent;
                    return (
                      <>
                        <span className={`font-bold text-base ${varDollars >= 0 ? 'text-[#D58A16]' : 'text-[#178A68]'}`}>
                          {varDollars >= 0 ? `+$${varDollars}` : `-$${Math.abs(varDollars)}`}
                        </span>
                        <span className={`text-xs font-extrabold ${varDollars >= 0 ? 'text-[#D58A16]' : 'text-[#178A68]'}`}>
                          ({varPct}%)
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider block">Weekly Loads</span>
                <span className="font-bold text-base text-[#0B1930] tabular-nums">
                  {(filterToSelectedMarket ? activeMarket.loads : aggregateOverviewStats.totalLoads).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Sparkline Trend */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">
                  {filterToSelectedMarket ? '4-Week Rate Trend' : 'Portfolio Rate Trend'}
                </span>
                <span className="text-[10px] font-bold text-[#178A68] bg-[#178A68]/10 px-2 py-0.5 rounded-full">
                  {filterToSelectedMarket ? activeMarket.trendStatus : 'Stabilizing (Composite)'}
                </span>
              </div>
              <div className="sparkline-container items-end h-7 gap-1.5 pt-1 bg-[#F4F7FA] p-1.5 rounded-lg border border-[#D8E1EB]">
                {(activeMarket?.trendData || [45, 60, 55, 70, 65, 80, 75, 85]).map((val, idx, arr) => (
                  <div
                    key={idx}
                    className="spark-bar flex-1 rounded-t transition-all hover:opacity-80"
                    style={{
                      height: `${val}%`,
                      backgroundColor: idx >= arr.length - 2 ? '#D58A16' : '#1769FF'
                    }}
                    title={`Week ${idx + 1}: ${val}% index`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Dedicated Selected Market / National Lane Info List */}
            <div className="pt-2 border-t border-[#D8E1EB]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[11px] text-[#0B1930] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#1769FF]">alt_route</span>
                  {filterToSelectedMarket ? `Lane Info for ${activeMarketNameClean}` : 'Monitored Lanes Portfolio'}
                </span>
                <span className="text-[10px] text-[#75777e] font-semibold">
                  {(filterToSelectedMarket ? activeMarketLanes : regionAndMarketLanes).length} Active Lanes
                </span>
              </div>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {(filterToSelectedMarket ? activeMarketLanes : regionAndMarketLanes).length > 0 ? (
                  (filterToSelectedMarket ? activeMarketLanes : regionAndMarketLanes).map((lane) => (
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
                                    {(exc.loadsDetail && exc.loadsDetail.length > 0 ? exc.loadsDetail : (exc.allLoads || []).slice(0, 10)).map((ld, idx) => (
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#1769FF] text-2xl">event_repeat</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">List of Entered Adjustments</h3>
                  {plannedAdjustments.filter((a) => a.status === 'Pending Approval').length > 0 && (
                    <span className="px-2 py-0.5 bg-[#D58A16]/20 border border-[#D58A16] text-[#FBBF24] font-extrabold text-[10px] rounded-full animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]"></span>
                      {plannedAdjustments.filter((a) => a.status === 'Pending Approval').length} Awaiting GM Approval
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#7784a0]">
                  Pricing team proposals and General Manager / VP approved target rates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 pb-3 mb-4 border-b border-white/10 text-xs">
            <button
              onClick={() => setAdjustmentTabFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                adjustmentTabFilter === 'all'
                  ? 'bg-[#1769FF] text-white shadow-sm'
                  : 'bg-white/5 text-[#94A3B8] hover:bg-white/10 hover:text-white'
              }`}
            >
              All Adjustments ({plannedAdjustments.length})
            </button>
            <button
              onClick={() => setAdjustmentTabFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adjustmentTabFilter === 'pending'
                  ? 'bg-[#D58A16] text-white shadow-sm'
                  : 'bg-white/5 text-[#FBBF24] hover:bg-[#D58A16]/20'
              }`}
            >
              <span>Pending GM Approval</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
                {plannedAdjustments.filter((a) => a.status === 'Pending Approval').length}
              </span>
            </button>
            <button
              onClick={() => setAdjustmentTabFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adjustmentTabFilter === 'active'
                  ? 'bg-[#15803D] text-white shadow-sm'
                  : 'bg-white/5 text-[#4ADE80] hover:bg-[#15803D]/20'
              }`}
            >
              <span>Active & In Effect</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
                {plannedAdjustments.filter((a) => a.status === 'Active').length}
              </span>
            </button>
            <button
              onClick={() => setAdjustmentTabFilter('scheduled')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adjustmentTabFilter === 'scheduled'
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'bg-white/5 text-[#38BDF8] hover:bg-[#0284C7]/20'
              }`}
            >
              <span>Scheduled</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
                {plannedAdjustments.filter((a) => a.status === 'Scheduled').length}
              </span>
            </button>
            <button
              onClick={() => setAdjustmentTabFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adjustmentTabFilter === 'rejected'
                  ? 'bg-[#DC2626] text-white shadow-sm'
                  : 'bg-white/5 text-[#F87171] hover:bg-[#DC2626]/20'
              }`}
            >
              <span>Rejected</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
                {plannedAdjustments.filter((a) => a.status === 'Rejected').length}
              </span>
            </button>
          </div>

          {/* Cards Grid */}
          {plannedAdjustments.filter((adj) => {
            if (adjustmentTabFilter === 'all') return true;
            if (adjustmentTabFilter === 'pending') return adj.status === 'Pending Approval';
            if (adjustmentTabFilter === 'active') return adj.status === 'Active';
            if (adjustmentTabFilter === 'scheduled') return adj.status === 'Scheduled';
            if (adjustmentTabFilter === 'rejected') return adj.status === 'Rejected';
            return true;
          }).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plannedAdjustments
                .filter((adj) => {
                  if (adjustmentTabFilter === 'all') return true;
                  if (adjustmentTabFilter === 'pending') return adj.status === 'Pending Approval';
                  if (adjustmentTabFilter === 'active') return adj.status === 'Active';
                  if (adjustmentTabFilter === 'scheduled') return adj.status === 'Scheduled';
                  if (adjustmentTabFilter === 'rejected') return adj.status === 'Rejected';
                  return true;
                })
                .map((adj) => {
                  const isPending = adj.status === 'Pending Approval';
                  const isActive = adj.status === 'Active';
                  const isScheduled = adj.status === 'Scheduled';
                  const isRejected = adj.status === 'Rejected';

                  return (
                    <div
                      key={adj.id}
                      className={`border p-4 rounded-xl transition-all flex flex-col justify-between ${
                        isPending
                          ? 'bg-[#D58A16]/10 border-[#D58A16]/40 hover:border-[#D58A16]'
                          : isActive
                          ? 'bg-[#15803D]/10 border-[#15803D]/30 hover:border-[#15803D]'
                          : isRejected
                          ? 'bg-[#DC2626]/10 border-[#DC2626]/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            {adj.targetMarketOrLane && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#38BDF8] block mb-0.5">
                                {adj.targetMarketOrLane}
                              </span>
                            )}
                            <h4 className="font-bold text-xs text-white leading-snug">{adj.title}</h4>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span
                              className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                                isPending
                                  ? 'bg-[#D58A16]/30 text-[#FBBF24] border border-[#D58A16]/50'
                                  : isActive
                                  ? 'bg-[#15803D]/30 text-[#4ADE80] border border-[#15803D]/50'
                                  : isRejected
                                  ? 'bg-[#DC2626]/30 text-[#F87171] border border-[#DC2626]/50'
                                  : 'bg-[#0284C7]/30 text-[#38BDF8] border border-[#0284C7]/50'
                              }`}
                            >
                              {adj.status}
                            </span>
                            <span
                              className={`font-extrabold text-[11px] tabular-nums px-2 py-0.5 rounded ${
                                adj.changePercent >= 0
                                  ? 'bg-[#1769FF]/30 text-[#38BDF8]'
                                  : 'bg-[#15803D]/30 text-[#4ADE80]'
                              }`}
                            >
                              {adj.changePercent >= 0 ? `+${adj.changePercent}%` : `${adj.changePercent}%`}
                            </span>
                          </div>
                        </div>

                        {/* Metadata Rows */}
                        <div className="space-y-1 text-[11px] text-[#94A3B8] bg-black/20 p-2.5 rounded-lg border border-white/5">
                          <div className="flex justify-between items-center">
                            <span>Entered By:</span>
                            <strong className="text-[#E2E8F0]">
                              {adj.submittedBy || 'Pricing Team'}
                              {adj.submittedDate && ` (${adj.submittedDate})`}
                            </strong>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Target Effective Date:</span>
                            <strong className="text-[#38BDF8] font-bold">
                              {adj.effectiveDate}
                            </strong>
                          </div>
                          {adj.approvedBy && (
                            <div className="flex justify-between items-center text-[#4ADE80]">
                              <span>Approved By:</span>
                              <strong className="font-semibold">
                                {adj.approvedBy}
                                {adj.approvedDate && ` (${adj.approvedDate})`}
                              </strong>
                            </div>
                          )}
                        </div>

                        {adj.notes && (
                          <p className="text-[11px] text-[#CBD5E1] line-clamp-2 leading-relaxed bg-white/5 p-2 rounded border border-white/5">
                            {adj.notes}
                          </p>
                        )}
                      </div>

                      {/* GM / VP Action Controls */}
                      <div className="pt-3 mt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setReviewAdjustment(adj)}
                              className="flex-1 py-1.5 px-2 bg-[#15803D] hover:bg-[#166534] text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">how_to_reg</span>
                              <span>Review & Put In Effect</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onApprovePlannedAdjustment) {
                                  const today = new Date().toISOString().slice(0, 10);
                                  onApprovePlannedAdjustment(adj.id, today, 'General Manager', 'One-click immediate approval by GM');
                                  setIngestToast(`Adjustment "${adj.title}" approved and put in effect today!`);
                                }
                              }}
                              title="Quick approve for immediate effect"
                              className="py-1.5 px-2 bg-[#1769FF] hover:bg-[#1769FF]/80 text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>Approve Today</span>
                            </button>
                          </>
                        ) : isActive ? (
                          <>
                            <span className="text-[11px] text-[#4ADE80] font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              <span>Active Benchmark</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setReviewAdjustment(adj)}
                              className="py-1 px-2 text-[10px] text-[#94A3B8] hover:text-white border border-white/10 rounded hover:bg-white/10"
                            >
                              Change Date
                            </button>
                          </>
                        ) : isScheduled ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (onApprovePlannedAdjustment) {
                                  const today = new Date().toISOString().slice(0, 10);
                                  onApprovePlannedAdjustment(adj.id, today, 'General Manager', 'Pushed into immediate effect by GM');
                                  setIngestToast(`Adjustment "${adj.title}" made active immediately!`);
                                }
                              }}
                              className="flex-1 py-1.5 px-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">flash_on</span>
                              <span>Make Effective Now</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setReviewAdjustment(adj)}
                              className="py-1 px-2 text-[10px] text-[#94A3B8] hover:text-white border border-white/10 rounded hover:bg-white/10"
                            >
                              Reschedule
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-[#F87171] font-bold">
                            Adjustment Rejected
                          </span>
                        )}

                        {onDeletePlannedAdjustment && (
                          <button
                            type="button"
                            onClick={() => onDeletePlannedAdjustment(adj.id)}
                            title="Delete adjustment entry"
                            className="p-1 text-[#64748B] hover:text-[#F87171] rounded hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="py-8 text-center text-[#94A3B8] bg-white/5 rounded-xl border border-white/5">
              <span className="material-symbols-outlined text-3xl text-[#64748B] block mb-1">
                inbox
              </span>
              <p className="font-semibold text-xs text-white">No adjustments in this category</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                {adjustmentTabFilter === 'pending'
                  ? 'All pricing proposals have been reviewed and approved.'
                  : 'Adjust filters or schedule a new adjustment.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* GM / VP Review & Approval Modal */}
      {reviewAdjustment && (
        <ReviewAdjustmentModal
          isOpen={!!reviewAdjustment}
          onClose={() => setReviewAdjustment(null)}
          adjustment={reviewAdjustment}
          onApprove={(id, effectiveDate, approvedBy, notes, adjustedPercent) => {
            if (onApprovePlannedAdjustment) {
              onApprovePlannedAdjustment(id, effectiveDate, approvedBy, notes, adjustedPercent);
              setIngestToast(`Adjustment "${reviewAdjustment.title}" approved and set effective on ${effectiveDate}!`);
            }
          }}
          onReject={(id, reason) => {
            if (onRejectPlannedAdjustment) {
              onRejectPlannedAdjustment(id, reason);
              setIngestToast(`Adjustment "${reviewAdjustment.title}" was rejected.`);
            }
          }}
        />
      )}

      {/* Export Options Modal for Carrier Targets */}
      <ExportCarrierTargetsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        selectedRegion={selectedRegion}
        laneExceptions={safeLaneExceptions}
        customerLanes={[]}
      />

      {/* Upload Weekly Actual Load Data Modal */}
      <UploadActualsModal
        isOpen={showUploadActualsModal}
        onClose={() => setShowUploadActualsModal(false)}
        onIngest={handleIngestFromModal}
        existingExceptions={safeLaneExceptions}
        onResetBaseline={handleResetBaselineClick}
      />

      {/* Low Confidence Metric Definition Modal */}
      <LowConfidenceDefinitionModal
        isOpen={showLowConfidenceModal}
        onClose={() => setShowLowConfidenceModal(false)}
      />
    </div>
  );
};
