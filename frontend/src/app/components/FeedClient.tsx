"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import FeedCard from './FeedCard';
import ArticleModal from './ArticleModal';
import { fetchArticles, markAllAsRead, ViewState } from '@/app/actions/feed';
import { Loader2, CheckCircle2, Search, Database, Activity } from 'lucide-react';

export default function FeedClient({ 
  articles: initialArticles, 
  emptyMessage = "No curated news found.",
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
  
  const [viewState, setViewState] = useState<ViewState>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [isPending, startTransition] = useTransition();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reload feed when view state or debounced search changes
  useEffect(() => {
    const reloadFeed = async () => {
      setPage(1);
      setIsLoading(true);
      setArticles([]); // clear instantly for snappy UI
      const res = await fetchArticles(1, 10, viewState, debouncedSearch);
      setArticles(res.articles);
      setHasMore(res.hasMore);
      setIsLoading(false);
    };
    
    // Skip initial mount if nothing changed, but since we already have initialArticles, 
    // we only want to fetch if viewState or debouncedSearch changes from their defaults.
    // Actually, just fetch every time they change.
    // Wait, on initial mount `debouncedSearch` is '' and `viewState` is 'active'.
    // To avoid double fetching on mount:
    if (viewState !== 'active' || debouncedSearch !== '') {
      reloadFeed();
    }
  }, [viewState, debouncedSearch]);

  const handleMarkAllAsRead = () => {
    const unreadIds = articles.filter(a => a.isUnread).map(a => a.id);
    if (unreadIds.length === 0) return;
    
    setArticles(prev => prev.map(a => ({ ...a, isUnread: false })));
    
    startTransition(() => {
      markAllAsRead(unreadIds).catch(console.error);
    });
  };

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
    const res = await fetchArticles(nextPage, 10, viewState, debouncedSearch);
    
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
  }, [page, isLoading, hasMore, viewState, debouncedSearch]);

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

  if (!isMounted) return null;

  return (
    <>
      <div className="w-full mb-10 flex flex-col xl:flex-row gap-4 xl:items-center justify-between bg-white dark:bg-neutral-900/50 border border-stone-200 dark:border-white/5 rounded-2xl p-3 shadow-sm backdrop-blur-md">
        
        {/* View State Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-black/20 p-1 rounded-xl w-full xl:w-auto overflow-x-auto">
          <button 
            onClick={() => setViewState('active')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewState === 'active' ? 'bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'}`}
          >
            <Activity className="w-4 h-4" />
            Active Feed
          </button>
          <button 
            onClick={() => setViewState('all')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewState === 'all' ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'}`}
          >
            All Intelligence
          </button>
          <button 
            onClick={() => setViewState('vault')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewState === 'vault' ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'}`}
          >
            <Database className="w-4 h-4" />
            The Vault
          </button>
        </div>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
            </div>
            <input
              type="text"
              placeholder="Search intelligence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-100 dark:bg-black/20 border border-transparent dark:border-white/5 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          
          <button 
            onClick={handleMarkAllAsRead}
            disabled={isPending || articles.filter(a => a.isUnread).length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 h-full rounded-xl bg-stone-100 dark:bg-black/20 text-sm font-bold text-slate-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-stone-200 dark:hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Mark all as read</span>
          </button>
        </div>
      </div>

      <div className="w-full">
        {!articles || articles.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 text-center shadow-sm dark:shadow-none">
            <p className="text-slate-500 dark:text-neutral-400 text-lg">{emptyMessage}</p>
          </div>
        ) : (
          <>
            <div className="flex gap-6 w-full">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={`col-${colIndex}`} className="flex flex-col gap-6 flex-1 min-w-0">
                  {articles.filter((_, i) => i % cols === colIndex).map((article, index) => (
                    <FeedCard 
                      key={article.id} 
                      article={article} 
                      index={index} 
                      isUnread={article.isUnread} 
                      onClick={() => setActiveArticle(article)} 
                    />
                  ))}
                </div>
              ))}
            </div>
            
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
