import React from 'react';

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
    <div className="fixed inset-0 z-50 bg-[#0B1930]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#D8E1EB] overflow-hidden">
        <div className="px-6 py-4 bg-[#0B1930] text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1769FF]">description</span>
            <h3 className="font-bold text-sm uppercase tracking-wider">Operational Pricing Reports</h3>
          </div>
          <button onClick={onClose} className="text-[#7784a0] hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-3 text-xs">
          {reports.map((r, i) => (
            <div key={i} className="p-3 bg-[#F4F7FA] border border-[#D8E1EB] rounded-xl flex justify-between items-center hover:border-[#1769FF] transition-colors">
              <div>
                <div className="font-bold text-[#0B1930]">{r.title}</div>
                <div className="text-[10px] text-[#45474d] mt-0.5">{r.date} • {r.format}</div>
              </div>
              <button
                onClick={() => alert(`Downloading ${r.title}`)}
                className="px-2.5 py-1 bg-white border border-[#D8E1EB] text-[#1769FF] font-bold text-[10px] rounded hover:bg-[#EAF2FF]"
              >
                Download
              </button>
            </div>
          ))}

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2 bg-[#1769FF] text-white font-bold rounded-lg hover:bg-[#1769FF]/90"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
