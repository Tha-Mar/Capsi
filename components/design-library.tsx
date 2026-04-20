"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"

import type { CatalogDesign } from "@/lib/design-shared"

type GuideMotionState = "before" | "visible" | "after"

type DesignLibraryProps = {
  designs: CatalogDesign[]
  categories: string[]
}

export function DesignLibrary({ designs, categories }: DesignLibraryProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const allCategories = useMemo(() => ["All", ...categories] as const, [categories])
  const hasDismissedRef = useRef(false)

  const [activeCategory, setActiveCategory] = useState<(typeof allCategories)[number]>(
    "All",
  )
  const [guideMotionState, setGuideMotionState] =
    useState<GuideMotionState>("before")

  const filteredDesigns =
    activeCategory === "All"
      ? designs
      : designs.filter((design) => design.category === activeCategory)

  useEffect(() => {
    let animationFrame = 0

    const updateGuideMotionState = () => {
      const section = sectionRef.current

      if (!section) {
        return
      }

      // Once dismissed, freeze state permanently until page refresh
      if (hasDismissedRef.current) {
        return
      }

      const rect = section.getBoundingClientRect()
      const viewportHeight = window.innerHeight

      if (rect.top > viewportHeight * 0.78) {
        setGuideMotionState("before")
        return
      }

      // Dismiss after the user has scrolled well into the section
      if (rect.top < -viewportHeight * 0.2) {
        hasDismissedRef.current = true
        setGuideMotionState("after")
        return
      }

      setGuideMotionState("visible")
    }

    const requestUpdate = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(updateGuideMotionState)
    }

    updateGuideMotionState()
    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)
    }
  }, [])

  return (
    <section ref={sectionRef} className="space-y-6">
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <div
          className={`design-guide-bubble-shape absolute bottom-[10.5rem] right-[5.5rem] z-20 w-[190px] opacity-0 md:bottom-[16.5rem] md:right-[12rem] md:w-[260px] ${
            guideMotionState === "visible" ? "design-guide-bubble-in" : ""
          } ${guideMotionState === "after" ? "design-guide-bubble-out" : ""}`}
        >
          <p className="relative z-10 text-center [font-family:PoppinsMedium] text-sm font-medium leading-tight text-stone-800 md:text-lg">
            Tap a design you love, then text me to order!
          </p>
          <span className="design-guide-bubble-tail" aria-hidden="true" />
        </div>

        <Image
          src="/upscaled_4x.png"
          alt=""
          width={1632}
          height={2448}
          aria-hidden="true"
          className={`absolute bottom-[-0.5rem] right-[0.5rem] z-10 h-[240px] w-auto max-w-none opacity-0 md:bottom-[-0.25rem] md:right-[1.5rem] md:h-[380px] ${
            guideMotionState === "visible" ? "design-guide-character-in" : ""
          } ${guideMotionState === "after" ? "design-guide-character-out" : ""}`}
        />
      </div>

      <div className="sticky top-4 z-30 space-y-4 rounded-2xl border border-white/70 bg-[#fff7ef]/95 px-5 py-5 shadow-[0_18px_38px_rgba(120,64,64,0.1)] backdrop-blur-md md:px-7">
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
