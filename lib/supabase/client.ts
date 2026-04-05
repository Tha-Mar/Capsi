import { createBrowserClient } from "@supabase/ssr"

import { getSupabaseEnv } from "@/lib/supabase/env"

export function createClient() {
  const env = getSupabaseEnv()

  if (!env.url || !env.publishableKey) {
    throw new Error("Supabase environment variables are missing.")
  }

  return createBrowserClient(env.url, env.publishableKey)
}
