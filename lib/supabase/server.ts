import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { getSupabaseEnv } from "@/lib/supabase/env"

export async function createClient() {
  const cookieStore = await cookies()
  const env = getSupabaseEnv()

  if (!env.url || !env.publishableKey) {
    throw new Error("Supabase environment variables are missing.")
  }

  return createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {}
      },
    },
  })
}
