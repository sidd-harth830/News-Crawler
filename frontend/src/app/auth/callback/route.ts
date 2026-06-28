import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  // Extract the URL parameters
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // If a custom redirect path was provided, use it. Otherwise, default to /dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Securely exchange the OAuth code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful login, redirect to the dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error("Auth Callback Error:", error.message)
  }

  // If there is an error or missing code, redirect back to the login page
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
