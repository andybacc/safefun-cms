import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { LogOut, Shield, RefreshCw, Server } from 'lucide-react';

export const Navbar = ({ onRefresh, isRefreshing }) => {
  const { credentials, logout } = useAuth();
  const { apiBaseUrl, setApiBaseUrl, SERVER_PRESETS = [] } = useConfig();

  const handleServerChange = (e) => {
    const newUrl = e.target.value;
    setApiBaseUrl(newUrl);
    if (onRefresh) {
      setTimeout(() => onRefresh(), 100);
    }
  };

  const isLocal = apiBaseUrl.includes('localhost') || apiBaseUrl.includes('127.0.0.1');

  return (
    <header className="h-16 sm:h-20 border-b border-slate-800/80 bg-[#0c121e]/80 backdrop-blur-md px-6 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Environment / Server Switcher */}
        <div className="flex items-center gap-2 text-xs bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 font-mono shadow-sm">
          <Server className={`w-3.5 h-3.5 ${isLocal ? 'text-amber-400' : 'text-emerald-400'}`} />
          <span className="text-slate-400 font-sans font-medium text-[11px] hidden sm:inline">Server:</span>
          <select
            value={apiBaseUrl}
            onChange={handleServerChange}
            className="bg-transparent text-cyan-300 font-semibold text-xs focus:outline-none cursor-pointer pr-1"
          >
            {SERVER_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.url} className="bg-slate-900 text-slate-200">
                {preset.name} ({preset.label})
              </option>
            ))}
            {!SERVER_PRESETS.some((p) => p.url === apiBaseUrl) && (
              <option value={apiBaseUrl} className="bg-slate-900 text-slate-200">
                Personalizzato ({apiBaseUrl})
              </option>
            )}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
            title="Aggiorna Dati"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        )}

        {/* User Session Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200">
                {credentials?.username || 'Admin'}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">Autenticato</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition border border-transparent hover:border-rose-900/40"
            title="Disconnetti"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
