"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

const heroImages = [
  {
    className: "",
    src: "/ChatGPT Image Apr 19, 2026, 10_55_45 PM.png",
  },
  {
    className: "translate-y-4 md:translate-y-6",
    src: "/ChatGPT Image Apr 19, 2026, 11_55_58 PM.png",
  },
  {
    className: "translate-y-4 md:translate-y-6",
    src: "/ChatGPT Image Apr 20, 2026, 12_14_02 AM.png",
  },
  {
    className: "translate-y-4 md:translate-y-6",
    src: "/ChatGPT Image Apr 20, 2026, 12_53_03 AM.png",
  },
  {
    className: "translate-y-4 md:translate-y-6",
    src: "/ChatGPT Image Apr 20, 2026, 03_20_29 AM.png",
  },
]

const heroImageClassName =
  "absolute left-1/2 top-10 h-[620px] w-auto max-w-none -translate-x-1/2 object-contain md:top-14 md:h-[1040px]"

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1)
}

function getActiveImageIndex(progress: number) {
  if (progress > 0.48) {
    return 4
  }

  if (progress > 0.36) {
    return 3
  }

  if (progress > 0.24) {
    return 2
  }

  if (progress > 0.12) {
    return 1
  }

  return 0
}

type SiteHeroProps = {
  adminMode?: boolean
  adminEmail?: string
}

export function SiteHero({
  adminMode = false,
  adminEmail,
}: SiteHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    let animationFrame = 0

    const updateActiveImage = () => {
      const hero = heroRef.current

      if (!hero) {
        return
      }

      const rect = hero.getBoundingClientRect()
      const scrollDistance = Math.max(rect.height - window.innerHeight * 0.35, 1)
      const progress = clamp(-rect.top / scrollDistance)

      setActiveImageIndex(getActiveImageIndex(progress))
    }

    const requestUpdate = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(updateActiveImage)
    }

    updateActiveImage()
    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)
    }
  }, [])

  return (
    <div
      ref={heroRef}
      className="relative min-h-[680px] overflow-hidden bg-[#f4eee7] md:min-h-[1120px]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-repeat"
        style={{
          backgroundImage:
            'url("/ChatGPT Image Apr 20, 2026, 01_17_00 AM.png")',
          backgroundPosition: "center top",
          backgroundSize: "960px auto",
        }}
      />
      {heroImages.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt=""
          width={1024}
          height={1536}
          priority={index === 0}
          aria-hidden="true"
          className={`${heroImageClassName} ${image.className}`}
          style={{ opacity: activeImageIndex === index ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#f4eee7]/30" />

      <div className="relative z-10 px-6 pt-12 md:px-10 md:pt-16 lg:px-16">
        <h1 className="[font-family:Baloo] text-[clamp(4rem,22vw,20rem)] font-light italic leading-[0.78] text-stone-800">
          Capsi
        </h1>
        <p className="ml-5 mt-4 max-w-[38rem] [font-family:PoppinsMedium] text-3xl font-bold leading-tight text-stone-800 md:ml-10 md:mt-6 md:text-5xl">
          Handmade scrub caps,
          <br />
          made with <em>care.</em>
        </p>

        {adminMode ? (
          <p className="mt-4 max-w-xl bg-[#f4eee7]/80 px-4 py-3 text-sm leading-7 text-stone-700 backdrop-blur-sm">
            Signed in as {adminEmail}. Edit cards inline, drag them into a new
            order, and add or remove designs without leaving the page.
          </p>
        ) : null}
      </div>
    </div>
  )
}
