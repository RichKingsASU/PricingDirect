export type ActiveTab = 'target_control_tower' | 'rate_directory' | 'data_management';

export type Region = 'USA' | 'NW' | 'SW' | 'NE' | 'SE';

export interface KPIStats {
  loadsAnalyzed: number;
  loadsAnalyzedChange: string;
  atUnderTarget: number;
  atUnderTargetPercent: number;
  overTarget0to5: number;
  overTarget0to5Percent: number;
  overTarget5Plus: number;
  overTarget5PlusPercent: number;
  lowConfidence: number;
  lowConfidencePercent: number;
}

export interface MarketSummary {
  id: string;
  name: string;
  region: Region;
  avgActual: number;
  avgTarget: number;
  varianceDollars: number;
  variancePercent: number;
  loads: number;
  trendStatus: 'Stabilizing' | 'Increasing' | 'Decreasing';
  trendData: number[]; // relative heights 0-100
  status: 'Balanced Market' | 'Target Variance High' | 'Tight Capacity';
}

export interface LoadDetail {
  loadNo: string;
  containerNo: string;
  outgateDate: string;
  origin: string;
  destination: string;
  chargedPercent: number;
  actualPay?: number;
  targetRate?: number;
  accountManager?: string;
  customer?: string;
  carrier?: string;
  isKeyAccount?: boolean;
}

export interface LaneException {
  id: string;
  origin: string;
  destination: string;
  market: Region;
  loads: number;
  currentTarget: number;
  avgActual: number;
  varDollars: number;
  varPercent: number;
  confidence: 'High' | 'Low' | 'Medium';
  impact: 'High' | 'Medium' | 'Low';
  accountManager?: string;
  customer?: string;
  carrier?: string;
  isKeyAccount?: boolean;
  adjustmentStatus?: 'Adjusted' | 'Pending Approval' | 'None';
  lastAdjustedTarget?: number;
  adjustedDate?: string;
  adjustedNotes?: string;
  loadsDetail?: LoadDetail[];
}

export interface PlannedAdjustment {
  id: string;
  type?: string;
  title: string;
  changePercent: number;
  status: 'Pending Approval' | 'Active' | 'Scheduled';
  effectiveDate: string;
  notes?: string;
}

export interface Accessorial {
  id: string;
  name: string;
  rate: number;
  applicability: string;
  effectiveDate: string;
}

export interface RecommendedCarrier {
  id: string;
  name: string;
  rank: number;
  reliability: number;
  serviceArea: string;
  notes?: string;
  statusColor: string;
}

export interface CustomerRateLane {
  id: string;
  laneId: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  rawOrigin: string;
  rawDestination: string;
  baseRate: number;
  equipment: string;
  serviceType: string;
  miles: number;
  status: 'AWARDED' | 'BACKUP' | 'SPOT';
  activeState: 'Active' | 'Future' | 'Expired';
  effectiveDate: string;
  expirationDate: string;
  reviewDate: string;
  customerName: string;
  fuelSurchargePercent: number;
  fuelAmount: number;
  totalBilling: number;
  accessorials: Accessorial[];
  carrierTargetMatch: {
    targetAmount: number;
    matchPercent: number;
    nearestLane: string;
  };
  rateHistory: {
    amount: number;
    effectiveRange: string;
    status: 'Current' | 'Expired';
  }[];
  recommendedCarriers: RecommendedCarrier[];
}

export interface DatasetItem {
  id: string;
  name: string;
  recordsCount: number;
  coverage: string;
  lastUpload?: string;
  status: 'Healthy' | 'Syncing' | 'Warning';
}

export interface ValidationIssue {
  id: string;
  type: 'WARNING' | 'ERROR';
  description: string;
  rowNumber: number;
  field: string;
  originalValue: string;
  suggestedValue: string;
  resolved: boolean;
}

export interface ChassisScheduleRecord {
  id: string;
  customer: string;
  chassisType: string;
  flag: 'BILLABLE' | 'NOT BILLABLE';
  freeDays: number;
  neRate: string;
  nwRate: string;
  seRate: string;
  swRate: string;
  allInRate: string;
  agreement: string;
  notes: string;
  status?: 'Verified' | 'Mapped' | 'Needs Review';
}

export interface FuelScaleBracket {
  id: string;
  doeMin: number;
  doeMax: number;
  fscPercent: string;
  flatRatePerMile?: number;
  effectiveDate?: string;
  expirationDate?: string;
  notes?: string;
  status?: 'Verified' | 'Mapped' | 'Needs Review';
}

export interface RecommendedCarrierRecord {
  id: string;
  dotNumber: string;
  carrierName: string;
  truckCount: number;
  loadsHauled2026: number;
  homeState: string;
  region: string;
  notes?: string;
  status?: 'Verified' | 'Mapped' | 'Needs Review';
}

export interface ReportedIssue {
  id: string;
  issueType: string;
  laneInfo: string;
  loadNo?: string;
  urgency: 'Low' | 'Medium' | 'High (Active Load)' | 'Urgent / Ship Today';
  description: string;
  reportedBy: string;
  timestamp: string;
  status: 'Open / Dispatched to Pricing' | 'In Review' | 'Resolved';
}

export interface DevPersona {
  id: string;
  name: string;
  email: string;
  role: string;
  teamContext: 'Pricing Team' | 'Operations';
  avatarInitials: string;
  avatarColor: string;
  description: string;
}
