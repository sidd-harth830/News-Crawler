import { login, signup } from './actions'
import Logo from '@/app/components/Logo'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Abstract Glowing Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-400/10 blur-[80px] rounded-full mix-blend-screen" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-3 font-display font-black text-3xl tracking-tight text-white mb-6">
            <Logo className="h-10 w-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
            Radar
          </a>
          <h1 className="text-2xl font-bold text-neutral-100">Welcome to the Nexus</h1>
          <p className="text-neutral-400 mt-2">Initialize your intelligence feed.</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10 shadow-2xl shadow-black/50">
          <form className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2" htmlFor="email">
                Secure Terminal ID (Email)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-neutral-600"
                placeholder="agent@omni.channel"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2" htmlFor="password">
                Access Code
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-neutral-600"
                placeholder="••••••••"
              />
            </div>

            {params?.message && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium">
                {params.message}
              </div>
            )}

            <div className="flex flex-col gap-3 mt-4">
              <button
                formAction={login}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
              >
                Authenticate
              </button>
              <button
                formAction={signup}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 font-bold rounded-xl transition-all"
              >
                Request Clearance (Sign Up)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
