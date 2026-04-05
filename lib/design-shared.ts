import type { CSSProperties } from "react"

export const designCategories = [
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
  availability: string
  imageUrl: string
  isFeatured: boolean
  isVisible: boolean
  sortOrder: number | null
  previewStyle?: CSSProperties
}
