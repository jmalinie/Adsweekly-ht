import type { Metadata } from "next"

import {
  getPostBySlug,
  getStaticPublishedPosts,
} from "@/app/actions/post-actions"

export const revalidate = 3600 // 1 hour ISR
export const dynamicParams = false // Sadece generateStaticParams'dan gelen slug'ları kabul et

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  // Default metadata
  const defaultMetadata: Metadata = {
    title: "Article Not Found",
    description: "The requested article could not be found.",
  }

  try {
    // Params kontrolü
    if (!params || !slug) {
      return defaultMetadata
    }

    const post = await getPostBySlug(slug)

    if (!post) {
      return defaultMetadata
    }

    const categories =
      post.post_categories?.map((pc) => pc.categories).filter(Boolean) || []

    return {
      title: post.title || "Untitled Post",
      description:
        post.excerpt || `Read ${post.title || "this article"} on Modern Blog.`,
      keywords: categories
        .map((cat) => cat.name || "")
        .filter(Boolean)
        .join(", "),
      openGraph: {
        title: post.title || "Untitled Post",
        description: post.excerpt || post.title || "Blog post",
        type: "article",
        url: `/${categories[0].slug}/${post.slug}`,
        images: [
          {
            url: post.featured_image || "/og-image.png",
            width: 1200,
            height: 630,
            alt: post.title || "Blog post image",
          },
        ],
        publishedTime: post.published_at || post.created_at,
        modifiedTime: post.updated_at || post.published_at || post.created_at,
        section:
          categories.length > 0
            ? categories[0].name || "Technology"
            : "Technology",
        tags: categories.map((cat) => cat.name || "").filter(Boolean),
      },
      twitter: {
        card: "summary_large_image",
        title: post.title || "Untitled Post",
        description: post.excerpt || post.title || "Blog post",
        images: [post.featured_image || "/og-image.png"],
      },
      alternates: {
        canonical: `/${categories[0].slug}/${post.slug}`,
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return defaultMetadata
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

 return slug
}

// generateStaticParams - sadece geçerli blog post slug'larını döndür
export async function generateStaticParams() {
  try {
    const posts = await getStaticPublishedPosts()

    // Sadece geçerli slug'ları döndür - statik dosyaları hariç tut
    return posts
      .filter((post) => {
        // Slug kontrolü
        if (!post.slug) return false

        // Nokta içeren slug'ları hariç tut (dosya uzantısı)
        if (post.slug.includes(".")) return false

        // Bilinen statik dosya isimlerini hariç tut
        const staticFiles = [
          "favicon",
          "icon",
          "apple-icon",
          "apple-touch-icon",
          "robots",
          "sitemap",
          "manifest",
          "og-image",
          "og-home",
        ]

        if (
          staticFiles.some((file) => post.slug.toLowerCase().includes(file))
        ) {
          return false
        }

        return true
      })
      .map((post) => ({
        slug: post.slug,
      }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}
