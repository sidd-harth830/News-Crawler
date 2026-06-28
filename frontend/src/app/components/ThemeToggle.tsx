"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-xl bg-slate-200/50 dark:bg-white/[0.03] animate-pulse" />;
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border border-black/5 dark:border-white/[0.08] hover:border-black/10 dark:hover:border-white/20 transition-all duration-300 group shadow-sm dark:shadow-none"
      aria-label="Toggle Theme"
    >
      <div className="relative flex items-center justify-center w-full h-full">
        <Sun 
          className={`absolute w-5 h-5 text-amber-500 transition-all duration-500 transform 
            ${isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100 group-hover:rotate-12"}`} 
        />
        <Moon 
          className={`absolute w-5 h-5 text-indigo-400 transition-all duration-500 transform 
            ${isDark ? "opacity-100 rotate-0 scale-100 group-hover:-rotate-12" : "opacity-0 -rotate-90 scale-50"}`} 
        />
      </div>
    </button>
  );
}
