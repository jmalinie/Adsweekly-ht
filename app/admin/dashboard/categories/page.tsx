"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, MoreHorizontal, Plus, Trash, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCategoriesWithPostCount, deleteCategory } from "@/app/actions/category-actions"
import { toast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
  post_count: number
  is_featured: boolean | null
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategoriesWithPostCount()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Category fetch error:", error)
        toast({
          title: "Error",
          description: "An error occurred while loading categories.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the "${name}" category?`)) {
      try {
        const result = await deleteCategory(id)

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        } else {
          setCategories(categories.filter((category) => category.id !== id))
          toast({
            title: "Success",
            description: "Category deleted successfully.",
          })
        }
      } catch (error) {
        console.error("Category deletion error:", error)
        toast({
          title: "Error",
          description: "An error occurred while deleting the category.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link href="/admin/dashboard/categories/new" passHref>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <p>Loading...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center">
            <p>No categories found.</p>
            <Link href="/admin/dashboard/categories/new" passHref>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Category
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Post Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        {category.image_url ? (
                          <Image
                            src={category.image_url || "/placeholder.svg"}
                            alt={category.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <span className="text-xs">No img</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {category.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{category.post_count}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {category.is_featured ? (
                          <span className="flex items-center text-yellow-500">
                            <Star className="h-4 w-4 mr-1 fill-yellow-500" />
                            Featured
                          </span>
                        ) : (
                          "No"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link
                              href={`/admin/dashboard/categories/edit/${category.id}`}
                              className="flex items-center w-full"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteCategory(category.id, category.name)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
