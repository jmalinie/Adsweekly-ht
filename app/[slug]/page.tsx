import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Tag } from "lucide-react"
import type { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { CategoryBadge } from "@/components/category-badge"
import { BlogPostClient } from "@/components/blog-post-client"
import { getPostBySlug, getStaticPublishedPosts } from "@/app/actions/post-actions"
import { formatDate } from "@/lib/utils"

export const revalidate = 3600 // 1 hour ISR

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

// Dosya uzantılarını kontrol eden yardımcı fonksiyon - Genişletilmiş versiyon
function hasFileExtension(slug: string): boolean {
  // Yaygın dosya uzantılarını kontrol et
  const fileExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".svg",
    ".webp",
    ".ico",
    ".bmp",
    ".tiff",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".mp3",
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".wav",
    ".zip",
    ".rar",
    ".tar",
    ".gz",
    ".7z",
    ".html",
    ".htm",
    ".css",
    ".js",
    ".json",
    ".xml",
    ".txt",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".otf",
    ".webmanifest",
  ]

  // Dosya uzantısı kontrolü
  const hasExtension = fileExtensions.some((ext) => slug.toLowerCase().endsWith(ext))

  // Nokta içeren ve muhtemelen dosya olan slug'ları kontrol et
  const isDotFile = slug.includes(".") && /\.[a-zA-Z0-9]{1,6}$/.test(slug)

  return hasExtension || isDotFile
}

// Favicon ve yaygın statik dosya isimlerini kontrol eden fonksiyon
function isCommonStaticFile(slug: string): boolean {
  const commonFiles = [
    "favicon",
    "icon",
    "apple-icon",
    "apple-touch-icon",
    "android-icon",
    "site.webmanifest",
    "robots.txt",
    "sitemap.xml",
    "manifest",
    "browserconfig",
    "og-image",
    "og-home",
    "twitter-image",
    "opengraph-image",
  ]

  return commonFiles.some((file) => slug.toLowerCase().includes(file))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    // Validate slug format - dosya uzantısı kontrolü
    if (!params.slug || typeof params.slug !== "string" || params.slug.trim() === "") {
      console.error(`Invalid slug: "${params.slug}"`)
      return notFound()
    }

    // Dosya uzantısı kontrolü
    if (hasFileExtension(params.slug)) {
      console.error(`Slug appears to be a file: "${params.slug}"`)
      return notFound()
    }

    // Yaygın statik dosya kontrolü
    if (isCommonStaticFile(params.slug)) {
      console.error(`Slug appears to be a common static file: "${params.slug}"`)
      return notFound()
    }

    const post = await getPostBySlug(params.slug)

    if (!post) {
      console.error(`Post with slug "${params.slug}" not found`)
      return notFound()
    }

    if (post.status !== "published") {
      console.error(`Post with slug "${params.slug}" is not published (status: ${post.status})`)
      return notFound()
    }

    const postDate = formatDate(post.published_at || post.created_at)
    // Kategori verilerini güvenli bir şekilde işleyelim
    const categories = post.post_categories ? post.post_categories.map((pc) => pc.categories).filter(Boolean) : []

    // Get the primary category (first one)
    const primaryCategory = categories.length > 0 ? categories[0] : null

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
        "@id": `/${post.slug}`,
      },
      articleSection: categories.map((cat) => cat.name),
      keywords: categories.map((cat) => cat.name).join(", "),
    }

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="container mx-auto px-4 py-8">
          {primaryCategory ? (
            <Link href={`/category/${primaryCategory.slug}`} passHref>
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                View all {primaryCategory.name} Ads
              </Button>
            </Link>
          ) : (
            <Link href="/" passHref>
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          )}

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

              {post.featured_image && <BlogPostClient.FeaturedImage src={post.featured_image} alt={post.title} />}
            </header>

            <BlogPostClient.Content content={post.content} />

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
      </>
    )
  } catch (error) {
    console.error("Error rendering blog post:", error)
    // Don't throw the error, just return notFound
    return notFound()
  }
}

// generateStaticParams fonksiyonunu güncelle
export async function generateStaticParams() {
  try {
    const posts = await getStaticPublishedPosts()

    // Sadece geçerli slug'ları döndür
    return posts
      .filter((post) => {
        // Slug'ın geçerli olup olmadığını kontrol et
        return post.slug && !post.slug.includes(".") && !hasFileExtension(post.slug) && !isCommonStaticFile(post.slug)
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
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    // Validate slug
    if (
      !params.slug ||
      typeof params.slug !== "string" ||
      hasFileExtension(params.slug) ||
      isCommonStaticFile(params.slug)
    ) {
      return {
        title: "Article Not Found",
      }
    }

    const post = await getPostBySlug(params.slug)

    if (!post) {
      return {
        title: "Article Not Found",
      }
    }

    const categories = post.post_categories ? post.post_categories.map((pc) => pc.categories).filter(Boolean) : []

    return {
      title: post.title,
      description:
        post.excerpt || `Read ${post.title} on Modern Blog. Latest insights about technology and software development.`,
      keywords: categories.map((cat) => cat.name).join(", "),
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        type: "article",
        url: `/${post.slug}`,
        images: [
          {
            url: post.featured_image || "/og-image.png",
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        publishedTime: post.published_at || post.created_at,
        modifiedTime: post.updated_at || post.published_at || post.created_at,
        section: categories.length > 0 ? categories[0].name : "Technology",
        tags: categories.map((cat) => cat.name),
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt || post.title,
        images: [post.featured_image || "/og-image.png"],
      },
      alternates: {
        canonical: `/${post.slug}`,
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Article",
      description: "Read this article on our blog",
    }
  }
}
