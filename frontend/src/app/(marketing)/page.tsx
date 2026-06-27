import Logo from '@/app/components/Logo'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Radar, Code2, Sparkles, Zap, Lock, Network } from 'lucide-react'
import ThemeToggle from '@/app/components/ThemeToggle'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden relative selection:bg-blue-500/30">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-blue-600/10 blur-[150px] rounded-[100%] mix-blend-screen opacity-50 animate-pulse-slow" />
        <div className="absolute top-[30%] -left-[10%] w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen opacity-40" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen opacity-40" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 font-display font-black text-2xl tracking-tight">
          <Logo className="h-8 w-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
          Radar
        </div>
        <div className="flex items-center gap-6 text-sm font-semibold">
          <ThemeToggle />
          <Link href="/login" className="text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Terminal Access
          </Link>
          <Link 
            href="/login" 
            className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md flex items-center gap-2 group"
          >
            Initialize <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mt-12 mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4" /> Omni-Channel Tech Intelligence
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-[1.1] mb-6 max-w-4xl">
            Command Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
              Information Flow.
            </span>
          </h1>
          
          <p className="text-xl text-neutral-400 max-w-2xl mb-12 leading-relaxed">
            A premium SaaS intelligence platform utilizing Dual-AI verification to autonomously hunt, summarize, and deliver high-signal tech news and open-source code directly to your terminal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/login" 
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Initialize Radar <Zap className="w-5 h-5" />
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all backdrop-blur-md flex items-center justify-center gap-2"
            >
              Secure Access <Lock className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Feature */}
          <div className="md:col-span-2 glass rounded-[2rem] p-8 md:p-12 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Radar className="w-12 h-12 text-blue-400 mb-6 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
            <h3 className="text-3xl font-display font-bold mb-4">Omni-Channel Radar</h3>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-lg">
              Our autonomous crawlers monitor Hacker News, Bluesky, YouTube, and the entire web simultaneously. We aggregate the noise so you only see the signal.
            </p>
          </div>

          {/* Secondary Feature 1 */}
          <div className="glass rounded-[2rem] p-8 md:p-10 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <ShieldCheck className="w-12 h-12 text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            <h3 className="text-2xl font-display font-bold mb-3">Dual-AI Verification</h3>
            <p className="text-neutral-400 leading-relaxed">
              Every article is brutally verified by Gemini Flash and Llama-3-70b to eliminate hallucination, clickbait, and PR fluff.
            </p>
          </div>

          {/* Secondary Feature 2 */}
          <div className="glass rounded-[2rem] p-8 md:p-10 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all md:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Code2 className="w-12 h-12 text-purple-400 mb-6 drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]" />
            <h3 className="text-2xl font-display font-bold mb-3">Code Hunting</h3>
            <p className="text-neutral-400 leading-relaxed">
              We extract raw open-source GitHub repositories directly from tech announcements and visualize them in your terminal.
            </p>
          </div>
        </section>

        {/* Trusted By Banner */}
        <section className="mt-32 border-y border-white/10 py-12 text-center bg-white/5 backdrop-blur-sm -mx-6 px-6">
          <p className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-8">
            Trusted by Elite Developers At
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {['Vercel', 'Stripe', 'OpenAI', 'Linear', 'Supabase'].map((company) => (
              <span key={company} className="text-2xl font-display font-bold text-white tracking-tight">
                {company}
              </span>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-black tracking-tighter mb-4">
              How Radar Works
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              A fully autonomous pipeline that runs 24/7, processing thousands of raw signals into high-value intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2 z-0" />
            
            {[
              {
                step: '01',
                title: 'Data Ingestion',
                desc: 'Agents aggressively scrape Hacker News, RSS feeds, and social platforms every 90 minutes.',
                icon: <Network className="w-6 h-6 text-blue-400" />
              },
              {
                step: '02',
                title: 'AI Verification',
                desc: 'Dual-model consensus filters out noise, assigns Trust & Hype scores, and writes brief summaries.',
                icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />
              },
              {
                step: '03',
                title: 'Omni-Channel Delivery',
                desc: 'Intelligence is routed to Discord, Telegram, and this dashboard instantly.',
                icon: <Zap className="w-6 h-6 text-purple-400" />
              }
            ].map((item, i) => (
              <div key={i} className="relative z-10 glass rounded-3xl p-8 border border-white/10 text-center flex flex-col items-center group hover:-translate-y-2 transition-transform duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-5xl font-black font-display text-white/5 pointer-events-none select-none">
                  {item.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-shadow">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold font-display mb-2">{item.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 font-display font-black text-xl tracking-tight text-white/50">
            <Logo className="h-6 w-auto opacity-50" />
            Radar
          </div>
          <div className="text-neutral-600 text-sm font-medium">
            © 2026 Radar Intelligence. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
