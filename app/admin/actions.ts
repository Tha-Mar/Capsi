"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

function getString(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value.trim() : ""
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
  const payload = {
    name: getString(formData, "name"),
    collection: getString(formData, "collection"),
    category: getString(formData, "category"),
    material: getString(formData, "material"),
    fit: getString(formData, "fit"),
    availability: getString(formData, "availability"),
    description: getString(formData, "description") || null,
    image_url: getString(formData, "imageUrl") || null,
    is_featured: formData.get("isFeatured") === "on",
    is_visible: true,
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

  const payload = {
    name: getString(formData, "name"),
    collection: getString(formData, "collection"),
    category: getString(formData, "category"),
    material: getString(formData, "material"),
    fit: getString(formData, "fit"),
    availability: getString(formData, "availability"),
    description: getString(formData, "description") || null,
    image_url: getString(formData, "imageUrl") || null,
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
