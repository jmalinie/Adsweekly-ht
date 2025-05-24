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
  // Yönlendirmeler
  async redirects() {
    return [
      // Favicon ve diğer yaygın statik dosyaları public klasörüne yönlendir
      {
        source: "/favicon.ico",
        destination: "/favicon.ico",
        permanent: true,
      },
      {
        source: "/apple-touch-icon.png",
        destination: "/apple-icon.png",
        permanent: true,
      },
      {
        source: "/apple-touch-icon-precomposed.png",
        destination: "/apple-icon.png",
        permanent: true,
      },
      {
        source: "/favicon-16x16.png",
        destination: "/favicon.ico",
        permanent: true,
      },
      {
        source: "/favicon-32x32.png",
        destination: "/favicon.ico",
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
