import { createClient } from "@supabase/supabase-js"

// Static generation için cookies kullanmayan Supabase client
export function createStaticClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
}
