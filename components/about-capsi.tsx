"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { EditableText } from "@/components/editable-text"

type ImageMotionState = "before" | "visible" | "after"

type AboutCapsiContent = {
  aboutTitle: string
  aboutBody: string
}

type AboutCapsiProps = {
  content: AboutCapsiContent
  adminMode?: boolean
}

export function AboutCapsi({ content, adminMode = false }: AboutCapsiProps) {
  const paragraphs = content.aboutBody
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
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
      className={`relative [font-family:PoppinsMedium] ${
        adminMode ? "" : "min-h-[150vh]"
      }`}
    >
      <div
        className={
          adminMode
            ? "py-6"
            : "sticky top-0 grid min-h-screen content-center gap-8 py-14 md:grid-cols-[0.72fr_1.28fr] md:items-center md:gap-10 md:py-20"
        }
        style={
          adminMode
            ? undefined
            : {
                opacity: 0.84 + sectionProgress * 0.16,
                transform: `translateY(${Math.round((1 - sectionProgress) * 120)}px)`,
              }
        }
      >
        {adminMode ? null : (
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
        )}

        <div className="max-w-3xl">
          <EditableText
            fieldKey="aboutTitle"
            value={content.aboutTitle}
            adminMode={adminMode}
            label="About title"
          >
            <p className="text-3xl font-bold text-stone-900 md:text-5xl">
              {content.aboutTitle}
            </p>
          </EditableText>

          <EditableText
            fieldKey="aboutBody"
            value={content.aboutBody}
            adminMode={adminMode}
            multiline
            label="About text"
          >
            <div className="mt-6 space-y-5 text-lg font-medium leading-8 text-stone-700 md:text-xl md:leading-9">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className={
                    index === paragraphs.length - 1 ? "text-stone-900" : undefined
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </EditableText>
        </div>
      </div>
    </section>
  )
}
