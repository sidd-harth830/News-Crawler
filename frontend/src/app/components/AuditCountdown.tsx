"use client";

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function AuditCountdown({ lastSyncTime }: { lastSyncTime: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const lastRun = new Date(lastSyncTime).getTime();
      const nextRun = lastRun + (4 * 60 * 60 * 1000); // 4 hours later
      const now = new Date().getTime();
      const diff = nextRun - now;

      if (diff <= 0) {
        setTimeLeft('Running now...');
        return;
      }

      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  return (
    <div className="flex items-center gap-2 text-3xl font-black text-emerald-400 font-display tracking-wider font-mono">
      <Clock className="w-8 h-8 text-emerald-500" />
      {timeLeft}
    </div>
  );
}
