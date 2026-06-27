import { createClient } from '@supabase/supabase-js';
import { Terminal, Cpu, Network, ShieldCheck, Flame, Zap } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

export default async function PipelineConsole() {
  const { data: logs } = await supabase
    .from('agent_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  const getLogColor = (type: string) => {
    if (type === 'crawl_attempt') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (type === 'api_usage') return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
    if (type === 'blocked') return 'text-red-400 bg-red-400/10 border-red-400/20';
    return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  };

  const getLogIcon = (type: string) => {
    if (type === 'crawl_attempt') return <Network className="w-4 h-4" />;
    if (type === 'api_usage') return <Cpu className="w-4 h-4" />;
    if (type === 'blocked') return <ShieldCheck className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden group border border-white/10 shadow-2xl shadow-black/40">
      <div className="absolute -right-20 -top-20 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
        <Terminal className="w-64 h-64 text-indigo-500" />
      </div>
      
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <Terminal className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold font-display tracking-wide bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent uppercase">
          Live Agent Console
        </h3>
        <div className="ml-auto flex items-center gap-2">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
           </span>
           <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">Active</span>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {!logs || logs.length === 0 ? (
          <div className="text-neutral-500 italic p-4 text-center border border-white/5 rounded-xl bg-black/20">
            Awaiting agent directives...
          </div>
        ) : (
          logs.map((log: any) => (
            <div key={log.id} className="flex flex-col gap-2 p-3 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded flex items-center gap-1.5 uppercase font-bold tracking-widest text-[10px] border ${getLogColor(log.event_type)}`}>
                  {getLogIcon(log.event_type)} {log.event_type.replace('_', ' ')}
                </span>
                <span className="text-neutral-500 ml-auto tabular-nums">
                  {new Date(log.created_at).toLocaleTimeString('en-US', { hour12: false })}
                </span>
              </div>
              <div className="text-neutral-300 truncate pl-1">
                {log.target_url || log.service_used || 'Background sync process...'}
              </div>
              {log.tokens_or_credits_used && (
                <div className="text-indigo-400/70 font-semibold pl-1">
                  &gt; Compute: {log.tokens_or_credits_used} tokens
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-neutral-500">
        <span>System: v2.4.1</span>
        <span>Secure Tunnel</span>
      </div>
    </div>
  );
}
