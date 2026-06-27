import { createClient } from '@supabase/supabase-js';
import { Activity, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import FeedClient from '@/app/components/FeedClient';
import PipelineConsole from '@/app/components/PipelineConsole';

import TelemetryModal from '@/app/components/TelemetryModal';

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
    .order('id', { ascending: true })
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
    <div className="min-h-screen bg-transparent text-slate-800 dark:text-neutral-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-300">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 bg-stone-50 dark:bg-neutral-950 pointer-events-none transition-colors duration-300" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 dark:from-indigo-900/10 via-transparent dark:via-neutral-950 to-transparent dark:to-neutral-950 pointer-events-none transition-colors duration-300" />
      
      <main className="relative z-10 w-full px-4 md:px-12 xl:px-24 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-screen-2xl mx-auto">
          <div>
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent mb-4 font-display">
              Omni-Channel Tech Radar
            </h1>
            <p className="text-slate-500 dark:text-neutral-400 text-lg flex items-center gap-2 font-medium">
              <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Autonomous Corporate & Tech Intelligence
            </p>
          </div>
          
          <TelemetryModal>
            {/* Daily Briefing Banner */}
            {briefing && page === 1 && (
              <div className="mb-12 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-3xl p-6 sm:p-10 relative overflow-hidden group shadow-sm dark:shadow-none">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-5 group-hover:opacity-10 transition-opacity">
                  <Activity className="w-48 h-48 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Activity className="w-6 h-6" />
                  </span>
                  AI Executive Briefing
                  <span className="text-sm font-medium text-slate-500 dark:text-neutral-400 ml-auto bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full border border-stone-200 dark:border-white/5 backdrop-blur-md">
                    {new Date(briefing.created_at).toLocaleDateString('en-US')}
                  </span>
                </h2>
                <div className="space-y-4 text-lg text-slate-700 dark:text-indigo-100/80 leading-relaxed font-medium relative z-10 max-w-4xl">
                  {briefing.content.split('\n').filter((line: string) => line.trim() !== '').map((line: string, i: number) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-cyan-600 dark:text-cyan-400 font-bold shrink-0 mt-1">
                        {line.startsWith('-') ? '•' : '•'}
                      </span>
                      <p>{line.replace(/^-\s*/, '')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Pipeline Console */}
            <div className="mb-12 border border-stone-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-transparent shadow-sm dark:shadow-none">
              <PipelineConsole />
            </div>
          </TelemetryModal>
        </header>

        <div className="max-w-screen-2xl mx-auto">
          
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-6 border-b border-stone-200 dark:border-white/10 pb-4">Latest Curated Intelligence</h2>
            <FeedClient 
              articles={articles || []} 
              initialArticleId={params?.articleId as string | undefined}
            />
            

          </div>



        </div>
      </main>
    </div>
  );
}
