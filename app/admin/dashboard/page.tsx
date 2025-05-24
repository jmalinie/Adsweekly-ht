"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"

interface Post {
  id: string
  title: string
  slug: string
  status: string
  published_at: string | null
  created_at: string
  users: {
    username: string
    full_name: string | null
  } | null
}

export default function AdminDashboardPage() {
  useEffect(() => {
    // Dashboard sayfasını posts sayfasına yönlendir
    redirect("/admin/dashboard/posts")
  }, [])

  return null
}
