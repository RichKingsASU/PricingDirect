import { 
  LaneException, 
  CustomerRateLane, 
  RecommendedCarrierRecord, 
  ChassisScheduleRecord, 
  FuelScaleBracket, 
  ReportedIssue,
  PlannedAdjustment,
  DatasetItem,
  ValidationIssue,
  MarketSummary,
  KPIStats,
  ActualLoadIngestRecord,
  ActualsIngestResult
} from '../../types';

export interface RateRepositoryFilter {
  region?: string;
  search?: string;
  customer?: string;
  carrier?: string;
  status?: string;
  marketId?: string;
}

export interface IRateRepository {
  getKPIStats(): Promise<KPIStats>;
  getMarkets(): Promise<MarketSummary[]>;
  getLaneExceptions(filter?: RateRepositoryFilter): Promise<LaneException[]>;
  getCustomerRates(filter?: RateRepositoryFilter): Promise<CustomerRateLane[]>;
  getPlannedAdjustments(): Promise<PlannedAdjustment[]>;
  getRecommendedCarriers(): Promise<RecommendedCarrierRecord[]>;
  getChassisSchedules(): Promise<ChassisScheduleRecord[]>;
  getFuelBrackets(): Promise<FuelScaleBracket[]>;
  getReportedIssues(): Promise<ReportedIssue[]>;
  getDatasets(): Promise<DatasetItem[]>;
  getValidationIssues(): Promise<ValidationIssue[]>;
  
  // Mutation operations
  saveLaneAdjustment(id: string, newTarget: number, notes: string, excludeKeyAccounts?: boolean): Promise<{ lane?: LaneException; market?: MarketSummary; customerLane?: CustomerRateLane }>;
  saveMarketAdjustment(marketId: string, newTarget: number, notes: string, excludeKeyAccounts?: boolean): Promise<MarketSummary>;
  addCustomerLane(lane: Partial<CustomerRateLane>): Promise<CustomerRateLane>;
  updateCustomerLane(id: string, updates: Partial<CustomerRateLane>): Promise<CustomerRateLane>;
  addPlannedAdjustment(adjustment: PlannedAdjustment): Promise<PlannedAdjustment>;
  approvePlannedAdjustment(
    id: string,
    effectiveDate: string,
    approvedBy?: string,
    approvalNotes?: string,
    adjustedPercent?: number
  ): Promise<{ adjustment: PlannedAdjustment; updatedExceptions: LaneException[]; updatedMarkets: MarketSummary[] }>;
  rejectPlannedAdjustment(id: string, reason: string): Promise<PlannedAdjustment>;
  updatePlannedAdjustment(id: string, updates: Partial<PlannedAdjustment>): Promise<PlannedAdjustment>;
  deletePlannedAdjustment(id: string): Promise<void>;
  reportIssue(issue: Omit<ReportedIssue, 'id' | 'timestamp' | 'status'>): Promise<ReportedIssue>;
  resolveValidationIssue(issueId: string, suggestedValue?: string): Promise<ValidationIssue>;
  commitValidationStaging(): Promise<{ newLanes: CustomerRateLane[]; newExceptions: LaneException[] }>;
  saveFuelScaleForCustomer(
    customer: string,
    brackets: FuelScaleBracket[],
    applyToAllAreas?: boolean
  ): Promise<{ updatedFuel: FuelScaleBracket[]; updatedCustomerLanes: CustomerRateLane[] }>;
  ingestActualLoads(records: ActualLoadIngestRecord[]): Promise<ActualsIngestResult>;
  resetBaseline(): Promise<void>;
}
