import React from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';

export const Modal = ({ isOpen, onClose, onConfirm, title, children, confirmText = 'Conferma', confirmVariant = 'primary', isSubmitting = false }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in h-[100dvh] w-screen top-0 left-0">
      <div className="glass-panel w-full max-w-lg overflow-hidden border border-slate-700/60 bg-[#0f172a]/95 shadow-2xl my-auto max-h-[85dvh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            {confirmVariant === 'danger' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-slate-300 text-sm leading-relaxed overflow-y-auto grow">
          {children}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50 shrink-0">
          <button
            onClick={onClose}
            className="btn-secondary text-sm"
            disabled={isSubmitting}
          >
            Annulla
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className={confirmVariant === 'danger' ? 'btn-danger text-sm' : 'btn-primary text-sm'}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Elaborazione in corso...
                </span>
              ) : (
                confirmText
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

