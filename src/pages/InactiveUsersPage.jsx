import React, { useState, useEffect, useRef } from 'react';
import { fetchAdminData } from '../services/api';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { 
  UserX, 
  Search, 
  Send, 
  Trash2, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  Mail, 
  ShieldAlert,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  StopCircle
} from 'lucide-react';

export const InactiveUsersPage = ({ setToast }) => {
  const config = useConfig();
  const auth = useAuth();

  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  // Test Email Modal
  const [testEmailModal, setTestEmailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [testSending, setTestSending] = useState(false);

  // Batch Process Modal State
  const [processModal, setProcessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({
    processed: 0,
    total: 0,
    emailsSent: 0,
    accountsDeleted: 0,
    currentOffset: 0,
    logs: []
  });
  const [processCompleted, setProcessCompleted] = useState(false);

  const cancelBatchRef = useRef(false);

  const fetchInactiveUsers = async (targetPage = page) => {
    setLoading(true);
    try {
      const offset = (targetPage - 1) * limit;
      const res = await fetchAdminData(`/admin/inactive-users/preview?limit=${limit}&offset=${offset}`, {}, config, auth);
      if (res.success) {
        setUsers(res.users || []);
        setTotalCount(res.totalCount ?? res.count ?? 0);
      }
    } catch (err) {
      setToast({ type: 'error', message: `Recupero utenti inattivi non riuscito: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactiveUsers(page);
  }, [page, limit]);

  // Dispatch single test email
  const handleSendTestEmail = async () => {
    setTestSending(true);
    try {
      const payload = {
        name: selectedUser ? `${selectedUser.nome || ''} ${selectedUser.cognome || ''}`.trim() : 'Andrea Bacciolo',
        lastLogin: selectedUser?.last_login || '2024-01-01 10:00:00',
      };

      const res = await fetchAdminData('/admin/inactive-users/test-email', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, config, auth);

      if (res.success) {
        setToast({ type: 'success', message: `Email di prova inviata a ${res.target || 'destinatario target'}!` });
        setTestEmailModal(false);
      } else {
        throw new Error(res.message || 'Invio non riuscito');
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setTestSending(false);
    }
  };

  // Run full process execution in safe continuous batches
  const handleRunProcess = async () => {
    setProcessing(true);
    setProcessCompleted(false);
    cancelBatchRef.current = false;

    const batchSize = 100;
    let currentOffset = 0;
    let totalToProcess = totalCount || 0;
    let accumulatedSent = 0;
    let accumulatedDeleted = 0;
    let accumulatedProcessed = 0;
    let accumulatedLogs = [];

    try {
      let hasMore = true;

      while (hasMore && !cancelBatchRef.current) {
        const res = await fetchAdminData('/admin/inactive-users/process', {
          method: 'POST',
          body: JSON.stringify({
            batchSize,
            offset: currentOffset,
            concurrency: 5
          })
        }, config, auth);

        if (!res.success) {
          throw new Error(res.error?.message || res.message || 'Processo batch non riuscito');
        }

        const summary = res.summary || {};
        totalToProcess = summary.totalInactiveUsers || totalToProcess;
        const processedInBatch = summary.processedInBatch || 0;
        const sentInBatch = summary.emailsSent || 0;
        const deletedInBatch = summary.accountsDeleted || 0;
        const newDetails = res.details || [];

        accumulatedSent += sentInBatch;
        accumulatedDeleted += deletedInBatch;
        accumulatedProcessed += processedInBatch;
        currentOffset = summary.nextOffset || (currentOffset + processedInBatch);
        hasMore = Boolean(summary.hasMore) && processedInBatch > 0;

        accumulatedLogs = [...newDetails, ...accumulatedLogs].slice(0, 100);

        setBatchProgress({
          processed: accumulatedProcessed,
          total: totalToProcess,
          emailsSent: accumulatedSent,
          accountsDeleted: accumulatedDeleted,
          currentOffset,
          logs: accumulatedLogs
        });

        // If batch processed 0 items or no more left, finish loop
        if (processedInBatch === 0 || !hasMore) {
          break;
        }
      }

      setProcessCompleted(true);
      setToast({ 
        type: 'success', 
        message: `Pulizia completata! Elaborati ${accumulatedProcessed} account. Inviate ${accumulatedSent} email, Eliminati ${accumulatedDeleted} account.` 
      });
      fetchInactiveUsers(1);
    } catch (err) {
      setToast({ type: 'error', message: `Errore Pulizia Batch: ${err.message}` });
    } finally {
      setProcessing(false);
    }
  };

  const handleStopBatch = () => {
    cancelBatchRef.current = true;
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const name = `${u.nome || ''} ${u.cognome || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const id = String(u.userID || u.id || '');
    return name.includes(q) || email.includes(q) || id.includes(q);
  });

  const totalPages = Math.ceil((totalCount || 0) / limit) || 1;
  const progressPercent = batchProgress.total > 0 
    ? Math.min(Math.round((batchProgress.processed / batchProgress.total) * 100), 100) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <UserX className="w-5 h-5 text-rose-400" />
            Sistema Pulizia Utenti Inattivi
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Identifica gli account senza attività da $\ge 2$ anni. Invia avvisi ed elimina gli account non validi in batch sicuri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedUser(null);
              setTestEmailModal(true);
            }}
            className="btn-secondary text-xs"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email di Avviso di Prova
          </button>
          <button
            onClick={() => {
              setProcessCompleted(false);
              setBatchProgress({ processed: 0, total: totalCount, emailsSent: 0, accountsDeleted: 0, currentOffset: 0, logs: [] });
              setProcessModal(true);
            }}
            className="btn-danger text-xs font-bold shadow-lg shadow-rose-600/30"
          >
            <Trash2 className="w-3.5 h-3.5" /> Esegui Pulizia Batch
          </button>
        </div>
      </div>

      {/* Main Glass Table Container */}
      <div className="glass-panel p-5 sm:p-6 border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca per nome, email, ID..."
                className="glass-input w-full pl-11 h-9 text-xs"
              />
            </div>
            <button
              onClick={() => fetchInactiveUsers(page)}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition"
              title="Ricarica elenco di anteprima"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Totale Account Inattivi:</span>
              <Badge variant="rose">{totalCount}</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Per pagina:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Recupero elenco utenti inattivi in corso...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
            {search ? 'Nessun utente corrisponde alla ricerca.' : 'Nessun utente inattivo rilevato! Il database è pulito.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4">ID Utente</th>
                    <th className="py-3 px-4">Nome Completo</th>
                    <th className="py-3 px-4">Indirizzo Email</th>
                    <th className="py-3 px-4">Ultimo Accesso</th>
                    <th className="py-3 px-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.userID || u.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        #{u.userID || u.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {[u.nome, u.cognome].filter(Boolean).join(' ') || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-indigo-300">
                        {u.email}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-rose-400" />
                          {u.last_login || u.lastLogin || 'Più di 2 anni fa'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setTestEmailModal(true);
                          }}
                          className="btn-secondary py-1 px-2.5 text-[11px]"
                        >
                          <Send className="w-3 h-3 text-cyan-400" /> Invia Prova
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800/60 text-xs text-slate-400">
              <div>
                Visualizzazione da <span className="text-slate-200 font-medium">{(page - 1) * limit + 1}</span> a <span className="text-slate-200 font-medium">{Math.min(page * limit, totalCount)}</span> di <span className="text-slate-200 font-medium">{totalCount}</span> utenti inattivi
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Precedente
                </button>
                <span className="px-2 text-slate-300 font-mono">
                  Pagina {page} di {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                >
                  Successiva <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Test Email Dispatch Modal */}
      <Modal
        isOpen={testEmailModal}
        onClose={() => setTestEmailModal(false)}
        onConfirm={handleSendTestEmail}
        title="Invia Email di Avviso Inattività di Prova"
        confirmText="Invia Email"
        isSubmitting={testSending}
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-xs">
            Questa operazione invia il template di email di avviso tramite Resend al destinatario di prova:
          </p>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300">
            andreabacciolo80@gmail.com
          </div>
          {selectedUser && (
            <div className="text-xs text-slate-400">
              Record Target Selezionato: <span className="text-slate-200 font-bold">{selectedUser.email}</span> (ID #{selectedUser.userID})
            </div>
          )}
        </div>
      </Modal>

      {/* Execute Batch Process Modal */}
      <Modal
        isOpen={processModal}
        onClose={() => {
          if (processing) return;
          setProcessModal(false);
        }}
        onConfirm={processing ? (cancelBatchRef.current ? null : handleStopBatch) : (processCompleted ? null : handleRunProcess)}
        title="Esegui Pulizia Batch Utenti Inattivi"
        confirmText={processing ? "Annulla Elaborazione" : (processCompleted ? "Chiudi" : "Avvia Pulizia Batch Iterativa")}
        confirmVariant={processing ? "secondary" : "danger"}
        isSubmitting={false}
      >
        <div className="space-y-4">
          {!processing && !processCompleted ? (
            <>
              <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 rounded-xl flex items-start gap-3 text-rose-200 text-xs">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Attenzione: Operazione ad Alto Impatto</div>
                  <div className="mt-1 text-rose-300 leading-relaxed">
                    Questo elaborerà tutti i <strong>{totalCount} utenti inattivi</strong> ($\ge 2$ anni) in batch di sicurezza continui da 100. Gli account con bounce o email non valida verranno <strong>eliminati definitivamente in blocco</strong>.
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                L'elaboratore batch esegue richieste suddivise per evitare timeout HTTP. Puoi monitorare il progresso in tempo reale di seguito.
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold">
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span className="text-cyan-300">Elaborazione Batch ({batchProgress.processed} / {batchProgress.total})...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Pulizia Batch Completata</span>
                    </>
                  )}
                </div>
                <span className="font-mono text-xs text-slate-400 font-bold">{progressPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-rose-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase">Elaborati</div>
                  <div className="text-slate-200 font-bold">{batchProgress.processed} / {batchProgress.total}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold text-emerald-400">Email Inviate</div>
                  <div className="text-emerald-400 font-bold">{batchProgress.emailsSent}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold text-rose-400">Account Eliminati</div>
                  <div className="text-rose-400 font-bold">{batchProgress.accountsDeleted}</div>
                </div>
              </div>

              {/* Live Log Stream */}
              {batchProgress.logs && batchProgress.logs.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Ultime Attività Batch</div>
                  <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-xl p-2.5 bg-black/50 font-mono text-[11px] space-y-1.5">
                    {batchProgress.logs.map((d, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-300">
                        <span>#{d.userID} {d.email}</span>
                        <span className={d.status === 'sent' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                          {d.status} {d.reason ? `(${d.reason})` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
