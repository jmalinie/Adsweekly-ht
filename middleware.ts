import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  console.log(`[Middleware] Processing request for: ${pathname}`)

  // Statik dosya uzantılarını kontrol et
  const staticExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".webp",
    ".webmanifest",
    ".xml",
    ".txt",
    ".json",
    ".js",
    ".css",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
  ]

  // Bilinen statik dosya isimleri
  const staticFiles = [
    "/favicon.ico",
    "/apple-icon.png",
    "/icon.png",
    "/apple-touch-icon.png",
    "/apple-touch-icon-precomposed.png",
    "/favicon-16x16.png",
    "/favicon-32x32.png",
    "/site.webmanifest",
    "/robots.txt",
    "/sitemap.xml",
    "/og-home.png",
    "/og-image.png",
    "/manifest.json",
  ]

  // Statik dosya kontrolü
  if (staticExtensions.some((ext) => pathname.endsWith(ext)) || staticFiles.includes(pathname)) {
    console.log(`[Middleware] Static file detected: ${pathname}`)
    // Statik dosyalar için doğrudan devam et
    return NextResponse.next()
  }

  // API routes, Next.js internal routes ve diğer özel route'lar
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/stores") ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/deneme") ||
    pathname.startsWith("/coming-soon")
  ) {
    return NextResponse.next()
  }

  // Diğer tüm istekler için devam et
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
