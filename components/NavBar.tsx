import React from 'react';
import { Home, Calendar, Settings } from './ui/Icons';

interface NavBarProps {
  currentView: 'home' | 'history' | 'settings';
  onChangeView: (view: 'home' | 'history' | 'settings') => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, onChangeView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 pb-safe">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => onChangeView('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentView === 'home' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => onChangeView('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentView === 'history' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-medium">History</span>
        </button>

        <button
          onClick={() => onChangeView('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentView === 'settings' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default NavBar;