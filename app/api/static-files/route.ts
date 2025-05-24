import { type NextRequest, NextResponse } from "next/server"
import { join } from "path"
import { existsSync } from "fs"

// Statik dosya isteklerini işleyen API route
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const filePath = url.pathname

  // Dosya yolunu temizle
  const cleanPath = filePath.replace(/^\/+/, "")

  // Dosya uzantısını kontrol et
  const hasExtension = /\.[a-zA-Z0-9]{1,6}$/.test(cleanPath)

  if (hasExtension) {
    // Dosya public klasöründe var mı kontrol et
    const publicPath = join(process.cwd(), "public", cleanPath)

    if (existsSync(publicPath)) {
      // Dosya varsa, doğrudan public klasöründen servis et
      return NextResponse.redirect(new URL(`/${cleanPath}`, url.origin))
    }
  }

  // Dosya bulunamadıysa 404 döndür
  return NextResponse.json({ error: "File not found" }, { status: 404 })
}
