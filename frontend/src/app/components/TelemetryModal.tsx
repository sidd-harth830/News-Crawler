"use client";

import { useState, ReactNode, useEffect } from 'react';
import { Terminal, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function TelemetryModal({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-white/10 bg-white dark:bg-white/5">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span className="font-semibold font-display text-slate-800 dark:text-white text-lg">System Telemetry</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10 border border-stone-200 dark:border-white/10 rounded-xl transition-all shadow-sm dark:shadow-none"
      >
        <Terminal className="w-5 h-5 text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300" />
        <span className="font-semibold text-slate-700 dark:text-neutral-300 group-hover:text-slate-900 dark:group-hover:text-white">Telemetry Dashboard</span>
      </button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
