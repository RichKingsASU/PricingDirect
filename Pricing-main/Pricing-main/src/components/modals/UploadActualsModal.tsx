import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { ActualLoadIngestRecord, LaneException } from '../../types';
import { normalizeToIsoDate } from '../../utils/dateWeekUtils';
import { consolidateLocationString } from '../../utils/cityConsolidationUtils';

interface UploadActualsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngest: (records: ActualLoadIngestRecord[]) => Promise<void>;
  existingExceptions: LaneException[];
  onResetBaseline?: () => Promise<void>;
}

export function UploadActualsModal({
  isOpen,
  onClose,
  onIngest,
  existingExceptions,
  onResetBaseline
}: UploadActualsModalProps) {
  const [inputMode, setInputMode] = useState<'upload' | 'paste' | 'sample'>('upload');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [parsedRecords, setParsedRecords] = useState<ActualLoadIngestRecord[]>([]);
  const [detectedMapping, setDetectedMapping] = useState<{
    originColName?: string;
    destColName?: string;
    rateColName?: string;
    carrierColName?: string;
    dateColName?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  // String sanitizer to completely strip binary/control characters
  const sanitizeText = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/[\x00-\x1F\x7F-\x9F\uFFFD]/g, '')
      .trim();
  };

  // Helper to find target rate for a lane
  const findTargetRate = (orig: string, dest: string, actualRate: number): number => {
    const origConsolidated = consolidateLocationString(sanitizeText(orig)).toLowerCase();
    const destConsolidated = consolidateLocationString(sanitizeText(dest)).toLowerCase();
    const origRaw = sanitizeText(orig).toLowerCase();
    const destRaw = sanitizeText(dest).toLowerCase();

    const match = existingExceptions.find((e) => {
      const eOrigConsolidated = consolidateLocationString(e.origin).toLowerCase();
      const eDestConsolidated = consolidateLocationString(e.destination).toLowerCase();
      const eOrigRaw = e.origin.toLowerCase();
      const eDestRaw = e.destination.toLowerCase();

      const origMatches =
        eOrigConsolidated.includes(origConsolidated) ||
        origConsolidated.includes(eOrigConsolidated) ||
        eOrigRaw.includes(origRaw) ||
        origRaw.includes(eOrigRaw);

      const destMatches =
        eDestConsolidated.includes(destConsolidated) ||
        destConsolidated.includes(eDestConsolidated) ||
        eDestRaw.includes(destRaw) ||
        destRaw.includes(eDestRaw);

      return origMatches && destMatches;
    });

    if (match) return match.currentTarget;
    return Math.round(actualRate * 0.94);
  };

  // Process rows from Excel array or CSV rows
  const processStructuredRows = (rawRows: (string | number | null | undefined)[][]) => {
    setParseError(null);
    if (!rawRows || rawRows.length === 0) {
      setParsedRecords([]);
      return;
    }

    // Filter out completely blank rows
    const rows = rawRows
      .map((r) => r.map((cell) => sanitizeText(cell)))
      .filter((r) => r.some((c) => c.length > 0));

    if (rows.length === 0) {
      setParsedRecords([]);
      return;
    }

    // Identify header row in first 15 rows
    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const rowText = rows[i].map((c) => c.toLowerCase()).join(' ');
      if (
        rowText.includes('origin') ||
        rowText.includes('pickup') ||
        rowText.includes('rate') ||
        rowText.includes('pay') ||
        rowText.includes('dest') ||
        rowText.includes('drop') ||
        rowText.includes('carrier') ||
        rowText.includes('customer') ||
        rowText.includes('ld_num') ||
        rowText.includes('linehaul')
      ) {
        headerRowIdx = i;
        break;
      }
    }

    const headers = headerRowIdx >= 0 ? rows[headerRowIdx].map((h) => h.toLowerCase()) : [];
    const dataRows = headerRowIdx >= 0 ? rows.slice(headerRowIdx + 1) : rows;

    // Advanced, priority-based column finder that prevents picking facility names or serial dates
    const findBestCol = (
      exactMatches: string[],
      prefixSuffixMatches: string[],
      excludedWords: string[] = []
    ): number => {
      if (!headers.length) return -1;

      // Pass 1: Exact match
      for (const match of exactMatches) {
        const idx = headers.findIndex((h) => h.trim() === match);
        if (idx !== -1) return idx;
      }

      // Pass 2: High confidence contains match with exclusion check
      for (const match of exactMatches) {
        const idx = headers.findIndex((h) => {
          if (excludedWords.some((ex) => h.includes(ex))) return false;
          return h.includes(match);
        });
        if (idx !== -1) return idx;
      }

      // Pass 3: Suffix / prefix matches with exclusion check
      for (const match of prefixSuffixMatches) {
        const idx = headers.findIndex((h) => {
          if (excludedWords.some((ex) => h.includes(ex))) return false;
          return h.includes(match);
        });
        if (idx !== -1) return idx;
      }

      return -1;
    };

    // 1. Origin City (Prioritize pickup_loc_City / origin_city over facility/terminal names)
    const origCol = findBestCol(
      [
        'pickup_loc_city',
        'origin_city',
        'orig_city',
        'pickup_city',
        'pol_city',
        'from_city',
        'origin city',
        'pickup city',
        'orig city'
      ],
      ['origin', 'pickup', 'pol', 'from'],
      ['name', 'addr', 'date', 'state', 'province', 'zip', 'postal', 'id', 'num', 'region', 'scac', 'lat', 'long', 'code', 'actual']
    );

    // 2. Origin State
    const origStateCol = findBestCol(
      [
        'pickup_loc_stateprovince',
        'pickup_loc_state',
        'origin_state',
        'orig_state',
        'pickup_state',
        'orig_st',
        'pickup_st',
        'origin state',
        'pickup state'
      ],
      ['state', 'province', '_st'],
      ['name', 'addr', 'city', 'date', 'zip', 'postal', 'id', 'num', 'region', 'drop', 'dest']
    );

    // 3. Destination City (Prioritize drop_loc_City / destination_city over consignee facility names)
    const destCol = findBestCol(
      [
        'drop_loc_city',
        'destination_city',
        'dest_city',
        'drop_city',
        'delivery_city',
        'pod_city',
        'to_city',
        'dest city',
        'drop city',
        'destination city',
        'delivery city'
      ],
      ['destination', 'dest', 'drop', 'delivery', 'pod', 'to'],
      ['name', 'addr', 'date', 'state', 'province', 'zip', 'postal', 'id', 'num', 'region', 'scac', 'lat', 'long', 'code', 'actual']
    );

    // 4. Destination State
    const destStateCol = findBestCol(
      [
        'drop_loc_stateprovince',
        'drop_loc_state',
        'destination_state',
        'dest_state',
        'drop_state',
        'dest_st',
        'drop_st',
        'delivery_state',
        'destination state',
        'drop state'
      ],
      ['state', 'province', '_st'],
      ['name', 'addr', 'city', 'date', 'zip', 'postal', 'id', 'num', 'region', 'pickup', 'origin', 'orig', 'pol']
    );

    // 5. Actual Carrier Pay (Prioritize CARRIER LH + FSC + SURGE / carrier_pay over date serials / weight)
    const actualRateCol = findBestCol(
      [
        'carrier lh + fsc + surge',
        'carrier lh + fsc',
        'carrier_lh_fsc_surge',
        'carrier_pay',
        'carrier pay',
        'actual carrier pay',
        'total carrier pay',
        'carrier_cost',
        'carrier cost',
        'carrier_total',
        'carrier total',
        'carrier_lh',
        'carrier lh',
        'carrier_linehaul',
        'carrier linehaul',
        'actual_pay',
        'actual pay',
        'actual_rate',
        'actual rate',
        'actual_cost',
        'actual cost',
        'total_pay',
        'total pay',
        'total_cost',
        'total cost',
        'carrier_rate',
        'carrier rate',
        'linehaul_rate',
        'linehaul rate',
        'linehaul'
      ],
      ['pay', 'cost', 'linehaul'],
      ['date', 'actual_rc_date', 'pickup_actual_date', 'drop_actual_date', 'createdate', 'weight', 'miles', 'id', 'num', 'scac', 'name', 'time', 'hour', 'day', 'so_', 'ld_', 'container', 'chassis', 'status', 'desc', 'zip', 'target']
    );

    // 6. Target Rate
    const targetRateCol = findBestCol(
      [
        'target_base_rate_usd',
        'target_rate',
        'target rate',
        'target_lh',
        'target lh',
        'target_cost',
        'target cost',
        'target_pay',
        'target pay',
        'benchmark_rate',
        'benchmark',
        'target_linehaul'
      ],
      ['target', 'benchmark'],
      ['date', 'weight', 'miles', 'id', 'num', 'name', 'scac', 'actual', 'carrier', 'pickup', 'drop']
    );

    // 7. Loads / Volume Count
    const loadsCol = findBestCol(
      ['loads', 'load_count', 'load count', 'moves', 'volume', 'qty', 'count'],
      ['load_count', 'moves', 'volume', 'qty', 'count'],
      ['ld_num', 'load_no', 'load_id', 'so_num', 'date', 'rate', 'cost', 'pay', 'chassis']
    );

    // 8. Customer
    const custCol = findBestCol(
      ['customer_name', 'customer name', 'shipper_name', 'shipper name', 'client_name', 'account_name', 'customer', 'shipper', 'client'],
      ['customer', 'shipper', 'client', 'account', 'owner'],
      ['mgr', 'manager', 'acct_mgr', 'carrier', 'trucker', 'vendor', 'rate', 'date', 'pay', 'scac']
    );

    // 9. Carrier
    const carrCol = findBestCol(
      ['carrier_name', 'carrier name', 'trucker_name', 'vendor_name'],
      ['carrier', 'trucker', 'vendor'],
      ['pickup', 'drop', 'dest', 'origin', 'rate', 'pay', 'cost', 'date', 'manager', 'mgr']
    );

    // 10. Account Manager
    const amCol = findBestCol(
      ['acct_mgr_name', 'acct_mgr', 'account_manager', 'account manager', 'am_name'],
      ['acct_mgr', 'manager', 'rep', 'am'],
      ['carrier', 'customer', 'shipper', 'trucker']
    );

    // 11. Load ID
    const loadNoCol = findBestCol(
      ['ld_num', 'load_no', 'load_id', 'load_num', 'load#', 'shipment_id', 'order_no', 'so_num', 'mbl'],
      ['ld_', 'load', 'shipment', 'order'],
      ['cost', 'pay', 'rate', 'date', 'city', 'state', 'name', 'container']
    );

    // 12. Container Number
    const containerCol = findBestCol(
      ['container_number', 'container number', 'container_no', 'container no', 'containerno', 'container#', 'container', 'cntr_num', 'cntr', 'eq_num'],
      ['container', 'cntr', 'equipment'],
      ['cost', 'pay', 'rate', 'date', 'city', 'state', 'carrier']
    );

    // 13. Pickup Date / Outgate Date / Actual RC Date / pickup_actual_date
    const pickupDateCol = findBestCol(
      [
        'pickup_actual_date',
        'pickup actual date',
        'actual_pickup_date',
        'actual pickup date',
        'pickup_actual_dt',
        'pickup_act_date',
        'pickup_actual',
        'pickup_date',
        'pickup date',
        'actual_rc_date',
        'actual rc date',
        'outgate_date',
        'outgate date',
        'outgatedate',
        'date_outgate',
        'ship_date',
        'ship date',
        'movement_date',
        'order_date',
        'rc_date',
        'pickup_dt',
        'pu_date',
        'createdate',
        'date'
      ],
      ['pickup', 'outgate', 'ship_date', 'rc_date', 'date'],
      ['rate', 'pay', 'cost', 'weight', 'mile', 'city', 'state', 'name', 'carrier', 'mgr', 'manager', 'scac', 'desc', 'num', 'id', 'zip']
    );

    const records: ActualLoadIngestRecord[] = [];

    // Helper to format clean City, ST with City Consolidation Mapping
    const formatCityState = (city: string, state?: string): string => {
      const c = city.trim();
      const s = state ? state.trim().toUpperCase() : '';
      if (!c) return '';
      return consolidateLocationString(c, s);
    };

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!row || row.length === 0) continue;

      let origin = '';
      let destination = '';
      let actualRate = 0;
      let targetRate: number | undefined = undefined;
      let loads = 1;
      let customer = 'Commercial Shipper';
      let carrier = 'Regional Carrier Fleet';
      let accountManager = 'Pricing Ops';
      let loadNo = `LD-${i + 1}`;
      let containerNo = `CNTR-${7000000 + i}`;
      let parsedOutgateDate: string | undefined = undefined;

      if (headerRowIdx >= 0) {
        // Extract origin city & state
        const origCity = origCol >= 0 && row[origCol] ? String(row[origCol]).trim() : '';
        const origSt = origStateCol >= 0 && row[origStateCol] ? String(row[origStateCol]).trim() : '';
        if (origCity) {
          origin = formatCityState(origCity, origSt);
        }

        // Extract destination city & state
        const destCity = destCol >= 0 && row[destCol] ? String(row[destCol]).trim() : '';
        const destSt = destStateCol >= 0 && row[destStateCol] ? String(row[destStateCol]).trim() : '';
        if (destCity) {
          destination = formatCityState(destCity, destSt);
        }

        // Extract rate (with safety checks against date serials or weights > 20000)
        if (actualRateCol >= 0 && row[actualRateCol]) {
          const num = parseFloat(String(row[actualRateCol]).replace(/[^0-9.]/g, ''));
          if (!isNaN(num) && num > 0) {
            actualRate = num;
          }
        }

        // If rate is absent or absurdly high (e.g. > 20000 lbs weight), scan row for freight pay
        if (actualRate <= 0 || actualRate > 20000) {
          // Look for any cell with a freight rate value between $200 and $10,000
          for (let c = row.length - 1; c >= 0; c--) {
            const hName = headers[c] || '';
            if (hName.includes('date') || hName.includes('weight') || hName.includes('mile') || hName.includes('num') || hName.includes('so_') || hName.includes('ld_')) {
              continue;
            }
            const val = parseFloat(String(row[c]).replace(/[^0-9.]/g, ''));
            if (!isNaN(val) && val >= 150 && val <= 15000) {
              actualRate = val;
              break;
            }
          }
        }

        // Extract target
        if (targetRateCol >= 0 && row[targetRateCol]) {
          const num = parseFloat(String(row[targetRateCol]).replace(/[^0-9.]/g, ''));
          if (!isNaN(num) && num > 0 && num <= 20000) targetRate = num;
        }

        // Extract loads
        if (loadsCol >= 0 && row[loadsCol]) {
          const num = parseInt(String(row[loadsCol]).replace(/[^0-9]/g, ''), 10);
          if (!isNaN(num) && num > 0 && num < 1000) loads = num;
        }

        // Customer & Carrier
        if (custCol >= 0 && row[custCol]) customer = String(row[custCol]).trim();
        if (carrCol >= 0 && row[carrCol]) carrier = String(row[carrCol]).trim();
        if (amCol >= 0 && row[amCol]) accountManager = String(row[amCol]).trim();
        if (loadNoCol >= 0 && row[loadNoCol]) loadNo = String(row[loadNoCol]).trim();
        if (containerCol >= 0 && row[containerCol]) containerNo = String(row[containerCol]).trim();

        // Pickup Date / Outgate Date normalization
        if (pickupDateCol >= 0 && row[pickupDateCol] !== undefined && row[pickupDateCol] !== null && String(row[pickupDateCol]).trim() !== '') {
          const norm = normalizeToIsoDate(row[pickupDateCol]);
          if (norm) {
            parsedOutgateDate = norm;
          }
        }
      }

      // Fallback if header indexing didn't find lanes
      if (!origin || !destination) {
        origin = row[0] ? consolidateLocationString(String(row[0]).trim()) : '';
        destination = row[1] ? consolidateLocationString(String(row[1]).trim()) : '';
        if (row[2]) {
          const num = parseFloat(String(row[2]).replace(/[^0-9.]/g, ''));
          if (!isNaN(num) && num > 0) actualRate = num;
        }
        if (row[3]) {
          const num = parseFloat(String(row[3]).replace(/[^0-9.]/g, ''));
          if (!isNaN(num) && num > 0) targetRate = num;
        }
      }

      // Fallback date scan across cells if date column wasn't explicitly identified
      if (!parsedOutgateDate) {
        for (let c = 0; c < row.length; c++) {
          if (c === origCol || c === destCol || c === actualRateCol || c === targetRateCol) continue;
          const cellVal = row[c];
          if (cellVal !== undefined && cellVal !== null && String(cellVal).trim() !== '') {
            const norm = normalizeToIsoDate(cellVal);
            if (norm && (norm.startsWith('202') || norm.startsWith('201'))) {
              parsedOutgateDate = norm;
              break;
            }
          }
        }
      }

      // Filter out garbage / non-lane headers
      if (!origin || !destination || origin.length < 2 || destination.length < 2) {
        continue;
      }
      if (origin.toLowerCase() === 'origin' || destination.toLowerCase() === 'destination' || origin.toLowerCase() === 'pol') {
        continue;
      }

      // Ensure sensible rate
      if (actualRate <= 0) {
        actualRate = 750;
      }

      if (!targetRate) {
        targetRate = findTargetRate(origin, destination, actualRate);
      }

      records.push({
        id: `ingest-row-${Date.now()}-${i}`,
        loadNo,
        containerNo,
        origin,
        destination,
        actualRate: Math.round(actualRate),
        targetRate: Math.round(targetRate),
        loads: Math.max(1, loads),
        customer: customer || 'Commercial Shipper',
        carrier: carrier || 'Regional Carrier Fleet',
        accountManager: accountManager || 'Pricing Ops',
        outgateDate: parsedOutgateDate || '2026-06-22',
        isKeyAccount:
          customer.toLowerCase().includes('target') ||
          customer.toLowerCase().includes('dollar') ||
          customer.toLowerCase().includes('amazon') ||
          customer.toLowerCase().includes('walmart')
      });
    }

    if (headerRowIdx >= 0) {
      setDetectedMapping({
        originColName: origCol >= 0 ? rows[headerRowIdx][origCol] : undefined,
        destColName: destCol >= 0 ? rows[headerRowIdx][destCol] : undefined,
        rateColName: actualRateCol >= 0 ? rows[headerRowIdx][actualRateCol] : undefined,
        carrierColName: carrCol >= 0 ? rows[headerRowIdx][carrCol] : undefined,
        dateColName: pickupDateCol >= 0 ? rows[headerRowIdx][pickupDateCol] : undefined
      });
    } else {
      setDetectedMapping(null);
    }

    if (records.length === 0) {
      setParseError('No valid load lanes found. Please check file columns.');
    }

    setParsedRecords(records);
  };

  const parseRawText = (text: string) => {
    if (!text.trim()) {
      setParsedRecords([]);
      return;
    }
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const rows = lines.map((l) => l.split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim()));
    processStructuredRows(rows);
  };

  const handleFileProcess = (file: File) => {
    setUploadedFileName(file.name);
    setParseError(null);
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.xlsm') || file.name.endsWith('.csv');

    const reader = new FileReader();

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.xlsm')) {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows: (string | number | null | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: ''
          });
          processStructuredRows(rawRows);
        } catch (err) {
          console.error('Error parsing Excel file:', err);
          setParseError('Failed to parse Excel file. Please verify format.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (event) => {
        const content = event.target?.result as string;
        parseRawText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Sample actual dataset
  const sampleLoadData: ActualLoadIngestRecord[] = [
    {
      loadNo: 'LD541328',
      origin: 'Oakland, CA',
      destination: 'Stockton, CA',
      actualRate: 895,
      targetRate: 545,
      loads: 32,
      customer: 'Dollar Tree Distribution Inc',
      carrier: 'FLAT-LINE XPRESS LLC',
      carrierScac: 'FLXP',
      accountManager: 'Drayage Ops',
      isKeyAccount: true
    },
    {
      loadNo: 'LD541329',
      origin: 'Oakland, CA',
      destination: 'Reno, NV',
      actualRate: 1580,
      targetRate: 1200,
      loads: 24,
      customer: 'Target Corp',
      carrier: 'Swift Transportation',
      carrierScac: 'SWFT',
      accountManager: 'Sarah Jenkins',
      isKeyAccount: true
    },
    {
      loadNo: 'LD541330',
      origin: 'Los Angeles, CA',
      destination: 'Phoenix, AZ',
      actualRate: 1485,
      targetRate: 1380,
      loads: 45,
      customer: 'Amazon Logistics',
      carrier: 'JED LOGISTICS INC',
      carrierScac: 'JEDL',
      accountManager: 'Mike Ross',
      isKeyAccount: true
    },
    {
      loadNo: 'LD541331',
      origin: 'Seattle, WA',
      destination: 'Portland, OR',
      actualRate: 710,
      targetRate: 700,
      loads: 28,
      customer: 'Home Depot',
      carrier: 'Cascade Freight Lines',
      carrierScac: 'CSCD',
      accountManager: 'Drayage Ops',
      isKeyAccount: false
    },
    {
      loadNo: 'LD541332',
      origin: 'San Pedro, CA',
      destination: 'Henderson, NV',
      actualRate: 1720,
      targetRate: 1600,
      loads: 19,
      customer: 'Best Buy Co',
      carrier: 'Apex Logistics LLC',
      carrierScac: 'APEX',
      accountManager: 'Sarah Jenkins',
      isKeyAccount: true
    },
    {
      loadNo: 'LD541333',
      origin: 'Denver, CO',
      destination: 'Colorado Springs, CO',
      actualRate: 480,
      targetRate: 490,
      loads: 15,
      customer: 'Target Corp',
      carrier: 'Mile High Express',
      carrierScac: 'MHEX',
      accountManager: 'Mike Ross',
      isKeyAccount: false
    }
  ];

  const handleLoadSample = () => {
    setInputMode('sample');
    setUploadedFileName('Weekly_Actual_Carrier_Pay_Run.csv');
    setParsedRecords(sampleLoadData);
  };

  const handleConfirmIngest = async () => {
    if (parsedRecords.length === 0) return;
    setIsProcessing(true);
    try {
      await onIngest(parsedRecords);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetBaseline = async () => {
    if (onResetBaseline) {
      setIsProcessing(true);
      try {
        await onResetBaseline();
        onClose();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Preview analytics
  const totalLoads = parsedRecords.reduce((sum, r) => sum + (r.loads || 1), 0);
  const atUnderCount = parsedRecords.filter((r) => {
    const tgt = r.targetRate || findTargetRate(r.origin, r.destination, r.actualRate);
    return r.actualRate <= tgt;
  }).length;
  const over0to5Count = parsedRecords.filter((r) => {
    const tgt = r.targetRate || findTargetRate(r.origin, r.destination, r.actualRate);
    const varPct = ((r.actualRate - tgt) / tgt) * 100;
    return varPct > 0 && varPct <= 5;
  }).length;
  const over5Count = parsedRecords.filter((r) => {
    const tgt = r.targetRate || findTargetRate(r.origin, r.destination, r.actualRate);
    const varPct = ((r.actualRate - tgt) / tgt) * 100;
    return varPct > 5;
  }).length;

  return (
    <div
      id="upload-actuals-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1930]/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#D8E1EB] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#D8E1EB] bg-[#0B1930] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1769FF]/20 border border-[#1769FF]/40 flex items-center justify-center text-[#1769FF]">
              <span className="material-symbols-outlined text-2xl">compare_arrows</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Upload Weekly Load Data & Actuals</h2>
                <span className="bg-[#178A68]/30 text-[#4ADE80] border border-[#178A68]/50 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Target Variance Engine
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Input actual carrier pay loads to compare against current target rates in Target Control Tower
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-4 pb-2 bg-[#F8FAFC] border-b border-[#D8E1EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputMode('upload')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                inputMode === 'upload'
                  ? 'bg-[#1769FF] text-white shadow-sm'
                  : 'bg-white text-[#475569] border border-[#D8E1EB] hover:bg-[#F1F5F9]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              <span>Upload CSV / Excel File</span>
            </button>

            <button
              onClick={() => setInputMode('paste')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                inputMode === 'paste'
                  ? 'bg-[#1769FF] text-white shadow-sm'
                  : 'bg-white text-[#475569] border border-[#D8E1EB] hover:bg-[#F1F5F9]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">content_paste</span>
              <span>Paste Text / TSV</span>
            </button>

            <button
              onClick={handleLoadSample}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                inputMode === 'sample'
                  ? 'bg-[#1769FF] text-white shadow-sm'
                  : 'bg-white text-[#475569] border border-[#D8E1EB] hover:bg-[#F1F5F9]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>Load Sample Weekly Actuals</span>
            </button>
          </div>

          {parsedRecords.length > 0 && (
            <span className="text-xs font-extrabold text-[#178A68] bg-[#EAF7EE] px-2.5 py-1 rounded-full border border-[#178A68]/30">
              {parsedRecords.length} lanes parsed ({totalLoads} total loads)
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-[#F8FAFC]">
          {/* File Upload Drop Area */}
          {inputMode === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white ${
                dragActive
                  ? 'border-[#1769FF] bg-[#1769FF]/5'
                  : uploadedFileName
                  ? 'border-[#178A68] bg-[#178A68]/5'
                  : 'border-[#CBD5E1] hover:border-[#1769FF]'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[#1769FF]/10 text-[#1769FF] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl">
                  {uploadedFileName ? 'check_circle' : 'cloud_upload'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Drag & drop weekly load data file here'}
              </h3>
              <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
                Accepts weekly operational load exports with actual carrier pay (CARRIER LH + FSC + SURGE), origin/destination, and move details.
              </p>
              {uploadedFileName && detectedMapping && (
                <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="font-bold text-[#0F172A]">Mapped Columns:</span>
                  {detectedMapping.originColName && (
                    <span className="bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] px-2 py-0.5 rounded-md font-mono text-[11px]">
                      Origin City: <strong>{detectedMapping.originColName}</strong>
                    </span>
                  )}
                  {detectedMapping.destColName && (
                    <span className="bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] px-2 py-0.5 rounded-md font-mono text-[11px]">
                      Dest City: <strong>{detectedMapping.destColName}</strong>
                    </span>
                  )}
                  {detectedMapping.rateColName && (
                    <span className="bg-[#EAF7EE] text-[#15803D] border border-[#BBF7D0] px-2 py-0.5 rounded-md font-mono text-[11px]">
                      Carrier Pay: <strong>{detectedMapping.rateColName}</strong>
                    </span>
                  )}
                  {detectedMapping.dateColName && (
                    <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2 py-0.5 rounded-md font-mono text-[11px]">
                      Pickup Date: <strong>{detectedMapping.dateColName}</strong>
                    </span>
                  )}
                  {detectedMapping.carrierColName && (
                    <span className="bg-[#F8FAFC] text-[#475569] border border-[#CBD5E1] px-2 py-0.5 rounded-md font-mono text-[11px]">
                      Carrier: <strong>{detectedMapping.carrierColName}</strong>
                    </span>
                  )}
                </div>
              )}
              <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1769FF] text-white rounded-lg text-xs font-bold hover:bg-[#1769FF]/90 transition-all cursor-pointer shadow-sm">
                <span className="material-symbols-outlined text-base">folder_open</span>
                <span>Select File from Computer</span>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Text Paste Area */}
          {inputMode === 'paste' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#334155] flex items-center justify-between">
                <span>Paste Comma or Tab-Separated Load Data:</span>
                <span className="text-[11px] font-normal text-[#64748B]">
                  Columns: Origin, Destination, ActualRate, [TargetRate], [Loads], [Customer], [Carrier]
                </span>
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  parseRawText(e.target.value);
                }}
                placeholder={`Oakland, CA\tStockton, CA\t885\t545\t28\tDollar Tree\tFLAT-LINE XPRESS\nOakland, CA\tReno, NV\t1560\t1200\t18\tTarget Corp\tSwift\nLos Angeles, CA\tPhoenix, AZ\t1450\t1380\t35\tAmazon\tJED Logistics`}
                rows={5}
                className="w-full bg-white border border-[#CBD5E1] rounded-xl p-3 text-xs font-mono text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#1769FF]/20 focus:border-[#1769FF]"
              />
            </div>
          )}

          {/* Quick Guidance Alert */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3.5 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#1769FF] text-lg shrink-0 mt-0.5">info</span>
            <div className="text-xs text-[#1E3A8A]">
              <span className="font-bold">How Target Control Tower computes Over / Under:</span>
              <p className="mt-0.5 text-[#3B82F6]">
                Incoming actual rates are compared with published target rates for each lane. Variances ($ and %) update the Top KPI stats, Market Rollup summaries, and the Lane Exceptions Control Table.
              </p>
            </div>
          </div>

          {/* Target vs Actual Comparison Preview Table */}
          {parsedRecords.length > 0 ? (
            <div className="bg-white border border-[#D8E1EB] rounded-xl overflow-hidden shadow-xs">
              {/* Variance Summary Stats */}
              <div className="p-3 bg-[#F1F5F9] border-b border-[#D8E1EB] grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                  <div className="text-[10px] uppercase font-bold text-[#64748B]">Total Loads</div>
                  <div className="text-base font-extrabold text-[#0F172A] mt-0.5">{totalLoads}</div>
                </div>
                <div className="bg-[#EAF7EE] p-2 rounded-lg border border-[#178A68]/30">
                  <div className="text-[10px] uppercase font-bold text-[#178A68]">At/Under Target</div>
                  <div className="text-base font-extrabold text-[#178A68] mt-0.5">
                    {atUnderCount} ({Math.round((atUnderCount / Math.max(1, parsedRecords.length)) * 100)}%)
                  </div>
                </div>
                <div className="bg-[#FEF6E9] p-2 rounded-lg border border-[#D58A16]/30">
                  <div className="text-[10px] uppercase font-bold text-[#D58A16]">Over 0% - 5%</div>
                  <div className="text-base font-extrabold text-[#D58A16] mt-0.5">
                    {over0to5Count} ({Math.round((over0to5Count / Math.max(1, parsedRecords.length)) * 100)}%)
                  </div>
                </div>
                <div className="bg-[#FDEDEC] p-2 rounded-lg border border-[#E53935]/30">
                  <div className="text-[10px] uppercase font-bold text-[#E53935]">Over Target &gt;5%</div>
                  <div className="text-base font-extrabold text-[#E53935] mt-0.5">
                    {over5Count} ({Math.round((over5Count / Math.max(1, parsedRecords.length)) * 100)}%)
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#D8E1EB] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Lane (Origin → Destination)</th>
                      <th className="py-2.5 px-3">Customer / Carrier</th>
                      <th className="py-2.5 px-3 text-right">Actual Pay</th>
                      <th className="py-2.5 px-3 text-right">Target Rate</th>
                      <th className="py-2.5 px-3 text-right">Variance ($)</th>
                      <th className="py-2.5 px-3 text-right">Variance (%)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] font-medium">
                    {parsedRecords.map((r, idx) => {
                      const target = r.targetRate || findTargetRate(r.origin, r.destination, r.actualRate);
                      const varDollars = r.actualRate - target;
                      const varPercent = Math.round(((r.actualRate - target) / target) * 1000) / 10;
                      const isAtUnder = varPercent <= 0;
                      const isOver0To5 = varPercent > 0 && varPercent <= 5;

                      return (
                        <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-2 px-3 font-bold text-[#0F172A]">
                            {r.origin} <span className="text-[#94A3B8]">→</span> {r.destination}
                            <span className="block text-[10px] font-normal text-[#64748B]">
                              {r.loads || 1} load(s)
                            </span>
                          </td>
                          <td className="py-2 px-3 text-[#334155]">
                            <div className="font-medium truncate max-w-[140px]">{r.customer}</div>
                            <div className="text-[10px] text-[#64748B] truncate max-w-[140px]">{r.carrier}</div>
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-[#0F172A] tabular-nums">
                            ${r.actualRate.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-[#475569] tabular-nums">
                            ${target.toLocaleString()}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-bold tabular-nums ${
                              isAtUnder ? 'text-[#178A68]' : isOver0To5 ? 'text-[#D58A16]' : 'text-[#E53935]'
                            }`}
                          >
                            {varDollars >= 0 ? `+$${varDollars}` : `-$${Math.abs(varDollars)}`}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-extrabold tabular-nums ${
                              isAtUnder ? 'text-[#178A68]' : isOver0To5 ? 'text-[#D58A16]' : 'text-[#E53935]'
                            }`}
                          >
                            {varPercent >= 0 ? `+${varPercent}%` : `${varPercent}%`}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isAtUnder
                                  ? 'bg-[#EAF7EE] text-[#178A68] border border-[#178A68]/30'
                                  : isOver0To5
                                  ? 'bg-[#FEF6E9] text-[#D58A16] border border-[#D58A16]/30'
                                  : 'bg-[#FDEDEC] text-[#E53935] border border-[#E53935]/30'
                              }`}
                            >
                              {isAtUnder ? 'At / Under' : isOver0To5 ? 'Over 0-5%' : 'Over >5%'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-white border border-[#D8E1EB] rounded-xl text-[#64748B]">
              <span className="material-symbols-outlined text-3xl text-[#94A3B8] mb-1">query_stats</span>
              <p className="text-xs font-medium">No data loaded yet. Upload a file, paste records, or click "Load Sample Weekly Actuals".</p>
            </div>
          )}
          {parseError && (
            <div className="p-3 bg-[#FDEDEC] border border-[#E53935]/30 rounded-xl text-xs text-[#E53935] flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{parseError}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#D8E1EB] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {onResetBaseline && (
              <button
                onClick={handleResetBaseline}
                disabled={isProcessing}
                className="px-3.5 py-2 text-xs font-bold text-[#D58A16] hover:bg-[#FEF6E9] border border-[#D58A16]/30 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                title="Reset Target Control Tower data back to the clean baseline"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Revert Baseline Data</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {parsedRecords.length > 0 && (
              <span className="text-xs text-[#64748B]">
                Ready to update Target Control Tower with <strong>{parsedRecords.length}</strong> lanes
              </span>
            )}

            <button
              onClick={handleConfirmIngest}
              disabled={parsedRecords.length === 0 || isProcessing}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                parsedRecords.length === 0 || isProcessing
                  ? 'bg-[#94A3B8] text-white opacity-50 cursor-not-allowed'
                  : 'bg-[#1769FF] text-white hover:bg-[#1769FF]/90 active:scale-[0.98]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {isProcessing ? 'hourglass_top' : 'check_circle'}
              </span>
              <span>{isProcessing ? 'Ingesting Actuals...' : 'Ingest to Target Control Tower'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
