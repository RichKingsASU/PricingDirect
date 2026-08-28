import React, { useState, useEffect } from 'react';
import {
  ActiveTab, Region, KPIStats, MarketSummary, LaneException,
  PlannedAdjustment, CustomerRateLane, DatasetItem, ValidationIssue,
  ReportedIssue, ActualLoadIngestRecord, FuelScaleBracket
} from './types';
import { rateRepository } from './services/repositories';
import { authClient, UserContext } from './services/authClient';

import { TopNavBar } from './components/TopNavBar';
import { Sidebar } from './components/Sidebar';
import { TargetControlTower } from './components/TargetControlTower';
import { RateDirectory } from './components/RateDirectory';
import { DataManagement } from './components/DataManagement';

import { AdjustLaneModal } from './components/modals/AdjustLaneModal';
import { MapManualModal } from './components/modals/MapManualModal';
import { ScheduleAdjustmentModal } from './components/modals/ScheduleAdjustmentModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ReportsModal } from './components/modals/ReportsModal';
import { ReportIssueModal } from './components/modals/ReportIssueModal';

export default function App() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('target_control_tower');
  const [selectedRegion, setSelectedRegion] = useState<Region>('USA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [markets, setMarkets] = useState<MarketSummary[]>([]);
  const [laneExceptions, setLaneExceptions] = useState<LaneException[]>([]);
  const [plannedAdjustments, setPlannedAdjustments] = useState<PlannedAdjustment[]>([]);
  const [customerLanes, setCustomerLanes] = useState<CustomerRateLane[]>([]);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [reportedIssues, setReportedIssues] = useState<ReportedIssue[]>([]);

  const [adjustItem, setAdjustItem] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [mapIssue, setMapIssue] = useState<ValidationIssue | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);

  useEffect(() => {
    async function initAuth() {
      try {
        const me = await authClient.getMe();
        setUser(me);
      } catch (err: any) {
        if (err.status === 401 || err.status === 403) {
          setAuthError(true);
        } else {
          console.error("Auth error:", err);
          setAuthError(true); // Treat any error as unauthenticated for now
        }
      } finally {
        setAuthLoading(false);
      }
    }
    initAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      try {
        const [
          kpiData, marketData, exceptionsData, adjustmentsData,
          lanesData, dsData, issuesData, reportedData
        ] = await Promise.all([
          rateRepository.getKPIStats().catch(() => null),
          rateRepository.getMarkets().catch(() => []),
          rateRepository.getLaneExceptions().catch(() => []),
          rateRepository.getPlannedAdjustments().catch(() => []),
          rateRepository.getCustomerRates(),
          rateRepository.getDatasets().catch(() => []),
          rateRepository.getValidationIssues().catch(() => []),
          rateRepository.getReportedIssues().catch(() => [])
        ]);

        if (kpiData) setKpis(kpiData);
        setMarkets(marketData);
        setLaneExceptions(exceptionsData);
        setPlannedAdjustments(adjustmentsData);
        setCustomerLanes(lanesData);
        setDatasets(dsData);
        setValidationIssues(issuesData);
        setReportedIssues(reportedData);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    }
    loadData();
  }, [user]);

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center bg-gray-100">Loading PricingDirect...</div>;
  }

  if (authError || !user) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-100 text-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
        <p className="text-gray-600 mb-6">You must be logged in to access PricingDirect.</p>
        <a href="/admin/login/?next=/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">
          Sign in via Django
        </a>
      </div>
    );
  }

  const teamContext = user.roles?.includes('Operations') ? 'Operations' : 'Pricing Team';
  const handleSaveAdjustment = async (updates: any, notes: string, excludeKeyAccounts: boolean) => {
    try {
    if (adjustItem) {
      if ('origin' in adjustItem) {
        const res = await rateRepository.saveLaneAdjustment(adjustItem.id, updates.targetRate, notes, excludeKeyAccounts);
        if (res.lane) setLaneExceptions(prev => prev.map(e => e.id === res.lane!.id ? res.lane! : e));
      } else if ('marketId' in adjustItem) {
        const res = await rateRepository.saveMarketAdjustment(adjustItem.marketId, updates.targetRate, notes, excludeKeyAccounts);
        setMarkets(prev => prev.map(m => m.marketId === res.marketId ? res : m));
      } else if ('laneId' in adjustItem) {
        const res = await rateRepository.updateCustomerLane(adjustItem.id, { baseRate: updates.targetRate });
        setCustomerLanes(prev => prev.map(l => l.id === res.id ? res : l));
      }
    }
    } catch (e: any) { alert(e.message); } setAdjustItem(null);
  };

  const handleResolveMapIssue = async (issueId: string, suggestion?: string) => {
    const res = await rateRepository.resolveValidationIssue(issueId, suggestion);
    setValidationIssues(prev => prev.map(i => i.id === res.id ? res : i));
    setMapIssue(null);
  };

  const handleAddPlannedAdjustment = async (adj: PlannedAdjustment) => {
    const res = await rateRepository.addPlannedAdjustment(adj);
    setPlannedAdjustments([...plannedAdjustments, res]);
    setShowScheduleModal(false);
  };

  const handleApprovePlannedAdjustment = async (id: string, notes?: string, adjustedPercent?: number) => {
    const res = await rateRepository.approvePlannedAdjustment(id, new Date().toISOString(), user.username, notes, adjustedPercent);
    setPlannedAdjustments(prev => prev.map(a => a.id === res.adjustment.id ? res.adjustment : a));
    setLaneExceptions(res.updatedExceptions);
    setMarkets(res.updatedMarkets);
  };

  const handleRejectPlannedAdjustment = async (id: string, reason: string) => {
    const res = await rateRepository.rejectPlannedAdjustment(id, reason);
    setPlannedAdjustments(prev => prev.map(a => a.id === res.id ? res : a));
  };

  const handleUpdatePlannedAdjustment = async (id: string, updates: Partial<PlannedAdjustment>) => {
    const res = await rateRepository.updatePlannedAdjustment(id, updates);
    setPlannedAdjustments(prev => prev.map(a => a.id === res.id ? res : a));
  };

  const handleDeletePlannedAdjustment = async (id: string) => {
    await rateRepository.deletePlannedAdjustment(id);
    setPlannedAdjustments(prev => prev.filter(a => a.id !== id));
  };

  const handleExportTargets = () => {
    // In a real app, this would generate and download a CSV/Excel
    alert("Export functionality simulated.");
  };

  const handleSaveFuelScale = async (customer: string, brackets: FuelScaleBracket[], applyToAllAreas?: boolean) => {
    const res = await rateRepository.saveFuelScaleForCustomer(customer, brackets, applyToAllAreas);
    setCustomerLanes(res.updatedCustomerLanes);
  };

  const handleIngestActualLoads = async (records: ActualLoadIngestRecord[]) => {
    const res = await rateRepository.ingestActualLoads(records);
    if (res.newValidationIssues.length > 0) {
      setValidationIssues(prev => [...prev, ...res.newValidationIssues]);
    }
  };

  const handleCommitDataChanges = async () => {
    const result = await rateRepository.commitValidationStaging();
    setCustomerLanes(prev => [...prev, ...result.newLanes]);
    setLaneExceptions(prev => [...prev, ...result.newExceptions]);
  };

  const handleResetBaseline = async () => {
    await rateRepository.resetBaseline();
    const [kpiData, marketData, exceptionsData, datasetsData] = await Promise.all([
      rateRepository.getKPIStats().catch(() => null),
      rateRepository.getMarkets().catch(() => []),
      rateRepository.getLaneExceptions().catch(() => []),
      rateRepository.getDatasets().catch(() => [])
    ]);
    if (kpiData) setKpis(kpiData);
    setMarkets(marketData);
    setLaneExceptions(exceptionsData);
    setDatasets(datasetsData);
  };

  const handleDiscardDataChanges = () => {};

  const handleUploadFileSimulated = (filename: string) => {
    setDatasets((prev) =>
      prev.map((ds, idx) =>
        idx === 0
          ? { ...ds, lastUpload: `Just now (${filename}) by ${user.username}`, recordsCount: ds.recordsCount + 450 }
          : ds
      )
    );
  };

  const handleAddCustomer = async (cust: { name: string; code: string }) => {
    const newLaneData: Partial<CustomerRateLane> = {
      laneId: `${cust.code || 'CUST'}-001`, customerName: cust.name, originCity: 'Oakland', originState: 'CA', rawOrigin: 'OICT SSA Terminal Oakland', destinationCity: 'Stockton', destinationState: 'CA', rawDestination: 'Amazon TCY2 Stockton', baseRate: 780, fuelSurchargePercent: 14.5, fuelAmount: 113.1, totalBilling: 893.1, effectiveDate: '2026-07-01', expirationDate: '2027-06-30', reviewDate: '2026-10-01', status: 'AWARDED', activeState: 'Active', miles: 78, equipment: '53ft Dry Van', serviceType: 'Import Drayage', accessorials: [{ id: 'acc-1', name: 'Chassis Split', rate: 125, applicability: 'Per Container', effectiveDate: '2026-07-01' }], recommendedCarriers: [], carrierTargetMatch: { matchPercent: 100, targetAmount: 780, nearestLane: 'Oakland, CA -> Stockton, CA' }, rateHistory: [{ amount: 780, effectiveRange: '2026-07-01 to Present', status: 'Current' }]
    };
    await rateRepository.addCustomerLane(newLaneData);
    const updatedRates = await rateRepository.getCustomerRates();
    setCustomerLanes(updatedRates);
  };

  const handleAddLane = async (newLane: CustomerRateLane) => {
    await rateRepository.addCustomerLane(newLane);
    const updatedRates = await rateRepository.getCustomerRates();
    setCustomerLanes(updatedRates);
  };

  const handleReportIssueSubmit = async (report: ReportedIssue) => {
    await rateRepository.reportIssue(report);
    const updated = await rateRepository.getReportedIssues();
    setReportedIssues(updated);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-['Inter',sans-serif] text-[#14213D] flex flex-col relative">
      <TopNavBar activeTab={activeTab} setActiveTab={setActiveTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} teamContext={teamContext as any} setTeamContext={() => {}} onOpenSettings={() => setShowSettingsModal(true)} onOpenReportIssue={() => setShowReportIssueModal(true)} reportedCount={reportedIssues.length} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onOpenReportsHubModal={() => setShowReportsModal(true)} onOpenSettingsModal={() => setShowSettingsModal(true)} onOpenReportModal={() => setShowReportIssueModal(true)} openIssuesCount={reportedIssues.length} />
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-64px)] p-4 sm:p-6">
          {activeTab === 'target_control_tower' && kpis && (
            <TargetControlTower kpis={kpis} markets={markets} laneExceptions={laneExceptions} plannedAdjustments={plannedAdjustments} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} onAdjustLane={(exc) => setAdjustItem(exc)} onAdjustMarket={(mkt) => setAdjustItem(mkt)} onScheduleNewChange={() => setShowScheduleModal(true)} onApprovePlannedAdjustment={handleApprovePlannedAdjustment} onRejectPlannedAdjustment={handleRejectPlannedAdjustment} onUpdatePlannedAdjustment={handleUpdatePlannedAdjustment} onDeletePlannedAdjustment={handleDeletePlannedAdjustment} onUploadData={() => setActiveTab('data_management')} onExportTargets={handleExportTargets} searchQuery={searchQuery} teamContext={teamContext as any} onIngestActuals={handleIngestActualLoads} onResetBaseline={handleResetBaseline} />
          )}
          {activeTab === 'rate_directory' && (
            <RateDirectory lanes={customerLanes} onEditLane={(lane) => setAdjustItem(lane)} onUploadData={() => setActiveTab('data_management')} onExport={handleExportTargets} searchQuery={searchQuery} onAddCustomer={handleAddCustomer} onAddLane={handleAddLane} teamContext={teamContext as any} />
          )}
          {activeTab === 'data_management' && (
            <DataManagement datasets={datasets} validationIssues={validationIssues} onOpenMapManual={(issue) => setMapIssue(issue)} onCommitChanges={handleCommitDataChanges} onDiscardChanges={handleDiscardDataChanges} onUploadFileSimulated={handleUploadFileSimulated} customersList={Array.from(new Set(['UPS', 'Amazon Logistics, Inc.', 'Walmart Distribution', 'Home Depot Ops', 'Target Fulfillment', 'Dollar Tree Distribution Inc', 'Ross Stores, Inc.', 'Discount Tire', 'FedEx Ground', ...customerLanes.map((l) => l.customerName)]))} onAddCustomer={handleAddCustomer} onSaveFuelScale={handleSaveFuelScale} onIngestActualLoads={handleIngestActualLoads} onNavigateToTab={setActiveTab} />
          )}
        </main>
      </div>
      <AdjustLaneModal item={adjustItem} onClose={() => setAdjustItem(null)} onSave={handleSaveAdjustment} />
      <MapManualModal issue={mapIssue} onClose={() => setMapIssue(null)} onResolve={handleResolveMapIssue} />
      <ScheduleAdjustmentModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} onAddPlannedAdjustment={handleAddPlannedAdjustment} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      <ReportsModal isOpen={showReportsModal} onClose={() => setShowReportsModal(false)} />
      <ReportIssueModal isOpen={showReportIssueModal} onClose={() => setShowReportIssueModal(false)} onReportSubmit={handleReportIssueSubmit} />
    </div>
  );
}
