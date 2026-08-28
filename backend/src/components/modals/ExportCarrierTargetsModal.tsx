import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Region, CustomerRateLane, LaneException } from '../../types';

interface ExportCarrierTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: Region;
  laneExceptions: LaneException[];
  customerLanes: CustomerRateLane[];
  onExportCSV?: (filename: string, rows: Record<string, unknown>[]) => void;
}

export const ExportCarrierTargetsModal: React.FC<ExportCarrierTargetsModalProps> = ({
  isOpen,
  onClose,
  selectedRegion,
  laneExceptions,
  customerLanes: _customerLanes
}) => {
  const [regionFilter, setRegionFilter] = useState<Region | 'USA'>(selectedRegion || 'USA');
  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('Current Week (Jun 21 - Jun 27, 2026)');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_adjustment' | 'adjusted'>('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');

  if (!isOpen) return null;

  const handleExecuteExport = () => {
    // Filter lane exceptions according to export choices
    const filteredExceptions = laneExceptions.filter((exc) => {
      const matchesRegion = regionFilter === 'USA' || exc.market === regionFilter;
      const matchesMarket =
        marketFilter === 'all' ||
        exc.origin.toLowerCase().includes(marketFilter.toLowerCase()) ||
        exc.destination.toLowerCase().includes(marketFilter.toLowerCase());
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'needs_adjustment'
          ? exc.adjustmentStatus !== 'Adjusted'
          : exc.adjustmentStatus === 'Adjusted';

      return matchesRegion && matchesMarket && matchesStatus;
    });

    // Transform into clean export rows without Equipment or Lane ID as explicitly requested
    const exportRows = filteredExceptions.map((exc) => {
      return {
        'Origin': exc.origin,
        'Destination': exc.destination,
        'Region': exc.market,
        'Weekly Loads': exc.loads,
        'Current Target Rate ($)': exc.currentTarget,
        'Avg Actual Rate ($)': exc.avgActual,
        'Variance ($)': exc.varDollars,
        'Variance (%)': `${exc.varPercent >= 0 ? '+' : ''}${exc.varPercent.toFixed(1)}%`,
        'Confidence Rating': exc.confidence,
        'Adjustment Status': exc.adjustmentStatus || 'Needs Review',
        'Timeframe Period': timeframe,
        'Export Date': new Date().toLocaleDateString('en-US')
      };
    });

    if (exportRows.length === 0) {
      alert('No matching lanes found for the selected export filter options.');
      return;
    }

    const regionTag = regionFilter === 'USA' ? 'Nationwide' : regionFilter;
    const cleanTimeframe = timeframe.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Carrier_Targets_${regionTag}_${cleanTimeframe}.${exportFormat}`;

    // Create SheetJS Worksheet & Workbook
    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    // Format column widths for clean presentation
    const colWidths = [
      { wch: 18 }, // Origin
      { wch: 18 }, // Destination
      { wch: 10 }, // Region
      { wch: 14 }, // Weekly Loads
      { wch: 22 }, // Current Target Rate
      { wch: 20 }, // Avg Actual Rate
      { wch: 15 }, // Variance ($)
      { wch: 15 }, // Variance (%)
      { wch: 18 }, // Confidence Rating
      { wch: 20 }, // Adjustment Status
      { wch: 32 }, // Timeframe Period
      { wch: 15 }  // Export Date
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Carrier Targets');

    if (exportFormat === 'xlsx') {
      XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });
    } else {
      XLSX.writeFile(workbook, filename, { bookType: 'csv' });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0B1930]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#D8E1EB]">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#1769FF] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">download</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0F172A]">Export Carrier Targets</h3>
              <p className="text-xs text-[#64748B]">Configure scope, filters, and timeframe for export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#E2E8F0] flex items-center justify-center text-[#64748B] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Region Choice */}
          <div>
            <label className="font-bold text-[10px] text-[#45474d] mb-1.5 block uppercase tracking-wider">
              1. REGION GEOGRAPHY
            </label>
            <div className="grid grid-cols-5 gap-1.5 bg-[#F1F5F9] p-1 rounded-xl border border-[#CBD5E1]">
              {(['USA', 'NW', 'SW', 'NE', 'SE'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegionFilter(r)}
                  className={`py-1.5 font-bold rounded-lg transition-all ${
                    regionFilter === r
                      ? 'bg-[#1769FF] text-white shadow-sm'
                      : 'text-[#475569] hover:bg-white hover:text-[#0F172A]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Market Choice */}
          <div>
            <label className="font-bold text-[10px] text-[#45474d] mb-1.5 block uppercase tracking-wider">
              2. MARKET FILTER
            </label>
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#0F172A] focus:border-[#1769FF] focus:outline-none"
            >
              <option value="all">All Markets in Region</option>
              <option value="los angeles">Los Angeles Market (LA/LB / Inland Empire)</option>
              <option value="oakland">Oakland Market (Bay Area / Central Valley)</option>
              <option value="seattle">Seattle / Tacoma Market</option>
              <option value="chicago">Chicago Metro / Midwest Hub</option>
              <option value="new york">NY / NJ Port Metro</option>
            </select>
          </div>

          {/* Timeframe */}
          <div>
            <label className="font-bold text-[10px] text-[#45474d] mb-1.5 block uppercase tracking-wider">
              3. TIMEFRAME PERIOD
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#0F172A] focus:border-[#1769FF] focus:outline-none"
            >
              <option value="Current Week (Jun 21 - Jun 27, 2026)">Current Week (Jun 21 - Jun 27, 2026)</option>
              <option value="Prior Week (Jun 14 - Jun 20, 2026)">Prior Week (Jun 14 - Jun 20, 2026)</option>
              <option value="Full Q2 2026 Average">Full Q2 2026 Average</option>
              <option value="Year-to-Date (2026 YTD)">Year-to-Date (2026 YTD)</option>
            </select>
          </div>

          {/* Lane Status */}
          <div>
            <label className="font-bold text-[10px] text-[#45474d] mb-1.5 block uppercase tracking-wider">
              4. LANE ADJUSTMENT FILTER
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`flex-1 py-2 px-3 rounded-xl border font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-[#EAF2FF] border-[#1769FF] text-[#1769FF]'
                    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#475569]'
                }`}
              >
                All Lanes ({laneExceptions.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('needs_adjustment')}
                className={`flex-1 py-2 px-3 rounded-xl border font-bold transition-all ${
                  statusFilter === 'needs_adjustment'
                    ? 'bg-[#FFFBEB] border-[#D58A16] text-[#D58A16]'
                    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#475569]'
                }`}
              >
                Needs Adjustment
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('adjusted')}
                className={`flex-1 py-2 px-3 rounded-xl border font-bold transition-all ${
                  statusFilter === 'adjusted'
                    ? 'bg-[#EAFDF5] border-[#178A68] text-[#178A68]'
                    : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#475569]'
                }`}
              >
                Submitted
              </button>
            </div>
          </div>

          {/* Export Format */}
          <div className="p-3 bg-[#EAF2FF]/50 border border-[#1769FF]/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1769FF]">table_chart</span>
              <div>
                <p className="font-extrabold text-xs text-[#0B1930]">Export Format</p>
                <p className="text-[10px] text-[#64748B]">Clean rate benchmarks, equipment & lane IDs excluded</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#CBD5E1]">
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`px-2.5 py-1 rounded text-[10px] font-extrabold ${
                  exportFormat === 'csv' ? 'bg-[#1769FF] text-white' : 'text-[#64748B]'
                }`}
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('xlsx')}
                className={`px-2.5 py-1 rounded text-[10px] font-extrabold ${
                  exportFormat === 'xlsx' ? 'bg-[#1769FF] text-white' : 'text-[#64748B]'
                }`}
              >
                EXCEL
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#CBD5E1] text-[#334155] rounded-xl font-bold hover:bg-[#F1F5F9]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteExport}
              className="px-5 py-2 bg-[#1769FF] text-white rounded-xl font-bold hover:bg-[#1769FF]/90 flex items-center gap-2 shadow-md active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Generate & Download Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
