"use server"

import { put, del } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function uploadImageToBlob(formData: FormData) {
  const file = formData.get("file") as File

  if (!file) {
    return { error: "File not found" }
  }

  if (!file.type.startsWith("image/")) {
    return { error: "Only image files can be uploaded" }
  }

  try {
    // Create unique filename
    const uniqueId = nanoid()
    const extension = file.name.split(".").pop()
    const fileName = `${uniqueId}.${extension}`

    // Upload to Blob
    const blob = await put(fileName, file, {
      access: "public",
      contentType: file.type,
    })

    return {
      success: true,
      url: blob.url,
      fileName: blob.pathname,
    }
  } catch (error) {
    console.error("Image upload error:", error)
    return { error: "An error occurred while uploading the image" }
  }
}

// Helper function to extract Blob pathname from URL
export async function getBlobPathnameFromUrl(url: string): Promise<string | null> {
  try {
    // Extract pathname from Vercel Blob URLs
    if (url.includes("vercel-blob.com")) {
      const urlObj = new URL(url)
      // pathname is the path part of the URL (after domain)
      return urlObj.pathname.startsWith("/") ? urlObj.pathname.substring(1) : urlObj.pathname
    }
    return null
  } catch (error) {
    console.error("URL parsing error:", error)
    return null
  }
}

// Helper function to extract all image URLs from content
export async function extractImageUrlsFromContent(content: string): Promise<string[]> {
  const imgRegex = /<img[^>]+src="([^">]+)"/g
  const urls: string[] = []
  let match

  while ((match = imgRegex.exec(content)) !== null) {
    if (match[1].includes("vercel-blob.com")) {
      urls.push(match[1])
    }
  }

  return urls
}

// Function to delete image from Vercel Blob
export async function deleteImageFromBlob(url: string): Promise<boolean> {
  try {
    const pathname = await getBlobPathnameFromUrl(url)
    if (!pathname) return false

    await del(pathname)
    return true
  } catch (error) {
    console.error("Image deletion error:", error)
    return false
  }
}

// Function to extract the first image URL from content
export async function extractFirstImageFromContent(content: string): Promise<string | null> {
  const imgRegex = /<img[^>]+src="([^">]+)"/
  const match = imgRegex.exec(content)

  if (match && match[1]) {
    return match[1]
  }

  return null
}
