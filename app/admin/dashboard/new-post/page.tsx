"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { RichTextEditor } from "@/components/rich-text-editor"
import { ImageUploader } from "@/components/image-uploader"
import { createPost, getCategories } from "@/app/actions/post-actions"
import { toast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  slug: string
}

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [status, setStatus] = useState("draft")
  const [featuredImage, setFeaturedImage] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesData = await getCategories()
      setCategories(categoriesData)
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("excerpt", excerpt)
      formData.append("status", status)

      if (featuredImage) {
        formData.append("featuredImage", featuredImage)
      }

      selectedCategories.forEach((categoryId) => {
        formData.append("categories", categoryId)
      })

      const result = await createPost(formData)

      if (result.error) {
        toast({
          title: "Hata",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Başarılı",
          description: "Blog yazısı başarıyla oluşturuldu.",
        })
        router.push("/admin/dashboard")
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Blog yazısı oluşturulurken bir hata oluştu.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId])
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="flex items-center mb-6">
            <Link href="/admin/dashboard" passHref>
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Geri</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Yeni Blog Yazısı</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Yazı başlığı"
                required
                dir="ltr"
                style={{ direction: "ltr" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Özet</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Yazı özeti..."
                className="min-h-[100px]"
                dir="ltr"
                style={{ direction: "ltr" }}
              />
            </div>

            <div className="space-y-2">
              <Label>Öne Çıkan Görsel</Label>
              <p className="text-sm text-muted-foreground">
                Öne çıkan görsel seçmezseniz, yazınızdaki ilk görsel otomatik olarak kullanılacaktır.
              </p>
              {featuredImage ? (
                <div className="relative mt-2 mb-4">
                  <img
                    src={featuredImage || "/placeholder.svg"}
                    alt="Öne çıkan görsel"
                    className="w-full max-h-64 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFeaturedImage("")}
                  >
                    Kaldır
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  <ImageUploader onImageUploaded={setFeaturedImage} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">İçerik</Label>
              <RichTextEditor initialValue={content} onChange={setContent} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="published">Yayında</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kategoriler</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                      />
                      <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Kaydediliyor...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
