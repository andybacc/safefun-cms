import {
  Bold,
  CheckCircle2,
  Code,
  Columns,
  Eye,
  Heading,
  Italic,
  Key,
  Mail,
  Monitor,
  MousePointer,
  Send,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { sendResendEmail } from '../services/api';

const PRESET_TEMPLATES = {
  operational: {
    name: 'Avviso Operativo',
    subject: 'Aggiornamento Operativo SafeFun',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
  <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
    <h1 style="color: #4f46e5; margin: 0; font-size: 22px;">SafeFun Operations</h1>
  </div>
  <div style="padding: 20px 0; color: #334155; line-height: 1.6;">
    <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Aggiornamento Account</h2>
    <p>Ciao Andrea,</p>
    <p>Ti informiamo che sono state registrate nuove attività sul tuo account amministrativo SafeFun.</p>
    <div style="margin: 24px 0; text-align: center;">
      <a href="https://safefun.it" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accedi al Dashboard</a>
    </div>
  </div>
  <div style="padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px;">
    SafeFun Operations &bull; https://safefun.it
  </div>
</div>`
  },
  ticket: {
    name: 'Conferma Accesso / Ticket',
    subject: 'Pass di Accesso Evento - SafeFun',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 16px;">
  <div style="text-align: center; padding-bottom: 16px;">
    <span style="background-color: #059669; color: #ecfdf5; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">ACCESSO CONFERMATO</span>
    <h1 style="color: #ffffff; margin-top: 12px; font-size: 24px;">Pass per l'Evento SafeFun</h1>
  </div>
  <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin: 20px 0;">
    <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;">Ospite: <strong style="color: #ffffff;">Andrea Bacciolo</strong></p>
    <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;">Sede: <strong style="color: #38bdf8;">Milano Club</strong></p>
    <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;">Codice Ticket: <strong style="color: #a7f3d0; font-family: monospace;">SF-2026-X992</strong></p>
  </div>
  <p style="color: #cbd5e1; font-size: 13px; text-align: center;">Presenta questo codice all'ingresso per accedere al locale.</p>
</div>`
  },
  security: {
    name: 'Avviso di Sicurezza',
    subject: 'Avviso di Sicurezza Account SafeFun',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #fecdd3; border-radius: 12px;">
  <div style="border-bottom: 2px solid #e11d48; padding-bottom: 12px;">
    <h2 style="color: #e11d48; margin: 0; font-size: 20px;">Avviso di Sicurezza SafeFun</h2>
  </div>
  <div style="padding: 16px 0; color: #334155; font-size: 14px; line-height: 1.6;">
    <p>Rilevato un nuovo accesso all'account da un nuovo dispositivo o indirizzo IP.</p>
    <p style="background-color: #fff1f2; color: #9f1239; padding: 12px; border-radius: 8px; font-family: monospace;">Data: 2026-08-03 14:13 &bull; IP: 185.220.101.4</p>
    <p>Se non eri tu, ti consigliamo di resettare immediatamente la tua password.</p>
  </div>
</div>`
  }
};

export const ResendPage = ({ setToast }) => {
  const config = useConfig();
  const [to, setTo] = useState('andreabacciolo80@gmail.com');
  const [from, setFrom] = useState('SafeFun Admin <noreply@safefun.it>');
  const [subject, setSubject] = useState(PRESET_TEMPLATES.operational.subject);
  const [html, setHtml] = useState(PRESET_TEMPLATES.operational.html);

  const [mode, setMode] = useState('split'); // 'code' | 'split' | 'preview'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [sending, setSending] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  const textareaRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!to || !subject) {
      setToast({ type: 'error', message: 'Email del destinatario e oggetto sono obbligatori.' });
      return;
    }

    setSending(true);
    setLastResponse(null);
    try {
      const result = await sendResendEmail({ to, from, subject, html }, config.apiBaseUrl);
      setLastResponse(result);
      setToast({ type: 'success', message: `Email inviata con successo! ID: ${result.id}` });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSending(false);
    }
  };

  const insertTag = (openTag, closeTag = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selectedText = text.substring(start, end) || 'Testo';
    const replacement = `${openTag}${selectedText}${closeTag}`;

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setHtml(newText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + openTag.length, start + openTag.length + selectedText.length);
    }, 0);
  };

  const handlePresetSelect = (key) => {
    const preset = PRESET_TEMPLATES[key];
    if (preset) {
      setSubject(preset.subject);
      setHtml(preset.html);
      setToast({ type: 'info', message: `Caricato template preset: "${preset.name}"` });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-cyan-400" />
            Invio Email
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Componi, modifica con anteprima live e invia email operative tramite l'API backend SafeFun.
          </p>
        </div>

        {/* Preset Templates Dropdown */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs text-slate-400 font-medium">Template:</span>
          <select
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="glass-input text-xs py-1.5 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {Object.entries(PRESET_TEMPLATES).map(([key, val]) => (
              <option key={key} value={key} className="bg-slate-900 text-slate-100">
                {val.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Form */}
      <div className="glass-panel p-5 sm:p-6 border-slate-800 space-y-5">
        <form onSubmit={handleSend} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Destinatario (A)
              </label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                className="glass-input w-full text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Indirizzo Mittente (Da)
              </label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="SafeFun <noreply@safefun.it>"
                className="glass-input w-full text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Oggetto dell'Email
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Oggetto dell'email..."
              className="glass-input w-full text-xs font-medium"
              required
            />
          </div>

          {/* HTML Editor Suite Container */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80 shadow-2xl">
            {/* Editor Toolbar Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
              {/* Quick HTML Snippet Helper Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mr-1">Inserisci:</span>
                <button
                  type="button"
                  onClick={() => insertTag('<strong>', '</strong>')}
                  className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1"
                  title="Grassetto <strong>"
                >
                  <Bold className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<em>', '</em>')}
                  className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1"
                  title="Corsivo <em>"
                >
                  <Italic className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<h2 style="color: #1e293b;">', '</h2>')}
                  className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1"
                  title="Titolo H2"
                >
                  <Heading className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<p style="color: #334155;">', '</p>')}
                  className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                  title="Paragrafo <p>"
                >
                  &lt;p&gt;
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<a href="https://safefun.it" style="background-color: #4f46e5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">', '</a>')}
                  className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-indigo-900/60 flex items-center gap-1"
                  title="Pulsante CTA"
                >
                  <MousePointer className="w-3 h-3" /> Pulsante CTA
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />')}
                  className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                  title="Linea Divisoria <hr>"
                >
                  &lt;hr&gt;
                </button>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setMode('code')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1.5 ${mode === 'code' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  <Code className="w-3.5 h-3.5" /> Codice HTML
                </button>
                <button
                  type="button"
                  onClick={() => setMode('split')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1.5 ${mode === 'split' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  <Columns className="w-3.5 h-3.5" /> Diviso (Live)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('preview')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1.5 ${mode === 'preview' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Anteprima
                </button>
              </div>
            </div>

            {/* Editor Content Area */}
            <div className="min-h-[340px]">
              {mode === 'code' && (
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    rows={14}
                    className="w-full bg-[#0d131f] p-4 font-mono text-xs text-indigo-200 outline-none resize-y leading-relaxed border-none focus:ring-0"
                    placeholder="<html><body>Scrivi qui il codice HTML...</body></html>"
                  ></textarea>
                  <div className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between">
                    <span>Editor HTML in tempo reale</span>
                    <span>{html.length} Caratteri</span>
                  </div>
                </div>
              )}

              {mode === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 min-h-[360px]">
                  {/* Left Code Editor Pane */}
                  <div className="flex flex-col bg-[#0d131f]">
                    <div className="px-3 py-1.5 bg-slate-900/90 text-[11px] font-mono text-slate-400 border-b border-slate-800 flex justify-between">
                      <span>Codice Sorgente HTML</span>
                      <span>{html.length} car</span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={html}
                      onChange={(e) => setHtml(e.target.value)}
                      className="w-full flex-1 bg-transparent p-4 font-mono text-xs text-indigo-200 outline-none resize-none leading-relaxed min-h-[300px]"
                      placeholder="<html><body>...</body></html>"
                    ></textarea>
                  </div>

                  {/* Right Live Rendered Pane */}
                  <div className="flex flex-col bg-slate-900/50">
                    <div className="px-3 py-1.5 bg-slate-900/90 text-[11px] font-mono text-slate-400 border-b border-slate-800 flex justify-between">
                      <span>Render Anteprima Live</span>
                      <span className="text-emerald-400">● In tempo reale</span>
                    </div>
                    <div className="p-4 flex-1 overflow-auto bg-slate-950 flex justify-center items-start">
                      <div className="w-full max-w-[560px] bg-white rounded-xl shadow-xl overflow-hidden p-4 min-h-[260px]">
                        <div dangerouslySetInnerHTML={{ __html: html }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'preview' && (
                <div className="bg-slate-950 p-6 flex flex-col items-center min-h-[360px]">
                  {/* Preview device toggle */}
                  <div className="flex items-center gap-2 mb-4 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1.5 ${previewDevice === 'desktop' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                      <Monitor className="w-3.5 h-3.5" /> Desktop (600px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1.5 ${previewDevice === 'mobile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Mobile (360px)
                    </button>
                  </div>

                  {/* Rendered Email Frame */}
                  <div
                    className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 p-4 border border-slate-200 ${previewDevice === 'mobile' ? 'w-[360px]' : 'w-full max-w-[600px]'
                      }`}
                  >
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            {lastResponse ? (
              <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Email Inviata! ID: {lastResponse.id}
              </div>
            ) : (
              <div></div>
            )}
            <button
              type="submit"
              disabled={sending}
              className="btn-primary ml-auto text-xs font-bold py-2.5 px-6 shadow-lg shadow-indigo-600/30"
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Invio in corso...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Invia tramite Resend
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
