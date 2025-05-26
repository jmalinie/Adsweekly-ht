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
import { RichTextEditor } from "@/components/rich-text-editor"
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
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Kategori yükleme hatası:", error)
        toast({
          title: "Hata",
          description: "Kategoriler yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
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
          description:
            "Blog yazısı başarıyla oluşturuldu. Öne çıkan görsel yazınızdaki ilk görsel olarak otomatik seçildi.",
        })
        router.push("/admin/dashboard")
      }
    } catch (error) {
      console.error("Blog yazısı oluşturma hatası:", error)
      toast({
        title: "Hata",
        description: "Blog yazısı oluşturulurken bir hata oluştu.",
        variant: "destructive",
      })
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
    <div className="space-y-6">
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
            style={{ direction: "ltr", textAlign: "left" }}
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
            style={{ direction: "ltr", textAlign: "left" }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">İçerik</Label>
          <div className="text-sm text-muted-foreground mb-2">
            💡 İpucu: Yazınızdaki ilk görsel otomatik olarak öne çıkan görsel olarak kullanılacaktır.
          </div>
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
              {categories.length > 0 ? (
                categories.map((category) => (
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Kategori bulunamadı.</p>
              )}
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
    </div>
  )
}
