import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string or Date object into a localized string
 * @param dateString - The date string or Date object to format
 * @param locale - The locale to use for formatting (default: 'tr-TR' for Turkish)
 * @returns A formatted date string
 */
export function formatDate(dateString: string | Date | null | undefined, locale = "tr-TR"): string {
  if (!dateString) {
    return "Tarih yok"
  }

  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString)
      return "Geçersiz tarih"
    }

    return date.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Tarih formatlanırken hata oluştu"
  }
}

/**
 * Truncates text to a specified length and adds an ellipsis
 * @param text - The text to truncate
 * @param length - The maximum length of the truncated text
 * @returns The truncated text with an ellipsis
 */
export function truncateText(text: string, length: number): string {
  if (!text) return ""
  if (text.length <= length) return text
  return text.substring(0, length) + "..."
}

/**
 * Creates a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
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
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
}
