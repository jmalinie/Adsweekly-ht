"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error details for debugging
    console.error("Application Error:", error)
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)
    console.error("Error digest:", error.digest)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <div className="text-sm text-gray-600 max-w-md">
          <p>
            <strong>Error:</strong> {error.message}
          </p>
          {error.digest && (
            <p>
              <strong>Digest:</strong> {error.digest}
            </p>
          )}
        </div>
        <Button onClick={() => reset()} variant="outline">
          Try again
        </Button>
        <Button onClick={() => (window.location.href = "/admin")} variant="default">
          Go to Admin Login
        </Button>
      </div>
    </div>
  )
}
