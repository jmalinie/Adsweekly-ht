"use client"

import type React from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Client-side only authentication check will be handled in individual pages
  return <>{children}</>
}
