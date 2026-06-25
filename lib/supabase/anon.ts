import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import { getSupabaseEnv } from "@/lib/supabase/env"

/**
 * Lightweight anonymous Supabase client for public, read-only data (the catalog
 * and site content). It does not touch cookies or auth, so pages that use it
 * stay cacheable and never depend on a signed-in session. Returns null when
 * Supabase is not configured so callers can fall back to the local catalog.
 */
export function createAnonClient() {
  const env = getSupabaseEnv()

  if (!env.url || !env.publishableKey) {
    return null
  }

  return createSupabaseClient(env.url, env.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
