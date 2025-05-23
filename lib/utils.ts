import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string into a localized format
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (default: 'tr-TR')
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date | null | undefined, locale = "tr-TR"): string {
  if (!dateString) return "Tarih yok"

  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Geçersiz tarih"
    }

    return date.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Tarih biçimlendirme hatası"
  }
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Creates a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word characters
    .replace(/--+/g, "-") // Replace multiple - with single -
}
