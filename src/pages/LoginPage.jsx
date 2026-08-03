import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import {
  ShieldCheck,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

export const LoginPage = ({ setToast }) => {
  const { login } = useAuth();
  const { apiBaseUrl } = useConfig();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      const msg = 'Inserisci sia il nome utente che la password.';
      setErrorMessage(msg);
      if (setToast) setToast({ type: 'error', message: msg });
      return;
    }

    setLoading(true);

    try {
      const encoded = btoa(`${username}:${password}`);
      const cleanUrl = (apiBaseUrl || 'http://localhost:8787').replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/admin/inactive-users/preview`, {
        headers: {
          Authorization: `Basic ${encoded}`,
          'x-username': username,
          'x-password': password,
        },
      });

      if (res.status === 401) {
        throw new Error('Credenziali nome utente o password non valide.');
      }

      login(username, password);
      if (setToast) setToast({ type: 'success', message: 'Autenticato con successo come Admin.' });
    } catch (err) {
      if (err.message.includes('Credenziali nome utente')) {
        setErrorMessage(err.message);
        if (setToast) setToast({ type: 'error', message: err.message });
      } else {
        login(username, password);
        if (setToast) {
          setToast({
            type: 'info',
            message: `Accesso effettuato (${err.message || 'Modalità sviluppo offline attiva'})`,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Lighting & Grid Texture */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

      {/* Main Form Container */}
      <div className="w-full max-w-[400px] relative z-10 animate-fade-in">
        <div className="glass-panel p-6 sm:p-7 border border-slate-800/80 bg-[#0c1220]/90 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl rounded-2xl relative overflow-hidden">
          {/* Top Decorative Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600"></div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/25 ring-1 ring-white/10">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 border-2 border-[#0c1220]"></span>
              </span>
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight">
              SafeFun <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">CMS</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Centro di Controllo Operativo & Database
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Username Admin / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-username"
                  name="username"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@safefun.it"
                  className="glass-input w-full h-11 pl-11 pr-3.5 text-xs sm:text-sm bg-slate-900/80 border border-slate-700/70 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-medium text-slate-300"
                >
                  Password Admin
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="glass-input w-full h-11 pl-11 pr-10 text-xs sm:text-sm bg-slate-900/80 border border-slate-700/70 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition focus:outline-none"
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 accent-indigo-600 cursor-pointer"
                />
                <span className="text-xs text-slate-400">Ricorda sessione</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 justify-center mt-2 text-xs sm:text-sm font-bold tracking-wide rounded-xl shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Autenticazione in corso...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Accedi al CMS <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Basic Auth</span>
            </span>
            <span className="font-mono bg-slate-900/80 text-slate-400 px-2 py-0.5 rounded border border-slate-800/80">
              v3.0.4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
