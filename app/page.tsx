import { AboutCapsi } from "@/components/about-capsi"
import { DesignLibrary } from "@/components/design-library"
import { SiteHero } from "@/components/site-hero"
import { getCatalogDesigns, getDesignCategories } from "@/lib/designs"
import { getSiteContent } from "@/lib/site-content"

export default async function Page() {
  const designs = await getCatalogDesigns()
  const categories = await getDesignCategories()
  const content = await getSiteContent()

  return (
    <main className="min-h-screen bg-[#f4eee7] text-stone-900">
      <SiteHero content={content} />

      <section className="relative z-20 -mt-[130px] bg-[#f8f3ee] px-6 pt-12 shadow-[0_-30px_70px_rgba(69,52,43,0.12)] md:-mt-[180px] md:px-10 md:pt-18 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <AboutCapsi content={content} />
        </div>
      </section>

      <section className="relative z-30 bg-[#f6e7e4] px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <DesignLibrary designs={designs} categories={categories} />
        </div>
      </section>
    </main>
  )
}
