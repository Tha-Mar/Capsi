import { createClient } from "@/lib/supabase/server"
import { type CatalogDesign } from "@/lib/design-shared"
import { localCatalogDesigns } from "@/lib/local-design-catalog"
import { getSupabaseEnv } from "@/lib/supabase/env"

type DesignRow = {
  id: string
  name: string
  collection: string
  category: string
  description: string | null
  material: string
  fit: string
  image_url: string | null
  is_featured: boolean | null
  sort_order: number | null
  is_visible: boolean | null
}

export async function getDesignCategories(): Promise<string[]> {
  return Array.from(new Set(localCatalogDesigns.map((design) => design.category)))
}

function mapDesignRow(row: DesignRow): CatalogDesign {
  return {
    id: row.id,
    name: row.name,
    collection: row.collection,
    category: row.category,
    about: row.description || `${row.material} ${row.fit}`.trim() || null,
    imageUrl: row.image_url || "",
    isFeatured: Boolean(row.is_featured),
    isVisible: row.is_visible ?? true,
    sortOrder: row.sort_order,
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
      "id, name, collection, category, material, fit, description, image_url, is_featured, sort_order, is_visible",
    )
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map(mapDesignRow)
}

export async function getCatalogDesigns(): Promise<CatalogDesign[]> {
  return localCatalogDesigns
}
