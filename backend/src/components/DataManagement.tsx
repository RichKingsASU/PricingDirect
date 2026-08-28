import React, { useState } from 'react';
import { DatasetItem, ValidationIssue, ChassisScheduleRecord, FuelScaleBracket, RecommendedCarrierRecord } from '../types';
import { initialRecommendedCarriers, matchCarriersByOrigin, CarrierMatchResult } from '../data/recommendedCarriersData';

export interface WorkingTemplate {
  id: string;
  name: string;
  filename: string;
  description: string;
  category: string;
  columns: string[];
  sampleRows: Record<string, string | number>[];
}

export const WORKING_TEMPLATES: WorkingTemplate[] = [
  {
    id: 'tpl-weekly-load-data',
    name: 'Weekly Load Data (Actual Carrier Pay File)',
    filename: 'Weekly_Load_Data_Template.csv',
    description: 'Weekly operational load export format with actual carrier pay, pickup/drop locations, SCACs, and move types for city consolidation & target analytics.',
    category: 'Weekly Load Analytics',
    columns: [
      'ld_num',
      'so_num',
      'acct_mgr_name',
      'mbl',
      'container_number',
      'container_description',
      'chassis_number',
      'chassis_type',
      'status',
      'SteamshipLine',
      'item_description',
      'work_order',
      'line_of_business',
      'move_id_type',
      'zero_rev',
      'miles',
      'true_miles',
      'one_way_miles',
      'one_way_flag',
      'weight',
      'service_description',
      'owner',
      'carrier_name',
      'carrier_scac',
      'pickup_loc_name',
      'pickup_loc_AddrLine1',
      'pickup_loc_City',
      'pickup_loc_StateProvince',
      'pickup_loc_PostalCode',
      'pickup_region',
      'drop_loc_name',
      'drop_loc_AddrLine1',
      'drop_loc_City',
      'drop_loc_StateProvince',
      'drop_loc_PostalCode',
      'drop_region',
      'createDate',
      'pickup_actual_date',
      'drop_actual_date',
      'actual_rc_date',
      'CARRIER LH + FSC + SURGE'
    ],
    sampleRows: [
      {
        ld_num: 'LD524883',
        so_num: '14144410',
        acct_mgr_name: 'Drayage Ops',
        mbl: 'OOLU21049281',
        container_number: 'OOLU9821034',
        status: 'COMPLETE',
        SteamshipLine: 'OOCL',
        carrier_name: 'JED LOGISTICS INC',
        carrier_scac: 'JEDL',
        pickup_loc_name: 'APM Terminal',
        pickup_loc_City: 'SAN PEDRO',
        pickup_loc_StateProvince: 'CA',
        pickup_region: 'SW',
        drop_loc_name: 'Amazon LAS1',
        drop_loc_City: 'HENDERSON',
        drop_loc_StateProvince: 'NV',
        drop_region: 'SW',
        'CARRIER LH + FSC + SURGE': 1700
      },
      {
        ld_num: 'LD541327',
        so_num: '14155920',
        acct_mgr_name: 'Drayage Ops',
        mbl: 'MSCU88120491',
        container_number: 'MSCU4410293',
        status: 'COMPLETE',
        SteamshipLine: 'MSC',
        carrier_name: 'FLAT-LINE XPRESS LLC',
        carrier_scac: 'FLXP',
        pickup_loc_name: 'OICT SSA Terminal',
        pickup_loc_City: 'OAKLAND',
        pickup_loc_StateProvince: 'CA',
        pickup_region: 'NW',
        drop_loc_name: 'Amazon TCY2',
        drop_loc_City: 'STOCKTON',
        drop_loc_StateProvince: 'CA',
        drop_region: 'NW',
        'CARRIER LH + FSC + SURGE': 885
      }
    ]
  },
  {
    id: 'tpl-target-rates',
    name: 'Target Rates & Contract Benchmark',
    filename: 'Target_Rates_Import_Template.csv',
    description: 'Master template for updating baseline target rates, RPMs, and carrier contract matches across lanes.',
    category: 'Rate Management',
    columns: [
      'Origin_City',
      'Origin_State',
      'Origin_Zip',
      'Destination_City',
      'Destination_State',
      'Destination_Zip',
      'Equipment_Type',
      'Target_Base_Rate_USD',
      'Target_RPM_USD',
      'Effective_Date',
      'Expiration_Date',
      'Preferred_Carrier_SCAC',
      'Mode'
    ],
    sampleRows: [
      {
        Origin_City: 'Seattle',
        Origin_State: 'WA',
        Origin_Zip: '98101',
        Destination_City: 'Los Angeles',
        Destination_State: 'CA',
        Destination_Zip: '90001',
        Equipment_Type: 'Dry Van',
        Target_Base_Rate_USD: 2450,
        Target_RPM_USD: 2.15,
        Effective_Date: '2026-07-01',
        Expiration_Date: '2027-06-30',
        Preferred_Carrier_SCAC: 'SWFT',
        Mode: 'Truckload'
      },
      {
        Origin_City: 'Portland',
        Origin_State: 'OR',
        Origin_Zip: '97201',
        Destination_City: 'Oakland',
        Destination_State: 'CA',
        Destination_Zip: '94601',
        Equipment_Type: 'Reefer',
        Target_Base_Rate_USD: 1850,
        Target_RPM_USD: 2.80,
        Effective_Date: '2026-07-01',
        Expiration_Date: '2027-06-30',
        Preferred_Carrier_SCAC: 'JBHU',
        Mode: 'Truckload'
      },
      {
        Origin_City: 'Chicago',
        Origin_State: 'IL',
        Origin_Zip: '60601',
        Destination_City: 'New York',
        Destination_State: 'NY',
        Destination_Zip: '10001',
        Equipment_Type: 'Dry Van',
        Target_Base_Rate_USD: 2800,
        Target_RPM_USD: 3.50,
        Effective_Date: '2026-07-01',
        Expiration_Date: '2027-06-30',
        Preferred_Carrier_SCAC: 'SNDR',
        Mode: 'Truckload'
      },
      {
        Origin_City: 'Dallas',
        Origin_State: 'TX',
        Origin_Zip: '75201',
        Destination_City: 'Houston',
        Destination_State: 'TX',
        Destination_Zip: '77001',
        Equipment_Type: 'Flatbed',
        Target_Base_Rate_USD: 950,
        Target_RPM_USD: 3.95,
        Effective_Date: '2026-07-01',
        Expiration_Date: '2027-06-30',
        Preferred_Carrier_SCAC: 'KNIG',
        Mode: 'Truckload'
      },
      {
        Origin_City: 'Atlanta',
        Origin_State: 'GA',
        Origin_Zip: '30301',
        Destination_City: 'Miami',
        Destination_State: 'FL',
        Destination_Zip: '33101',
        Equipment_Type: 'Dry Van',
        Target_Base_Rate_USD: 1980,
        Target_RPM_USD: 2.98,
        Effective_Date: '2026-07-01',
        Expiration_Date: '2027-06-30',
        Preferred_Carrier_SCAC: 'WERN',
        Mode: 'Truckload'
      }
    ]
  },
  {
    id: 'tpl-fuel-surcharge',
    name: 'Forrest Fuel Scale (Standard DOE Matrix)',
    filename: 'Forrest_Fuel_Surcharge_Scale_Template.csv',
    description: 'Primary operational fuel scale for Forrest Logistics. DOE national diesel index price brackets, percentage surcharges, and flat per-mile adjustments.',
    category: 'Fuel & Indexing',
    columns: [
      'DOE_Diesel_Min_USD',
      'DOE_Diesel_Max_USD',
      'FSC_Percentage',
      'FSC_Flat_Per_Mile_USD',
      'Effective_Date',
      'Expiration_Date',
      'Notes'
    ],
    sampleRows: [
      {
        DOE_Diesel_Min_USD: 3.50,
        DOE_Diesel_Max_USD: 3.599,
        FSC_Percentage: '14.5%',
        FSC_Flat_Per_Mile_USD: 0.38,
        Effective_Date: '2026-07-01',
        Expiration_Date: '2026-12-31',
        Notes: 'Standard DOE National Average Bracket'
      },
      {
        DOE_Diesel_Min_USD: 3.60,
        DOE_Diesel_Max_USD: 3.699,
        FSC_Percentage: '15.0%',
        FSC_Flat_Per_Mile_USD: 0.40,
        Effective_Date: '2026-07-01',
        Expiration_Date: '2026-12-31',
        Notes: 'Standard DOE National Average Bracket'
      },
      {
        DOE_Diesel_Min_USD: 3.70,
        DOE_Diesel_Max_USD: 3.799,
        FSC_Percentage: '15.5%',
        FSC_Flat_Per_Mile_USD: 0.42,
        Effective_Date: '2026-07-01',
        Expiration_Date: '2026-12-31',
        Notes: 'Standard DOE National Average Bracket'
      },
      {
        DOE_Diesel_Min_USD: 3.80,
        DOE_Diesel_Max_USD: 3.899,
        FSC_Percentage: '16.0%',
        FSC_Flat_Per_Mile_USD: 0.44,
        Effective_Date: '2026-07-01',
        Expiration_Date: '2026-12-31',
        Notes: 'Standard DOE National Average Bracket'
      }
    ]
  },
  {
    id: 'tpl-accessorial-benchmarks',
    name: 'Customer Accessorial Tariffs & Charge Schedule',
    filename: 'Customer_Accessorial_Schedule_Template.csv',
    description: 'Standardized customer accessorial charge tariffs: Bobtail, Chassis Split, Driver Detention, Pre-Pull, Dry Run, Hazmat, Pier Pass, Yard Storage, Overweight, Exam Site Drayage, Redelivery, Bond Fee, etc.',
    category: 'Surcharges & Accessorials',
    columns: [
      'Customer',
      'Charge',
      'Rate',
      'Unit',
      'Free Qty',
      'Free Unit',
      'Context',
      'Lane Scope',
      'Notes'
    ],
    sampleRows: [
      {
        Customer: 'Amazon Logistics, Inc.',
        Charge: 'Bobtail',
        Rate: '70% of LH',
        Unit: '% of linehaul',
        'Free Qty': '',
        'Free Unit': '',
        Context: 'Port · LA/LB',
        'Lane Scope': 'All lanes',
        Notes: 'Port: USLAX, USLGB'
      },
      {
        Customer: 'Amazon Logistics, Inc.',
        Charge: 'Chassis Split',
        Rate: '$91.00',
        Unit: 'Per move',
        'Free Qty': '',
        'Free Unit': '',
        Context: 'Port · LA/LB',
        'Lane Scope': 'All lanes',
        Notes: 'Port: USLAX, USLGB'
      },
      {
        Customer: 'Amazon Logistics, Inc.',
        Charge: 'Chassis (Pool of Pools)',
        Rate: '$35.00',
        Unit: 'Per day',
        'Free Qty': '',
        'Free Unit': '',
        Context: 'Port · DALLAS',
        'Lane Scope': 'All lanes',
        Notes: 'Prior approval required · Pool of Pools chassis'
      },
      {
        Customer: 'Amazon Logistics, Inc.',
        Charge: 'Pre-Pull',
        Rate: '$94.00',
        Unit: 'Per move',
        'Free Qty': '',
        'Free Unit': '',
        Context: 'Port · LA/LB',
        'Lane Scope': 'All lanes',
        Notes: 'Port: USLAX, USLGB'
      },
      {
        Customer: 'Amazon Logistics, Inc.',
        Charge: 'Port Waiting Time',
        Rate: '$80.00',
        Unit: 'Per hour',
        'Free Qty': '2',
        'Free Unit': 'hour',
        Context: 'Port · LA/LB',
        'Lane Scope': 'All lanes',
        Notes: 'Port: USLAX, USLGB · 2 hrs free time'
      },
      {
        Customer: 'Amazon Logistics, Inc.',
        Charge: 'Dry Run',
        Rate: '50% of LH',
        Unit: '% of linehaul',
        'Free Qty': '',
        'Free Unit': '',
        Context: 'Port · LA/LB',
        'Lane Scope': 'All lanes',
        Notes: 'Applies to driver dry runs at terminal'
      },
      {
        Customer: 'Amazon Logistics, Inc.',
        Charge: 'Hazmat',
        Rate: '$129.00',
        Unit: 'Per move',
        'Free Qty': '',
        'Free Unit': '',
        Context: 'Port · LA/LB',
        'Lane Scope': 'All lanes',
        Notes: 'Hazardous material drayage fee'
      },
      {
        Customer: 'Amazon Logistics, Inc.',
        Charge: 'Exam Site Drayage',
        Rate: '$94.00',
        Unit: 'Per move',
        'Free Qty': '',
        'Free Unit': '',
        Context: 'Port · LA/LB',
        'Lane Scope': 'All lanes',
        Notes: 'Customs or USDA exam site drayage'
      },
      {
        Customer: 'Amazon Logistics, Inc.',
        Charge: 'Yard Storage',
        Rate: '$32.00',
        Unit: 'Per day',
        'Free Qty': '1',
        'Free Unit': 'day',
        Context: 'Port · LA/LB',
        'Lane Scope': 'All lanes',
        Notes: '1 day free yard storage included'
      },
      {
        Customer: 'JF Hillebrand- WC',
        Charge: 'Congestion',
        Rate: '$150.00',
        Unit: 'Per move',
        'Free Qty': '',
        'Free Unit': '',
        Context: 'All Ports',
        'Lane Scope': 'All lanes',
        Notes: 'Excessive waiting time at port or ramp'
      },
      {
        Customer: 'Dollar Tree',
        Charge: 'Pier Pass Admin',
        Rate: '$5.00',
        Unit: 'Per move',
        'Free Qty': '',
        'Free Unit': '',
        Context: 'Port · LA/LB',
        'Lane Scope': 'All lanes',
        Notes: 'Pier Pass / Clean Truck Admin fee'
      },
      {
        Customer: 'LKQ CORPORATION',
        Charge: 'Detention - Warehouse',
        Rate: '$50.00',
        Unit: 'Per hour',
        'Free Qty': '2',
        'Free Unit': 'hour',
        Context: 'Warehouse',
        'Lane Scope': 'All lanes',
        Notes: 'In and out POD timestamps required for approval'
      }
    ]
  },
  {
    id: 'tpl-city-geography',
    name: 'City Standardization & Market Mapping',
    filename: 'City_Geography_Mapping_Template.csv',
    description: 'Raw city variant mappings to target regional markets, state codes, and FIPS zones.',
    category: 'Geography & Networks',
    columns: [
      'Raw_Location_Input',
      'Standardized_City',
      'Standardized_State',
      'Standard_FIPS',
      'Regional_Market_Code',
      'Primary_Zone'
    ],
    sampleRows: [
      {
        Raw_Location_Input: 'LAX Port Hub',
        Standardized_City: 'Los Angeles',
        Standardized_State: 'CA',
        Standard_FIPS: '06037',
        Regional_Market_Code: 'SW',
        Primary_Zone: 'Pacific SoCal'
      },
      {
        Raw_Location_Input: 'Oakland Pier 3',
        Standardized_City: 'Oakland',
        Standardized_State: 'CA',
        Standard_FIPS: '06001',
        Regional_Market_Code: 'NW',
        Primary_Zone: 'Pacific NorCal'
      },
      {
        Raw_Location_Input: 'NYC Metro Depot',
        Standardized_City: 'New York',
        Standardized_State: 'NY',
        Standard_FIPS: '36061',
        Regional_Market_Code: 'NE',
        Primary_Zone: 'Tristate'
      },
      {
        Raw_Location_Input: 'DFW Logistics Hub',
        Standardized_City: 'Dallas',
        Standardized_State: 'TX',
        Standard_FIPS: '48113',
        Regional_Market_Code: 'SE',
        Primary_Zone: 'South Central'
      }
    ]
  },
  {
    id: 'tpl-carrier-allocation',
    name: 'Carrier Allocation & Target Matrix',
    filename: 'Carrier_Target_Allocation_Template.csv',
    description: 'Carrier target volume allocation percentages, performance tiers, and RPM guidelines.',
    category: 'Carrier Management',
    columns: [
      'Carrier_SCAC',
      'Carrier_Name',
      'Target_Market',
      'Allocated_Share_Pct',
      'Target_RPM_USD',
      'Performance_Tier',
      'Status'
    ],
    sampleRows: [
      {
        Carrier_SCAC: 'SWFT',
        Carrier_Name: 'Swift Transportation',
        Target_Market: 'NW',
        Allocated_Share_Pct: '28%',
        Target_RPM_USD: 2.20,
        Performance_Tier: 'Tier 1 Preferred',
        Status: 'Active'
      },
      {
        Carrier_SCAC: 'JBHU',
        Carrier_Name: 'J.B. Hunt Transport',
        Target_Market: 'SW',
        Allocated_Share_Pct: '32%',
        Target_RPM_USD: 2.45,
        Performance_Tier: 'Tier 1 Preferred',
        Status: 'Active'
      },
      {
        Carrier_SCAC: 'SNDR',
        Carrier_Name: 'Schneider National',
        Target_Market: 'NE',
        Allocated_Share_Pct: '25%',
        Target_RPM_USD: 3.10,
        Performance_Tier: 'Tier 2 Approved',
        Status: 'Active'
      },
      {
        Carrier_SCAC: 'KNIG',
        Carrier_Name: 'Knight Transportation',
        Target_Market: 'SE',
        Allocated_Share_Pct: '22%',
        Target_RPM_USD: 2.65,
        Performance_Tier: 'Tier 1 Preferred',
        Status: 'Active'
      }
    ]
  },
  {
    id: 'tpl-chassis-demurrage',
    name: 'Customer Regional Chassis Schedule',
    filename: 'Customer_Chassis_Schedule_Template.csv',
    description: 'Master regional chassis schedule matrix: Chassis Type, Flag (Billable/Not Billable), Free Days, and Regional Daily Rates (NE, NW, SE, SW).',
    category: 'Chassis & Port Operations',
    columns: [
      'CUSTOMER',
      'Chassis_Type',
      'FLAG',
      'FREEDAYS',
      'NE',
      'NW',
      'SE',
      'SW',
      'All-in Rate',
      'Agreement',
      'Notes'
    ],
    sampleRows: [
      {
        CUSTOMER: 'CMA CGM',
        Chassis_Type: 'POOL',
        FLAG: 'NOT BILLABLE',
        FREEDAYS: 0,
        NE: '$ -',
        NW: '$ -',
        SE: '$ -',
        SW: '$ -',
        'All-in Rate': '',
        Agreement: 'Y',
        Notes: 'Standard carrier pool chassis'
      },
      {
        CUSTOMER: 'CMA CGM',
        Chassis_Type: 'PRIVATE',
        FLAG: 'BILLABLE',
        FREEDAYS: 0,
        NE: '$ -',
        NW: '$ 40.00',
        SE: '',
        SW: '$ 40.00',
        'All-in Rate': '',
        Agreement: '',
        Notes: 'NW & SW Private Fleet daily charge'
      },
      {
        CUSTOMER: 'CMA CGM',
        Chassis_Type: 'TRIAXLE',
        FLAG: 'BILLABLE',
        FREEDAYS: 0,
        NE: '$ -',
        NW: '$ 85.00',
        SE: '',
        SW: '$ 85.00',
        'All-in Rate': '',
        Agreement: '',
        Notes: 'Heavy-haul triaxle chassis position'
      },
      {
        CUSTOMER: 'Amazon Logistics, Inc.',
        Chassis_Type: 'PRIVATE',
        FLAG: 'BILLABLE',
        FREEDAYS: 2,
        NE: '$ 38.00',
        NW: '$ 42.50',
        SE: '$ 35.00',
        SW: '$ 45.00',
        'All-in Rate': '$ 40.00',
        Agreement: 'Y',
        Notes: 'Contractual daily chassis fee'
      }
    ]
  },
  {
    id: 'tpl-recommended-carriers',
    name: 'Recommended Carriers Capacity Network',
    filename: 'Recommended_Carriers_Template.csv',
    description: 'Master list of recommended carriers matched by Home State with lane origins. Contains DOT#, Carrier Name, Truck Count, 2026 Loads Hauled, Home State, and Region.',
    category: 'Carrier Procurement',
    columns: [
      'DOT#',
      'Carrier Name',
      'Truck Count',
      'Loads Hauled in 2026',
      'Home State',
      'Region',
      'Notes / Dettached?'
    ],
    sampleRows: [
      {
        'DOT#': '3230946',
        'Carrier Name': 'Alliance Worldwide Logistics Corp',
        'Truck Count': 15,
        'Loads Hauled in 2026': 1029,
        'Home State': 'PA',
        'Region': 'East',
        'Notes / Dettached?': ''
      },
      {
        'DOT#': '2406445',
        'Carrier Name': 'Pacific Freight Logistics Inc',
        'Truck Count': 3,
        'Loads Hauled in 2026': 459,
        'Home State': 'CA',
        'Region': 'PSW',
        'Notes / Dettached?': ''
      },
      {
        'DOT#': '4455185',
        'Carrier Name': "Brosky's Trucking Inc",
        'Truck Count': 3,
        'Loads Hauled in 2026': 306,
        'Home State': 'CA',
        'Region': 'PSW',
        'Notes / Dettached?': ''
      },
      {
        'DOT#': '3412021',
        'Carrier Name': 'Amaral Transport LLC',
        'Truck Count': 1,
        'Loads Hauled in 2026': 274,
        'Home State': 'CA',
        'Region': 'PSW',
        'Notes / Dettached?': ''
      },
      {
        'DOT#': '3978741',
        'Carrier Name': 'Pacific Merchant Transport LLC',
        'Truck Count': 1,
        'Loads Hauled in 2026': 255,
        'Home State': 'CA',
        'Region': 'PSW',
        'Notes / Dettached?': ''
      },
      {
        'DOT#': '3678443',
        'Carrier Name': 'J Barbas Trucking',
        'Truck Count': 1,
        'Loads Hauled in 2026': 244,
        'Home State': 'CA',
        'Region': 'PSW',
        'Notes / Dettached?': ''
      },
      {
        'DOT#': '2596940',
        'Carrier Name': 'All Harbor Transport LLC',
        'Truck Count': 15,
        'Loads Hauled in 2026': 239,
        'Home State': 'CA',
        'Region': 'PSW',
        'Notes / Dettached?': ''
      },
      {
        'DOT#': '3724537',
        'Carrier Name': 'Trokiando Transportation Inc',
        'Truck Count': 2,
        'Loads Hauled in 2026': 238,
        'Home State': 'CA',
        'Region': 'PNW',
        'Notes / Dettached?': ''
      },
      {
        'DOT#': '695042',
        'Carrier Name': 'Sun Pacific Trucking',
        'Truck Count': 29,
        'Loads Hauled in 2026': 189,
        'Home State': 'CA',
        'Region': 'PSW',
        'Notes / Dettached?': ''
      },
      {
        'DOT#': '3473188',
        'Carrier Name': 'Flat-line Xpress LLC',
        'Truck Count': 1,
        'Loads Hauled in 2026': 188,
        'Home State': 'AZ',
        'Region': 'PSW',
        'Notes / Dettached?': ''
      },
      {
        'DOT#': '3020721',
        'Carrier Name': 'Anajo Enterprise LLC',
        'Truck Count': 1,
        'Loads Hauled in 2026': 108,
        'Home State': 'WA',
        'Region': 'PNW',
        'Notes / Dettached?': ''
      },
      {
        'DOT#': '2058994',
        'Carrier Name': 'Big Boss Transportation LLC',
        'Truck Count': 3,
        'Loads Hauled in 2026': 124,
        'Home State': 'GA',
        'Region': 'East',
        'Notes / Dettached?': ''
      },
      {
        'DOT#': '548880',
        'Carrier Name': 'Cowan Systems, LLC',
        'Truck Count': 1882,
        'Loads Hauled in 2026': 18,
        'Home State': 'MD',
        'Region': 'East',
        'Notes / Dettached?': ''
      },
      {
        'DOT#': '3333244',
        'Carrier Name': 'Forrest Transportation LLC',
        'Truck Count': 22,
        'Loads Hauled in 2026': 12,
        'Home State': 'AZ',
        'Region': 'PSW',
        'Notes / Dettached?': 'Preferred Fleet'
      }
    ]
  }
];

export const STANDARD_ACCESSORIAL_CHARGES = [
  'Bobtail',
  'Bobtail (100> miles)',
  'Bobtail (50<100 miles)',
  'Bobtail <50 miles',
  'Bolt Seal',
  'Bond Fee',
  'Chassis (Pool of Pools)',
  'Chassis Lift/Flip',
  'Chassis Split',
  'Chassis Split - Returns',
  'Congestion',
  'CTF (Clean Truck Fee)',
  'Dest Delivery Chassis Lease',
  'Destination Delivery FC',
  'Detention',
  'Detention - Warehouse',
  'Driver Detention',
  'Dry Run',
  'Dry Run - Pomona',
  'Dry Run At Port',
  'Dry Run to Port',
  'Exam Site Drayage',
  'Flip - BNSF',
  'Flip - UP',
  'Fumigation',
  'Gate Fee',
  'Genset/ Reefer Surcharge',
  'Hazmat',
  'Layover',
  'Overweight',
  'Overweight Fees',
  'Overweight Permit',
  'Peak Surcharge',
  'Pier Pass',
  'Pier Pass Admin',
  'Placarding (Haz)',
  'Port Check',
  'Port Waiting Time',
  'Port-ramp Tolls',
  'Pre-Pull',
  'Pre-Pull - 1st Leg',
  'Pre-Pull Rail',
  'Rail Flip Fee',
  'Rail Pre-Pull',
  'Redelivery',
  'Reefer Storage',
  'Round Trip',
  'Scale',
  'Stop in Transit',
  'Stop Off / Stop Off Charge',
  'Tank Endorsement',
  'TMF Pier Pass - 20ft',
  'TMF Pier Pass - 40ft',
  'Truckyard Dry Container Storage',
  'Truckyard Reefer Storage',
  'Vinliner Disposal',
  'Vinliner Fitting',
  'Wait Time - Warehouse',
  'Yard Storage'
];

export interface StagedAccessorial {
  id: string;
  customerAccount: string;
  chargeType: string;
  rate: string;
  unit: string;
  freeQty?: string;
  freeUnit?: string;
  context?: string;
  laneScope?: string;
  notes?: string;
  status: 'Verified' | 'Mapped' | 'Needs Review';
}

interface StagedRecord {
  id: string;
  rowNumber: number;
  customerAccount: string;
  effectiveDate: string;
  expirationDate: string;
  origin: string;
  destination: string;
  rate: string;
  equipment: string;
  serviceType: string;
  fuelScale: string;
  freeDetentionHours: string;
  detentionRate: string;
  chassisFreeDays: string;
  chassisSplitFee: string;
  chassisDailyRate: string;
  demurrageFreeDays: string;
  status: 'Verified' | 'Mapped' | 'Needs Review';
}

interface DataManagementProps {
  datasets: DatasetItem[];
  validationIssues: ValidationIssue[];
  onOpenMapManual: (issue: ValidationIssue) => void;
  onCommitChanges: () => void;
  onDiscardChanges: () => void;
  onUploadFileSimulated: (filename: string) => void;
  customersList?: string[];
  onAddCustomer?: (customer: { name: string; code: string }) => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  datasets,
  validationIssues,
  onOpenMapManual,
  onCommitChanges,
  onDiscardChanges,
  onUploadFileSimulated,
  customersList = [
    'Amazon Logistics, Inc.',
    'Walmart Distribution',
    'Home Depot Ops',
    'Target Fulfillment',
    'Ross Stores, Inc.',
    'Dollar Tree Distribution Inc',
    'Discount Tire',
    'FedEx Ground'
  ],
  onAddCustomer
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'import' | 'templates' | 'carrier_matching'>('import');
  const [fileName, setFileName] = useState('Q3_Lanes_Update_v2');
  const [selectedCustomer, setSelectedCustomer] = useState('Amazon Logistics, Inc.');
  const [effectiveDate, setEffectiveDate] = useState('2026-07-01');
  const [expirationDate, setExpirationDate] = useState('2027-06-30');
  const [importMode, setImportMode] = useState<'replacement' | 'append'>('replacement');

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Input Method State (File upload vs Quick Paste Data)
  const [inputMethod, setInputMethod] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState<string>('');
  const [pasteParsedCount, setPasteParsedCount] = useState<number | null>(null);
  const [pasteError, setPasteError] = useState<string | null>(null);

  // Staged Records Preview Data Table State & Column Mapping
  const [showColumnMapModal, setShowColumnMapModal] = useState<boolean>(false);
  const [stagedTableViewMode, setStagedTableViewMode] = useState<'compact_lanes' | 'contract_full' | 'fuel_scale' | 'accessorials' | 'chassis_schedule' | 'recommended_carriers'>('compact_lanes');

  // Master Recommended Carrier Database & Staging State
  const [activeRecommendedCarriers, setActiveRecommendedCarriers] = useState<RecommendedCarrierRecord[]>(initialRecommendedCarriers);
  const [stagedCarriers, setStagedCarriers] = useState<RecommendedCarrierRecord[]>([
    { id: 'stg-carr-1', dotNumber: '3230946', carrierName: 'Alliance Worldwide Logistics Corp', truckCount: 15, loadsHauled2026: 1029, homeState: 'PA', region: 'East', notes: 'Top Origin Match for PA', status: 'Verified' },
    { id: 'stg-carr-2', dotNumber: '2406445', carrierName: 'Pacific Freight Logistics Inc', truckCount: 3, loadsHauled2026: 459, homeState: 'CA', region: 'PSW', notes: 'PSW Preferred', status: 'Verified' },
    { id: 'stg-carr-3', dotNumber: '4455185', carrierName: "Brosky's Trucking Inc", truckCount: 3, loadsHauled2026: 306, homeState: 'CA', region: 'PSW', notes: '', status: 'Verified' },
    { id: 'stg-carr-4', dotNumber: '3412021', carrierName: 'Amaral Transport LLC', truckCount: 1, loadsHauled2026: 274, homeState: 'CA', region: 'PSW', notes: '', status: 'Verified' },
    { id: 'stg-carr-5', dotNumber: '3724537', carrierName: 'Trokiando Transportation Inc', truckCount: 2, loadsHauled2026: 238, homeState: 'CA', region: 'PNW', notes: '', status: 'Verified' },
    { id: 'stg-carr-6', dotNumber: '3473188', carrierName: 'Flat-line Xpress LLC', truckCount: 1, loadsHauled2026: 188, homeState: 'AZ', region: 'PSW', notes: '', status: 'Verified' },
    { id: 'stg-carr-7', dotNumber: '3020721', carrierName: 'Anajo Enterprise LLC', truckCount: 1, loadsHauled2026: 108, homeState: 'WA', region: 'PNW', notes: '', status: 'Verified' },
    { id: 'stg-carr-8', dotNumber: '2058994', carrierName: 'Big Boss Transportation LLC', truckCount: 3, loadsHauled2026: 124, homeState: 'GA', region: 'East', notes: '', status: 'Verified' }
  ]);

  // Origin State Matching Simulator State (Room to grow matching logic)
  const [simulatedOriginState, setSimulatedOriginState] = useState<string>('PA');
  const [matchRequireExactState, setMatchRequireExactState] = useState<boolean>(false);
  const [matchMinTrucks, setMatchMinTrucks] = useState<number>(0);
  const [matchMinLoads, setMatchMinLoads] = useState<number>(0);
  const [carrierSearchQuery, setCarrierSearchQuery] = useState<string>('');

  // Customer Custom Fuel Surcharge Scale Matrix Staging State
  const [stagedFuelScale, setStagedFuelScale] = useState<FuelScaleBracket[]>([
    {
      id: 'stg-fuel-1',
      doeMin: 3.50,
      doeMax: 3.599,
      fscPercent: '14.5%',
      flatRatePerMile: 0.38,
      effectiveDate: '2026-07-01',
      expirationDate: '2026-12-31',
      notes: 'DOE National Diesel Price Index Bracket 1',
      status: 'Verified'
    },
    {
      id: 'stg-fuel-2',
      doeMin: 3.60,
      doeMax: 3.699,
      fscPercent: '15.0%',
      flatRatePerMile: 0.40,
      effectiveDate: '2026-07-01',
      expirationDate: '2026-12-31',
      notes: 'DOE National Diesel Price Index Bracket 2',
      status: 'Verified'
    },
    {
      id: 'stg-fuel-3',
      doeMin: 3.70,
      doeMax: 3.799,
      fscPercent: '15.5%',
      flatRatePerMile: 0.42,
      effectiveDate: '2026-07-01',
      expirationDate: '2026-12-31',
      notes: 'DOE National Diesel Price Index Bracket 3',
      status: 'Verified'
    }
  ]);

  // Regional Chassis Schedule Staging State (NE, NW, SE, SW Rates)
  const [stagedChassisRecords, setStagedChassisRecords] = useState<ChassisScheduleRecord[]>([
    {
      id: 'stg-chas-1',
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
      notes: 'Standard carrier pool chassis',
      status: 'Verified'
    },
    {
      id: 'stg-chas-2',
      customer: 'CMA CGM',
      chassisType: 'PRIVATE',
      flag: 'BILLABLE',
      freeDays: 0,
      neRate: '$ -',
      nwRate: '$ 40.00',
      seRate: '$ -',
      swRate: '$ 40.00',
      allInRate: '',
      agreement: '',
      notes: 'NW & SW Private Fleet daily charge ($40/day)',
      status: 'Verified'
    },
    {
      id: 'stg-chas-3',
      customer: 'CMA CGM',
      chassisType: 'TRIAXLE',
      flag: 'BILLABLE',
      freeDays: 0,
      neRate: '$ -',
      nwRate: '$ 85.00',
      seRate: '$ -',
      swRate: '$ 85.00',
      allInRate: '',
      agreement: '',
      notes: 'Heavy-haul triaxle chassis position ($85/day)',
      status: 'Verified'
    }
  ]);

  // Customer Accessorial Charge Tariff Schedule Staging State
  const [stagedAccessorials, setStagedAccessorials] = useState<StagedAccessorial[]>([
    {
      id: 'stg-acc-1',
      customerAccount: 'Amazon Logistics, Inc.',
      chargeType: 'Bobtail',
      rate: '70% of LH',
      unit: '% of linehaul',
      freeQty: '',
      freeUnit: '',
      context: 'Port · LA/LB',
      laneScope: 'All lanes',
      notes: 'Port: USLAX, USLGB',
      status: 'Verified'
    },
    {
      id: 'stg-acc-2',
      customerAccount: 'Amazon Logistics, Inc.',
      chargeType: 'Chassis Split',
      rate: '$91.00',
      unit: 'Per move',
      freeQty: '',
      freeUnit: '',
      context: 'Port · LA/LB',
      laneScope: 'All lanes',
      notes: 'Port: USLAX, USLGB',
      status: 'Verified'
    },
    {
      id: 'stg-acc-3',
      customerAccount: 'Amazon Logistics, Inc.',
      chargeType: 'Chassis (Pool of Pools)',
      rate: '$35.00',
      unit: 'Per day',
      freeQty: '',
      freeUnit: '',
      context: 'Port · DALLAS',
      laneScope: 'All lanes',
      notes: 'Prior approval required · Pool of Pools chassis',
      status: 'Verified'
    },
    {
      id: 'stg-acc-4',
      customerAccount: 'Amazon Logistics, Inc.',
      chargeType: 'Pre-Pull',
      rate: '$94.00',
      unit: 'Per move',
      freeQty: '',
      freeUnit: '',
      context: 'Port · LA/LB',
      laneScope: 'All lanes',
      notes: 'Port: USLAX, USLGB',
      status: 'Verified'
    },
    {
      id: 'stg-acc-5',
      customerAccount: 'Amazon Logistics, Inc.',
      chargeType: 'Port Waiting Time',
      rate: '$80.00',
      unit: 'Per hour',
      freeQty: '2',
      freeUnit: 'hour',
      context: 'Port · LA/LB',
      laneScope: 'All lanes',
      notes: 'Port: USLAX, USLGB · 2 hrs free time',
      status: 'Verified'
    },
    {
      id: 'stg-acc-6',
      customerAccount: 'Amazon Logistics, Inc.',
      chargeType: 'Hazmat',
      rate: '$129.00',
      unit: 'Per move',
      freeQty: '',
      freeUnit: '',
      context: 'Port · LA/LB',
      laneScope: 'All lanes',
      notes: 'Hazardous material drayage fee',
      status: 'Verified'
    },
    {
      id: 'stg-acc-7',
      customerAccount: 'Amazon Logistics, Inc.',
      chargeType: 'Yard Storage',
      rate: '$32.00',
      unit: 'Per day',
      freeQty: '1',
      freeUnit: 'day',
      context: 'Port · LA/LB',
      laneScope: 'All lanes',
      notes: '1 day free yard storage included',
      status: 'Verified'
    },
    {
      id: 'stg-acc-8',
      customerAccount: 'JF Hillebrand- WC',
      chargeType: 'Congestion',
      rate: '$150.00',
      unit: 'Per move',
      freeQty: '',
      freeUnit: '',
      context: 'All Ports',
      laneScope: 'All lanes',
      notes: 'Excessive waiting time at port or ramp',
      status: 'Verified'
    },
    {
      id: 'stg-acc-9',
      customerAccount: 'Dollar Tree',
      chargeType: 'Pier Pass Admin',
      rate: '$5.00',
      unit: 'Per move',
      freeQty: '',
      freeUnit: '',
      context: 'Port · LA/LB',
      laneScope: 'All lanes',
      notes: 'Pier Pass / Clean Truck Admin fee',
      status: 'Verified'
    },
    {
      id: 'stg-acc-10',
      customerAccount: 'LKQ CORPORATION',
      chargeType: 'Detention - Warehouse',
      rate: '$50.00',
      unit: 'Per hour',
      freeQty: '2',
      freeUnit: 'hour',
      context: 'Warehouse',
      laneScope: 'All lanes',
      notes: 'In and out POD timestamps required for approval',
      status: 'Verified'
    }
  ]);
  const [selectedAccCategoryFilter, setSelectedAccCategoryFilter] = useState<string>('All');
  
  // Dataset Schema Mode State ('auto' | 'lanes' | 'accessorials')
  const [importDatasetType, setImportDatasetType] = useState<'auto' | 'lanes' | 'accessorials'>('auto');
  const [mapperSchemaMode, setMapperSchemaMode] = useState<'lanes' | 'accessorials'>('lanes');

  // Interactive Column Header Remapping state & per-column target mapping
  const [columnMappings, setColumnMappings] = useState({
    originCol: 0,
    destCol: 1,
    rateCol: 2,
    effDateCol: 3,
    expDateCol: 4,
    equipmentCol: 5,
    serviceCol: 6,
    fuelScaleCol: 7,
    freeDetentionCol: 8,
    chassisSplitCol: 9
  });

  // Direct column index to target field assignment map (colIndex -> field role or 'exclude')
  const [colAssignments, setColAssignments] = useState<Record<number, string>>({
    0: 'origin',
    1: 'destination',
    2: 'rate',
    3: 'effDate',
    4: 'expDate',
    5: 'exclude',
    6: 'exclude',
    7: 'exclude'
  });

  const [stagedRecords, setStagedRecords] = useState<StagedRecord[]>([
    {
      id: 'stg-1',
      rowNumber: 1,
      customerAccount: 'Dollar Tree',
      effectiveDate: '2026-07-01',
      expirationDate: '2027-06-30',
      origin: 'Oakland, CA',
      destination: 'Sacramento, CA',
      rate: '$720.00',
      equipment: "40' Dry Van",
      serviceType: 'Regional Drayage',
      fuelScale: 'Dollar Tree DOE Scale',
      freeDetentionHours: '2 Hrs',
      detentionRate: '$75.00/hr',
      chassisFreeDays: '2 Days',
      chassisSplitFee: '$85.00',
      chassisDailyRate: '$42.50',
      demurrageFreeDays: '4 Days',
      status: 'Verified'
    },
    {
      id: 'stg-2',
      rowNumber: 2,
      customerAccount: 'Dollar Tree',
      effectiveDate: '2026-07-01',
      expirationDate: '2027-06-30',
      origin: 'Los Angeles, CA',
      destination: 'Phoenix, AZ',
      rate: '$1,450.00',
      equipment: "53' Dry Van",
      serviceType: 'Interstate Freight',
      fuelScale: 'Dollar Tree DOE Scale',
      freeDetentionHours: '2 Hrs',
      detentionRate: '$85.00/hr',
      chassisFreeDays: '3 Days',
      chassisSplitFee: '$75.00',
      chassisDailyRate: '$39.00',
      demurrageFreeDays: '5 Days',
      status: 'Verified'
    },
    {
      id: 'stg-3',
      rowNumber: 3,
      customerAccount: 'Dollar Tree',
      effectiveDate: '2026-07-01',
      expirationDate: '2027-06-30',
      origin: 'Seattle, WA',
      destination: 'Spokane, WA',
      rate: '$890.00',
      equipment: "53' Dry Van",
      serviceType: 'Regional Drayage',
      fuelScale: 'Dollar Tree DOE Scale',
      freeDetentionHours: '2 Hrs',
      detentionRate: '$75.00/hr',
      chassisFreeDays: '2 Days',
      chassisSplitFee: '$80.00',
      chassisDailyRate: '$40.00',
      demurrageFreeDays: '4 Days',
      status: 'Verified'
    }
  ]);
  const [activeStagingTab, setActiveStagingTab] = useState<'staged_data' | 'validation_logs'>('staged_data');
  const [stagedFilterQuery, setStagedFilterQuery] = useState('');

  // Custom Customer Accounts State
  const [customCustomers, setCustomCustomers] = useState<string[]>(customersList);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustCode, setNewCustCode] = useState('');

  // Template preview & toast notification state
  const [previewTemplate, setPreviewTemplate] = useState<WorkingTemplate | null>(null);
  const [showRateDirectoryPreviewModal, setShowRateDirectoryPreviewModal] = useState<boolean>(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Per-customer Aspect Onboarding completion tracking state
  const [customerAspects, setCustomerAspects] = useState<
    Record<string, Record<'fuel' | 'lanes' | 'accessorials' | 'chassis', 'completed' | 'staged' | 'pending' | 'na'>>
  >({
    'Dollar Tree': { fuel: 'completed', lanes: 'staged', accessorials: 'pending', chassis: 'pending' },
    'Target Corp': { fuel: 'completed', lanes: 'completed', accessorials: 'completed', chassis: 'na' },
    'Amazon Logistics, Inc.': { fuel: 'completed', lanes: 'completed', accessorials: 'completed', chassis: 'completed' },
    'Walmart Logistics': { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' },
    'Home Depot': { fuel: 'completed', lanes: 'completed', accessorials: 'na', chassis: 'na' }
  });

  // Automated Standardization State (Defaults to completed & verified)
  const [standardizationProgress, setStandardizationProgress] = useState<number>(100);
  const [isStandardizing, setIsStandardizing] = useState<boolean>(false);
  const [showStandardizationLogs, setShowStandardizationLogs] = useState<boolean>(false);
  const [processedRecordsCount, setProcessedRecordsCount] = useState<number>(3);

  // Helper to extract live detected column samples from pasted text or default file
  const getDetectedColumnSamples = () => {
    if (!pastedText.trim()) {
      return [
        { colIndex: 0, header: 'Origin', samples: ['Oakland, CA', 'Los Angeles, CA', 'Seattle, WA'] },
        { colIndex: 1, header: 'Destination', samples: ['Sacramento, CA', 'Phoenix, AZ', 'Spokane, WA'] },
        { colIndex: 2, header: 'Base Rate ($)', samples: ['$720.00', '$1,450.00', '$890.00'] },
        { colIndex: 3, header: 'Equipment', samples: ["40' Dry Van", "53' Dry Van", "53' Dry Van"] },
        { colIndex: 4, header: 'Service Type', samples: ['Regional Drayage', 'Interstate Freight', 'Regional Drayage'] },
        { colIndex: 5, header: 'Effective Date', samples: ['2026-07-01', '2026-07-01', '2026-07-01'] },
        { colIndex: 6, header: 'Expiration Date', samples: ['2027-06-30', '2027-06-30', '2027-06-30'] },
      ];
    }

    const lines = pastedText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    const parsedLines = lines.map((line) =>
      line.split(/\t|,| {2,}/).map((p) => p.trim()).filter((p) => p.length > 0)
    );

    const maxCols = Math.max(...parsedLines.map((row) => row.length), 1);
    const result = [];

    const firstLineIsHeader = parsedLines[0].some((val) =>
      ['origin', 'destination', 'rate', 'fsc', 'customer', 'date', 'pol', 'pod', 'equip'].some((k) =>
        val.toLowerCase().includes(k)
      )
    );

    const headerRow = firstLineIsHeader ? parsedLines[0] : [];
    const dataRows = firstLineIsHeader ? parsedLines.slice(1) : parsedLines;

    for (let colIdx = 0; colIdx < Math.min(maxCols, 12); colIdx++) {
      const detectedHeader = headerRow[colIdx] || `Column ${colIdx + 1}`;
      const samples = dataRows
        .map((row) => row[colIdx])
        .filter((v) => v !== undefined && v !== '')
        .slice(0, 3);

      result.push({
        colIndex: colIdx,
        header: detectedHeader,
        samples: samples.length > 0 ? samples : ['(empty sample)']
      });
    }

    return result;
  };

  const detectedCols = getDetectedColumnSamples();

  // Accessorial Detection Helper
  const checkIsAccessorialData = (text: string): boolean => {
    if (!text || !text.trim()) return false;
    const lower = text.toLowerCase();

    // Header or field keywords
    const accHeaderKeywords = [
      'charge', 'accessorial', 'free qty', 'free unit', 'context', 'lane scope',
      'notes', 'billing unit', 'surcharge', 'tariff', 'free time', 'allowance'
    ];
    if (accHeaderKeywords.some((k) => lower.includes(k))) return true;

    // Specific charge name keywords
    const accChargeNames = [
      'bobtail', 'chassis', 'detention', 'pre-pull', 'dry run', 'hazmat',
      'pier pass', 'yard storage', 'congestion', 'demurrage', 'per diem',
      'overweight', 'exam site', 'redelivery', 'bond fee', 'lumper',
      'layover', 'tonu', 'flip', 'genset', 'scale', 'stop off', 'wait time',
      'clean truck', 'tmf', 'tank endorsement'
    ];
    if (accChargeNames.some((k) => lower.includes(k))) return true;

    return false;
  };

  // Column Auto-Assigner helper for Field Mapper
  const autoAssignColumns = (
    schema: 'lanes' | 'accessorials',
    cols: { colIndex: number; header: string; samples: string[] }[]
  ): Record<number, string> => {
    const newMap: Record<number, string> = {};
    cols.forEach((c) => {
      const h = c.header.toLowerCase();
      if (schema === 'accessorials') {
        if (h.includes('customer') || h.includes('account')) {
          newMap[c.colIndex] = 'acc_customer';
        } else if (h.includes('charge') || h.includes('accessorial') || h.includes('fee') || h.includes('surcharge')) {
          newMap[c.colIndex] = 'acc_charge';
        } else if (h.includes('rate') || h.includes('amount') || h.includes('price')) {
          newMap[c.colIndex] = 'acc_rate';
        } else if (h.includes('unit') && !h.includes('free')) {
          newMap[c.colIndex] = 'acc_unit';
        } else if (h.includes('free qty') || h.includes('free quantity') || h.includes('free time') || h.includes('allowance')) {
          newMap[c.colIndex] = 'acc_free_qty';
        } else if (h.includes('free unit')) {
          newMap[c.colIndex] = 'acc_free_unit';
        } else if (h.includes('context') || h.includes('port') || h.includes('terminal') || h.includes('location')) {
          newMap[c.colIndex] = 'acc_context';
        } else if (h.includes('scope') || h.includes('lane')) {
          newMap[c.colIndex] = 'acc_scope';
        } else if (h.includes('note') || h.includes('rule') || h.includes('description')) {
          newMap[c.colIndex] = 'acc_notes';
        } else {
          if (c.colIndex === 0) newMap[c.colIndex] = 'acc_customer';
          else if (c.colIndex === 1) newMap[c.colIndex] = 'acc_charge';
          else if (c.colIndex === 2) newMap[c.colIndex] = 'acc_rate';
          else if (c.colIndex === 3) newMap[c.colIndex] = 'acc_unit';
          else if (c.colIndex === 4) newMap[c.colIndex] = 'acc_free_qty';
          else if (c.colIndex === 5) newMap[c.colIndex] = 'acc_free_unit';
          else if (c.colIndex === 6) newMap[c.colIndex] = 'acc_context';
          else if (c.colIndex === 7) newMap[c.colIndex] = 'acc_scope';
          else if (c.colIndex === 8) newMap[c.colIndex] = 'acc_notes';
          else newMap[c.colIndex] = 'exclude';
        }
      } else {
        if (h.includes('origin') || h.includes('pol') || h.includes('pickup')) {
          newMap[c.colIndex] = 'origin';
        } else if (h.includes('dest') || h.includes('pod') || h.includes('drop')) {
          newMap[c.colIndex] = 'destination';
        } else if (h.includes('rate') || h.includes('price') || h.includes('cost')) {
          newMap[c.colIndex] = 'rate';
        } else if (h.includes('eff') || h.includes('start')) {
          newMap[c.colIndex] = 'effDate';
        } else if (h.includes('exp') || h.includes('end')) {
          newMap[c.colIndex] = 'expDate';
        } else if (h.includes('equip') || h.includes('size')) {
          newMap[c.colIndex] = 'equipment';
        } else {
          if (c.colIndex === 0) newMap[c.colIndex] = 'origin';
          else if (c.colIndex === 1) newMap[c.colIndex] = 'destination';
          else if (c.colIndex === 2) newMap[c.colIndex] = 'rate';
          else if (c.colIndex === 3) newMap[c.colIndex] = 'effDate';
          else if (c.colIndex === 4) newMap[c.colIndex] = 'expDate';
          else if (c.colIndex === 5) newMap[c.colIndex] = 'equipment';
          else newMap[c.colIndex] = 'exclude';
        }
      }
    });
    return newMap;
  };

  // Helper to parse pasted raw lines (TSV from Excel/Sheets or CSV)
  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      setPasteError('Please paste at least one line of rate lane or table data.');
      return;
    }
    setPasteError(null);

    const rawLines = pastedText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (rawLines.length === 0) {
      setPasteError('No valid content found in pasted text.');
      return;
    }

    const isAccessorialFile =
      importDatasetType === 'accessorials' ||
      (importDatasetType === 'auto' && checkIsAccessorialData(pastedText));

    const firstLineLower = rawLines[0] ? rawLines[0].toLowerCase() : '';

    if (isAccessorialFile) {
      // Helper to lookup column index assigned to a role
      const getColIdx = (role: string) => {
        const found = Object.keys(colAssignments).find((k) => colAssignments[Number(k)] === role);
        return found !== undefined ? Number(found) : -1;
      };

      const accCustIdx = getColIdx('acc_customer');
      const accChargeIdx = getColIdx('acc_charge');
      const accRateIdx = getColIdx('acc_rate');
      const accUnitIdx = getColIdx('acc_unit');
      const accFreeQtyIdx = getColIdx('acc_free_qty');
      const accFreeUnitIdx = getColIdx('acc_free_unit');
      const accContextIdx = getColIdx('acc_context');
      const accScopeIdx = getColIdx('acc_scope');
      const accNotesIdx = getColIdx('acc_notes');

      const hasHeader =
        firstLineLower.includes('charge') ||
        firstLineLower.includes('customer') ||
        firstLineLower.includes('rate') ||
        firstLineLower.includes('unit') ||
        firstLineLower.includes('free') ||
        firstLineLower.includes('notes');

      const dataRows = hasHeader ? rawLines.slice(1) : rawLines;
      const parsedAccs: StagedAccessorial[] = dataRows.map((line, idx) => {
        const parts = line.split(/\t|,| {2,}/).map((p) => p.trim().replace(/^"|"$/g, ''));

        const custVal = accCustIdx >= 0 && parts[accCustIdx] ? parts[accCustIdx] : (hasHeader ? selectedCustomer : (parts[0] || selectedCustomer));
        const chargeVal = accChargeIdx >= 0 && parts[accChargeIdx] ? parts[accChargeIdx] : (parts[hasHeader ? 1 : 0] || 'Driver Detention');
        const rateVal = accRateIdx >= 0 && parts[accRateIdx] ? parts[accRateIdx] : (parts[hasHeader ? 2 : 1] || '$75.00');
        const unitVal = accUnitIdx >= 0 && parts[accUnitIdx] ? parts[accUnitIdx] : (parts[hasHeader ? 3 : 2] || 'Per hour');
        const freeQtyVal = accFreeQtyIdx >= 0 ? (parts[accFreeQtyIdx] || '') : (parts[hasHeader ? 4 : 3] || '');
        const freeUnitVal = accFreeUnitIdx >= 0 ? (parts[accFreeUnitIdx] || '') : (parts[hasHeader ? 5 : 4] || '');
        const contextVal = accContextIdx >= 0 ? (parts[accContextIdx] || '') : (parts[hasHeader ? 6 : 5] || 'Port / Terminal');
        const scopeVal = accScopeIdx >= 0 ? (parts[accScopeIdx] || '') : (parts[hasHeader ? 7 : 6] || 'All lanes');
        const notesVal = accNotesIdx >= 0 ? (parts[accNotesIdx] || '') : (parts[hasHeader ? 8 : 7] || '');

        return {
          id: `stg-acc-paste-${Date.now()}-${idx}`,
          customerAccount: custVal,
          chargeType: chargeVal,
          rate: rateVal,
          unit: unitVal,
          freeQty: freeQtyVal,
          freeUnit: freeUnitVal,
          context: contextVal,
          laneScope: scopeVal,
          notes: notesVal,
          status: 'Verified'
        };
      });

      setStagedAccessorials(parsedAccs);
      setStagedTableViewMode('accessorials');
      setActiveStagingTab('staged_data');
      setPasteParsedCount(parsedAccs.length);

      const batchName = `Pasted_${parsedAccs.length}_Accessorials_${selectedCustomer.replace(/[^a-zA-Z0-9]/g, '_')}`;
      setUploadedFileName(`${batchName}.tsv`);
      setFileName(batchName);
      onUploadFileSimulated(`${batchName}.tsv`);

      setDownloadToast(`Parsed & staged ${parsedAccs.length} accessorial charge tariff rules below.`);
      setTimeout(() => setDownloadToast(null), 4000);

      setTimeout(() => {
        document.getElementById('staging-preview-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return;
    }

    let dataLines = rawLines;
    if (
      firstLineLower.includes('origin') ||
      firstLineLower.includes('destination') ||
      firstLineLower.includes('rate') ||
      firstLineLower.includes('fsc') ||
      firstLineLower.includes('customer') ||
      firstLineLower.includes('chassis') ||
      firstLineLower.includes('date') ||
      firstLineLower.includes('pol')
    ) {
      dataLines = rawLines.slice(1);
    }

    const count = Math.max(1, dataLines.length);
    setPasteParsedCount(count);

    // Look up assigned column indices
    const originIdx = Number(Object.keys(colAssignments).find((k) => colAssignments[Number(k)] === 'origin') ?? columnMappings.originCol ?? 0);
    const destIdx = Number(Object.keys(colAssignments).find((k) => colAssignments[Number(k)] === 'destination') ?? columnMappings.destCol ?? 1);
    const rateIdx = Number(Object.keys(colAssignments).find((k) => colAssignments[Number(k)] === 'rate') ?? columnMappings.rateCol ?? 2);
    const effIdxKey = Object.keys(colAssignments).find((k) => colAssignments[Number(k)] === 'effDate');
    const expIdxKey = Object.keys(colAssignments).find((k) => colAssignments[Number(k)] === 'expDate');
    const equipIdxKey = Object.keys(colAssignments).find((k) => colAssignments[Number(k)] === 'equipment');

    const newStagedRecords: StagedRecord[] = dataLines.map((line, idx) => {
      const parts = line.split(/\t|,| {2,}/).map((p) => p.trim()).filter((p) => p.length > 0);
      return {
        id: `staged-paste-${Date.now()}-${idx}`,
        rowNumber: idx + 1,
        customerAccount: selectedCustomer,
        effectiveDate: effIdxKey !== undefined && parts[Number(effIdxKey)] ? parts[Number(effIdxKey)] : (effectiveDate || '2026-07-01'),
        expirationDate: expIdxKey !== undefined && parts[Number(expIdxKey)] ? parts[Number(expIdxKey)] : (expirationDate || '2027-06-30'),
        origin: parts[originIdx] || parts[0] || 'Oakland, CA',
        destination: parts[destIdx] || parts[1] || 'Sacramento, CA',
        rate: parts[rateIdx] ? (parts[rateIdx].startsWith('$') ? parts[rateIdx] : `$${parts[rateIdx]}`) : '$720.00',
        equipment: equipIdxKey !== undefined && parts[Number(equipIdxKey)] ? parts[Number(equipIdxKey)] : "53' Dry Van",
        serviceType: 'Regional Drayage',
        fuelScale: `${selectedCustomer} FSC Scale`,
        freeDetentionHours: '2 Hrs',
        detentionRate: '$75.00/hr',
        chassisFreeDays: '2 Days',
        chassisSplitFee: '$85.00',
        chassisDailyRate: '$42.50',
        demurrageFreeDays: '4 Days',
        status: 'Verified'
      };
    });

    setStagedRecords(newStagedRecords);
    setStagedTableViewMode('compact_lanes');
    setActiveStagingTab('staged_data');

    const tagCust = selectedCustomer.replace(/[^a-zA-Z0-9]/g, '_');
    const batchName = `Pasted_${count}_Lanes_${tagCust}`;
    setUploadedFileName(`${batchName}.tsv`);
    setFileName(batchName);
    onUploadFileSimulated(`${batchName}.tsv`);
    triggerStandardizationScan(count);

    setDownloadToast(`Parsed & staged ${count} contract lane(s) with dates, fuel scale, and chassis details below.`);
    setTimeout(() => setDownloadToast(null), 4000);

    setTimeout(() => {
      document.getElementById('staging-preview-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleUpdateStagedRecordField = (id: string, field: keyof StagedRecord, value: string) => {
    setStagedRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, [field]: value } : rec))
    );
  };

  const handleDeleteStagedRecord = (id: string) => {
    setStagedRecords((prev) => prev.filter((r) => r.id !== id));
    setDownloadToast('Discarded 1 staged record row.');
    setTimeout(() => setDownloadToast(null), 2500);
  };

  const handleUpdateStagedAccessorialField = (id: string, field: keyof StagedAccessorial, value: string) => {
    setStagedAccessorials((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, [field]: value } : acc))
    );
  };

  const handleDeleteStagedAccessorial = (id: string) => {
    setStagedAccessorials((prev) => prev.filter((a) => a.id !== id));
    setDownloadToast('Discarded 1 staged accessorial charge rule.');
    setTimeout(() => setDownloadToast(null), 2500);
  };

  const handleAddStagedAccessorial = () => {
    const newRule: StagedAccessorial = {
      id: `stg-acc-new-${Date.now()}`,
      customerAccount: selectedCustomer,
      chargeType: 'Driver Detention',
      rate: '$85.00',
      unit: 'Per hour',
      freeQty: '2',
      freeUnit: 'hour',
      context: 'Port / Terminal',
      laneScope: 'All lanes',
      notes: 'Standard 2 hrs free time allowance',
      status: 'Verified'
    };
    setStagedAccessorials((prev) => [newRule, ...prev]);
    setStagedTableViewMode('accessorials');
    setDownloadToast('Added 1 new accessorial charge rule to Staging.');
    setTimeout(() => setDownloadToast(null), 2500);
  };

  const handleDiscardAllStaging = () => {
    setStagedRecords([]);
    setStagedAccessorials([]);
    setStagedFuelScale([]);
    setStagedChassisRecords([]);
    setPastedText('');
    setUploadedFileName(null);
    setPasteParsedCount(null);
    setPasteError(null);
    setDownloadToast('Cleared staging area. All uncommitted staged rows have been discarded.');
    setTimeout(() => setDownloadToast(null), 3500);
    if (onDiscardChanges) {
      onDiscardChanges();
    }
  };

  const handleCommitAllStaging = () => {
    const totalCount = stagedRecords.length + stagedAccessorials.length + stagedFuelScale.length + stagedChassisRecords.length;
    if (totalCount === 0) {
      setDownloadToast('No staged records, fuel brackets, accessorials, or chassis schedules to commit.');
      setTimeout(() => setDownloadToast(null), 3000);
      return;
    }
    onCommitChanges();

    // Update aspect tracking for selected customer
    setCustomerAspects((prev) => {
      const currentCust = prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' };
      const updated = { ...currentCust };
      if (stagedRecords.length > 0) updated.lanes = 'completed';
      if (stagedAccessorials.length > 0) updated.accessorials = 'completed';
      if (stagedFuelScale.length > 0) updated.fuel = 'completed';
      if (stagedChassisRecords.length > 0) updated.chassis = 'completed';
      return { ...prev, [selectedCustomer]: updated };
    });

    if (stagedCarriers.length > 0) {
      setActiveRecommendedCarriers((prev) => {
        const existingDots = new Set(prev.map((c) => c.dotNumber));
        const newItems = stagedCarriers.filter((c) => !existingDots.has(c.dotNumber));
        return [...stagedCarriers, ...prev];
      });
    }

    setStagedRecords([]);
    setStagedAccessorials([]);
    setStagedFuelScale([]);
    setStagedChassisRecords([]);
    setStagedCarriers([]);
    setPastedText('');
    setUploadedFileName(null);
    setPasteParsedCount(null);
    setShowRateDirectoryPreviewModal(false);
    setDownloadToast(`✓ Successfully committed ${totalCount} staged record(s) for ${selectedCustomer} to active rate directory! Workspace cleared.`);
    setTimeout(() => setDownloadToast(null), 4000);
  };

  const handleUpdateStagedCarrierField = (id: string, field: keyof RecommendedCarrierRecord, value: string | number) => {
    setStagedCarriers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleDeleteStagedCarrier = (id: string) => {
    setStagedCarriers((prev) => prev.filter((c) => c.id !== id));
    setDownloadToast('Discarded 1 staged carrier record.');
    setTimeout(() => setDownloadToast(null), 2500);
  };

  const handleAddStagedCarrier = () => {
    const newCarrier: RecommendedCarrierRecord = {
      id: `stg-carr-new-${Date.now()}`,
      dotNumber: '0000000',
      carrierName: 'New Recommended Carrier LLC',
      truckCount: 5,
      loadsHauled2026: 50,
      homeState: 'CA',
      region: 'PSW',
      notes: 'Direct Home State match',
      status: 'Verified'
    };
    setStagedCarriers((prev) => [newCarrier, ...prev]);
    setStagedTableViewMode('recommended_carriers');
    setDownloadToast('Added 1 new recommended carrier row to Staging Preview.');
    setTimeout(() => setDownloadToast(null), 2500);
  };

  const handleAddStagedRecord = () => {
    const newRecord: StagedRecord = {
      id: `staged-new-${Date.now()}`,
      rowNumber: stagedRecords.length + 1,
      customerAccount: selectedCustomer,
      effectiveDate: effectiveDate || '2026-07-01',
      expirationDate: expirationDate || '2027-06-30',
      origin: 'Dallas, TX',
      destination: 'Houston, TX',
      rate: '$650.00',
      equipment: "53' Dry Van",
      serviceType: 'Regional Drayage',
      fuelScale: `${selectedCustomer} FSC Scale`,
      freeDetentionHours: '2 Hrs',
      detentionRate: '$75.00/hr',
      chassisFreeDays: '2 Days',
      chassisSplitFee: '$85.00',
      chassisDailyRate: '$42.50',
      demurrageFreeDays: '4 Days',
      status: 'Verified'
    };
    setStagedRecords((prev) => [...prev, newRecord]);
    setDownloadToast('Added 1 new contract lane row to Staging Preview.');
    setTimeout(() => setDownloadToast(null), 3000);
  };

  // Trigger interactive geography standardization scan
  const triggerStandardizationScan = (totalRecords = 450) => {
    setIsStandardizing(true);
    setStandardizationProgress(20);
    setProcessedRecordsCount(Math.round(totalRecords * 0.2));

    let current = 20;
    const interval = setInterval(() => {
      current += 25;
      if (current >= 100) {
        clearInterval(interval);
        setStandardizationProgress(100);
        setProcessedRecordsCount(totalRecords);
        setIsStandardizing(false);
        setDownloadToast(`Standardization Complete: ${totalRecords} records verified against Master Geography (v4.2)`);
        setTimeout(() => setDownloadToast(null), 4000);
      } else {
        setStandardizationProgress(current);
        setProcessedRecordsCount(Math.round(totalRecords * (current / 100)));
      }
    }, 100);
  };

  // Helper function to trigger browser CSV file download
  const handleDownloadCSV = (template: WorkingTemplate) => {
    const headers = template.columns.join(',');
    const rows = template.sampleRows
      .map((row) => template.columns.map((col) => `"${row[col] ?? ''}"`).join(','))
      .join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + '\n' + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', template.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show temporary toast confirmation
    setDownloadToast(`Downloaded ${template.filename}`);
    setTimeout(() => setDownloadToast(null), 3500);
  };

  const getTemplateForDataset = (dsName: string): WorkingTemplate => {
    const nameLower = dsName.toLowerCase();
    if (nameLower.includes('fuel')) return WORKING_TEMPLATES[1];
    if (nameLower.includes('accessorial')) return WORKING_TEMPLATES[2];
    if (nameLower.includes('city') || nameLower.includes('geography')) return WORKING_TEMPLATES[3];
    if (nameLower.includes('carrier') || nameLower.includes('benchmark')) return WORKING_TEMPLATES[4];
    return WORKING_TEMPLATES[0]; // Target Rates default
  };

  const populateStagingFromFile = (fileName: string, rawText?: string) => {
    const fnLower = fileName.toLowerCase();
    const textLower = (rawText || '').toLowerCase();

    const isFuel = fnLower.includes('fuel') || fnLower.includes('fsc') || fnLower.includes('doe') || textLower.includes('doe_diesel') || textLower.includes('fsc_percentage');
    const isChassis = fnLower.includes('chassis') || fnLower.includes('freedays') || fnLower.includes('triaxle') || textLower.includes('chassis_type') || textLower.includes('freedays') || (textLower.includes('ne') && textLower.includes('nw') && textLower.includes('sw'));
    const isAcc = fnLower.includes('accessorial') || fnLower.includes('tariff') || textLower.includes('detention') || textLower.includes('bobtail');

    if (isFuel) {
      const sampleFuel: FuelScaleBracket[] = [
        {
          id: `stg-fuel-file-${Date.now()}-1`,
          doeMin: 3.50,
          doeMax: 3.599,
          fscPercent: '14.5%',
          flatRatePerMile: 0.38,
          effectiveDate: effectiveDate || '2026-07-01',
          expirationDate: expirationDate || '2026-12-31',
          notes: `${selectedCustomer} Custom Fuel Matrix Bracket 1`,
          status: 'Verified'
        },
        {
          id: `stg-fuel-file-${Date.now()}-2`,
          doeMin: 3.60,
          doeMax: 3.699,
          fscPercent: '15.0%',
          flatRatePerMile: 0.40,
          effectiveDate: effectiveDate || '2026-07-01',
          expirationDate: expirationDate || '2026-12-31',
          notes: `${selectedCustomer} Custom Fuel Matrix Bracket 2`,
          status: 'Verified'
        },
        {
          id: `stg-fuel-file-${Date.now()}-3`,
          doeMin: 3.70,
          doeMax: 3.799,
          fscPercent: '15.5%',
          flatRatePerMile: 0.42,
          effectiveDate: effectiveDate || '2026-07-01',
          expirationDate: expirationDate || '2026-12-31',
          notes: `${selectedCustomer} Custom Fuel Matrix Bracket 3`,
          status: 'Verified'
        },
        {
          id: `stg-fuel-file-${Date.now()}-4`,
          doeMin: 3.80,
          doeMax: 3.899,
          fscPercent: '16.0%',
          flatRatePerMile: 0.44,
          effectiveDate: effectiveDate || '2026-07-01',
          expirationDate: expirationDate || '2026-12-31',
          notes: `${selectedCustomer} Custom Fuel Matrix Bracket 4`,
          status: 'Verified'
        }
      ];
      setStagedFuelScale(sampleFuel);
      setStagedTableViewMode('fuel_scale');
      setPasteParsedCount(sampleFuel.length);
      setCustomerAspects((prev) => ({
        ...prev,
        [selectedCustomer]: { ...(prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' }), fuel: 'staged' }
      }));
    } else if (isChassis) {
      const sampleChassis: ChassisScheduleRecord[] = [
        {
          id: `stg-chas-file-${Date.now()}-1`,
          customer: selectedCustomer,
          chassisType: 'POOL',
          flag: 'NOT BILLABLE',
          freeDays: 0,
          neRate: '$ -',
          nwRate: '$ -',
          seRate: '$ -',
          swRate: '$ -',
          allInRate: '',
          agreement: 'Y',
          notes: 'Standard carrier pool chassis',
          status: 'Verified'
        },
        {
          id: `stg-chas-file-${Date.now()}-2`,
          customer: selectedCustomer,
          chassisType: 'PRIVATE',
          flag: 'BILLABLE',
          freeDays: 0,
          neRate: '$ -',
          nwRate: '$ 40.00',
          seRate: '$ -',
          swRate: '$ 40.00',
          allInRate: '',
          agreement: '',
          notes: 'Private fleet regional daily charge (NW: $40 / SW: $40)',
          status: 'Verified'
        },
        {
          id: `stg-chas-file-${Date.now()}-3`,
          customer: selectedCustomer,
          chassisType: 'TRIAXLE',
          flag: 'BILLABLE',
          freeDays: 0,
          neRate: '$ -',
          nwRate: '$ 85.00',
          seRate: '$ -',
          swRate: '$ 85.00',
          allInRate: '',
          agreement: '',
          notes: 'Heavy-haul triaxle chassis position (NW: $85 / SW: $85)',
          status: 'Verified'
        }
      ];
      setStagedChassisRecords(sampleChassis);
      setStagedTableViewMode('chassis_schedule');
      setPasteParsedCount(sampleChassis.length);
      setCustomerAspects((prev) => ({
        ...prev,
        [selectedCustomer]: { ...(prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' }), chassis: 'staged' }
      }));
    } else if (isAcc) {
      const sampleAccs: StagedAccessorial[] = [
        {
          id: `stg-acc-file-${Date.now()}-1`,
          customerAccount: selectedCustomer,
          chargeType: 'Driver Detention',
          rate: '$75.00',
          unit: 'Per hour',
          freeQty: '2',
          freeUnit: 'hour',
          context: 'Warehouse',
          laneScope: 'All lanes',
          notes: 'Standard 2 hrs free time',
          status: 'Verified'
        },
        {
          id: `stg-acc-file-${Date.now()}-2`,
          customerAccount: selectedCustomer,
          chargeType: 'Chassis Split',
          rate: '$85.00',
          unit: 'Per move',
          freeQty: '',
          freeUnit: '',
          context: 'Port · LA/LB',
          laneScope: 'Regional Drayage',
          notes: 'Off-dock chassis yard pull',
          status: 'Verified'
        },
        {
          id: `stg-acc-file-${Date.now()}-3`,
          customerAccount: selectedCustomer,
          chargeType: 'Pre-Pull Fee',
          rate: '$95.00',
          unit: 'Per move',
          freeQty: '',
          freeUnit: '',
          context: 'Port · LA/LB',
          laneScope: 'Port Drayage',
          notes: 'Overnight terminal pre-pull',
          status: 'Verified'
        }
      ];
      setStagedAccessorials(sampleAccs);
      setStagedTableViewMode('accessorials');
      setPasteParsedCount(sampleAccs.length);
      setCustomerAspects((prev) => ({
        ...prev,
        [selectedCustomer]: { ...(prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' }), accessorials: 'staged' }
      }));
    } else {
      const sampleLanes: StagedRecord[] = [
        {
          id: `stg-file-${Date.now()}-1`,
          rowNumber: 1,
          customerAccount: selectedCustomer,
          effectiveDate: effectiveDate || '2026-07-01',
          expirationDate: expirationDate || '2027-06-30',
          origin: 'Oakland, CA (OICT SSA)',
          destination: 'Sacramento, CA (Hub)',
          rate: '$720.00',
          equipment: "40' Dry Van",
          serviceType: 'Regional Drayage',
          fuelScale: `${selectedCustomer} FSC Scale`,
          freeDetentionHours: '2 Hrs',
          detentionRate: '$75.00/hr',
          chassisFreeDays: '2 Days',
          chassisSplitFee: '$85.00',
          chassisDailyRate: '$42.50',
          demurrageFreeDays: '4 Days',
          status: 'Verified'
        },
        {
          id: `stg-file-${Date.now()}-2`,
          rowNumber: 2,
          customerAccount: selectedCustomer,
          effectiveDate: effectiveDate || '2026-07-01',
          expirationDate: expirationDate || '2027-06-30',
          origin: 'Los Angeles, CA (Port)',
          destination: 'Phoenix, AZ (Fulfillment)',
          rate: '$1,450.00',
          equipment: "53' Dry Van",
          serviceType: 'Interstate Freight',
          fuelScale: `${selectedCustomer} FSC Scale`,
          freeDetentionHours: '2 Hrs',
          detentionRate: '$80.00/hr',
          chassisFreeDays: '2 Days',
          chassisSplitFee: '$90.00',
          chassisDailyRate: '$45.00',
          demurrageFreeDays: '4 Days',
          status: 'Verified'
        },
        {
          id: `stg-file-${Date.now()}-3`,
          rowNumber: 3,
          customerAccount: selectedCustomer,
          effectiveDate: effectiveDate || '2026-07-01',
          expirationDate: expirationDate || '2027-06-30',
          origin: 'Seattle, WA (Terminal 18)',
          destination: 'Spokane, WA (Dist Center)',
          rate: '$890.00',
          equipment: "53' Dry Van",
          serviceType: 'Regional Drayage',
          fuelScale: `${selectedCustomer} FSC Scale`,
          freeDetentionHours: '2 Hrs',
          detentionRate: '$75.00/hr',
          chassisFreeDays: '2 Days',
          chassisSplitFee: '$80.00',
          chassisDailyRate: '$40.00',
          demurrageFreeDays: '4 Days',
          status: 'Verified'
        }
      ];
      setStagedRecords(sampleLanes);
      setStagedTableViewMode('compact_lanes');
      setPasteParsedCount(sampleLanes.length);
      setCustomerAspects((prev) => ({
        ...prev,
        [selectedCustomer]: { ...(prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' }), lanes: 'staged' }
      }));
    }
    setActiveStagingTab('staged_data');
    setTimeout(() => {
      document.getElementById('staging-preview-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setFileName(file.name.replace(/\.[^/.]+$/, ''));
      onUploadFileSimulated(file.name);
      populateStagingFromFile(file.name);
      triggerStandardizationScan(450);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      setFileName(file.name.replace(/\.[^/.]+$/, ''));
      onUploadFileSimulated(file.name);
      populateStagingFromFile(file.name);
      triggerStandardizationScan(450);
    }
  };

  const handleLoadTemplateData = (template: WorkingTemplate) => {
    setUploadedFileName(template.filename);
    setFileName(template.name.replace(/[^a-zA-Z0-9_]/g, '_'));
    onUploadFileSimulated(template.filename);
    setActiveSubTab('import');

    if (template.id === 'tpl-fuel-surcharge') {
      const fuelStaged: FuelScaleBracket[] = template.sampleRows.map((r, i) => ({
        id: `stg-fuel-${Date.now()}-${i}`,
        doeMin: Number(r.DOE_Diesel_Min_USD || 3.50 + i * 0.10),
        doeMax: Number(r.DOE_Diesel_Max_USD || 3.599 + i * 0.10),
        fscPercent: String(r.FSC_Percentage || `${14.5 + i * 0.5}%`),
        flatRatePerMile: Number(r.FSC_Flat_Per_Mile_USD || 0.38 + i * 0.02),
        effectiveDate: String(r.Effective_Date || effectiveDate || '2026-07-01'),
        expirationDate: String(r.Expiration_Date || expirationDate || '2026-12-31'),
        notes: String(r.Notes || `${selectedCustomer} Fuel Bracket ${i + 1}`),
        status: 'Verified'
      }));
      setStagedFuelScale(fuelStaged);
      setStagedTableViewMode('fuel_scale');
      setActiveStagingTab('staged_data');
      setPasteParsedCount(fuelStaged.length);
      setCustomerAspects((prev) => ({
        ...prev,
        [selectedCustomer]: { ...(prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' }), fuel: 'staged' }
      }));
    } else if (template.id === 'tpl-chassis-demurrage') {
      const chassisStaged: ChassisScheduleRecord[] = template.sampleRows.map((r, i) => ({
        id: `stg-chas-${Date.now()}-${i}`,
        customer: String(r.CUSTOMER || selectedCustomer),
        chassisType: String(r.Chassis_Type || 'PRIVATE'),
        flag: (r.FLAG === 'BILLABLE' ? 'BILLABLE' : 'NOT BILLABLE') as 'BILLABLE' | 'NOT BILLABLE',
        freeDays: Number(r.FREEDAYS || 0),
        neRate: String(r.NE || '$ -'),
        nwRate: String(r.NW || '$ 40.00'),
        seRate: String(r.SE || '$ -'),
        swRate: String(r.SW || '$ 40.00'),
        allInRate: String(r['All-in Rate'] || ''),
        agreement: String(r.Agreement || ''),
        notes: String(r.Notes || ''),
        status: 'Verified'
      }));
      setStagedChassisRecords(chassisStaged);
      setStagedTableViewMode('chassis_schedule');
      setActiveStagingTab('staged_data');
      setPasteParsedCount(chassisStaged.length);
      setCustomerAspects((prev) => ({
        ...prev,
        [selectedCustomer]: { ...(prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' }), chassis: 'staged' }
      }));
    } else if (template.id === 'tpl-recommended-carriers') {
      const carriersStaged: RecommendedCarrierRecord[] = template.sampleRows.map((r, i) => ({
        id: `stg-carr-tpl-${Date.now()}-${i}`,
        dotNumber: String(r['DOT#'] || '0000000'),
        carrierName: String(r['Carrier Name'] || 'Carrier'),
        truckCount: Number(r['Truck Count'] || 1),
        loadsHauled2026: Number(r['Loads Hauled in 2026'] || 0),
        homeState: String(r['Home State'] || 'CA'),
        region: String(r['Region'] || 'PSW'),
        notes: String(r['Notes / Dettached?'] || ''),
        status: 'Verified'
      }));
      setStagedCarriers(carriersStaged);
      setStagedTableViewMode('recommended_carriers');
      setActiveStagingTab('staged_data');
      setPasteParsedCount(carriersStaged.length);
      setDownloadToast(`Parsed & staged ${carriersStaged.length} recommended carriers with Home State origin matching.`);
      setTimeout(() => setDownloadToast(null), 4000);
    } else if (template.id === 'tpl-accessorial-benchmarks') {
      const accStaged: StagedAccessorial[] = template.sampleRows.map((r, i) => ({
        id: `stg-acc-tpl-${Date.now()}-${i}`,
        customerAccount: selectedCustomer,
        chargeType: String(r.Accessorial_Type || r.Charge_Name || 'Driver Detention'),
        rate: String(r.Rate_USD || r.Rate || '$75.00'),
        unit: String(r.Unit || 'Per hour'),
        freeQty: String(r.Free_Hours || r.Free_Quantity || '2'),
        freeUnit: 'hour',
        context: String(r.Location_Context || 'Port / Terminal'),
        laneScope: 'All lanes',
        notes: String(r.Notes || 'Standard contract tariff rule'),
        status: 'Verified'
      }));
      setStagedAccessorials(accStaged);
      setStagedTableViewMode('accessorials');
      setActiveStagingTab('staged_data');
      setPasteParsedCount(accStaged.length);
      setCustomerAspects((prev) => ({
        ...prev,
        [selectedCustomer]: { ...(prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' }), accessorials: 'staged' }
      }));
    } else {
      const laneStaged: StagedRecord[] = template.sampleRows.map((r, i) => ({
        id: `stg-lane-tpl-${Date.now()}-${i}`,
        rowNumber: i + 1,
        customerAccount: selectedCustomer,
        effectiveDate: String(r.Effective_Date || effectiveDate || '2026-07-01'),
        expirationDate: String(r.Expiration_Date || expirationDate || '2027-06-30'),
        origin: String(r.Origin_City ? `${r.Origin_City}, ${r.Origin_State}` : (r.pickup_loc_City ? `${r.pickup_loc_City}, ${r.pickup_loc_StateProvince}` : 'Oakland, CA')),
        destination: String(r.Destination_City ? `${r.Destination_City}, ${r.Destination_State}` : (r.drop_loc_City ? `${r.drop_loc_City}, ${r.drop_loc_StateProvince}` : 'Sacramento, CA')),
        rate: `$${r.Target_Base_Rate_USD || r['CARRIER LH + FSC + SURGE'] || 750}`,
        equipment: String(r.Equipment_Type || "53' Dry Van"),
        serviceType: 'Regional Drayage',
        fuelScale: `${selectedCustomer} FSC Scale`,
        freeDetentionHours: '2 Hrs',
        detentionRate: '$75.00/hr',
        chassisFreeDays: '2 Days',
        chassisSplitFee: '$85.00',
        chassisDailyRate: '$42.50',
        demurrageFreeDays: '4 Days',
        status: 'Verified'
      }));
      setStagedRecords(laneStaged);
      setStagedTableViewMode('compact_lanes');
      setActiveStagingTab('staged_data');
      setPasteParsedCount(laneStaged.length);
      setCustomerAspects((prev) => ({
        ...prev,
        [selectedCustomer]: { ...(prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' }), lanes: 'staged' }
      }));
    }

    setDownloadToast(`Loaded ${template.name} into import workflow staging!`);
    setTimeout(() => setDownloadToast(null), 3500);
    triggerStandardizationScan(450);
    setTimeout(() => {
      document.getElementById('staging-preview-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 animate-in fade-in duration-200 space-y-6 pb-12">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed top-20 right-8 z-50 bg-[#0B1930] text-white px-5 py-3 rounded-xl shadow-2xl border border-[#1769FF] flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[#10B981]">check_circle</span>
          <span className="text-xs font-bold">{downloadToast}</span>
        </div>
      )}

      {/* Top Section Banner & Sub-tab Switcher */}
      <div className="bg-white border border-[#D8E1EB] rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#0B1930] tracking-tight">Data Management & Templates</h1>
            <span className="bg-[#1769FF]/10 text-[#1769FF] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              v4.2 Active
            </span>
          </div>
          <p className="text-xs text-[#475569] mt-0.5">
            Download working CSV templates, upload bulk rate files, and review staging validation issues.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0] text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('import')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'import'
                ? 'bg-white text-[#1769FF] shadow-sm font-extrabold'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span className="material-symbols-outlined text-base">cloud_upload</span>
            <span>Import & Staging</span>
          </button>
          <button
            onClick={() => setActiveSubTab('templates')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'templates'
                ? 'bg-white text-[#1769FF] shadow-sm font-extrabold'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span className="material-symbols-outlined text-base">folder_open</span>
            <span>Working Templates ({WORKING_TEMPLATES.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('carrier_matching')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'carrier_matching'
                ? 'bg-white text-[#1769FF] shadow-sm font-extrabold'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span className="material-symbols-outlined text-base">local_shipping</span>
            <span>Recommended Carriers & Origin Matching</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Main Import & Master Datasets View */}
      {activeSubTab === 'import' && (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Datasets List Column */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-base text-[#0B1930]">Master Datasets</h2>
              <span className="font-bold text-[10px] text-[#45474d] bg-[#E5EEFF] px-2 py-0.5 rounded uppercase tracking-wider">
                {datasets.length} ACTIVE
              </span>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {datasets.map((ds) => {
                const tpl = getTemplateForDataset(ds.name);
                return (
                  <div
                    key={ds.id}
                    className="bg-white border border-[#D8E1EB] p-4 rounded-xl hover:border-[#1769FF] transition-colors shadow-sm group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-sm text-[#0B1930]">{ds.name}</h3>
                      <span className="bg-[#178A68]/10 text-[#178A68] px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                        {ds.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 text-[#45474d] text-xs mb-3">
                      <div>
                        <p className="font-bold text-[10px] uppercase text-[#7784a0]">RECORDS</p>
                        <p className="text-[#0B1930] font-semibold tabular-nums">{ds.recordsCount.toLocaleString()} rows</p>
                      </div>
                      <div>
                        <p className="font-bold text-[10px] uppercase text-[#7784a0]">COVERAGE</p>
                        <p className="text-[#0B1930] font-semibold">{ds.coverage}</p>
                      </div>
                      {ds.lastUpload && (
                        <div className="col-span-2">
                          <p className="font-bold text-[10px] uppercase text-[#7784a0]">LAST UPLOAD</p>
                          <p className="text-[#0B1930]">{ds.lastUpload}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons with Working Templates */}
                    <div className="flex gap-2 pt-2 border-t border-[#D8E1EB]">
                      <button
                        onClick={() => handleLoadTemplateData(tpl)}
                        className="flex-1 py-1.5 bg-[#1769FF] text-white rounded font-bold text-[10px] uppercase tracking-wider hover:bg-[#1769FF]/90 transition-colors shadow-sm"
                      >
                        STAGE DATA
                      </button>
                      <button
                        onClick={() => handleDownloadCSV(tpl)}
                        className="flex-1 py-1.5 border border-[#1769FF] text-[#1769FF] bg-[#EAF2FF] rounded font-bold text-[10px] uppercase tracking-wider hover:bg-[#1769FF] hover:text-white transition-colors flex items-center justify-center gap-1"
                        title="Download working CSV template file"
                      >
                        <span className="material-symbols-outlined text-xs">download</span>
                        <span>TEMPLATE</span>
                      </button>
                      <button
                        onClick={() => setPreviewTemplate(tpl)}
                        className="px-2.5 py-1.5 border border-[#D8E1EB] text-[#0B1930] rounded hover:bg-[#F4F7FA] transition-colors"
                        title="Preview Template Schema"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Main Workspace Column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* New Import Workflow Area */}
            <div className="bg-white border border-[#D8E1EB] rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] flex items-center justify-center text-[#1769FF]">
                    <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-[#0B1930]">New Import Workflow</h2>
                    <p className="text-xs text-[#45474d]">Bulk update rates, FSC matrices, or city mapping files</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B] font-medium">Quick Template:</span>
                  <select
                    onChange={(e) => {
                      const found = WORKING_TEMPLATES.find((t) => t.id === e.target.value);
                      if (found) handleDownloadCSV(found);
                    }}
                    defaultValue=""
                    className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#1E293B] px-3 py-1.5 focus:border-[#1769FF] focus:outline-none"
                  >
                    <option value="" disabled>
                      📥 Download CSV Template...
                    </option>
                    {WORKING_TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Selection First & Active Profile Status Banner */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#1769FF] text-2xl">group_add</span>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block">
                        STEP 1: SELECT CUSTOMER ACCOUNT FIRST
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <select
                          value={selectedCustomer}
                          onChange={(e) => setSelectedCustomer(e.target.value)}
                          className="bg-white border-2 border-[#1769FF] text-sm font-extrabold py-1.5 px-3 rounded-xl text-[#0B1930] focus:ring-2 focus:ring-[#1769FF] shadow-xs cursor-pointer min-w-[240px]"
                        >
                          {customCustomers.map((cust) => (
                            <option key={cust} value={cust}>
                              🏢 {cust}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowNewCustomerModal(true)}
                          className="px-3 py-1.5 bg-[#1769FF] text-white rounded-xl text-xs font-bold hover:bg-[#1769FF]/90 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                          <span>Onboard New Customer</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Customer Profile Badge */}
                  {(() => {
                    const custState = customerAspects[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' };
                    const completedCount = Object.values(custState).filter((s) => s === 'completed' || s === 'na').length;
                    const isActive = completedCount === 4;

                    return (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-1">
                          PROFILE STATUS
                        </span>
                        {isActive ? (
                          <span className="bg-[#178A68] text-white font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            <span>ACTIVE CUSTOMER RATE PROFILE (4/4 Completed or N/A)</span>
                          </span>
                        ) : (
                          <span className="bg-[#D58A16]/15 text-[#D58A16] border border-[#D58A16]/30 font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                            <span className="material-symbols-outlined text-sm">pending_actions</span>
                            <span>INCOMPLETE PROFILE ({completedCount}/4 Completed or N/A)</span>
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wide flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#1769FF] text-base">account_tree</span>
                    <span>4-Aspect Rate Import Pipeline for {selectedCustomer}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B]">
                    All 4 sections must be Completed or marked N/A (Does Not Apply) for profile to be active.
                  </span>
                </div>

                {/* 4 Aspect Cards */}
                {(() => {
                  const custState = customerAspects[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' };

                  const toggleNa = (aspect: 'fuel' | 'lanes' | 'accessorials' | 'chassis') => {
                    setCustomerAspects((prev) => {
                      const current = prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' };
                      const newStatus = current[aspect] === 'na' ? 'pending' : 'na';
                      return { ...prev, [selectedCustomer]: { ...current, [aspect]: newStatus } };
                    });
                  };

                  const getAspectBadge = (status: 'completed' | 'staged' | 'pending' | 'na') => {
                    if (status === 'completed') {
                      return (
                        <span className="bg-[#178A68]/10 text-[#178A68] border border-[#178A68]/30 px-2 py-0.5 rounded-md font-extrabold text-[10px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          <span>✓ Completed</span>
                        </span>
                      );
                    }
                    if (status === 'staged') {
                      return (
                        <span className="bg-[#1769FF]/10 text-[#1769FF] border border-[#1769FF]/30 px-2 py-0.5 rounded-md font-extrabold text-[10px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">hourglass_top</span>
                          <span>⏳ Staged</span>
                        </span>
                      );
                    }
                    if (status === 'na') {
                      return (
                        <span className="bg-[#64748B]/10 text-[#64748B] border border-[#CBD5E1] px-2 py-0.5 rounded-md font-extrabold text-[10px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">block</span>
                          <span>🚫 N/A (Does Not Apply)</span>
                        </span>
                      );
                    }
                    return (
                      <span className="bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">radio_button_unchecked</span>
                        <span>Pending</span>
                      </span>
                    );
                  };

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
                      {/* Aspect 1: Fuel Scale */}
                      <div className="bg-white border border-[#CBD5E1] rounded-xl p-3 shadow-2xs flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-[10px] text-[#1769FF] uppercase tracking-wider">
                              1. Fuel Scale
                            </span>
                            {getAspectBadge(custState.fuel)}
                          </div>
                          <p className="font-extrabold text-xs text-[#0B1930] truncate flex items-center gap-1">
                            <span className="text-amber-500">⭐</span>
                            <span>Fuel Scale Option</span>
                          </p>
                          <p className="text-[11px] text-[#64748B]">Select Forrest, Customer Scale, or N/A</p>
                        </div>
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-[#F1F5F9]">
                          <button
                            type="button"
                            onClick={() => {
                              setCustomerAspects((prev) => ({
                                ...prev,
                                [selectedCustomer]: { ...(prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' }), fuel: 'completed' }
                              }));
                              setDownloadToast(`✓ Selected Forrest Fuel Scale for ${selectedCustomer}`);
                              setTimeout(() => setDownloadToast(null), 3500);
                            }}
                            className="w-full py-1.5 px-2 bg-[#178A68] hover:bg-[#178A68]/90 text-white rounded-lg font-extrabold text-[10px] uppercase tracking-wider transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[14px]">local_gas_station</span>
                            <span>Use Forrest Fuel Scale</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const fuelTpl = WORKING_TEMPLATES.find((t) => t.id === 'tpl-fuel-surcharge') || WORKING_TEMPLATES[1];
                                handleLoadTemplateData(fuelTpl);
                                setFileName(`Customer_Fuel_Scale_${selectedCustomer.replace(/[^a-zA-Z0-9]/g, '_')}`);
                              }}
                              className="flex-1 py-1 px-2 bg-[#1769FF] text-white rounded-lg font-extrabold text-[10px] uppercase tracking-wider hover:bg-[#1769FF]/90 transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[12px]">upload_file</span>
                              <span>Stage Custom Scale</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleNa('fuel')}
                              className={`py-1 px-2 rounded-lg font-bold text-[10px] border transition-colors cursor-pointer ${
                                custState.fuel === 'na' ? 'bg-[#334155] text-white border-[#334155]' : 'bg-white text-[#64748B] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                              }`}
                              title="Mark as N/A if customer uses all-in fuel rates"
                            >
                              {custState.fuel === 'na' ? 'N/A Set' : 'Mark N/A'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Aspect 2: Rate Lanes */}
                      <div className="bg-white border border-[#CBD5E1] rounded-xl p-3 shadow-2xs flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-[10px] text-[#1769FF] uppercase tracking-wider">
                              2. Rate Lanes
                            </span>
                            {getAspectBadge(custState.lanes)}
                          </div>
                          <p className="font-bold text-xs text-[#0B1930] truncate">Contract Rate Lanes</p>
                          <p className="text-[11px] text-[#64748B]">Origin/Dest City pairs & rates</p>
                        </div>
                        <div className="flex items-center gap-1.5 pt-2 border-t border-[#F1F5F9]">
                          <button
                            type="button"
                            onClick={() => {
                              handleLoadTemplateData(WORKING_TEMPLATES[0]);
                              setFileName(`Rate_Lanes_${selectedCustomer.replace(/[^a-zA-Z0-9]/g, '_')}`);
                              setCustomerAspects((prev) => ({
                                ...prev,
                                [selectedCustomer]: { ...(prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' }), lanes: 'staged' }
                              }));
                            }}
                            className="flex-1 py-1 px-2 bg-[#1769FF] text-white rounded-lg font-extrabold text-[10px] uppercase tracking-wider hover:bg-[#1769FF]/90 transition-colors cursor-pointer text-center"
                          >
                            Stage Lanes
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleNa('lanes')}
                            className={`py-1 px-2 rounded-lg font-bold text-[10px] border transition-colors cursor-pointer ${
                              custState.lanes === 'na' ? 'bg-[#334155] text-white border-[#334155]' : 'bg-white text-[#64748B] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                            }`}
                            title="Mark as N/A if customer has no dedicated contract lanes"
                          >
                            {custState.lanes === 'na' ? 'N/A Set' : 'Mark N/A'}
                          </button>
                        </div>
                      </div>

                      {/* Aspect 3: Accessorials */}
                      <div className="bg-white border border-[#CBD5E1] rounded-xl p-3 shadow-2xs flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-[10px] text-[#1769FF] uppercase tracking-wider">
                              3. Accessorials
                            </span>
                            {getAspectBadge(custState.accessorials)}
                          </div>
                          <p className="font-bold text-xs text-[#0B1930] truncate">Accessorial Tariff Rules</p>
                          <p className="text-[11px] text-[#64748B]">Detention, TONU & Pre-pull fees</p>
                        </div>
                        <div className="flex items-center gap-1.5 pt-2 border-t border-[#F1F5F9]">
                          <button
                            type="button"
                            onClick={() => {
                              handleLoadTemplateData(WORKING_TEMPLATES[2]);
                              setFileName(`Accessorials_${selectedCustomer.replace(/[^a-zA-Z0-9]/g, '_')}`);
                              setCustomerAspects((prev) => ({
                                ...prev,
                                [selectedCustomer]: { ...(prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' }), accessorials: 'staged' }
                              }));
                            }}
                            className="flex-1 py-1 px-2 bg-[#1769FF] text-white rounded-lg font-extrabold text-[10px] uppercase tracking-wider hover:bg-[#1769FF]/90 transition-colors cursor-pointer text-center"
                          >
                            Stage Accessorials
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleNa('accessorials')}
                            className={`py-1 px-2 rounded-lg font-bold text-[10px] border transition-colors cursor-pointer ${
                              custState.accessorials === 'na' ? 'bg-[#334155] text-white border-[#334155]' : 'bg-white text-[#64748B] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                            }`}
                            title="Mark as N/A if customer does not bill separate accessorials"
                          >
                            {custState.accessorials === 'na' ? 'N/A Set' : 'Mark N/A'}
                          </button>
                        </div>
                      </div>

                      {/* Aspect 4: Chassis & Demurrage */}
                      <div className="bg-white border border-[#CBD5E1] rounded-xl p-3 shadow-2xs flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-[10px] text-[#1769FF] uppercase tracking-wider">
                              4. Chassis & Port
                            </span>
                            {getAspectBadge(custState.chassis)}
                          </div>
                          <p className="font-bold text-xs text-[#0B1930] truncate">Chassis & Demurrage</p>
                          <p className="text-[11px] text-[#64748B]">Splits, Free Days & Storage</p>
                        </div>
                        <div className="flex items-center gap-1.5 pt-2 border-t border-[#F1F5F9]">
                          <button
                            type="button"
                            onClick={() => {
                              const chassisTpl = WORKING_TEMPLATES.find((t) => t.id === 'tpl-chassis-demurrage') || WORKING_TEMPLATES[2];
                              handleLoadTemplateData(chassisTpl);
                              setFileName(`Chassis_Rules_${selectedCustomer.replace(/[^a-zA-Z0-9]/g, '_')}`);
                              setCustomerAspects((prev) => ({
                                ...prev,
                                [selectedCustomer]: { ...(prev[selectedCustomer] || { fuel: 'pending', lanes: 'pending', accessorials: 'pending', chassis: 'pending' }), chassis: 'staged' }
                              }));
                            }}
                            className="flex-1 py-1 px-2 bg-[#1769FF] text-white rounded-lg font-extrabold text-[10px] uppercase tracking-wider hover:bg-[#1769FF]/90 transition-colors cursor-pointer text-center"
                          >
                            Stage Chassis
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleNa('chassis')}
                            className={`py-1 px-2 rounded-lg font-bold text-[10px] border transition-colors cursor-pointer ${
                              custState.chassis === 'na' ? 'bg-[#334155] text-white border-[#334155]' : 'bg-white text-[#64748B] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                            }`}
                            title="Mark as N/A if customer has no separate chassis/port fees"
                          >
                            {custState.chassis === 'na' ? 'N/A Set' : 'Mark N/A'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Import Input Method Switcher */}
              <div className="flex flex-wrap items-center justify-between border-b border-[#E2E8F0] pb-3 gap-3">
                <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-xl border border-[#CBD5E1] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setInputMethod('file')}
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      inputMethod === 'file'
                        ? 'bg-[#1769FF] text-white shadow-sm font-extrabold'
                        : 'text-[#475569] hover:text-[#0F172A]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    <span>Upload Spreadsheet (CSV / XLSX)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMethod('paste');
                      if (!pastedText) {
                        setPastedText(
                          `Origin\tDestination\tBase Rate ($)\tEquipment\tService Type\nOakland, CA\tSacramento, CA\t720.00\t40' Dry Van\tRegional Drayage\nLos Angeles, CA\tPhoenix, AZ\t1450.00\t53' Dry Van\tInterstate Freight\nSeattle, WA\tSpokane, WA\t890.00\t53' Dry Van\tRegional Drayage`
                        );
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      inputMethod === 'paste'
                        ? 'bg-[#1769FF] text-white shadow-sm font-extrabold'
                        : 'text-[#475569] hover:text-[#0F172A]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">content_paste</span>
                    <span>Quick Paste Data (Few Lanes / TSV)</span>
                  </button>
                </div>

                <span className="text-[11px] font-medium text-[#64748B]">
                  {inputMethod === 'file'
                    ? '📁 Supports bulk CSV, XLS, or XLSX spreadsheet uploads'
                    : '📋 Paste text copied directly from Excel, Google Sheets, or Email'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Area: File Dropzone OR Paste Textarea */}
                {inputMethod === 'file' ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-colors relative min-h-[220px] ${
                      dragActive ? 'border-[#1769FF] bg-[#EAF2FF]' : 'border-[#D8E1EB] bg-[#F8FAFC] hover:bg-[#EAF2FF]/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <span className="material-symbols-outlined text-4xl text-[#1769FF] mb-2">upload_file</span>
                    <p className="font-bold text-sm text-[#0B1930]">
                      {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Drop CSV or XLSX file here'}
                    </p>
                    <p className="text-xs text-[#64748B] mt-1">Accepts standard working templates & CSV exports</p>
                    <div className="flex items-center gap-2 mt-4 pointer-events-none">
                      <button
                        type="button"
                        className="px-4 py-2 bg-[#1769FF] text-white rounded-lg text-xs font-bold shadow-sm"
                      >
                        BROWSE FILE
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-3.5">
                    {/* Schema Mode Selector Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white border border-[#CBD5E1] rounded-xl shadow-2xs">
                      <span className="text-[11px] font-extrabold text-[#0F172A] flex items-center gap-1 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-sm text-[#1769FF]">schema</span>
                        <span>Dataset Schema:</span>
                      </span>

                      <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg border border-[#CBD5E1] text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setImportDatasetType('auto')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            importDatasetType === 'auto'
                              ? 'bg-[#0B1930] text-white shadow-2xs'
                              : 'text-[#475569] hover:text-[#0F172A]'
                          }`}
                        >
                          ✨ Auto-Detect
                        </button>
                        <button
                          type="button"
                          onClick={() => setImportDatasetType('lanes')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            importDatasetType === 'lanes'
                              ? 'bg-[#1769FF] text-white shadow-2xs'
                              : 'text-[#475569] hover:text-[#0F172A]'
                          }`}
                        >
                          🚚 Rate Lanes
                        </button>
                        <button
                          type="button"
                          onClick={() => setImportDatasetType('accessorials')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            importDatasetType === 'accessorials'
                              ? 'bg-[#1769FF] text-white shadow-2xs'
                              : 'text-[#475569] hover:text-[#0F172A]'
                          }`}
                        >
                          🏷️ Accessorial Tariffs
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="font-extrabold text-[10px] text-[#0F172A] uppercase tracking-wider block">
                        PASTE RAW DATA (COPIED FROM EXCEL / SHEETS)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setImportDatasetType('lanes');
                            setPastedText(
                              `Origin\tDestination\tBase Rate ($)\tEquipment\tService Type\nOakland, CA\tSacramento, CA\t720.00\t40' Dry Van\tRegional Drayage\nLos Angeles, CA\tPhoenix, AZ\t1450.00\t53' Dry Van\tInterstate Freight\nSeattle, WA\tSpokane, WA\t890.00\t53' Dry Van\tRegional Drayage`
                            );
                            setPasteError(null);
                          }}
                          className="text-[10px] font-bold text-[#1769FF] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">auto_fix_high</span>
                          <span>Sample Lanes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImportDatasetType('accessorials');
                            setPastedText(
                              `Customer\tCharge\tRate\tUnit\tFree Qty\tFree Unit\tContext\tNotes\n${selectedCustomer}\tBobtail\t70% of LH\t% of linehaul\t\t\tPort · LA/LB\tPort: USLAX, USLGB\n${selectedCustomer}\tChassis Split\t$91.00\tPer move\t\t\tPort · LA/LB\tPort: USLAX, USLGB\n${selectedCustomer}\tDriver Detention\t$80.00\tPer hour\t2\thour\tWarehouse\t2 hrs free time allowance\n${selectedCustomer}\tPre-Pull\t$94.00\tPer move\t\t\tPort · LA/LB\tTerminal pre-pull fee\n${selectedCustomer}\tYard Storage\t$32.00\tPer day\t1\tday\tPort · LA/LB\t1 day free storage included`
                            );
                            setPasteError(null);
                          }}
                          className="text-[10px] font-bold text-[#178A68] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">sell</span>
                          <span>Sample Accessorials</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPastedText('');
                            setPasteParsedCount(null);
                            setPasteError(null);
                          }}
                          className="text-[10px] font-bold text-[#64748B] hover:text-[#D64545] cursor-pointer ml-1"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={6}
                      value={pastedText}
                      onChange={(e) => {
                        setPastedText(e.target.value);
                        setPasteError(null);
                      }}
                      placeholder={`Paste table rows directly here...\n\nExample (Accessorials):\nCustomer\tCharge\tRate\tUnit\tFree Qty\tContext\nDollar Tree\tBobtail\t70% of LH\t% of linehaul\t\tPort · LA/LB`}
                      className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 font-mono text-[11px] text-[#0F172A] focus:border-[#1769FF] focus:outline-none transition-all leading-relaxed"
                    />

                    {pasteError && (
                      <p className="text-[11px] font-bold text-[#D64545] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">error</span>
                        <span>{pasteError}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between pt-1 gap-2">
                      <span className="text-[10px] text-[#64748B] font-medium">
                        Tab (\t) and comma (,) delimited columns
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const isAcc = importDatasetType === 'accessorials' || (importDatasetType === 'auto' && checkIsAccessorialData(pastedText));
                            const schema = isAcc ? 'accessorials' : 'lanes';
                            setMapperSchemaMode(schema);
                            setColAssignments(autoAssignColumns(schema, detectedCols));
                            setShowColumnMapModal(true);
                          }}
                          className="px-3 py-1.5 border border-[#1769FF] text-[#1769FF] bg-[#EAF2FF] hover:bg-[#1769FF] hover:text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">tune</span>
                          <span>Field Mapper</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleParsePastedText}
                          className="px-3.5 py-1.5 bg-[#1769FF] text-white rounded-lg font-extrabold text-xs hover:bg-[#1769FF]/90 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">published_with_changes</span>
                          <span>Parse & Stage Data</span>
                        </button>
                      </div>
                    </div>

                    {pasteParsedCount !== null && (
                      <div className="p-2 bg-[#EAFDF5] border border-[#178A68]/30 rounded-lg flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-[#178A68] font-bold">
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          <span>Parsed & Staged {pasteParsedCount} row(s) cleanly!</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-[#178A68] uppercase bg-white px-2 py-0.5 rounded border border-[#178A68]/20">
                          Ready in Staging Preview
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Form Controls */}
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-[10px] text-[#45474d] mb-1 block uppercase tracking-wider">
                      FILE / BATCH NAME
                    </label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="e.g., Q3_Lanes_Update_v2"
                      className="w-full bg-white border border-[#D8E1EB] rounded-lg px-3 py-2 text-xs font-semibold text-[#0B1930] focus:border-[#1769FF] focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-[10px] text-[#45474d] block uppercase tracking-wider">
                        CUSTOMER LOGISTICS ACCOUNT
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNewCustomerModal(true)}
                        className="text-[10px] font-extrabold text-[#1769FF] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">add_circle</span>
                        <span>+ Add New Customer</span>
                      </button>
                    </div>
                    <select
                      value={selectedCustomer}
                      onChange={(e) => {
                        if (e.target.value === '__ADD_NEW__') {
                          setShowNewCustomerModal(true);
                        } else {
                          setSelectedCustomer(e.target.value);
                        }
                      }}
                      className="w-full bg-white border border-[#D8E1EB] rounded-lg px-3 py-2 text-xs font-semibold text-[#0B1930] focus:border-[#1769FF] focus:outline-none cursor-pointer"
                    >
                      {customCustomers.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__ADD_NEW__" className="font-bold text-[#1769FF]">
                        + Add New Customer Account...
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[10px] text-[#45474d] mb-1 block uppercase tracking-wider">
                        EFFECTIVE DATE
                      </label>
                      <input
                        type="date"
                        value={effectiveDate}
                        onChange={(e) => setEffectiveDate(e.target.value)}
                        className="w-full bg-white border border-[#D8E1EB] rounded-lg px-3 py-2 text-xs font-semibold text-[#0B1930] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[10px] text-[#45474d] mb-1 block uppercase tracking-wider">
                        EXPIRATION DATE
                      </label>
                      <input
                        type="date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        className="w-full bg-white border border-[#D8E1EB] rounded-lg px-3 py-2 text-xs font-semibold text-[#0B1930] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-[#0B1930]">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replacement'}
                        onChange={() => setImportMode('replacement')}
                        className="text-[#1769FF] focus:ring-[#1769FF]"
                      />
                      <span>Complete Replacement</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-[#0B1930]">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="text-[#1769FF] focus:ring-[#1769FF]"
                      />
                      <span>Append</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Summary Card */}
            <div id="staging-preview-section" className="bg-white border border-[#D8E1EB] rounded-2xl shadow-sm overflow-hidden scroll-mt-20">
              <div className="p-4 border-b border-[#D8E1EB] flex flex-wrap justify-between items-center gap-2 bg-[#F4F7FA]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#0B1930]">Validation Summary & Staging Preview</span>
                  <span className="bg-[#178A68]/10 text-[#178A68] px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#178A68] animate-pulse"></span>
                    <span>{stagedRecords.length} Staged Rows Active</span>
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRateDirectoryPreviewModal(true)}
                    className="px-3.5 py-1.5 bg-[#EAF2FF] border border-[#1769FF] text-[#1769FF] hover:bg-[#1769FF] hover:text-white rounded-lg font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="Preview how these rates will appear on the Rate Directory page before publishing"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>PREVIEW RATE DIRECTORY</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardAllStaging}
                    className="px-3.5 py-1.5 border border-[#CBD5E1] text-[#D64545] hover:bg-[#FEF2F2] hover:border-[#FCA5A5] rounded-lg font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="Discard all currently staged records and reset staging preview"
                  >
                    <span className="material-symbols-outlined text-sm">delete_sweep</span>
                    <span>DISCARD STAGING</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCommitAllStaging}
                    className="px-5 py-1.5 bg-[#1769FF] text-white rounded-lg font-extrabold text-xs hover:bg-[#1769FF]/90 transition-shadow shadow-md active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>COMMIT & PUBLISH RATES</span>
                  </button>
                </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-5 border-b border-[#D8E1EB] divide-x divide-[#D8E1EB]">
                <div className="p-4 text-center">
                  <p className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">NEW STAGED RECORDS</p>
                  <p className="font-bold text-2xl text-[#1769FF] tabular-nums mt-0.5">{stagedRecords.length}</p>
                </div>
                <div className="p-4 text-center">
                  <p className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">CHANGED</p>
                  <p className="font-bold text-2xl text-[#4F83B8] tabular-nums mt-0.5">12</p>
                </div>
                <div className="p-4 text-center">
                  <p className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">EXPIRING</p>
                  <p className="font-bold text-2xl text-[#13294B] tabular-nums mt-0.5">38</p>
                </div>
                <div className="p-4 text-center">
                  <p className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">ERRORS</p>
                  <p className="font-bold text-2xl text-[#178A68] tabular-nums mt-0.5">0</p>
                </div>
                <div className="p-4 text-center">
                  <p className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider">WARNINGS</p>
                  <p className="font-bold text-2xl text-[#D58A16] tabular-nums mt-0.5">
                    {validationIssues.filter((i) => !i.resolved).length}
                  </p>
                </div>
              </div>

              {/* Tab Navigation for Staging Preview vs Issues */}
              <div className="p-4 bg-[#F8FAFC] border-b border-[#D8E1EB] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveStagingTab('staged_data')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeStagingTab === 'staged_data'
                        ? 'bg-[#1769FF] text-white shadow-xs'
                        : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">table_view</span>
                    <span>Staged Data Preview ({stagedRecords.length} rows)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStagingTab('validation_logs')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeStagingTab === 'validation_logs'
                        ? 'bg-[#1769FF] text-white shadow-xs'
                        : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">warning</span>
                    <span>Validation Issues & Logs ({validationIssues.length})</span>
                  </button>

                  {/* Fix Column Mapping Trigger */}
                  <button
                    type="button"
                    onClick={() => setShowColumnMapModal(true)}
                    className="px-3 py-1.5 bg-[#EAF2FF] border border-[#1769FF] text-[#1769FF] hover:bg-[#1769FF] hover:text-white rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer ml-1"
                    title="Fix wrong column headers or reorder fields"
                  >
                    <span className="material-symbols-outlined text-sm">tune</span>
                    <span>Fix Column Labels / Remap Headers</span>
                  </button>
                </div>

                {activeStagingTab === 'staged_data' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">
                        search
                      </span>
                      <input
                        type="text"
                        placeholder="Filter staged lanes..."
                        value={stagedFilterQuery}
                        onChange={(e) => setStagedFilterQuery(e.target.value)}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg pl-8 pr-3 py-1 text-xs text-[#0F172A] focus:border-[#1769FF] focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddStagedRecord}
                      className="px-3 py-1 bg-[#178A68] hover:bg-[#178A68]/90 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs whitespace-nowrap cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      <span>+ Add Lane Row</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Main Content Area: Staged Data Table or Validation Issues */}
              <div className="p-4">
                {activeStagingTab === 'staged_data' ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F1F5F9] p-2 rounded-xl border border-[#CBD5E1]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider pl-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-[#1769FF]">alt_route</span>
                          <span>Staging View Mode:</span>
                        </span>
                        <div className="flex flex-wrap items-center gap-1 bg-white p-0.5 rounded-lg border border-[#CBD5E1]">
                          <button
                            type="button"
                            onClick={() => setStagedTableViewMode('compact_lanes')}
                            className={`px-2.5 py-1 rounded text-[11px] font-extrabold cursor-pointer transition-colors ${
                              stagedTableViewMode === 'compact_lanes'
                                ? 'bg-[#1769FF] text-white shadow-2xs'
                                : 'text-[#475569] hover:text-[#0F172A]'
                            }`}
                          >
                            🛣️ Contract Rate Lanes ({stagedRecords.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setStagedTableViewMode('fuel_scale')}
                            className={`px-2.5 py-1 rounded text-[11px] font-extrabold cursor-pointer transition-colors ${
                              stagedTableViewMode === 'fuel_scale'
                                ? 'bg-[#1769FF] text-white shadow-2xs'
                                : 'text-[#475569] hover:text-[#0F172A]'
                            }`}
                          >
                            ⛽ Fuel Scale Matrix ({stagedFuelScale.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setStagedTableViewMode('accessorials')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              stagedTableViewMode === 'accessorials'
                                ? 'bg-[#1769FF] text-white shadow-2xs'
                                : 'text-[#475569] hover:text-[#0F172A]'
                            }`}
                          >
                            🏷️ Accessorial Tariffs ({stagedAccessorials.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setStagedTableViewMode('chassis_schedule')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              stagedTableViewMode === 'chassis_schedule'
                                ? 'bg-[#1769FF] text-white shadow-2xs'
                                : 'text-[#475569] hover:text-[#0F172A]'
                            }`}
                          >
                            🚛 Chassis Schedule ({stagedChassisRecords.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setStagedTableViewMode('recommended_carriers')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              stagedTableViewMode === 'recommended_carriers'
                                ? 'bg-[#1769FF] text-white shadow-2xs'
                                : 'text-[#475569] hover:text-[#0F172A]'
                            }`}
                          >
                            🏢 Recommended Carriers ({stagedCarriers.length})
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#059669] font-extrabold bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#059669]/30">
                          {stagedTableViewMode === 'fuel_scale'
                            ? `✓ Fuel Scale Staging Active (${stagedFuelScale.length} brackets)`
                            : stagedTableViewMode === 'chassis_schedule'
                            ? `✓ Chassis Schedule Active (${stagedChassisRecords.length} rules)`
                            : stagedTableViewMode === 'accessorials'
                            ? `✓ Accessorial Tariffs Active (${stagedAccessorials.length} rules)`
                            : stagedTableViewMode === 'recommended_carriers'
                            ? `✓ Recommended Carriers Active (${stagedCarriers.length} carriers)`
                            : `✓ Rate Lanes Staging Active (${stagedRecords.length} lanes)`}
                        </span>
                      </div>
                    </div>

                    {stagedTableViewMode === 'compact_lanes' && (
                      <div className="p-2.5 bg-[#EAF2FF] border border-[#1769FF]/30 rounded-xl text-xs text-[#1E3A8A] flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium">
                          <span className="material-symbols-outlined text-base text-[#1769FF]">info</span>
                          <span>
                            <strong>Clean Rate Lanes Grid:</strong> Only origin, destination, base tariff rates, equipment, and contract dates are displayed here. Accessorial charges (Bobtail, Chassis Split, Detention, Pre-Pull, Hazmat, etc.) are managed under the 🏷️ Accessorial Charge Tariffs tab.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowColumnMapModal(true)}
                          className="px-2.5 py-1 bg-[#1769FF] text-white rounded-lg font-bold text-[11px] hover:bg-[#1769FF]/90 cursor-pointer shrink-0 ml-2"
                        >
                          Remap Columns
                        </button>
                      </div>
                    )}

                    {stagedTableViewMode === 'fuel_scale' ? (
                      <div className="space-y-3 animate-in fade-in duration-150">
                        <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-[#0F172A]">
                            <span className="material-symbols-outlined text-base text-[#1769FF]">local_gas_station</span>
                            <span>
                              <strong>Fuel Scale Surcharge Matrix:</strong> Staged fuel index brackets for <strong>{selectedCustomer}</strong>. Rates trigger automatically based on the weekly DOE National Diesel Index.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setStagedFuelScale((prev) => [
                                ...prev,
                                {
                                  id: `stg-fuel-${Date.now()}`,
                                  doeMin: 4.00,
                                  doeMax: 4.099,
                                  fscPercent: '17.0%',
                                  flatRatePerMile: 0.48,
                                  effectiveDate: effectiveDate || '2026-07-01',
                                  expirationDate: expirationDate || '2026-12-31',
                                  notes: `${selectedCustomer} Additional FSC Bracket`,
                                  status: 'Verified'
                                }
                              ]);
                            }}
                            className="px-3 py-1 bg-[#178A68] hover:bg-[#178A68]/90 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            <span>+ Add Fuel Bracket</span>
                          </button>
                        </div>

                        <div className="overflow-x-auto border border-[#D8E1EB] rounded-lg shadow-2xs bg-white">
                          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                            <thead className="bg-[#F1F5F9] border-b border-[#D8E1EB] font-bold text-[10px] text-[#475569] uppercase tracking-wider">
                              <tr>
                                <th className="px-2.5 py-2.5 w-10 text-center">#</th>
                                <th className="px-3 py-2.5">DOE Diesel Min ($)</th>
                                <th className="px-3 py-2.5">DOE Diesel Max ($)</th>
                                <th className="px-3 py-2.5">FSC Percentage (%)</th>
                                <th className="px-3 py-2.5">Flat FSC ($/mi)</th>
                                <th className="px-3 py-2.5">Effective Date</th>
                                <th className="px-3 py-2.5">Expiration Date</th>
                                <th className="px-3 py-2.5">Notes</th>
                                <th className="px-3 py-2.5 w-24">Status</th>
                                <th className="px-2.5 py-2.5 text-center w-12">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#0F172A]">
                              {stagedFuelScale.map((f, idx) => (
                                <tr key={f.id} className="hover:bg-[#F8FAFC]">
                                  <td className="px-2.5 py-2 text-center text-[#64748B] font-bold">{idx + 1}</td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={f.doeMin}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setStagedFuelScale((prev) => prev.map((item) => (item.id === f.id ? { ...item, doeMin: val } : item)));
                                      }}
                                      className="w-24 bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs font-bold text-[#0F172A]"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={f.doeMax}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setStagedFuelScale((prev) => prev.map((item) => (item.id === f.id ? { ...item, doeMax: val } : item)));
                                      }}
                                      className="w-24 bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs font-bold text-[#0F172A]"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={f.fscPercent}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setStagedFuelScale((prev) => prev.map((item) => (item.id === f.id ? { ...item, fscPercent: val } : item)));
                                      }}
                                      className="w-24 bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs font-bold text-[#1769FF]"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={f.flatRatePerMile || ''}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setStagedFuelScale((prev) => prev.map((item) => (item.id === f.id ? { ...item, flatRatePerMile: val } : item)));
                                      }}
                                      className="w-24 bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs font-bold text-[#0F172A]"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-[#64748B]">{f.effectiveDate || '2026-07-01'}</td>
                                  <td className="px-3 py-2 text-[#64748B]">{f.expirationDate || '2026-12-31'}</td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={f.notes || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setStagedFuelScale((prev) => prev.map((item) => (item.id === f.id ? { ...item, notes: val } : item)));
                                      }}
                                      className="w-full bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs text-[#0F172A]"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <span className="bg-[#178A68]/10 text-[#178A68] border border-[#178A68]/30 px-2 py-0.5 rounded text-[10px] font-extrabold">
                                      {f.status || 'Verified'}
                                    </span>
                                  </td>
                                  <td className="px-2.5 py-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => setStagedFuelScale((prev) => prev.filter((item) => item.id !== f.id))}
                                      className="text-[#D64545] hover:text-red-700 p-1 rounded cursor-pointer"
                                      title="Remove bracket"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : stagedTableViewMode === 'chassis_schedule' ? (
                      <div className="space-y-3 animate-in fade-in duration-150">
                        <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-[#0F172A]">
                            <span className="material-symbols-outlined text-base text-[#1769FF]">directions_bus</span>
                            <span>
                              <strong>Customer Regional Chassis Schedule:</strong> Review &amp; adjust chassis types (POOL, PRIVATE, TRIAXLE), billable flags, free days, and daily rates across NE, NW, SE, SW regions for <strong>{selectedCustomer}</strong>.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setStagedChassisRecords((prev) => [
                                ...prev,
                                {
                                  id: `stg-chas-${Date.now()}`,
                                  customer: selectedCustomer,
                                  chassisType: 'PRIVATE',
                                  flag: 'BILLABLE',
                                  freeDays: 0,
                                  neRate: '$ 38.00',
                                  nwRate: '$ 40.00',
                                  seRate: '$ 35.00',
                                  swRate: '$ 40.00',
                                  allInRate: '',
                                  agreement: '',
                                  notes: 'Custom chassis rate entry',
                                  status: 'Verified'
                                }
                              ]);
                            }}
                            className="px-3 py-1 bg-[#178A68] hover:bg-[#178A68]/90 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            <span>+ Add Chassis Rule</span>
                          </button>
                        </div>

                        <div className="overflow-x-auto border border-[#D8E1EB] rounded-lg shadow-2xs bg-white">
                          <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                            <thead className="bg-[#F1F5F9] border-b border-[#D8E1EB] font-bold text-[10px] text-[#475569] uppercase tracking-wider">
                              <tr>
                                <th className="px-2.5 py-2.5 w-10 text-center">#</th>
                                <th className="px-3 py-2.5">CUSTOMER</th>
                                <th className="px-3 py-2.5">Chassis Type</th>
                                <th className="px-3 py-2.5">FLAG</th>
                                <th className="px-3 py-2.5">FREE DAYS</th>
                                <th className="px-3 py-2.5">NE ($)</th>
                                <th className="px-3 py-2.5">NW ($)</th>
                                <th className="px-3 py-2.5">SE ($)</th>
                                <th className="px-3 py-2.5">SW ($)</th>
                                <th className="px-3 py-2.5">All-in Rate</th>
                                <th className="px-3 py-2.5">Agreement</th>
                                <th className="px-3 py-2.5">Notes</th>
                                <th className="px-3 py-2.5 w-24">Status</th>
                                <th className="px-2.5 py-2.5 text-center w-12">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#0F172A]">
                              {stagedChassisRecords.map((c, idx) => (
                                <tr key={c.id} className="hover:bg-[#F8FAFC]">
                                  <td className="px-2.5 py-2 text-center text-[#64748B] font-bold">{idx + 1}</td>
                                  <td className="px-3 py-2 font-bold text-[#0F172A]">{c.customer}</td>
                                  <td className="px-3 py-2 font-bold text-[#1769FF]">{c.chassisType}</td>
                                  <td className="px-3 py-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${c.flag === 'BILLABLE' ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30' : 'bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]'}`}>
                                      {c.flag}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 font-bold tabular-nums text-center">{c.freeDays}</td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={c.neRate}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setStagedChassisRecords((prev) => prev.map((item) => (item.id === c.id ? { ...item, neRate: val } : item)));
                                      }}
                                      className="w-20 bg-white border border-[#CBD5E1] rounded px-1.5 py-0.5 text-xs font-bold text-[#0F172A]"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={c.nwRate}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setStagedChassisRecords((prev) => prev.map((item) => (item.id === c.id ? { ...item, nwRate: val } : item)));
                                      }}
                                      className="w-20 bg-white border border-[#CBD5E1] rounded px-1.5 py-0.5 text-xs font-bold text-[#1E3A8A]"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={c.seRate}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setStagedChassisRecords((prev) => prev.map((item) => (item.id === c.id ? { ...item, seRate: val } : item)));
                                      }}
                                      className="w-20 bg-white border border-[#CBD5E1] rounded px-1.5 py-0.5 text-xs font-bold text-[#0F172A]"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={c.swRate}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setStagedChassisRecords((prev) => prev.map((item) => (item.id === c.id ? { ...item, swRate: val } : item)));
                                      }}
                                      className="w-20 bg-white border border-[#CBD5E1] rounded px-1.5 py-0.5 text-xs font-bold text-[#1E3A8A]"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={c.allInRate}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setStagedChassisRecords((prev) => prev.map((item) => (item.id === c.id ? { ...item, allInRate: val } : item)));
                                      }}
                                      className="w-20 bg-white border border-[#CBD5E1] rounded px-1.5 py-0.5 text-xs text-[#0F172A]"
                                    />
                                  </td>
                                  <td className="px-3 py-2 font-bold text-center">{c.agreement}</td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={c.notes}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setStagedChassisRecords((prev) => prev.map((item) => (item.id === c.id ? { ...item, notes: val } : item)));
                                      }}
                                      className="w-full bg-white border border-[#CBD5E1] rounded px-1.5 py-0.5 text-xs text-[#0F172A]"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <span className="bg-[#178A68]/10 text-[#178A68] border border-[#178A68]/30 px-2 py-0.5 rounded text-[10px] font-extrabold">
                                      {c.status || 'Verified'}
                                    </span>
                                  </td>
                                  <td className="px-2.5 py-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => setStagedChassisRecords((prev) => prev.filter((item) => item.id !== c.id))}
                                      className="text-[#D64545] hover:text-red-700 p-1 rounded cursor-pointer"
                                      title="Remove rule"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : stagedTableViewMode === 'accessorials' ? (
                      <div className="space-y-3 animate-in fade-in duration-150">
                        <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-[#0F172A]">
                            <span className="material-symbols-outlined text-base text-[#1769FF]">sell</span>
                            <span>
                              <strong>Identified Customer Charge Types:</strong> Review &amp; refine identified accessorial rules for <strong>{selectedCustomer}</strong> across Bobtail, Chassis Split, Driver Detention, Pre-Pull, Dry Run, Hazmat, Overweight, Pier Pass, Yard Storage, etc.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddStagedAccessorial}
                            className="px-3 py-1 bg-[#178A68] hover:bg-[#178A68]/90 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            <span>+ Add Charge Rule</span>
                          </button>
                        </div>

                        {/* Category Filter Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {['All', 'Bobtail', 'Chassis', 'Detention', 'Pre-Pull', 'Dry Run', 'Hazmat', 'Pier Pass', 'Storage'].map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setSelectedAccCategoryFilter(cat)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                                selectedAccCategoryFilter === cat
                                  ? 'bg-[#0B1930] text-white shadow-2xs'
                                  : 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#475569] hover:bg-[#E2E8F0]'
                              }`}
                            >
                              {cat === 'All' ? 'All Charge Types' : cat}
                            </button>
                          ))}
                        </div>

                        <div className="overflow-x-auto border border-[#D8E1EB] rounded-lg shadow-2xs bg-white">
                          <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                            <thead className="bg-[#F1F5F9] border-b border-[#D8E1EB] font-bold text-[10px] text-[#475569] uppercase tracking-wider">
                              <tr>
                                <th className="px-2.5 py-2.5 w-10 text-center">#</th>
                                <th className="px-3 py-2.5 w-44">Customer / Account</th>
                                <th className="px-3 py-2.5 w-52">Identified Charge Option</th>
                                <th className="px-3 py-2.5 w-28">Rate</th>
                                <th className="px-3 py-2.5 w-32">Billing Unit</th>
                                <th className="px-3 py-2.5 w-32">Free Qty &amp; Unit</th>
                                <th className="px-3 py-2.5 w-36">Context / Scope</th>
                                <th className="px-3 py-2.5">Notes &amp; Operational Rules</th>
                                <th className="px-3 py-2.5 w-24">Status</th>
                                <th className="px-2.5 py-2.5 text-center w-12">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#0F172A]">
                              {stagedAccessorials
                                .filter((acc) => {
                                  if (selectedAccCategoryFilter !== 'All') {
                                    if (!acc.chargeType.toLowerCase().includes(selectedAccCategoryFilter.toLowerCase())) {
                                      return false;
                                    }
                                  }
                                  if (!stagedFilterQuery.trim()) return true;
                                  const q = stagedFilterQuery.toLowerCase();
                                  return (
                                    acc.customerAccount.toLowerCase().includes(q) ||
                                    acc.chargeType.toLowerCase().includes(q) ||
                                    acc.rate.toLowerCase().includes(q) ||
                                    acc.unit.toLowerCase().includes(q) ||
                                    (acc.notes && acc.notes.toLowerCase().includes(q))
                                  );
                                })
                                .map((acc, idx) => (
                                  <tr key={acc.id} className="hover:bg-[#F8FAFC] transition-colors">
                                    <td className="px-2.5 py-2 text-center font-mono text-[#64748B] text-[11px]">
                                      {idx + 1}
                                    </td>
                                    <td className="px-3 py-2">
                                      <input
                                        type="text"
                                        value={acc.customerAccount}
                                        onChange={(e) => handleUpdateStagedAccessorialField(acc.id, 'customerAccount', e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] font-bold text-[#0B1930] focus:outline-none py-0.5"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <select
                                        value={acc.chargeType}
                                        onChange={(e) => handleUpdateStagedAccessorialField(acc.id, 'chargeType', e.target.value)}
                                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2 py-1 text-xs font-bold text-[#0F172A] focus:border-[#1769FF] focus:outline-none cursor-pointer"
                                      >
                                        {STANDARD_ACCESSORIAL_CHARGES.map((chg) => (
                                          <option key={chg} value={chg}>
                                            {chg}
                                          </option>
                                        ))}
                                        {!STANDARD_ACCESSORIAL_CHARGES.includes(acc.chargeType) && (
                                          <option value={acc.chargeType}>{acc.chargeType}</option>
                                        )}
                                      </select>
                                    </td>
                                    <td className="px-3 py-2 font-extrabold text-[#1769FF] font-mono">
                                      <input
                                        type="text"
                                        value={acc.rate}
                                        onChange={(e) => handleUpdateStagedAccessorialField(acc.id, 'rate', e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] font-extrabold text-[#1769FF] font-mono focus:outline-none py-0.5"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-[#334155]">
                                      <input
                                        type="text"
                                        value={acc.unit}
                                        onChange={(e) => handleUpdateStagedAccessorialField(acc.id, 'unit', e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] text-[#334155] focus:outline-none py-0.5"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-[#334155]">
                                      <div className="flex gap-1">
                                        <input
                                          type="text"
                                          placeholder="Qty"
                                          value={acc.freeQty || ''}
                                          onChange={(e) => handleUpdateStagedAccessorialField(acc.id, 'freeQty', e.target.value)}
                                          className="w-12 bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] text-center focus:outline-none py-0.5"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Unit"
                                          value={acc.freeUnit || ''}
                                          onChange={(e) => handleUpdateStagedAccessorialField(acc.id, 'freeUnit', e.target.value)}
                                          className="flex-1 bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] focus:outline-none py-0.5"
                                        />
                                      </div>
                                    </td>
                                    <td className="px-3 py-2 text-[#334155]">
                                      <input
                                        type="text"
                                        value={acc.context || ''}
                                        onChange={(e) => handleUpdateStagedAccessorialField(acc.id, 'context', e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] text-[#334155] focus:outline-none py-0.5"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-[#475569]">
                                      <input
                                        type="text"
                                        value={acc.notes || ''}
                                        onChange={(e) => handleUpdateStagedAccessorialField(acc.id, 'notes', e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] text-[#475569] text-xs focus:outline-none py-0.5"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className="inline-flex items-center gap-1 bg-[#178A68]/10 text-[#178A68] px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                        <span>{acc.status}</span>
                                      </span>
                                    </td>
                                    <td className="px-2.5 py-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteStagedAccessorial(acc.id)}
                                        className="text-[#94A3B8] hover:text-[#D64545] p-1 rounded transition-colors cursor-pointer"
                                        title="Delete staged charge rule"
                                      >
                                        <span className="material-symbols-outlined text-base">delete</span>
                                      </button>
                                    </td>
                                  </tr>
                                ))}

                              {stagedAccessorials.length === 0 && (
                                <tr>
                                  <td colSpan={10} className="px-4 py-8 text-center text-[#64748B]">
                                    <span className="material-symbols-outlined text-3xl text-[#94A3B8] mb-1 block">
                                      sell
                                    </span>
                                    <p className="font-bold text-xs text-[#0F172A]">No accessorial charge rules staged</p>
                                    <p className="text-[11px] mt-0.5">Click + Add Charge Rule above or paste an Accessorial Tariff file.</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : stagedTableViewMode === 'recommended_carriers' ? (
                      <div className="space-y-3 animate-in fade-in duration-150">
                        <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-[#0F172A]">
                            <span className="material-symbols-outlined text-base text-[#1769FF]">local_shipping</span>
                            <span>
                              <strong>Recommended Carrier Capacity Network Staging:</strong> Upload or manage preferred carriers matching contract lanes by Home State vs Lane Origin State.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddStagedCarrier}
                            className="px-3 py-1 bg-[#178A68] hover:bg-[#178A68]/90 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            <span>+ Add Carrier Row</span>
                          </button>
                        </div>

                        <div className="overflow-x-auto border border-[#D8E1EB] rounded-lg shadow-2xs bg-white">
                          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                            <thead className="bg-[#F1F5F9] border-b border-[#D8E1EB] font-bold text-[10px] text-[#475569] uppercase tracking-wider">
                              <tr>
                                <th className="px-2.5 py-2.5 w-10 text-center">#</th>
                                <th className="px-3 py-2.5">DOT#</th>
                                <th className="px-3 py-2.5">Carrier Name</th>
                                <th className="px-3 py-2.5 text-right">Truck Count</th>
                                <th className="px-3 py-2.5 text-right">Loads Hauled (2026)</th>
                                <th className="px-3 py-2.5 bg-[#EAF2FF] text-[#1769FF] text-center">Home State (Origin Match)</th>
                                <th className="px-3 py-2.5">Region</th>
                                <th className="px-3 py-2.5">Notes</th>
                                <th className="px-3 py-2.5 w-24">Status</th>
                                <th className="px-2.5 py-2.5 text-center w-12">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#0F172A]">
                              {stagedCarriers.map((c, idx) => (
                                <tr key={c.id} className="hover:bg-[#F8FAFC]">
                                  <td className="px-2.5 py-2 text-center text-[#64748B] font-bold">{idx + 1}</td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={c.dotNumber}
                                      onChange={(e) => handleUpdateStagedCarrierField(c.id, 'dotNumber', e.target.value)}
                                      className="w-24 bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs font-mono font-bold text-[#0F172A]"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={c.carrierName}
                                      onChange={(e) => handleUpdateStagedCarrierField(c.id, 'carrierName', e.target.value)}
                                      className="w-56 bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs font-bold text-[#0F172A]"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      value={c.truckCount}
                                      onChange={(e) => handleUpdateStagedCarrierField(c.id, 'truckCount', parseInt(e.target.value) || 0)}
                                      className="w-20 bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs font-bold text-[#0F172A] text-right"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      value={c.loadsHauled2026}
                                      onChange={(e) => handleUpdateStagedCarrierField(c.id, 'loadsHauled2026', parseInt(e.target.value) || 0)}
                                      className="w-24 bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs font-bold text-[#178A68] text-right"
                                    />
                                  </td>
                                  <td className="px-3 py-2 bg-[#F0F6FF] text-center">
                                    <input
                                      type="text"
                                      value={c.homeState}
                                      onChange={(e) => handleUpdateStagedCarrierField(c.id, 'homeState', e.target.value.toUpperCase())}
                                      className="w-16 bg-white border-2 border-[#1769FF] rounded px-2 py-1 text-xs font-extrabold text-[#1769FF] text-center uppercase"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={c.region}
                                      onChange={(e) => handleUpdateStagedCarrierField(c.id, 'region', e.target.value)}
                                      className="w-20 bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs text-[#0F172A]"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={c.notes || ''}
                                      onChange={(e) => handleUpdateStagedCarrierField(c.id, 'notes', e.target.value)}
                                      className="w-full bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs text-[#64748B]"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <span className="bg-[#178A68]/10 text-[#178A68] border border-[#178A68]/30 px-2 py-0.5 rounded text-[10px] font-extrabold">
                                      {c.status || 'Verified'}
                                    </span>
                                  </td>
                                  <td className="px-2.5 py-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteStagedCarrier(c.id)}
                                      className="text-[#D64545] hover:text-red-700 p-1 rounded cursor-pointer"
                                      title="Remove carrier"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}

                              {stagedCarriers.length === 0 && (
                                <tr>
                                  <td colSpan={10} className="px-4 py-8 text-center text-[#64748B]">
                                    <span className="material-symbols-outlined text-3xl text-[#94A3B8] mb-1 block">
                                      local_shipping
                                    </span>
                                    <p className="font-bold text-xs text-[#0F172A]">No recommended carriers staged</p>
                                    <p className="text-[11px] mt-0.5">Click + Add Carrier Row above or load the Recommended Carriers template.</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                    <div className="overflow-x-auto border border-[#D8E1EB] rounded-lg shadow-2xs bg-white">
                      <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                        <thead className="bg-[#F1F5F9] border-b border-[#D8E1EB] font-bold text-[10px] text-[#475569] uppercase tracking-wider">
                          <tr>
                            <th className="px-2.5 py-2.5 w-10 text-center">#</th>
                            <th className="px-3 py-2.5">Customer / Account</th>
                            {stagedTableViewMode !== 'fuel_chassis' && (
                              <>
                                <th className="px-3 py-2.5">Effective Date</th>
                                <th className="px-3 py-2.5">Expiration Date</th>
                                <th className="px-3 py-2.5">Origin (Port/Ramp)</th>
                                <th className="px-3 py-2.5">Destination</th>
                                <th className="px-3 py-2.5">Base Rate ($)</th>
                                {stagedTableViewMode === 'contract_full' && (
                                  <th className="px-3 py-2.5">Equipment</th>
                                )}
                              </>
                            )}
                            {stagedTableViewMode !== 'compact_lanes' && (
                              <>
                                <th className="px-3 py-2.5">Fuel Scale (FSC)</th>
                                <th className="px-3 py-2.5">Free Detention</th>
                                <th className="px-3 py-2.5">Chassis Free Days</th>
                                <th className="px-3 py-2.5">Chassis Split Fee</th>
                              </>
                            )}
                            <th className="px-3 py-2.5">Status</th>
                            <th className="px-2.5 py-2.5 text-center w-12">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#0F172A]">
                          {stagedRecords
                            .filter((r) => {
                              if (!stagedFilterQuery.trim()) return true;
                              const q = stagedFilterQuery.toLowerCase();
                              return (
                                r.origin.toLowerCase().includes(q) ||
                                r.destination.toLowerCase().includes(q) ||
                                r.rate.toLowerCase().includes(q) ||
                                r.effectiveDate.toLowerCase().includes(q) ||
                                r.expirationDate.toLowerCase().includes(q) ||
                                r.fuelScale.toLowerCase().includes(q) ||
                                r.equipment.toLowerCase().includes(q)
                              );
                            })
                            .map((rec, idx) => (
                              <tr key={rec.id} className="hover:bg-[#F8FAFC] transition-colors">
                                <td className="px-2.5 py-2 text-center font-mono text-[#64748B] text-[11px]">
                                  {idx + 1}
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={rec.customerAccount}
                                    onChange={(e) => handleUpdateStagedRecordField(rec.id, 'customerAccount', e.target.value)}
                                    className="w-full bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] font-bold text-[#0B1930] focus:outline-none py-0.5"
                                  />
                                </td>

                                {stagedTableViewMode !== 'fuel_chassis' && (
                                  <>
                                    <td className="px-3 py-2">
                                      <input
                                        type="date"
                                        value={rec.effectiveDate}
                                        onChange={(e) => handleUpdateStagedRecordField(rec.id, 'effectiveDate', e.target.value)}
                                        className="bg-[#F8FAFC] border border-[#CBD5E1] rounded px-1.5 py-0.5 font-mono text-[11px] text-[#0F172A] focus:border-[#1769FF] focus:outline-none"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <input
                                        type="date"
                                        value={rec.expirationDate}
                                        onChange={(e) => handleUpdateStagedRecordField(rec.id, 'expirationDate', e.target.value)}
                                        className="bg-[#F8FAFC] border border-[#CBD5E1] rounded px-1.5 py-0.5 font-mono text-[11px] text-[#0F172A] focus:border-[#1769FF] focus:outline-none"
                                      />
                                    </td>
                                    <td className="px-3 py-2 font-bold text-[#0B1930]">
                                      <input
                                        type="text"
                                        value={rec.origin}
                                        onChange={(e) => handleUpdateStagedRecordField(rec.id, 'origin', e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] font-bold text-[#0B1930] focus:outline-none py-0.5"
                                      />
                                    </td>
                                    <td className="px-3 py-2 font-bold text-[#0B1930]">
                                      <input
                                        type="text"
                                        value={rec.destination}
                                        onChange={(e) => handleUpdateStagedRecordField(rec.id, 'destination', e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] font-bold text-[#0B1930] focus:outline-none py-0.5"
                                      />
                                    </td>
                                    <td className="px-3 py-2 font-extrabold text-[#1769FF] font-mono">
                                      <input
                                        type="text"
                                        value={rec.rate}
                                        onChange={(e) => handleUpdateStagedRecordField(rec.id, 'rate', e.target.value)}
                                        className="w-20 bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] font-extrabold text-[#1769FF] font-mono focus:outline-none py-0.5"
                                      />
                                    </td>
                                    {stagedTableViewMode === 'contract_full' && (
                                      <td className="px-3 py-2 text-[#334155]">
                                        <input
                                          type="text"
                                          value={rec.equipment}
                                          onChange={(e) => handleUpdateStagedRecordField(rec.id, 'equipment', e.target.value)}
                                          className="w-full bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] text-[#334155] focus:outline-none py-0.5"
                                        />
                                      </td>
                                    )}
                                  </>
                                )}

                                {stagedTableViewMode !== 'compact_lanes' && (
                                  <>
                                    <td className="px-3 py-2 text-[#334155]">
                                      <input
                                        type="text"
                                        value={rec.fuelScale}
                                        onChange={(e) => handleUpdateStagedRecordField(rec.id, 'fuelScale', e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] text-[#334155] font-semibold focus:outline-none py-0.5"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-[#334155]">
                                      <input
                                        type="text"
                                        value={rec.freeDetentionHours}
                                        onChange={(e) => handleUpdateStagedRecordField(rec.id, 'freeDetentionHours', e.target.value)}
                                        className="w-16 bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] text-[#334155] focus:outline-none py-0.5 text-center"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-[#334155]">
                                      <input
                                        type="text"
                                        value={rec.chassisFreeDays}
                                        onChange={(e) => handleUpdateStagedRecordField(rec.id, 'chassisFreeDays', e.target.value)}
                                        className="w-16 bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] text-[#334155] focus:outline-none py-0.5 text-center"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-[#334155] font-mono">
                                      <input
                                        type="text"
                                        value={rec.chassisSplitFee}
                                        onChange={(e) => handleUpdateStagedRecordField(rec.id, 'chassisSplitFee', e.target.value)}
                                        className="w-20 bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#1769FF] text-[#334155] font-mono focus:outline-none py-0.5"
                                      />
                                    </td>
                                  </>
                                )}

                                <td className="px-3 py-2">
                                  <span className="inline-flex items-center gap-1 bg-[#178A68]/10 text-[#178A68] px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                    <span>{rec.status}</span>
                                  </span>
                                </td>
                                <td className="px-2.5 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStagedRecord(rec.id)}
                                    className="text-[#94A3B8] hover:text-[#D64545] p-1 rounded transition-colors cursor-pointer"
                                    title="Delete staged row"
                                  >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                  </button>
                                </td>
                              </tr>
                            ))}

                          {stagedRecords.length === 0 && (
                            <tr>
                              <td colSpan={12} className="px-4 py-8 text-center text-[#64748B]">
                                <span className="material-symbols-outlined text-3xl text-[#94A3B8] mb-1 block">
                                  inbox
                                </span>
                                <p className="font-bold text-xs text-[#0F172A]">No staged records present</p>
                                <p className="text-[11px] mt-0.5">Use the Paste option or Upload Spreadsheet above to stage rate lanes.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                  <div>
                    <h4 className="font-bold text-[10px] text-[#45474d] uppercase tracking-wider mb-3">
                      VALIDATION ISSUES & LOGS
                    </h4>

                    <div className="overflow-hidden border border-[#D8E1EB] rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F4F7FA] border-b border-[#D8E1EB] font-bold text-[10px] text-[#45474d] uppercase">
                          <tr>
                            <th className="px-4 py-2">TYPE</th>
                            <th className="px-4 py-2">DESCRIPTION</th>
                            <th className="px-4 py-2">ROW</th>
                            <th className="px-4 py-2 text-right">ACTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D8E1EB]">
                          {validationIssues.map((iss) => (
                            <tr key={iss.id} className="hover:bg-[#F4F7FA]/50">
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    iss.resolved
                                      ? 'bg-[#178A68]/10 text-[#178A68]'
                                      : 'bg-[#D58A16]/10 text-[#D58A16]'
                                  }`}
                                >
                                  {iss.resolved ? 'RESOLVED' : iss.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[#0B1930] font-medium">
                                {iss.description}
                                {iss.resolved && (
                                  <span className="text-[#178A68] font-bold ml-2">
                                    → Mapped to "{iss.suggestedValue}"
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-semibold tabular-nums text-[#45474d]">Row {iss.rowNumber}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  disabled={iss.resolved}
                                  onClick={() => onOpenMapManual(iss)}
                                  className={`font-bold text-xs ${
                                    iss.resolved ? 'text-[#75777e] cursor-not-allowed' : 'text-[#1769FF] hover:underline'
                                  }`}
                                >
                                  {iss.resolved ? 'Done' : 'Map Manual'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* System Background Logs & Automated Standardization Status Bar */}
            <div className="bg-[#13294B] text-white rounded-2xl shadow-md overflow-hidden border border-[#1E3A8A] transition-all">
              <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {isStandardizing ? (
                    <span className="material-symbols-outlined animate-spin text-[#1769FF] text-2xl">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-[#10B981] text-2xl">check_circle</span>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs">
                        {isStandardizing ? 'Automated Standardization Running' : 'Automated Standardization Complete'}
                      </p>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          isStandardizing
                            ? 'bg-[#1769FF]/30 text-[#60A5FA]'
                            : 'bg-[#10B981]/20 text-[#34D399]'
                        }`}
                      >
                        {isStandardizing ? 'IN PROGRESS' : '100% VERIFIED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7784a0] mt-0.5">
                      Cross-referencing {processedRecordsCount} of 450 new entries against Global Master Geography (v4.2)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isStandardizing ? 'bg-[#1769FF] animate-pulse' : 'bg-[#10B981]'
                        }`}
                        style={{ width: `${standardizationProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#E2E8F0]">
                      {standardizationProgress}%
                    </span>
                  </div>

                  {/* Interactive Action Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerStandardizationScan(450)}
                      disabled={isStandardizing}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-white/10 cursor-pointer"
                      title="Re-run geography cross-reference scan"
                    >
                      <span className={`material-symbols-outlined text-sm ${isStandardizing ? 'animate-spin' : ''}`}>
                        refresh
                      </span>
                      <span>{isStandardizing ? 'Scanning...' : 'Re-run Scan'}</span>
                    </button>

                    <button
                      onClick={() => setShowStandardizationLogs(!showStandardizationLogs)}
                      className="px-3 py-1 bg-[#1769FF] hover:bg-[#1769FF]/80 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {showStandardizationLogs ? 'expand_less' : 'list_alt'}
                      </span>
                      <span>{showStandardizationLogs ? 'Hide Logs' : 'View Geography Log'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Geography Log Panel */}
              {showStandardizationLogs && (
                <div className="border-t border-white/10 bg-[#0F213D] p-4 text-xs space-y-3 animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="font-bold text-[10px] text-[#94A3B8] uppercase tracking-wider">
                      Geography Cross-Reference Rules (Master Geo v4.2)
                    </span>
                    <span className="text-[10px] text-[#34D399] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>0 Location Conflicts Detected</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#E2E8F0] block">OICT SSA Terminal Oakland</span>
                        <span className="text-[#94A3B8] text-[10px]">Mapped: Oakland, CA [FIPS 06001]</span>
                      </div>
                      <span className="bg-[#10B981]/20 text-[#34D399] px-2 py-0.5 rounded text-[9px] font-bold">MATCHED</span>
                    </div>

                    <div className="p-2.5 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#E2E8F0] block">APM Terminal Pier 400</span>
                        <span className="text-[#94A3B8] text-[10px]">Mapped: San Pedro, CA [FIPS 06037]</span>
                      </div>
                      <span className="bg-[#10B981]/20 text-[#34D399] px-2 py-0.5 rounded text-[9px] font-bold">MATCHED</span>
                    </div>

                    <div className="p-2.5 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#E2E8F0] block">Amazon Fulfillment LAS1</span>
                        <span className="text-[#94A3B8] text-[10px]">Mapped: Henderson, NV [FIPS 32003]</span>
                      </div>
                      <span className="bg-[#10B981]/20 text-[#34D399] px-2 py-0.5 rounded text-[9px] font-bold">MATCHED</span>
                    </div>

                    <div className="p-2.5 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#E2E8F0] block">Amazon Fulfillment TCY2</span>
                        <span className="text-[#94A3B8] text-[10px]">Mapped: Stockton, CA [FIPS 06077]</span>
                      </div>
                      <span className="bg-[#10B981]/20 text-[#34D399] px-2 py-0.5 rounded text-[9px] font-bold">MATCHED</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-[#94A3B8] flex items-center justify-between pt-1">
                    <span>Algorithm: Levenshtein Location Distance + Zip Code Geofence</span>
                    <span className="font-mono text-white">Execution Time: 0.82s</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Dedicated Working Templates Hub */}
      {activeSubTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WORKING_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white border border-[#D8E1EB] rounded-2xl p-5 shadow-sm hover:border-[#1769FF] transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold bg-[#EAF2FF] text-[#1769FF] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {tpl.category}
                    </span>
                    <span className="text-[11px] font-bold text-[#64748B] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#1769FF]">table_chart</span>
                      {tpl.columns.length} columns
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-[#0F172A] mb-1.5 group-hover:text-[#1769FF] transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed mb-4">{tpl.description}</p>

                  {/* Schema Pills Preview */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl mb-2">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                      INCLUDED CSV HEADERS:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {tpl.columns.map((col) => (
                        <span
                          key={col}
                          className="bg-white text-[#334155] border border-[#CBD5E1] text-[10px] font-mono font-semibold px-2 py-0.5 rounded"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownloadCSV(tpl)}
                      className="w-full py-2 bg-[#1769FF] text-white rounded-xl font-bold text-xs hover:bg-[#1769FF]/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                      <span>Download .CSV</span>
                    </button>
                    <button
                      onClick={() => setPreviewTemplate(tpl)}
                      className="w-full py-2 bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] rounded-xl font-bold text-xs hover:bg-[#E2E8F0] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                      <span>Preview</span>
                    </button>
                  </div>
                  <button
                    onClick={() => handleLoadTemplateData(tpl)}
                    className="w-full py-1.5 border border-[#1769FF]/30 text-[#1769FF] bg-[#EAF2FF] rounded-xl font-bold text-xs hover:bg-[#1769FF] hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Use in Import Workflow →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 3: Recommended Carriers & Origin Matching Capacity Network */}
      {activeSubTab === 'carrier_matching' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D8E1EB] p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-extrabold text-[10px] text-[#64748B] uppercase tracking-wider">NETWORK CARRIERS</p>
                  <p className="font-extrabold text-2xl text-[#0B1930] tabular-nums mt-1">{activeRecommendedCarriers.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#1769FF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">local_shipping</span>
                </div>
              </div>
              <p className="text-[11px] text-[#45474d] mt-2 font-medium">Recommended preferred carrier database</p>
            </div>

            <div className="bg-white border border-[#D8E1EB] p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-extrabold text-[10px] text-[#64748B] uppercase tracking-wider">2026 VOLUME HAULED</p>
                  <p className="font-extrabold text-2xl text-[#178A68] tabular-nums mt-1">
                    {activeRecommendedCarriers.reduce((acc, c) => acc + c.loadsHauled2026, 0).toLocaleString()} <span className="text-xs font-normal text-[#64748B]">loads</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#178A68] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">analytics</span>
                </div>
              </div>
              <p className="text-[11px] text-[#45474d] mt-2 font-medium">Historical volume across all home states</p>
            </div>

            <div className="bg-white border border-[#D8E1EB] p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-extrabold text-[10px] text-[#64748B] uppercase tracking-wider">FLEET POWER UNITS</p>
                  <p className="font-extrabold text-2xl text-[#1769FF] tabular-nums mt-1">
                    {activeRecommendedCarriers.reduce((acc, c) => acc + c.truckCount, 0).toLocaleString()} <span className="text-xs font-normal text-[#64748B]">trucks</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#1769FF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">fire_truck</span>
                </div>
              </div>
              <p className="text-[11px] text-[#45474d] mt-2 font-medium">Total dedicated truck capacity in network</p>
            </div>

            <div className="bg-white border border-[#D8E1EB] p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-extrabold text-[10px] text-[#64748B] uppercase tracking-wider">MATCH RULE ENGINE</p>
                  <p className="font-extrabold text-2xl text-[#D58A16] tabular-nums mt-1">
                    Home State <span className="text-xs font-bold text-[#64748B]">→ Origin Lane</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#D58A16] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">alt_route</span>
                </div>
              </div>
              <p className="text-[11px] text-[#45474d] mt-2 font-medium">Matches carrier home state with lane origin</p>
            </div>
          </div>

          {/* Interactive Origin Matching Rules Engine Panel */}
          <div className="bg-white border border-[#D8E1EB] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="font-extrabold text-lg text-[#0B1930] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1769FF]">tune</span>
                  <span>Origin State Matching & Capacity Engine</span>
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Select a Lane Origin State to evaluate recommended carriers based on Home State alignment, 2026 load volume, and truck count.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const tpl = WORKING_TEMPLATES.find((t) => t.id === 'tpl-recommended-carriers');
                    if (tpl) handleDownloadCSV(tpl);
                  }}
                  className="px-3.5 py-1.5 border border-[#1769FF] text-[#1769FF] bg-[#EAF2FF] rounded-xl font-bold text-xs hover:bg-[#1769FF] hover:text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Download Recommended Carriers CSV Template</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tpl = WORKING_TEMPLATES.find((t) => t.id === 'tpl-recommended-carriers');
                    if (tpl) handleLoadTemplateData(tpl);
                  }}
                  className="px-4 py-1.5 bg-[#1769FF] text-white rounded-xl font-bold text-xs hover:bg-[#1769FF]/90 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">cloud_upload</span>
                  <span>Stage Carrier Upload Template</span>
                </button>
              </div>
            </div>

            {/* Filter and Rule Adjuster Controls */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-4 rounded-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-[#64748B] mb-1">
                    1. Select Lane Origin State to Match:
                  </label>
                  <select
                    value={simulatedOriginState}
                    onChange={(e) => setSimulatedOriginState(e.target.value)}
                    className="w-full bg-white border-2 border-[#1769FF] rounded-xl px-3 py-1.5 text-xs font-extrabold text-[#0B1930] focus:ring-2 focus:ring-[#1769FF] cursor-pointer"
                  >
                    {['PA', 'CA', 'AZ', 'GA', 'WA', 'MD', 'SC', 'IN', 'NJ', 'TX', 'FL', 'IL', 'MN', 'CO', 'OH', 'WI', 'TN', 'ALL'].map((st) => (
                      <option key={st} value={st}>
                        {st === 'ALL' ? '🌐 ALL STATES (Show Full Carrier Network)' : `📍 Origin State: ${st}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-[#64748B] mb-1">
                    2. Minimum 2026 Volume:
                  </label>
                  <select
                    value={matchMinLoads}
                    onChange={(e) => setMatchMinLoads(Number(e.target.value))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs font-bold text-[#0F172A] focus:border-[#1769FF] cursor-pointer"
                  >
                    <option value={0}>All Volume Levels (&ge; 0 loads)</option>
                    <option value={50}>High Volume (&ge; 50 loads in 2026)</option>
                    <option value={100}>Ultra Volume (&ge; 100 loads in 2026)</option>
                    <option value={250}>Top Tier Tier 1 (&ge; 250 loads in 2026)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-[#64748B] mb-1">
                    3. Minimum Fleet Trucks:
                  </label>
                  <select
                    value={matchMinTrucks}
                    onChange={(e) => setMatchMinTrucks(Number(e.target.value))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs font-bold text-[#0F172A] focus:border-[#1769FF] cursor-pointer"
                  >
                    <option value={0}>All Fleet Sizes (&ge; 1 truck)</option>
                    <option value={3}>Dedicated Fleets (&ge; 3 trucks)</option>
                    <option value={5}>Medium Fleets (&ge; 5 trucks)</option>
                    <option value={15}>Large Fleets (&ge; 15 trucks)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-[#64748B] mb-1">
                    4. Search Carrier Name / DOT#:
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search DOT# or Carrier Name..."
                      value={carrierSearchQuery}
                      onChange={(e) => setCarrierSearchQuery(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0F172A] focus:border-[#1769FF] focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#CBD5E1] flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={matchRequireExactState}
                    onChange={(e) => setMatchRequireExactState(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1769FF] focus:ring-[#1769FF]"
                  />
                  <span className="font-extrabold text-[#0B1930]">Strict Mode: Require Exact Home State Match (Hide Regional Spillover)</span>
                </label>

                <div className="text-[11px] text-[#64748B] font-bold">
                  Rule Weighting: Exact Home State = 60pts &bull; 2026 Volume = +30pts max &bull; Fleet = +10pts max
                </div>
              </div>
            </div>

            {/* Matching Results List Table */}
            {(() => {
              const matchedResults = matchCarriersByOrigin(
                simulatedOriginState === 'ALL' ? 'PA' : simulatedOriginState,
                activeRecommendedCarriers,
                {
                  minTruckCount: matchMinTrucks,
                  minLoads2026: matchMinLoads,
                  requireExactState: matchRequireExactState
                }
              ).filter((res) => {
                if (!carrierSearchQuery.trim()) return true;
                const q = carrierSearchQuery.toLowerCase();
                return (
                  res.carrier.carrierName.toLowerCase().includes(q) ||
                  res.carrier.dotNumber.includes(q) ||
                  res.carrier.homeState.toLowerCase().includes(q)
                );
              });

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-[#0B1930] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#178A68] text-base">verified</span>
                      <span>
                        Matched Recommended Carriers for Origin State: <span className="text-[#1769FF] font-mono font-black">{simulatedOriginState}</span> ({matchedResults.length} matches)
                      </span>
                    </h3>
                    <span className="text-xs text-[#64748B] font-medium">
                      Sorted by Match Score &amp; 2026 Volume
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-[#D8E1EB] rounded-2xl shadow-xs bg-white">
                    <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                      <thead className="bg-[#F8FAFC] border-b border-[#D8E1EB] font-extrabold text-[10px] text-[#475569] uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-3 text-center w-28">Match Score</th>
                          <th className="px-3 py-3">DOT#</th>
                          <th className="px-3 py-3">Carrier Name</th>
                          <th className="px-3 py-3 bg-[#EAF2FF] text-[#1769FF] text-center">Home State</th>
                          <th className="px-3 py-3 text-right">2026 Loads Hauled</th>
                          <th className="px-3 py-3 text-right">Truck Count</th>
                          <th className="px-3 py-3">Region</th>
                          <th className="px-3 py-3">Origin Match Logic Reason</th>
                          <th className="px-3 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#0F172A]">
                        {matchedResults.map((m) => (
                          <tr key={m.carrier.id} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-flex items-center gap-1 font-extrabold px-2.5 py-1 rounded-full text-[11px] ${
                                m.matchScore >= 90
                                  ? 'bg-[#ECFDF5] text-[#178A68] border border-[#178A68]/30'
                                  : m.matchScore >= 70
                                  ? 'bg-[#EAF2FF] text-[#1769FF] border border-[#1769FF]/30'
                                  : 'bg-[#FFFBEB] text-[#D58A16] border border-[#D58A16]/30'
                              }`}>
                                <span>{m.matchScore}%</span>
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-mono font-bold text-[#0F172A]">{m.carrier.dotNumber}</td>
                            <td className="px-3 py-2.5 font-extrabold text-[#0F172A]">{m.carrier.carrierName}</td>
                            <td className="px-3 py-2.5 bg-[#F0F6FF] text-center">
                              <span className="font-extrabold text-xs text-[#1769FF] bg-white px-2 py-0.5 rounded border border-[#1769FF]/30">
                                {m.carrier.homeState}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right font-extrabold text-[#178A68] tabular-nums">
                              {m.carrier.loadsHauled2026.toLocaleString()}
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold tabular-nums">{m.carrier.truckCount}</td>
                            <td className="px-3 py-2.5 text-[#64748B] font-bold">{m.carrier.region}</td>
                            <td className="px-3 py-2.5 text-[#475569] text-[11px]">{m.matchReason}</td>
                            <td className="px-3 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setDownloadToast(`Bound ${m.carrier.carrierName} to Origin State ${simulatedOriginState} contract lanes!`);
                                  setTimeout(() => setDownloadToast(null), 3000);
                                }}
                                className="px-2.5 py-1 bg-[#1769FF] text-white hover:bg-[#1769FF]/90 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all shadow-2xs"
                              >
                                Bind Capacity
                              </button>
                            </td>
                          </tr>
                        ))}

                        {matchedResults.length === 0 && (
                          <tr>
                            <td colSpan={9} className="px-4 py-8 text-center text-[#64748B]">
                              <span className="material-symbols-outlined text-3xl text-[#94A3B8] mb-1 block">
                                flex_no
                              </span>
                              <p className="font-bold text-xs text-[#0F172A]">No recommended carriers matched current criteria</p>
                              <p className="text-[11px] mt-0.5">Try selecting a different Origin State or lowering the minimum volume/truck filters.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Template Schema & Sample Data Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-[#D8E1EB] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#1769FF] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-2xl">table_view</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#0F172A]">{previewTemplate.name}</h3>
                  <p className="text-xs text-[#64748B] font-medium">{previewTemplate.filename}</p>
                </div>
              </div>

              <button
                onClick={() => setPreviewTemplate(null)}
                className="w-8 h-8 rounded-full hover:bg-[#E2E8F0] flex items-center justify-center text-[#64748B]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <p className="text-sm text-[#334155] leading-relaxed">{previewTemplate.description}</p>

              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#64748B] mb-2">
                  Sample Data Structure ({previewTemplate.sampleRows.length} Rows)
                </h4>
                <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F1F5F9] border-b border-[#E2E8F0] font-bold text-[11px] text-[#334155]">
                      <tr>
                        {previewTemplate.columns.map((col) => (
                          <th key={col} className="px-3 py-2.5 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {previewTemplate.sampleRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[#F8FAFC]">
                          {previewTemplate.columns.map((col) => (
                            <td key={col} className="px-3 py-2 text-[#0F172A] font-medium whitespace-nowrap">
                              {String(row[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(previewTemplate.columns.join(', '));
                  setDownloadToast('Copied CSV headers to clipboard!');
                  setTimeout(() => setDownloadToast(null), 3000);
                }}
                className="px-4 py-2 border border-[#CBD5E1] text-[#334155] rounded-xl font-bold text-xs hover:bg-[#E2E8F0] transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">content_copy</span>
                <span>Copy Headers</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 text-[#64748B] font-bold text-xs hover:text-[#0F172A]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownloadCSV(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="px-6 py-2 bg-[#1769FF] text-white rounded-xl font-bold text-xs hover:bg-[#1769FF]/90 transition-shadow shadow-md flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span>Download .CSV Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Column Header Mapper Modal */}
      {showColumnMapModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1930]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#D8E1EB] overflow-hidden">
            <div className="p-5 border-b border-[#D8E1EB] bg-[#F4F7FA] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1769FF]">tune</span>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0B1930]">Live Column Inspector & Field Mapper</h3>
                  <p className="text-[11px] text-[#64748B]">Assign system rate lane fields to your file columns or click ❌ to exclude unneeded columns (like Miles or Equipment Size)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowColumnMapModal(false)}
                className="text-[#64748B] hover:text-[#0B1930] p-1 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Mapper Schema Toggle Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1769FF] text-lg">schema</span>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#0F172A] uppercase tracking-wider">Field Mapping Schema Mode</h4>
                    <p className="text-[11px] text-[#64748B]">Switch between rate lane origin/destination mapping and accessorial charge tariff mapping</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#CBD5E1] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setMapperSchemaMode('lanes');
                      setColAssignments(autoAssignColumns('lanes', detectedCols));
                    }}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      mapperSchemaMode === 'lanes'
                        ? 'bg-[#1769FF] text-white shadow-2xs font-extrabold'
                        : 'text-[#475569] hover:text-[#0F172A]'
                    }`}
                  >
                    🚚 Rate Lanes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMapperSchemaMode('accessorials');
                      setColAssignments(autoAssignColumns('accessorials', detectedCols));
                    }}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      mapperSchemaMode === 'accessorials'
                        ? 'bg-[#1769FF] text-white shadow-2xs font-extrabold'
                        : 'text-[#475569] hover:text-[#0F172A]'
                    }`}
                  >
                    🏷️ Accessorial Tariffs
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#EAF2FF] border border-[#1769FF]/30 rounded-xl text-xs text-[#1E3A8A] flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#1769FF] shrink-0">info</span>
                <span>
                  {mapperSchemaMode === 'accessorials' ? (
                    <span>
                      <strong>Accessorial Mapping Active:</strong> Match detected columns to accessorial fields like <strong>Charge Name</strong>, <strong>Rate</strong>, <strong>Unit</strong>, <strong>Free Quantity</strong>, <strong>Context</strong>, and <strong>Notes</strong>.
                    </span>
                  ) : (
                    <span>
                      <strong>Rate Lane Mapping Active:</strong> Match detected spreadsheet columns to rate lane fields like <strong>Origin</strong>, <strong>Destination</strong>, <strong>Base Rate</strong>, and <strong>Equipment</strong>.
                    </span>
                  )}
                </span>
              </div>

              {/* LIVE COLUMN DATA INSPECTOR & MAPPER MATRIX */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#1769FF]">visibility</span>
                    <span>Detected Columns ({detectedCols.length}) & System Mapping</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#178A68] bg-[#EAFDF5] px-2 py-0.5 rounded border border-[#178A68]/30">
                    Live Data Inspector
                  </span>
                </div>

                <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg bg-white">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-[#F1F5F9] border-b border-[#E2E8F0] font-extrabold text-[#475569]">
                      <tr>
                        <th className="p-2.5 w-14 text-center border-r border-[#E2E8F0]">Col</th>
                        <th className="p-2.5 border-r border-[#E2E8F0] min-w-[120px]">File Header</th>
                        <th className="p-2.5 border-r border-[#E2E8F0]">Sample Data (Rows 1–3)</th>
                        <th className="p-2.5 border-r border-[#E2E8F0] min-w-[180px]">Assign System Field</th>
                        <th className="p-2.5 text-center w-28">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#0F172A]">
                      {detectedCols.map((col) => {
                        const targetRole = colAssignments[col.colIndex] || 'exclude';
                        const isExcluded = targetRole === 'exclude';

                        return (
                          <tr
                            key={col.colIndex}
                            className={`transition-colors ${
                              isExcluded ? 'bg-[#F8FAFC] opacity-60' : 'hover:bg-[#F1F5F9]/50'
                            }`}
                          >
                            <td className="p-2 text-center font-bold text-[#1769FF] bg-[#F1F5F9]/50 border-r border-[#E2E8F0]">
                              #{col.colIndex + 1}
                            </td>
                            <td className={`p-2 font-bold border-r border-[#E2E8F0] ${isExcluded ? 'line-through text-[#94A3B8]' : 'text-[#0B1930]'}`}>
                              {col.header}
                            </td>
                            <td className="p-2 font-mono text-[10px] text-[#334155] border-r border-[#E2E8F0]">
                              {col.samples.map((s, idx) => (
                                <span key={idx} className="inline-block bg-[#F1F5F9] px-1.5 py-0.5 rounded mr-1 mb-0.5 border border-[#CBD5E1]">
                                  "{s}"
                                </span>
                              ))}
                            </td>
                            <td className="p-2 border-r border-[#E2E8F0]">
                              <select
                                value={targetRole}
                                onChange={(e) =>
                                  setColAssignments((prev) => ({ ...prev, [col.colIndex]: e.target.value }))
                                }
                                className={`w-full text-xs font-bold rounded-lg px-2 py-1 border transition-colors focus:outline-none ${
                                  isExcluded
                                    ? 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]'
                                    : 'bg-white text-[#0F172A] border-[#1769FF] shadow-2xs'
                                }`}
                              >
                                {mapperSchemaMode === 'accessorials' ? (
                                  <>
                                    <option value="acc_charge">🏷️ Identified Charge Name (Bobtail, Detention, Pre-Pull, etc.)</option>
                                    <option value="acc_customer">🏢 Customer / Account Name</option>
                                    <option value="acc_rate">💵 Charge Rate / Amount ($ or %)</option>
                                    <option value="acc_unit">📐 Billing Unit (Per hour, Per move, Per day, % of LH)</option>
                                    <option value="acc_free_qty">⏱️ Free Quantity Allowance</option>
                                    <option value="acc_free_unit">⌛ Free Unit (hour, day)</option>
                                    <option value="acc_context">📍 Context / Location Scope (Port LA/LB, Warehouse)</option>
                                    <option value="acc_scope">🛣️ Lane Scope (All lanes, Regional)</option>
                                    <option value="acc_notes">📝 Notes & Operational Rules</option>
                                    <option value="exclude">❌ ❌ EXCLUDE / IGNORE COLUMN</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="origin">📍 Origin (POL / Ramp / Port)</option>
                                    <option value="destination">🏁 Destination (POD / Ramp / City)</option>
                                    <option value="rate">💵 Base Tariff Rate ($)</option>
                                    <option value="effDate">📅 Effective Date</option>
                                    <option value="expDate">📅 Expiration Date</option>
                                    <option value="equipment">🚚 Equipment / Size (Optional)</option>
                                    <option value="exclude">❌ ❌ EXCLUDE / IGNORE COLUMN</option>
                                  </>
                                )}
                              </select>
                            </td>
                            <td className="p-2 text-center">
                              {isExcluded ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setColAssignments((prev) => ({
                                      ...prev,
                                      [col.colIndex]: mapperSchemaMode === 'accessorials' ? (col.colIndex === 0 ? 'acc_customer' : col.colIndex === 1 ? 'acc_charge' : 'acc_rate') : (col.colIndex === 0 ? 'origin' : col.colIndex === 1 ? 'destination' : 'rate')
                                    }))
                                  }
                                  className="px-2 py-1 bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] rounded-lg font-bold text-[10px] border border-[#CBD5E1] cursor-pointer transition-colors"
                                >
                                  + Include
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setColAssignments((prev) => ({ ...prev, [col.colIndex]: 'exclude' }))
                                  }
                                  className="px-2 py-1 bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg font-extrabold text-[10px] border border-[#FECACA] cursor-pointer transition-colors flex items-center justify-center gap-1 mx-auto"
                                >
                                  <span className="material-symbols-outlined text-[13px]">cancel</span>
                                  <span>X Out</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setColAssignments(autoAssignColumns(mapperSchemaMode, detectedCols));
                  setDownloadToast('Reset column header mappings to system defaults.');
                  setTimeout(() => setDownloadToast(null), 3000);
                }}
                className="px-3 py-1.5 text-[#64748B] hover:text-[#0F172A] font-bold text-xs cursor-pointer"
              >
                Reset Defaults
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowColumnMapModal(false)}
                  className="px-4 py-1.5 border border-[#CBD5E1] text-[#334155] rounded-xl font-bold text-xs hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowColumnMapModal(false);
                    if (mapperSchemaMode === 'accessorials') {
                      setImportDatasetType('accessorials');
                    } else {
                      setImportDatasetType('lanes');
                    }
                    if (pastedText.trim()) {
                      handleParsePastedText();
                    }
                    setDownloadToast('Applied new column header mappings to staged records!');
                    setTimeout(() => setDownloadToast(null), 4000);
                  }}
                  className="px-5 py-1.5 bg-[#1769FF] text-white rounded-xl font-bold text-xs hover:bg-[#1769FF]/90 transition-shadow shadow-md cursor-pointer"
                >
                  Apply Column Mapping & Refresh Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Account Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1930]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#D8E1EB] overflow-hidden">
            <div className="p-5 border-b border-[#D8E1EB] bg-[#F4F7FA] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1769FF]">domain_add</span>
                <h3 className="font-extrabold text-sm text-[#0B1930]">Add New Customer Account</h3>
              </div>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="text-[#64748B] hover:text-[#0B1930] p-1 rounded-lg hover:bg-white transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCustName.trim()) return;

                const trimmedName = newCustName.trim();
                const code = newCustCode.trim().toUpperCase() || trimmedName.substring(0, 4).toUpperCase();

                if (!customCustomers.includes(trimmedName)) {
                  setCustomCustomers((prev) => [trimmedName, ...prev]);
                }

                if (onAddCustomer) {
                  onAddCustomer({ name: trimmedName, code });
                }

                setSelectedCustomer(trimmedName);
                setShowNewCustomerModal(false);
                setNewCustName('');
                setNewCustCode('');
                setDownloadToast(`New Customer "${trimmedName}" created and active for rate upload!`);
                setTimeout(() => setDownloadToast(null), 4000);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-[10px] text-[#45474d] mb-1 block uppercase tracking-wider">
                  CUSTOMER COMPANY / LOGISTICS ACCOUNT NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Target Corporation, Tesla Logistics, Costco Wholesale"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-white border border-[#D8E1EB] rounded-lg px-3 py-2 text-xs font-semibold text-[#0B1930] focus:border-[#1769FF] focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-bold text-[10px] text-[#45474d] mb-1 block uppercase tracking-wider">
                  SCAC / ACCOUNT SHORT CODE (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g., TGT, TSLA, COST"
                  value={newCustCode}
                  onChange={(e) => setNewCustCode(e.target.value)}
                  className="w-full bg-white border border-[#D8E1EB] rounded-lg px-3 py-2 text-xs font-semibold text-[#0B1930] focus:border-[#1769FF] focus:outline-none uppercase"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="px-4 py-2 border border-[#CBD5E1] text-[#334155] rounded-xl font-bold text-xs hover:bg-[#F1F5F9] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1769FF] text-white rounded-xl font-bold text-xs hover:bg-[#1769FF]/90 transition-shadow shadow-md active:scale-[0.98]"
                >
                  Save & Select Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pre-Publish Rate Directory Page Preview Modal */}
      {showRateDirectoryPreviewModal && (
        <div className="fixed inset-0 bg-[#0B1930]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-[#CBD5E1]">
            {/* Header */}
            <div className="p-5 border-b border-[#E2E8F0] bg-[#0F172A] text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1769FF] flex items-center justify-center text-white font-extrabold">
                  <span className="material-symbols-outlined text-lg">find_in_page</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">Pre-Publish Rate Directory Preview</h3>
                  <p className="text-xs text-[#94A3B8]">
                    Verify how staged rate rules map to the live Rate Directory for <strong className="text-white">{selectedCustomer}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRateDirectoryPreviewModal(false)}
                className="text-[#94A3B8] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs bg-[#F8FAFC]">
              {/* Account Overview */}
              <div className="bg-white border border-[#CBD5E1] rounded-xl p-4 shadow-2xs flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block">
                    TARGET CUSTOMER ACCOUNT
                  </span>
                  <p className="text-base font-extrabold text-[#0F172A]">{selectedCustomer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#EAF2FF] text-[#1769FF] border border-[#1769FF]/30 font-bold px-3 py-1 rounded-full text-xs">
                    {stagedRecords.length} Staged Rate Lanes
                  </span>
                  <span className="bg-[#EAFDF5] text-[#178A68] border border-[#178A68]/30 font-bold px-3 py-1 rounded-full text-xs">
                    {stagedAccessorials.length} Accessorial Rules
                  </span>
                </div>
              </div>

              {/* Staged Contract Lanes Preview */}
              <div className="bg-white border border-[#CBD5E1] rounded-xl p-4 space-y-3 shadow-2xs">
                <div className="flex justify-between items-center border-b border-[#F1F5F9] pb-2">
                  <h4 className="font-extrabold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#1769FF] text-base">route</span>
                    <span>Contract Base Rate Lanes Preview</span>
                  </h4>
                  <span className="text-[11px] text-[#64748B] font-medium">Mapped to Rate Directory DB</span>
                </div>

                {stagedRecords.length > 0 ? (
                  <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[#475569] font-bold text-[10px] uppercase">
                        <tr>
                          <th className="p-2">Origin</th>
                          <th className="p-2">Destination</th>
                          <th className="p-2 text-right">Base Rate</th>
                          <th className="p-2">Equipment</th>
                          <th className="p-2">Fuel Scale</th>
                          <th className="p-2">Effective</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {stagedRecords.slice(0, 5).map((row) => (
                          <tr key={row.id} className="hover:bg-[#F8FAFC]">
                            <td className="p-2 font-bold text-[#0F172A]">{row.origin}</td>
                            <td className="p-2 font-bold text-[#0F172A]">{row.destination}</td>
                            <td className="p-2 text-right font-extrabold text-[#1769FF]">{row.rate}</td>
                            <td className="p-2 text-[#475569]">{row.equipment}</td>
                            <td className="p-2 text-[#475569] truncate max-w-[140px]">{row.fuelScale}</td>
                            <td className="p-2 text-[#64748B] font-mono text-[10px]">{row.effectiveDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {stagedRecords.length > 5 && (
                      <p className="p-2 bg-[#F8FAFC] text-[11px] font-bold text-[#64748B] text-center border-t border-[#E2E8F0]">
                        + {stagedRecords.length - 5} more staged rate lanes will be committed
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#64748B] italic p-3 bg-[#F8FAFC] rounded-lg border border-dashed border-[#CBD5E1]">
                    No rate lanes currently staged. (Existing published directory lanes for {selectedCustomer} remain unchanged).
                  </p>
                )}
              </div>

              {/* Staged Accessorial Tariffs Preview */}
              <div className="bg-white border border-[#CBD5E1] rounded-xl p-4 space-y-3 shadow-2xs">
                <div className="flex justify-between items-center border-b border-[#F1F5F9] pb-2">
                  <h4 className="font-extrabold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#178A68] text-base">sell</span>
                    <span>Accessorial Tariffs & Demurrage Rules Preview</span>
                  </h4>
                  <span className="text-[11px] text-[#64748B] font-medium">Mapped to Tariff Schedule</span>
                </div>

                {stagedAccessorials.length > 0 ? (
                  <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-[#475569] font-bold text-[10px] uppercase">
                        <tr>
                          <th className="p-2">Charge Type</th>
                          <th className="p-2 text-right">Rate</th>
                          <th className="p-2">Billing Unit</th>
                          <th className="p-2">Free Allowance</th>
                          <th className="p-2">Context / Port</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {stagedAccessorials.slice(0, 5).map((acc) => (
                          <tr key={acc.id} className="hover:bg-[#F8FAFC]">
                            <td className="p-2 font-bold text-[#0F172A]">{acc.chargeType}</td>
                            <td className="p-2 text-right font-bold text-[#178A68]">{acc.rate}</td>
                            <td className="p-2 text-[#475569]">{acc.unit}</td>
                            <td className="p-2 text-[#475569]">
                              {acc.freeQty ? `${acc.freeQty} ${acc.freeUnit}` : 'None'}
                            </td>
                            <td className="p-2 text-[#64748B]">{acc.context}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-[#64748B] italic p-3 bg-[#F8FAFC] rounded-lg border border-dashed border-[#CBD5E1]">
                    No accessorial rules currently staged for this import batch.
                  </p>
                )}
              </div>
            </div>

            {/* Footer Controls */}
            <div className="p-4 border-t border-[#E2E8F0] bg-white flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#64748B] font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-[#178A68]">verified</span>
                <span>Verification passed. All data structures match Rate Directory schema.</span>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRateDirectoryPreviewModal(false)}
                  className="px-4 py-2 border border-[#CBD5E1] text-[#334155] rounded-xl font-bold text-xs hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={handleCommitAllStaging}
                  className="px-6 py-2 bg-[#1769FF] text-white rounded-xl font-extrabold text-xs hover:bg-[#1769FF]/90 transition-shadow shadow-md active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">rocket_launch</span>
                  <span>PUBLISH ALL STAGED RATES NOW</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
