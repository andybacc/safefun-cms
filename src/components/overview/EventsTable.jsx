import React, { useState } from 'react';
import {
  Calendar,
  AlertCircle,
  Clock,
  Info,
  ExternalLink,
  MapPin,
  Users,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Badge } from '../Badge';
import { Modal } from '../Modal';
import { fetchAdminData } from '../../services/api';
import { useConfig } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';

export const EventsTable = ({ events = [], loading = false, error = null, onRefresh }) => {
  const config = useConfig();
  const auth = useAuth();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [selectedKeyID, setSelectedKeyID] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const handleOpenEventModal = async (item) => {
    // Prefer numeric item.id over keyID for internal CMS management
    const eventId = item.id || item.keyID || item.key_id || (item.link ? item.link.split('/').pop() : null);

    setSelectedEvent(item);
    setSelectedKeyID(eventId);
    setEventDetail(null);
    setModalError(null);
    setIsModalOpen(true);
    setModalLoading(true);

    try {
      let data = await fetchAdminData(`/overview/event/${eventId}`, {}, config, auth);

      if (data?.event || data?.data) {
        setEventDetail(data.event || data.data);
      } else {
        // Fallback to overview item if specific record is not found
        setEventDetail(item);
      }
    } catch (err) {
      setEventDetail(item);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <div className="glass-panel p-5 sm:p-6 border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-200 text-sm sm:text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" /> Eventi Attivi
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="primary">{events.length} Eventi</Badge>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                title="Aggiorna eventi"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Recupero metriche eventi in corso...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-950/30 border border-rose-800/40 rounded-xl text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-semibold">Impossibile recuperare gli eventi della panoramica</div>
              <div className="text-rose-400 text-[11px] mt-0.5">{error}</div>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
            Nessun evento attivo segnalato da `/overview/events`.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-3.5">ID / Nome Evento</th>
                  <th className="py-3 px-3.5">Sede / Luogo</th>
                  <th className="py-3 px-3.5">Data & Ora</th>
                  <th className="py-3 px-3.5 text-center">Registrazioni</th>
                  <th className="py-3 px-3.5 text-right">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {events.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-800/40 transition group">
                    <td
                      className="py-3 px-3.5 font-semibold text-white cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="group-hover:text-indigo-300 transition">
                          {item.nome || item.name || item.title || `Evento #${item.id || idx + 1}`}
                        </span>
                      </div>
                      {item.office_id && (
                        <div className="text-[10px] text-slate-400 font-mono">Sede #{item.office_id}</div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-300">
                      {item.locale || item.location || 'N/A'}
                    </td>
                    <td className="py-3 px-3.5 text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {item.data || item.date || item.created_at || 'In arrivo'}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center font-mono font-bold text-indigo-300">
                      {item.registrations_count ?? item.nomi ?? item.checkin ?? 0}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => handleOpenEventModal(item)}
                        className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1.5 ml-auto"
                      >
                        <Info className="w-3 h-3 text-indigo-400" /> Dettagli
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEvent ? `Dettagli Evento: ${selectedEvent.nome || selectedEvent.name || 'Evento'}` : 'Dettagli Evento'}
      >
        {modalLoading ? (
          <div className="py-10 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Caricamento informazioni evento ID: <code className="text-indigo-300 font-mono">#{selectedKeyID}</code>...</span>
          </div>
        ) : modalError ? (
          <div className="p-4 bg-rose-950/30 border border-rose-800/40 rounded-xl text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-semibold">Errore durante il recupero dell'evento</div>
              <div className="text-rose-400 text-[11px] mt-0.5">{modalError}</div>
            </div>
          </div>
        ) : eventDetail ? (
          <div className="space-y-4 text-xs text-slate-300">
            {/* Main Header Info */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {eventDetail.nome || eventDetail.name || selectedEvent?.nome}
                </span>
                <Badge variant={eventDetail.online !== 0 ? 'emerald' : 'slate'}>
                  {eventDetail.online !== 0 ? 'Attivo' : 'Offline'}
                </Badge>
              </div>
              {eventDetail.link && (
                <a
                  href={eventDetail.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <ExternalLink className="w-3 h-3" /> {eventDetail.link}
                </a>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Sede / Luogo
                </div>
                <div className="font-semibold text-slate-200">
                  {eventDetail.locale || eventDetail.location || selectedEvent?.locale || 'N/A'}
                </div>
                {eventDetail.indirizzo && (
                  <div className="text-[10px] text-slate-400">
                    {typeof eventDetail.indirizzo === 'object'
                      ? [eventDetail.indirizzo.via, eventDetail.indirizzo.citta, eventDetail.indirizzo.cap].filter(Boolean).join(', ') || JSON.stringify(eventDetail.indirizzo)
                      : String(eventDetail.indirizzo)}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Data & Ora
                </div>
                <div className="font-semibold text-slate-200 font-mono">
                  {eventDetail.data || eventDetail.date || selectedEvent?.data || 'N/A'}
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" /> Registrazioni Totali
                </div>
                <div className="font-bold text-indigo-300 text-base">
                  {eventDetail.registrations_count ?? eventDetail.nomi ?? selectedEvent?.registrations_count ?? 0}
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Check-in effettuati
                </div>
                <div className="font-bold text-emerald-300 text-base">
                  {eventDetail.checkin ?? selectedEvent?.checkin ?? 0}
                </div>
              </div>
            </div>

            {/* API JSON Payload Inspection */}
            {Object.keys(eventDetail).length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 font-mono mb-1">Dettagli JSON API:</div>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 overflow-x-auto max-h-44">
                  {JSON.stringify(eventDetail, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </>
  );
};
