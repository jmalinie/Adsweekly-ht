"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/optimized-image"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [category, setCategory] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()

        // First get the category
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", params.slug)
          .single()

        if (categoryError) {
          console.error("Error fetching category:", categoryError)
          setError("Failed to load category")
          setIsLoading(false)
          return
        }

        if (!categoryData) {
          setIsLoading(false)
          notFound()
          return
        }

        setCategory(categoryData)

        // Then get posts in this category
        const { data: postCategoriesData, error: postsError } = await supabase
          .from("post_categories")
          .select(`
            post_id,
            posts (
              id,
              title,
              slug,
              excerpt,
              featured_image,
              status,
              published_at,
              created_at,
              users (
                username,
                full_name
              )
            )
          `)
          .eq("category_id", categoryData.id)
          .eq("posts.status", "published")
          .order("post_id", { ascending: false })

        if (postsError) {
          console.error("Error fetching posts:", postsError)
          setError("Failed to load posts")
          setIsLoading(false)
          return
        }

        // Extract posts from the nested structure
        const validPosts = postCategoriesData.map((item) => item.posts).filter(Boolean)

        setPosts(validPosts)
        setIsLoading(false)
      } catch (error) {
        console.error("Error rendering category page:", error)
        setError("An unexpected error occurred")
        setIsLoading(false)
      }
    }

    fetchCategoryData()
  }, [params.slug])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/" passHref>
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!category) {
    return notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category title section */}
      <div className="mb-8">
        <Link href="/" passHref>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="flex flex-col items-center text-center">
          {category.image_url && (
            <OptimizedImage src={category.image_url} alt={category.name} size="lg" className="mb-4" />
          )}
          <div>
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground max-w-2xl mx-auto mb-2">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No articles in this category yet</h3>
          <p className="text-muted-foreground mb-6">
            There are no published articles in the "{category.name}" category yet.
          </p>
          <Link href="/" passHref>
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg overflow-hidden flex flex-col">
              {post.featured_image && (
                <div className="relative h-48">
                  <img
                    src={post.featured_image || "/placeholder.svg"}
                    alt={post.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="p-4 flex-grow">
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt || ""}</p>
                <Link href={`/${category.slug}/${post.slug}`} passHref>
                  <Button variant="outline" size="sm">
                    Read More
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
