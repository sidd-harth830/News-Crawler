import { createClient } from '@supabase/supabase-js';
import { Activity, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import FeedCard from './components/FeedCard';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-indigo-500/30">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-neutral-950 to-neutral-950 pointer-events-none" />
      
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
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

        <div className="space-y-6">
          {!articles || articles.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-neutral-400 text-lg">No curated news found on this page.</p>
            </div>
          ) : (
            articles.map((article) => (
              <FeedCard key={article.id} article={article} />
            ))
          )}
        </div>

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
      </main>
    </div>
  );
}
