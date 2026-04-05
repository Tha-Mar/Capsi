"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value.trim() : ""
}

async function clearFeaturedDesigns(supabase: Awaited<ReturnType<typeof createClient>>) {
  await supabase.from("designs").update({ is_featured: false }).eq("is_featured", true)
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
  const supabase = await createClient()
  const { data: existingDesigns } = await supabase
    .from("designs")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)

  if (formData.get("isFeatured") === "on") {
    await clearFeaturedDesigns(supabase)
  }

  const uploadedImageUrl = await uploadDesignImage(supabase, formData.get("imageFile"))

  const payload = {
    name: getString(formData, "name"),
    collection: getString(formData, "collection"),
    category: getString(formData, "category"),
    material: "",
    fit: "",
    availability: getString(formData, "availability"),
    description: getString(formData, "about") || null,
    image_url: uploadedImageUrl ?? (getString(formData, "existingImageUrl") || null),
    is_featured: formData.get("isFeatured") === "on",
    is_visible: formData.get("isVisible") === "on" || formData.get("isVisible") === null,
    sort_order: (existingDesigns?.[0]?.sort_order ?? 0) + 1,
  }

  const { error } = await supabase.from("designs").insert(payload)

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath("/")
  revalidatePath("/admin")
  redirect("/admin?success=created")
}

export async function updateDesignAction(formData: FormData) {
  const supabase = await createClient()
  const id = getString(formData, "id")

  if (formData.get("isFeatured") === "on") {
    await clearFeaturedDesigns(supabase)
  }

  const uploadedImageUrl = await uploadDesignImage(supabase, formData.get("imageFile"))

  const payload = {
    name: getString(formData, "name"),
    collection: getString(formData, "collection"),
    category: getString(formData, "category"),
    material: "",
    fit: "",
    availability: getString(formData, "availability"),
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
