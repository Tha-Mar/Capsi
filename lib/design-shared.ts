import type { CSSProperties } from "react"

export const defaultDesignCategories = [
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
  about: string | null
  imageUrl: string
  isFeatured: boolean
  isVisible: boolean
  sortOrder: number | null
  previewStyle?: CSSProperties
}
