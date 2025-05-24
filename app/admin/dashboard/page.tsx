"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"

export default function AdminDashboardPage() {
  useEffect(() => {
    // Redirect dashboard page to posts page
    redirect("/admin/dashboard/posts")
  }, [])

  // This won't render, but just in case
  return <div>Redirecting to posts...</div>
}
