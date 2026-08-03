import React, { useState, useEffect } from 'react';
import { fetchAdminData } from '../services/api';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { ShieldCheck, Search, Calendar, User, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SafetyLookupPage = ({ setToast }) => {
  const config = useConfig();
  const auth = useAuth();

  const [locale, setLocale] = useState('1');
  const [nome, setNome] = useState('Andrea');
  const [data, setData] = useState('2026-08-02');
  const [offices, setOffices] = useState([]);
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadOffices = async () => {
      setLoadingOffices(true);
      try {
        const res = await fetchAdminData('/overview/offices', {}, config, auth);
        const list = Array.isArray(res) ? res : res?.offices || res?.data || [];
        if (list.length > 0) {
          setOffices(list);
          setLocale(String(list[0].id));
        }
      } catch (err) {
        setOffices([
          { id: 1, nome: 'Milano Club', locale: 'milano' },
          { id: 2, nome: 'Rome Venue', locale: 'roma' },
        ]);
      } finally {
        setLoadingOffices(false);
      }
    };
    loadOffices();
  }, []);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!locale || !nome || !data) {
      setToast({ type: 'error', message: 'Tutti i parametri (Sede, Nome Ospite, Data) sono obbligatori.' });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const baseUrl = (config?.apiBaseUrl || 'http://localhost:8787').replace(/\/$/, '');
      const url = `${baseUrl}/safety/${encodeURIComponent(locale)}/${encodeURIComponent(nome)}/${encodeURIComponent(data)}`;

      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'apikey': 'LOCAL_DEV_KEY',
          ...auth.getAuthHeader(),
        },
      });

      const resData = await res.json().catch(() => null);

      if (res.ok && resData?.success) {
        setResult(resData);
        setToast({ type: 'success', message: `Prenotazione verificata per ${resData.guest || nome}` });
      } else {
        const errorMsg = resData?.message || `Nessuna prenotazione trovata (Stato ${res.status})`;
        setResult(resData || { success: false, message: errorMsg });
        setToast({ type: 'error', message: errorMsg });
      }
    } catch (err) {
      setResult({ success: false, message: err.message });
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Portale Controllo Sicurezza & Ingressi
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Cerca prenotazioni attive per il check-in degli ospiti e la convalida degli ingressi (`/safety/:locale/:nome/:data`).
        </p>
      </div>

      {/* Query Form */}
      <div className="glass-panel p-5 sm:p-6 border-slate-800">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Sede / Locale Attivo
              </label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="glass-input w-full text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                required
                disabled={loadingOffices}
              >
                {offices.length === 0 ? (
                  <option value="1">Milano Club (ID: 1)</option>
                ) : (
                  offices.map((off) => (
                    <option key={off.id} value={off.id} className="bg-slate-900 text-slate-100">
                      {off.nome || off.locale || `Sede #${off.id}`} (ID: {off.id})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Nome Ospite
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="es. Andrea Bacciolo"
                className="glass-input w-full text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Data (AAAA-MM-GG)
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="glass-input w-full text-xs"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5 text-xs font-bold shadow-lg shadow-emerald-600/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Verifica DB Prenotazioni...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> Verifica Prenotazione
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Safety Query Result */}
      {result && (
        <div className={`glass-panel p-5 sm:p-6 border ${result.success ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-rose-500/40 bg-rose-950/20'} space-y-4 animate-fade-in`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              )}
              {result.success ? 'Accesso Consentito' : 'Accesso Negato'}
            </h3>
            <Badge variant={result.success ? 'emerald' : 'rose'}>
              {result.success ? 'Prenotazione Valida' : 'Nessuna Prenotazione Trovata'}
            </Badge>
          </div>

          {result.success ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Nome Ospite</div>
                <div className="text-sm font-bold text-slate-100 mt-0.5">{result.guest || nome}</div>
              </div>
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Token Biglietto</div>
                <div className="text-sm font-mono font-bold text-cyan-300 mt-0.5">{result.ticket}</div>
              </div>
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Data Evento</div>
                <div className="text-xs font-mono text-slate-300 mt-1">{result.date || data}</div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 rounded-xl text-xs text-rose-200">
              {result.message}
            </div>
          )}

          <div className="pt-2">
            <details className="text-xs text-slate-400">
              <summary className="cursor-pointer font-mono hover:text-slate-200 transition">Visualizza Payload Raw</summary>
              <pre className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};
