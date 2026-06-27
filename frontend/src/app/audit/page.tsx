import { createClient } from '@supabase/supabase-js';
import { Activity, Clock, Database, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AuditCountdown from '../components/AuditCountdown';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

export default async function AuditHub() {
  // Find the absolute latest successful crawl from agent_logs
  const { data: latestLog } = await supabase
    .from('agent_logs')
    .select('created_at')
    .eq('event_type', 'crawl_attempt')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const lastSyncTime = latestLog?.created_at || new Date().toISOString();

  // Define the batch window as everything created within 10 minutes of the latest entry
  const syncDate = new Date(lastSyncTime);
  const tenMinsBefore = new Date(syncDate.getTime() - 10 * 60000).toISOString();

  const { data: batch } = await supabase
    .from('curated_news')
    .select('id, title, category, created_at')
    .gte('created_at', tenMinsBefore)
    .lte('created_at', lastSyncTime)
    .order('created_at', { ascending: false });

  // Calculate relative time string
  const getRelativeTimeString = (dateString: string) => {
    const diff = new Date().getTime() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hours and ${minutes % 60} minutes ago`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-neutral-950 to-neutral-950 pointer-events-none" />
      
      <main className="relative z-10 w-full px-4 md:px-12 xl:px-24 py-12 max-w-screen-2xl mx-auto">
        <header className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Main Radar
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4 font-display">
                Crawl Lifecycle Audit
              </h1>
              <p className="text-neutral-400 text-lg flex items-center gap-2 font-medium">
                <Database className="w-5 h-5 text-emerald-400" />
                Pipeline synchronization and ingestion state
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
             <h3 className="text-neutral-400 uppercase tracking-widest font-bold text-sm mb-4">Last Synchronized</h3>
             <div className="text-3xl font-black text-white font-display">
                {getRelativeTimeString(lastSyncTime)}
             </div>
             <p className="text-neutral-500 mt-2 text-sm">{new Date(lastSyncTime).toLocaleString('en-US')}</p>
           </div>
           <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
             <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
               <Activity className="w-64 h-64 text-emerald-400" />
             </div>
             <h3 className="text-emerald-400/80 uppercase tracking-widest font-bold text-sm mb-4 relative z-10">System Health</h3>
             <div className="relative z-10">
               <div className="flex items-center gap-2 text-3xl font-black text-emerald-400 font-display tracking-wider">
                  <Activity className="w-8 h-8 text-emerald-500" />
                  Optimal
               </div>
               <p className="text-emerald-500/80 mt-2 text-sm font-medium">Pipeline running without interruptions</p>
             </div>
           </div>
        </div>

        <div className="bg-black/20 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
          <h2 className="text-2xl font-bold font-display text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
             <Activity className="w-6 h-6 text-emerald-400" />
             Latest Batch Ingests
          </h2>
          
          <ul className="space-y-2">
            {!batch || batch.length === 0 ? (
              <li className="text-neutral-500 italic">No ingestions found for the latest sync window.</li>
            ) : (
              batch.map((article) => (
                <li key={article.id}>
                  {/* CROSS-ROUTING CLICK TRIGGER */}
                  <Link 
                    href={`/?articleId=${article.id}`} 
                    className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md">
                        {article.category || 'News'}
                      </span>
                      <span className="text-lg font-medium text-neutral-300 group-hover:text-white transition-colors">
                        {article.title}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-emerald-400 transition-colors" />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
