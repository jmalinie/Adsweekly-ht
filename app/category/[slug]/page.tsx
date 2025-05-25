import {
  getPostsByCategory,
  getStaticCategories,
} from "@/app/actions/post-actions"
import { BlogCard } from "@/components/blog-card"
import { OptimizedImage } from "@/components/optimized-image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Store } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const revalidate = 1800 // 30 minutes ISR

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  try {
    const { category, posts } = await getPostsByCategory(params.slug)

    if (!category) {
      notFound()
    }

    // JSON-LD structured data for category page
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${category.name} Articles`,
      description:
        category.description || `Articles in ${category.name} category`,
      url: `/category/${category.slug}`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: posts.length,
        itemListElement: posts.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "BlogPosting",
            headline: post.title,
            url: `/${post.slug}`,
            datePublished: post.published_at || post.created_at,
          },
        })),
      },
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="container mx-auto px-4 py-8">
          {/* Kategori başlık bölümü */}
          <div className="mb-8">
            <Link
              href="/"
              passHref
            >
              <Button
                variant="ghost"
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>

            <div className="flex flex-col items-center text-center">
              {category.image_url && (
                <OptimizedImage
                  src={category.image_url}
                  alt={category.name}
                  size="lg"
                  className="mb-4"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
                {category.description && (
                  <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No articles in this category yet
              </h3>
              <p className="text-muted-foreground mb-6">
                There are no published articles in the "{category.name}"
                category yet.
              </p>
              <Link
                href="/"
                passHref
              >
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                />
              ))}
            </div>
          )}
        </div>
      </>
    )
  } catch (error) {
    console.error("Error rendering category page:", error)
    notFound()
  }
}

// Generate static params for all categories - static generation için
export async function generateStaticParams() {
  try {
    const categories = await getStaticCategories()

    return categories.map((category) => ({
      slug: category.slug,
    }))
  } catch (error) {
    console.error("Error generating static params for categories:", error)
    return []
  }
}

// Generate metadata
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  try {
    const { category, posts } = await getPostsByCategory(params.slug)

    if (!category) {
      return {
        title: "Category Not Found",
      }
    }

    return {
      title: `${category.name} Articles - Modern Blog`,
      description:
        category.description ||
        `Browse all articles in ${
          category.name
        } category. Find tutorials, guides, and insights about ${category.name.toLowerCase()}.`,
      keywords: [
        category.name,
        "articles",
        "tutorials",
        "technology",
        "programming",
      ],
      openGraph: {
        title: `${category.name} Articles - Modern Blog`,
        description:
          category.description ||
          `Browse all articles in ${category.name} category`,
        type: "website",
        url: `/category/${category.slug}`,
        images: [
          {
            url: category.image_url || "/og-category.png",
            width: 1200,
            height: 630,
            alt: `${category.name} Articles`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${category.name} Articles - Modern Blog`,
        description:
          category.description ||
          `Browse all articles in ${category.name} category`,
        images: [category.image_url || "/og-category.png"],
      },
      alternates: {
        canonical: `/category/${category.slug}`,
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Category",
      description: "Browse articles in this category",
    }
  }
}
