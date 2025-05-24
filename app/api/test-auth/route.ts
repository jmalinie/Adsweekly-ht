import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    console.log("=== AUTH TEST BAŞLADI ===")

    // 1. Environment variables kontrolü
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("Supabase URL:", supabaseUrl ? "MEVCUT" : "EKSİK")
    console.log("Supabase Key:", supabaseKey ? "MEVCUT" : "EKSİK")

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: "Environment variables eksik",
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey,
      })
    }

    // 2. Supabase bağlantı testi
    const supabase = createClient()
    console.log("Supabase client oluşturuldu")

    // 3. Kullanıcı sorgulama testi
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, username, email, password_hash, is_admin")
      .eq("username", "admin")

    console.log("Kullanıcı sorgusu sonucu:", { users, userError })

    if (userError) {
      return NextResponse.json({
        error: "Veritabanı sorgu hatası",
        details: userError,
      })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        error: "Admin kullanıcısı bulunamadı",
        userCount: users?.length || 0,
      })
    }

    const user = users[0]
    console.log("Bulunan kullanıcı:", {
      id: user.id,
      username: user.username,
      email: user.email,
      hasPasswordHash: !!user.password_hash,
      isAdmin: user.is_admin,
    })

    // 4. Şifre doğrulama testi
    const testPassword = "123456"
    console.log("Şifre doğrulama testi başlıyor...")

    try {
      const isValidPassword = await bcrypt.compare(testPassword, user.password_hash)
      console.log("Şifre doğrulama sonucu:", isValidPassword)

      return NextResponse.json({
        success: true,
        message: "Tüm testler başarılı",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.is_admin,
        },
        passwordTest: isValidPassword,
        environmentOk: true,
        databaseOk: true,
      })
    } catch (bcryptError) {
      console.error("Bcrypt hatası:", bcryptError)
      return NextResponse.json({
        error: "Şifre doğrulama hatası",
        details: bcryptError,
      })
    }
  } catch (error) {
    console.error("Genel hata:", error)
    return NextResponse.json({
      error: "Test sırasında hata oluştu",
      details: error,
    })
  }
}
