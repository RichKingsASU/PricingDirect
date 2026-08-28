import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  Region,
  KPIStats,
  MarketSummary,
  LaneException,
  PlannedAdjustment,
  CustomerRateLane,
  DatasetItem,
  ValidationIssue,
  ReportedIssue,
  ActualLoadIngestRecord,
  FuelScaleBracket
} from './types';
import { IRateRepository } from './services/repositories/IRateRepository';
import { demoRateRepository } from './services/repositories/DemoRateRepository';
import {
  initialKPIStats,
  initialMarkets,
  initialLaneExceptions,
  initialPlannedAdjustments,
  initialCustomerLanes,
  initialDatasets,
  initialValidationIssues
} from './data/initialData';

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

interface AppProps {
  repository?: IRateRepository;
}

export default function App({ repository = demoRateRepository }: AppProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('target_control_tower');
  const [selectedRegion, setSelectedRegion] = useState<Region>('USA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teamContext, setTeamContext] = useState<'Pricing Team' | 'Operations'>('Pricing Team');

  // Application Data States initialized with baseline data and synced via Repository
  const [kpis, setKpis] = useState<KPIStats>(initialKPIStats);
  const [markets, setMarkets] = useState<MarketSummary[]>(initialMarkets);
  const [laneExceptions, setLaneExceptions] = useState<LaneException[]>(initialLaneExceptions);
  const [plannedAdjustments, setPlannedAdjustments] = useState<PlannedAdjustment[]>(initialPlannedAdjustments);
  const [customerLanes, setCustomerLanes] = useState<CustomerRateLane[]>(initialCustomerLanes);
  const [datasets, setDatasets] = useState<DatasetItem[]>(initialDatasets);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(initialValidationIssues);
  const [reportedIssues, setReportedIssues] = useState<ReportedIssue[]>([]);

  // Modal States
  const [adjustItem, setAdjustItem] = useState<LaneException | MarketSummary | CustomerRateLane | null>(null);
  const [mapIssue, setMapIssue] = useState<ValidationIssue | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showReportsModal, setShowReportsModal] = useState<boolean>(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState<boolean>(false);

  // Initial Data Load from Repository
  useEffect(() => {
    async function loadData() {
      const [
        kpiData,
        marketData,
        exceptionData,
        adjData,
        laneData,
        dsData,
        valData,
        issuesData
      ] = await Promise.all([
        repository.getKPIStats(),
        repository.getMarkets(),
        repository.getLaneExceptions(),
        repository.getPlannedAdjustments(),
        repository.getCustomerRates(),
        repository.getDatasets(),
        repository.getValidationIssues(),
        repository.getReportedIssues()
      ]);

      setKpis(kpiData);
      setMarkets(marketData);
      setLaneExceptions(exceptionData);
      setPlannedAdjustments(adjData);
      setCustomerLanes(laneData);
      setDatasets(dsData);
      setValidationIssues(valData);
      setReportedIssues(issuesData);
    }

    loadData();
  }, [repository]);

  // Export CSV Helper
  const handleExportCSV = (filename: string, rows: Record<string, unknown>[]) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]).join(',');
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTargets = () => {
    const exportData = customerLanes.map((l) => ({
      LaneID: l.laneId,
      Customer: l.customerName,
      Origin: `${l.originCity}, ${l.originState}`,
      Destination: `${l.destinationCity}, ${l.destinationState}`,
      BaseRate: l.baseRate,
      Equipment: l.equipment,
      CarrierTarget: l.carrierTargetMatch.targetAmount,
      MatchPercent: l.carrierTargetMatch.matchPercent
    }));
    handleExportCSV('carrier_targets_export.csv', exportData);
  };

  const handleSaveAdjustment = async ({
    id,
    target,
    changePercent,
    notes,
    excludeKeyAccounts
  }: {
    id: string;
    target: number;
    changePercent: number;
    notes: string;
    excludeKeyAccounts?: boolean;
  }) => {
    await repository.saveLaneAdjustment(id, target, notes, excludeKeyAccounts);

    // Refresh state from repository
    const [updatedExceptions, updatedMarkets, updatedRates, updatedAdjs] = await Promise.all([
      repository.getLaneExceptions(),
      repository.getMarkets(),
      repository.getCustomerRates(),
      repository.getPlannedAdjustments()
    ]);

    setLaneExceptions(updatedExceptions);
    setMarkets(updatedMarkets);
    setCustomerLanes(updatedRates);
    setPlannedAdjustments(updatedAdjs);
  };

  const handleResolveMapIssue = async (issueId: string, mappedValue: string) => {
    await repository.resolveValidationIssue(issueId, mappedValue);
    const updated = await repository.getValidationIssues();
    setValidationIssues(updated);
  };

  const handleAddPlannedAdjustment = async (adj: PlannedAdjustment) => {
    await repository.addPlannedAdjustment(adj);
    const updated = await repository.getPlannedAdjustments();
    setPlannedAdjustments(updated);
  };

  const handleApprovePlannedAdjustment = async (
    id: string,
    effectiveDate: string,
    approvedBy = 'General Manager',
    approvalNotes?: string,
    adjustedPercent?: number
  ) => {
    const res = await repository.approvePlannedAdjustment(
      id,
      effectiveDate,
      approvedBy,
      approvalNotes,
      adjustedPercent
    );
    const [updatedAdjs, updatedKpis, updatedRates] = await Promise.all([
      repository.getPlannedAdjustments(),
      repository.getKPIStats(),
      repository.getCustomerRates()
    ]);
    setPlannedAdjustments(updatedAdjs);
    setLaneExceptions(res.updatedExceptions);
    setMarkets(res.updatedMarkets);
    setCustomerLanes(updatedRates);
    setKpis(updatedKpis);
  };

  const handleRejectPlannedAdjustment = async (id: string, reason: string) => {
    await repository.rejectPlannedAdjustment(id, reason);
    const updated = await repository.getPlannedAdjustments();
    setPlannedAdjustments(updated);
  };

  const handleUpdatePlannedAdjustment = async (id: string, updates: Partial<PlannedAdjustment>) => {
    await repository.updatePlannedAdjustment(id, updates);
    const updated = await repository.getPlannedAdjustments();
    setPlannedAdjustments(updated);
  };

  const handleDeletePlannedAdjustment = async (id: string) => {
    await repository.deletePlannedAdjustment(id);
    const updated = await repository.getPlannedAdjustments();
    setPlannedAdjustments(updated);
  };

  const handleCommitDataChanges = async () => {
    await repository.commitValidationStaging();
    const [updatedLanes, updatedExceptions, updatedDatasets, updatedIssues] = await Promise.all([
      repository.getCustomerRates(),
      repository.getLaneExceptions(),
      repository.getDatasets(),
      repository.getValidationIssues()
    ]);

    setCustomerLanes(updatedLanes);
    setLaneExceptions(updatedExceptions);
    setDatasets(updatedDatasets);
    setValidationIssues(updatedIssues);
  };

  const handleSaveFuelScale = async (customer: string, brackets: FuelScaleBracket[], applyToAllAreas = true) => {
    const result = await repository.saveFuelScaleForCustomer(customer, brackets, applyToAllAreas);
    setCustomerLanes(result.updatedCustomerLanes);
    const updatedDatasets = await repository.getDatasets();
    setDatasets(updatedDatasets);
  };

  const handleIngestActualLoads = async (records: ActualLoadIngestRecord[]) => {
    const result = await repository.ingestActualLoads(records);
    setLaneExceptions(result.updatedExceptions);
    setMarkets(result.updatedMarkets);
    setKpis(result.updatedKpis);
    const updatedDatasets = await repository.getDatasets();
    setDatasets(updatedDatasets);
  };

  const handleResetBaseline = async () => {
    await repository.resetBaseline();
    const [kpiData, marketData, exceptionsData, datasetsData] = await Promise.all([
      repository.getKPIStats(),
      repository.getMarkets(),
      repository.getLaneExceptions(),
      repository.getDatasets()
    ]);
    setKpis(kpiData);
    setMarkets(marketData);
    setLaneExceptions(exceptionsData);
    setDatasets(datasetsData);
  };

  const handleDiscardDataChanges = () => {
    // Staging discarded notification handled with clean in-app toast feedback
  };

  const handleUploadFileSimulated = (filename: string) => {
    setDatasets((prev) =>
      prev.map((ds, idx) =>
        idx === 0
          ? {
              ...ds,
              lastUpload: `Just now (${filename}) by Sarah M.`,
              recordsCount: ds.recordsCount + 450
            }
          : ds
      )
    );
  };

  const handleAddCustomer = async (cust: { name: string; code: string }) => {
    const newLaneData: Partial<CustomerRateLane> = {
      laneId: `${cust.code || 'CUST'}-001`,
      customerName: cust.name,
      originCity: 'Oakland',
      originState: 'CA',
      rawOrigin: 'OICT SSA Terminal Oakland',
      destinationCity: 'Stockton',
      destinationState: 'CA',
      rawDestination: 'Amazon TCY2 Stockton',
      baseRate: 780,
      fuelSurchargePercent: 14.5,
      fuelAmount: 113.1,
      totalBilling: 893.1,
      effectiveDate: '2026-07-01',
      expirationDate: '2027-06-30',
      reviewDate: '2026-10-01',
      status: 'AWARDED',
      activeState: 'Active',
      miles: 78,
      equipment: '53ft Dry Van',
      serviceType: 'Import Drayage',
      accessorials: [{ id: 'acc-1', name: 'Chassis Split', rate: 125, applicability: 'Per Container', effectiveDate: '2026-07-01' }],
      recommendedCarriers: [
        { id: 'carr-1', name: 'FLAT-LINE XPRESS LLC', rank: 1, reliability: 98, statusColor: '#178A68', serviceArea: 'NW Drayage', notes: 'Preferred Drayage Carrier' }
      ],
      carrierTargetMatch: { matchPercent: 100, targetAmount: 780, nearestLane: 'Oakland, CA -> Stockton, CA' },
      rateHistory: [{ amount: 780, effectiveRange: '2026-07-01 to Present', status: 'Current' }]
    };

    await repository.addCustomerLane(newLaneData);
    const updatedRates = await repository.getCustomerRates();
    setCustomerLanes(updatedRates);
  };

  const handleAddLane = async (newLane: CustomerRateLane) => {
    await repository.addCustomerLane(newLane);
    const updatedRates = await repository.getCustomerRates();
    setCustomerLanes(updatedRates);
  };

  const handleReportIssueSubmit = async (report: ReportedIssue) => {
    await repository.reportIssue(report);
    const updated = await repository.getReportedIssues();
    setReportedIssues(updated);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-['Inter',sans-serif] text-[#14213D] flex flex-col relative">
      {/* Top Header Navigation */}
      <TopNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        teamContext={teamContext}
        setTeamContext={setTeamContext}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenReportIssue={() => setShowReportIssueModal(true)}
        reportedCount={reportedIssues.length}
      />

      {/* Primary Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Persistent Operational Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenReportsHubModal={() => setShowReportsModal(true)}
          onOpenSettingsModal={() => setShowSettingsModal(true)}
          onOpenReportModal={() => setShowReportIssueModal(true)}
          openIssuesCount={reportedIssues.length}
        />

        {/* Main Workspace Viewport */}
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-64px)] p-4 sm:p-6">
          {activeTab === 'target_control_tower' && (
            <TargetControlTower
              kpis={kpis}
              markets={markets}
              laneExceptions={laneExceptions}
              plannedAdjustments={plannedAdjustments}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              onAdjustLane={(exc) => setAdjustItem(exc)}
              onAdjustMarket={(mkt) => setAdjustItem(mkt)}
              onScheduleNewChange={() => setShowScheduleModal(true)}
              onApprovePlannedAdjustment={handleApprovePlannedAdjustment}
              onRejectPlannedAdjustment={handleRejectPlannedAdjustment}
              onUpdatePlannedAdjustment={handleUpdatePlannedAdjustment}
              onDeletePlannedAdjustment={handleDeletePlannedAdjustment}
              onUploadData={() => setActiveTab('data_management')}
              onExportTargets={handleExportTargets}
              searchQuery={searchQuery}
              teamContext={teamContext}
              onIngestActuals={handleIngestActualLoads}
              onResetBaseline={handleResetBaseline}
            />
          )}

          {activeTab === 'rate_directory' && (
            <RateDirectory
              lanes={customerLanes}
              onEditLane={(lane) => setAdjustItem(lane)}
              onUploadData={() => setActiveTab('data_management')}
              onExport={handleExportTargets}
              searchQuery={searchQuery}
              onAddCustomer={handleAddCustomer}
              onAddLane={handleAddLane}
              teamContext={teamContext}
            />
          )}

          {activeTab === 'data_management' && (
            <DataManagement
              datasets={datasets}
              validationIssues={validationIssues}
              onOpenMapManual={(issue) => setMapIssue(issue)}
              onCommitChanges={handleCommitDataChanges}
              onDiscardChanges={handleDiscardDataChanges}
              onUploadFileSimulated={handleUploadFileSimulated}
              customersList={Array.from(
                new Set([
                  'UPS',
                  'Amazon Logistics, Inc.',
                  'Walmart Distribution',
                  'Home Depot Ops',
                  'Target Fulfillment',
                  'Dollar Tree Distribution Inc',
                  'Ross Stores, Inc.',
                  'Discount Tire',
                  'FedEx Ground',
                  ...customerLanes.map((l) => l.customerName)
                ])
              )}
              onAddCustomer={handleAddCustomer}
              onSaveFuelScale={handleSaveFuelScale}
              onIngestActualLoads={handleIngestActualLoads}
              onNavigateToTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AdjustLaneModal
        item={adjustItem}
        onClose={() => setAdjustItem(null)}
        onSave={handleSaveAdjustment}
      />

      <MapManualModal
        issue={mapIssue}
        onClose={() => setMapIssue(null)}
        onResolve={handleResolveMapIssue}
      />

      <ScheduleAdjustmentModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onAddPlannedAdjustment={handleAddPlannedAdjustment}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <ReportsModal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
      />

      <ReportIssueModal
        isOpen={showReportIssueModal}
        onClose={() => setShowReportIssueModal(false)}
        onReportSubmit={handleReportIssueSubmit}
      />
    </div>
  );
}
