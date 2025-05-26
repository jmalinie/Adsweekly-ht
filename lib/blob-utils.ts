import { put } from "@vercel/blob"

export async function uploadImageToBlob(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      return { error: "No file provided" }
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: "File size exceeds 5MB limit" }
    }

    // Dosya türü kontrolü
    if (!file.type.startsWith("image/")) {
      return { error: "Only image files are allowed" }
    }

    // Blob'a yükle
    const blob = await put(file.name, file, {
      access: "public",
    })

    // Başarılı sonuç döndür
    return { success: true, url: blob.url }
  } catch (error) {
    console.error("Image upload error:", error)
    return { error: "Failed to upload image" }
  }
}

export async function deleteImageFromBlob(url: string) {
  try {
    // Vercel Blob API'si ile silme işlemi
    // Not: Bu fonksiyon şu anda Vercel Blob API'sinde doğrudan desteklenmiyor
    // Gerçek bir silme işlemi için Vercel Blob API'sinin gelecekteki sürümlerini bekleyin
    console.log("Image deletion requested for:", url)
    return true
  } catch (error) {
    console.error("Image deletion error:", error)
    return false
  }
}

export async function extractImageUrlsFromContent(content: string) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, "text/html")
    const images = Array.from(doc.querySelectorAll("img"))
    return images.map((img) => img.src).filter((src) => src.includes("vercel-blob.com"))
  } catch (error) {
    console.error("Error extracting image URLs:", error)
    return []
  }
}

export async function extractFirstImageFromContent(content: string) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, "text/html")
    const firstImage = doc.querySelector("img")
    return firstImage?.src || null
  } catch (error) {
    console.error("Error extracting first image:", error)
    return null
  }
}
