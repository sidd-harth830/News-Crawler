"use client";

import { Calendar, ShieldCheck, Flame, MessageCircle } from 'lucide-react';
import { useState, useRef, MouseEvent, useTransition } from 'react';
import { markArticleAsRead } from '@/app/actions/feed';

export default function FeedCard({ article, index = 1, onClick, isUnread = false }: { article: any, index?: number, onClick: () => void, isUnread?: boolean }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  // Optimistic UI state to immediately dim the card when clicked
  const [optimisticRead, setOptimisticRead] = useState(!isUnread);
  const [isPending, startTransition] = useTransition();
  const cardRef = useRef<HTMLElement>(null);
  
  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getCategoryColor = (cat: string) => {
    if (cat === '[Corporate/Business]') return 'text-amber-600 border-amber-200 bg-amber-100/50 dark:text-amber-400 dark:border-amber-400/20 dark:bg-amber-400/10';
    if (cat === '[Macro-Trend]') return 'text-emerald-600 border-emerald-200 bg-emerald-100/50 dark:text-emerald-400 dark:border-emerald-400/20 dark:bg-emerald-400/10';
    return 'text-indigo-600 border-indigo-200 bg-indigo-100/50 dark:text-indigo-400 dark:border-indigo-400/20 dark:bg-indigo-400/10';
  };

  const handleClick = () => {
    if (!optimisticRead) {
      setOptimisticRead(true);
      startTransition(() => {
        markArticleAsRead(article.id).catch(console.error);
      });
    }
    onClick();
  };

  const borderClass = !optimisticRead 
    ? 'border-stone-300 dark:border-white/20' 
    : 'border-stone-200 dark:border-white/5';

  return (
    <article 
      ref={cardRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative p-[1px] rounded-3xl bg-white dark:bg-neutral-900/40 border transition-all duration-300 cursor-pointer ${borderClass} hover:border-stone-300 dark:hover:bg-neutral-900/80 dark:hover:border-white/10 flex flex-col overflow-hidden w-full h-fit shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none`}
    >
      {!optimisticRead && (
        <div className="absolute top-4 right-4 z-30 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </div>
      )}
      <div className="relative z-10 flex flex-col pointer-events-none">
        
        {/* Sleek Banner Image */}
        {article.image_url && (
          <div className="relative w-full overflow-hidden bg-neutral-950 shrink-0 aspect-video">
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent z-10 opacity-80" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={article.image_url} 
              alt={article.title} 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-100"
            />
            {article.category && (
              <div className="absolute top-4 left-4 z-20">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md ${getCategoryColor(article.category)}`}>
                  {article.category}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-6 sm:p-8 flex flex-col flex-1">
          <div className="flex flex-col xl:flex-row justify-between gap-6 mb-4">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <h2 className="font-bold text-slate-900 dark:text-neutral-100 font-display leading-snug line-clamp-3 text-lg sm:text-xl">
                  {article.title}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-neutral-500 font-medium uppercase tracking-wide">
                <span className="flex items-center gap-1.5 bg-stone-100 dark:bg-white/5 px-2.5 py-1 rounded-md border border-stone-200 dark:border-white/5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  <span className="opacity-50 mx-1">•</span>
                  {new Date(article.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
            
          <p className="text-slate-600 dark:text-neutral-400 text-sm sm:text-base leading-relaxed line-clamp-4">
            {article.impact_summary}
          </p>

          {/* Score Badges Footer */}
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-stone-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span className="text-sm font-bold text-slate-700 dark:text-neutral-300">Trust: <span className="text-indigo-500 dark:text-indigo-400">{article.trust_score}</span></span>
            </div>
            {article.hype_score !== null && (
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                <span className="text-sm font-bold text-slate-700 dark:text-neutral-300">Hype: <span className="text-orange-500 dark:text-orange-400">{article.hype_score}</span></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}