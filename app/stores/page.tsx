import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { getCategories } from "@/app/actions/post-actions"
import { OptimizedImage } from "@/components/optimized-image"

export const revalidate = 3600 // 1 hour ISR

export default async function StoresPage() {
  const categories = await getCategories()

  // Kategorileri alfabetik olarak sırala
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="flex justify-start mb-4">
          <Link href="/" passHref>
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">All Stores</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse all stores and categories available on our platform.
        </p>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-muted-foreground">No stores found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-8">
          {sortedCategories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="group">
              <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all">
                <OptimizedImage
                  src={category.image_url}
                  alt={category.name}
                  size="lg"
                  className="mb-4 transition-transform group-hover:scale-105"
                />
                <h3 className="font-medium text-sm sm:text-base group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "All Stores - Modern Blog",
    description: "Browse all stores and categories available on our platform.",
    openGraph: {
      title: "All Stores - Modern Blog",
      description: "Browse all stores and categories available on our platform.",
      type: "website",
      url: "/stores",
      images: [
        {
          url: "/og-stores.png",
          width: 1200,
          height: 630,
          alt: "All Stores",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "All Stores - Modern Blog",
      description: "Browse all stores and categories available on our platform.",
      images: ["/og-stores.png"],
    },
    alternates: {
      canonical: "/stores",
    },
  }
}
