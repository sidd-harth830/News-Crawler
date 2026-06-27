"use client";

import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';

export default function TelemetryAccordion({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-12 mb-12">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10 border border-stone-200 dark:border-white/10 rounded-xl transition-all shadow-sm dark:shadow-none group"
      >
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300" />
          <span className="font-semibold text-slate-700 dark:text-neutral-300 group-hover:text-slate-900 dark:group-hover:text-white">View System Telemetry</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400 dark:text-neutral-400 group-hover:text-slate-900 dark:group-hover:text-white" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 dark:text-neutral-400 group-hover:text-slate-900 dark:group-hover:text-white" />
        )}
      </button>

      {isOpen && (
        <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}
