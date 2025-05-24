import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Statik dosya uzantılarını kontrol eden fonksiyon
function isStaticFile(pathname: string): boolean {
  // Bilinen statik dosyalar
  const staticFiles = [
    "favicon.ico",
    "apple-icon.png",
    "icon.png",
    "apple-touch-icon.png",
    "apple-touch-icon-precomposed.png",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "site.webmanifest",
    "robots.txt",
    "sitemap.xml",
    "og-home.png",
    "og-image.png",
    "manifest.json",
  ]

  // Dosya uzantıları
  const fileExtensions = [
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
  ]

  // Tam eşleşme kontrolü
  if (staticFiles.some((file) => pathname === `/${file}`)) {
    return true
  }

  // Uzantı kontrolü
  return fileExtensions.some((ext) => pathname.endsWith(ext))
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Statik dosya kontrolü
  if (isStaticFile(pathname)) {
    // Statik dosya isteklerini doğrudan public klasörüne yönlendir
    return NextResponse.next()
  }

  // Statik dosyalar ve API route'ları için middleware'i atla
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/stores") ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/deneme")
  ) {
    return NextResponse.next()
  }

  // Nokta içeren tüm istekleri reddet (muhtemelen dosya)
  if (pathname.includes(".")) {
    // 404 sayfasına yönlendir
    return NextResponse.rewrite(new URL("/not-found", request.url))
  }

  // Diğer tüm istekler blog post olarak işlenecek
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    "/((?!_next/static|_next/image).*)",
  ],
}
