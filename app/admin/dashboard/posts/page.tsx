"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, MoreHorizontal, Plus, Trash, Eye } from "lucide-react"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getPosts, deletePost } from "@/app/actions/post-actions"
import { formatDate } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

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

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Basit bir oturum kontrolü
    const isLoggedIn = localStorage.getItem("admin_logged_in") === "true"

    if (!isLoggedIn) {
      router.push("/admin")
      return
    }

    const fetchPosts = async () => {
      try {
        const postsData = await getPosts()
        setPosts(postsData)
      } catch (error) {
        console.error("Post getirme hatası:", error)
        toast({
          title: "Hata",
          description: "Blog yazıları yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [router])

  const handleDeletePost = async (id: string) => {
    if (confirm("Bu blog yazısını silmek istediğinizden emin misiniz?")) {
      try {
        const result = await deletePost(id)

        if (result.error) {
          toast({
            title: "Hata",
            description: result.error,
            variant: "destructive",
          })
        } else {
          setPosts(posts.filter((post) => post.id !== id))
          toast({
            title: "Başarılı",
            description: "Blog yazısı başarıyla silindi.",
          })
        }
      } catch (error) {
        console.error("Post silme hatası:", error)
        toast({
          title: "Hata",
          description: "Blog yazısı silinirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    }
  }

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
          <h1 className="text-2xl font-bold mb-6">Blog Yazıları</h1>
          <p>Buradan blog yazılarınızı yönetebilirsiniz.</p>

          <div className="mt-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => {
                // Çıkış yap
                localStorage.removeItem("admin_logged_in")
                router.push("/admin")
              }}
            >
              Çıkış Yap
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
            {posts.length === 0 ? (
              <div className="p-8 text-center">
                <p>Henüz blog yazısı bulunmamaktadır.</p>
                <Link href="/admin/dashboard/new-post" passHref>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    İlk Yazını Oluştur
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Başlık
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Yazar
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">{post.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              post.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {post.status === "published" ? "Yayında" : "Taslak"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(post.published_at || post.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {post.users?.full_name || post.users?.username || "Anonim"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">İşlemler</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link
                                  href={`/admin/dashboard/edit-post/${post.id}`}
                                  className="flex items-center w-full"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Düzenle
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link href={`/${post.slug}`} target="_blank" className="flex items-center w-full">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Görüntüle
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeletePost(post.id)}>
                                <Trash className="mr-2 h-4 w-4" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
