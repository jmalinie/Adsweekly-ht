import Image from "next/image"
import { Store } from "lucide-react"

interface OptimizedImageProps {
  src: string | null
  alt: string
  className?: string
  fallbackClassName?: string
  size?: "sm" | "md" | "lg"
}

export function OptimizedImage({ src, alt, className = "", fallbackClassName = "", size = "md" }: OptimizedImageProps) {
  // Size configurations
  const sizeConfigs = {
    sm: {
      containerClasses: "h-12 w-12 sm:h-14 sm:w-14",
      iconClasses: "h-6 w-6 sm:h-7 sm:w-7",
      sizes: "(max-width: 640px) 48px, 56px",
    },
    md: {
      containerClasses: "h-16 w-16 sm:h-20 sm:w-20",
      iconClasses: "h-8 w-8 sm:h-10 sm:w-10",
      sizes: "(max-width: 640px) 64px, 80px",
    },
    lg: {
      containerClasses: "h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32",
      iconClasses: "h-12 w-12 sm:h-14 sm:w-14",
      sizes: "(max-width: 640px) 96px, (max-width: 768px) 112px, 128px",
    },
  }

  const { containerClasses, iconClasses, sizes } = sizeConfigs[size]

  if (!src) {
    return (
      <div
        className={`relative ${containerClasses} rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}
      >
        <Store className={`${iconClasses} text-gray-400 ${fallbackClassName}`} />
      </div>
    )
  }

  return (
    <div className={`relative ${containerClasses} rounded-lg overflow-hidden ${className}`}>
      <Image src={src || "/placeholder.svg"} alt={alt} fill className="object-cover" sizes={sizes} loading="lazy" />
    </div>
  )
}
