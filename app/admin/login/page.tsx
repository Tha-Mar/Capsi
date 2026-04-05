import Link from "next/link"
import { redirect } from "next/navigation"

import { signInAction } from "@/app/admin/actions"
import { getSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams
  const env = getSupabaseEnv()

  if (env.isConfigured) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect("/admin")
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-10 text-stone-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link href="/" className="text-sm font-semibold text-rose-700">
          Back to site
        </Link>
        <div className="grid overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_20px_60px_rgba(120,84,62,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-stone-950 px-8 py-10 text-stone-50">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
              Admin Access
            </p>
            <h1 className="mt-4 font-[family:var(--font-display)] text-5xl leading-none">
              Manage designs, details, and future product photos.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-stone-300">
              This is the private editing area for the catalog. Once Supabase is
              connected, your mom can sign in here to add, update, or remove
              designs from the public site.
            </p>
          </div>

          <div className="px-8 py-10">
            {!env.isConfigured ? (
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-stone-700">
                Add `NEXT_PUBLIC_SUPABASE_URL` and
                `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in
                `/Users/usid/Documents/websites/Capsi/.env.local` to
                enable login.
              </div>
            ) : (
              <form action={signInAction} className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-rose-300"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-rose-300"
                  />
                </div>
                {params.error ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {params.error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  Sign in
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
