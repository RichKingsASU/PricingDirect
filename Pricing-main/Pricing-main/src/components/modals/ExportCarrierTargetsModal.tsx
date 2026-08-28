import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, X, Table } from 'lucide-react';
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
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Export Carrier Targets</h3>
              <p className="text-[11px] text-slate-500">Configure scope, filters, and timeframe for export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3.5 text-xs">
          {/* Region Choice */}
          <div>
            <label className="font-bold text-[10px] text-slate-600 mb-1 block uppercase tracking-wider">
              1. REGION GEOGRAPHY
            </label>
            <div className="grid grid-cols-5 gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {(['USA', 'NW', 'SW', 'NE', 'SE'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegionFilter(r)}
                  className={`py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    regionFilter === r
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Market Choice */}
          <div>
            <label className="font-bold text-[10px] text-slate-600 mb-1 block uppercase tracking-wider">
              2. MARKET FILTER
            </label>
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            <label className="font-bold text-[10px] text-slate-600 mb-1 block uppercase tracking-wider">
              3. TIMEFRAME PERIOD
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Current Week (Jun 21 - Jun 27, 2026)">Current Week (Jun 21 - Jun 27, 2026)</option>
              <option value="Prior Week (Jun 14 - Jun 20, 2026)">Prior Week (Jun 14 - Jun 20, 2026)</option>
              <option value="Full Q2 2026 Average">Full Q2 2026 Average</option>
              <option value="Year-to-Date (2026 YTD)">Year-to-Date (2026 YTD)</option>
            </select>
          </div>

          {/* Lane Status */}
          <div>
            <label className="font-bold text-[10px] text-slate-600 mb-1 block uppercase tracking-wider">
              4. LANE ADJUSTMENT FILTER
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-slate-50 border-slate-300 text-slate-600'
                }`}
              >
                All Lanes ({laneExceptions.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('needs_adjustment')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                  statusFilter === 'needs_adjustment'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-300 text-slate-600'
                }`}
              >
                Needs Adjustment
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('adjusted')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                  statusFilter === 'adjusted'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-slate-50 border-slate-300 text-slate-600'
                }`}
              >
                Submitted
              </button>
            </div>
          </div>

          {/* Export Format */}
          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-bold text-xs text-slate-900">Export Format</p>
                <p className="text-[10px] text-slate-500">Clean rate benchmarks, equipment & lane IDs excluded</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  exportFormat === 'csv' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('xlsx')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  exportFormat === 'xlsx' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                EXCEL
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteExport}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generate & Download Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
