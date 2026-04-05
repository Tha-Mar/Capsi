"use client"

import { useMemo, useState, useTransition } from "react"

import {
  createDesignAction,
  deleteDesignAction,
  reorderDesignsAction,
  updateDesignAction,
} from "@/app/admin/actions"
import {
  designCategories,
  type CatalogDesign,
} from "@/lib/design-shared"

type AdminCatalogManagerProps = {
  designs: CatalogDesign[]
}

type EditableDesign = CatalogDesign

type FormState = {
  mode: "create" | "edit"
  design: EditableDesign | null
}

const emptyDesign: EditableDesign = {
  id: "",
  name: "",
  collection: "",
  category: "Popular",
  about: "",
  availability: "Available for custom orders",
  imageUrl: "",
  isFeatured: false,
  isVisible: true,
  sortOrder: null,
}

export function AdminCatalogManager({ designs }: AdminCatalogManagerProps) {
  const categories = useMemo(() => {
    const values = new Set(designs.map((design) => design.category))
    return ["All", ...Array.from(values)] as const
  }, [designs])

  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>(
    "All",
  )
  const [localDesigns, setLocalDesigns] = useState(designs)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [formState, setFormState] = useState<FormState>({
    mode: "create",
    design: null,
  })
  const [isPending, startTransition] = useTransition()

  const filteredDesigns =
    activeCategory === "All"
      ? localDesigns
      : localDesigns.filter((design) => design.category === activeCategory)

  const saveOrder = (nextDesigns: EditableDesign[]) => {
    setLocalDesigns(nextDesigns)

    const formData = new FormData()
    formData.set(
      "items",
      JSON.stringify(
        nextDesigns.map((design, index) => ({
          id: design.id,
          sortOrder: index + 1,
        })),
      ),
    )

    startTransition(async () => {
      await reorderDesignsAction(formData)
    })
  }

  const moveCard = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) {
      return
    }

    const nextDesigns = [...localDesigns]
    const fromIndex = nextDesigns.findIndex((design) => design.id === draggedId)
    const toIndex = nextDesigns.findIndex((design) => design.id === targetId)

    if (fromIndex < 0 || toIndex < 0) {
      return
    }

    const [moved] = nextDesigns.splice(fromIndex, 1)
    nextDesigns.splice(toIndex, 0, moved)
    saveOrder(nextDesigns)
  }

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-[family:var(--font-display)] text-4xl text-stone-900">
            Design Library
          </h2>
          <button
            type="button"
            onClick={() =>
              setFormState({
                mode: "create",
                design: emptyDesign,
              })
            }
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Add listing
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={
                activeCategory === category
                  ? "rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
                  : "rounded-full border border-stone-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50"
              }
            >
              {category}
            </button>
          ))}
        </div>
        <p className="text-sm text-stone-600">
          Drag cards to change the showcase order. Use edit to change details or
          add new listings directly from this page.
          {isPending ? " Saving order..." : ""}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={() =>
            setFormState({
              mode: "create",
              design: emptyDesign,
            })
          }
          className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] border border-dashed border-stone-300 bg-white/70 p-6 text-center shadow-[0_18px_45px_rgba(120,84,62,0.05)]"
        >
          <span className="text-lg font-semibold text-stone-700">+ Add listing</span>
        </button>

        {filteredDesigns.map((design) => (
          <article
            key={design.id}
            draggable
            onDragStart={() => setDraggingId(design.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggingId) {
                moveCard(draggingId, design.id)
                setDraggingId(null)
              }
            }}
            onDragEnd={() => setDraggingId(null)}
            className="group overflow-hidden rounded-[1.5rem] border border-stone-200/80 bg-white/85 shadow-[0_18px_45px_rgba(120,84,62,0.08)] transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {design.imageUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url("${design.imageUrl}")` }}
                />
              ) : (
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                  style={design.previewStyle}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/65 via-transparent to-stone-950/10" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
                <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-stone-700">
                  Drag to reorder
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormState({ mode: "edit", design })}
                    className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-800"
                  >
                    Edit
                  </button>
                  <form action={deleteDesignAction}>
                    <input type="hidden" name="id" value={design.id} />
                    <button
                      type="submit"
                      className="rounded-full bg-stone-950/85 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-100/90">
                  {design.collection}
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  {design.name}
                </h3>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid gap-3 rounded-[1.25rem] bg-stone-50 p-4 text-sm leading-6 text-stone-700">
                <p>
                  <span className="font-semibold text-stone-900">About:</span>{" "}
                  {design.about}
                </p>
                {design.about ? (
                  <p>
                    <span className="font-semibold text-stone-900">Availability:</span>{" "}
                    {design.availability}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                  {design.category}
                </span>
                <p className="text-right text-sm text-stone-600">
                  {design.availability}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {formState.design ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
                  {formState.mode === "create" ? "Add listing" : "Edit listing"}
                </p>
                <h3 className="mt-2 font-[family:var(--font-display)] text-4xl leading-none text-stone-900">
                  {formState.mode === "create"
                    ? "Create a new design"
                    : formState.design.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFormState({ mode: "create", design: null })}
                className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
              >
                Close
              </button>
            </div>

            <form
              action={
                formState.mode === "create" ? createDesignAction : updateDesignAction
              }
              encType="multipart/form-data"
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              {formState.mode === "edit" ? (
                <input type="hidden" name="id" value={formState.design.id} />
              ) : null}
              <input
                name="name"
                defaultValue={formState.design.name}
                required
                placeholder="Design name"
                className="rounded-2xl border border-stone-200 px-4 py-3"
              />
              <input
                name="collection"
                defaultValue={formState.design.collection}
                required
                placeholder="Collection label"
                className="rounded-2xl border border-stone-200 px-4 py-3"
              />
              <select
                name="category"
                defaultValue={formState.design.category}
                required
                className="rounded-2xl border border-stone-200 px-4 py-3"
              >
                {designCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                className="rounded-2xl border border-stone-200 px-4 py-3"
              />
              <input
                type="hidden"
                name="existingImageUrl"
                defaultValue={formState.design.imageUrl}
              />
              <input
                name="availability"
                defaultValue={formState.design.availability}
                required
                placeholder="Availability"
                className="rounded-2xl border border-stone-200 px-4 py-3"
              />
              <textarea
                name="about"
                defaultValue={formState.design.about ?? ""}
                placeholder="About"
                rows={5}
                className="rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2"
              />
              <div className="flex flex-wrap gap-5 text-sm font-semibold text-stone-700 md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    defaultChecked={formState.design.isFeatured}
                    className="h-4 w-4"
                  />
                  Featured in hero
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isVisible"
                    defaultChecked={formState.design.isVisible}
                    className="h-4 w-4"
                  />
                  Visible on public site
                </label>
              </div>
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button
                  type="submit"
                  className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white"
                >
                  {formState.mode === "create" ? "Create listing" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setFormState({ mode: "create", design: null })}
                  className="rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
