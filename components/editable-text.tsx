"use client"

import { Check, Pencil, X } from "lucide-react"
import { useState, useTransition, type ReactNode } from "react"

import { updateSiteContentAction } from "@/app/admin/actions"

type EditableTextProps = {
  /** Matches a key in the `site_content` table / SiteContent type. */
  fieldKey: string
  /** Current raw value, used to seed the editor. */
  value: string
  /** When false, renders children untouched (public site). */
  adminMode?: boolean
  /** Use a textarea instead of a single-line input. */
  multiline?: boolean
  /** Short label shown above the editor, e.g. "Hero title". */
  label?: string
  /** The styled, public-facing rendering of the value. */
  children: ReactNode
}

export function EditableText({
  fieldKey,
  value,
  adminMode = false,
  multiline = false,
  label,
  children,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [justSaved, setJustSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!adminMode) {
    return <>{children}</>
  }

  const startEditing = () => {
    setDraft(value)
    setJustSaved(false)
    setIsEditing(true)
  }

  const save = () => {
    const formData = new FormData()
    formData.set("key", fieldKey)
    formData.set("value", draft)

    startTransition(async () => {
      await updateSiteContentAction(formData)
      setIsEditing(false)
      setJustSaved(true)
    })
  }

  if (isEditing) {
    return (
      <div className="relative z-30 rounded-2xl border border-stone-300 bg-white/95 p-4 shadow-[0_18px_45px_rgba(120,84,62,0.18)] backdrop-blur-sm">
        {label ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
            {label}
          </p>
        ) : null}
        {multiline ? (
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={6}
            autoFocus
            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-base text-stone-900 outline-none focus:border-rose-300"
          />
        ) : (
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            autoFocus
            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-base text-stone-900 outline-none focus:border-rose-300"
          />
        )}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {isPending ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          {multiline ? (
            <span className="text-xs text-stone-500">
              Separate paragraphs with a blank line.
            </span>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="group/edit relative inline-block w-full">
      {children}
      <button
        type="button"
        onClick={startEditing}
        className="absolute -top-2 right-0 z-30 inline-flex items-center gap-1.5 rounded-full bg-stone-900/90 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-md transition group-hover/edit:opacity-100"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
      {justSaved ? (
        <span className="absolute -bottom-6 right-0 z-30 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <Check className="h-3.5 w-3.5" />
          Saved
        </span>
      ) : null}
    </div>
  )
}
