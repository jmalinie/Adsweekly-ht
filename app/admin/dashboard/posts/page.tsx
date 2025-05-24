"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, MoreHorizontal, Plus, Trash, Eye } from "lucide-react"

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
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
  }, [])

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

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Yazıları</h1>
        <Link href="/admin/dashboard/new-post" passHref>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Yazı
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <p>Yükleniyor...</p>
          </div>
        ) : posts.length === 0 ? (
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
                          post.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {post.status === "published" ? "Yayında" : "Taslak"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(post.published_at || post.created_at)}</div>
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
                            <Link href={`/admin/dashboard/edit-post/${post.id}`} className="flex items-center w-full">
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
    </div>
  )
}
