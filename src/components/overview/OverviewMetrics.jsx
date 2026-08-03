import React from 'react';
import { 
  Calendar, 
  Briefcase, 
  Users, 
  Activity, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';

export const OverviewMetrics = ({ eventsCount = 0, plansCount = 0, totalParticipants = 0 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="glass-panel p-5 glass-panel-hover">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Eventi Attivi</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white">
          {eventsCount}
        </div>
        <div className="text-[11px] text-indigo-400 mt-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Monitoraggio live
        </div>
      </div>

      <div className="glass-panel p-5 glass-panel-hover">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Piani Aziendali</span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white">
          {plansCount}
        </div>
        <div className="text-[11px] text-cyan-400 mt-2 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Abbonamenti attivi
        </div>
      </div>

      <div className="glass-panel p-5 glass-panel-hover">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Partecipanti Totali</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white">
          {totalParticipants}
        </div>
        <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Registrazioni Eventi
        </div>
      </div>

      <div className="glass-panel p-5 glass-panel-hover">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Stato Backend</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Operativo
        </div>
        <div className="text-[11px] text-slate-400 mt-2 font-mono">
          Hono / Wrangler Dev
        </div>
      </div>
    </div>
  );
};
