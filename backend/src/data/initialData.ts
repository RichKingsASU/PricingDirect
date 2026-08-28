import {
  KPIStats,
  MarketSummary,
  LaneException,
  PlannedAdjustment,
  CustomerRateLane,
  DatasetItem,
  ValidationIssue
} from '../types';

export const initialKPIStats: KPIStats = {
  loadsAnalyzed: 1248,
  loadsAnalyzedChange: '+4.2%',
  atUnderTarget: 842,
  atUnderTargetPercent: 67,
  overTarget0to5: 156,
  overTarget0to5Percent: 12,
  overTarget5Plus: 210,
  overTarget5PlusPercent: 17,
  lowConfidence: 40,
  lowConfidencePercent: 4
};

export const initialMarkets: MarketSummary[] = [
  // Northwest Region (NW)
  {
    id: 'mkt-oakland',
    name: 'Oakland Market',
    region: 'NW',
    avgActual: 885,
    avgTarget: 825,
    varianceDollars: 60,
    variancePercent: 7.2,
    loads: 142,
    trendStatus: 'Increasing',
    trendData: [40, 60, 55, 80, 70, 90, 100, 85],
    status: 'Target Variance High'
  },
  {
    id: 'mkt-seattle',
    name: 'Seattle Market',
    region: 'NW',
    avgActual: 720,
    avgTarget: 700,
    varianceDollars: 20,
    variancePercent: 2.8,
    loads: 128,
    trendStatus: 'Stabilizing',
    trendData: [60, 55, 50, 48, 52, 50, 45, 47],
    status: 'Balanced Market'
  },
  {
    id: 'mkt-denver',
    name: 'Denver Market',
    region: 'NW',
    avgActual: 2310,
    avgTarget: 2200,
    varianceDollars: 110,
    variancePercent: 5.0,
    loads: 98,
    trendStatus: 'Increasing',
    trendData: [30, 45, 50, 65, 75, 85, 95, 100],
    status: 'Target Variance High'
  },
  {
    id: 'mkt-portland',
    name: 'Portland Market',
    region: 'NW',
    avgActual: 1020,
    avgTarget: 1000,
    varianceDollars: 20,
    variancePercent: 2.0,
    loads: 110,
    trendStatus: 'Stabilizing',
    trendData: [50, 52, 48, 50, 51, 49, 50, 50],
    status: 'Balanced Market'
  },
  {
    id: 'mkt-boise',
    name: 'Boise Hub',
    region: 'NW',
    avgActual: 1720,
    avgTarget: 1650,
    varianceDollars: 70,
    variancePercent: 4.2,
    loads: 64,
    trendStatus: 'Increasing',
    trendData: [40, 45, 50, 60, 70, 80, 85, 90],
    status: 'Target Variance High'
  },
  {
    id: 'mkt-saltlake',
    name: 'Salt Lake City',
    region: 'NW',
    avgActual: 950,
    avgTarget: 900,
    varianceDollars: 50,
    variancePercent: 5.5,
    loads: 76,
    trendStatus: 'Stabilizing',
    trendData: [50, 55, 60, 58, 62, 65, 70, 68],
    status: 'Target Variance High'
  },
  {
    id: 'mkt-reno',
    name: 'Reno Market',
    region: 'NW',
    avgActual: 1280,
    avgTarget: 1200,
    varianceDollars: 80,
    variancePercent: 6.6,
    loads: 82,
    trendStatus: 'Increasing',
    trendData: [45, 50, 55, 60, 68, 72, 78, 80],
    status: 'Target Variance High'
  },

  // Southwest Region (SW)
  {
    id: 'mkt-losangeles',
    name: 'Los Angeles Market',
    region: 'SW',
    avgActual: 890,
    avgTarget: 825,
    varianceDollars: 65,
    variancePercent: 7.8,
    loads: 385,
    trendStatus: 'Increasing',
    trendData: [45, 55, 65, 70, 80, 85, 92, 98],
    status: 'Tight Capacity'
  },
  {
    id: 'mkt-phoenix',
    name: 'Phoenix Hub',
    region: 'SW',
    avgActual: 1940,
    avgTarget: 1880,
    varianceDollars: 60,
    variancePercent: 3.2,
    loads: 112,
    trendStatus: 'Stabilizing',
    trendData: [55, 58, 60, 62, 65, 63, 64, 65],
    status: 'Target Variance High'
  },
  {
    id: 'mkt-lasvegas',
    name: 'Las Vegas Market',
    region: 'SW',
    avgActual: 1720,
    avgTarget: 1650,
    varianceDollars: 70,
    variancePercent: 4.2,
    loads: 140,
    trendStatus: 'Stabilizing',
    trendData: [50, 52, 54, 56, 58, 60, 62, 60],
    status: 'Target Variance High'
  },

  // Northeast Region (NE)
  {
    id: 'mkt-chicago',
    name: 'Chicago Market',
    region: 'NE',
    avgActual: 1450,
    avgTarget: 1396,
    varianceDollars: 54,
    variancePercent: 3.8,
    loads: 210,
    trendStatus: 'Stabilizing',
    trendData: [60, 62, 65, 68, 70, 69, 71, 70],
    status: 'Target Variance High'
  },
  {
    id: 'mkt-newyork',
    name: 'New York Market',
    region: 'NE',
    avgActual: 925,
    avgTarget: 845,
    varianceDollars: 80,
    variancePercent: 9.4,
    loads: 180,
    trendStatus: 'Increasing',
    trendData: [50, 60, 70, 75, 82, 88, 95, 100],
    status: 'Tight Capacity'
  },
  {
    id: 'mkt-baltimore',
    name: 'Baltimore Port',
    region: 'NE',
    avgActual: 825,
    avgTarget: 800,
    varianceDollars: 25,
    variancePercent: 3.1,
    loads: 125,
    trendStatus: 'Stabilizing',
    trendData: [48, 50, 52, 49, 51, 50, 48, 49],
    status: 'Balanced Market'
  },

  // Southeast Region (SE)
  {
    id: 'mkt-atlanta',
    name: 'Atlanta Market',
    region: 'SE',
    avgActual: 1425,
    avgTarget: 1350,
    varianceDollars: 75,
    variancePercent: 5.5,
    loads: 275,
    trendStatus: 'Stabilizing',
    trendData: [50, 52, 51, 53, 54, 52, 53, 52],
    status: 'Balanced Market'
  },
  {
    id: 'mkt-savannah',
    name: 'Savannah Terminal',
    region: 'SE',
    avgActual: 1425,
    avgTarget: 1350,
    varianceDollars: 75,
    variancePercent: 5.5,
    loads: 160,
    trendStatus: 'Increasing',
    trendData: [42, 48, 55, 62, 68, 75, 80, 84],
    status: 'Target Variance High'
  },
  {
    id: 'mkt-memphis',
    name: 'Memphis Terminal',
    region: 'SE',
    avgActual: 625,
    avgTarget: 575,
    varianceDollars: 50,
    variancePercent: 8.7,
    loads: 190,
    trendStatus: 'Stabilizing',
    trendData: [52, 54, 53, 55, 54, 53, 55, 54],
    status: 'Balanced Market'
  },
  {
    id: 'mkt-dallas',
    name: 'Dallas Market',
    region: 'SE',
    avgActual: 650,
    avgTarget: 595,
    varianceDollars: 55,
    variancePercent: 9.2,
    loads: 220,
    trendStatus: 'Stabilizing',
    trendData: [52, 50, 49, 51, 50, 48, 50, 49],
    status: 'Balanced Market'
  },
  {
    id: 'mkt-houston',
    name: 'Houston Hub',
    region: 'SE',
    avgActual: 1020,
    avgTarget: 980,
    varianceDollars: 40,
    variancePercent: 4.0,
    loads: 140,
    trendStatus: 'Increasing',
    trendData: [40, 48, 55, 60, 68, 72, 78, 80],
    status: 'Target Variance High'
  }
];

export const initialLaneExceptions: LaneException[] = [
  // --- OAKLAND / NW LANES ---
  {
    id: 'exc-oak-1',
    origin: 'Oakland',
    destination: 'Stockton',
    market: 'NW',
    loads: 28,
    currentTarget: 545,
    avgActual: 885,
    varDollars: 340,
    varPercent: 62.3,
    confidence: 'High',
    impact: 'High',
    accountManager: 'Drayage Ops',
    customer: 'Dollar Tree Distribution Inc',
    carrier: 'FLAT-LINE XPRESS LLC',
    isKeyAccount: true
  },
  {
    id: 'exc-oak-2',
    origin: 'Oakland',
    destination: 'Reno',
    market: 'NW',
    loads: 18,
    currentTarget: 1200,
    avgActual: 1560,
    varDollars: 360,
    varPercent: 30.0,
    confidence: 'High',
    impact: 'High',
    accountManager: 'Sarah Jenkins',
    customer: 'Target Corp',
    carrier: 'Swift Transportation',
    isKeyAccount: true
  },
  {
    id: 'exc-oak-3',
    origin: 'Oakland',
    destination: 'Sparks',
    market: 'NW',
    loads: 14,
    currentTarget: 1200,
    avgActual: 1560,
    varDollars: 360,
    varPercent: 30.0,
    confidence: 'High',
    impact: 'High',
    accountManager: 'Mike Ross',
    customer: 'Walmart Logistics',
    carrier: 'JB Hunt',
    isKeyAccount: true
  },
  {
    id: 'exc-oak-4',
    origin: 'Oakland',
    destination: 'Hollister',
    market: 'NW',
    loads: 22,
    currentTarget: 670,
    avgActual: 970,
    varDollars: 300,
    varPercent: 44.7,
    confidence: 'High',
    impact: 'High',
    accountManager: 'Alex Vance',
    customer: 'Home Depot',
    carrier: 'Schneider',
    isKeyAccount: false
  },
  {
    id: 'exc-oak-5',
    origin: 'Oakland',
    destination: 'Sacramento',
    market: 'NW',
    loads: 19,
    currentTarget: 600,
    avgActual: 862,
    varDollars: 262,
    varPercent: 43.6,
    confidence: 'Medium',
    impact: 'High',
    accountManager: 'Drayage Ops',
    customer: 'Dollar Tree Distribution Inc',
    carrier: 'JED LOGISTICS INC',
    isKeyAccount: true
  },
  {
    id: 'exc-oak-6',
    origin: 'Oakland',
    destination: 'San Jose',
    market: 'NW',
    loads: 11,
    currentTarget: 425,
    avgActual: 725,
    varDollars: 300,
    varPercent: 70.5,
    confidence: 'High',
    impact: 'Medium',
    accountManager: 'Sarah Jenkins',
    customer: 'Wayfair',
    carrier: 'Knight Transportation',
    isKeyAccount: false
  },
  {
    id: 'exc-oak-7',
    origin: 'Oakland',
    destination: 'Benicia',
    market: 'NW',
    loads: 8,
    currentTarget: 380,
    avgActual: 715,
    varDollars: 335,
    varPercent: 88.1,
    confidence: 'Medium',
    impact: 'Medium',
    accountManager: 'Mike Ross',
    customer: 'LKQ CORPORATION',
    carrier: 'Flat-Line Xpress',
    isKeyAccount: false
  },
  {
    id: 'exc-oak-under-1',
    origin: 'Oakland',
    destination: 'Sacramento',
    market: 'NW',
    loads: 38,
    currentTarget: 950,
    avgActual: 890,
    varDollars: -60,
    varPercent: -6.3,
    confidence: 'High',
    impact: 'Low',
    accountManager: 'Drayage Ops',
    customer: 'Dollar Tree Distribution Inc',
    carrier: 'FLAT-LINE XPRESS LLC',
    isKeyAccount: true
  },
  {
    id: 'exc-oak-under-2',
    origin: 'Oakland',
    destination: 'Stockton',
    market: 'NW',
    loads: 52,
    currentTarget: 620,
    avgActual: 620,
    varDollars: 0,
    varPercent: 0.0,
    confidence: 'High',
    impact: 'Low'
  },
  {
    id: 'exc-sea-under-1',
    origin: 'Seattle',
    destination: 'Tacoma',
    market: 'NW',
    loads: 28,
    currentTarget: 520,
    avgActual: 510,
    varDollars: -10,
    varPercent: -1.9,
    confidence: 'High',
    impact: 'Low'
  },

  // --- SEATTLE & NW LANES ---
  {
    id: 'exc-sea-1',
    origin: 'Seattle',
    destination: 'Olympia',
    market: 'NW',
    loads: 45,
    currentTarget: 400,
    avgActual: 700,
    varDollars: 300,
    varPercent: 75.0,
    confidence: 'High',
    impact: 'High'
  },
  {
    id: 'exc-sea-2',
    origin: 'Tacoma',
    destination: 'Brighton',
    market: 'NW',
    loads: 12,
    currentTarget: 6900,
    avgActual: 7400,
    varDollars: 500,
    varPercent: 7.2,
    confidence: 'High',
    impact: 'High'
  },
  {
    id: 'exc-sea-3',
    origin: 'Seattle',
    destination: 'Spokane',
    market: 'NW',
    loads: 16,
    currentTarget: 1800,
    avgActual: 1950,
    varDollars: 150,
    varPercent: 8.3,
    confidence: 'High',
    impact: 'Medium'
  },
  {
    id: 'exc-pdx-1',
    origin: 'Hubbard',
    destination: 'Portland',
    market: 'NW',
    loads: 9,
    currentTarget: 1000,
    avgActual: 1400,
    varDollars: 400,
    varPercent: 40.0,
    confidence: 'Medium',
    impact: 'High'
  },
  {
    id: 'exc-den-1',
    origin: 'Denver',
    destination: 'Boise',
    market: 'NW',
    loads: 8,
    currentTarget: 1850,
    avgActual: 2015,
    varDollars: 165,
    varPercent: 8.9,
    confidence: 'Low',
    impact: 'High'
  },

  // --- SW LANES (LA/LB, Las Vegas, Phoenix) ---
  {
    id: 'exc-la-1',
    origin: 'LA/LB',
    destination: 'Shafter',
    market: 'SW',
    loads: 64,
    currentTarget: 825,
    avgActual: 1210,
    varDollars: 385,
    varPercent: 46.6,
    confidence: 'High',
    impact: 'High'
  },
  {
    id: 'exc-la-2',
    origin: 'LA/LB',
    destination: 'Las Vegas',
    market: 'SW',
    loads: 52,
    currentTarget: 1150,
    avgActual: 1700,
    varDollars: 550,
    varPercent: 47.8,
    confidence: 'High',
    impact: 'High'
  },
  {
    id: 'exc-la-3',
    origin: 'LA/LB',
    destination: 'Desert Hot Springs',
    market: 'SW',
    loads: 38,
    currentTarget: 825,
    avgActual: 1000,
    varDollars: 175,
    varPercent: 21.2,
    confidence: 'High',
    impact: 'High'
  },
  {
    id: 'exc-la-4',
    origin: 'LA/LB',
    destination: 'Nogales',
    market: 'SW',
    loads: 15,
    currentTarget: 2100,
    avgActual: 3100,
    varDollars: 1000,
    varPercent: 47.6,
    confidence: 'High',
    impact: 'High'
  },
  {
    id: 'exc-la-5',
    origin: 'LA/LB',
    destination: 'San Bernardino',
    market: 'SW',
    loads: 42,
    currentTarget: 450,
    avgActual: 825,
    varDollars: 375,
    varPercent: 83.3,
    confidence: 'High',
    impact: 'High'
  },
  {
    id: 'exc-la-6',
    origin: 'LA/LB',
    destination: 'Perris',
    market: 'SW',
    loads: 24,
    currentTarget: 475,
    avgActual: 860,
    varDollars: 385,
    varPercent: 81.0,
    confidence: 'High',
    impact: 'High'
  },
  {
    id: 'exc-la-under-1',
    origin: 'LA/LB',
    destination: 'Fontana',
    market: 'SW',
    loads: 44,
    currentTarget: 650,
    avgActual: 620,
    varDollars: -30,
    varPercent: -4.6,
    confidence: 'High',
    impact: 'Low'
  },
  {
    id: 'exc-chi-under-1',
    origin: 'Chicago',
    destination: 'Joliet',
    market: 'NE',
    loads: 36,
    currentTarget: 580,
    avgActual: 580,
    varDollars: 0,
    varPercent: 0.0,
    confidence: 'High',
    impact: 'Low'
  },

  // --- NE LANES ---
  {
    id: 'exc-ne-1',
    origin: 'NY/NJ',
    destination: 'Hopewell Junction',
    market: 'NE',
    loads: 35,
    currentTarget: 845,
    avgActual: 925,
    varDollars: 80,
    varPercent: 9.4,
    confidence: 'High',
    impact: 'High'
  },
  {
    id: 'exc-ne-2',
    origin: 'Chicago',
    destination: 'Battle Creek',
    market: 'NE',
    loads: 22,
    currentTarget: 1396,
    avgActual: 1496,
    varDollars: 100,
    varPercent: 7.1,
    confidence: 'High',
    impact: 'High'
  },
  {
    id: 'exc-ne-3',
    origin: 'Baltimore',
    destination: 'Hagerstown',
    market: 'NE',
    loads: 18,
    currentTarget: 800,
    avgActual: 825,
    varDollars: 25,
    varPercent: 3.1,
    confidence: 'Medium',
    impact: 'Medium'
  },

  // --- SE LANES ---
  {
    id: 'exc-se-1',
    origin: 'Savannah',
    destination: 'Fairburn',
    market: 'SE',
    loads: 48,
    currentTarget: 900,
    avgActual: 1425,
    varDollars: 525,
    varPercent: 58.3,
    confidence: 'High',
    impact: 'High'
  },
  {
    id: 'exc-se-2',
    origin: 'Savannah',
    destination: 'Charlotte',
    market: 'SE',
    loads: 31,
    currentTarget: 1350,
    avgActual: 1650,
    varDollars: 300,
    varPercent: 22.2,
    confidence: 'High',
    impact: 'High'
  },
  {
    id: 'exc-se-3',
    origin: 'Memphis',
    destination: 'Memphis DC',
    market: 'SE',
    loads: 29,
    currentTarget: 575,
    avgActual: 625,
    varDollars: 50,
    varPercent: 8.7,
    confidence: 'High',
    impact: 'High'
  },
  {
    id: 'exc-se-4',
    origin: 'Dallas',
    destination: 'McKinney',
    market: 'SE',
    loads: 26,
    currentTarget: 325,
    avgActual: 650,
    varDollars: 325,
    varPercent: 100.0,
    confidence: 'High',
    impact: 'High'
  }
];

export const initialPlannedAdjustments: PlannedAdjustment[] = [
  {
    id: 'adj-1',
    title: 'Oakland Market Target Shift +2.5%',
    changePercent: 2.5,
    status: 'Pending Approval',
    effectiveDate: '7/5/2026',
    notes: 'Seasonal import peak adjustment for Northern California drayage corridors.'
  },
  {
    id: 'adj-2',
    title: 'LA/LB → Las Vegas Target Adjustment -1.5%',
    changePercent: -1.5,
    status: 'Active',
    effectiveDate: '7/1/2026',
    notes: 'Contract benchmark alignment for Amazon LAS1 volume.'
  },
  {
    id: 'adj-3',
    title: 'Seattle Port Local Drayage +1.8%',
    changePercent: 1.8,
    status: 'Scheduled',
    effectiveDate: '7/12/2026',
    notes: 'NW region fuel and terminal congestion surcharge re-index.'
  }
];

export const initialCustomerLanes: CustomerRateLane[] = [
  // --- AMAZON LOGISTICS, INC. ---
  {
    id: 'lane-amz-1',
    laneId: 'AMZ-LAS-001',
    originCity: 'LA/LB',
    originState: 'CA',
    destinationCity: 'Henderson',
    destinationState: 'NV',
    rawOrigin: 'APM Terminal, San Pedro, CA',
    rawDestination: 'Amazon LAS1, Henderson, NV',
    baseRate: 1150.0,
    equipment: "40' HC Container",
    serviceType: 'Import Dray',
    miles: 278,
    status: 'AWARDED',
    activeState: 'Active',
    effectiveDate: '2026-07-01',
    expirationDate: '2027-06-30',
    reviewDate: '2027-05-15',
    customerName: 'Amazon Logistics, Inc.',
    fuelSurchargePercent: 15.5,
    fuelAmount: 178.25,
    totalBilling: 1328.25,
    accessorials: [
      { id: 'acc-1', name: 'Bobtail Fee', rate: 100.0, applicability: 'Per Occurrence', effectiveDate: '2026-07-01' },
      { id: 'acc-2', name: 'Chassis Split', rate: 75.0, applicability: 'Per Occurrence', effectiveDate: '2026-07-01' }
    ],
    carrierTargetMatch: {
      targetAmount: 1150.0,
      matchPercent: 100,
      nearestLane: 'LA/LB to HENDERSON ($1,150 Target)'
    },
    rateHistory: [
      { amount: 1150.0, effectiveRange: 'Effective: 07/01/2026 - 06/30/2027', status: 'Current' }
    ],
    recommendedCarriers: [
      { id: 'carr-1', name: 'Jed Logistics Inc', rank: 1, reliability: 98.4, serviceArea: 'SW Regional', notes: 'Primary, 20+ chassis daily', statusColor: '#178A68' },
      { id: 'carr-2', name: 'Carvago LLC', rank: 2, reliability: 94.2, serviceArea: 'SW Regional', notes: 'Backup team drivers', statusColor: '#D58A16' }
    ]
  },
  {
    id: 'lane-amz-2',
    laneId: 'AMZ-PSP-002',
    originCity: 'LA/LB',
    originState: 'CA',
    destinationCity: 'Desert Hot Springs',
    destinationState: 'CA',
    rawOrigin: 'APM Terminal, San Pedro, CA',
    rawDestination: 'Amazon Warehouse-PSP3, Desert Hot Springs, CA',
    baseRate: 825.0,
    equipment: "40' HC Container",
    serviceType: 'Import Dray',
    miles: 121,
    status: 'AWARDED',
    activeState: 'Active',
    effectiveDate: '2026-07-01',
    expirationDate: '2027-06-30',
    reviewDate: '2027-05-15',
    customerName: 'Amazon Logistics, Inc.',
    fuelSurchargePercent: 15.5,
    fuelAmount: 127.88,
    totalBilling: 952.88,
    accessorials: [
      { id: 'acc-3', name: 'Bobtail Fee', rate: 100.0, applicability: 'Per Occurrence', effectiveDate: '2026-07-01' }
    ],
    carrierTargetMatch: {
      targetAmount: 825.0,
      matchPercent: 98,
      nearestLane: 'LA/LB to Desert Hot Springs'
    },
    rateHistory: [
      { amount: 825.0, effectiveRange: 'Effective: 07/01/2026 - 06/30/2027', status: 'Current' }
    ],
    recommendedCarriers: [
      { id: 'carr-3', name: 'Flat-line Xpress LLC', rank: 1, reliability: 97.1, serviceArea: 'SoCal Local', statusColor: '#178A68' }
    ]
  },
  {
    id: 'lane-amz-3',
    laneId: 'AMZ-OAK-003',
    originCity: 'Oakland',
    originState: 'CA',
    destinationCity: 'Stockton',
    destinationState: 'CA',
    rawOrigin: 'OICT - SSA Terminals, Oakland, CA',
    rawDestination: 'Amazon Warehouse-TCY2, Stockton, CA',
    baseRate: 545.0,
    equipment: "40' HC Container",
    serviceType: 'Import Dray',
    miles: 84,
    status: 'AWARDED',
    activeState: 'Active',
    effectiveDate: '2026-07-01',
    expirationDate: '2027-06-30',
    reviewDate: '2027-05-15',
    customerName: 'Amazon Logistics, Inc.',
    fuelSurchargePercent: 14.5,
    fuelAmount: 79.03,
    totalBilling: 624.03,
    accessorials: [
      { id: 'acc-4', name: 'Detention', rate: 75.0, applicability: 'Hourly after 2 hrs', effectiveDate: '2026-07-01' }
    ],
    carrierTargetMatch: {
      targetAmount: 545.0,
      matchPercent: 100,
      nearestLane: 'OAKLAND to STOCKTON ($545 Target)'
    },
    rateHistory: [
      { amount: 545.0, effectiveRange: 'Effective: 07/01/2026 - 06/30/2027', status: 'Current' }
    ],
    recommendedCarriers: [
      { id: 'carr-4', name: 'Bay Port Trucking Inc', rank: 1, reliability: 98.9, serviceArea: 'NorCal Bay Area', statusColor: '#178A68' }
    ]
  },
  {
    id: 'lane-amz-4',
    laneId: 'AMZ-CLT-004',
    originCity: 'Savannah',
    originState: 'GA',
    destinationCity: 'Charlotte',
    destinationState: 'NC',
    rawOrigin: 'Georgia Port Authority, Savannah, GA',
    rawDestination: 'Amazon Warehouse CLT2-IXD, Charlotte, NC',
    baseRate: 1350.0,
    equipment: "40' HC Container",
    serviceType: 'Import Dray',
    miles: 256,
    status: 'AWARDED',
    activeState: 'Active',
    effectiveDate: '2026-07-01',
    expirationDate: '2027-06-30',
    reviewDate: '2027-05-15',
    customerName: 'Amazon Logistics, Inc.',
    fuelSurchargePercent: 16.0,
    fuelAmount: 216.0,
    totalBilling: 1566.0,
    accessorials: [],
    carrierTargetMatch: {
      targetAmount: 1350.0,
      matchPercent: 100,
      nearestLane: 'SAVANNAH to CHARLOTTE'
    },
    rateHistory: [
      { amount: 1350.0, effectiveRange: 'Effective: 07/01/2026 - 06/30/2027', status: 'Current' }
    ],
    recommendedCarriers: [
      { id: 'carr-5', name: 'Go Cargo LLC', rank: 1, reliability: 96.5, serviceArea: 'SE Corridor', statusColor: '#178A68' }
    ]
  },

  // --- ROSS STORES, INC. ---
  {
    id: 'lane-ross-1',
    laneId: 'ROSS-SHAF-101',
    originCity: 'LA/LB',
    originState: 'CA',
    destinationCity: 'Shafter',
    destinationState: 'CA',
    rawOrigin: 'APMT / LBCT Terminal, Long Beach, CA',
    rawDestination: 'Ross CVDC, Shafter, CA',
    baseRate: 825.0,
    equipment: "40' HC Container",
    serviceType: 'Import Dray',
    miles: 148,
    status: 'AWARDED',
    activeState: 'Active',
    effectiveDate: '2026-07-01',
    expirationDate: '2027-06-30',
    reviewDate: '2027-05-15',
    customerName: 'Ross Stores, Inc.',
    fuelSurchargePercent: 15.0,
    fuelAmount: 123.75,
    totalBilling: 948.75,
    accessorials: [
      { id: 'acc-10', name: 'Pre-Pull Fee', rate: 150.0, applicability: 'Per Container', effectiveDate: '2026-07-01' }
    ],
    carrierTargetMatch: {
      targetAmount: 825.0,
      matchPercent: 100,
      nearestLane: 'LA/LB to SHAFTER ($825 Target)'
    },
    rateHistory: [
      { amount: 825.0, effectiveRange: 'Effective: 07/01/2026 - 06/30/2027', status: 'Current' }
    ],
    recommendedCarriers: [
      { id: 'carr-6', name: 'Rnr Transportation', rank: 1, reliability: 99.0, serviceArea: 'Central Valley, SoCal', statusColor: '#178A68' },
      { id: 'carr-7', name: 'Endeavour Transport Services Inc', rank: 2, reliability: 95.8, serviceArea: 'Central Valley', statusColor: '#178A68' }
    ]
  },
  {
    id: 'lane-ross-2',
    laneId: 'ROSS-RHDC-102',
    originCity: 'North Charleston',
    originState: 'SC',
    destinationCity: 'Rock Hill',
    destinationState: 'SC',
    rawOrigin: 'North Charleston Terminal - CHS, SC',
    rawDestination: 'Ross RHDC, Rock Hill, SC',
    baseRate: 750.0,
    equipment: "40' HC Container",
    serviceType: 'Import Dray',
    miles: 171,
    status: 'AWARDED',
    activeState: 'Active',
    effectiveDate: '2026-07-01',
    expirationDate: '2027-06-30',
    reviewDate: '2027-05-15',
    customerName: 'Ross Stores, Inc.',
    fuelSurchargePercent: 15.0,
    fuelAmount: 112.5,
    totalBilling: 862.5,
    accessorials: [],
    carrierTargetMatch: {
      targetAmount: 750.0,
      matchPercent: 100,
      nearestLane: 'CHARLESTON to ROCK HILL ($750 Target)'
    },
    rateHistory: [
      { amount: 750.0, effectiveRange: 'Effective: 07/01/2026 - 06/30/2027', status: 'Current' }
    ],
    recommendedCarriers: [
      { id: 'carr-8', name: 'Rouse Trucking LLC', rank: 1, reliability: 97.4, serviceArea: 'Carolinas Regional', statusColor: '#178A68' }
    ]
  },

  // --- DOLLAR TREE DISTRIBUTION INC ---
  {
    id: 'lane-dt-1',
    laneId: 'DT-CARSON-201',
    originCity: 'LA/LB',
    originState: 'CA',
    destinationCity: 'Carson',
    destinationState: 'CA',
    rawOrigin: 'EverPort Terminal, Terminal Island, CA',
    rawDestination: 'Dollar Tree IDC, Carson, CA',
    baseRate: 250.0,
    equipment: "40' HC Container",
    serviceType: 'Import Dray',
    miles: 9,
    status: 'AWARDED',
    activeState: 'Active',
    effectiveDate: '2026-07-01',
    expirationDate: '2027-06-30',
    reviewDate: '2027-05-15',
    customerName: 'Dollar Tree Distribution Inc',
    fuelSurchargePercent: 12.0,
    fuelAmount: 30.0,
    totalBilling: 280.0,
    accessorials: [],
    carrierTargetMatch: {
      targetAmount: 250.0,
      matchPercent: 100,
      nearestLane: 'LA/LB to LA/LB Local ($250 Target)'
    },
    rateHistory: [
      { amount: 250.0, effectiveRange: 'Effective: 07/01/2026 - 06/30/2027', status: 'Current' }
    ],
    recommendedCarriers: [
      { id: 'carr-9', name: 'Jj Chicas Trucking LLC', rank: 1, reliability: 98.2, serviceArea: 'Harbor Local', statusColor: '#178A68' }
    ]
  },
  {
    id: 'lane-dt-2',
    laneId: 'DT-SBD-202',
    originCity: 'LA/LB',
    originState: 'CA',
    destinationCity: 'San Bernardino',
    destinationState: 'CA',
    rawOrigin: 'TraPac Terminal, Wilmington, CA',
    rawDestination: 'Dollar Tree DC 9, San Bernardino, CA',
    baseRate: 450.0,
    equipment: "40' HC Container",
    serviceType: 'Import Dray',
    miles: 78,
    status: 'AWARDED',
    activeState: 'Active',
    effectiveDate: '2026-07-01',
    expirationDate: '2027-06-30',
    reviewDate: '2027-05-15',
    customerName: 'Dollar Tree Distribution Inc',
    fuelSurchargePercent: 15.0,
    fuelAmount: 67.5,
    totalBilling: 517.5,
    accessorials: [],
    carrierTargetMatch: {
      targetAmount: 450.0,
      matchPercent: 100,
      nearestLane: 'LA/LB to SAN BERNARDINO ($450 Target)'
    },
    rateHistory: [
      { amount: 450.0, effectiveRange: 'Effective: 07/01/2026 - 06/30/2027', status: 'Current' }
    ],
    recommendedCarriers: [
      { id: 'carr-10', name: 'American Transport', rank: 1, reliability: 96.9, serviceArea: 'Inland Empire', statusColor: '#178A68' }
    ]
  },

  // --- DISCOUNT TIRE ---
  {
    id: 'lane-disc-1',
    laneId: 'DISC-FAIR-301',
    originCity: 'Savannah',
    originState: 'GA',
    destinationCity: 'Fairburn',
    destinationState: 'GA',
    rawOrigin: 'GPA-SAV Terminal, Savannah, GA',
    rawDestination: 'Discount Tire Fairburn MDC, Fairburn, GA',
    baseRate: 900.0,
    equipment: "40' HC Container",
    serviceType: 'Import Dray',
    miles: 255,
    status: 'AWARDED',
    activeState: 'Active',
    effectiveDate: '2026-07-01',
    expirationDate: '2027-06-30',
    reviewDate: '2027-05-15',
    customerName: 'Discount Tire',
    fuelSurchargePercent: 15.5,
    fuelAmount: 139.5,
    totalBilling: 1039.5,
    accessorials: [],
    carrierTargetMatch: {
      targetAmount: 900.0,
      matchPercent: 100,
      nearestLane: 'SAVANNAH to FAIRBURN ($900 Target)'
    },
    rateHistory: [
      { amount: 900.0, effectiveRange: 'Effective: 07/01/2026 - 06/30/2027', status: 'Current' }
    ],
    recommendedCarriers: [
      { id: 'carr-11', name: 'Qfs Transportation LLC', rank: 1, reliability: 98.7, serviceArea: 'SE Region', statusColor: '#178A68' }
    ]
  },

  // --- WALMART DISTRIBUTION ---
  {
    id: 'lane-wm-1',
    laneId: 'WM-DAL-401',
    originCity: 'Dallas',
    originState: 'TX',
    destinationCity: 'Houston',
    destinationState: 'TX',
    rawOrigin: 'BNSF Alliance, Haslet, TX',
    rawDestination: 'Walmart Distribution Center, Houston, TX',
    baseRate: 820.0,
    equipment: "53' Dry Van",
    serviceType: 'Regional Haul',
    miles: 242,
    status: 'AWARDED',
    activeState: 'Active',
    effectiveDate: '2026-07-01',
    expirationDate: '2027-06-30',
    reviewDate: '2027-05-15',
    customerName: 'Walmart Distribution',
    fuelSurchargePercent: 16.0,
    fuelAmount: 131.2,
    totalBilling: 951.2,
    accessorials: [
      { id: 'acc-12', name: 'Driver Assist', rate: 120.0, applicability: 'Per Load', effectiveDate: '2026-07-01' }
    ],
    carrierTargetMatch: {
      targetAmount: 820.0,
      matchPercent: 100,
      nearestLane: 'Dallas to Houston Regional'
    },
    rateHistory: [
      { amount: 820.0, effectiveRange: 'Effective: 07/01/2026 - 06/30/2027', status: 'Current' }
    ],
    recommendedCarriers: [
      { id: 'carr-12', name: 'Strtr Logistics LLC', rank: 1, reliability: 97.9, serviceArea: 'Texas Triangle', statusColor: '#178A68' }
    ]
  },

  // --- FEDEX GROUND ---
  {
    id: 'lane-fdx-1',
    laneId: 'FDX-MEM-501',
    originCity: 'Memphis',
    originState: 'TN',
    destinationCity: 'Nashville',
    destinationState: 'TN',
    rawOrigin: 'Memphis BNSF RR Hub, TN',
    rawDestination: 'FedEx Ground Hub, Nashville, TN',
    baseRate: 720.0,
    equipment: "53' Dry Van",
    serviceType: 'Linehaul',
    miles: 212,
    status: 'AWARDED',
    activeState: 'Active',
    effectiveDate: '2026-07-01',
    expirationDate: '2027-06-30',
    reviewDate: '2027-05-15',
    customerName: 'FedEx Ground',
    fuelSurchargePercent: 15.0,
    fuelAmount: 108.0,
    totalBilling: 828.0,
    accessorials: [],
    carrierTargetMatch: {
      targetAmount: 720.0,
      matchPercent: 100,
      nearestLane: 'Memphis to Nashville Corridor'
    },
    rateHistory: [
      { amount: 720.0, effectiveRange: 'Effective: 07/01/2026 - 06/30/2027', status: 'Current' }
    ],
    recommendedCarriers: [
      { id: 'carr-13', name: 'Enterprise Truck Line, Llc', rank: 1, reliability: 99.2, serviceArea: 'TN / Mid-South', statusColor: '#178A68' }
    ]
  },

  // --- HOME DEPOT OPS ---
  {
    id: 'lane-hd-1',
    laneId: 'HD-PERRIS-601',
    originCity: 'LA/LB',
    originState: 'CA',
    destinationCity: 'Perris',
    destinationState: 'CA',
    rawOrigin: 'LBCT / FMS Terminal, Long Beach, CA',
    rawDestination: 'Home Depot MDO, Perris, CA',
    baseRate: 475.0,
    equipment: "40' HC Container",
    serviceType: 'Import Dray',
    miles: 75,
    status: 'AWARDED',
    activeState: 'Active',
    effectiveDate: '2026-07-01',
    expirationDate: '2027-06-30',
    reviewDate: '2027-05-15',
    customerName: 'Home Depot Ops',
    fuelSurchargePercent: 15.0,
    fuelAmount: 71.25,
    totalBilling: 546.25,
    accessorials: [],
    carrierTargetMatch: {
      targetAmount: 475.0,
      matchPercent: 100,
      nearestLane: 'LA/LB to PERRIS ($475 Target)'
    },
    rateHistory: [
      { amount: 475.0, effectiveRange: 'Effective: 07/01/2026 - 06/30/2027', status: 'Current' }
    ],
    recommendedCarriers: [
      { id: 'carr-14', name: 'Sandino Freight Services', rank: 1, reliability: 98.0, serviceArea: 'SoCal Local', statusColor: '#178A68' }
    ]
  }
];

export const initialDatasets: DatasetItem[] = [
  {
    id: 'ds-1',
    name: 'Customer Lane Rates',
    recordsCount: 12450,
    coverage: '7/1/26 - 6/30/27',
    lastUpload: 'Today, 10:45 AM by Sarah M.',
    status: 'Healthy'
  },
  {
    id: 'ds-2',
    name: 'Weekly Load Data (System Input)',
    recordsCount: 228,
    coverage: 'Jun 21 - Jul 28, 2026',
    lastUpload: 'Just now by Weekly Load Processor',
    status: 'Healthy'
  },
  {
    id: 'ds-3',
    name: 'City Consolidation & Mapping',
    recordsCount: 42,
    coverage: 'Global Geography v4.2',
    lastUpload: 'Active Master',
    status: 'Healthy'
  },
  {
    id: 'ds-4',
    name: 'System Target Rates',
    recordsCount: 110,
    coverage: 'Q3 2026 Active',
    lastUpload: 'Active System Targets',
    status: 'Healthy'
  },
  {
    id: 'ds-5',
    name: 'Customer Fuel Schedules',
    recordsCount: 842,
    coverage: 'Daily Floating',
    status: 'Healthy'
  },
  {
    id: 'ds-6',
    name: 'Customer Accessorials',
    recordsCount: 1205,
    coverage: 'Permanent',
    status: 'Healthy'
  }
];

export const initialValidationIssues: ValidationIssue[] = [
  {
    id: 'val-1',
    type: 'WARNING',
    description: 'Unmatched Raw City in Weekly Loads: "SAN PEDRO" → Consolidates to "LA/LB"',
    rowNumber: 3,
    field: 'pickup_loc_City',
    originalValue: 'SAN PEDRO',
    suggestedValue: 'LA/LB',
    resolved: true
  },
  {
    id: 'val-2',
    type: 'WARNING',
    description: 'Unmatched Raw City in Weekly Loads: "WILMINGTON" → Consolidates to "LA/LB"',
    rowNumber: 7,
    field: 'pickup_loc_City',
    originalValue: 'WILMINGTON',
    suggestedValue: 'LA/LB',
    resolved: true
  },
  {
    id: 'val-3',
    type: 'WARNING',
    description: 'Unmatched Raw City in Weekly Loads: "ELIZABETH" → Consolidates to "NY/NJ"',
    rowNumber: 14,
    field: 'pickup_loc_City',
    originalValue: 'ELIZABETH',
    suggestedValue: 'NY/NJ',
    resolved: true
  }
];
