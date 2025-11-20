import React from 'react';
import { UserProfile, CycleStats, CycleEntry } from '../types';
import { Activity, Calendar, Plus, Edit, Droplets, Users } from './ui/Icons';
import { getDurationInDays } from '../utils/dateUtils';

interface HomeViewProps {
  currentUser: UserProfile;
  stats: CycleStats | null;
  onLogPeriod: () => void;
  onEditEntry: (entry: CycleEntry) => void;
  onManageUsers: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ currentUser, stats, onLogPeriod, onEditEntry, onManageUsers }) => {
  const ongoingEntry = currentUser.entries.find(e => !e.endDate);

  // Calculate current cycle day if not ongoing
  let cycleDay = 0;
  if (!ongoingEntry && currentUser.entries.length > 0) {
    const latestEntry = [...currentUser.entries].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
    if (latestEntry) {
        // Calculate days since the start of the last period (Day 1 of cycle)
        cycleDay = getDurationInDays(latestEntry.startDate);
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header / Status Card */}
      <section>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Hi, {currentUser.name}</h2>
            <button 
                onClick={onManageUsers}
                className="bg-white p-2.5 rounded-full shadow-sm border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors"
                aria-label="Manage Accounts"
            >
                <Users className="w-5 h-5" />
            </button>
        </div>
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Droplets className="w-32 h-32 text-rose-500" />
            </div>
            
            <div className="relative z-10">
                {ongoingEntry ? (
                    <div className="text-center py-4">
                        <div className="inline-block bg-rose-100 text-rose-600 px-4 py-1.5 rounded-full text-sm font-bold mb-4 animate-pulse">
                            Period Day {getDurationInDays(ongoingEntry.startDate)}
                        </div>
                        <p className="text-slate-500 text-sm mb-6">Don't forget to log your flow today.</p>
                        <button 
                            onClick={() => onEditEntry(ongoingEntry)}
                            className="bg-rose-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all flex items-center gap-2 mx-auto"
                        >
                            <Edit className="w-4 h-4" /> Edit Period
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-4">
                         {cycleDay > 0 ? (
                             <div className="mb-2 text-slate-400 font-medium uppercase tracking-wider text-xs">Current Cycle</div>
                         ) : null}
                         <div className="text-4xl font-bold text-slate-800 mb-6">
                            {cycleDay > 0 ? `Day ${cycleDay}` : "No Data"}
                         </div>
                         <button 
                            onClick={onLogPeriod}
                            className="bg-slate-900 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto"
                        >
                            <Plus className="w-4 h-4" /> Log Period
                        </button>
                    </div>
                )}
            </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100">
            <div className="flex items-center gap-2 mb-2 text-rose-500">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Last Duration</span>
            </div>
            <div className="text-3xl font-bold text-slate-800">
                {stats?.lastDuration || 0} <span className="text-base font-medium text-slate-400">days</span>
            </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100">
                <div className="flex items-center gap-2 mb-2 text-purple-500">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Avg Cycle</span>
            </div>
            <div className="text-3xl font-bold text-slate-800">
                {stats?.averageCycleLength || 0} <span className="text-base font-medium text-slate-400">days</span>
            </div>
        </div>
      </section>

      {/* Insight Card */}
      {stats && stats.lastCycleLength > 0 && (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
                <h3 className="font-semibold text-slate-900 mb-3">Cycle Insights</h3>
                <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-500 text-sm">Variation from last month</span>
                    <span className={`font-medium ${stats.cycleVariation > 0 ? 'text-orange-500' : stats.cycleVariation < 0 ? 'text-blue-500' : 'text-green-500'}`}>
                        {stats.cycleVariation > 0 ? `+${stats.cycleVariation} days` : stats.cycleVariation === 0 ? 'No change' : `${stats.cycleVariation} days`}
                    </span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 text-sm">Regularity Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stats.isRegular ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {stats.isRegular ? 'Regular' : 'Irregular'}
                    </span>
                </div>
                </div>
        </section>
      )}
    </div>
  );
};

export default HomeView;