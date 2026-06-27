import Logo from '@/app/components/Logo'
import Link from 'next/link'
import { User, LogOut, Bookmark, Activity, Users } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ThemeToggle from '@/app/components/ThemeToggle'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let isAdmin = user.email === 'leocarnivas@gmail.com'
  let isApproved = isAdmin

  if (!isAdmin) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()
      
    if (profile?.status === 'approved') isApproved = true
    if (profile?.role === 'admin') isAdmin = true
  }

  if (!isApproved) {
    redirect('/waitlist')
  }

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-slate-800 dark:text-white selection:bg-blue-500/30 transition-colors duration-300">
      <nav className="fixed top-0 left-0 right-0 z-[60] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-stone-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="font-display font-black text-2xl tracking-tight text-slate-900 dark:text-white flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo className="h-8 w-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
            Radar
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-500 dark:text-neutral-400">
              <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">Feed</Link>
              <Link href="/social" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Social Hub</Link>
              <Link href="/analytics" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Analytics</Link>
              <Link href="/audit" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Audit Hub</Link>
              <Link href="/vault" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5"><Bookmark className="w-4 h-4" /> Vault</Link>
              
              {isAdmin && (
                <Link href="/admin" className="hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 ml-4 border-l border-stone-200 dark:border-white/10 pl-4"><Users className="w-4 h-4" /> User Requests</Link>
              )}
            </div>
            
            {/* User Profile / Sign Out */}
            <div className="flex items-center gap-4 border-l border-stone-200 dark:border-white/10 pl-6 ml-2">
              <Link href="/profile" className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-neutral-400 font-medium hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                <User className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{user?.email}</span>
              </Link>
              <ThemeToggle />
              <form action={signOut}>
                <button className="p-2 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-300 transition-colors" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="pt-16 max-w-screen-2xl mx-auto">
        {children}
      </main>
    </div>
  )
}
