"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CategoryBadge } from "@/components/category-badge"
import { ImageLightbox } from "@/components/image-lightbox"
import { getPostBySlug } from "@/app/actions/post-actions"
import { formatDate } from "@/lib/utils"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

interface PostData {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  status: string
  view_count: number | null
  published_at: string | null
  created_at: string
  updated_at: string
  author_id: string | null
  users: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  } | null
  post_categories: {
    categories: {
      id: string
      name: string
      slug: string
      image_url: string | null
    }
  }[]
}

export default function BlogPostClientPage({ params }: BlogPostPageProps) {
  const router = useRouter()
  const [post, setPost] = useState<PostData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!params.slug) {
          throw new Error("Slug is missing")
        }

        const postData = await getPostBySlug(params.slug)
        if (!postData || postData.status !== "published") {
          router.push("/404")
          return
        }
        setPost(postData)
      } catch (err) {
        console.error("Error fetching post:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch post"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.slug, router])

  useEffect(() => {
    if (!post) return

    // Add click handlers to all images in the content
    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLImageElement
      if (target.tagName === "IMG") {
        e.preventDefault()
        setLightboxImage({
          src: target.src,
          alt: target.alt || "Blog image",
        })
      }
    }

    // Find all images in the content and add click handlers
    const contentElement = document.querySelector(".blog-content")
    if (contentElement) {
      const images = contentElement.querySelectorAll("img")
      images.forEach((img) => {
        img.style.cursor = "pointer"
        img.style.transition = "transform 0.2s ease-in-out"
        img.addEventListener("click", handleImageClick)

        // Add hover effect
        img.addEventListener("mouseenter", () => {
          img.style.transform = "scale(1.02)"
        })
        img.addEventListener("mouseleave", () => {
          img.style.transform = "scale(1)"
        })
      })

      // Cleanup function
      return () => {
        images.forEach((img) => {
          img.removeEventListener("click", handleImageClick)
        })
      }
    }
  }, [post])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Post</h1>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <Link href="/" passHref>
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Link href="/" passHref>
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const postDate = formatDate(post.published_at || post.created_at)
  const categories = post.post_categories ? post.post_categories.map((pc) => pc.categories).filter(Boolean) : []

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.featured_image || "/og-image.png",
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/blog/${post.slug}`,
    },
    articleSection: categories.map((cat) => cat.name),
    keywords: categories.map((cat) => cat.name).join(", "),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container mx-auto px-4 py-8">
        <Link href="/blog" passHref>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Articles
          </Button>
        </Link>

        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-4" dir="ltr" style={{ direction: "ltr" }}>
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <time dateTime={post.published_at || post.created_at}>{postDate}</time>
              </div>
              {categories.length > 0 && (
                <div className="flex items-center flex-wrap gap-2">
                  <Tag className="h-4 w-4" />
                  {categories.map((category) => (
                    <CategoryBadge key={category.id} category={category} />
                  ))}
                </div>
              )}
            </div>

            {post.featured_image && (
              <div className="relative w-full mb-8">
                <div
                  className="relative cursor-pointer group overflow-hidden rounded-lg"
                  onClick={() => setLightboxImage({ src: post.featured_image!, alt: post.title })}
                >
                  <Image
                    src={post.featured_image || "/placeholder.svg"}
                    alt={post.title}
                    width={1200}
                    height={600}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    priority
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-black/90 px-4 py-2 rounded-full text-sm font-medium">
                      Click to enlarge
                    </div>
                  </div>
                </div>
              </div>
            )}
          </header>

          <div
            className="blog-content prose max-w-none dark:prose-invert prose-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
            dir="ltr"
            style={{
              direction: "ltr",
              textAlign: "left",
            }}
          />

          {/* Related Categories */}
          {categories.length > 0 && (
            <footer className="mt-12 pt-8 border-t">
              <h3 className="text-lg font-semibold mb-4">View all ads for this store:</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <CategoryBadge key={category.id} category={category} />
                ))}
              </div>
            </footer>
          )}
        </article>
      </div>

      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src || "/placeholder.svg"}
          alt={lightboxImage.alt}
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  )
}
