import Link from "next/link"
import { redirect } from "next/navigation"

import {
  createDesignAction,
  deleteDesignAction,
  signOutAction,
  updateDesignAction,
} from "@/app/admin/actions"
import { getAdminDesigns } from "@/lib/designs"
import { getSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

const adminCategories = [
  "Popular",
  "Sports",
  "Floral",
  "Animals",
  "Seasonal",
  "Classic",
]

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

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-10 text-stone-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-stone-200 bg-white px-6 py-6 shadow-[0_20px_60px_rgba(120,84,62,0.08)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
              Admin Dashboard
            </p>
            <h1 className="mt-2 font-[family:var(--font-display)] text-4xl leading-none">
              Edit the live design catalog
            </h1>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Signed in as {user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700"
            >
              View site
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {params.error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {params.error}
          </p>
        ) : null}

        {params.success ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            Design {params.success}.
          </p>
        ) : null}

        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(120,84,62,0.08)]">
          <h2 className="font-[family:var(--font-display)] text-3xl leading-none">
            Add a new design
          </h2>
          <form action={createDesignAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              name="name"
              required
              placeholder="Design name"
              className="rounded-2xl border border-stone-200 px-4 py-3"
            />
            <input
              name="collection"
              required
              placeholder="Collection label"
              className="rounded-2xl border border-stone-200 px-4 py-3"
            />
            <select
              name="category"
              defaultValue="Popular"
              className="rounded-2xl border border-stone-200 px-4 py-3"
            >
              {adminCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              name="imageUrl"
              placeholder="Image URL"
              className="rounded-2xl border border-stone-200 px-4 py-3"
            />
            <input
              name="material"
              required
              placeholder="Material details"
              className="rounded-2xl border border-stone-200 px-4 py-3"
            />
            <input
              name="fit"
              required
              placeholder="Fit details"
              className="rounded-2xl border border-stone-200 px-4 py-3"
            />
            <input
              name="availability"
              required
              placeholder="Availability"
              className="rounded-2xl border border-stone-200 px-4 py-3"
            />
            <input
              name="description"
              placeholder="Optional description"
              className="rounded-2xl border border-stone-200 px-4 py-3"
            />
            <label className="flex items-center gap-3 text-sm font-semibold text-stone-700">
              <input type="checkbox" name="isFeatured" className="h-4 w-4" />
              Set as featured hero design
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white"
              >
                Add design
              </button>
            </div>
          </form>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {designs.map((design) => (
            <form
              key={design.id}
              action={updateDesignAction}
              className="grid gap-4 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(120,84,62,0.08)]"
            >
              <input type="hidden" name="id" value={design.id} />
              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                  Existing design
                </p>
                <h2 className="font-[family:var(--font-display)] text-3xl leading-none">
                  {design.name}
                </h2>
              </div>

              <input
                name="name"
                defaultValue={design.name}
                required
                className="rounded-2xl border border-stone-200 px-4 py-3"
              />
              <input
                name="collection"
                defaultValue={design.collection}
                required
                className="rounded-2xl border border-stone-200 px-4 py-3"
              />
              <select
                name="category"
                defaultValue={design.category}
                className="rounded-2xl border border-stone-200 px-4 py-3"
              >
                {adminCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                name="imageUrl"
                defaultValue={design.imageUrl}
                placeholder="Image URL"
                className="rounded-2xl border border-stone-200 px-4 py-3"
              />
              <input
                name="material"
                defaultValue={design.material}
                required
                className="rounded-2xl border border-stone-200 px-4 py-3"
              />
              <input
                name="fit"
                defaultValue={design.fit}
                required
                className="rounded-2xl border border-stone-200 px-4 py-3"
              />
              <input
                name="availability"
                defaultValue={design.availability}
                required
                className="rounded-2xl border border-stone-200 px-4 py-3"
              />
              <input
                name="description"
                defaultValue={design.description ?? ""}
                placeholder="Optional description"
                className="rounded-2xl border border-stone-200 px-4 py-3"
              />
              <div className="flex flex-wrap gap-5 text-sm font-semibold text-stone-700">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    defaultChecked={design.isFeatured}
                    className="h-4 w-4"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isVisible"
                    defaultChecked={design.isVisible}
                    className="h-4 w-4"
                  />
                  Visible on site
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white"
                >
                  Save changes
                </button>
                <button
                  type="submit"
                  formAction={deleteDesignAction}
                  className="rounded-full border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-700"
                >
                  Delete design
                </button>
              </div>
            </form>
          ))}
        </section>
      </div>
    </main>
  )
}
