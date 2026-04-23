import type { CSSProperties } from "react"

export const defaultDesignCategories = [
  "Healthcare",
  "Floral",
  "Animals",
  "Fan Club",
  "Dots & Scribbles",
  "Seasonal",
  "Patriotic",
  "Everyday",
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
