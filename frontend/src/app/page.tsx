import { createClient } from '@supabase/supabase-js';
import { ShieldCheck, Calendar, ExternalLink, Activity } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

export default async function Home() {
  const { data: articles } = await supabase
    .from('curated_news')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-950 to-neutral-950 pointer-events-none" />
      
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <header className="mb-16">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Omni-Channel Tech Radar
          </h1>
          <p className="text-neutral-400 text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            AI-Crawled, Verified, & Scored Tech News
          </p>
        </header>

        <div className="space-y-8">
          {!articles || articles.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-neutral-400">No curated news found yet. Run the backend script to fetch some!</p>
            </div>
          ) : (
            articles.map((article) => (
              <article key={article.id} className="group relative p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-indigo-500/30 transition-all duration-500">
                <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative h-full bg-neutral-900/80 backdrop-blur-xl border border-white/5 rounded-xl p-8 transition-transform duration-500">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                    <div>
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                        <h2 className="text-2xl font-bold text-neutral-100 mb-2 flex items-center gap-3">
                          {article.title}
                          <ExternalLink className="w-5 h-5 text-neutral-500" />
                        </h2>
                      </a>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-6 py-4 min-w-[120px]">
                      <span className="text-3xl font-black text-indigo-400">{article.trust_score}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1 mt-1">
                        <ShieldCheck className="w-3 h-3" /> Trust Score
                      </span>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-xl p-6 border border-white/5">
                    <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
                      Verified AI Facts
                    </h3>
                    <ul className="space-y-3">
                      {Array.isArray(article.extracted_facts) && article.extracted_facts.map((fact: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-neutral-300 leading-relaxed">
                          <span className="text-indigo-400 mt-1">•</span>
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
