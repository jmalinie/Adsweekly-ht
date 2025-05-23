import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface CategoryBadgeProps {
  category: {
    id: string
    name: string
    slug: string
    image_url?: string | null
  }
  count?: number
  showCount?: boolean
}

export function CategoryBadge({ category, count, showCount = false }: CategoryBadgeProps) {
  return (
    <Link href={`/category/${category.slug}`} passHref>
      <Badge
        variant="secondary"
        className="text-sm py-1 px-3 hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors flex items-center gap-2"
      >
        {category.image_url && (
          <div className="relative h-4 w-4 rounded-full overflow-hidden">
            <Image src={category.image_url || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
          </div>
        )}
        <span>
          {category.name}
          {showCount && count !== undefined && ` (${count})`}
        </span>
      </Badge>
    </Link>
  )
}
