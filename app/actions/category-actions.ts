"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { uploadImageToBlob, deleteImageFromBlob } from "@/lib/blob-utils"

export async function createCategory(formData: FormData) {
  const supabase = createClient()

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const imageFile = formData.get("image") as File
  const isFeatured = formData.get("isFeatured") === "true"

  // Basic validation
  if (!name) {
    return { error: "Category name is required." }
  }

  // Create slug
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()

  try {
    // Create unique slug
    let uniqueSlug = slug
    let counter = 1

    while (true) {
      const { data: existingCategory } = await supabase.from("categories").select("id").eq("slug", uniqueSlug).single()

      if (!existingCategory) break

      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    // Upload image if provided
    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      const imageFormData = new FormData()
      imageFormData.append("file", imageFile)

      const uploadResult = await uploadImageToBlob(imageFormData)

      if (uploadResult.error) {
        console.error("Image upload error:", uploadResult.error)
        return { error: "Failed to upload category image. Please try again." }
      }

      imageUrl = uploadResult.url
    }

    // Create category
    const { data: category, error } = await supabase
      .from("categories")
      .insert({
        name,
        slug: uniqueSlug,
        description: description || null,
        image_url: imageUrl,
        is_featured: isFeatured,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Category creation error:", error)
      throw error
    }

    // Revalidate paths
    revalidatePath("/admin/dashboard/categories")
    revalidatePath("/blog")
    revalidatePath("/")
    revalidatePath(`/category/${uniqueSlug}`)

    return { success: true, categoryId: category?.id }
  } catch (error) {
    console.error("Category creation error:", error)
    return { error: "An error occurred while creating the category. Please try again." }
  }
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const supabase = createClient()

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const imageFile = formData.get("image") as File
  const currentImageUrl = formData.get("currentImageUrl") as string
  const removeImage = formData.get("removeImage") === "true"
  const isFeatured = formData.get("isFeatured") === "true"

  // Basic validation
  if (!name) {
    return { error: "Category name is required." }
  }

  // Create slug
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()

  try {
    // Get current category data
    const { data: currentCategory } = await supabase
      .from("categories")
      .select("image_url, slug")
      .eq("id", categoryId)
      .single()

    // Create unique slug (excluding current category)
    let uniqueSlug = slug
    let counter = 1

    while (true) {
      const { data: existingCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", uniqueSlug)
        .neq("id", categoryId)
        .single()

      if (!existingCategory) break

      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    // Handle image
    let imageUrl = currentImageUrl

    // Delete current image if removing or replacing
    if ((removeImage || imageFile?.size > 0) && currentCategory?.image_url) {
      await deleteImageFromBlob(currentCategory.image_url)
      imageUrl = null
    }

    // Upload new image if provided
    if (imageFile && imageFile.size > 0) {
      const imageFormData = new FormData()
      imageFormData.append("file", imageFile)

      const uploadResult = await uploadImageToBlob(imageFormData)

      if (uploadResult.error) {
        console.error("Image upload error:", uploadResult.error)
        return { error: "Failed to upload category image. Please try again." }
      }

      imageUrl = uploadResult.url
    }

    // Update category
    const { error } = await supabase
      .from("categories")
      .update({
        name,
        slug: uniqueSlug,
        description: description || null,
        image_url: imageUrl,
        is_featured: isFeatured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId)

    if (error) {
      console.error("Category update error:", error)
      throw error
    }

    // Revalidate paths
    revalidatePath("/admin/dashboard/categories")
    revalidatePath("/blog")
    revalidatePath("/")

    // Revalidate both old and new category paths
    if (currentCategory?.slug) {
      revalidatePath(`/category/${currentCategory.slug}`)
    }
    revalidatePath(`/category/${uniqueSlug}`)

    return { success: true }
  } catch (error) {
    console.error("Category update error:", error)
    return { error: "An error occurred while updating the category. Please try again." }
  }
}

export async function deleteCategory(categoryId: string) {
  const supabase = createClient()

  try {
    // First check if this category has any posts
    const { count: postCount, error: countError } = await supabase
      .from("post_categories")
      .select("*", { count: "exact" })
      .eq("category_id", categoryId)

    if (countError) {
      console.error("Post count check error:", countError)
      throw countError
    }

    if (postCount && postCount > 0) {
      return {
        error: `This category is used in ${postCount} posts. Please move these posts to other categories first.`,
      }
    }

    // Get category data to delete image
    const { data: category } = await supabase.from("categories").select("image_url, slug").eq("id", categoryId).single()

    // Delete category image if exists
    if (category?.image_url) {
      await deleteImageFromBlob(category.image_url)
    }

    // Delete category
    const { error } = await supabase.from("categories").delete().eq("id", categoryId)

    if (error) {
      console.error("Category deletion error:", error)
      throw error
    }

    // Revalidate paths
    revalidatePath("/admin/dashboard/categories")
    revalidatePath("/blog")
    revalidatePath("/")

    // Revalidate category path
    if (category?.slug) {
      revalidatePath(`/category/${category.slug}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Category deletion error:", error)
    return { error: "An error occurred while deleting the category. Please try again." }
  }
}

export async function getCategoriesWithPostCount() {
  const supabase = createClient()

  try {
    // Get categories
    const { data: categories, error: categoriesError } = await supabase.from("categories").select("*").order("name")

    if (categoriesError) {
      console.error("Category fetch error:", categoriesError)
      return []
    }

    if (!categories || categories.length === 0) {
      return []
    }

    // Get post count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        try {
          const { count: postCount } = await supabase
            .from("post_categories")
            .select("*", { count: "exact" })
            .eq("category_id", category.id)

          return {
            ...category,
            post_count: postCount || 0,
          }
        } catch (error) {
          console.error(`Category ${category.id} post count fetch error:`, error)
          return {
            ...category,
            post_count: 0,
          }
        }
      }),
    )

    return categoriesWithCount
  } catch (error) {
    console.error("Category fetch error:", error)
    return []
  }
}

export async function getCategoryById(id: string) {
  const supabase = createClient()

  try {
    const { data: category, error } = await supabase.from("categories").select("*").eq("id", id).single()

    if (error) {
      console.error("Category fetch error:", error)
      return null
    }

    return category
  } catch (error) {
    console.error("Category fetch error:", error)
    return null
  }
}
