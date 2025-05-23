import type { MetadataRoute } from "next"
import { getStaticPublishedPosts, getStaticCategories } from "@/app/actions/post-actions"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com"

  try {
    // Get all published posts and categories using static client
    const [posts, categories] = await Promise.all([getStaticPublishedPosts(), getStaticCategories()])

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ]

    // Blog post pages
    const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/${post.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))

    return [...staticPages, ...postPages, ...categoryPages]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    // Return at least static pages if database fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ]
  }
}
