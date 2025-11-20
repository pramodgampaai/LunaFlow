import React from 'react';
import { Download, Upload } from './ui/Icons';

interface SettingsViewProps {
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  onExport,
  onImport
}) => {
  return (
    <div className="space-y-8 pb-20">
      <h2 className="text-2xl font-bold text-slate-900">Settings</h2>

      {/* Data Management Section */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-rose-50">
         <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Download className="w-4 h-4 text-rose-500" /> Data Management
         </h3>
         <div className="flex flex-col gap-3">
            <button 
                onClick={onExport}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-xl text-sm font-medium flex justify-between px-4 items-center hover:bg-slate-100 transition-colors"
            >
                <span>Export Data (JSON)</span>
                <Download className="w-4 h-4 text-slate-400" />
            </button>
            <label className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-xl text-sm font-medium flex justify-between px-4 items-center hover:bg-slate-100 transition-colors cursor-pointer">
                <span>Import Data (JSON)</span>
                <Upload className="w-4 h-4 text-slate-400" />
                <input type="file" accept=".json" onChange={onImport} className="hidden" />
            </label>
         </div>
      </section>
      
      <div className="text-center text-xs text-slate-300 mt-8">
        Period Companion v1.0
      </div>
    </div>
  );
};

export default SettingsView;