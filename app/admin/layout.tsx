"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only check authentication for dashboard routes
        if (pathname?.startsWith("/admin/dashboard")) {
          // Simple cookie check
          const isLoggedIn = document.cookie.includes("admin_logged_in=true")
          if (!isLoggedIn) {
            router.push("/admin")
            return
          }
        }
        setIsLoading(false)
      } catch (err) {
        console.error("Auth check error:", err)
        setError("Authentication check failed")
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-lg text-red-600">Error: {error}</div>
          <button
            onClick={() => (window.location.href = "/admin")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  // Render children directly without any wrapper
  return children
}
