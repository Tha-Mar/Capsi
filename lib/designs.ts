import type { CSSProperties } from "react"

import { createClient } from "@/lib/supabase/server"
import { getSupabaseEnv } from "@/lib/supabase/env"

const colorways = [
  {
    accent: "Rose",
    background: "linear-gradient(135deg, #fff1f2 0%, #fecdd3 100%)",
    pattern:
      "radial-gradient(circle at 20% 20%, rgba(190, 24, 93, 0.22) 0 12%, transparent 13%), radial-gradient(circle at 78% 32%, rgba(244, 114, 182, 0.24) 0 10%, transparent 11%), linear-gradient(45deg, rgba(251, 113, 133, 0.22) 25%, transparent 25%, transparent 50%, rgba(251, 113, 133, 0.22) 50%, rgba(251, 113, 133, 0.22) 75%, transparent 75%)",
    scale: "34px 34px",
  },
  {
    accent: "Sky",
    background: "linear-gradient(135deg, #f0f9ff 0%, #bae6fd 100%)",
    pattern:
      "linear-gradient(90deg, rgba(14, 165, 233, 0.18) 0 18%, transparent 18% 50%, rgba(56, 189, 248, 0.2) 50% 68%, transparent 68% 100%), linear-gradient(rgba(125, 211, 252, 0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(125, 211, 252, 0.28) 1px, transparent 1px)",
    scale: "72px 72px, 18px 18px, 18px 18px",
  },
  {
    accent: "Sage",
    background: "linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)",
    pattern:
      "radial-gradient(circle at 30% 30%, rgba(22, 163, 74, 0.22) 0 8%, transparent 9%), radial-gradient(circle at 70% 70%, rgba(74, 222, 128, 0.24) 0 10%, transparent 11%), radial-gradient(circle at 70% 25%, rgba(34, 197, 94, 0.2) 0 6%, transparent 7%)",
    scale: "48px 48px",
  },
  {
    accent: "Lavender",
    background: "linear-gradient(135deg, #faf5ff 0%, #ddd6fe 100%)",
    pattern:
      "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 25%, transparent 25%), linear-gradient(225deg, rgba(167, 139, 250, 0.22) 25%, transparent 25%), linear-gradient(315deg, rgba(196, 181, 253, 0.24) 25%, transparent 25%), linear-gradient(45deg, rgba(139, 92, 246, 0.2) 25%, transparent 25%)",
    scale: "34px 34px",
  },
  {
    accent: "Marigold",
    background: "linear-gradient(135deg, #fffbeb 0%, #fde68a 100%)",
    pattern:
      "radial-gradient(circle at 20% 50%, rgba(245, 158, 11, 0.24) 0 14%, transparent 15%), radial-gradient(circle at 70% 20%, rgba(234, 179, 8, 0.26) 0 12%, transparent 13%), radial-gradient(circle at 65% 75%, rgba(251, 191, 36, 0.22) 0 10%, transparent 11%)",
    scale: "44px 44px",
  },
  {
    accent: "Ocean",
    background: "linear-gradient(135deg, #ecfeff 0%, #a5f3fc 100%)",
    pattern:
      "linear-gradient(0deg, rgba(8, 145, 178, 0.16) 0 8%, transparent 8% 50%, rgba(6, 182, 212, 0.16) 50% 58%, transparent 58% 100%), linear-gradient(90deg, rgba(34, 211, 238, 0.22) 0 12%, transparent 12% 45%, rgba(103, 232, 249, 0.2) 45% 62%, transparent 62% 100%)",
    scale: "54px 54px",
  },
] as const

const patternThemes = [
  "Wildflower",
  "Team Spirit",
  "Sunrise Garden",
  "Tiny Hearts",
  "Fox Friends",
  "Painterly Stripe",
  "Soft Daisies",
  "Classic Plaid",
  "Modern Mosaic",
  "Holiday Cheer",
] as const

const materialNotes = [
  "Lightweight quilting cotton with a breathable feel.",
  "Soft cotton blend selected for all-day comfort.",
  "Smooth woven cotton with enough structure to hold shape.",
  "Prewashed cotton fabric with a gentle hand feel.",
  "Durable cotton weave made for repeat wear and washing.",
] as const

const fitNotes = [
  "Best for ponytail and bun styles.",
  "Classic tie-back fit with roomy crown coverage.",
  "Euro-style fit for a closer silhouette.",
  "Relaxed fit with adjustable back ties.",
  "Designed to stay secure through long shifts.",
] as const

const fallbackCategories = [
  "Popular",
  "Sports",
  "Floral",
  "Geometric",
  "Animals",
  "Seasonal",
  "Classic",
] as const

export type CatalogDesign = {
  id: string
  name: string
  collection: string
  category: string
  material: string
  fit: string
  availability: string
  description: string | null
  imageUrl: string
  isFeatured: boolean
  isVisible: boolean
  sortOrder: number | null
  previewStyle?: CSSProperties
}

type DesignRow = {
  id: string
  name: string
  collection: string
  category: string
  material: string
  fit: string
  availability: string
  description: string | null
  image_url: string | null
  is_featured: boolean | null
  sort_order: number | null
  is_visible: boolean | null
}

function createPlaceholderDesigns(): CatalogDesign[] {
  return Array.from({ length: 50 }, (_, index) => {
    const colorway = colorways[index % colorways.length]
    const patternName = patternThemes[index % patternThemes.length]
    const material = materialNotes[index % materialNotes.length]
    const fit = fitNotes[index % fitNotes.length]
    const category = fallbackCategories[index % fallbackCategories.length]
    const designNumber = String(index + 1).padStart(2, "0")
    const isFeatured = index === 0

    return {
      id: `design-${designNumber}`,
      name: isFeatured ? "Pink Fox Print" : `${colorway.accent} ${patternName}`,
      collection: `Fabric Design ${designNumber}`,
      category,
      material,
      fit,
      availability:
        index % 4 === 0 ? "Limited yardage available" : "Available for custom orders",
      description:
        category === "Sports"
          ? "A spirited print for fans who want a little team energy on shift."
          : category === "Animals"
            ? "Whimsical character prints that keep the look playful."
            : null,
      imageUrl: isFeatured ? "/DrWoof_Jan24_Ecomm8198-web_1600x.webp" : "",
      isFeatured,
      isVisible: true,
      sortOrder: index + 1,
      previewStyle: {
        backgroundImage: `${colorway.pattern}, ${colorway.background}`,
        backgroundSize: colorway.scale,
        backgroundPosition: "center",
      },
    }
  })
}

function mapDesignRow(row: DesignRow, index: number): CatalogDesign {
  const colorway = colorways[index % colorways.length]

  return {
    id: row.id,
    name: row.name,
    collection: row.collection,
    category: row.category,
    material: row.material,
    fit: row.fit,
    availability: row.availability,
    description: row.description,
    imageUrl: row.image_url || "",
    isFeatured: Boolean(row.is_featured),
    isVisible: row.is_visible ?? true,
    sortOrder: row.sort_order,
    previewStyle: row.image_url
      ? undefined
      : {
          backgroundImage: `${colorway.pattern}, ${colorway.background}`,
          backgroundSize: colorway.scale,
          backgroundPosition: "center",
        },
  }
}

export async function getAdminDesigns(): Promise<CatalogDesign[]> {
  const env = getSupabaseEnv()

  if (!env.isConfigured) {
    return []
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("designs")
    .select(
      "id, name, collection, category, material, fit, availability, description, image_url, is_featured, sort_order, is_visible",
    )
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map(mapDesignRow)
}

export async function getCatalogDesigns(): Promise<CatalogDesign[]> {
  const env = getSupabaseEnv()

  if (!env.isConfigured) {
    return createPlaceholderDesigns()
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("designs")
      .select(
        "id, name, collection, category, material, fit, availability, description, image_url, is_featured, sort_order, is_visible",
      )
      .eq("is_visible", true)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true })

    if (error || !data?.length) {
      return createPlaceholderDesigns()
    }

    return data.map(mapDesignRow)
  } catch {
    return createPlaceholderDesigns()
  }
}
