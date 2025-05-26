"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Basit bir oturum kontrolü
    const checkSession = async () => {
      try {
        const response = await fetch("/api/check-session")
        const data = await response.json()

        if (!data.authenticated) {
          router.push("/admin")
        }
      } catch (error) {
        console.error("Session check error:", error)
        // Hata durumunda bile yükleniyor durumunu kaldır
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>Blog yönetim paneline hoş geldiniz</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Bu panel üzerinden blog yazılarınızı, kategorileri ve kullanıcıları yönetebilirsiniz.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Yazılar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Tüm blog yazılarınızı yönetin</p>
                    <Button className="mt-4" variant="outline" onClick={() => router.push("/admin/dashboard/posts")}>
                      Yazıları Görüntüle
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Kategoriler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Kategori yapılandırmasını yönetin</p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => router.push("/admin/dashboard/categories")}
                    >
                      Kategorileri Görüntüle
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ayarlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Site ayarlarını yapılandırın</p>
                    <Button className="mt-4" variant="outline" onClick={() => router.push("/admin/dashboard/settings")}>
                      Ayarları Görüntüle
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
