import { createClient } from '@supabase/supabase-js';
import { Activity, ShieldAlert, Cpu, CheckCircle2, ArrowLeft, Search, Flame, ExternalLink, Link2Off } from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

export default async function AnalyticsDashboard({ searchParams }: { searchParams: { tab?: string } }) {
  const params = await searchParams;
  const currentTab = params?.tab || 'overview';

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

  const blockedLogs = safeLogs.filter(l => l.event_type === 'blocked');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-neutral-950 to-neutral-950 pointer-events-none" />
      
      <main className="relative z-10 w-full px-4 md:px-12 xl:px-24 py-12 max-w-screen-2xl mx-auto">
        <header className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Radar
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2 font-display">
            Agent Telemetry Dashboard
          </h1>
          <p className="text-neutral-400 text-lg">Real-time infrastructure health and usage metrics.</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 sm:gap-6 mb-10 border-b border-white/10 overflow-x-auto pb-2">
          <Link 
            href="/analytics?tab=overview" 
            className={`px-4 py-3 font-semibold whitespace-nowrap transition-colors ${currentTab === 'overview' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            System Overview
          </Link>
          <Link 
            href="/analytics?tab=blocked" 
            className={`px-4 py-3 font-semibold whitespace-nowrap transition-colors ${currentTab === 'blocked' ? 'text-red-400 border-b-2 border-red-400' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            Blocked Sources Tracker
          </Link>
        </div>

        {currentTab === 'overview' ? (
          <>
            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
              
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
                <p className="text-5xl font-black text-white font-display">{totalGroqTokens.toLocaleString('en-US')}</p>
              </div>

            </div>

            {/* Secondary Stats Grid */}
            <h2 className="text-2xl font-bold text-white mb-6 font-display border-b border-white/10 pb-4">Service Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
               <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                     <h4 className="text-neutral-400 font-medium mb-1">Exa AI Discoveries</h4>
                     <p className="text-4xl font-black text-indigo-300 font-display">{exaCalls}</p>
                  </div>
                  <Search className="w-10 h-10 text-indigo-500/50" />
               </div>
               
               <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                     <h4 className="text-neutral-400 font-medium mb-1">Tavily AI Discoveries</h4>
                     <p className="text-4xl font-black text-cyan-300 font-display">{tavilyCalls}</p>
                  </div>
                  <Activity className="w-10 h-10 text-cyan-500/50" />
               </div>

               <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                     <h4 className="text-neutral-400 font-medium mb-1">Firecrawl Fallbacks</h4>
                     <p className="text-4xl font-black text-amber-300 font-display">{firecrawlCalls}</p>
                  </div>
                  <Flame className="w-10 h-10 text-amber-500/50" />
               </div>
            </div>

            {/* Recent Event Log */}
            <h2 className="text-2xl font-bold text-white mb-6 font-display border-b border-white/10 pb-4">Recent Telemetry Stream</h2>
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
                    {safeLogs.slice(0, 15).map(log => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-neutral-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            log.event_type === 'blocked' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            log.event_type === 'crawl_attempt' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          }`}>
                            {log.event_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-300 font-medium">{log.service_used}</td>
                        <td className="px-6 py-4 text-neutral-400 truncate max-w-sm">{log.target_url || '-'}</td>
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
          </>
        ) : (
          <div className="space-y-6 max-w-4xl">
            <h2 className="text-2xl font-bold font-display text-white mb-2">Blocked Sources Tracker</h2>
            <p className="text-neutral-400 mb-8">Review articles and sources that our agent was unable to parse due to security blockades (CAPTCHA, Cloudflare, etc.).</p>
            
            {blockedLogs.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <p className="text-neutral-300 text-lg font-medium">Clean run! No sources have been blocked yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blockedLogs.map(log => (
                  <div key={log.id} className="bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-colors p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-500/10 rounded-xl">
                        <Link2Off className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400 mb-1">Blocked by <span className="text-white font-medium">{log.service_used}</span> on {new Date(log.created_at).toLocaleDateString('en-US')}</p>
                        <p className="text-neutral-200 font-medium truncate max-w-md">{log.target_url}</p>
                      </div>
                    </div>
                    {log.target_url && (
                      <a 
                        href={log.target_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-colors whitespace-nowrap border border-red-500/20"
                      >
                        Inspect Source <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
