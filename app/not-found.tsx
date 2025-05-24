import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
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
