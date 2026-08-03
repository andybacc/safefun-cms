import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { Settings, Server, Key, Save, RefreshCw } from 'lucide-react';

export const SettingsPage = ({ setToast }) => {
  const config = useConfig();
  const auth = useAuth();

  const [apiUrl, setApiUrl] = useState(config.apiBaseUrl);
  const [rcKey, setRcKey] = useState(config.revenueCatKey);
  const [resendKey, setResendKey] = useState(config.resendKey);
  const [testing, setTesting] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    config.setApiBaseUrl(apiUrl.trim());
    config.setRevenueCatKey(rcKey.trim());
    config.setResendKey(resendKey.trim());

    setToast({ type: 'success', message: 'Impostazioni salvate nello storage locale!' });
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const baseUrl = apiUrl.trim().replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/admin/inactive-users/preview`, {
        headers: {
          ...auth.getAuthHeader(),
        },
      });

      if (res.ok) {
        setToast({ type: 'success', message: `Connessione backend riuscita (${res.status} OK)` });
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      setToast({ type: 'error', message: `Connessione fallita: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-indigo-400" />
          Impostazioni Credenziali CMS & API
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Configura endpoint API, porte di sviluppo locale e chiavi segrete per le integrazioni esterne.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Backend Endpoint Settings */}
        <div className="glass-panel p-5 sm:p-6 border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" /> URL di Base API SafeFun
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Indirizzo Host API
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8787"
                className="glass-input flex-1 font-mono text-xs"
                required
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="btn-secondary py-2 px-3 text-xs shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} /> Testa API
              </button>
            </div>

            {/* Environment Presets Selection */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-800/60">
              <span className="text-[11px] text-slate-400 font-medium">Server Preimpostati:</span>
              {(config.SERVER_PRESETS || []).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setApiUrl(preset.url)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition border ${
                    apiUrl === preset.url
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {preset.name} ({preset.label})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Third Party API Keys */}
        <div className="glass-panel p-5 sm:p-6 border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" /> Integrazioni Terze Parti & Chiavi Segrete
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chiave API Segreta RevenueCat
              </label>
              <input
                type="password"
                value={rcKey}
                onChange={(e) => setRcKey(e.target.value)}
                placeholder="goog_... o appl_..."
                className="glass-input w-full font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">Utilizzata per interrogare gli abbonamenti dei clienti tramite la REST API di RevenueCat.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chiave API Resend
              </label>
              <input
                type="password"
                value={resendKey}
                onChange={(e) => setResendKey(e.target.value)}
                placeholder="re_123456789..."
                className="glass-input w-full font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">Utilizzata per inviare email operative tramite Resend.</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary text-xs font-bold py-2.5 px-6 shadow-lg shadow-indigo-600/30"
        >
          <Save className="w-4 h-4" /> Salva Impostazioni Configurazione
        </button>
      </form>
    </div>
  );
};
