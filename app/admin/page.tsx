import Link from "next/link"
import { redirect } from "next/navigation"

import { signOutAction } from "@/app/admin/actions"
import { AdminCatalogManager } from "@/components/admin-catalog-manager"
import { SiteHero } from "@/components/site-hero"
import { getAdminDesigns, getDesignCategories } from "@/lib/designs"
import { getSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

type AdminPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams
  const env = getSupabaseEnv()

  if (!env.isConfigured) {
    redirect("/admin/login")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const designs = await getAdminDesigns()
  const categories = await getDesignCategories()
  const featuredDesign = designs.find((design) => design.isFeatured) ?? designs[0]

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(255,248,243,0.85)_38%,_rgba(244,232,224,0.82)_100%)] text-stone-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:px-10 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-stone-200 bg-white/80 px-5 py-4 shadow-[0_14px_34px_rgba(120,84,62,0.06)]">
          <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600">
            <Link href="/" className="font-semibold text-rose-700">
              View public site
            </Link>
            <span>Signed in as {user.email}</span>
            {params.success ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                Design {params.success}
              </span>
            ) : null}
            {params.error ? (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">
                {params.error}
              </span>
            ) : null}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Sign out
            </button>
          </form>
        </div>

        <SiteHero
          featuredDesign={featuredDesign}
          adminMode
          adminEmail={user.email ?? undefined}
        />

        <AdminCatalogManager designs={designs} categories={categories} />
      </section>
    </main>
  )
}
