import { createClient } from '@supabase/supabase-js';
import { Activity, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import FeedClient from './components/FeedClient';
import PipelineConsole from './components/PipelineConsole';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

export default async function Home({ searchParams }: { searchParams: { page?: string, articleId?: string } }) {
  // --- Server-Side Pagination Logic ---
  // Ensure searchParams.page is awaited properly for Next.js 15+ if needed, but in Next 14 this works.
  const params = await searchParams;
  const page = parseInt(params?.page || '1');
  const limit = 10;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data: articles, count } = await supabase
    .from('curated_news')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end);

  const totalPages = count ? Math.ceil(count / limit) : 1;

  // Fetch latest Daily Briefing
  const { data: briefing } = await supabase
    .from('daily_briefings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-neutral-950 to-neutral-950 pointer-events-none" />
      
      <main className="relative z-10 w-full px-4 md:px-12 xl:px-24 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-screen-2xl mx-auto">
          <div>
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4 font-display">
              Omni-Channel Tech Radar
            </h1>
            <p className="text-neutral-400 text-lg flex items-center gap-2 font-medium">
              <Activity className="w-5 h-5 text-indigo-400" />
              Autonomous Corporate & Tech Intelligence
            </p>
          </div>
          
          <Link 
            href="/analytics" 
            className="group flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all backdrop-blur-sm"
          >
            <BarChart3 className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
            <span className="font-semibold text-neutral-300 group-hover:text-white">Telemetry Dashboard</span>
          </Link>
        </header>

        <div className="max-w-screen-2xl mx-auto">
          
          {/* Daily Briefing Banner */}
          {briefing && page === 1 && (
            <div className="mb-12 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="w-48 h-48 text-indigo-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-6 flex items-center gap-3">
                <span className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                  <Activity className="w-6 h-6" />
                </span>
                AI Executive Briefing
                <span className="text-sm font-medium text-neutral-400 ml-auto bg-black/20 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
                  {new Date(briefing.created_at).toLocaleDateString('en-US')}
                </span>
              </h2>
              <div className="space-y-4 text-lg text-indigo-100/80 leading-relaxed font-medium relative z-10 max-w-4xl">
                {briefing.content.split('\n').filter((line: string) => line.trim() !== '').map((line: string, i: number) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-cyan-400 font-bold shrink-0 mt-1">
                      {line.startsWith('-') ? '•' : '•'}
                    </span>
                    <p>{line.replace(/^-\s*/, '')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Feed Column */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold font-display text-white mb-6 border-b border-white/10 pb-4">Latest Curated Intelligence</h2>
              <FeedClient 
                articles={articles || []} 
                initialArticleId={params?.articleId as string | undefined}
              />
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-4">
                  {page > 1 ? (
                    <Link href={`/?page=${page - 1}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
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
                    <Link href={`/?page=${page + 1}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
                      <ChevronRight className="w-6 h-6" />
                    </Link>
                  ) : (
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-neutral-600 cursor-not-allowed">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Column: Live Pipeline Console */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-24">
                <PipelineConsole />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
