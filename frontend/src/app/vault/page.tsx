"use client";

import { useState, useEffect, Suspense } from 'react';
import { Bookmark, ChevronLeft, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import FeedClient from '../components/FeedClient';
import { useSearchParams } from 'next/navigation';

function VaultContent() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const page = parseInt(pageParam || '1');
  const limit = 10;
  
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedRaw = localStorage.getItem('bookmarked_articles');
      const saved = savedRaw ? JSON.parse(savedRaw) : [];
      if (Array.isArray(saved)) {
        setAllArticles(saved.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
    }
  }, []);

  const totalPages = allArticles.length ? Math.ceil(allArticles.length / limit) : 1;
  const start = (page - 1) * limit;
  const articles = allArticles.slice(start, start + limit);

  if (!mounted) return null;

  return (
    <>
      <header className="mb-12">
        <Link href="/" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Main Radar
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-4 font-display">
              The Vault
            </h1>
            <p className="text-neutral-400 text-lg flex items-center gap-2 font-medium">
              <Bookmark className="w-5 h-5 text-amber-400" />
              Your personally bookmarked high-value intelligence
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 text-sm font-bold tracking-wider uppercase">
               <Bookmark className="w-4 h-4 fill-amber-400" /> {allArticles.length} Saved items
             </div>
          </div>
        </div>
      </header>

      <div className="space-y-6 max-w-4xl">
        <FeedClient articles={articles} emptyMessage="Your vault is empty. Click the Save icon on any article to bookmark it here." />
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-start gap-4">
          {page > 1 ? (
            <Link href={`/vault?page=${page - 1}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </Link>
          ) : (
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-neutral-600 cursor-not-allowed">
              <ChevronLeft className="w-6 h-6" />
            </div>
          )}
          
          <span className="text-neutral-400 font-medium">
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <Link href={`/vault?page=${page + 1}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </Link>
          ) : (
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-neutral-600 cursor-not-allowed">
              <ChevronRight className="w-6 h-6" />
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function VaultPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/10 via-neutral-950 to-neutral-950 pointer-events-none" />
      
      <main className="relative z-10 w-full px-4 md:px-12 xl:px-24 py-12 max-w-screen-2xl mx-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center p-24 text-amber-500">
            <Loader2 className="w-12 h-12 animate-spin" />
          </div>
        }>
          <VaultContent />
        </Suspense>
      </main>
    </div>
  );
}
