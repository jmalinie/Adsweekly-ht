import { Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

interface Post {
  id: string
  title: string
  excerpt: string | null
  slug: string
  featured_image: string | null
  published_at: string | null
  created_at: string
  users?: {
    username: string
    full_name: string | null
  } | null
  post_categories?: {
    categories: {
      name: string
      slug: string
    }
  }[]
}

interface BlogCardProps {
  post: Post
}

export function BlogCard({ post }: BlogCardProps) {
  // Safety check to prevent rendering undefined posts
  if (!post || !post.id) {
    return null
  }

  // Safely extract post data with fallbacks
  const title = post.title || "Untitled Post"
  const excerpt = post.excerpt || ""
  const categorySlug =
    post.post_categories?.[0]?.categories?.slug || "uncategorized"
  const slug = post.slug || ""
  const featuredImage =
    post.featured_image ||
    "/placeholder.svg?height=200&width=400&query=blog+post"
  const postDate = formatDate(post.published_at || post.created_at)

  return (
    <Card className="overflow-hidden h-full flex flex-col group">
      <Link
        href={`/${categorySlug}/${slug}`}
        className="block"
      >
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={featuredImage || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        </div>
      </Link>
      <CardHeader className="flex-grow">
        <Link
          href={`/${slug}`}
          className="hover:underline"
        >
          <h3 className="text-xl font-bold line-clamp-2">{title}</h3>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow-0">
        <p className="text-muted-foreground line-clamp-3">{excerpt}</p>
      </CardContent>
      <CardFooter className="flex justify-start text-sm text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="mr-1 h-4 w-4" />
          {postDate}
        </div>
      </CardFooter>
    </Card>
  )
}
