import { createBrowserClient } from "@supabase/ssr"

function validateEnvVars() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  
  if (!anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  
  return { url, anonKey }
}

export function createClient() {
  const { url, anonKey } = validateEnvVars()
  return createBrowserClient(url, anonKey)
}
