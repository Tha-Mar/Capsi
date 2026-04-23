"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

type ImageMotionState = "before" | "visible" | "after"

export function AboutCapsi() {
  const sectionRef = useRef<HTMLElement>(null)
  const [imageMotionState, setImageMotionState] =
    useState<ImageMotionState>("before")
  const [sectionProgress, setSectionProgress] = useState(0)

  useEffect(() => {
    let animationFrame = 0

    const updateImageMotionState = () => {
      const section = sectionRef.current

      if (!section) {
        return
      }

      const rect = section.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const slideStart = viewportHeight * 0.95
      const slideEnd = viewportHeight * 0.34
      const nextSectionProgress = Math.min(
        Math.max((slideStart - rect.top) / (slideStart - slideEnd), 0),
        1,
      )

      setSectionProgress(nextSectionProgress)

      if (rect.top > viewportHeight * 0.72) {
        setImageMotionState("before")
        return
      }

      if (rect.bottom < viewportHeight * 0.36) {
        setImageMotionState("after")
        return
      }

      setImageMotionState("visible")
    }

    const requestUpdate = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(updateImageMotionState)
    }

    updateImageMotionState()
    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[150vh] [font-family:PoppinsMedium]"
    >
      <div
        className="sticky top-0 grid min-h-screen content-center gap-8 py-14 md:grid-cols-[0.72fr_1.28fr] md:items-center md:gap-10 md:py-20"
        style={{
          opacity: 0.84 + sectionProgress * 0.16,
          transform: `translateY(${Math.round((1 - sectionProgress) * 120)}px)`,
        }}
      >
        <div className="relative min-h-[360px] overflow-hidden md:min-h-[520px]">
          <Image
            src="/ChatGPT Image Apr 20, 2026, 02_05_46 AM.png"
            alt=""
            width={1024}
            height={1536}
            aria-hidden="true"
            className={`absolute bottom-0 left-1/2 h-[340px] w-auto max-w-none object-contain opacity-0 md:h-[500px] ${
              imageMotionState === "visible" ? "capsi-about-image-in" : ""
            } ${imageMotionState === "after" ? "capsi-about-image-out" : ""}`}
          />
        </div>

        <div className="max-w-3xl">
          <p className="text-3xl font-bold text-stone-900 md:text-5xl">
            About Capsy
          </p>

          <div className="mt-6 space-y-5 text-lg font-medium leading-8 text-stone-700 md:text-xl md:leading-9">
            <p>
              I started making scrub caps for the doctors and nurses I know
              because I wanted them to have something comfortable, cheerful, and
              personal to wear through long shifts.
            </p>
            <p>
              Every cap is homemade in small batches, with fabrics picked for a
              little color, a little joy, and a fit that feels easy from the
              first patient to the last.
            </p>
            <p className="text-stone-900">
              Capsy is my way of sending a small bit of care back to the people
              who spend their days caring for everyone else.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
