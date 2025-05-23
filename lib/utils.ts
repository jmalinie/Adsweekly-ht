import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// formatDate fonksiyonunu Amerikan tarih formatına uygun olarak değiştiriyorum
export function formatDate(dateString: string): string {
  const date = new Date(dateString)

  // Amerikan tarih formatı: Month Day, Year (örn: May 23, 2025)
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}
