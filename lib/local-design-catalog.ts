import { type CatalogDesign, defaultDesignCategories } from "@/lib/design-shared"

type LocalCategoryConfig = {
  category: (typeof defaultDesignCategories)[number]
  folder: string
  files: string[]
  namePrefix: string
  description: string
}

const localCategoryConfigs: LocalCategoryConfig[] = [
  {
    category: "Healthcare",
    folder: "Healthcare",
    files: Array.from({ length: 12 }, (_, index) => `H${String(index + 1).padStart(2, "0")}.jpg`),
    namePrefix: "Care Print",
    description: "Healthcare-inspired print with a bright, supportive feel.",
  },
  {
    category: "Floral",
    folder: "FLORAL",
    files: Array.from({ length: 17 }, (_, index) => `F${String(index + 1).padStart(2, "0")}.jpg`),
    namePrefix: "Floral Print",
    description: "Cheerful floral print with a soft, garden-inspired look.",
  },
  {
    category: "Animals",
    folder: "Animals",
    files: Array.from({ length: 7 }, (_, index) => `A${String(index + 1).padStart(2, "0")}.jpg`),
    namePrefix: "Animal Print",
    description: "Playful animal print that keeps the look fun and lighthearted.",
  },
  {
    category: "Fan Club",
    folder: "Fan Club",
    files: Array.from({ length: 10 }, (_, index) => `G${String(index + 1).padStart(2, "0")}.jpg`),
    namePrefix: "Fan Club Print",
    description: "Team-inspired print with bold color and game-day energy.",
  },
  {
    category: "Dots & Scribbles",
    folder: "Dots & Scribbles",
    files: Array.from({ length: 7 }, (_, index) => `D${String(index + 1).padStart(2, "0")}.jpg`),
    namePrefix: "Dot Print",
    description: "Simple dot and scribble pattern with an easy handmade feel.",
  },
  {
    category: "Seasonal",
    folder: "Seasonal",
    files: Array.from({ length: 14 }, (_, index) => `S${String(index + 1).padStart(2, "0")}.jpg`),
    namePrefix: "Seasonal Print",
    description: "Festive seasonal print for holiday shifts and special occasions.",
  },
  {
    category: "Patriotic",
    folder: "Patriotic",
    files: ["P01.jpg", "P02.jpg", "P03.jpg"],
    namePrefix: "Patriotic Print",
    description: "Patriotic print with classic Americana color and detail.",
  },
  {
    category: "Everyday",
    folder: "Misc",
    files: ["K0.jpg", ...Array.from({ length: 11 }, (_, index) => `K${String(index + 1).padStart(2, "0")}.jpg`)],
    namePrefix: "Everyday Print",
    description: "Versatile everyday print that mixes easily with any scrub set.",
  },
]

function createImageUrl(folder: string, file: string) {
  return `/designs/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`
}

function createDisplayNumber(file: string) {
  return file.replace(".jpg", "").replace(/^[A-Z]/, "").padStart(2, "0")
}

export const localCatalogDesigns: CatalogDesign[] = localCategoryConfigs.flatMap(
  (config, categoryIndex) =>
    config.files.map((file, fileIndex) => {
      const displayNumber = createDisplayNumber(file)
      const id = file.replace(".jpg", "").toLowerCase()

      return {
        id,
        name: `${config.namePrefix} ${displayNumber}`,
        collection: `${config.category} ${displayNumber}`,
        category: config.category,
        about: config.description,
        imageUrl: createImageUrl(config.folder, file),
        isFeatured: categoryIndex === 0 && fileIndex === 0,
        isVisible: true,
        sortOrder: categoryIndex * 100 + fileIndex + 1,
      }
    }),
)

