import Link from "next/link"
import { ArrowRight, Store } from "lucide-react"
import type { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { BlogCard } from "@/components/blog-card"
import { getPublishedPosts, getFeaturedCategories } from "@/app/actions/post-actions"
import { OptimizedImage } from "@/components/optimized-image"
import { getSettingValue, getDefaultSettings } from "@/lib/settings"

export const revalidate = 3600 // 1 hour ISR

export async function generateMetadata(): Promise<Metadata> {
  try {
    const defaultSettings = getDefaultSettings()

    const [siteTitle, siteDescription] = await Promise.allSettled([
      getSettingValue("site_title", defaultSettings.site_title),
      getSettingValue("site_description", defaultSettings.site_description),
    ])

    const title = siteTitle.status === "fulfilled" ? siteTitle.value : defaultSettings.site_title
    const description =
      siteDescription.status === "fulfilled" ? siteDescription.value : defaultSettings.site_description

    return {
      title: `${title} - Latest Technology Articles`,
      description: description,
      openGraph: {
        title: `${title} - Latest Technology Articles`,
        description: description,
        type: "website",
        url: "/",
        images: [
          {
            url: "/og-home.png",
            width: 1200,
            height: 630,
            alt: `${title} Homepage`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} - Latest Technology Articles`,
        description: description,
        images: ["/og-home.png"],
      },
      alternates: {
        canonical: "/",
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    const defaultSettings = getDefaultSettings()
    return {
      title: `${defaultSettings.site_title} - Latest Technology Articles`,
      description: defaultSettings.site_description,
    }
  }
}

export default async function Home() {
  try {
    const defaultSettings = getDefaultSettings()

    // Fetch data with error handling
    const [postsResult, categoriesResult, siteTitleResult, siteDescriptionResult] = await Promise.allSettled([
      getPublishedPosts().catch(() => []),
      getFeaturedCategories().catch(() => []),
      getSettingValue("site_title", defaultSettings.site_title),
      getSettingValue("site_description", defaultSettings.site_description),
    ])

    // Safely extract data with fallbacks
    const posts = postsResult.status === "fulfilled" ? postsResult.value : []
    const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : []
    const title = siteTitleResult.status === "fulfilled" ? siteTitleResult.value : defaultSettings.site_title
    const description =
      siteDescriptionResult.status === "fulfilled" ? siteDescriptionResult.value : defaultSettings.site_description

    // Filter out any invalid posts or categories
    const validPosts = Array.isArray(posts) ? posts.filter((post) => post && post.id) : []
    const validCategories = Array.isArray(categories) ? categories.filter((cat) => cat && cat.id) : []

    // Get recent posts
    const recentPosts = validPosts.slice(0, 6)

    return (
      <div className="container mx-auto px-4 py-8">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{title}</h1>
                <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  {description}
                </p>
              </div>
              <div className="flex gap-4">
                <Link href="/stores" passHref>
                  <Button>
                    View all Stores
                    <Store className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/admin" passHref>
                  <Button variant="outline">
                    Admin Panel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Stores Section */}
        {validCategories.length > 0 && (
          <section className="py-8 md:py-12">
            <div className="container px-4 md:px-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex-1"></div>
                <h2 className="text-2xl font-bold flex items-center">
                  <Store className="mr-2 h-6 w-6" />
                  Featured Stores
                </h2>
                <div className="flex-1 flex justify-end">
                  <Link href="/stores" passHref>
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 mb-8">
                {validCategories.map((category) => {
                  if (!category || !category.id) return null

                  return (
                    <Link key={category.id} href={`/category/${category.slug}`} className="group">
                      <div className="flex flex-col items-center text-center transition-transform group-hover:scale-105">
                        <OptimizedImage src={category.image_url} alt={category.name} size="lg" className="mb-3" />
                        <h3 className="font-medium text-xs sm:text-sm group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Latest Ads</h2>
            </div>
            {recentPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No published articles yet.</p>
                <Link href="/admin" passHref>
                  <Button variant="outline">Go to Admin Panel</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPosts.map((post) => {
                  if (!post || !post.id) return null
                  return <BlogCard key={post.id} post={post} />
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error("Error rendering homepage:", error)
    const defaultSettings = getDefaultSettings()
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">{defaultSettings.site_title}</h1>
          <p className="text-muted-foreground mb-4">Welcome to our blog. Please try refreshing the page.</p>
          <Link href="/admin" passHref>
            <Button>Go to Admin Panel</Button>
          </Link>
        </div>
      </div>
    )
  }
}
