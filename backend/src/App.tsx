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
  DevPersona
} from './types';
import {
  initialKPIStats,
  initialMarkets,
  initialLaneExceptions,
  initialPlannedAdjustments,
  initialCustomerLanes,
  initialDatasets,
  initialValidationIssues
} from './data/initialData';
import { supabase } from './lib/supabaseClient';
import { authService, marketService, exceptionService, adjustmentService, rateLaneService } from './services/api';

import { Login, DEFAULT_DEV_PERSONAS } from './components/Login';
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

export default function App() {
  // Auth & Dev Bypass State
  const [currentUser, setCurrentUser] = useState<DevPersona | null>(() => {
    try {
      const saved = sessionStorage.getItem('pricing_hub_dev_bypass_persona');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Ignore session storage errors
    }
    return null;
  });
  const [session, setSession] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('target_control_tower');
  const [selectedRegion, setSelectedRegion] = useState<Region>('NW');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teamContext, setTeamContext] = useState<'Pricing Team' | 'Operations'>(() => {
    try {
      const saved = sessionStorage.getItem('pricing_hub_dev_bypass_persona');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.teamContext) return parsed.teamContext;
      }
    } catch (e) {}
    return 'Pricing Team';
  });

  // Application Data States
  const [kpis] = useState<KPIStats>(initialKPIStats);
  const [markets, setMarkets] = useState<MarketSummary[]>(initialMarkets);
  const [laneExceptions, setLaneExceptions] = useState<LaneException[]>(initialLaneExceptions);
  const [plannedAdjustments, setPlannedAdjustments] = useState<PlannedAdjustment[]>(initialPlannedAdjustments);
  const [customerLanes, setCustomerLanes] = useState<CustomerRateLane[]>(initialCustomerLanes);
  const [datasets, setDatasets] = useState<DatasetItem[]>(initialDatasets);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(initialValidationIssues);
  
  // Loading State
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function initAuth() {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          setSession(existingSession);
          if (!currentUser) {
            const email = existingSession.user?.email || 'authenticated@forrestlogistics.com';
            setCurrentUser({
              id: existingSession.user?.id || 'supabase-user',
              name: email.split('@')[0],
              email,
              role: 'Pricing Specialist',
              teamContext: 'Pricing Team',
              avatarInitials: email.substring(0, 2).toUpperCase(),
              avatarColor: '#1769FF',
              description: 'Authenticated Supabase User'
            });
          }
        }
      } catch (err) {
        console.info('Supabase session check in standalone mode');
      }
    }
    initAuth();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const orgId = await authService.getCurrentOrganizationId();
        if (!orgId) return;

        // Fetch markets
        const mData = await marketService.getMarkets(orgId);
        if (mData && mData.length > 0) {
          setMarkets(mData.map(m => ({
            id: m.id,
            name: m.name,
            region: m.region as Region,
            avgActual: m.avg_actual,
            avgTarget: m.avg_target,
            varianceDollars: m.variance_dollars,
            variancePercent: m.variance_percent,
            loads: m.loads,
            trendStatus: m.trend_status as any,
            status: m.status as any,
            trendData: [50, 52, 48, 50, 51, 49, 50, 50] // mock trend
          })));
        }

        const leData = await exceptionService.getExceptions(orgId);
        if (leData && leData.length > 0) {
          setLaneExceptions(leData.map(e => ({
            id: e.id,
            origin: e.origin,
            destination: e.destination,
            market: e.market as Region,
            loads: e.loads,
            currentTarget: e.current_target,
            avgActual: e.avg_actual,
            varDollars: e.var_dollars,
            varPercent: e.var_percent,
            confidence: e.confidence as any,
            impact: e.impact as any,
            adjustmentStatus: e.adjustment_status as any,
            lastAdjustedTarget: e.last_adjusted_target,
            adjustedDate: e.adjusted_date,
            adjustedNotes: e.adjusted_notes
          })));
        }

        const paData = await adjustmentService.getAdjustments(orgId);
        if (paData && paData.length > 0) {
          setPlannedAdjustments(paData.map(p => ({
            id: p.id,
            title: p.title,
            changePercent: p.change_percent,
            status: p.status as any,
            effectiveDate: p.effective_date,
            notes: p.notes
          })));
        }

        const crData = await rateLaneService.getCustomerLanes(orgId);
        if (crData && crData.length > 0) {
          setCustomerLanes(crData.map(c => ({
            id: c.id,
            laneId: c.lane_id,
            customerName: c.customer_name,
            originCity: c.origin_city,
            originState: c.origin_state,
            destinationCity: c.destination_city,
            destinationState: c.destination_state,
            rawOrigin: `${c.origin_city}, ${c.origin_state}`,
            rawDestination: `${c.destination_city}, ${c.destination_state}`,
            baseRate: c.base_rate,
            equipment: c.equipment,
            serviceType: c.service_type,
            miles: c.miles,
            status: c.status as any,
            activeState: c.active_state as any,
            effectiveDate: c.effective_date,
            expirationDate: c.expiration_date,
            reviewDate: c.expiration_date,
            fuelSurchargePercent: c.fuel_surcharge_percent,
            fuelAmount: c.fuel_amount,
            totalBilling: c.total_billing,
            accessorials: [],
            carrierTargetMatch: { targetAmount: c.base_rate, matchPercent: 100, nearestLane: '' },
            rateHistory: [],
            recommendedCarriers: []
          })));
        }
      } catch (err) {
        console.info("Running in standalone demo mode with default dataset.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Modal States
  const [adjustItem, setAdjustItem] = useState<LaneException | MarketSummary | CustomerRateLane | null>(null);
  const [mapIssue, setMapIssue] = useState<ValidationIssue | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showReportsModal, setShowReportsModal] = useState<boolean>(false);

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
    
    let adjustedItemTitle = 'Lane Adjustment';

    try {
      const isException = laneExceptions.some(e => e.id === id);
      if (isException) {
        const exc = laneExceptions.find(e => e.id === id);
        if (exc) {
          if (!(exc.isKeyAccount && excludeKeyAccounts)) {
             const newVar = Math.round(exc.avgActual - target);
             const newVarPct = Math.round((newVar / target) * 1000) / 10;
             await supabase.from('lane_exceptions').update({
               current_target: target,
               var_dollars: newVar,
               var_percent: newVarPct,
               adjustment_status: 'Adjusted',
               last_adjusted_target: target,
               adjusted_date: new Date().toISOString().split('T')[0],
               adjusted_notes: notes
             }).eq('id', id);
          }
        }
      }

      const matchingMarket = markets.find((m) => m.id === id);
      if (matchingMarket) {
         const newVar = Math.round(matchingMarket.avgActual - target);
         const newVarPct = Math.round((newVar / target) * 1000) / 10;
         await supabase.from('market_summaries').update({
           avg_target: target,
           variance_dollars: newVar,
           variance_percent: newVarPct
         }).eq('id', id);
      }

      const matchingLane = customerLanes.find(l => l.id === id);
      if (matchingLane) {
        await supabase.from('customer_rate_lanes').update({
           base_rate: target,
           total_billing: Math.round((target * (1 + matchingLane.fuelSurchargePercent / 100)) * 100) / 100
        }).eq('id', id);
      // Insert adjustment using new table name
      await supabase.from('pricing_adjustments').insert([{
        title: `Lane Adjustment (${changePercent >= 0 ? '+' : ''}${changePercent}%)`,
        change_percent: changePercent,
        status: 'Scheduled',
        effective_date: new Date().toISOString(),
        notes: `Adjusted based on target mapping to ${target}`
      }]);
      }
    } catch (err) {
      console.error('Error saving adjustment to Supabase:', err);
    }


    // Update lane exception if matching
    setLaneExceptions((prev) =>
      prev.map((exc) => {
        if (exc.id === id) {
          adjustedItemTitle = `${exc.origin} → ${exc.destination}`;
          if (exc.isKeyAccount && excludeKeyAccounts) {
            // Key volume account target adjustment excluded to preserve lower contracted rate
            return {
              ...exc,
              adjustmentStatus: 'Adjusted',
              adjustedNotes: `${notes} [Key Volume Account Excluded - Locked Contract Rate $${exc.currentTarget} Preserved]`
            };
          }
          const newVar = Math.round(exc.avgActual - target);
          const newVarPct = Math.round((newVar / target) * 1000) / 10;
          return {
            ...exc,
            currentTarget: target,
            varDollars: newVar,
            varPercent: newVarPct,
            adjustmentStatus: 'Adjusted',
            lastAdjustedTarget: target,
            adjustedDate: new Date().toLocaleDateString('en-US'),
            adjustedNotes: notes
          };
        }
        return exc;
      })
    );

    // Update market if matching
    const matchingMarket = markets.find((m) => m.id === id);
    if (matchingMarket) {
      adjustedItemTitle = `${matchingMarket.name} Market`;
      setLaneExceptions((prev) =>
        prev.map((exc) => {
          if (exc.market === matchingMarket.region) {
            if (exc.isKeyAccount && excludeKeyAccounts) {
              // Bypassed key contracted account to preserve lower 1-year contract rate
              return {
                ...exc,
                adjustedNotes: `${notes} [Bypassed for Key Volume Account - Contract Rate $${exc.currentTarget} Locked]`
              };
            }
            const newVar = Math.round(exc.avgActual - target);
            const newVarPct = Math.round((newVar / target) * 1000) / 10;
            return {
              ...exc,
              currentTarget: target,
              varDollars: newVar,
              varPercent: newVarPct,
              adjustmentStatus: 'Adjusted',
              lastAdjustedTarget: target,
              adjustedDate: new Date().toLocaleDateString('en-US'),
              adjustedNotes: notes
            };
          }
          return exc;
        })
      );
    }

    setMarkets((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newVar = Math.round(m.avgActual - target);
          const newVarPct = Math.round((newVar / target) * 1000) / 10;
          return {
            ...m,
            avgTarget: target,
            varianceDollars: newVar,
            variancePercent: newVarPct
          };
        }
        return m;
      })
    );

    // Update customer lane if matching
    setCustomerLanes((prev) =>
      prev.map((lane) => {
        if (lane.id === id) {
          adjustedItemTitle = `${lane.customerName}: ${lane.originCity} → ${lane.destinationCity}`;
          return {
            ...lane,
            baseRate: target,
            totalBilling: Math.round((target * (1 + lane.fuelSurchargePercent / 100)) * 100) / 100
          };
        }
        return lane;
      })
    );

    // Also record planned adjustment
    setPlannedAdjustments((prev) => [
      {
        id: `adj-${Date.now()}`,
        type: 'Pricing Adjustment',
        title: `${adjustedItemTitle} (${changePercent >= 0 ? '+' : ''}${changePercent}%)`,
        changePercent,
        status: 'Active',
        effectiveDate: new Date().toLocaleDateString('en-US'),
        notes: notes || 'Target rate adjustment submitted by pricing analyst.'
      },
      ...prev
    ]);
  };

  const handleResolveMapIssue = (issueId: string, mappedValue: string) => {
    setValidationIssues((prev) =>
      prev.map((iss) => (iss.id === issueId ? { ...iss, resolved: true, suggestedValue: mappedValue } : iss))
    );
  };

  const handleAddPlannedAdjustment = (adj: PlannedAdjustment) => {
    setPlannedAdjustments((prev) => [adj, ...prev]);
  };

  const handleCommitDataChanges = async () => {
    // Commit staged data updates into active rate lanes & control tower exceptions
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

    setCustomerLanes((prev) => [newLane1, newLane2, ...prev]);

    try {
      await supabase.from('customer_rate_lanes').insert([
        {
          lane_id: newLane1.laneId,
          customer_name: newLane1.customerName,
          origin_city: newLane1.originCity,
          origin_state: newLane1.originState,
          destination_city: newLane1.destinationCity,
          destination_state: newLane1.destinationState,
          base_rate: newLane1.baseRate,
          equipment: newLane1.equipment,
          service_type: newLane1.serviceType,
          miles: newLane1.miles,
          status: newLane1.status,
          active_state: newLane1.activeState,
          effective_date: newLane1.effectiveDate,
          expiration_date: newLane1.expirationDate,
          fuel_surcharge_percent: newLane1.fuelSurchargePercent,
          fuel_amount: newLane1.fuelAmount,
          total_billing: newLane1.totalBilling
        },
        {
          lane_id: newLane2.laneId,
          customer_name: newLane2.customerName,
          origin_city: newLane2.originCity,
          origin_state: newLane2.originState,
          destination_city: newLane2.destinationCity,
          destination_state: newLane2.destinationState,
          base_rate: newLane2.baseRate,
          equipment: newLane2.equipment,
          service_type: newLane2.serviceType,
          miles: newLane2.miles,
          status: newLane2.status,
          active_state: newLane2.activeState,
          effective_date: newLane2.effectiveDate,
          expiration_date: newLane2.expirationDate,
          fuel_surcharge_percent: newLane2.fuelSurchargePercent,
          fuel_amount: newLane2.fuelAmount,
          total_billing: newLane2.totalBilling
        }
      ]);
    } catch (err) {
      console.error('Error committing changes to Supabase:', err);
    }


    // Also add to lane exceptions in Control Tower
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

    setLaneExceptions((prev) => [newExc1, newExc2, ...prev]);

    // Update datasets state
    setDatasets((prev) =>
      prev.map((ds) => ({
        ...ds,
        recordsCount: ds.recordsCount + 2,
        lastUpload: `Committed ${new Date().toLocaleDateString('en-US')} by Pricing Ops`,
        status: 'Active / Updated'
      }))
    );

    setValidationIssues((prev) => prev.map((i) => ({ ...i, resolved: true })));
    alert('Validation staging preview committed successfully! Staged rate lanes added to Master Rate Directory and Control Tower.');
  };

  const handleDiscardDataChanges = () => {
    // Staging discarded notification handled with clean in-app toast feedback inside DataManagement
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

  const handleAddCustomer = (cust: { name: string; code: string }) => {
    const newLane: CustomerRateLane = {
      id: `lane-cust-${Date.now()}`,
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
    setCustomerLanes((prev) => [newLane, ...prev]);
  };

  const handleAddLane = (newLane: CustomerRateLane) => {
    setCustomerLanes((prev) => [newLane, ...prev]);
  };

  const handleBypass = (persona: DevPersona, initialTab?: ActiveTab) => {
    setCurrentUser(persona);
    setTeamContext(persona.teamContext);
    if (initialTab) {
      setActiveTab(initialTab);
    }
    try {
      sessionStorage.setItem('pricing_hub_dev_bypass_persona', JSON.stringify(persona));
    } catch (e) {}
  };

  const handleLoginSuccess = (email?: string) => {
    const userEmail = email || 'analyst@forrestlogistics.com';
    const userPersona: DevPersona = {
      id: `usr-${Date.now()}`,
      name: userEmail.split('@')[0],
      email: userEmail,
      role: 'Pricing Analyst',
      teamContext: 'Pricing Team',
      avatarInitials: userEmail.substring(0, 2).toUpperCase(),
      avatarColor: '#1769FF',
      description: 'Authenticated via Supabase'
    };
    setCurrentUser(userPersona);
    setTeamContext('Pricing Team');
    try {
      sessionStorage.setItem('pricing_hub_dev_bypass_persona', JSON.stringify(userPersona));
    } catch (e) {}
  };

  const handleSignOut = () => {
    try {
      sessionStorage.removeItem('pricing_hub_dev_bypass_persona');
    } catch (e) {}
    setCurrentUser(null);
    setSession(null);
    supabase.auth.signOut().catch((err) => {
      console.info('Sign out error:', err);
    });
  };

  const handleSwitchPersona = () => {
    try {
      sessionStorage.removeItem('pricing_hub_dev_bypass_persona');
    } catch (e) {}
    setCurrentUser(null);
  };


  // If not authenticated and dev bypass not active, show Login with Dev Bypass Screen
  if (!currentUser && !session) {
    return <Login onBypass={handleBypass} onLoginSuccess={handleLoginSuccess} />;
  }

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
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onSwitchPersona={handleSwitchPersona}
      />

      {/* Primary Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Persistent Operational Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenReports={() => setShowReportsModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          teamContext={teamContext}
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
              onUploadData={() => setActiveTab('data_management')}
              onExportTargets={handleExportTargets}
              searchQuery={searchQuery}
              teamContext={teamContext}
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
              customersList={Array.from(new Set(customerLanes.map((l) => l.customerName)))}
              onAddCustomer={handleAddCustomer}
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
    </div>
  );
}
