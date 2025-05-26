import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware'i geçici olarak devre dışı bırakalım
export function middleware(request: NextRequest) {
  // Tüm isteklere izin ver
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
