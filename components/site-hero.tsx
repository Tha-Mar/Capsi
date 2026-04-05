import type { CatalogDesign } from "@/lib/design-shared"

type SiteHeroProps = {
  featuredDesign?: CatalogDesign
  adminMode?: boolean
  adminEmail?: string
}

export function SiteHero({
  featuredDesign,
  adminMode = false,
  adminEmail,
}: SiteHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,251,247,0.96),rgba(252,238,232,0.92))] shadow-[0_30px_80px_rgba(120,84,62,0.14)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(251,191,36,0.18),transparent_24%),radial-gradient(circle_at_70%_75%,rgba(244,114,182,0.14),transparent_26%)]" />
      <div className="relative grid gap-10 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-12">
        <div className="flex flex-col justify-center gap-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-stone-50">
                Capsi Studio
              </span>
              <span className="rounded-full border border-rose-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-rose-700">
                Handmade Scrub Hats
              </span>
              {adminMode ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                  Admin View
                </span>
              ) : null}
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl font-[family:var(--font-display)] text-5xl leading-[0.92] text-stone-950 md:text-7xl">
                Scrub hats that feel practical,
                <span className="block text-rose-700">personal, and well made.</span>
              </h1>
              <p className="max-w-xl text-base leading-8 text-stone-700 md:text-lg">
                Handmade custom scrub hats in playful prints and easy everyday
                fabrics, designed to bring comfort, personality, and a polished
                finishing touch to long shifts.
              </p>
              {adminMode ? (
                <p className="max-w-xl text-sm leading-7 text-stone-600">
                  Signed in as {adminEmail}. Edit cards inline, drag them into a
                  new order, and add or remove designs without leaving the page.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="relative min-h-[520px]">
          <div className="absolute -right-8 top-8 h-36 w-36 rounded-full bg-amber-200/60 blur-3xl" />
          <div className="absolute left-6 top-0 h-40 w-40 rounded-full bg-rose-200/60 blur-3xl" />
          <div className="relative h-full">
            <div className="rounded-[2rem] border border-white/70 bg-white/35 p-4 shadow-[0_16px_40px_rgba(120,84,62,0.12)]">
              <div
                className="min-h-[520px] rounded-[1.6rem] bg-[#f7e6ee] bg-cover bg-center"
                style={
                  featuredDesign?.imageUrl
                    ? { backgroundImage: `url("${featuredDesign.imageUrl}")` }
                    : featuredDesign?.previewStyle
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
