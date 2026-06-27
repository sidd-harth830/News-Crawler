import Logo from '@/app/components/Logo'
import GoogleLoginButton from './GoogleLoginButton'

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
          <a href="/" className="inline-flex items-center gap-4 font-display font-black text-4xl tracking-tight text-white mb-8 transition-transform hover:scale-105">
            <Logo className="h-16 w-auto drop-shadow-[0_0_25px_rgba(34,211,238,0.6)]" />
            Radar
          </a>
          <h1 className="text-3xl font-display font-bold text-neutral-100">Welcome to the Radar</h1>
          <p className="text-neutral-400 mt-3 text-lg">Initialize your intelligence feed.</p>
        </div>

        <div className="glass rounded-[2rem] p-8 sm:p-10 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl bg-black/40 text-center">
          <div className="mb-6">
            <p className="text-neutral-300 font-medium">Terminal access is strictly regulated. Please authenticate with your organization's Google account to request clearance.</p>
          </div>
          <GoogleLoginButton />

          {params?.message && (
            <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
              {params.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
