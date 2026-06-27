"use client";

import { Calendar, ShieldCheck, Flame, MessageCircle } from 'lucide-react';
import { useState, useRef, MouseEvent } from 'react';

export default function FeedCard({ article, onClick }: { article: any, onClick: () => void }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
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
    if (cat === '[Corporate/Business]') return 'text-amber-400 border-amber-400/20 bg-amber-400/10';
    if (cat === '[Macro-Trend]') return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
    return 'text-indigo-400 border-indigo-400/20 bg-indigo-400/10';
  };

  return (
    <article 
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative p-[1px] rounded-2xl bg-gradient-to-b from-white/10 to-white/5 transition-all duration-300 cursor-pointer overflow-hidden shadow-2xl shadow-black/20"
    >
      {/* Dynamic Spotlight Glow */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: isHovered 
            ? `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15), transparent 40%)` 
            : 'transparent',
          opacity: isHovered ? 1 : 0
        }}
      />
      
      <div className="relative z-10 h-full glass rounded-[15px] overflow-hidden pointer-events-none">
        
        {/* Sleek Banner Image */}
        {article.image_url && (
          <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden border-b border-white/10 bg-neutral-900">
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent z-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={article.image_url} 
              alt={article.title} 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
            />
            {article.category && (
              <div className="absolute top-4 left-4 z-20">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${getCategoryColor(article.category)}`}>
                  {article.category}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-4">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-100 mb-3 font-display leading-tight">
                {article.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {new Date(article.published_date || article.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                  <span className="text-neutral-600 mx-1">•</span>
                  <span className="text-neutral-500 font-mono text-xs">
                    Received: {new Date(article.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
                {article.sentiment && (
                  <div className="flex items-center gap-1.5 text-neutral-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                    <MessageCircle className="w-4 h-4" />
                    {article.sentiment}
                  </div>
                )}
              </div>
            </div>
            
            {/* Score Badges */}
            <div className="flex gap-3 h-fit">
              <div className="flex flex-col items-center justify-center bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 min-w-[90px]">
                <span className="text-2xl font-black text-indigo-400">{article.trust_score}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Trust
                </span>
              </div>
              {article.hype_score !== null && (
                <div className="flex flex-col items-center justify-center bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 min-w-[90px]">
                  <span className="text-2xl font-black text-orange-400">{article.hype_score}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 mt-1 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Hype
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="text-neutral-300 text-lg leading-relaxed line-clamp-2">
            {article.impact_summary}
          </p>
        </div>
      </div>
    </article>
  );
}
