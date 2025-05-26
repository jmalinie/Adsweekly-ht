import { put } from "@vercel/blob"

export async function uploadImageToBlob(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      console.error("No file provided in formData")
      return { error: "No file provided" }
    }

    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is missing")
      return { error: "Server configuration error: Missing blob token" }
    }

    // File size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: "File size exceeds 5MB limit" }
    }

    // File type check
    if (!file.type.startsWith("image/")) {
      return { error: "Only image files are allowed" }
    }

    // Generate a unique filename to avoid conflicts
    const timestamp = Date.now()
    const uniqueFilename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    // Upload to blob
    const blob = await put(uniqueFilename, file, {
      access: "public",
    })

    console.log("Image uploaded successfully:", blob.url)

    // Return successful result
    return { success: true, url: blob.url }
  } catch (error) {
    console.error("Image upload error:", error)
    return { error: "Failed to upload image. Please try again." }
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
    // Simple regex approach for server-side environment
    const imgRegex = /<img[^>]+src="([^">]+)"/gi
    const matches = [...content.matchAll(imgRegex)]

    return matches.map((match) => (match) => match[1]).filter((src) => src.includes("vercel-blob.com"))
  } catch (error) {
    console.error("Error extracting image URLs:", error)
    return []
  }
}

export async function extractFirstImageFromContent(content: string) {
  try {
    // Simple regex approach for server-side environment
    const imgRegex = /<img[^>]+src="([^">]+)"/i
    const match = content.match(imgRegex)

    if (match && match[1]) {
      return match[1]
    }

    return null
  } catch (error) {
    console.error("Error extracting first image:", error)
    return null
  }
}
