import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

export function isSupabaseConfigured(): boolean {
  return (
    !!supabaseUrl &&
    !!supabaseKey &&
    supabaseUrl !== 'your_url' &&
    supabaseKey !== 'your_anon_key' &&
    supabaseUrl.startsWith('http')
  )
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase не настроен. Добавьте реальные значения в .env.local')
  }
  return createBrowserClient(supabaseUrl, supabaseKey)
}
