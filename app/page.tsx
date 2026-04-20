import { DesignLibrary } from "@/components/design-library"
import { SiteHero } from "@/components/site-hero"
import { getCatalogDesigns, getDesignCategories } from "@/lib/designs"

export default async function Page() {
  const designs = await getCatalogDesigns()
  const categories = await getDesignCategories()

  return (
    <main className="min-h-screen bg-[#f4eee7] text-stone-900">
      <SiteHero />

      <section className="relative z-20 -mt-[360px] bg-[#f8f3ee] px-6 pb-16 pt-12 shadow-[0_-30px_70px_rgba(69,52,43,0.12)] md:-mt-[430px] md:px-10 md:pt-16 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <DesignLibrary designs={designs} categories={categories} />
        </div>
      </section>
    </main>
  )
}
