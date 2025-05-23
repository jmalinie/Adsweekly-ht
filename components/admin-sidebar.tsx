"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart, FileText, Home, Settings, Users, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const menuItems = [
    {
      title: "Kontrol Paneli",
      icon: Home,
      href: "/admin/dashboard",
    },
    {
      title: "Yazılar",
      icon: FileText,
      href: "/admin/dashboard/posts",
    },
    {
      title: "Kategoriler",
      icon: Tag,
      href: "/admin/dashboard/categories",
    },
    {
      title: "Kullanıcılar",
      icon: Users,
      href: "/admin/dashboard/users",
    },
    {
      title: "İstatistikler",
      icon: BarChart,
      href: "/admin/dashboard/stats",
    },
    {
      title: "Ayarlar",
      icon: Settings,
      href: "/admin/dashboard/settings",
    },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center">
          <h1 className="text-xl font-bold">Blog Yönetimi</h1>
        </Link>
      </div>

      <nav className="px-3 py-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive(item.href)
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.title}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  )
}
