"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"

export default function NestedDashboardPage() {
  useEffect(() => {
    redirect("/admin/dashboard")
  }, [])

  return <div>Redirecting...</div>
}
