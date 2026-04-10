"use client"

import { useMemo, useState } from "react"

import type { CatalogDesign } from "@/lib/design-shared"

type DesignLibraryProps = {
  designs: CatalogDesign[]
  categories: string[]
}

export function DesignLibrary({ designs, categories }: DesignLibraryProps) {
  const allCategories = useMemo(() => ["All", ...categories] as const, [categories])

  const [activeCategory, setActiveCategory] = useState<(typeof allCategories)[number]>(
    "All",
  )

  const filteredDesigns =
    activeCategory === "All"
      ? designs
      : designs.filter((design) => design.category === activeCategory)

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <h2 className="font-[family:var(--font-display)] text-4xl text-stone-900">
          Design Library
        </h2>
        <div className="flex flex-wrap gap-3">
          {allCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={
                activeCategory === category
                  ? "rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
                  : "rounded-full border border-stone-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50"
              }
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredDesigns.map((design) => (
          <a
            key={design.id}
            href={`sms:16308186681?body=${encodeURIComponent(
              `Hi, I'm interested in ${design.collection} - ${design.name}.`,
            )}`}
            className="group block overflow-hidden rounded-[1.5rem] border border-stone-200/80 bg-white/85 shadow-[0_18px_45px_rgba(120,84,62,0.08)] transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {design.imageUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url("${design.imageUrl}")` }}
                />
              ) : (
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                  style={design.previewStyle}
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/55 to-transparent px-5 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-100/90">
                  {design.collection}
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  {design.name}
                </h3>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid gap-3 rounded-[1.25rem] bg-stone-50 p-4 text-sm leading-6 text-stone-700">
                {design.about ? (
                  <p>
                    <span className="font-semibold text-stone-900">About:</span>{" "}
                    {design.about}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                  {design.category}
                </span>
                <p className="text-right text-sm text-stone-600">Tap to text</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
