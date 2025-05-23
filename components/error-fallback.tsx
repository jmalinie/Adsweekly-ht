"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ErrorFallbackProps {
  error?: Error
  reset?: () => void
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            {error?.message || "An unexpected error occurred while rendering the page."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {reset && (
              <Button onClick={reset} className="w-full">
                Try again
              </Button>
            )}
            <Link href="/" passHref>
              <Button variant="outline" className="w-full">
                Go to homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
