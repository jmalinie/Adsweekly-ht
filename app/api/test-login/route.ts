import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Test the query
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, username, email")
      .or(`username.eq.${username},email.eq.${username}`)
      .limit(1)

    return NextResponse.json({
      success: true,
      query: `username.eq.${username},email.eq.${username}`,
      result: { users, userError },
    })
  } catch (error) {
    console.error("Test login API error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
