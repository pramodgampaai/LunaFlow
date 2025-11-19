import React from 'react';
import { CycleEntry } from '../types';
import { ChevronRight, Edit, Trash2, Plus } from './ui/Icons';
import { sortEntries, getDurationInDays, formatDate } from '../utils/dateUtils';

interface HistoryViewProps {
  entries: CycleEntry[];
  onLogPeriod: () => void;
  onEditEntry: (entry: CycleEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ entries, onLogPeriod, onEditEntry, onDeleteEntry }) => {
  const sortedEntries = sortEntries(entries);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-slate-900">History</h2>
        <button 
            onClick={onLogPeriod}
            className="bg-rose-100 text-rose-600 hover:bg-rose-200 p-2 rounded-full transition-colors"
            aria-label="Add Entry"
        >
            <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {sortedEntries.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm mb-4">No entries logged yet.</p>
                <button 
                    onClick={onLogPeriod}
                    className="text-rose-500 font-medium text-sm hover:underline"
                >
                    Log your first period
                </button>
            </div>
        )}
        
        {sortedEntries.map((entry) => {
            const days = getDurationInDays(entry.startDate, entry.endDate);
            const isOngoing = !entry.endDate;
            return (
                <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-sm border border-rose-50 flex justify-between items-start group relative overflow-hidden">
                    {isOngoing && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-400" />}
                    <div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                            {formatDate(entry.startDate)} 
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                            {isOngoing ? <span className="text-rose-500 text-sm">Ongoing</span> : formatDate(entry.endDate!)}
                        </div>
                        
                        <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-2 items-center">
                            <span className={`${isOngoing ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'} px-2 py-0.5 rounded-full font-medium`}>
                                {days} days {isOngoing ? 'so far' : ''}
                            </span>
                            
                            <div className="h-3 w-[1px] bg-slate-200 mx-1"></div>

                            {/* Mini visualization of intensity */}
                            <div className="flex gap-0.5 items-center">
                                {entry.days.slice(0, 7).map((d, i) => (
                                    <div key={i} 
                                        className={`w-1.5 h-1.5 rounded-full 
                                            ${d.flowIntensity === 'Heavy' ? 'bg-rose-600' : 
                                                d.flowIntensity === 'Medium' ? 'bg-rose-400' : 
                                                'bg-rose-200'}`} 
                                    />
                                ))}
                                {entry.days.length > 7 && <span className="text-[10px] text-slate-400">+</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => onEditEntry(entry)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            aria-label="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => onDeleteEntry(entry.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default HistoryView;