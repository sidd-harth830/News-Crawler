import { createClient } from '@/utils/supabase/server';
import { User, Mail, Calendar, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = user.user_metadata?.full_name || 'Anonymous User';
  const provider = user.app_metadata?.provider || 'Email';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black font-display tracking-tight mb-8">User Profile</h1>
      
      <div className="glass rounded-[2rem] p-8 sm:p-12 border border-white/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          {avatarUrl ? (
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-xl shrink-0">
              <Image src={avatarUrl} alt={fullName} width={128} height={128} className="object-cover" />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-indigo-500/10 border-4 border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
              <User className="w-16 h-16" />
            </div>
          )}

          <div className="flex-1 space-y-6 text-center sm:text-left">
            <div>
              <h2 className="text-3xl font-bold font-display">{fullName}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 dark:text-neutral-400 mt-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-stone-200 dark:border-white/10">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-1 flex items-center justify-center sm:justify-start gap-1">
                  <Calendar className="w-3 h-3" /> Last Login
                </div>
                <div className="font-medium text-slate-700 dark:text-neutral-200">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-stone-200 dark:border-white/10">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-1 flex items-center justify-center sm:justify-start gap-1">
                  <ShieldCheck className="w-3 h-3" /> Auth Provider
                </div>
                <div className="font-medium text-slate-700 dark:text-neutral-200 flex items-center justify-center sm:justify-start gap-2">
                  {provider === 'google' ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  ) : null}
                  <span className="capitalize">{provider}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
