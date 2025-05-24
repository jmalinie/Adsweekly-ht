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
        disallow: [
          "/*.jpg$",
          "/*.jpeg$",
          "/*.png$",
          "/*.gif$",
          "/*.svg$",
          "/*.ico$",
          "/*.webp$",
          "/*.pdf$",
          "/*.doc$",
          "/*.docx$",
          "/*.xls$",
          "/*.xlsx$",
          "/*.zip$",
          "/*.rar$",
          "/*.tar$",
          "/*.gz$",
          "/*.css$",
          "/*.js$",
          "/*.json$",
          "/*.xml$",
          "/*.txt$",
          "/*.woff$",
          "/*.woff2$",
          "/*.ttf$",
          "/*.eot$",
          "/*.otf$",
          "/favicon*",
          "/icon*",
          "/apple-icon*",
          "/apple-touch-icon*",
          "/site.webmanifest",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
