import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';

export const OverviewHeader = ({ onRefresh, loading }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-indigo-400" />
          Panoramica del Sistema & Metriche
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Stato in tempo reale di eventi, registrazioni e piani di abbonamento aziendali attivi.
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="btn-secondary text-xs"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Aggiorna Panoramica
      </button>
    </div>
  );
};
