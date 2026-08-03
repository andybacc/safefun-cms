import React from 'react';
import { 
  LayoutDashboard, 
  UserX, 
  CreditCard, 
  Mail, 
  ShieldCheck, 
  Settings, 
  Sparkles,
  Database
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'overview', label: 'Panoramica', icon: LayoutDashboard },
    { id: 'inactive', label: 'Utenti Inattivi', icon: UserX },
    { id: 'revenuecat', label: 'Hub RevenueCat', icon: CreditCard },
    { id: 'resend', label: 'Email Resend', icon: Mail },
    { id: 'safety', label: 'Controllo Sicurezza', icon: ShieldCheck },
    { id: 'settings', label: 'Impostazioni', icon: Settings },
  ];

  return (
    <aside className="w-68 border-r border-slate-800/80 bg-[#0c121e]/90 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              SafeFun <span className="text-indigo-400 font-semibold text-[10px] border border-indigo-500/30 px-1.5 py-0.5 rounded ml-1">CMS</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Dashboard Operativa & API</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Operazioni & Admin
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 m-4 glass-panel border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center gap-2 mb-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-200 text-xs">SafeFun API v3</span>
        </div>
        <div className="text-[11px] text-slate-400 leading-normal">
          Portale Admin Locale &bull; Cloudflare Workers
        </div>
      </div>
    </aside>
  );
};
