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
