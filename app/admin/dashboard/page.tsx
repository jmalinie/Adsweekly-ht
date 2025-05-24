"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Client-side navigation kullan
    router.push("/admin/dashboard/posts")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-lg">Redirecting to posts...</div>
    </div>
  )
}
