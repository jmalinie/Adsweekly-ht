"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, FolderOpen, Users, BarChart2, Settings, LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
}

function SidebarItem({ icon, label, href, active }: SidebarItemProps) {
  return (
    <Link href={href} className="w-full">
      <Button
        variant="ghost"
        className={cn("w-full justify-start gap-2 font-normal", active && "bg-muted font-medium")}
      >
        {icon}
        {label}
      </Button>
    </Link>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    // Çıkış yap - cookie'yi sil
    document.cookie = "admin_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/admin"
  }

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">Blog Yönetimi</h1>
      </div>
      <div className="flex-1 py-4 flex flex-col gap-1 px-3">
        <SidebarItem
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Kontrol Paneli"
          href="/admin/dashboard"
          active={pathname === "/admin/dashboard"}
        />
        <SidebarItem
          icon={<FileText className="h-4 w-4" />}
          label="Yazılar"
          href="/admin/dashboard/posts"
          active={
            pathname === "/admin/dashboard/posts" ||
            pathname.includes("/admin/dashboard/edit-post") ||
            pathname.includes("/admin/dashboard/new-post")
          }
        />
        <SidebarItem
          icon={<FolderOpen className="h-4 w-4" />}
          label="Kategoriler"
          href="/admin/dashboard/categories"
          active={pathname === "/admin/dashboard/categories" || pathname.includes("/admin/dashboard/categories/")}
        />
        <SidebarItem
          icon={<Users className="h-4 w-4" />}
          label="Kullanıcılar"
          href="/admin/dashboard/users"
          active={pathname === "/admin/dashboard/users"}
        />
        <SidebarItem
          icon={<BarChart2 className="h-4 w-4" />}
          label="İstatistikler"
          href="/admin/dashboard/stats"
          active={pathname === "/admin/dashboard/stats"}
        />
        <SidebarItem
          icon={<Settings className="h-4 w-4" />}
          label="Ayarlar"
          href="/admin/dashboard/settings"
          active={pathname === "/admin/dashboard/settings"}
        />
      </div>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  )
}
