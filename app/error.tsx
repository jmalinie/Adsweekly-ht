"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Don't log redirect errors as they're expected behavior
    if (!error.message?.includes("NEXT_REDIRECT")) {
      console.error("Application error:", error)
    }
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {error.message?.includes("NEXT_REDIRECT")
            ? "The page you're looking for has moved."
            : error.message || "An unexpected error occurred"}
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={reset}>Try again</Button>
          <Link href="/">
            <Button variant="outline">Go to homepage</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
