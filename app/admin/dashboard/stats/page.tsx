"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Eye, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface Stats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalUsers: number
  totalViews: number
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalUsers: 0,
    totalViews: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [recentPosts, setRecentPosts] = useState<any[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()

        // Toplam yazı sayısı
        const { count: totalPosts, error: totalPostsError } = await supabase
          .from("posts")
          .select("*", { count: "exact" })

        // Yayınlanmış yazı sayısı
        const { count: publishedPosts, error: publishedPostsError } = await supabase
          .from("posts")
          .select("*", { count: "exact" })
          .eq("status", "published")

        // Taslak yazı sayısı
        const { count: draftPosts, error: draftPostsError } = await supabase
          .from("posts")
          .select("*", { count: "exact" })
          .eq("status", "draft")

        // Toplam kullanıcı sayısı
        const { count: totalUsers, error: totalUsersError } = await supabase
          .from("users")
          .select("*", { count: "exact" })

        // Toplam görüntülenme sayısı
        const { data: viewsData, error: viewsError } = await supabase.from("posts").select("view_count")

        const totalViews = viewsData?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0

        // Son yazılar
        const { data: recentPostsData, error: recentPostsError } = await supabase
          .from("posts")
          .select("id, title, status, created_at, view_count")
          .order("created_at", { ascending: false })
          .limit(5)

        if (
          totalPostsError ||
          publishedPostsError ||
          draftPostsError ||
          totalUsersError ||
          viewsError ||
          recentPostsError
        ) {
          throw new Error("Veri getirme hatası")
        }

        setStats({
          totalPosts: totalPosts || 0,
          publishedPosts: publishedPosts || 0,
          draftPosts: draftPosts || 0,
          totalUsers: totalUsers || 0,
          totalViews: totalViews,
        })

        setRecentPosts(recentPostsData || [])
      } catch (error) {
        console.error("İstatistik getirme hatası:", error)
        toast({
          title: "Hata",
          description: "İstatistikler yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <AdminHeader />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">İstatistikler</h1>

          {isLoading ? (
            <div className="text-center py-12">
              <p>Yükleniyor...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Yazı</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPosts}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.publishedPosts} yayında, {stats.draftPosts} taslak
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">Kayıtlı kullanıcı</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalViews}</div>
                    <p className="text-xs text-muted-foreground">Tüm yazılar</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Son Aktivite</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {recentPosts.length > 0 ? new Date(recentPosts[0].created_at).toLocaleDateString("tr-TR") : "-"}
                    </div>
                    <p className="text-xs text-muted-foreground">Son yazı tarihi</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Son Yazılar</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentPosts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Henüz yazı bulunmamaktadır.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Başlık</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Durum</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Tarih</th>
                            <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">
                              Görüntülenme
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentPosts.map((post) => (
                            <tr key={post.id} className="border-b">
                              <td className="py-3 px-4">{post.title}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    post.status === "published"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  }`}
                                >
                                  {post.status === "published" ? "Yayında" : "Taslak"}
                                </span>
                              </td>
                              <td className="py-3 px-4">{new Date(post.created_at).toLocaleDateString("tr-TR")}</td>
                              <td className="py-3 px-4 text-right">{post.view_count || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
