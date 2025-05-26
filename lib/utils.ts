import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""

  const date = new Date(dateString)

  // Geçerli bir tarih değilse boş döndür
  if (isNaN(date.getTime())) return ""

  // Tarih formatını oluştur: "1 Ocak 2023" gibi
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text

  return text.slice(0, maxLength) + "..."
}

export function slugify(text: string): string {
  if (!text) return ""

  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Boşlukları tire ile değiştir
    .replace(/[^\w-]+/g, "") // Alfanümerik olmayan karakterleri kaldır
    .replace(/--+/g, "-") // Birden fazla tireyi tek tire ile değiştir
    .replace(/^-+/, "") // Baştaki tireleri kaldır
    .replace(/-+$/, "") // Sondaki tireleri kaldır
    .normalize("NFD") // Unicode normalleştirme
    .replace(/[\u0300-\u036f]/g, "") // Aksan işaretlerini kaldır
}
