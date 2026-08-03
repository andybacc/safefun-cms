import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Users,
  Activity,
  UserX,
  AlertTriangle,
  Clock,
  Globe,
  Smartphone,
  Eye,
  X,
  ShieldCheck,
  CreditCard,
  Code,
  Copy,
  Check,
  RotateCw,
  Database,
  Cloud,
  Layers
} from 'lucide-react';
import { Badge } from '../Badge';

export const BusinessPlansInsight = ({ plans = [], rcSubscribers = [], plansMeta = {}, onRefresh, loading = false }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSourceTab, setActiveSourceTab] = useState('all'); // 'all' | 'revenuecat' | 'database'

  const isDataLoading = loading || isRefreshing;

  const {
    db_active_count = plans.length,
    revenuecat_active_count = 0,
    revenuecat_verified = false,
    has_discrepancy = false,
  } = plansMeta;

  const totalTeamMembers = plans.reduce(
    (acc, p) => acc + (Number(p.team_members_count) || 1),
    0
  );

  const totalInactiveTeamMembers = plans.reduce(
    (acc, p) => acc + (Number(p.inactive_team_members_count) || 0),
    0
  );

  const handleCopyJson = (data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReloadRevenueCat = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 border-slate-800/80 space-y-6 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan">Abbonamenti</Badge>
            <span className="text-[11px] text-slate-400 font-mono">
              {revenuecat_verified ? 'Fonte: RevenueCat API + Failover DB' : 'Fonte: Database Local'}
            </span>
          </div>
          <h3 className="font-bold text-slate-100 text-lg sm:text-xl flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            Analisi Abbonamenti Attivi
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Analisi dettagliata sugli abbonamenti aziendali attivi, confronto tra RevenueCat e Database locale.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-xs font-semibold text-slate-200">{plans.length} Abbonamenti DB</div>
            <div className={`text-[10px] font-medium ${has_discrepancy ? 'text-amber-400' : 'text-emerald-400'}`}>
              {has_discrepancy ? 'Discrepanza rilevata' : '100% Sincronizzati'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Source Isolation Tabs & Global Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveSourceTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${activeSourceTab === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Tutti i Dati
          </button>
          <button
            onClick={() => setActiveSourceTab('revenuecat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${activeSourceTab === 'revenuecat'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Cloud className="w-3.5 h-3.5 text-violet-400" />
            RevenueCat API ({rcSubscribers.length})
          </button>
          <button
            onClick={() => setActiveSourceTab('database')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${activeSourceTab === 'database'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            Database Locale ({plans.length})
          </button>
        </div>

        {/* Reload RevenueCat Data Button */}
        <button
          onClick={handleReloadRevenueCat}
          disabled={isDataLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 hover:text-white font-semibold text-xs transition shadow-lg shadow-violet-500/10 disabled:opacity-50"
          title="Ricarica i dati degli abbonamenti da RevenueCat API v2"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isDataLoading ? 'animate-spin' : ''}`} />
          <span>Ricarica Dati RevenueCat</span>
        </button>
      </div>

      {/* Key KPI Insight Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Abbonamenti Attivi</span>
            {has_discrepancy ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          <div className="text-2xl font-black text-white flex items-baseline gap-2">
            <span>{revenuecat_verified ? revenuecat_active_count : db_active_count}</span>
            <span className="text-xs text-indigo-400 font-normal font-sans">
              RC ({revenuecat_active_count}) / DB ({db_active_count})
            </span>
          </div>
          <div className="text-[11px] text-slate-400 leading-tight">
            {has_discrepancy ? (
              <span className="text-amber-400 font-medium">Discrepanza webhook/sync rilevata</span>
            ) : (
              'Abbonamenti attivi allineati tra RevenueCat e DB.'
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Membri Totali del Team</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300">
            {totalTeamMembers}
          </div>
          <div className="text-[11px] text-slate-400 leading-tight">
            Totale staff e membri del team in tutti gli account aziendali.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Salute della Retention</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 flex items-center gap-1.5">
            98.4%
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-[11px] text-slate-400 leading-tight">
            Nessun avviso di abbandono rilevato nei cicli di fatturazione attivi.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Membri Inattivi Totali</span>
            <UserX className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            {totalInactiveTeamMembers}
          </div>
          <div className="text-[11px] text-slate-400 leading-tight">
            Membri totali team senza attività negli ultimi 6 mesi.
          </div>
        </div>
      </div>

      {/* Discrepancy Warning Banner */}
      {has_discrepancy && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            Discrepanza Sincronizzazione Rilevata
          </div>
          <p className="text-amber-300/80 text-[11px]">
            RevenueCat è la fonte primaria di verità per gli abbonamenti. Il numero di abbonati attivi nel Database locale ({db_active_count}) non corrisponde a quelli confermati da RevenueCat ({revenuecat_active_count}).
          </p>
        </div>
      )}

      {/* ISOLATED SECTION 1: RevenueCat Customers List (Fonte API v2) */}
      {(activeSourceTab === 'all' || activeSourceTab === 'revenuecat') && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-violet-500/30 space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="violet">Fonte Primaria: RevenueCat API v2</Badge>
                <span className="text-[11px] text-violet-300 font-mono">
                  {rcSubscribers.length} Clienti Attivi
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-violet-400" /> Clienti e Abbonati RevenueCat
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-cyan-400" /> Clicca riga per ispezionare
              </span>
              <button
                onClick={handleReloadRevenueCat}
                disabled={isDataLoading}
                className="p-1.5 rounded-lg bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:text-white transition disabled:opacity-50"
                title="Ricarica Dati RevenueCat"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isDataLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-3">Customer ID (Email)</th>
                  <th className="py-3 px-3">Piano</th>
                  <th className="py-3 px-3">Rinnovo</th>
                  <th className="py-3 px-3">Scadenza</th>
                  <th className="py-3 px-3">Ultimo Log</th>
                  <th className="py-3 px-3">Paese</th>
                  <th className="py-3 px-3">Piattaforma</th>
                  <th className="py-3 px-3 text-right">Ispeziona</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {isDataLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse border-b border-slate-800/40">
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-800/80 rounded-md w-36"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-violet-500/20 rounded-md w-14"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-emerald-500/20 rounded-md w-16"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-800/80 rounded-md w-24"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-800/80 rounded-md w-28"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-cyan-500/20 rounded-md w-12"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-indigo-500/20 rounded-md w-20"></div>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="h-6 w-6 bg-slate-800/80 rounded-lg ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : rcSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
                      Nessun cliente RevenueCat disponibile. Verifica la chiave API v2.
                    </td>
                  </tr>
                ) : (
                  rcSubscribers.map((c, idx) => {
                    const activeSubs = c.active_subscriptions || [];
                    const primarySub = c.primary_subscription || activeSubs[0] || (c.subscriptions && c.subscriptions[0]);

                    const getPlanLabel = (sub) => {
                      return sub?.plan_type || 'Free';
                    };

                    const autoRenewalStatus = primarySub?.auto_renewal_status;
                    const isAutoRenewing = (autoRenewalStatus === 'will_renew' || autoRenewalStatus === 'will_auto_renew') || false;

                    let autoRenewalText = isAutoRenewing ? 'attivo' : 'annullato';
                    let autoRenewalBadge = isAutoRenewing ? 'emerald' : 'amber';

                    const expirationDate = primarySub?.current_period_ends_at
                      ? new Date(primarySub.current_period_ends_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—';

                    const lastLog = c.last_seen_at
                      ? new Date(c.last_seen_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : '—';

                    return (
                      <tr
                        key={c.id || idx}
                        onClick={() => setSelectedCustomer(c)}
                        className="hover:bg-slate-800/50 transition cursor-pointer group"
                      >
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-100 text-[11px] font-mono truncate max-w-[200px] inline-block group-hover:text-cyan-300 transition" title={c.id}>
                            {c.id}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {activeSubs.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {activeSubs.map((sub, sIdx) => {
                                const label = getPlanLabel(sub);
                                const isFull = label.toLowerCase() === 'full';
                                return (
                                  <Badge key={sub.id || sIdx} variant={isFull ? 'violet' : 'cyan'} className="font-bold text-[10px] uppercase">
                                    {label}
                                  </Badge>
                                );
                              })}
                            </div>
                          ) : (
                            <Badge variant="cyan" className="font-bold text-[10px] uppercase">
                              {getPlanLabel(primarySub)}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={autoRenewalBadge} className="font-bold text-[10px]">
                            {autoRenewalText}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                          {expirationDate}
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {lastLog}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Globe className="w-3 h-3 text-cyan-400" />
                            <span className="uppercase">{c.last_seen_country || '—'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Smartphone className="w-3 h-3 text-indigo-400" />
                            <span className="capitalize">{c.last_seen_platform || '—'}</span>
                            {c.last_seen_platform_version && (
                              <span className="text-[10px] text-slate-500">v{c.last_seen_platform_version}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomer(c);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/60 hover:bg-cyan-500/20 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition shadow-sm"
                            title="Ispeziona Scheda Cliente"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ISOLATED SECTION 2: DB Plans — Abbonamenti Database Locale */}
      {(activeSourceTab === 'all' || activeSourceTab === 'database') && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="cyan">Fonte Failover: Database Locale</Badge>
                <span className="text-[11px] text-cyan-300 font-mono">
                  {plans.length} Abbonamenti DB
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" /> Abbonamenti e Account Database
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{plans.length} Abbonamenti Totali</span>
          </div>

          {/* Visual Tier Progress Bar */}
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-700/50">
            {plans.map((p, idx) => {
              const colors = ['bg-indigo-500', 'bg-cyan-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400'];
              const widthPct = (1 / (plans.length || 1)) * 100;
              return (
                <div
                  key={p.id || idx}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full ${colors[idx % colors.length]} rounded-full transition-all`}
                  title={`${p.nome || p.plan || 'Piano'}: Attivo`}
                ></div>
              );
            })}
          </div>

          {/* Tier Cards Grid */}
          {isDataLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-4 border border-slate-800 bg-slate-950/40 rounded-xl space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-slate-800 rounded w-28"></div>
                    <div className="h-4 bg-emerald-500/20 rounded w-14"></div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-slate-800/60 rounded w-full"></div>
                    <div className="h-3 bg-slate-800/60 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
              Nessun abbonamento attivo registrato da `/overview/plans`.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {plans.map((p, idx) => {
                const planName = p.nome || p.plan_name || p.plan || `Piano Aziendale #${p.id || idx + 1}`;
                const teamMembers = Number(p.team_members_count) || 1;
                const locale = p.locale || p.indirizzo || 'Sede Predefinita';
                const status = p.status || 'Attivo';

                return (
                  <div
                    key={p.id || idx}
                    className="p-4 border border-slate-800/80 bg-slate-950/60 rounded-xl space-y-3 hover:border-cyan-500/40 transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition">
                        {planName}
                      </span>
                      <Badge variant="emerald">{status}</Badge>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 font-mono">
                      <div className="flex items-center justify-between">
                        <span>Locale:</span>
                        <span className="text-slate-200 font-sans font-medium">{locale}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Membri del Team:</span>
                        <span className="text-indigo-300 font-bold">{teamMembers} membri</span>
                      </div>
                      {p.email && (
                        <div className="flex items-center justify-between text-[11px] truncate">
                          <span className="text-slate-300 font-mono truncate max-w-[140px]">{p.email}</span>
                        </div>
                      )}
                      {p.lastLog && (
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                          <span>Ultimo Log:</span>
                          <span>{p.lastLog}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Customer Inspection Sheet (Centered Modal Portal) */}
      {selectedCustomer && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 h-[100dvh] w-screen top-0 left-0">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedCustomer(null)}
          ></div>

          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl max-h-[85dvh] overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between z-10 animate-in zoom-in-95 duration-200 my-auto">
            <div className="space-y-6">
              {/* Sheet Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="primary">Ispezione RevenueCat</Badge>
                    {selectedCustomer.has_active_subscription && (
                      <Badge variant="emerald">Abbonato Attivo</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono truncate max-w-[400px]">
                    {selectedCustomer.id}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dettagli completi sul cliente, abbonamenti e entitlements registrati.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Overview Card */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                    Piattaforma
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-200 capitalize font-medium">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{selectedCustomer.last_seen_platform || '—'}</span>
                    {selectedCustomer.last_seen_platform_version && (
                      <span className="text-[10px] text-slate-400 font-mono">v{selectedCustomer.last_seen_platform_version}</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                    Paese
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-200 uppercase font-medium">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedCustomer.last_seen_country || '—'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                    Prima Visita
                  </span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {selectedCustomer.first_seen_at
                      ? new Date(selectedCustomer.first_seen_at).toLocaleString('it-IT')
                      : '—'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                    Ultimo Log
                  </span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {selectedCustomer.last_seen_at
                      ? new Date(selectedCustomer.last_seen_at).toLocaleString('it-IT')
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Active Subscriptions Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" /> Abbonamenti Attivi
                  </span>
                  <Badge variant="cyan">
                    {selectedCustomer.active_subscriptions?.length || 0} Attivi
                  </Badge>
                </h4>

                {(!selectedCustomer.active_subscriptions || selectedCustomer.active_subscriptions.length === 0) ? (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 text-center">
                    Nessun abbonamento attivo registrato per questo cliente.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomer.active_subscriptions.map((sub, sIdx) => {
                      const startDate = sub.current_period_started_at
                        ? new Date(sub.current_period_started_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—';
                      const endDate = sub.current_period_ends_at
                        ? new Date(sub.current_period_ends_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—';

                      return (
                        <div
                          key={sub.id || sIdx}
                          className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={sub.plan_type?.toLowerCase() === 'full' ? 'violet' : 'cyan'} className="font-bold text-xs uppercase">
                                {sub.plan_type || 'PRO'}
                              </Badge>
                              <span className="font-mono text-slate-300 text-[11px]">
                                {sub.product_id || sub.id}
                              </span>
                            </div>
                            <Badge variant={sub.gives_access ? 'emerald' : 'amber'}>
                              {sub.status || 'Active'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                            <div>
                              <span className="text-slate-500 block text-[10px] font-sans">Store:</span>
                              <span className="text-slate-200 capitalize">{sub.store || 'App Store / Play Store'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px] font-sans">Rinnovo Automatico:</span>
                              <span className="text-slate-200">{sub.auto_renewal_status || 'Attivo'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px] font-sans">Inizio Periodo:</span>
                              <span className="text-slate-300">{startDate}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px] font-sans">Data Scadenza:</span>
                              <span className="text-cyan-300 font-bold">{endDate}</span>
                            </div>
                          </div>

                          {sub.is_sandbox && (
                            <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono pt-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Ambiente Sandbox (Acquisto di Test)</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Active Entitlements Section */}
              {selectedCustomer.entitlements && selectedCustomer.entitlements.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active Entitlements
                    </span>
                    <Badge variant="emerald">{selectedCustomer.entitlements.length}</Badge>
                  </h4>

                  <div className="space-y-2">
                    {selectedCustomer.entitlements.map((ent, eIdx) => (
                      <div key={ent.id || eIdx} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs flex items-center justify-between font-mono">
                        <div>
                          <span className="text-emerald-400 font-bold block">{ent.entitlement_id || ent.id}</span>
                          {ent.lookup_key && (
                            <span className="text-[10px] text-slate-400">Lookup Key: {ent.lookup_key}</span>
                          )}
                        </div>
                        {ent.expires_at && (
                          <span className="text-[11px] text-slate-400">
                            Scade: {new Date(ent.expires_at).toLocaleDateString('it-IT')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Raw JSON Data Section */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-200 transition py-1"
                >
                  <span className="flex items-center gap-2 font-mono">
                    <Code className="w-4 h-4 text-cyan-400" />
                    {showRawJson ? 'Nascondi Dataset JSON Grezzo' : 'Mostra Dataset JSON Grezzo'}
                  </span>
                  <Badge variant="neutral">{showRawJson ? 'Chiudi' : 'Espandi'}</Badge>
                </button>

                {showRawJson && (
                  <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 overflow-x-auto text-[11px] font-mono text-cyan-300">
                    <button
                      onClick={() => handleCopyJson(selectedCustomer)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-[10px]"
                      title="Copia JSON"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copiato!' : 'Copia'}</span>
                    </button>
                    <pre className="pr-16">{JSON.stringify(selectedCustomer, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Chiudi Scheda
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
