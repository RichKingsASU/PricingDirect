import { IRateRepository, RateRepositoryFilter } from './IRateRepository';
import { CustomerRateLane, MarketSummary, LaneException, PlannedAdjustment, RecommendedCarrierRecord, ChassisScheduleRecord, FuelScaleBracket, ReportedIssue, DatasetItem, ValidationIssue, KPIStats, ActualLoadIngestRecord, ActualsIngestResult } from '../../types';
import { apiClient } from '../apiClient';

export class CustomerRatesApiRepository implements IRateRepository {
  async getCustomerRates(filter?: RateRepositoryFilter): Promise<CustomerRateLane[]> {
    const params: any = {
      limit: 100,
      offset: 0
    };
    if (filter?.search) params.customer_name = filter.search;
    if (filter?.status) params.status = filter.status;
    
    // Note: The UI might need pagination state, but IRateRepository currently returns an array.
    // For this migration, we fetch and map to the expected type.
    const response = await apiClient.get('/api/rates/lanes/', params);
    
    return response.results.map((item: any) => ({
      id: item.id,
      laneId: item.lane_id,
      originCity: item.origin_city,
      originState: item.origin_state,
      destinationCity: item.destination_city,
      destinationState: item.destination_state,
      rawOrigin: item.raw_origin,
      rawDestination: item.raw_destination,
      baseRate: parseFloat(item.base_rate),
      equipment: item.equipment,
      serviceType: item.service_type,
      miles: item.miles,
      status: item.status,
      activeState: item.active_state,
      effectiveDate: item.effective_date,
      expirationDate: item.expiration_date,
      reviewDate: '',
      customerName: item.customer_name,
      fuelSurchargePercent: parseFloat(item.fuel_surcharge_percent),
      fuelAmount: parseFloat(item.fuel_amount),
      totalBilling: parseFloat(item.total_billing),
      accessorials: [],
      carrierTargetMatch: { targetAmount: 0, matchPercent: 0 }
    }));
  }

  // Not implemented yet in API
  async getKPIStats(): Promise<KPIStats> { throw new Error('Not implemented in API mode'); }
  async getMarkets(): Promise<MarketSummary[]> { return []; }
  async getLaneExceptions(): Promise<LaneException[]> { return []; }
  async getPlannedAdjustments(): Promise<PlannedAdjustment[]> { return []; }
  async getRecommendedCarriers(): Promise<RecommendedCarrierRecord[]> { return []; }
  async getChassisSchedules(): Promise<ChassisScheduleRecord[]> { return []; }
  async getFuelBrackets(): Promise<FuelScaleBracket[]> { return []; }
  async getReportedIssues(): Promise<ReportedIssue[]> { return []; }
  async getDatasets(): Promise<DatasetItem[]> { return []; }
  async getValidationIssues(): Promise<ValidationIssue[]> { return []; }
  
  async saveLaneAdjustment(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async saveMarketAdjustment(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async addCustomerLane(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async updateCustomerLane(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async addPlannedAdjustment(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async approvePlannedAdjustment(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async rejectPlannedAdjustment(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async updatePlannedAdjustment(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async deletePlannedAdjustment(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async reportIssue(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async resolveValidationIssue(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async commitValidationStaging(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async saveFuelScaleForCustomer(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async ingestActualLoads(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
  async resetBaseline(): Promise<any> { throw new Error('Write operations disabled in API mode'); }
}
