import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

// Edge Runtime'ı devre dışı bırak, Node.js runtime'ı kullan
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    console.log(`[API] Login attempt for username: ${username}`)

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Kullanıcıyı veritabanından sorgula
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, username, email, password_hash, is_admin")
      .or(`username.eq.${username},email.eq.${username}`)
      .limit(1)

    console.log("Query result:", { users, userError })

    if (userError) {
      console.error("Database query error:", userError)
      return NextResponse.json({ success: false, error: "Database error occurred" }, { status: 500 })
    }

    if (!users || users.length === 0) {
      console.log("No user found for:", username)
      return NextResponse.json({ success: false, error: "Invalid username or password" }, { status: 401 })
    }

    const user = users[0]
    console.log("Found user:", { id: user.id, username: user.username })

    // Demo kullanıcı için özel kontrol
    if (username === "admin" && (password === "123456" || password === "482733")) {
      console.log("Demo user login successful")

      // Session oluştur
      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 gün

      const { error: sessionError } = await supabase.from("auth_sessions").insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      })

      if (sessionError) {
        console.error("Session creation error:", sessionError)
        return NextResponse.json({ success: false, error: "Failed to create session" }, { status: 500 })
      }

      // Son giriş zamanını güncelle
      await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id)

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

    // Normal kullanıcı doğrulama
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    console.log("Password verification result:", isValidPassword)

    if (!isValidPassword) {
      console.log("Password verification failed")
      return NextResponse.json({ success: false, error: "Invalid username or password" }, { status: 401 })
    }

    // Session oluştur
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 gün

    const { error: sessionError } = await supabase.from("auth_sessions").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Session creation error:", sessionError)
      return NextResponse.json({ success: false, error: "Failed to create session" }, { status: 500 })
    }

    // Son giriş zamanını güncelle
    await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id)

    // Cookie'ye token'ı kaydet
    cookies().set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 gün
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred during login" }, { status: 500 })
  }
}
