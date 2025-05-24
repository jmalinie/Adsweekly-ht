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
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
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
  }, [router, pathname])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Render children directly without any wrapper
  return children
}
