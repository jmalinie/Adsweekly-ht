/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.vercel-blob.com",
      },
      {
        protocol: "https",
        hostname: "blob.v0.dev",
      },
    ],
    unoptimized: true,
  },
  // Statik dosyalar için optimizasyon
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
  // Yönlendirmeler ve yeniden yazma kuralları
  async rewrites() {
    return [
      // Statik dosyaları public klasörüne yönlendir
      {
        source: "/favicon.ico",
        destination: "/favicon.ico",
      },
      {
        source: "/icon.png",
        destination: "/icon.png",
      },
      {
        source: "/apple-icon.png",
        destination: "/apple-icon.png",
      },
      {
        source: "/apple-touch-icon.png",
        destination: "/apple-icon.png",
      },
      {
        source: "/apple-touch-icon-precomposed.png",
        destination: "/apple-icon.png",
      },
      {
        source: "/favicon-16x16.png",
        destination: "/favicon-16x16.png",
      },
      {
        source: "/favicon-32x32.png",
        destination: "/favicon-32x32.png",
      },
      {
        source: "/site.webmanifest",
        destination: "/site.webmanifest",
      },
      {
        source: "/og-home.png",
        destination: "/og-home.png",
      },
      {
        source: "/og-image.png",
        destination: "/og-image.png",
      },
    ]
  },
}

module.exports = nextConfig
