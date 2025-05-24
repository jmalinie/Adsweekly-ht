"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboardPage() {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const performRedirect = async () => {
      try {
        setIsRedirecting(true)
        // Add a small delay to ensure the component is mounted
        await new Promise((resolve) => setTimeout(resolve, 100))
        router.replace("/admin/dashboard/posts")
      } catch (error) {
        console.error("Redirect error:", error)
        // Fallback to window.location if router fails
        window.location.href = "/admin/dashboard/posts"
      }
    }

    performRedirect()
  }, [router])

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-sm text-gray-600">Redirecting to posts...</p>
        </div>
      </div>
    )
  }

  return null
}
