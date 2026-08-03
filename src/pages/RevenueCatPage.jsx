import React, { useState } from 'react';
import { fetchRevenueCatSubscriber } from '../services/api';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Key, 
  Calendar, 
  DollarSign, 
  Code,
  AlertCircle
} from 'lucide-react';

export const RevenueCatPage = ({ setToast }) => {
  const config = useConfig();
  const auth = useAuth();
  const [appUserId, setAppUserId] = useState('');
  const [subscriberData, setSubscriberData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!appUserId.trim()) {
      setToast({ type: 'error', message: 'Inserisci un App User ID' });
      return;
    }

    setLoading(true);
    setSubscriberData(null);
    try {
      const data = await fetchRevenueCatSubscriber(appUserId.trim(), config, auth);
      setSubscriberData(data.subscriber || data);
      setToast({ type: 'success', message: `Abbonato ${appUserId} recuperato tramite backend.` });
    } catch (err) {
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
          <CreditCard className="w-5 h-5 text-indigo-400" />
          Hub Abbonamenti RevenueCat
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Ispeziona i diritti degli utenti, gli abbonamenti attivi e la cronologia degli acquisti direttamente da RevenueCat.
        </p>
      </div>

      {/* API Key Missing Warning */}
      {!config?.revenueCatKey && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/40 rounded-xl text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="w-4 h-4 text-amber-400" />
            <span>La chiave API segreta di RevenueCat non è configurata nello storage locale.</span>
          </div>
          <span className="font-semibold text-amber-400 underline cursor-pointer">Configura nelle Impostazioni</span>
        </div>
      )}

      {/* Search Input Card */}
      <div className="glass-panel p-5 sm:p-6 border-slate-800">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={appUserId}
              onChange={(e) => setAppUserId(e.target.value)}
              placeholder="Inserisci App User ID o GUID cliente (es. user_10294)..."
              className="glass-input w-full pl-11 h-11 text-xs sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full md:w-auto shrink-0 text-sm font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Interrogazione API in corso...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" /> Cerca Abbonato
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Subscriber Info Results */}
      {subscriberData && (
        <div className="space-y-6">
          {/* Entitlements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5">
              <div className="text-slate-400 text-xs font-semibold uppercase mb-1">Primo Accesso</div>
              <div className="text-sm font-mono text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                {subscriberData.first_seen ? new Date(subscriberData.first_seen).toLocaleString() : 'N/A'}
              </div>
            </div>

            <div className="glass-panel p-5">
              <div className="text-slate-400 text-xs font-semibold uppercase mb-1">Diritti Attivi</div>
              <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                {Object.keys(subscriberData.entitlements || {}).length} Diritti
              </div>
            </div>

            <div className="glass-panel p-5">
              <div className="text-slate-400 text-xs font-semibold uppercase mb-1">Abbonamenti Attivi</div>
              <div className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                {Object.keys(subscriberData.subscriptions || {}).length} Abbonamenti Attivi
              </div>
            </div>
          </div>

          {/* Entitlements List Table */}
          <div className="glass-panel p-6 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-200 text-sm">Dettaglio Diritti</h3>
              <button
                onClick={() => setShowJson(!showJson)}
                className="btn-secondary py-1 px-2.5 text-xs"
              >
                <Code className="w-3.5 h-3.5 text-indigo-400" /> {showJson ? 'Nascondi JSON' : 'Risposta Raw'}
              </button>
            </div>

            {Object.keys(subscriberData.entitlements || {}).length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
                Nessun diritto attivo trovato per questo utente.
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(subscriberData.entitlements || {}).map(([key, val]) => (
                  <div key={key} className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-100 text-sm font-mono">{key}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Identificativo Prodotto: <span className="text-indigo-300 font-mono">{val.product_identifier}</span>
                      </div>
                    </div>
                    <Badge variant="emerald">Attivo</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Raw JSON View */}
          {showJson && (
            <div className="glass-panel p-4 border-slate-800 bg-black/60 font-mono text-xs overflow-x-auto text-indigo-200 max-h-96">
              <pre>{JSON.stringify(subscriberData, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
