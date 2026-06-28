import Logo from '@/app/components/Logo'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Radar, Code2, Sparkles, Zap, Lock, Network, Database } from 'lucide-react'
import ThemeToggle from '@/app/components/ThemeToggle'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0B0E14] text-slate-600 dark:text-slate-400 overflow-hidden relative transition-colors duration-500 selection:bg-emerald-500/30">
      
      {/* Global Background & Atmospheric Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Emerald Glow */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow" />
        {/* Cyan Glow */}
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full mix-blend-screen" />
        {/* Deep Blue Glow */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen opacity-50" />
      </div>

      {/* Subtle Grid Pattern for extra texture */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-[0.03]" />

      {/* Floating Glassmorphism Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-5xl">
        <div className="flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-2xl shadow-lg dark:shadow-2xl transition-colors duration-500">
          <div className="flex items-center gap-3 font-display font-black text-2xl tracking-tight text-slate-900 dark:text-white transition-colors duration-500">
            <Logo className="h-8 w-auto text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            Radar
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-sm font-semibold">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Terminal Access
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all backdrop-blur-md flex items-center gap-2 group"
            >
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-24">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/[0.08] backdrop-blur-xl text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-8 transition-colors duration-500">
            <Sparkles className="w-4 h-4" /> The Future of Intelligence is Here
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter leading-[1.05] text-slate-900 dark:text-white mb-6 max-w-5xl transition-colors duration-500">
            Accelerate your <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 dark:from-emerald-400 dark:via-cyan-400 dark:to-blue-500">
              Information Velocity
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12 font-medium leading-relaxed transition-colors duration-500">
            Omni-Channel Tech Radar is an autonomous intelligence pipeline. We aggressively crawl, use AI to verify data, and route curated insights directly to your Command Center.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-[#0B0E14] font-bold text-lg hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors flex justify-center items-center gap-2 shadow-xl dark:shadow-none"
            >
              Initialize Radar
            </Link>
            <Link 
              href="#architecture" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border border-black/5 dark:border-white/[0.08] text-slate-900 dark:text-white font-bold text-lg hover:border-black/10 dark:hover:border-white/20 hover:bg-white/80 dark:hover:bg-white/[0.05] transition-all flex justify-center items-center shadow-md dark:shadow-none"
            >
              Explore Architecture
            </Link>
          </div>
        </section>

        {/* Social Proof / Integrations Marquee */}
        <section className="mb-40 pt-10 border-t border-black/5 dark:border-white/[0.05] transition-colors duration-500">
          <p className="text-center text-sm font-bold tracking-widest uppercase text-slate-500 mb-8">Seamlessly Integrated With</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">GitHub</h3>
            <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">Discord</h3>
            <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">Telegram</h3>
            <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">Gemini AI</h3>
            <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">Supabase</h3>
            <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">Next.js</h3>
          </div>
        </section>

        {/* Alternating Feature Flow */}
        <section id="architecture" className="flex flex-col gap-32 mb-40">
          
          {/* Row 1: Text Left, Mockup Right */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                <Radar className="w-6 h-6" />
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white leading-tight transition-colors duration-500">
                Autonomous <span className="text-emerald-500 dark:text-emerald-400">Telemetry</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-500">
                Our ingestion engine aggressively sweeps the web using serverless cron jobs. We pull high-density data from RSS feeds, repositories, and video channels before they hit the mainstream algorithms.
              </p>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-square md:aspect-[4/3] w-full bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-3xl overflow-hidden relative group hover:border-black/10 dark:hover:border-white/20 transition-all duration-500 hover:-translate-y-2 p-8 shadow-2xl dark:shadow-2xl">
                {/* Mockup UI Inside Glass */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50" />
                <div className="w-full h-full border border-black/5 dark:border-white/[0.05] rounded-xl bg-white/80 dark:bg-[#0B0E14]/80 flex flex-col p-4 gap-4 relative z-10 shadow-xl dark:shadow-2xl transition-colors duration-500">
                  <div className="w-3/4 h-6 bg-slate-200 dark:bg-white/10 rounded-md animate-pulse" />
                  <div className="w-full h-24 bg-slate-100 dark:bg-white/5 rounded-md transition-colors" />
                  <div className="w-5/6 h-24 bg-slate-100 dark:bg-white/5 rounded-md transition-colors" />
                  <div className="w-full h-24 bg-slate-100 dark:bg-white/5 rounded-md transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Mockup Left, Text Right */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-6">
                <Code2 className="w-6 h-6" />
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white leading-tight transition-colors duration-500">
                AI <span className="text-cyan-500 dark:text-cyan-400">Verification</span> Engine
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-500">
                We pipe raw markdown directly into Google Gemini. It strips out clickbait, generates concise executive summaries, and assigns mathematical Trust and Hype scores to every single article.
              </p>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-square md:aspect-[4/3] w-full bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-3xl overflow-hidden relative group hover:border-black/10 dark:hover:border-white/20 transition-all duration-500 hover:-translate-y-2 p-8 shadow-2xl dark:shadow-2xl">
                {/* Mockup UI Inside Glass */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-50" />
                <div className="w-full h-full border border-black/5 dark:border-white/[0.05] rounded-xl bg-white/80 dark:bg-[#0B0E14]/80 flex flex-col p-4 gap-4 relative z-10 shadow-xl dark:shadow-2xl transition-colors duration-500">
                  <div className="flex gap-4">
                    <div className="w-1/2 h-32 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-md border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center font-display font-bold text-emerald-600 dark:text-emerald-400 text-2xl transition-colors">95 Trust</div>
                    <div className="w-1/2 h-32 bg-orange-500/10 dark:bg-orange-500/20 rounded-md border border-orange-500/20 dark:border-orange-500/30 flex items-center justify-center font-display font-bold text-orange-600 dark:text-orange-400 text-2xl transition-colors">82 Hype</div>
                  </div>
                  <div className="w-full flex-1 bg-slate-100 dark:bg-white/5 rounded-md mt-4 transition-colors" />
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Bento Grid Features */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-4 transition-colors duration-500">Complete Command Center</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto transition-colors duration-500">Everything you need to orchestrate your intelligence feed, built with obsessive attention to detail.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-3xl p-8 hover:border-black/10 dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group shadow-xl dark:shadow-none">
              <Network className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3 transition-colors">Multi-Channel Routing</h3>
              <p className="text-slate-600 dark:text-slate-400 transition-colors">Payloads are instantly routed. Webhooks push data to categorized Discord channels, while Telegram broadcasts alert you directly on your phone.</p>
            </div>

            <div className="bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-3xl p-8 hover:border-black/10 dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group shadow-xl dark:shadow-none">
              <Lock className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3 transition-colors">Secure State</h3>
              <p className="text-slate-600 dark:text-slate-400 transition-colors">Backed by Supabase RLS, your Read/Unread state is cryptographically locked to your profile.</p>
            </div>

            <div className="bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-3xl p-8 hover:border-black/10 dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group shadow-xl dark:shadow-none">
              <Database className="w-8 h-8 text-blue-500 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3 transition-colors">The Vault</h3>
              <p className="text-slate-600 dark:text-slate-400 transition-colors">Every piece of intelligence is permanently archived and instantly searchable in your database.</p>
            </div>

            <div className="md:col-span-2 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border border-black/5 dark:border-white/[0.08] rounded-3xl p-8 hover:border-black/10 dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group shadow-xl dark:shadow-none">
              <Zap className="w-8 h-8 text-amber-500 dark:text-amber-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3 transition-colors">Optimistic UI Engine</h3>
              <p className="text-slate-600 dark:text-slate-400 transition-colors">Built entirely on Next.js Server Actions and optimistic UI patterns. When you interact with the feed, changes happen instantaneously with zero latency.</p>
            </div>

          </div>
        </section>

      </main>
    </div>
  )
}
