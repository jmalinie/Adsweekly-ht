"use client"

import { useEffect, useState } from "react"

export function DevErrorOverlay() {
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return

    const handleError = (event: ErrorEvent) => {
      setErrors((prev) => [...prev, event.message])
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setErrors((prev) => [...prev, `Unhandled Promise Rejection: ${event.reason}`])
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  if (process.env.NODE_ENV !== "development" || errors.length === 0) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-4">
      <h3 className="font-bold">Development Errors:</h3>
      {errors.map((error, index) => (
        <div key={index} className="text-sm mt-1">
          {error}
        </div>
      ))}
      <button onClick={() => setErrors([])} className="mt-2 px-2 py-1 bg-red-700 rounded text-xs">
        Clear
      </button>
    </div>
  )
}
