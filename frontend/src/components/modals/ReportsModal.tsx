import React from 'react';
import { FileText, X, Download } from 'lucide-react';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const reports = [
    { title: 'Weekly Carrier Target Compliance Report', date: 'Generated 2 hours ago', format: 'PDF / CSV' },
    { title: 'Northwest Region Lane Exception Summary', date: 'Generated 1 day ago', format: 'XLSX' },
    { title: 'Customer Fuel Surcharge Audit Q2 2026', date: 'Generated Jul 20, 2026', format: 'PDF' },
    { title: 'Carrier Reliability & Performance Ranking', date: 'Generated Jul 15, 2026', format: 'CSV' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Operational Pricing Reports</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          {reports.map((r, i) => (
            <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center hover:border-blue-400 transition-colors">
              <div>
                <div className="font-bold text-slate-900">{r.title}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{r.date} • {r.format}</div>
              </div>
              <button
                onClick={() => alert(`Downloading ${r.title}`)}
                className="px-2.5 py-1 bg-white border border-slate-300 text-blue-600 font-bold text-[10px] rounded-md hover:bg-blue-50 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>
          ))}

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
