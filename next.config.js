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
  // Public klasöründeki dosyaları doğru şekilde servis et
  async rewrites() {
    return {
      beforeFiles: [
        // Statik dosyaları public klasöründen servis et
        {
          source: "/apple-icon.png",
          destination: "/apple-icon.png",
        },
        {
          source: "/favicon.ico",
          destination: "/favicon.ico",
        },
        {
          source: "/icon.png",
          destination: "/icon.png",
        },
        {
          source: "/og-home.png",
          destination: "/og-home.png",
        },
        {
          source: "/og-image.png",
          destination: "/og-image.png",
        },
      ],
    }
  },
}

module.exports = nextConfig
