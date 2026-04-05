import { DesignLibrary } from "@/components/design-library"
import { SiteHero } from "@/components/site-hero"
import { getCatalogDesigns } from "@/lib/designs"

export default async function Page() {
  const designs = await getCatalogDesigns()
  const featuredDesign = designs.find((design) => design.isFeatured) ?? designs[0]

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(255,248,243,0.85)_38%,_rgba(244,232,224,0.82)_100%)] text-stone-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-10 md:px-10 lg:px-12">
        <SiteHero featuredDesign={featuredDesign} />

        <DesignLibrary designs={designs} />
      </section>
    </main>
  )
}
