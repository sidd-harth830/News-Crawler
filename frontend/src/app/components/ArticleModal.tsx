"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Flame, MessageCircle, ExternalLink, Trash2, X, Bookmark } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ArticleModal({ article, onClose }: { article: any, onClose: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(article.is_bookmarked || false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Prevent background scrolling when modal is open and handle hydration
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    await supabase.from('curated_news').update({ is_bookmarked: newState }).eq('id', article.id);
    router.refresh();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this news event?")) {
      setIsDeleting(true);
      await supabase.from('curated_news').delete().eq('id', article.id);
      router.refresh();
      onClose();
    }
  };

  const getCategoryColor = (cat: string) => {
    if (cat === '[Corporate/Business]') return 'text-amber-400 border-amber-400/20 bg-amber-400/10';
    if (cat === '[Macro-Trend]') return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
    return 'text-indigo-400 border-indigo-400/20 bg-indigo-400/10';
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-12 xl:p-24" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md cursor-pointer"
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black/50 z-10 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="overflow-y-auto w-full h-full flex flex-col scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          {/* Modal Header Image */}
          {article.image_url && (
            <div className="relative w-full aspect-video md:aspect-[21/9] shrink-0 border-b border-white/10 bg-black">
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent z-10" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={article.image_url} 
                alt={article.title} 
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          )}

          {/* Modal Body */}
          <div className="p-6 md:p-10 flex-1 flex flex-col">
            
            {article.category && (
              <span className={`inline-block w-fit px-3 py-1 mb-4 rounded-full text-xs font-bold uppercase tracking-wider border ${getCategoryColor(article.category)}`}>
                {article.category}
              </span>
            )}
            
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 font-display leading-tight">
              {article.title}
            </h2>
            
            <div className="flex flex-wrap gap-4 mb-8">
               <div className="flex items-center gap-2 text-neutral-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <span className="font-semibold">{article.trust_score}/100 Trust</span>
               </div>
               {article.hype_score !== null && (
                 <div className="flex items-center gap-2 text-neutral-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="font-semibold">{article.hype_score}/100 Hype</span>
                 </div>
               )}
               {article.sentiment && (
                 <div className="flex items-center gap-2 text-neutral-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <MessageCircle className="w-5 h-5 text-neutral-400" />
                    <span className="font-semibold">{article.sentiment} Sentiment</span>
                 </div>
               )}
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-indigo-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
                Macro Impact Analysis
              </h3>
              <p className="text-neutral-200 text-xl leading-relaxed">
                {article.impact_summary}
              </p>
            </div>

            <div className="mb-12">
              <h3 className="text-lg font-bold text-emerald-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Verified Extracted Facts
              </h3>
              <ul className="space-y-4">
                {Array.isArray(article.extracted_facts) && article.extracted_facts.map((fact: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-neutral-300 text-lg leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                    <span className="text-indigo-400 mt-1 font-black">•</span>
                    {fact}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions Footer */}
            <div className="mt-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex w-full sm:w-auto items-center gap-4">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Read Full Source <ExternalLink className="w-5 h-5" />
                </a>

                <button
                  onClick={handleBookmarkToggle}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors border ${
                    isBookmarked 
                    ? 'bg-amber-400 text-neutral-900 border-amber-400 hover:bg-amber-500' 
                    : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-neutral-900' : ''}`} /> 
                  {isBookmarked ? 'Saved' : 'Save'}
                </button>
              </div>
              
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 px-6 py-3 rounded-xl font-bold transition-colors border border-transparent hover:border-red-500/20"
              >
                <Trash2 className="w-5 h-5" /> {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
