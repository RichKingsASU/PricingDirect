import { ChassisScheduleRecord, FuelScaleBracket } from '../types';

export interface EiaDieselRegion {
  key: string;
  name: string;
  paddCode: string;
  states: string[];
  currentPrice: number;
  priorWeekPrice: number;
  change: number;
  effectiveDate: string;
  notes?: string;
}

// Official U.S. Energy Information Administration (EIA) Weekly Diesel Price Index across all areas
export const EIA_REGIONAL_DIESEL_BENCHMARKS: EiaDieselRegion[] = [
  {
    key: 'national_avg',
    name: 'U.S. National Average',
    paddCode: 'US_TOTAL',
    states: ['All 50 States'],
    currentPrice: 3.785,
    priorWeekPrice: 3.742,
    change: 0.043,
    effectiveDate: '2026-08-24',
    notes: 'Base DOE benchmark index for nationwide freight contracts'
  },
  {
    key: 'east_coast',
    name: 'East Coast (PADD 1)',
    paddCode: 'PADD_1',
    states: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DE', 'MD', 'VA', 'WV', 'NC', 'SC', 'GA', 'FL'],
    currentPrice: 3.812,
    priorWeekPrice: 3.780,
    change: 0.032,
    effectiveDate: '2026-08-24',
    notes: 'Atlantic seaboard drayage corridor'
  },
  {
    key: 'new_england',
    name: 'New England (Subdistrict 1A)',
    paddCode: 'PADD_1A',
    states: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT'],
    currentPrice: 3.985,
    priorWeekPrice: 3.960,
    change: 0.025,
    effectiveDate: '2026-08-24',
    notes: 'Northeast port & ramp drayage'
  },
  {
    key: 'central_atlantic',
    name: 'Central Atlantic (Subdistrict 1B)',
    paddCode: 'PADD_1B',
    states: ['NY', 'NJ', 'PA', 'DE', 'MD'],
    currentPrice: 3.992,
    priorWeekPrice: 3.955,
    change: 0.037,
    effectiveDate: '2026-08-24',
    notes: 'Port of NY/NJ and Philadelphia gateway'
  },
  {
    key: 'lower_atlantic',
    name: 'Lower Atlantic (Subdistrict 1C)',
    paddCode: 'PADD_1C',
    states: ['VA', 'WV', 'NC', 'SC', 'GA', 'FL'],
    currentPrice: 3.695,
    priorWeekPrice: 3.660,
    change: 0.035,
    effectiveDate: '2026-08-24',
    notes: 'Savannah, Charleston & Jacksonville ports'
  },
  {
    key: 'midwest',
    name: 'Midwest (PADD 2)',
    paddCode: 'PADD_2',
    states: ['ND', 'SD', 'NE', 'KS', 'OK', 'MN', 'IA', 'MO', 'WI', 'IL', 'MI', 'IN', 'OH', 'KY', 'TN'],
    currentPrice: 3.680,
    priorWeekPrice: 3.645,
    change: 0.035,
    effectiveDate: '2026-08-24',
    notes: 'Chicago rail hub and inland intermodal terminals'
  },
  {
    key: 'gulf_coast',
    name: 'Gulf Coast (PADD 3)',
    paddCode: 'PADD_3',
    states: ['NM', 'TX', 'AR', 'LA', 'MS', 'AL'],
    currentPrice: 3.395,
    priorWeekPrice: 3.355,
    change: 0.040,
    effectiveDate: '2026-08-24',
    notes: 'Houston, Dallas & Mobile port corridors'
  },
  {
    key: 'rocky_mountain',
    name: 'Rocky Mountain (PADD 4)',
    paddCode: 'PADD_4',
    states: ['MT', 'ID', 'WY', 'UT', 'CO'],
    currentPrice: 3.740,
    priorWeekPrice: 3.710,
    change: 0.030,
    effectiveDate: '2026-08-24',
    notes: 'Intermountain West corridors'
  },
  {
    key: 'west_coast_less_ca',
    name: 'West Coast (PADD 5 Less CA)',
    paddCode: 'PADD_5_EX_CA',
    states: ['WA', 'OR', 'NV', 'AZ', 'AK', 'HI'],
    currentPrice: 4.180,
    priorWeekPrice: 4.140,
    change: 0.040,
    effectiveDate: '2026-08-24',
    notes: 'PNW (Seattle/Tacoma) and desert corridors'
  },
  {
    key: 'california',
    name: 'California (PADD 5)',
    paddCode: 'PADD_5_CA',
    states: ['CA'],
    currentPrice: 4.760,
    priorWeekPrice: 4.715,
    change: 0.045,
    effectiveDate: '2026-08-24',
    notes: 'LA/Long Beach & Oakland ports (CARB clean diesel index)'
  }
];

export const initialChassisSchedules: ChassisScheduleRecord[] = [
  {
    id: 'chas-1',
    customer: 'CMA CGM',
    chassisType: 'POOL',
    flag: 'NOT BILLABLE',
    freeDays: 0,
    neRate: '$ -',
    nwRate: '$ -',
    seRate: '$ -',
    swRate: '$ -',
    allInRate: '',
    agreement: 'Y',
    notes: 'Standard carrier pool chassis'
  },
  {
    id: 'chas-2',
    customer: 'CMA CGM',
    chassisType: 'PRIVATE',
    flag: 'BILLABLE',
    freeDays: 0,
    neRate: '$ -',
    nwRate: '$ 40.00',
    seRate: '',
    swRate: '$ 40.00',
    allInRate: '',
    agreement: '',
    notes: 'NW & SW Private Fleet daily charge'
  },
  {
    id: 'chas-3',
    customer: 'CMA CGM',
    chassisType: 'TRIAXLE',
    flag: 'BILLABLE',
    freeDays: 0,
    neRate: '$ -',
    nwRate: '$ 85.00',
    seRate: '',
    swRate: '$ 85.00',
    allInRate: '',
    agreement: '',
    notes: 'Heavy-haul triaxle chassis position'
  },
  {
    id: 'chas-4',
    customer: 'Amazon Logistics, Inc.',
    chassisType: 'PRIVATE',
    flag: 'BILLABLE',
    freeDays: 2,
    neRate: '$ 38.00',
    nwRate: '$ 42.50',
    seRate: '$ 35.00',
    swRate: '$ 45.00',
    allInRate: '$ 40.00',
    agreement: 'Y',
    notes: 'Contractual daily chassis fee'
  }
];

// Generator for the continuous standard EIA Fuel Scale Matrix ($1.25 - $6.50)
export function generateStandardEiaFuelScale(
  startMin = 1.25,
  endMax = 6.00,
  step = 0.10,
  basePercent = 1.0,
  effectiveDate = '2026-07-01',
  expirationDate = '2027-06-30'
): FuelScaleBracket[] {
  const brackets: FuelScaleBracket[] = [];
  let currentMin = startMin;
  let currentPct = basePercent;
  let index = 1;

  while (currentMin < endMax) {
    const currentMax = Math.round((currentMin + step - 0.001) * 1000) / 1000;
    const flatRpm = Math.round((Math.max(0, currentMin - 1.20) / 6.0) * 100) / 100;
    
    let noteDesc = 'Standard DOE National Average Diesel Index Bracket';
    if (currentMin >= 4.50) {
      noteDesc = 'High Index Range (Applies to CA CARB diesel / West Coast peaks)';
    } else if (currentMin >= 3.50 && currentMin <= 4.20) {
      noteDesc = 'Current Baseline Market Range (Active 2026 Index)';
    }

    brackets.push({
      id: `fuel-std-${index}`,
      doeMin: Math.round(currentMin * 100) / 100,
      doeMax: currentMax,
      fscPercent: `${currentPct.toFixed(1)}%`,
      flatRatePerMile: flatRpm,
      effectiveDate,
      expirationDate,
      notes: noteDesc,
      status: 'Verified'
    });

    currentMin = Math.round((currentMin + step) * 100) / 100;
    currentPct += 1.0;
    index++;
  }

  return brackets;
}

// Initial full scale matrix covering all diesel pricing brackets
export const initialFuelScaleBrackets: FuelScaleBracket[] = generateStandardEiaFuelScale(1.25, 6.05, 0.10, 1.0);

// Fast lookup helper for any DOE Diesel price across all areas
export function lookupFuelSurchargePercent(
  dieselPrice: number,
  scale: FuelScaleBracket[] = initialFuelScaleBrackets
): {
  fscPercent: number;
  flatRatePerMile: number;
  bracket: FuelScaleBracket | null;
  isExtrapolated: boolean;
} {
  if (!scale || scale.length === 0) {
    return { fscPercent: 15.0, flatRatePerMile: 0.40, bracket: null, isExtrapolated: true };
  }

  // Sort scale by doeMin ascending
  const sorted = [...scale].sort((a, b) => a.doeMin - b.doeMin);

  // Direct bracket match
  const matched = sorted.find((b) => dieselPrice >= b.doeMin && dieselPrice <= b.doeMax);
  if (matched) {
    const pctNum = parseFloat(matched.fscPercent.replace('%', '')) || 0;
    const flatRpm = matched.flatRatePerMile ?? Math.round((Math.max(0, dieselPrice - 1.20) / 6.0) * 100) / 100;
    return {
      fscPercent: pctNum,
      flatRatePerMile: flatRpm,
      bracket: matched,
      isExtrapolated: false
    };
  }

  // If below minimum bracket
  if (dieselPrice < sorted[0].doeMin) {
    const lowest = sorted[0];
    const pctNum = parseFloat(lowest.fscPercent.replace('%', '')) || 0;
    return {
      fscPercent: Math.max(0, pctNum),
      flatRatePerMile: lowest.flatRatePerMile || 0.05,
      bracket: lowest,
      isExtrapolated: true
    };
  }

  // If above maximum bracket, extrapolate by 1% per $0.10 step
  const highest = sorted[sorted.length - 1];
  const highestPct = parseFloat(highest.fscPercent.replace('%', '')) || 0;
  const excess = dieselPrice - highest.doeMax;
  const additionalSteps = Math.ceil(excess / 0.10);
  const extrapolatedPct = Math.round((highestPct + additionalSteps * 1.0) * 10) / 10;
  const flatRpm = Math.round((Math.max(0, dieselPrice - 1.20) / 6.0) * 100) / 100;

  return {
    fscPercent: extrapolatedPct,
    flatRatePerMile: flatRpm,
    bracket: highest,
    isExtrapolated: true
  };
}

// Calculate total lane FSC and combined billing
export function calculateLaneFuelCharge(
  baseRate: number,
  miles: number,
  fscPercent: number,
  flatRatePerMile?: number
): {
  fuelAmount: number;
  totalBilling: number;
  effectiveRatePerMile: number;
} {
  const percentFuelAmount = Math.round((baseRate * (fscPercent / 100)) * 100) / 100;
  const mileageFuelAmount = flatRatePerMile ? Math.round((miles * flatRatePerMile) * 100) / 100 : 0;
  
  // Prefer percentage method as standard, fallback to mileage if specified
  const fuelAmount = percentFuelAmount > 0 ? percentFuelAmount : mileageFuelAmount;
  const totalBilling = Math.round((baseRate + fuelAmount) * 100) / 100;
  const effectiveRatePerMile = miles > 0 ? Math.round((totalBilling / miles) * 100) / 100 : 0;

  return {
    fuelAmount,
    totalBilling,
    effectiveRatePerMile
  };
}

