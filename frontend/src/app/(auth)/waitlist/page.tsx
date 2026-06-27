import Logo from '@/app/components/Logo'
import Link from 'next/link'
import { ShieldAlert, Clock, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function WaitlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (user.email === 'leocarnivas@gmail.com') {
    redirect('/dashboard')
  }

  // Double check if they are already approved
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('status, role')
    .eq('id', user.id)
    .single()

  if (profile?.status === 'approved' || profile?.role === 'admin') {
    redirect('/dashboard')
  }

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Abstract Glowing Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[120px] rounded-full mix-blend-screen animate-pulse-slow ${
          profile?.status === 'rejected' ? 'bg-red-600/10' : 
          profile?.status === 'under_review' ? 'bg-blue-600/10' : 'bg-orange-600/10'
        }`} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 font-display font-black text-3xl tracking-tight text-white mb-6">
            <Logo className={`h-10 w-auto drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] ${
              profile?.status === 'rejected' ? 'drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 
              profile?.status === 'under_review' ? 'drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''
            }`} />
            Radar
          </Link>
        </div>

        <div className="glass rounded-[2rem] p-8 sm:p-12 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl bg-black/40 text-center">
          <div className={`w-20 h-20 rounded-full border flex items-center justify-center mx-auto mb-6 ${
            profile?.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            profile?.status === 'under_review' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
            'bg-orange-500/10 border-orange-500/20 text-orange-400'
          }`}>
            {profile?.status === 'rejected' ? <ShieldAlert className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
          </div>
          
          <h1 className="text-3xl font-display font-bold text-neutral-100 mb-4">
            {profile?.status === 'rejected' ? 'Access Denied' : 
             profile?.status === 'under_review' ? 'Under Review' : 'Clearance Pending'}
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed mb-8">
            Your terminal identity (<span className="text-white font-mono">{user.email}</span>) has been securely logged. 
            {profile?.status === 'rejected' ? ' Your request for access has been denied by the administrator.' : 
             profile?.status === 'under_review' ? ' Your request is currently being reviewed by an administrator. Please check back shortly.' :
             ' Access to the Omni-Channel Radar requires manual approval from the system administrator.'}
          </p>

          {profile?.status !== 'rejected' && (
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 text-left mb-8">
              <ShieldAlert className="w-6 h-6 text-neutral-400 shrink-0 mt-0.5" />
              <p className="text-sm text-neutral-300">
                You will be notified via email once your clearance level is upgraded. Attempting to bypass this lock will trigger a telemetry alert.
              </p>
            </div>
          )}

          <form action={signOut}>
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mx-auto w-full">
              <LogOut className="w-4 h-4" /> Terminate Session
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
