import React, { useState, useEffect, useMemo } from 'react';
import { 
  Droplets, 
  X,
  Users,
  Check,
  UserPlus
} from './components/ui/Icons';
import { AppData, CycleEntry, UserProfile, DEFAULT_THEME_COLOR, DailyLog, FlowIntensity } from './types';
import { formatDate, formatDayOfWeek, getDatesInRange, calculateStats } from './utils/dateUtils';

// Views
import HomeView from './components/HomeView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import NavBar from './components/NavBar';

const LOCAL_STORAGE_KEY = 'lunaflow_data_v1';

const initialData: AppData = {
  users: [],
  activeUserId: null,
  version: 1,
};

// Helper to migrate old data format to new format
const migrateData = (data: any): AppData => {
    if (!data.users) return initialData;
    
    const updatedUsers = data.users.map((user: any) => ({
        ...user,
        entries: user.entries.map((entry: any) => {
            // If it's already new format, return it
            if (entry.days && Array.isArray(entry.days)) return entry;

            // Migrate old format: create days array from startDate/endDate/flowIntensity
            const days: DailyLog[] = [];
            if (entry.startDate && entry.endDate && entry.flowIntensity) {
                const dates = getDatesInRange(entry.startDate, entry.endDate);
                dates.forEach(d => {
                    days.push({
                        date: d,
                        flowIntensity: entry.flowIntensity as FlowIntensity || 'Medium'
                    });
                });
            }
            return {
                ...entry,
                days: days
            };
        })
    }));

    return {
        ...data,
        users: updatedUsers
    };
};

type ViewState = 'home' | 'history' | 'settings';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(initialData);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  
  // User Mgmt State
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  // Entry Form State
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [entryStartDate, setEntryStartDate] = useState('');
  const [entryEndDate, setEntryEndDate] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);
  const [entryDays, setEntryDays] = useState<Record<string, FlowIntensity>>({});

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migrated = migrateData(parsed);
        setData(migrated);
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Save Data
  useEffect(() => {
    if (data.users.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const currentUser = data.users.find(u => u.id === data.activeUserId);
  const stats = currentUser ? calculateStats(currentUser.entries) : null;

  // --- Form Logic ---
  
  const formDates = useMemo(() => {
    return getDatesInRange(entryStartDate, entryEndDate);
  }, [entryStartDate, entryEndDate]);

  useEffect(() => {
    if (formDates.length > 0) {
        setEntryDays(prev => {
            const next = { ...prev };
            let hasChanges = false;
            formDates.forEach(date => {
                if (!next[date]) {
                    next[date] = 'Medium';
                    hasChanges = true;
                }
            });
            return hasChanges ? next : prev;
        });
    }
  }, [formDates]);


  // --- Actions ---

  const handleAddUser = (name: string) => {
    if (!name.trim()) return;
    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      name: name,
      themeColor: DEFAULT_THEME_COLOR,
      entries: []
    };
    setData(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      activeUserId: newUser.id
    }));
    setNewUserName('');
  };

  const handleSwitchUser = (userId: string) => {
    setData(prev => ({ ...prev, activeUserId: userId }));
    setIsUserMgmtOpen(false);
  };

  const resetEntryForm = () => {
      setEntryStartDate('');
      setEntryEndDate('');
      setEntryDays({});
      setEditingEntryId(null);
      setIsEntryModalOpen(false);
      setDateError(null);
  };

  const handleEditEntry = (entry: CycleEntry) => {
      setEntryStartDate(entry.startDate);
      setEntryEndDate(entry.endDate || '');
      
      const intensityMap: Record<string, FlowIntensity> = {};
      entry.days.forEach(d => {
          intensityMap[d.date] = d.flowIntensity;
      });
      setEntryDays(intensityMap);
      
      setEditingEntryId(entry.id);
      setIsEntryModalOpen(true);
      setDateError(null);
  };

  const handleSaveEntry = () => {
    if (!entryStartDate || !data.activeUserId) return;
    
    // Validate date range
    if (entryEndDate && entryEndDate < entryStartDate) {
        setDateError("End date cannot be before start date.");
        return;
    }

    const daysList: DailyLog[] = formDates.map(date => ({
        date,
        flowIntensity: entryDays[date] || 'Medium'
    }));

    const entryData: CycleEntry = {
      id: editingEntryId || crypto.randomUUID(),
      startDate: entryStartDate,
      endDate: entryEndDate || undefined,
      days: daysList
    };

    setData(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === prev.activeUserId) {
          if (editingEntryId) {
              return {
                  ...u,
                  entries: u.entries.map(e => e.id === editingEntryId ? { ...entryData, notes: e.notes } : e)
              };
          } else {
              return { ...u, entries: [...u.entries, entryData] };
          }
        }
        return u;
      })
    }));

    resetEntryForm();
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === prev.activeUserId) {
          return { ...u, entries: u.entries.filter(e => e.id !== entryId) };
        }
        return u;
      })
    }));
  };

  const updateDayIntensity = (date: string, intensity: FlowIntensity) => {
    setEntryDays(prev => ({
        ...prev,
        [date]: intensity
    }));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lunaflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        const migrated = migrateData(importedData);
        if (migrated.users && Array.isArray(migrated.users)) {
            setData(migrated);
            alert("Data imported successfully!");
        } else {
            alert("Invalid file format.");
        }
      } catch (err) {
        alert("Failed to parse file.");
      }
    };
    reader.readAsText(file);
  };

  const [tempName, setTempName] = useState('');

  return (
    <div className="min-h-screen bg-rose-50 text-slate-800 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-rose-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-center relative">
            <div className="flex items-center gap-2">
                <div className="bg-rose-500 p-1.5 rounded-full">
                    <Droplets className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold text-rose-900 tracking-tight">LunaFlow</h1>
            </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        
        {currentUser ? (
            <>
                {currentView === 'home' && (
                    <HomeView 
                        currentUser={currentUser}
                        stats={stats}
                        onLogPeriod={() => {
                            resetEntryForm();
                            setIsEntryModalOpen(true);
                        }}
                        onEditEntry={handleEditEntry}
                        onManageUsers={() => setIsUserMgmtOpen(true)}
                    />
                )}

                {currentView === 'history' && (
                    <HistoryView 
                        entries={currentUser.entries}
                        onLogPeriod={() => {
                            resetEntryForm();
                            setIsEntryModalOpen(true);
                        }}
                        onEditEntry={handleEditEntry}
                        onDeleteEntry={handleDeleteEntry}
                    />
                )}

                {currentView === 'settings' && (
                    <SettingsView 
                        onExport={handleExport}
                        onImport={handleImport}
                    />
                )}
                
                <NavBar currentView={currentView} onChangeView={setCurrentView} />
            </>
        ) : (
            // Onboarding Screen
            <div className="text-center py-20">
                <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Welcome to LunaFlow</h2>
                <p className="text-slate-500 mt-2 mb-6">Create your profile to start tracking.</p>
                
                <div className="max-w-xs mx-auto">
                     <input 
                        type="text" 
                        placeholder="Your Name"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="w-full mb-4 bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                    <button 
                        onClick={() => handleAddUser(tempName)}
                        disabled={!tempName.trim()}
                        className="w-full bg-rose-500 disabled:opacity-50 text-white py-3 rounded-full font-medium shadow-xl shadow-rose-200"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        )}
      </main>

      {/* User Management Modal */}
      {isUserMgmtOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Accounts</h3>
                    <button onClick={() => setIsUserMgmtOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                    {data.users.map(user => (
                        <button 
                            key={user.id}
                            onClick={() => handleSwitchUser(user.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border ${
                                user.id === data.activeUserId 
                                ? 'bg-rose-50 border-rose-200 ring-1 ring-rose-200' 
                                : 'bg-white border-slate-100 hover:bg-slate-50'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                                user.id === data.activeUserId ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left flex-1">
                                <div className={`font-medium ${user.id === data.activeUserId ? 'text-rose-900' : 'text-slate-700'}`}>
                                    {user.name}
                                </div>
                                {user.id === data.activeUserId && <div className="text-xs text-rose-500 font-medium">Active</div>}
                            </div>
                            {user.id === data.activeUserId && <Check className="w-5 h-5 text-rose-500" />}
                        </button>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Add Profile</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="Enter name"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
                        />
                        <button 
                            onClick={() => handleAddUser(newUserName)}
                            disabled={!newUserName.trim()}
                            className="bg-slate-900 disabled:opacity-50 text-white p-3 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <UserPlus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Entry Modal (Global) */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">{editingEntryId ? 'Edit Entry' : 'Log Period'}</h3>
                    <button onClick={resetEntryForm} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Started <span className="text-rose-500">*</span></label>
                            <input 
                                type="date" 
                                value={entryStartDate}
                                onChange={(e) => {
                                    setEntryStartDate(e.target.value);
                                    if (entryEndDate && e.target.value && e.target.value > entryEndDate) {
                                        setDateError("Start date cannot be after end date");
                                    } else {
                                        setDateError(null);
                                    }
                                }}
                                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-500/20 text-sm ${
                                    dateError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-rose-500'
                                }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ended <span className="text-slate-400 text-xs font-normal">(Optional)</span></label>
                            <input 
                                type="date" 
                                value={entryEndDate}
                                min={entryStartDate}
                                onChange={(e) => {
                                    setEntryEndDate(e.target.value);
                                    if (entryStartDate && e.target.value && e.target.value < entryStartDate) {
                                        setDateError("End date cannot be before start date");
                                    } else {
                                        setDateError(null);
                                    }
                                }}
                                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-500/20 text-sm ${
                                    dateError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-rose-500'
                                }`}
                            />
                        </div>
                        
                        {dateError && (
                            <div className="col-span-2 text-red-500 text-xs font-medium bg-red-50 p-2 rounded-lg flex items-center gap-1">
                                <span className="block w-1 h-1 bg-red-500 rounded-full" />
                                {dateError}
                            </div>
                        )}
                    </div>

                    {entryStartDate && (
                        <div className="mt-6">
                            <h4 className="text-sm font-bold text-slate-900 mb-3 sticky top-0 bg-white py-2 border-b border-slate-50">Daily Details</h4>
                            <div className="space-y-3">
                                {formDates.map((date, index) => (
                                    <div key={date} className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-slate-700">
                                                Day {index + 1} <span className="text-slate-400 font-normal text-xs ml-1">({formatDate(date)}, {formatDayOfWeek(date)})</span>
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            {(['Light', 'Medium', 'Heavy', 'Spotting'] as const).map((intensity) => (
                                                <button
                                                    key={intensity}
                                                    onClick={() => updateDayIntensity(date, intensity)}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all 
                                                        ${entryDays[date] === intensity 
                                                            ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200' 
                                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-white hover:border-rose-300'
                                                        }`}
                                                >
                                                    {intensity}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {formDates.length === 0 && !dateError && (
                                    <p className="text-sm text-slate-400 text-center py-4">Select dates to see daily options.</p>
                                )}
                                {!entryEndDate && entryStartDate && formDates.length > 0 && (
                                    <p className="text-xs text-slate-400 text-center italic mt-2">
                                        Showing days up to today for ongoing period.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="pt-4 mt-4 border-t border-slate-100">
                    <button 
                        onClick={handleSaveEntry}
                        disabled={!entryStartDate}
                        className="w-full bg-rose-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors"
                    >
                        {editingEntryId ? 'Update Entry' : 'Save Entry'}
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default App;