import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if the BLOB_READ_WRITE_TOKEN is set
    const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN

    // Return the status without exposing the actual token
    return NextResponse.json({
      hasToken,
      environment: process.env.NODE_ENV || "unknown",
    })
  } catch (error) {
    console.error("Error checking blob token:", error)
    return NextResponse.json({ error: "Failed to check blob token status" }, { status: 500 })
  }
}
