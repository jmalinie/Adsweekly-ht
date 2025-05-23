"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getSettings() {
  const supabase = createClient()

  try {
    const { data: settings, error } = await supabase.from("settings").select("key, value").order("key")

    if (error) {
      console.error("Settings fetch error:", error)
      return {}
    }

    // Convert array to object for easier access
    const settingsObject: Record<string, string> = {}
    settings?.forEach((setting) => {
      settingsObject[setting.key] = setting.value || ""
    })

    return settingsObject
  } catch (error) {
    console.error("Settings fetch error:", error)
    return {}
  }
}

export async function updateSettings(formData: FormData) {
  const supabase = createClient()

  try {
    const settingsToUpdate = [
      { key: "site_title", value: formData.get("site_title") as string },
      { key: "site_description", value: formData.get("site_description") as string },
      { key: "site_url", value: formData.get("site_url") as string },
      { key: "admin_email", value: formData.get("admin_email") as string },
      { key: "posts_per_page", value: formData.get("posts_per_page") as string },
      { key: "show_author", value: formData.get("show_author") === "on" ? "true" : "false" },
      { key: "show_date", value: formData.get("show_date") === "on" ? "true" : "false" },
      { key: "dark_mode", value: formData.get("dark_mode") === "on" ? "true" : "false" },
      {
        key: "new_comment_notifications",
        value: formData.get("new_comment_notifications") === "on" ? "true" : "false",
      },
      { key: "new_user_notifications", value: formData.get("new_user_notifications") === "on" ? "true" : "false" },
      { key: "newsletter_enabled", value: formData.get("newsletter_enabled") === "on" ? "true" : "false" },
      { key: "cache_enabled", value: formData.get("cache_enabled") === "on" ? "true" : "false" },
      { key: "debug_mode", value: formData.get("debug_mode") === "on" ? "true" : "false" },
    ]

    // Update each setting
    for (const setting of settingsToUpdate) {
      if (setting.value !== null) {
        const { error } = await supabase.from("settings").upsert(
          {
            key: setting.key,
            value: setting.value,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "key",
          },
        )

        if (error) {
          console.error(`Error updating setting ${setting.key}:`, error)
          throw error
        }
      }
    }

    // Revalidate relevant paths
    revalidatePath("/admin/dashboard/settings")
    revalidatePath("/")

    return { success: true, message: "Ayarlar başarıyla güncellendi." }
  } catch (error) {
    console.error("Settings update error:", error)
    return { error: "Ayarlar güncellenirken bir hata oluştu." }
  }
}

export async function getSetting(key: string): Promise<string | null> {
  const supabase = createClient()

  try {
    const { data: setting, error } = await supabase.from("settings").select("value").eq("key", key).single()

    if (error) {
      console.error(`Setting ${key} fetch error:`, error)
      return null
    }

    return setting?.value || null
  } catch (error) {
    console.error(`Setting ${key} fetch error:`, error)
    return null
  }
}
