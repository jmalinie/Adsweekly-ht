import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <div className="flex justify-center mb-4">
          <FileQuestion className="h-16 w-16 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. If you were looking for an image or file, please
          check the URL.
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline">Admin Panel</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
