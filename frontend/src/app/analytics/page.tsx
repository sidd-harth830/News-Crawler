import { createClient } from '@supabase/supabase-js';
import { Activity, ShieldAlert, Cpu, CheckCircle2, ArrowLeft, Search, Flame } from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

export default async function AnalyticsDashboard() {
  const { data: logs } = await supabase
    .from('agent_logs')
    .select('*')
    .order('created_at', { ascending: false });

  const safeLogs = logs || [];

  // Calculate Stats
  const totalApiCalls = safeLogs.filter(l => l.event_type === 'api_usage').length;
  const totalBlocked = safeLogs.filter(l => l.event_type === 'blocked').length;
  const totalSuccessfulCrawls = safeLogs.filter(l => l.event_type === 'crawl_attempt' && !safeLogs.some(b => b.event_type === 'blocked' && b.target_url === l.target_url)).length;
  
  const totalGroqTokens = safeLogs
    .filter(l => l.service_used?.startsWith('Groq'))
    .reduce((acc, curr) => acc + (curr.tokens_or_credits_used || 0), 0);

  const exaCalls = safeLogs.filter(l => l.service_used?.startsWith('Exa')).length;
  const tavilyCalls = safeLogs.filter(l => l.service_used === 'Tavily').length;
  const firecrawlCalls = safeLogs.filter(l => l.service_used === 'Firecrawl' && l.event_type === 'crawl_attempt').length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-neutral-950 to-neutral-950 pointer-events-none" />
      
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <header className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Radar
          </Link>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2 font-display">
            Agent Telemetry Dashboard
          </h1>
          <p className="text-neutral-400 text-lg">Real-time infrastructure health and usage metrics.</p>
        </header>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-24 h-24 text-indigo-400" />
            </div>
            <h3 className="text-neutral-400 font-semibold mb-2">Total API Calls</h3>
            <p className="text-5xl font-black text-white font-display">{totalApiCalls}</p>
          </div>

          <div className="bg-neutral-900/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 className="w-24 h-24 text-emerald-400" />
            </div>
            <h3 className="text-emerald-400 font-semibold mb-2">Successful Scrapes</h3>
            <p className="text-5xl font-black text-white font-display">{totalSuccessfulCrawls}</p>
          </div>

          <div className="bg-neutral-900/80 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldAlert className="w-24 h-24 text-red-400" />
            </div>
            <h3 className="text-red-400 font-semibold mb-2">Security Blocks</h3>
            <p className="text-5xl font-black text-white font-display">{totalBlocked}</p>
          </div>

          <div className="bg-neutral-900/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu className="w-24 h-24 text-orange-400" />
            </div>
            <h3 className="text-orange-400 font-semibold mb-2">Groq Tokens Used</h3>
            <p className="text-5xl font-black text-white font-display">{totalGroqTokens.toLocaleString()}</p>
          </div>

        </div>

        {/* Secondary Stats Grid */}
        <h2 className="text-xl font-bold text-white mb-6 font-display border-b border-white/10 pb-4">Service Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="bg-white/5 border border-white/5 rounded-xl p-6 flex items-center justify-between">
              <div>
                 <h4 className="text-neutral-400 font-medium mb-1">Exa AI Discoveries</h4>
                 <p className="text-3xl font-bold text-indigo-300">{exaCalls}</p>
              </div>
              <Search className="w-8 h-8 text-indigo-500/50" />
           </div>
           
           <div className="bg-white/5 border border-white/5 rounded-xl p-6 flex items-center justify-between">
              <div>
                 <h4 className="text-neutral-400 font-medium mb-1">Tavily AI Discoveries</h4>
                 <p className="text-3xl font-bold text-cyan-300">{tavilyCalls}</p>
              </div>
              <Activity className="w-8 h-8 text-cyan-500/50" />
           </div>

           <div className="bg-white/5 border border-white/5 rounded-xl p-6 flex items-center justify-between">
              <div>
                 <h4 className="text-neutral-400 font-medium mb-1">Firecrawl Fallbacks</h4>
                 <p className="text-3xl font-bold text-amber-300">{firecrawlCalls}</p>
              </div>
              <Flame className="w-8 h-8 text-amber-500/50" />
           </div>
        </div>

        {/* Recent Event Log */}
        <h2 className="text-xl font-bold text-white mb-6 font-display border-b border-white/10 pb-4">Recent Telemetry Stream</h2>
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-neutral-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Event Type</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Target / Data</th>
                  <th className="px-6 py-4 text-right">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {safeLogs.slice(0, 20).map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-neutral-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        log.event_type === 'blocked' ? 'bg-red-500/20 text-red-400' :
                        log.event_type === 'crawl_attempt' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {log.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-300 font-medium">{log.service_used}</td>
                    <td className="px-6 py-4 text-neutral-400 truncate max-w-xs">{log.target_url || '-'}</td>
                    <td className="px-6 py-4 text-right font-mono text-neutral-300">{log.tokens_or_credits_used || 0}</td>
                  </tr>
                ))}
                {safeLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">No telemetry data recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
