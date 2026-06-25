"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { localCatalogDesigns } from "@/lib/local-design-catalog"
import { siteContentKeys } from "@/lib/site-content"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value.trim() : ""
}

async function clearFeaturedDesigns(supabase: Awaited<ReturnType<typeof createClient>>) {
  await supabase.from("designs").update({ is_featured: false }).eq("is_featured", true)
}

function resolveCategory(formData: FormData) {
  const customCategory = getString(formData, "customCategory")
  const selectedCategory = getString(formData, "category")

  return customCategory || selectedCategory
}

async function ensureCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  category: string,
) {
  if (!category) {
    return
  }

  const { data: lastCategory } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)

  await supabase.from("categories").upsert(
    {
      name: category,
      sort_order: (lastCategory?.[0]?.sort_order ?? 0) + 1,
    },
    { onConflict: "name", ignoreDuplicates: true },
  )
}

async function uploadDesignImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: FormDataEntryValue | null,
) {
  if (!(file instanceof File) || file.size === 0) {
    return null
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg"
  const safeName = `${crypto.randomUUID()}.${extension}`
  const path = `designs/${safeName}`
  const { error } = await supabase.storage
    .from("design-images")
    .upload(path, file, { upsert: false })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from("design-images").getPublicUrl(path)

  return data.publicUrl
}

export async function signInAction(formData: FormData) {
  const email = getString(formData, "email")
  const password = getString(formData, "password")
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect("/admin")
}

export async function signOutAction() {
  const supabase = await createClient()

  await supabase.auth.signOut()
  redirect("/admin/login")
}

export async function createDesignAction(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: existingDesigns } = await supabase
      .from("designs")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)

    if (formData.get("isFeatured") === "on") {
      await clearFeaturedDesigns(supabase)
    }

    const category = resolveCategory(formData)
    await ensureCategory(supabase, category)
    const uploadedImageUrl = await uploadDesignImage(supabase, formData.get("imageFile"))

    const payload = {
      name: getString(formData, "name"),
      collection: getString(formData, "collection"),
      category,
      material: "",
      fit: "",
      availability: "",
      description: getString(formData, "about") || null,
      image_url: uploadedImageUrl ?? (getString(formData, "existingImageUrl") || null),
      is_featured: formData.get("isFeatured") === "on",
      is_visible:
        formData.get("isVisible") === "on" || formData.get("isVisible") === null,
      sort_order: (existingDesigns?.[0]?.sort_order ?? 0) + 1,
    }

    const { error } = await supabase.from("designs").insert(payload)

    if (error) {
      redirect(`/admin?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath("/")
    revalidatePath("/admin")
    redirect("/admin?success=created")
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create the design."
    redirect(`/admin?error=${encodeURIComponent(message)}`)
  }
}

export async function updateDesignAction(formData: FormData) {
  try {
    const supabase = await createClient()
    const id = getString(formData, "id")

    if (formData.get("isFeatured") === "on") {
      await clearFeaturedDesigns(supabase)
    }

    const category = resolveCategory(formData)
    await ensureCategory(supabase, category)
    const uploadedImageUrl = await uploadDesignImage(supabase, formData.get("imageFile"))

    const payload = {
      name: getString(formData, "name"),
      collection: getString(formData, "collection"),
      category,
      material: "",
      fit: "",
      availability: "",
      description: getString(formData, "about") || null,
      image_url: uploadedImageUrl ?? (getString(formData, "existingImageUrl") || null),
      is_featured: formData.get("isFeatured") === "on",
      is_visible: formData.get("isVisible") === "on",
    }

    const { error } = await supabase.from("designs").update(payload).eq("id", id)

    if (error) {
      redirect(`/admin?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath("/")
    revalidatePath("/admin")
    redirect("/admin?success=updated")
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update the design."
    redirect(`/admin?error=${encodeURIComponent(message)}`)
  }
}

export async function reorderDesignsAction(formData: FormData) {
  const supabase = await createClient()
  const rawItems = getString(formData, "items")

  if (!rawItems) {
    return
  }

  const items = JSON.parse(rawItems) as Array<{ id: string; sortOrder: number }>

  await Promise.all(
    items.map((item) =>
      supabase
        .from("designs")
        .update({ sort_order: item.sortOrder })
        .eq("id", item.id),
    ),
  )

  revalidatePath("/")
  revalidatePath("/admin")
}

export async function deleteDesignAction(formData: FormData) {
  const supabase = await createClient()
  const id = getString(formData, "id")

  const { error } = await supabase.from("designs").delete().eq("id", id)

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath("/")
  revalidatePath("/admin")
  redirect("/admin?success=deleted")
}

/**
 * One-time helper: copy the bundled local catalog into the `designs` table.
 * Idempotent — only inserts designs whose slug is not already present, so it is
 * safe to run more than once. Redirect calls are intentionally left outside any
 * try/catch so Next can handle the redirect.
 */
export async function importLocalCatalogAction() {
  const supabase = await createClient()

  const { data: existing, error: fetchError } = await supabase
    .from("designs")
    .select("slug")

  if (fetchError) {
    redirect(`/admin?error=${encodeURIComponent(fetchError.message)}`)
  }

  const existingSlugs = new Set(
    (existing ?? []).map((row) => row.slug).filter(Boolean),
  )

  const toInsert = localCatalogDesigns
    .filter((design) => !existingSlugs.has(design.id))
    .map((design) => ({
      slug: design.id,
      name: design.name,
      collection: design.collection,
      category: design.category,
      material: "",
      fit: "",
      availability: "",
      description: design.about,
      image_url: design.imageUrl,
      is_featured: design.isFeatured,
      is_visible: design.isVisible,
      sort_order: design.sortOrder,
    }))

  if (toInsert.length > 0) {
    const { error } = await supabase.from("designs").insert(toInsert)

    if (error) {
      redirect(`/admin?error=${encodeURIComponent(error.message)}`)
    }
  }

  revalidatePath("/")
  revalidatePath("/admin")
  redirect(`/admin?success=imported`)
}

/**
 * Save a single editable text field (hero/about copy). Clearing the value
 * removes the override so the public default copy is shown again. Does not
 * redirect — inline editors stay on the page and show their own saved state.
 */
export async function updateSiteContentAction(formData: FormData) {
  const key = getString(formData, "key")
  const value = getString(formData, "value")

  if (!siteContentKeys.includes(key as (typeof siteContentKeys)[number])) {
    return
  }

  const supabase = await createClient()

  if (!value) {
    await supabase.from("site_content").delete().eq("key", key)
  } else {
    await supabase
      .from("site_content")
      .upsert({ key, value }, { onConflict: "key" })
  }

  revalidatePath("/")
  revalidatePath("/admin")
}
