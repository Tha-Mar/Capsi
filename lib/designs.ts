import { createClient } from "@/lib/supabase/server"
import { createAnonClient } from "@/lib/supabase/anon"
import { type CatalogDesign } from "@/lib/design-shared"
import { localCatalogDesigns } from "@/lib/local-design-catalog"
import { getSupabaseEnv } from "@/lib/supabase/env"

type DesignRow = {
  id: string
  name: string
  collection: string
  category: string
  description: string | null
  material: string | null
  fit: string | null
  image_url: string | null
  is_featured: boolean | null
  sort_order: number | null
  is_visible: boolean | null
}

const DESIGN_COLUMNS =
  "id, name, collection, category, material, fit, description, image_url, is_featured, sort_order, is_visible"

function mapDesignRow(row: DesignRow): CatalogDesign {
  return {
    id: row.id,
    name: row.name,
    collection: row.collection,
    category: row.category,
    about: row.description || `${row.material ?? ""} ${row.fit ?? ""}`.trim() || null,
    imageUrl: row.image_url || "",
    isFeatured: Boolean(row.is_featured),
    isVisible: row.is_visible ?? true,
    sortOrder: row.sort_order,
  }
}

export async function getDesignCategories(): Promise<string[]> {
  const supabase = createAnonClient()

  if (supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .order("sort_order", { ascending: true, nullsFirst: false })

    if (!error && data && data.length > 0) {
      return data.map((row) => row.name as string)
    }
  }

  // Fallback: derive categories from the local catalog.
  return Array.from(new Set(localCatalogDesigns.map((design) => design.category)))
}

export async function getAdminDesigns(): Promise<CatalogDesign[]> {
  const env = getSupabaseEnv()

  if (!env.isConfigured) {
    return []
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("designs")
    .select(DESIGN_COLUMNS)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map(mapDesignRow)
}

export async function getCatalogDesigns(): Promise<CatalogDesign[]> {
  const supabase = createAnonClient()

  if (supabase) {
    const { data, error } = await supabase
      .from("designs")
      .select(DESIGN_COLUMNS)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true })

    // Only use the database when it actually has designs; otherwise fall back to
    // the bundled local catalog so the site is never empty.
    if (!error && data && data.length > 0) {
      return data.map(mapDesignRow)
    }
  }

  return localCatalogDesigns
}
