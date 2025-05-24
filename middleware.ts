import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Statik dosyalar ve API route'ları için middleware'i atla
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") || // Dosya uzantısı olan tüm istekler (örn: .jpg, .png, .css)
    pathname.startsWith("/admin") ||
    pathname.startsWith("/stores") ||
    pathname.startsWith("/category")
  ) {
    return NextResponse.next()
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
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
