import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Edge Runtime'ı devre dışı bırak, Node.js runtime'ı kullan
export const runtime = "nodejs"

export async function GET() {
  try {
    // Cookie'den session token'ı al
    const sessionToken = cookies().get("session_token")?.value

    // Basit bir kontrol - gerçek uygulamada daha güvenli bir doğrulama yapılmalı
    if (sessionToken === "demo-admin-session-token") {
      return NextResponse.json({ authenticated: true })
    }

    return NextResponse.json({ authenticated: false })
  } catch (error) {
    console.error("Check session error:", error)
    return NextResponse.json({ authenticated: false, error: "An error occurred while checking session" })
  }
}
