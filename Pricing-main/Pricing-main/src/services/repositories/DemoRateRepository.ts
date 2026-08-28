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
  Region,
  ActualLoadIngestRecord,
  ActualsIngestResult,
  LoadDetail
} from '../../types';
import { IRateRepository, RateRepositoryFilter } from './IRateRepository';
import { normalizeToIsoDate } from '../../utils/dateWeekUtils';
import { consolidateLocationString, getConsolidatedCity } from '../../utils/cityConsolidationUtils';
import { 
  initialKPIStats,
  initialMarkets,
  initialLaneExceptions, 
  initialCustomerLanes, 
  initialPlannedAdjustments,
  initialDatasets,
  initialValidationIssues
} from '../../data/initialData';
import { initialRecommendedCarriers } from '../../data/recommendedCarriersData';
import { 
  initialChassisSchedules, 
  initialFuelScaleBrackets, 
  lookupFuelSurchargePercent, 
  calculateLaneFuelCharge, 
  EIA_REGIONAL_DIESEL_BENCHMARKS 
} from '../../data/chassisFuelData';

const getLaneMarketRegion = (state: string, city: string): 'NE' | 'NW' | 'SE' | 'SW' => {
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

export class DemoRateRepository implements IRateRepository {
  private kpis: KPIStats = { ...initialKPIStats };
  private markets: MarketSummary[] = [...initialMarkets];
  private exceptions: LaneException[] = [...initialLaneExceptions];
  private rates: CustomerRateLane[] = [...initialCustomerLanes];
  private adjustments: PlannedAdjustment[] = [...initialPlannedAdjustments];
  private carriers: RecommendedCarrierRecord[] = [...initialRecommendedCarriers];
  private chassis: ChassisScheduleRecord[] = [...initialChassisSchedules];
  private fuel: FuelScaleBracket[] = [...initialFuelScaleBrackets];
  private issues: ReportedIssue[] = [
    {
      id: 'ISSUE-001',
      issueType: 'Carrier Rate Spike',
      laneInfo: 'CHI -> ATL',
      loadNo: 'LD-9021',
      urgency: 'High (Active Load)',
      description: 'Carrier spot market demand 14% over contracted benchmark due to weather surge.',
      reportedBy: 'Krysta Ruetten',
      timestamp: '2026-08-26 09:15',
      status: 'Open / Dispatched to Pricing'
    }
  ];
  private datasets: DatasetItem[] = [...initialDatasets];
  private validationIssues: ValidationIssue[] = [...initialValidationIssues];

  async getKPIStats(): Promise<KPIStats> {
    return { ...this.kpis };
  }

  async getMarkets(): Promise<MarketSummary[]> {
    return [...this.markets];
  }

  async getLaneExceptions(filter?: RateRepositoryFilter): Promise<LaneException[]> {
    let result = [...this.exceptions];
    if (filter?.region && filter.region !== 'USA') {
      result = result.filter(e => e.market === filter.region);
    }
    if (filter?.customer && filter.customer !== 'all') {
      result = result.filter(e => e.customer === filter.customer);
    }
    if (filter?.carrier && filter.carrier !== 'all') {
      result = result.filter(e => e.carrier === filter.carrier);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(e => 
        e.origin.toLowerCase().includes(q) || 
        e.destination.toLowerCase().includes(q) ||
        (e.customer && e.customer.toLowerCase().includes(q)) ||
        (e.carrier && e.carrier.toLowerCase().includes(q)) ||
        e.market.toLowerCase().includes(q)
      );
    }
    return result;
  }

  async getCustomerRates(filter?: RateRepositoryFilter): Promise<CustomerRateLane[]> {
    let result = [...this.rates];
    if (filter?.customer && filter.customer !== 'all') {
      result = result.filter(r => r.customerName.toLowerCase().includes(filter.customer!.toLowerCase()));
    }
    if (filter?.status && filter.status !== 'all') {
      result = result.filter(r => r.activeState === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(r => 
        r.originCity.toLowerCase().includes(q) || 
        r.destinationCity.toLowerCase().includes(q) ||
        r.originState.toLowerCase().includes(q) ||
        r.destinationState.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.laneId.toLowerCase().includes(q) ||
        r.equipment.toLowerCase().includes(q)
      );
    }
    return result;
  }

  async getPlannedAdjustments(): Promise<PlannedAdjustment[]> {
    return [...this.adjustments];
  }

  async getRecommendedCarriers(): Promise<RecommendedCarrierRecord[]> {
    return [...this.carriers];
  }

  async getChassisSchedules(): Promise<ChassisScheduleRecord[]> {
    return [...this.chassis];
  }

  async getFuelBrackets(): Promise<FuelScaleBracket[]> {
    return [...this.fuel];
  }

  async getReportedIssues(): Promise<ReportedIssue[]> {
    return [...this.issues];
  }

  async getDatasets(): Promise<DatasetItem[]> {
    return [...this.datasets];
  }

  async getValidationIssues(): Promise<ValidationIssue[]> {
    return [...this.validationIssues];
  }

  async saveLaneAdjustment(
    id: string, 
    newTarget: number, 
    notes: string, 
    excludeKeyAccounts?: boolean
  ): Promise<{ lane?: LaneException; market?: MarketSummary; customerLane?: CustomerRateLane }> {
    let adjustedLane: LaneException | undefined;
    let adjustedMarket: MarketSummary | undefined;
    let adjustedCustomerLane: CustomerRateLane | undefined;
    let adjustedTitle = 'Lane Adjustment';

    // 1. Check Lane Exceptions
    const excIdx = this.exceptions.findIndex(e => e.id === id);
    if (excIdx !== -1) {
      const exc = this.exceptions[excIdx];
      adjustedTitle = `${exc.origin} → ${exc.destination}`;
      const newVar = Math.round(exc.avgActual - newTarget);
      const newVarPct = Math.round(((exc.avgActual - newTarget) / newTarget) * 1000) / 10;
      adjustedLane = {
        ...exc,
        currentTarget: newTarget,
        varDollars: newVar,
        varPercent: newVarPct,
        adjustmentStatus: 'Adjusted',
        lastAdjustedTarget: newTarget,
        adjustedDate: new Date().toLocaleDateString('en-US'),
        adjustedNotes: notes
      };
      this.exceptions[excIdx] = adjustedLane;

      // Synchronize and propagate target rate benchmark to all matching customer lanes (including key accounts)
      const excOriginConsolidated = getConsolidatedCity(exc.origin).toLowerCase();
      const excDestConsolidated = getConsolidatedCity(exc.destination).toLowerCase();

      this.rates = this.rates.map(custLane => {
        const custOriginConsolidated = getConsolidatedCity(custLane.originCity).toLowerCase();
        const custDestConsolidated = getConsolidatedCity(custLane.destinationCity).toLowerCase();

        const isExactCorridorMatch =
          (custOriginConsolidated === excOriginConsolidated && custDestConsolidated === excDestConsolidated) ||
          (custOriginConsolidated.includes(excOriginConsolidated) && custDestConsolidated.includes(excDestConsolidated)) ||
          (excOriginConsolidated.includes(custOriginConsolidated) && excDestConsolidated.includes(custDestConsolidated));

        const isCustomerSpecificMatch =
          Boolean(exc.customer &&
          custLane.customerName.toLowerCase().includes(exc.customer.toLowerCase()) &&
          (custOriginConsolidated === excOriginConsolidated || custDestConsolidated === excDestConsolidated));

        if (isExactCorridorMatch || isCustomerSpecificMatch) {
          const matchPercent = Math.round(
            (Math.min(custLane.baseRate, newTarget) / Math.max(custLane.baseRate, newTarget)) * 100
          );
          const historyEntry = {
            amount: custLane.baseRate,
            effectiveRange: `Control Tower Target Sync: $${newTarget.toLocaleString()} (${new Date().toLocaleDateString('en-US')})`,
            status: 'Current' as const
          };

          return {
            ...custLane,
            carrierTargetMatch: {
              targetAmount: newTarget,
              matchPercent,
              nearestLane: `${exc.origin} to ${exc.destination} ($${newTarget.toLocaleString()} Target Control Tower)`
            },
            rateHistory: [historyEntry, ...(custLane.rateHistory || [])]
          };
        }
        return custLane;
      });
    }

    // 2. Check Markets
    const mktIdx = this.markets.findIndex(m => m.id === id);
    if (mktIdx !== -1) {
      const m = this.markets[mktIdx];
      adjustedTitle = `${m.name} Market`;
      const newVar = Math.round(m.avgActual - newTarget);
      const newVarPct = Math.round(((m.avgActual - newTarget) / newTarget) * 1000) / 10;
      adjustedMarket = {
        ...m,
        avgTarget: newTarget,
        varianceDollars: newVar,
        variancePercent: newVarPct
      };
      this.markets[mktIdx] = adjustedMarket;

      // Update cascading lanes in this market region
      this.exceptions = this.exceptions.map(exc => {
        if (exc.market === m.region) {
          const laneVar = Math.round(exc.avgActual - newTarget);
          const laneVarPct = Math.round(((exc.avgActual - newTarget) / newTarget) * 1000) / 10;
          return {
            ...exc,
            currentTarget: newTarget,
            varDollars: laneVar,
            varPercent: laneVarPct,
            adjustmentStatus: 'Adjusted',
            lastAdjustedTarget: newTarget,
            adjustedDate: new Date().toLocaleDateString('en-US'),
            adjustedNotes: notes
          };
        }
        return exc;
      });

      // Synchronize cascading customer rate lanes in this market region (including key accounts)
      this.rates = this.rates.map(custLane => {
        const laneRegion = getLaneMarketRegion(custLane.originState, custLane.originCity);
        if (laneRegion === m.region || m.name.toLowerCase().includes(custLane.originCity.toLowerCase())) {
          const oldTarget = custLane.carrierTargetMatch.targetAmount || custLane.baseRate;
          const ratio = newTarget / (m.avgTarget || newTarget || 1);
          const updatedTargetAmount = Math.round(oldTarget * ratio);
          const matchPercent = Math.round(
            (Math.min(custLane.baseRate, updatedTargetAmount) / Math.max(custLane.baseRate, updatedTargetAmount)) * 100
          );
          return {
            ...custLane,
            carrierTargetMatch: {
              targetAmount: updatedTargetAmount,
              matchPercent,
              nearestLane: `${m.name} Market Benchmark ($${updatedTargetAmount.toLocaleString()} Target)`
            }
          };
        }
        return custLane;
      });
    }

    // 3. Check Customer Rates
    const custIdx = this.rates.findIndex(r => r.id === id);
    if (custIdx !== -1) {
      const r = this.rates[custIdx];
      adjustedTitle = `${r.customerName}: ${r.originCity} → ${r.destinationCity}`;
      adjustedCustomerLane = {
        ...r,
        baseRate: newTarget,
        totalBilling: Math.round((newTarget * (1 + r.fuelSurchargePercent / 100)) * 100) / 100,
        carrierTargetMatch: {
          ...r.carrierTargetMatch,
          targetAmount: newTarget,
          matchPercent: 100
        }
      };
      this.rates[custIdx] = adjustedCustomerLane;
    }

    // 4. Record Planned Adjustment Event
    const changePct = adjustedLane?.varPercent ?? 0;
    this.adjustments.unshift({
      id: `adj-${Date.now()}`,
      type: 'Pricing Adjustment',
      title: `${adjustedTitle}`,
      changePercent: changePct,
      status: 'Active',
      effectiveDate: new Date().toLocaleDateString('en-US'),
      notes: notes || 'Target rate adjustment synchronized with active customer lanes and key accounts.'
    });

    return { lane: adjustedLane, market: adjustedMarket, customerLane: adjustedCustomerLane };
  }

  async saveMarketAdjustment(marketId: string, newTarget: number, notes: string, excludeKeyAccounts?: boolean): Promise<MarketSummary> {
    const res = await this.saveLaneAdjustment(marketId, newTarget, notes, excludeKeyAccounts);
    if (!res.market) throw new Error(`Market ${marketId} not found`);
    return res.market;
  }

  async addCustomerLane(lane: Partial<CustomerRateLane>): Promise<CustomerRateLane> {
    const newRecord: CustomerRateLane = {
      id: lane.id || `lane-cust-${Date.now()}`,
      laneId: lane.laneId || `LANE-${Math.floor(100 + Math.random() * 899)}`,
      originCity: lane.originCity || 'Oakland',
      originState: lane.originState || 'CA',
      destinationCity: lane.destinationCity || 'Stockton',
      destinationState: lane.destinationState || 'CA',
      rawOrigin: lane.rawOrigin || `${lane.originCity || 'Oakland'}, ${lane.originState || 'CA'}`,
      rawDestination: lane.rawDestination || `${lane.destinationCity || 'Stockton'}, ${lane.destinationState || 'CA'}`,
      baseRate: lane.baseRate || 750,
      equipment: lane.equipment || "53' Dry Van",
      serviceType: lane.serviceType || 'Import Drayage',
      miles: lane.miles || 80,
      status: lane.status || 'AWARDED',
      activeState: lane.activeState || 'Active',
      effectiveDate: lane.effectiveDate || new Date().toISOString().split('T')[0],
      expirationDate: lane.expirationDate || '2027-06-30',
      reviewDate: lane.reviewDate || '2026-10-01',
      customerName: lane.customerName || 'Standard Client',
      fuelSurchargePercent: lane.fuelSurchargePercent || 14.5,
      fuelAmount: lane.fuelAmount ?? Math.round((lane.baseRate || 750) * 0.145 * 10) / 10,
      totalBilling: lane.totalBilling ?? Math.round((lane.baseRate || 750) * 1.145 * 10) / 10,
      accessorials: lane.accessorials || [],
      carrierTargetMatch: lane.carrierTargetMatch || {
        targetAmount: Math.round((lane.baseRate || 750) * 0.92),
        matchPercent: 95,
        nearestLane: 'Direct Regional Benchmark'
      },
      rateHistory: lane.rateHistory || [
        {
          amount: lane.baseRate || 750,
          effectiveRange: `Effective: ${new Date().toLocaleDateString('en-US')} to Present`,
          status: 'Current'
        }
      ],
      recommendedCarriers: lane.recommendedCarriers || []
    };
    this.rates.unshift(newRecord);
    return newRecord;
  }

  async updateCustomerLane(id: string, updates: Partial<CustomerRateLane>): Promise<CustomerRateLane> {
    const idx = this.rates.findIndex(r => r.id === id);
    if (idx === -1) throw new Error(`Customer rate lane ${id} not found`);
    const updated = { ...this.rates[idx], ...updates };
    this.rates[idx] = updated;
    return updated;
  }

  async addPlannedAdjustment(adjustment: PlannedAdjustment): Promise<PlannedAdjustment> {
    this.adjustments.unshift(adjustment);
    return adjustment;
  }

  async approvePlannedAdjustment(
    id: string,
    effectiveDate: string,
    approvedBy = 'General Manager',
    approvalNotes?: string,
    adjustedPercent?: number
  ): Promise<{ adjustment: PlannedAdjustment; updatedExceptions: LaneException[]; updatedMarkets: MarketSummary[] }> {
    const idx = this.adjustments.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`Planned adjustment ${id} not found`);

    const adj = this.adjustments[idx];
    const finalPercent = adjustedPercent !== undefined ? adjustedPercent : adj.changePercent;
    const isFuture = new Date(effectiveDate) > new Date();

    const updatedAdj: PlannedAdjustment = {
      ...adj,
      changePercent: finalPercent,
      effectiveDate,
      approvedBy,
      approvedDate: new Date().toLocaleDateString('en-US'),
      status: isFuture ? 'Scheduled' : 'Active',
      notes: approvalNotes
        ? `${adj.notes ? adj.notes + ' • ' : ''}[GM Approval: ${approvalNotes}]`
        : adj.notes
    };

    this.adjustments[idx] = updatedAdj;

    // Apply target rate shift to relevant market / lanes
    const scopeLower = (adj.targetMarketOrLane || adj.title || '').toLowerCase();
    
    this.exceptions = this.exceptions.map((exc) => {
      let matches = false;
      if (scopeLower.includes('oakland') && (exc.origin.toLowerCase().includes('oakland') || exc.market === 'NW')) {
        matches = true;
      } else if ((scopeLower.includes('la') || scopeLower.includes('lb')) && (exc.origin.toLowerCase().includes('la') || exc.destination.toLowerCase().includes('vegas') || exc.market === 'SW')) {
        matches = true;
      } else if (scopeLower.includes('seattle') && (exc.origin.toLowerCase().includes('seattle') || exc.origin.toLowerCase().includes('tacoma') || exc.market === 'NW')) {
        matches = true;
      } else if (scopeLower.includes('chicago') && (exc.origin.toLowerCase().includes('chicago') || exc.market === 'NE')) {
        matches = true;
      } else if (scopeLower.includes('southwest') || scopeLower.includes('sw')) {
        matches = exc.market === 'SW';
      } else if (scopeLower.includes('southeast') || scopeLower.includes('se')) {
        matches = exc.market === 'SE';
      } else if (scopeLower.includes('all')) {
        matches = true;
      } else if (exc.origin.toLowerCase().includes(scopeLower) || exc.destination.toLowerCase().includes(scopeLower)) {
        matches = true;
      }

      if (matches) {
        const factor = 1 + finalPercent / 100;
        const newTarget = Math.round(exc.currentTarget * factor);
        const laneVar = Math.round(exc.avgActual - newTarget);
        const laneVarPct = Math.round(((exc.avgActual - newTarget) / newTarget) * 1000) / 10;
        return {
          ...exc,
          currentTarget: newTarget,
          varDollars: laneVar,
          varPercent: laneVarPct,
          adjustmentStatus: 'Adjusted',
          lastAdjustedTarget: newTarget,
          adjustedDate: effectiveDate,
          adjustedNotes: `Approved by ${approvedBy} (Shift: ${finalPercent >= 0 ? '+' : ''}${finalPercent}%, Effective: ${effectiveDate})`
        };
      }
      return exc;
    });

    // Update Markets
    this.markets = this.markets.map((mkt) => {
      if (scopeLower.includes(mkt.name.toLowerCase()) || scopeLower.includes(mkt.region.toLowerCase()) || scopeLower.includes('all')) {
        const factor = 1 + finalPercent / 100;
        const newTarget = Math.round(mkt.avgTarget * factor);
        const mktVar = Math.round(mkt.avgActual - newTarget);
        const mktVarPct = Math.round(((mkt.avgActual - newTarget) / newTarget) * 1000) / 10;
        return {
          ...mkt,
          avgTarget: newTarget,
          varianceDollars: mktVar,
          variancePercent: mktVarPct
        };
      }
      return mkt;
    });

    // Update Customer Rates across all matching customer lanes and key accounts
    this.rates = this.rates.map((custLane) => {
      let matches = false;
      const originLower = custLane.originCity.toLowerCase();
      const destLower = custLane.destinationCity.toLowerCase();
      const laneRegion = getLaneMarketRegion(custLane.originState, custLane.originCity);

      if (scopeLower.includes('oakland') && (originLower.includes('oakland') || laneRegion === 'NW')) {
        matches = true;
      } else if ((scopeLower.includes('la') || scopeLower.includes('lb')) && (originLower.includes('la') || originLower.includes('san pedro') || laneRegion === 'SW')) {
        matches = true;
      } else if (scopeLower.includes('seattle') && (originLower.includes('seattle') || originLower.includes('tacoma') || laneRegion === 'NW')) {
        matches = true;
      } else if (scopeLower.includes('chicago') && (originLower.includes('chicago') || laneRegion === 'NE')) {
        matches = true;
      } else if (scopeLower.includes('southwest') || scopeLower.includes('sw')) {
        matches = laneRegion === 'SW';
      } else if (scopeLower.includes('southeast') || scopeLower.includes('se')) {
        matches = laneRegion === 'SE';
      } else if (scopeLower.includes('all')) {
        matches = true;
      } else if (originLower.includes(scopeLower) || destLower.includes(scopeLower)) {
        matches = true;
      }

      if (matches) {
        const factor = 1 + finalPercent / 100;
        const newTarget = Math.round((custLane.carrierTargetMatch?.targetAmount || custLane.baseRate) * factor);
        const matchPercent = Math.round(
          (Math.min(custLane.baseRate, newTarget) / Math.max(custLane.baseRate, newTarget)) * 100
        );
        return {
          ...custLane,
          carrierTargetMatch: {
            targetAmount: newTarget,
            matchPercent,
            nearestLane: `Control Tower Approved Target ($${newTarget.toLocaleString()})`
          }
        };
      }
      return custLane;
    });

    return {
      adjustment: updatedAdj,
      updatedExceptions: [...this.exceptions],
      updatedMarkets: [...this.markets]
    };
  }

  async rejectPlannedAdjustment(id: string, reason: string): Promise<PlannedAdjustment> {
    const idx = this.adjustments.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`Planned adjustment ${id} not found`);

    const adj = this.adjustments[idx];
    const updatedAdj: PlannedAdjustment = {
      ...adj,
      status: 'Rejected',
      notes: `${adj.notes ? adj.notes + ' • ' : ''}[GM Rejection: ${reason}]`
    };

    this.adjustments[idx] = updatedAdj;
    return updatedAdj;
  }

  async updatePlannedAdjustment(id: string, updates: Partial<PlannedAdjustment>): Promise<PlannedAdjustment> {
    const idx = this.adjustments.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`Planned adjustment ${id} not found`);

    const updated = { ...this.adjustments[idx], ...updates };
    this.adjustments[idx] = updated;
    return updated;
  }

  async deletePlannedAdjustment(id: string): Promise<void> {
    this.adjustments = this.adjustments.filter((a) => a.id !== id);
  }

  async reportIssue(issue: Omit<ReportedIssue, 'id' | 'timestamp' | 'status'>): Promise<ReportedIssue> {
    const newIssue: ReportedIssue = {
      id: `ISSUE-${Date.now()}`,
      ...issue,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Open / Dispatched to Pricing'
    };
    this.issues.unshift(newIssue);
    return newIssue;
  }

  async resolveValidationIssue(issueId: string, suggestedValue?: string): Promise<ValidationIssue> {
    const idx = this.validationIssues.findIndex(v => v.id === issueId);
    if (idx === -1) throw new Error(`Validation issue ${issueId} not found`);
    const updated: ValidationIssue = {
      ...this.validationIssues[idx],
      resolved: true,
      suggestedValue: suggestedValue || this.validationIssues[idx].suggestedValue
    };
    this.validationIssues[idx] = updated;
    return updated;
  }

  async commitValidationStaging(): Promise<{ newLanes: CustomerRateLane[]; newExceptions: LaneException[] }> {
    const newLane1: CustomerRateLane = {
      id: `lane-stg-${Date.now()}-1`,
      laneId: `OAK-SAC-${Math.floor(100 + Math.random() * 899)}`,
      originCity: 'Oakland',
      originState: 'CA',
      destinationCity: 'Sacramento',
      destinationState: 'CA',
      rawOrigin: 'Oakland, CA (OICT SSA Terminal)',
      rawDestination: 'Sacramento, CA (Distribution Hub)',
      baseRate: 720,
      equipment: "40' Dry Van",
      serviceType: 'Regional Drayage',
      miles: 88,
      status: 'AWARDED',
      activeState: 'Active',
      effectiveDate: new Date().toISOString().split('T')[0],
      expirationDate: '2027-06-30',
      reviewDate: '2027-05-15',
      customerName: 'Amazon Logistics, Inc.',
      fuelSurchargePercent: 14.0,
      fuelAmount: 100.8,
      totalBilling: 820.8,
      accessorials: [
        { id: `acc-${Date.now()}-1`, name: 'Chassis Split', rate: 75, applicability: 'Per Occurrence', effectiveDate: '2026-07-01' }
      ],
      carrierTargetMatch: {
        targetAmount: 680,
        matchPercent: 96,
        nearestLane: 'Oakland → Sacramento Direct'
      },
      rateHistory: [
        { amount: 720, effectiveRange: `Effective: ${new Date().toLocaleDateString()} - 06/30/2027`, status: 'Current' }
      ],
      recommendedCarriers: [
        {
          id: `carr-${Date.now()}`,
          name: 'Pacific Freight Lines',
          rank: 1,
          reliability: 99.1,
          serviceArea: 'Northern CA',
          notes: 'High performance regional fleet',
          statusColor: '#178A68'
        }
      ]
    };

    const newLane2: CustomerRateLane = {
      id: `lane-stg-${Date.now()}-2`,
      laneId: `LAX-PHX-${Math.floor(100 + Math.random() * 899)}`,
      originCity: 'Los Angeles',
      originState: 'CA',
      destinationCity: 'Phoenix',
      destinationState: 'AZ',
      rawOrigin: 'Los Angeles Port / LAX',
      rawDestination: 'Phoenix Metro Fulfillment Center',
      baseRate: 1450,
      equipment: "53' Dry Van",
      serviceType: 'Interstate Freight',
      miles: 372,
      status: 'AWARDED',
      activeState: 'Active',
      effectiveDate: new Date().toISOString().split('T')[0],
      expirationDate: '2027-06-30',
      reviewDate: '2027-05-15',
      customerName: 'Walmart Logistics',
      fuelSurchargePercent: 16.0,
      fuelAmount: 232,
      totalBilling: 1682,
      accessorials: [],
      carrierTargetMatch: {
        targetAmount: 1380,
        matchPercent: 95,
        nearestLane: 'LA → Phoenix Direct Corridor'
      },
      rateHistory: [
        { amount: 1450, effectiveRange: `Effective: ${new Date().toLocaleDateString()} - 06/30/2027`, status: 'Current' }
      ],
      recommendedCarriers: [
        {
          id: `carr-${Date.now()}-2`,
          name: 'Southwest Express Fleet',
          rank: 1,
          reliability: 97.8,
          serviceArea: 'Southwest',
          notes: 'Dedicated desert lane capacity',
          statusColor: '#178A68'
        }
      ]
    };

    this.rates.unshift(newLane1, newLane2);

    const newExc1: LaneException = {
      id: `exc-${Date.now()}-1`,
      origin: 'Oakland, CA',
      destination: 'Sacramento, CA',
      market: 'NW',
      loads: 48,
      currentTarget: 680,
      avgActual: 720,
      varDollars: 40,
      varPercent: 5.8,
      confidence: 'High',
      impact: 'Medium',
      adjustmentStatus: 'Pending Approval'
    };

    const newExc2: LaneException = {
      id: `exc-${Date.now()}-2`,
      origin: 'Los Angeles, CA',
      destination: 'Phoenix, AZ',
      market: 'SW',
      loads: 62,
      currentTarget: 1380,
      avgActual: 1450,
      varDollars: 70,
      varPercent: 5.1,
      confidence: 'High',
      impact: 'High',
      adjustmentStatus: 'Pending Approval'
    };

    this.exceptions.unshift(newExc1, newExc2);

    this.datasets = this.datasets.map(ds => ({
      ...ds,
      recordsCount: ds.recordsCount + 2,
      lastUpload: `Committed ${new Date().toLocaleDateString('en-US')} by Pricing Ops`,
      status: 'Healthy'
    }));

    this.validationIssues = this.validationIssues.map(i => ({ ...i, resolved: true }));

    return { newLanes: [newLane1, newLane2], newExceptions: [newExc1, newExc2] };
  }

  async saveFuelScaleForCustomer(
    customer: string,
    brackets: FuelScaleBracket[],
    applyToAllAreas = true
  ): Promise<{ updatedFuel: FuelScaleBracket[]; updatedCustomerLanes: CustomerRateLane[] }> {
    this.fuel = [...brackets];

    // Helper to get applicable regional diesel price based on state
    const getDieselPriceForState = (state: string): number => {
      const s = (state || '').toUpperCase().trim();
      if (s === 'CA') return 4.760; // California PADD 5
      if (['WA', 'OR', 'AK', 'HI'].includes(s)) return 4.180; // West Coast ex-CA
      if (['TX', 'LA', 'NM', 'AR', 'MS', 'AL'].includes(s)) return 3.395; // Gulf Coast
      if (['IL', 'IN', 'OH', 'MI', 'WI', 'MN', 'IA', 'MO', 'KY', 'TN', 'ND', 'SD', 'NE', 'KS'].includes(s)) return 3.680; // Midwest
      if (['NY', 'NJ', 'PA', 'DE', 'MD'].includes(s)) return 3.992; // Central Atlantic
      if (['ME', 'NH', 'VT', 'MA', 'RI', 'CT'].includes(s)) return 3.985; // New England
      if (['VA', 'WV', 'NC', 'SC', 'GA', 'FL'].includes(s)) return 3.695; // Lower Atlantic
      if (['MT', 'ID', 'WY', 'UT', 'CO', 'NV', 'AZ'].includes(s)) return 3.740; // Rocky Mountain
      return 3.785; // U.S. National Average
    };

    // Recalculate customer lanes
    this.rates = this.rates.map(lane => {
      const matchCustomer = customer === 'all' || !customer || lane.customerName.toLowerCase() === customer.toLowerCase();
      if (!matchCustomer) return lane;

      const stateToCheck = lane.originState || lane.destinationState || 'CA';
      const dieselPrice = applyToAllAreas ? getDieselPriceForState(stateToCheck) : 3.785;
      const { fscPercent, flatRatePerMile } = lookupFuelSurchargePercent(dieselPrice, brackets);
      const { fuelAmount, totalBilling } = calculateLaneFuelCharge(lane.baseRate, lane.miles, fscPercent, flatRatePerMile);

      return {
        ...lane,
        fuelSurchargePercent: fscPercent,
        fuelAmount,
        totalBilling
      };
    });

    // Update dataset record
    this.datasets = this.datasets.map(ds => {
      if (ds.name.toLowerCase().includes('fuel') || ds.id === 'ds-fuel-scale') {
        return {
          ...ds,
          recordsCount: brackets.length,
          lastUpload: `Updated ${brackets.length} fuel brackets for ${customer} on ${new Date().toLocaleDateString('en-US')}`,
          status: 'Healthy'
        };
      }
      return ds;
    });

    return {
      updatedFuel: [...this.fuel],
      updatedCustomerLanes: [...this.rates]
    };
  }

  async resetBaseline(): Promise<void> {
    this.kpis = { ...initialKPIStats };
    this.markets = [...initialMarkets];
    this.exceptions = [...initialLaneExceptions];
    this.datasets = [...initialDatasets];
    this.validationIssues = [...initialValidationIssues];
  }

  async ingestActualLoads(records: ActualLoadIngestRecord[]): Promise<ActualsIngestResult> {
    // First, clean any corrupted exceptions that might have unprintable characters or extreme length
    const isCorrupted = (str: string) => /[\x00-\x1F\x7F-\x9F\uFFFD]/.test(str) || str.length > 55 || str.includes('ï¿½');
    this.exceptions = this.exceptions.filter(e => !isCorrupted(e.origin) && !isCorrupted(e.destination));

    if (!records || records.length === 0) {
      return {
        updatedExceptions: [...this.exceptions],
        updatedMarkets: [...this.markets],
        updatedKpis: { ...this.kpis },
        totalLoadsIngested: 0,
        lanesUpdated: 0
      };
    }

    // Filter incoming records to ignore corrupted lines
    const validRecords = records.filter(r => !isCorrupted(r.origin) && !isCorrupted(r.destination) && r.origin.length >= 2 && r.destination.length >= 2);

    let totalLoadsCount = 0;
    let updatedLanesCount = 0;

    // Helper to determine Region if not provided
    const determineRegion = (orig: string, dest: string, fallback?: Region): Region => {
      if (fallback && fallback !== 'USA') return fallback;
      const combined = `${orig} ${dest}`.toLowerCase();
      if (combined.includes('ca') || combined.includes('or') || combined.includes('wa') || combined.includes('oakland') || combined.includes('seattle') || combined.includes('portland') || combined.includes('denver') || combined.includes('reno') || combined.includes('boise') || combined.includes('salt lake') || combined.includes('la/lb')) {
        if (combined.includes('los angeles') || combined.includes('long beach') || combined.includes('san pedro') || combined.includes('la/lb') || combined.includes('phoenix') || combined.includes('las vegas') || combined.includes('az') || combined.includes('nv') || combined.includes('nm')) {
          return 'SW';
        }
        return 'NW';
      }
      if (combined.includes('tx') || combined.includes('ga') || combined.includes('tn') || combined.includes('fl') || combined.includes('nc') || combined.includes('sc') || combined.includes('atlanta') || combined.includes('savannah') || combined.includes('dallas') || combined.includes('houston') || combined.includes('charleston') || combined.includes('miami') || combined.includes('san antonio') || combined.includes('memphis')) {
        return 'SE';
      }
      if (combined.includes('nj') || combined.includes('ny') || combined.includes('pa') || combined.includes('il') || combined.includes('chicago') || combined.includes('newark') || combined.includes('baltimore') || combined.includes('boston') || combined.includes('norfolk') || combined.includes('ny/nj')) {
        return 'NE';
      }
      return 'NW';
    };

    // Process each incoming actual load with City Mapping applied
    for (let idx = 0; idx < validRecords.length; idx++) {
      const record = validRecords[idx];
      const origClean = consolidateLocationString(record.origin.trim());
      const destClean = consolidateLocationString(record.destination.trim());
      const origRaw = record.origin.trim();
      const destRaw = record.destination.trim();
      const loadCount = record.loads || 1;
      totalLoadsCount += loadCount;

      const region = determineRegion(origClean, destClean, record.market);

      // Normalize date from record.outgateDate (maps to pickup_actual_date)
      const normalizedDate = normalizeToIsoDate(record.outgateDate) || '2026-06-22';

      // Find if lane exception already exists (matching consolidated or raw names)
      const existingIdx = this.exceptions.findIndex(e => {
        const eOrigConsolidated = consolidateLocationString(e.origin).toLowerCase();
        const eDestConsolidated = consolidateLocationString(e.destination).toLowerCase();
        const eOrigRaw = e.origin.toLowerCase();
        const eDestRaw = e.destination.toLowerCase();
        const oClean = origClean.toLowerCase();
        const dClean = destClean.toLowerCase();
        const oRaw = origRaw.toLowerCase();
        const dRaw = destRaw.toLowerCase();

        const origMatch =
          eOrigConsolidated.includes(oClean) ||
          oClean.includes(eOrigConsolidated) ||
          eOrigRaw.includes(oRaw) ||
          oRaw.includes(eOrigRaw);

        const destMatch =
          eDestConsolidated.includes(dClean) ||
          dClean.includes(eDestConsolidated) ||
          eDestRaw.includes(dRaw) ||
          dRaw.includes(eDestRaw);

        return origMatch && destMatch;
      });

      if (existingIdx !== -1) {
        const existing = this.exceptions[existingIdx];
        const target = record.targetRate || existing.currentTarget || 750;
        const totalNewLoads = existing.loads + loadCount;
        const newAvgActual = Math.round(((existing.avgActual * existing.loads) + (record.actualRate * loadCount)) / totalNewLoads);
        const varDollars = Math.round(newAvgActual - target);
        const varPercent = Math.round(((newAvgActual - target) / target) * 1000) / 10;
        const impact: 'High' | 'Medium' | 'Low' = varPercent > 10 || (varDollars * totalNewLoads > 5000) ? 'High' : varPercent > 5 ? 'Medium' : 'Low';

        const newLoadDetail: LoadDetail = {
          loadNo: record.loadNo || `LD-${500000 + idx}`,
          containerNo: record.containerNo || `CNTR${7100000 + idx}`,
          customer: record.customer || existing.customer || 'Commercial Shipper',
          accountManager: record.accountManager || existing.accountManager || 'Pricing Ops',
          carrier: record.carrier || existing.carrier || 'Regional Carrier Fleet',
          outgateDate: normalizedDate,
          origin: origClean,
          destination: destClean,
          chargedPercent: Math.min(65, Math.max(12, Math.abs(varPercent) + 32)),
          actualPay: record.actualRate,
          targetRate: target,
          isKeyAccount: record.isKeyAccount !== undefined ? record.isKeyAccount : existing.isKeyAccount
        };

        const existingLoads = existing.allLoads || existing.loadsDetail || [];
        const updatedLoadsDetail = [...existingLoads, newLoadDetail];

        this.exceptions[existingIdx] = {
          ...existing,
          loads: totalNewLoads,
          avgActual: newAvgActual,
          currentTarget: target,
          varDollars,
          varPercent,
          impact,
          customer: record.customer || existing.customer,
          carrier: record.carrier || existing.carrier,
          accountManager: record.accountManager || existing.accountManager,
          isKeyAccount: record.isKeyAccount !== undefined ? record.isKeyAccount : existing.isKeyAccount,
          loadsDetail: updatedLoadsDetail,
          allLoads: updatedLoadsDetail
        };
        updatedLanesCount++;
      } else {
        // Create new lane exception
        const target = record.targetRate || Math.round(record.actualRate * 0.94);
        const varDollars = Math.round(record.actualRate - target);
        const varPercent = Math.round(((record.actualRate - target) / target) * 1000) / 10;
        const impact: 'High' | 'Medium' | 'Low' = varPercent > 10 || (varDollars * loadCount > 5000) ? 'High' : varPercent > 5 ? 'Medium' : 'Low';

        const uniqueSuffix = `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 8)}`;
        const newLoadDetail: LoadDetail = {
          loadNo: record.loadNo || `LD-${500000 + idx}`,
          containerNo: record.containerNo || `CNTR${7100000 + idx}`,
          customer: record.customer || 'Commercial Shipper',
          accountManager: record.accountManager || 'Pricing Ops',
          carrier: record.carrier || 'Regional Carrier Fleet',
          outgateDate: normalizedDate,
          origin: origClean,
          destination: destClean,
          chargedPercent: Math.min(65, Math.max(12, Math.abs(varPercent) + 32)),
          actualPay: record.actualRate,
          targetRate: target,
          isKeyAccount: !!record.isKeyAccount
        };

        const newException: LaneException = {
          id: record.id && !this.exceptions.some(e => e.id === record.id) ? record.id : `exc-ingest-${uniqueSuffix}`,
          origin: origClean,
          destination: destClean,
          market: region,
          loads: loadCount,
          currentTarget: target,
          avgActual: record.actualRate,
          varDollars,
          varPercent,
          confidence: loadCount >= 10 ? 'High' : loadCount >= 5 ? 'Medium' : 'Low',
          impact,
          customer: record.customer || 'Commercial Shipper',
          carrier: record.carrier || 'Regional Carrier Fleet',
          accountManager: record.accountManager || 'Pricing Ops',
          isKeyAccount: !!record.isKeyAccount,
          adjustmentStatus: 'None',
          loadsDetail: [newLoadDetail],
          allLoads: [newLoadDetail]
        };

        this.exceptions.unshift(newException);
        updatedLanesCount++;
      }
    }

    // Ensure all exception IDs are strictly unique
    const seenIds = new Set<string>();
    this.exceptions = this.exceptions.map((exc, i) => {
      if (seenIds.has(exc.id)) {
        const fixedId = `${exc.id}-u${i}-${Math.random().toString(36).slice(2, 6)}`;
        seenIds.add(fixedId);
        return { ...exc, id: fixedId };
      }
      seenIds.add(exc.id);
      return exc;
    });

    // Recalculate Markets
    this.markets = this.markets.map(mkt => {
      const marketLanes = this.exceptions.filter(e => e.market === mkt.region);
      if (marketLanes.length === 0) return mkt;

      const totalMarketLoads = marketLanes.reduce((sum, l) => sum + l.loads, 0);
      const totalMarketActualDollars = marketLanes.reduce((sum, l) => sum + (l.avgActual * l.loads), 0);
      const totalMarketTargetDollars = marketLanes.reduce((sum, l) => sum + (l.currentTarget * l.loads), 0);

      const avgActual = totalMarketLoads > 0 ? Math.round(totalMarketActualDollars / totalMarketLoads) : mkt.avgActual;
      const avgTarget = totalMarketLoads > 0 ? Math.round(totalMarketTargetDollars / totalMarketLoads) : mkt.avgTarget;
      const varianceDollars = avgActual - avgTarget;
      const variancePercent = avgTarget > 0 ? Math.round(((avgActual - avgTarget) / avgTarget) * 1000) / 10 : 0;

      const status: 'Balanced Market' | 'Target Variance High' | 'Tight Capacity' = 
        variancePercent > 7 ? 'Tight Capacity' : variancePercent > 4 ? 'Target Variance High' : 'Balanced Market';

      return {
        ...mkt,
        loads: totalMarketLoads,
        avgActual,
        avgTarget,
        varianceDollars,
        variancePercent,
        status
      };
    });

    // Recalculate KPIs across all exceptions
    const totalAllLoads = this.exceptions.reduce((sum, e) => sum + e.loads, 0);
    const atUnderLoads = this.exceptions.filter(e => e.varPercent <= 0).reduce((sum, e) => sum + e.loads, 0);
    const over0To5Loads = this.exceptions.filter(e => e.varPercent > 0 && e.varPercent <= 5.0).reduce((sum, e) => sum + e.loads, 0);
    const over5Loads = this.exceptions.filter(e => e.varPercent > 5.0).reduce((sum, e) => sum + e.loads, 0);
    const lowConfLoads = this.exceptions.filter(e => e.confidence === 'Low').reduce((sum, e) => sum + e.loads, 0);

    const safePct = (val: number) => (totalAllLoads > 0 ? Math.round((val / totalAllLoads) * 100) : 0);

    this.kpis = {
      loadsAnalyzed: totalAllLoads,
      loadsAnalyzedChange: `+${Math.round((totalLoadsCount / Math.max(1, totalAllLoads - totalLoadsCount)) * 100)}%`,
      atUnderTarget: atUnderLoads,
      atUnderTargetPercent: safePct(atUnderLoads),
      overTarget0to5: over0To5Loads,
      overTarget0to5Percent: safePct(over0To5Loads),
      overTarget5Plus: over5Loads,
      overTarget5PlusPercent: safePct(over5Loads),
      lowConfidence: lowConfLoads,
      lowConfidencePercent: safePct(lowConfLoads)
    };

    // Update dataset record
    this.datasets = this.datasets.map(ds => {
      if (ds.name.toLowerCase().includes('weekly') || ds.name.toLowerCase().includes('load')) {
        return {
          ...ds,
          recordsCount: ds.recordsCount + totalLoadsCount,
          lastUpload: `Ingested ${totalLoadsCount} loads on ${new Date().toLocaleDateString('en-US')}`,
          status: 'Healthy'
        };
      }
      return ds;
    });

    return {
      updatedExceptions: [...this.exceptions],
      updatedMarkets: [...this.markets],
      updatedKpis: { ...this.kpis },
      totalLoadsIngested: totalLoadsCount,
      lanesUpdated: updatedLanesCount
    };
  }
}

// Global Singleton for Demo Mode
export const demoRateRepository = new DemoRateRepository();
