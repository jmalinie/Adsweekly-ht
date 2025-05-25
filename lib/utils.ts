import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) {
    return "No date"
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date"
    }

    // American date format: Month Day, Year (e.g., "January 15, 2024")
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) {
    return "No date"
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date"
    }

    // American datetime format: Month Day, Year at Hour:Minute AM/PM
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj)
  } catch (error) {
    console.error("Error formatting datetime:", error)
    return "Invalid date"
  }
}

export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) {
    return "No date"
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date"
    }

    // Short American date format: MM/DD/YYYY
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(dateObj)
  } catch (error) {
    console.error("Error formatting short date:", error)
    return "Invalid date"
  }
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) {
    return "No date"
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date"
    }

    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "Just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days !== 1 ? "s" : ""} ago`
    } else {
      return formatDate(dateObj)
    }
  } catch (error) {
    console.error("Error formatting relative time:", error)
    return "Invalid date"
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength).trim() + "..."
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateExcerpt(content: string, maxLength = 160): string {
  // Remove HTML tags
  const textOnly = content.replace(/<[^>]*>/g, "")

  // Truncate and add ellipsis if needed
  if (textOnly.length <= maxLength) {
    return textOnly
  }

  return textOnly.slice(0, maxLength).trim() + "..."
}

export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) {
    return ""
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return ""
    }

    // Format for HTML input type="date" (YYYY-MM-DD)
    return dateObj.toISOString().split("T")[0]
  } catch (error) {
    console.error("Error formatting date for input:", error)
    return ""
  }
}

export function formatTimeAgo(date: string | Date | null | undefined): string {
  if (!date) {
    return "Unknown"
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date"
    }

    const now = new Date()
    const diffInMs = now.getTime() - dateObj.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return "Today"
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      return `${weeks} week${weeks !== 1 ? "s" : ""} ago`
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30)
      return `${months} month${months !== 1 ? "s" : ""} ago`
    } else {
      const years = Math.floor(diffInDays / 365)
      return `${years} year${years !== 1 ? "s" : ""} ago`
    }
  } catch (error) {
    console.error("Error formatting time ago:", error)
    return "Invalid date"
  }
}
