import { createAnonClient } from "@/lib/supabase/anon"

export type SiteContent = {
  heroTitle: string
  heroTagline: string
  aboutTitle: string
  aboutBody: string
}

/**
 * Editable text shown on the public site. Keys map 1:1 to rows in the
 * `site_content` table (key/value). Defaults mirror the original hardcoded copy
 * so the site reads identically before anything is saved or when Supabase is
 * unconfigured.
 */
export const defaultSiteContent: SiteContent = {
  heroTitle: "Capsy",
  heroTagline: "Handmade scrub caps,\nmade with care.",
  aboutTitle: "About Capsy",
  aboutBody: [
    "I started making scrub caps for the doctors and nurses I know because I wanted them to have something comfortable, cheerful, and personal to wear through long shifts.",
    "Every cap is homemade in small batches, with fabrics picked for a little color, a little joy, and a fit that feels easy from the first patient to the last.",
    "Capsy is my way of sending a small bit of care back to the people who spend their days caring for everyone else.",
  ].join("\n\n"),
}

export const siteContentKeys = Object.keys(
  defaultSiteContent,
) as (keyof SiteContent)[]

export async function getSiteContent(): Promise<SiteContent> {
  const supabase = createAnonClient()

  if (!supabase) {
    return defaultSiteContent
  }

  const { data, error } = await supabase
    .from("site_content")
    .select("key, value")

  if (error || !data) {
    return defaultSiteContent
  }

  const overrides = data.reduce<Partial<SiteContent>>((acc, row) => {
    if (
      row.key &&
      typeof row.value === "string" &&
      siteContentKeys.includes(row.key as keyof SiteContent)
    ) {
      acc[row.key as keyof SiteContent] = row.value
    }

    return acc
  }, {})

  return { ...defaultSiteContent, ...overrides }
}

/** Split the stored About body into renderable paragraphs. */
export function toParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}
