import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const { type = 'info', message } = toast;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-emerald-950/40',
    error: 'border-rose-500/40 bg-rose-950/40',
    info: 'border-cyan-500/40 bg-cyan-950/40',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in max-w-md">
      <div className={`flex items-start gap-3 p-4 border rounded-xl backdrop-blur-md shadow-2xl ${borders[type]}`}>
        {icons[type]}
        <div className="flex-1 text-sm font-medium text-slate-100 leading-snug">
          {message}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition p-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
