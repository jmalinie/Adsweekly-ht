import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Edge Runtime'ı devre dışı bırak, Node.js runtime'ı kullan
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    console.log(`[API] Simple login attempt for username: ${username}`)

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password are required" }, { status: 400 })
    }

    // Demo kullanıcı kontrolü - sadece demo kullanıcı için
    if (username === "admin" && (password === "123456" || password === "482733")) {
      console.log("Demo user login successful")

      // Sabit bir token kullan (gerçek uygulamada yapma!)
      const token = "demo-admin-session-token"

      // Cookie'ye token'ı kaydet
      cookies().set("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 gün
        path: "/",
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Invalid username or password" }, { status: 401 })
  } catch (error) {
    console.error("Simple login API error:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred during login" }, { status: 500 })
  }
}
