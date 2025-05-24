import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      // Statik dosyaları crawl etmeyi engelle
      {
        userAgent: "*",
        disallow: ["/*.jpg$", "/*.jpeg$", "/*.png$", "/*.gif$", "/*.svg$", "/*.ico$", "/*.webp$", "/*.pdf$"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
