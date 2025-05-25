"use server"

import { createClient } from "@/lib/supabase/server"
import { createStaticClient } from "@/lib/supabase/static"
import { revalidatePath } from "next/cache"
import { deleteImageFromBlob, extractImageUrlsFromContent, extractFirstImageFromContent } from "@/lib/blob-utils"

export async function createPost(formData: FormData) {
  const supabase =await createClient()

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const excerpt = formData.get("excerpt") as string
  const status = formData.get("status") as string
  const featuredImage = formData.get("featuredImage") as string
  const categoryIds = formData.getAll("categories") as string[]

  // Basic validation
  if (!title || !content) {
    return { error: "Title and content fields are required." }
  }

  // Create slug
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()

  try {
    // Get admin user ID
    const { data: adminUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("username", "admin")
      .single()

    if (userError || !adminUser) {
      console.error("Admin user not found:", userError)
      return { error: "Admin user not found" }
    }

    // Create unique slug
    let uniqueSlug = slug
    let counter = 1

    while (true) {
      const { data: existingPost } = await supabase.from("posts").select("id").eq("slug", uniqueSlug).single()

      if (!existingPost) break

      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    // Auto-select featured image if not provided
    let finalFeaturedImage = featuredImage
    if (!finalFeaturedImage && content) {
      const firstImage = await extractFirstImageFromContent(content)
      if (firstImage) {
        finalFeaturedImage = firstImage
      }
    }

    // Create post
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        title,
        slug: uniqueSlug,
        content,
        excerpt: excerpt || null,
        featured_image: finalFeaturedImage || null,
        author_id: adminUser.id,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Post creation error:", error)
      throw error
    }

    // Add categories
    if (post && categoryIds.length > 0) {
      const postCategories = categoryIds.map((categoryId) => ({
        post_id: post.id,
        category_id: categoryId,
      }))

      const { error: categoryError } = await supabase.from("post_categories").insert(postCategories)

      if (categoryError) {
        console.error("Category addition error:", categoryError)
        // Post created but categories couldn't be added, still consider it successful
      }
    }

    // Revalidate all relevant paths for ISR
    revalidatePath("/")
    revalidatePath("/blog")
    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/dashboard/posts")

    // If published, revalidate the new post page
    if (status === "published") {
      revalidatePath(`/${uniqueSlug}`)
    }

    // Revalidate category pages if categories were added
    if (categoryIds.length > 0) {
      for (const categoryId of categoryIds) {
        const { data: category } = await supabase.from("categories").select("slug").eq("id", categoryId).single()

        if (category) {
          revalidatePath(`/category/${category.slug}`)
        }
      }
    }

    return { success: true, postId: post?.id }
  } catch (error) {
    console.error("Post creation error:", error)
    return { error: "An error occurred while creating the blog post. Please try again." }
  }
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase =await createClient()

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const excerpt = formData.get("excerpt") as string
  const status = formData.get("status") as string
  const featuredImage = formData.get("featuredImage") as string
  const categoryIds = formData.getAll("categories") as string[]

  // Basic validation
  if (!title || !content) {
    return { error: "Title and content fields are required." }
  }

  try {
    // Get current post data for revalidation
    const { data: currentPost } = await supabase.from("posts").select("slug, status").eq("id", postId).single()

    // Auto-select featured image if not provided
    let finalFeaturedImage = featuredImage
    if (!finalFeaturedImage && content) {
      const firstImage = await extractFirstImageFromContent(content)
      if (firstImage) {
        finalFeaturedImage = firstImage
      }
    }

    // Update post
    const { error } = await supabase
      .from("posts")
      .update({
        title,
        content,
        excerpt: excerpt || null,
        featured_image: finalFeaturedImage || null,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)

    if (error) {
      console.error("Post update error:", error)
      throw error
    }

    // Delete existing categories
    const { error: deleteError } = await supabase.from("post_categories").delete().eq("post_id", postId)

    if (deleteError) {
      console.error("Category deletion error:", deleteError)
    }

    // Add new categories
    if (categoryIds.length > 0) {
      const postCategories = categoryIds.map((categoryId) => ({
        post_id: postId,
        category_id: categoryId,
      }))

      const { error: categoryError } = await supabase.from("post_categories").insert(postCategories)

      if (categoryError) {
        console.error("Category addition error:", categoryError)
      }
    }

    // Revalidate all relevant paths for ISR
    revalidatePath("/")
    revalidatePath("/blog")
    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/dashboard/posts")

    // Revalidate the post page if it was or is published
    if (currentPost?.slug && (currentPost.status === "published" || status === "published")) {
      revalidatePath(`/${currentPost.slug}`)
    }

    // Revalidate category pages
    if (categoryIds.length > 0) {
      for (const categoryId of categoryIds) {
        const { data: category } = await supabase.from("categories").select("slug").eq("id", categoryId).single()

        if (category) {
          revalidatePath(`/category/${category.slug}`)
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Post update error:", error)
    return { error: "An error occurred while updating the blog post. Please try again." }
  }
}

export async function deletePost(postId: string) {
  const supabase =await createClient()

  try {
    // First get the post
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("id, content, featured_image, slug, status")
      .eq("id", postId)
      .single()

    if (fetchError) {
      console.error("Post fetch error:", fetchError)
      throw fetchError
    }

    if (!post) {
      return { error: "Post to delete not found" }
    }

    // Delete images
    const deleteImagePromises: Promise<boolean>[] = []

    // 1. Delete featured image
    if (post.featured_image && post.featured_image.includes("vercel-blob.com")) {
      deleteImagePromises.push(deleteImageFromBlob(post.featured_image))
    }

    // 2. Delete content images
    const contentImageUrls = await extractImageUrlsFromContent(post.content)
    contentImageUrls.forEach((url) => {
      deleteImagePromises.push(deleteImageFromBlob(url))
    })

    // Run all image deletion operations in parallel
    await Promise.allSettled(deleteImagePromises)

    // Delete post
    const { error } = await supabase.from("posts").delete().eq("id", postId)

    if (error) {
      console.error("Post deletion error:", error)
      throw error
    }

    // Revalidate all relevant paths for ISR
    revalidatePath("/")
    revalidatePath("/blog")
    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/dashboard/posts")

    // If the post was published, revalidate its page
    if (post.status === "published" && post.slug) {
      revalidatePath(`/${post.slug}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Post deletion error:", error)
    return { error: "An error occurred while deleting the blog post. Please try again." }
  }
}

export async function getCategories() {
  const supabase =await createClient()

  try {
    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("Category fetch error:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Category fetch error:", error)
    return []
  }
}

export async function getFeaturedCategories() {
  const supabase =await createClient()

  try {
    const { data, error } = await supabase.from("categories").select("*").eq("is_featured", true).order("name")

    if (error) {
      console.error("Featured categories fetch error:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Featured categories fetch error:", error)
    return []
  }
}

// Static generation için ayrı fonksiyonlar
export async function getStaticCategories() {
  const supabase = createStaticClient()

  try {
    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("Static category fetch error:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Static category fetch error:", error)
    return []
  }
}

export async function getStaticPublishedPosts() {
  const supabase = createStaticClient()

  try {
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id, title, slug, status")
      .eq("status", "published")
      .order("published_at", { ascending: false })

    if (postsError) {
      console.error("Static published posts fetch error:", postsError)
      return []
    }

    return posts || []
  } catch (error) {
    console.error("Static published post fetch error:", error)
    return []
  }
}

export async function getPosts(status?: string) {
  const supabase =await createClient()

  try {
    // First join posts and users
    let postsQuery = supabase
      .from("posts")
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        featured_image,
        status,
        view_count,
        published_at,
        created_at,
        updated_at,
        author_id,
        users!posts_author_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })

    if (status) {
      postsQuery = postsQuery.eq("status", status)
    }

    const { data: posts, error: postsError } = await postsQuery

    if (postsError) {
      console.error("Posts fetch error:", postsError)
      return []
    }

    if (!posts || posts.length === 0) {
      return []
    }

    // Get categories for each post separately
    const postsWithCategories = await Promise.all(
      posts.map(async (post) => {
        try {
          const { data: categories } = await supabase
            .from("post_categories")
            .select(`
              categories (
                id,
                name,
                slug
              )
            `)
            .eq("post_id", post.id)

          return {
            ...post,
            post_categories: categories || [],
          }
        } catch (error) {
          console.error(`Post ${post.id} categories fetch error:`, error)
          return {
            ...post,
            post_categories: [],
          }
        }
      }),
    )

    return postsWithCategories
  } catch (error) {
    console.error("Post fetch error:", error)
    return []
  }
}

export async function getPublishedPosts() {
  const supabase =await createClient()

  try {
    // Get published posts
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        featured_image,
        status,
        view_count,
        published_at,
        created_at,
        updated_at,
        author_id,
        users!posts_author_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq("status", "published")
      .order("published_at", { ascending: false })

    if (postsError) {
      console.error("Published posts fetch error:", postsError)
      return []
    }

    if (!posts || posts.length === 0) {
      return []
    }

    // Get categories for each post separately with error handling
    const postsWithCategories = await Promise.all(
      posts.map(async (post) => {
        try {
          const { data: categories } = await supabase
            .from("post_categories")
            .select(`
              categories (
                id,
                name,
                slug,
                image_url
              )
            `)
            .eq("post_id", post.id)

          return {
            ...post,
            post_categories: categories || [],
          }
        } catch (error) {
          console.error(`Post ${post.id} categories fetch error:`, error)
          return {
            ...post,
            post_categories: [],
          }
        }
      }),
    )

    return postsWithCategories
  } catch (error) {
    console.error("Published post fetch error:", error)
    return []
  }
}

export async function getPostsByCategory(categorySlug: string) {
  const supabase =await createClient()

  try {
    // First get the category
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url")
      .eq("slug", categorySlug)
      .single()

    if (categoryError || !category) {
      console.error("Category fetch error:", categoryError)
      return { category: null, posts: [] }
    }

    // Get post IDs for this category
    const { data: postCategories, error: postCategoriesError } = await supabase
      .from("post_categories")
      .select("post_id")
      .eq("category_id", category.id)

    if (postCategoriesError) {
      console.error("Post categories fetch error:", postCategoriesError)
      return { category, posts: [] }
    }

    if (!postCategories || postCategories.length === 0) {
      return { category, posts: [] }
    }

    const postIds = postCategories.map((pc) => pc.post_id)

    // Get published posts with these IDs
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        featured_image,
        status,
        view_count,
        published_at,
        created_at,
        updated_at,
        author_id,
        users!posts_author_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .in("id", postIds)
      .eq("status", "published")
      .order("published_at", { ascending: false })

    if (postsError) {
      console.error("Posts fetch error:", postsError)
      return { category, posts: [] }
    }

    if (!posts || posts.length === 0) {
      return { category, posts: [] }
    }

    // Get categories for each post
    const postsWithCategories = await Promise.all(
      posts.map(async (post) => {
        try {
          const { data: categories } = await supabase
            .from("post_categories")
            .select(`
              categories (
                id,
                name,
                slug,
                image_url
              )
            `)
            .eq("post_id", post.id)

          return {
            ...post,
            post_categories: categories || [],
          }
        } catch (error) {
          console.error(`Post ${post.id} categories fetch error:`, error)
          return {
            ...post,
            post_categories: [],
          }
        }
      }),
    )

    return { category, posts: postsWithCategories }
  } catch (error) {
    console.error("Posts by category fetch error:", error)
    return { category: null, posts: [] }
  }
}

export async function getPostBySlug(slug: string) {
  if (!slug) {
    console.error("getPostBySlug called without a slug")
    return null
  }

  const supabase =await createClient()

  try {
    // Get post by slug
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        featured_image,
        status,
        view_count,
        published_at,
        created_at,
        updated_at,
        author_id,
        users!posts_author_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq("slug", slug)
      .single()

    if (postError) {
      console.error("Post fetch error:", postError)
      return null
    }

    if (!post) {
      return null
    }

    // Get post categories
    const { data: categories, error: categoriesError } = await supabase
      .from("post_categories")
      .select(`
        categories (
          id,
          name,
          slug,
          image_url
        )
      `)
      .eq("post_id", post.id)

    if (categoriesError) {
      console.error("Categories fetch error:", categoriesError)
      // Hata durumunda boş kategori dizisi döndür, tamamen başarısız olmasın
      return {
        ...post,
        post_categories: [],
      }
    }

    // Görüntülenme sayısını artır
    try {
      const { error: updateError } = await supabase
        .from("posts")
        .update({
          view_count: (post.view_count || 0) + 1,
        })
        .eq("id", post.id)

      if (updateError) {
        console.error("View count update error:", updateError)
      }
    } catch (error) {
      console.error("View count update error:", error)
    }

    return {
      ...post,
      post_categories: categories || [],
    }
  } catch (error) {
    console.error("Post fetch error:", error)
    return null
  }
}

export async function getPostById(id: string) {
  const supabase =await createClient()

  try {
    // Get post by id
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        featured_image,
        status,
        view_count,
        published_at,
        created_at,
        updated_at,
        author_id,
        users!posts_author_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq("id", id)
      .single()

    if (postError) {
      console.error("Post fetch error:", postError)
      return null
    }

    if (!post) {
      return null
    }

    // Get post categories
    const { data: categories } = await supabase
      .from("post_categories")
      .select(`
        categories (
          id,
          name,
          slug,
          image_url
        )
      `)
      .eq("post_id", post.id)

    return {
      ...post,
      post_categories: categories || [],
    }
  } catch (error) {
    console.error("Post fetch error:", error)
    return null
  }
}

export async function autoSelectFeaturedImages() {
  const supabase =await createClient()

  try {
    // Get all posts without featured images
    const { data: posts, error: fetchError } = await supabase
      .from("posts")
      .select("id, content, featured_image")
      .is("featured_image", null)

    if (fetchError) {
      console.error("Posts fetch error:", fetchError)
      return { error: "Failed to fetch posts" }
    }

    if (!posts || posts.length === 0) {
      return { success: true, message: "No posts need featured image updates" }
    }

    let updatedCount = 0

    // Process each post
    for (const post of posts) {
      if (post.content) {
        const firstImage = await extractFirstImageFromContent(post.content)

        if (firstImage) {
          const { error: updateError } = await supabase
            .from("posts")
            .update({
              featured_image: firstImage,
              updated_at: new Date().toISOString(),
            })
            .eq("id", post.id)

          if (!updateError) {
            updatedCount++
          } else {
            console.error(`Failed to update post ${post.id}:`, updateError)
          }
        }
      }
    }

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/blog")
    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/dashboard/posts")

    return {
      success: true,
      message: `Successfully updated ${updatedCount} posts with auto-selected featured images`,
    }
  } catch (error) {
    console.error("Auto-select featured images error:", error)
    return { error: "An error occurred while auto-selecting featured images" }
  }
}
