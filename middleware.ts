import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Statik dosya uzantılarını kontrol eden fonksiyon
function isStaticFile(pathname: string): boolean {
  const staticExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".svg",
    ".ico",
    ".webp",
    ".webmanifest",
    ".json",
    ".xml",
    ".txt",
    ".pdf",
    ".js",
    ".css",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
  ]

  return staticExtensions.some((ext) => pathname.toLowerCase().endsWith(ext))
}

// Yaygın statik dosya isimlerini kontrol eden fonksiyon
function isCommonStaticFile(pathname: string): boolean {
  const commonFiles = [
    "favicon.ico",
    "icon.png",
    "apple-icon.png",
    "apple-touch-icon.png",
    "apple-touch-icon-precomposed.png",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "site.webmanifest",
    "robots.txt",
    "sitemap.xml",
    "og-home.png",
    "og-image.png",
  ]

  return commonFiles.some((file) => pathname.includes(file))
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Statik dosya isteklerini işle
  if (isStaticFile(pathname) || isCommonStaticFile(pathname)) {
    // Statik dosya isteklerini public klasörüne yönlendir
    return NextResponse.next()
  }

  // Admin sayfaları için kimlik doğrulama kontrolü
  if (pathname.startsWith("/admin")) {
    // Admin sayfalarına erişim kontrolü burada yapılabilir
    // Örneğin, oturum kontrolü, yetkilendirme vb.
    return NextResponse.next()
  }

  // Diğer tüm istekler için normal akışa devam et
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image).*)",
  ],
}
