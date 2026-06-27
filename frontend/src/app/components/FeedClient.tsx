"use client";

import { useState, useEffect } from 'react';
import FeedCard from './FeedCard';
import ArticleModal from './ArticleModal';

export default function FeedClient({ 
  articles, 
  emptyMessage = "No curated news found on this page.",
  initialArticleId
}: { 
  articles: any[], 
  emptyMessage?: string,
  initialArticleId?: string
}) {
  const [activeArticle, setActiveArticle] = useState<any | null>(null);

  useEffect(() => {
    if (initialArticleId && articles) {
      const match = articles.find(a => a.id.toString() === initialArticleId);
      if (match) setActiveArticle(match);
    }
  }, [initialArticleId, articles]);

  return (
    <>
      <div className="columns-1 md:columns-2 xl:columns-4 gap-6 space-y-6">
        {!articles || articles.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 text-center break-inside-avoid shadow-sm dark:shadow-none">
            <p className="text-slate-500 dark:text-neutral-400 text-lg">{emptyMessage}</p>
          </div>
        ) : (
          articles.map((article, index) => (
            <div key={article.id} className="break-inside-avoid mb-6">
              <FeedCard 
                article={article} 
                index={index}
                onClick={() => setActiveArticle(article)} 
              />
            </div>
          ))
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
