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
      <div className="space-y-6">
        {!articles || articles.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
            <p className="text-neutral-400 text-lg">{emptyMessage}</p>
          </div>
        ) : (
          articles.map((article) => (
            <FeedCard 
              key={article.id} 
              article={article} 
              onClick={() => setActiveArticle(article)} 
            />
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
