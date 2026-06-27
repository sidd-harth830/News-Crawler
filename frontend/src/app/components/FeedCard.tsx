"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Calendar, ExternalLink, Trash2, Flame, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function FeedCard({ article }: { article: any }) {
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this news event?")) {
      setIsDeleting(true);
      await supabase.from('curated_news').delete().eq('id', article.id);
      router.refresh();
    }
  };

  const getCategoryColor = (cat: string) => {
    if (cat === '[Corporate/Business]') return 'text-amber-400 border-amber-400/20 bg-amber-400/10';
    if (cat === '[Macro-Trend]') return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
    return 'text-indigo-400 border-indigo-400/20 bg-indigo-400/10'; // Technical
  };

  return (
    <motion.article 
      layout
      onClick={() => setExpanded(!expanded)}
      className={`group relative p-[1px] rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-white/20 transition-all duration-300 cursor-pointer overflow-hidden ${isDeleting ? 'opacity-50' : ''}`}
    >
      <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative h-full bg-neutral-900/90 backdrop-blur-xl border border-white/5 rounded-[15px] overflow-hidden">
        
        {/* Sleek Banner Image */}
        {article.image_url && (
          <div className="relative w-full h-48 sm:h-64 overflow-hidden border-b border-white/10">
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent z-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={article.image_url} 
              alt={article.title} 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
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
                  {new Date(article.published_date || article.created_at).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
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

          <p className="text-neutral-300 text-lg leading-relaxed mb-4">
            {article.impact_summary}
          </p>

          <AnimatePresence>
            {expanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 mt-6 border-t border-white/10">
                  <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Verified AI Extraction
                  </h3>
                  <ul className="space-y-4">
                    {Array.isArray(article.extracted_facts) && article.extracted_facts.map((fact: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-neutral-200 leading-relaxed bg-black/20 p-4 rounded-lg border border-white/5">
                        <span className="text-indigo-400 mt-1 font-black">•</span>
                        {fact}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8 flex items-center justify-between">
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      Read Full Article <ExternalLink className="w-4 h-4" />
                    </a>
                    
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> {isDeleting ? 'Deleting...' : 'Delete News'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-4 flex justify-center w-full">
             <div className="text-neutral-500 group-hover:text-neutral-300 transition-colors">
                {expanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
             </div>
          </div>

        </div>
      </div>
    </motion.article>
  );
}
