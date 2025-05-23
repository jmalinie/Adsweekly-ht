"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { getCategoryById, updateCategory } from "@/app/actions/category-actions"
import { toast } from "@/hooks/use-toast"

interface EditCategoryPageProps {
  params: {
    id: string
  }
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const category = await getCategoryById(params.id)

        if (!category) {
          toast({
            title: "Error",
            description: "Category not found.",
            variant: "destructive",
          })
          router.push("/admin/dashboard/categories")
          return
        }

        setName(category.name)
        setDescription(category.description || "")
        setIsFeatured(category.is_featured || false)
        if (category.image_url) {
          setCurrentImageUrl(category.image_url)
        }
      } catch (error) {
        console.error("Category fetch error:", error)
        toast({
          title: "Error",
          description: "An error occurred while loading the category.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategory()
  }, [params.id, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setRemoveCurrentImage(true)
  }

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
    setImage(null)

    if (currentImageUrl) {
      setRemoveCurrentImage(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("isFeatured", isFeatured.toString())

      if (image) {
        formData.append("image", image)
      }

      if (currentImageUrl && !removeCurrentImage) {
        formData.append("currentImageUrl", currentImageUrl)
      }

      formData.append("removeImage", removeCurrentImage.toString())

      const result = await updateCategory(params.id, formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Category updated successfully.",
        })
        router.push("/admin/dashboard/categories")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the category.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <AdminHeader />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="flex items-center mb-6">
            <Link href="/admin/dashboard/categories" passHref>
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Edit Category</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="is-featured">Featured Store</Label>
                <Switch id="is-featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
              <p className="text-sm text-muted-foreground">Featured stores will be displayed on the homepage.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                required
              />
              <p className="text-sm text-muted-foreground">
                The category name will be automatically converted to a URL-friendly slug.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Category description (optional)"
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">This description may be displayed on category pages.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Category Image</Label>
              {imagePreview ? (
                <div className="relative mt-2 mb-4">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Category preview"
                    className="w-full max-h-64 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ) : currentImageUrl && !removeCurrentImage ? (
                <div className="relative mt-2 mb-4">
                  <img
                    src={currentImageUrl || "/placeholder.svg"}
                    alt="Current category image"
                    className="w-full max-h-64 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setRemoveCurrentImage(true)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Image</span>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload an image to represent this category. Recommended size: 800x600px.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Link href="/admin/dashboard/categories" passHref>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Updating...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update
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
