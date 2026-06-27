"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import FeedCard from './FeedCard';
import ArticleModal from './ArticleModal';
import { fetchArticles } from '@/app/actions/feed';
import { Loader2 } from 'lucide-react';

export default function FeedClient({ 
  articles: initialArticles, 
  emptyMessage = "No curated news found on this page.",
  initialArticleId
}: { 
  articles: any[], 
  emptyMessage?: string,
  initialArticleId?: string
}) {
  const [activeArticle, setActiveArticle] = useState<any | null>(null);
  const [articles, setArticles] = useState(initialArticles);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialArticleId && articles) {
      const match = articles.find(a => a.id.toString() === initialArticleId);
      if (match) setActiveArticle(match);
    }
  }, [initialArticleId, articles]);

  const [cols, setCols] = useState(4);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateCols = () => {
      if (window.innerWidth < 768) setCols(1);
      else if (window.innerWidth < 1024) setCols(2);
      else if (window.innerWidth < 1280) setCols(3);
      else setCols(4);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const nextPage = page + 1;
    const res = await fetchArticles(nextPage, 10);
    
    if (res.articles.length > 0) {
      setArticles(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const newUnique = res.articles.filter((a: any) => !existingIds.has(a.id));
        return [...prev, ...newUnique];
      });
      setPage(nextPage);
    }
    setHasMore(res.hasMore);
    setIsLoading(false);
  }, [page, isLoading, hasMore]);

  const observer = useRef<IntersectionObserver | null>(null);
  const bottomBoundaryRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { threshold: 0.1, rootMargin: '400px' });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMore]);

  // Prevent hydration mismatch by returning empty structure until mounted
  if (!isMounted) return null;

  return (
    <>
      <div className="w-full">
        {!articles || articles.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 text-center shadow-sm dark:shadow-none">
            <p className="text-slate-500 dark:text-neutral-400 text-lg">{emptyMessage}</p>
          </div>
        ) : (
          <>
            {/* Dynamic JS Masonry Layout */}
            <div className="flex gap-6 w-full">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={`col-${colIndex}`} className="flex flex-col gap-6 flex-1 min-w-0">
                  {articles.filter((_, i) => i % cols === colIndex).map((article, index) => (
                    <FeedCard key={article.id} article={article} index={index} onClick={() => setActiveArticle(article)} />
                  ))}
                </div>
              ))}
            </div>
            
            {/* Infinite Scroll Trigger & Bottom Spacing */}
            <div ref={bottomBoundaryRef} className="w-full py-16 flex flex-col items-center justify-center border-t border-stone-200 dark:border-white/5 mt-12 gap-4">
              {isLoading ? (
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              ) : hasMore ? (
                <button 
                  onClick={loadMore}
                  className="px-8 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors text-sm font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-indigo-500 dark:hover:text-indigo-400"
                >
                  Load More Intelligence
                </button>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-1 bg-indigo-500/20 rounded-full mx-auto mb-4" />
                  <p className="text-sm font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">End of Intelligence Feed</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {activeArticle && (
        <ArticleModal 
          article={activeArticle} 
          onClose={() => setActiveArticle(null)} 
        />
      )}
    </>
  );
}
