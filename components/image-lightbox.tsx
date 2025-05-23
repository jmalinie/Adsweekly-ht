"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface ImageLightboxProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Scroll'u devre dışı bırak
      document.body.style.overflow = "hidden"
    } else {
      // Scroll'u tekrar etkinleştir
      document.body.style.overflow = ""
    }

    // Cleanup
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    // ESC tuşuna basıldığında kapat
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEsc)
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Image: ${alt}`}
    >
      <button
        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <div className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src || "/placeholder.svg"}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain"
            onLoad={() => setLoaded(true)}
          />
        </div>

        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  )
}
