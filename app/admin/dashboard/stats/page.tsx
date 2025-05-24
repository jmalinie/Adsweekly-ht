"use client"

import { useState, useEffect } from "react"
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

        // Total posts count
        const { count: totalPosts, error: totalPostsError } = await supabase
          .from("posts")
          .select("*", { count: "exact" })

        // Published posts count
        const { count: publishedPosts, error: publishedPostsError } = await supabase
          .from("posts")
          .select("*", { count: "exact" })
          .eq("status", "published")

        // Draft posts count
        const { count: draftPosts, error: draftPostsError } = await supabase
          .from("posts")
          .select("*", { count: "exact" })
          .eq("status", "draft")

        // Total users count
        const { count: totalUsers, error: totalUsersError } = await supabase
          .from("users")
          .select("*", { count: "exact" })

        // Total views count
        const { data: viewsData, error: viewsError } = await supabase.from("posts").select("view_count")

        const totalViews = viewsData?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0

        // Recent posts
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
          throw new Error("Data fetch error")
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
        console.error("Statistics fetch error:", error)
        toast({
          title: "Error",
          description: "An error occurred while loading statistics.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Statistics</h1>

      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.publishedPosts} published, {stats.draftPosts} draft
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <p className="text-xs text-muted-foreground">All posts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentPosts.length > 0 ? new Date(recentPosts[0].created_at).toLocaleDateString("en-US") : "-"}
                </div>
                <p className="text-xs text-muted-foreground">Last post date</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {recentPosts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No posts found yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Title</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Views</th>
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
                              {post.status === "published" ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="py-3 px-4">{new Date(post.created_at).toLocaleDateString("en-US")}</td>
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
    </div>
  )
}
