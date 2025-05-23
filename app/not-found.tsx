import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold">Page Not Found</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    </div>
  )
}
