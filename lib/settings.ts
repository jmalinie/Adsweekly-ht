import { getSetting } from "@/app/actions/settings-actions"

// Ayarları cache'lemek için basit bir in-memory cache
const settingsCache = new Map<string, { value: string; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 dakika

export async function getSettingValue(key: string, defaultValue = ""): Promise<string> {
  // Cache'den kontrol et
  const cached = settingsCache.get(key)
  const now = Date.now()

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.value
  }

  try {
    const value = await getSetting(key)
    const finalValue = value || defaultValue

    // Cache'e kaydet
    settingsCache.set(key, { value: finalValue, timestamp: now })

    return finalValue
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error)

    // Cache'den eski değeri dön, yoksa default değeri dön
    const cachedValue = settingsCache.get(key)
    if (cachedValue) {
      return cachedValue.value
    }

    return defaultValue
  }
}

// Cache'i temizle
export function clearSettingsCache() {
  settingsCache.clear()
}

// Belirli bir ayarın cache'ini temizle
export function clearSettingCache(key: string) {
  settingsCache.delete(key)
}

// Ayarları doğrudan default değerlerle al (fallback için)
export function getDefaultSettings(): Record<string, string> {
  return {
    site_title: "Modern Blog",
    site_description: "Latest articles about technology, software development, and web development.",
    site_url: "https://example.com",
    admin_email: "admin@example.com",
    posts_per_page: "10",
    show_author: "true",
    show_date: "true",
    dark_mode: "false",
    new_comment_notifications: "true",
    new_user_notifications: "true",
    newsletter_enabled: "false",
    cache_enabled: "true",
    debug_mode: "false",
  }
}
