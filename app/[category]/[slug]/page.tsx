import { ArrowLeft, Calendar, Tag } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import {
  getPostBySlug,
  getStaticPublishedPosts,
} from "@/app/actions/post-actions"
import { BlogContent } from "@/components/BlogContent"
import { BlogFeaturedImage } from "@/components/BlogFeaturedImage"
import { CategoryBadge } from "@/components/category-badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

export const revalidate = 3600 // 1 hour ISR
export const dynamicParams = false // Sadece generateStaticParams'dan gelen slug'ları kabul et

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // Params kontrolü
  if (!params || !slug) {
    console.error("No params or slug provided")
    return notFound()
  }

  try {
    const post = await getPostBySlug(slug)

    if (!post) {
      console.error(`Post with slug "${slug}" not found`)
      return notFound()
    }

    if (post.status !== "published") {
      console.error(
        `Post with slug "${slug}" is not published (status: ${post.status})`
      )
      return notFound()
    }

    const postDate = formatDate(post.published_at || post.created_at)

    // Kategori verilerini güvenli bir şekilde işleyelim - default değerlerle
    const categories =
      post.post_categories?.map((pc) => pc.categories).filter(Boolean) || []
    const primaryCategory = categories.length > 0 ? categories[0] : null

    // JSON-LD structured data for SEO
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title || "Untitled",
      description: post.excerpt || post.title || "Blog post",
      image: post.featured_image || "/og-image.png",
      datePublished:
        post.published_at || post.created_at || new Date().toISOString(),
      dateModified:
        post.updated_at ||
        post.published_at ||
        post.created_at ||
        new Date().toISOString(),
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `/${post.slug}`,
      },
      articleSection: categories.map((cat) => cat.name || "Uncategorized"),
      keywords: categories
        .map((cat) => cat.name || "")
        .filter(Boolean)
        .join(", "),
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="container mx-auto px-4 py-8">
          {primaryCategory ? (
            <Link
              href={`/category/${primaryCategory.slug}`}
              passHref
            >
              <Button
                variant="ghost"
                className="mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                View all {primaryCategory.name} Ads
              </Button>
            </Link>
          ) : (
            <Link
              href="/"
              passHref
            >
              <Button
                variant="ghost"
                className="mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          )}

          <article className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h1
                className="text-3xl font-bold mb-4"
                dir="ltr"
                style={{ direction: "ltr" }}
              >
                {post.title || "Untitled Post"}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  <time
                    dateTime={
                      post.published_at ||
                      post.created_at ||
                      new Date().toISOString()
                    }
                  >
                    {postDate}
                  </time>
                </div>
                {categories.length > 0 && (
                  <div className="flex items-center flex-wrap gap-2">
                    <Tag className="h-4 w-4" />
                    {categories.map((category) => (
                      <CategoryBadge
                        key={category.id}
                        category={category}
                      />
                    ))}
                  </div>
                )}
              </div>

              {post.featured_image && (
                <BlogFeaturedImage
                  src={post.featured_image}
                  alt={post.title || "Featured image"}
                />
              )}
            </header>

            <BlogContent content={post.content || ""} />

            {/* Related Categories */}
            {categories.length > 0 && (
              <footer className="mt-12 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-4">
                  View all ads for this store:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <CategoryBadge
                      key={category.id}
                      category={category}
                    />
                  ))}
                </div>
              </footer>
            )}
          </article>
        </div>
      </>
    )
  } catch (error) {
    console.error("Error rendering blog post:", error)
    return notFound()
  }
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
