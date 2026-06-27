import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { CheckCircle, Clock, ShieldAlert, UserCheck, Mail } from 'lucide-react'

// Server Action to update a user's status
async function updateUserStatus(formData: FormData) {
  'use server'
  const userId = formData.get('userId') as string
  const newStatus = formData.get('status') as string
  const userEmail = formData.get('userEmail') as string
  
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_profiles')
    .update({ status: newStatus })
    .eq('id', userId)

  if (!error) {
    // Phase 20.3: Mock Email Notification Logic
    if (newStatus === 'approved') {
      console.log(`[EMAIL DISPATCH] Sending APPROVAL email to ${userEmail}...`)
      console.log(`SUBJECT: Terminal Access Granted`)
      console.log(`BODY: Your identity has been verified. Welcome to the Omni-Channel Radar.`)
    } else if (newStatus === 'rejected') {
      console.log(`[EMAIL DISPATCH] Sending REJECTION email to ${userEmail}...`)
    } else if (newStatus === 'under_review') {
      console.log(`[EMAIL DISPATCH] Sending UPDATE email to ${userEmail}...`)
    }

    revalidatePath('/dashboard/admin')
  }
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let isAdmin = user.email === 'leocarnivas@gmail.com'

  if (!isAdmin) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') isAdmin = true
  }

  if (!isAdmin) {
    redirect('/dashboard')
  }

  // Fetch all non-admin users
  const { data: users } = await supabase
    .from('user_profiles')
    .select('*')
    .neq('role', 'admin')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-white mb-3 font-display flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-emerald-400" />
          Terminal Access Control
        </h1>
        <p className="text-neutral-400 text-lg">
          Manage access clearance for all registered terminal identities.
        </p>
      </header>

      <div className="glass rounded-3xl border border-white/10 overflow-hidden bg-black/20 backdrop-blur-xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            Identity Roster
          </h2>
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-bold border border-indigo-500/30">
            {users?.length || 0} Registered
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {!users || users.length === 0 ? (
            <div className="p-12 text-center">
              <UserCheck className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400 text-lg">No identities registered in the system.</p>
            </div>
          ) : (
            users.map(request => (
              <div key={request.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div>
                  <h3 className="text-lg font-mono font-bold text-white">{request.email}</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    Joined: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <form action={updateUserStatus} className="flex items-center gap-3">
                  <input type="hidden" name="userId" value={request.id} />
                  <input type="hidden" name="userEmail" value={request.email} />
                  
                  <select 
                    name="status" 
                    defaultValue={request.status}
                    className="bg-black/50 border border-white/10 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-semibold"
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved (Active)</option>
                    <option value="rejected">Rejected (Locked)</option>
                  </select>

                  <button type="submit" className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg font-bold transition-all text-sm">
                    Update
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}