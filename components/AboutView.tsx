import React from 'react';
import { Droplets, Shield, Database, Sparkles } from 'lucide-react';

const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Hero Section */}
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 text-rose-500 rounded-3xl mb-4 shadow-inner">
          <Droplets className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Period Companion</h2>
        <p className="text-slate-500 mt-1">Your private cycle tracker</p>
      </div>

      {/* Features Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-5 h-5 text-rose-500" />
          <h3 className="text-lg font-bold text-slate-800">Key Features</h3>
        </div>
        <div className="grid gap-3">
          {[
            { title: 'Easy Tracking', desc: 'Log your period start and end dates with just a few taps.' },
            { title: 'Flow Intensity', desc: 'Track daily flow levels from spotting to heavy flow.' },
            { title: 'Multi-User Support', desc: 'Create separate profiles for different family members.' },
            { title: 'Cycle Insights', desc: 'View statistics on cycle length, duration, and regularity.' },
            { title: 'Data Portability', desc: 'Export your data for backup or import it onto a new device.' }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
              <h4 className="font-semibold text-slate-800 text-sm">{feature.title}</h4>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Shield className="w-5 h-5 text-rose-500" />
          <h3 className="text-lg font-bold text-slate-800">Privacy First</h3>
        </div>
        <div className="bg-rose-500 text-white p-5 rounded-3xl shadow-lg shadow-rose-200">
          <p className="text-sm leading-relaxed opacity-90">
            We believe your health data is yours alone. Period Companion is designed with a 
            <strong> privacy-first architecture</strong>.
          </p>
          <ul className="mt-4 space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white mt-1 shrink-0" />
              <span>No data is ever sent to a server or cloud.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white mt-1 shrink-0" />
              <span>No tracking pixels or third-party analytics.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white mt-1 shrink-0" />
              <span>No account creation or email required.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Storage Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Database className="w-5 h-5 text-rose-500" />
          <h3 className="text-lg font-bold text-slate-800">Local Storage</h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm">
          <p className="text-sm text-slate-600 leading-relaxed">
            Your data is stored exclusively in your browser's <strong>Local Storage</strong>. 
            This means if you clear your browser data or switch devices, your information 
            will be lost unless you use the <strong>Export</strong> feature in Settings to 
            create a backup.
          </p>
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Pro Tip</p>
            <p className="text-xs text-slate-500">
              Regularly export your data and save it to a secure location to ensure you never lose your history.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center pt-4 opacity-40">
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
          Period Companion • Version 1.0.0
        </p>
      </div>
    </div>
  );
};

export default AboutView;
