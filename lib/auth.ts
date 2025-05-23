import bcrypt from "bcryptjs"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface User {
  id: string
  username: string
  email: string
  full_name: string | null
  is_admin: boolean | null
  avatar_url: string | null
  last_login_at: string | null
}

export interface AuthSession {
  id: string
  user_id: string
  token: string
  expires_at: string
  user?: User
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Session management
export async function createSession(userId: string): Promise<string> {
  const supabase = createClient()

  // Generate a secure random token
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  try {
    const { error } = await supabase.from("auth_sessions").insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      console.error("Failed to create session:", error)
      throw new Error("Failed to create session")
    }

    return token
  } catch (error) {
    console.error("Session creation error:", error)
    throw new Error("Failed to create session")
  }
}

export async function getSessionByToken(token: string): Promise<AuthSession | null> {
  if (!token) return null

  const supabase = createClient()

  try {
    const { data: session, error } = await supabase
      .from("auth_sessions")
      .select(`
        id,
        user_id,
        token,
        expires_at,
        users!auth_sessions_user_id_fkey (
          id,
          username,
          email,
          full_name,
          is_admin,
          avatar_url,
          last_login_at
        )
      `)
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !session) {
      return null
    }

    return {
      id: session.id,
      user_id: session.user_id,
      token: session.token,
      expires_at: session.expires_at,
      user: session.users as User,
    }
  } catch (error) {
    console.error("Session fetch error:", error)
    return null
  }
}

export async function deleteSession(token: string): Promise<void> {
  if (!token) return

  const supabase = createClient()

  try {
    await supabase.from("auth_sessions").delete().eq("token", token)
  } catch (error) {
    console.error("Session deletion error:", error)
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  const supabase = createClient()

  try {
    await supabase.from("auth_sessions").delete().lt("expires_at", new Date().toISOString())
  } catch (error) {
    console.error("Session cleanup error:", error)
  }
}

// Authentication helpers
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return null
    }

    const session = await getSessionByToken(sessionToken)
    return session?.user || null
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/admin")
    }

    return user
  } catch (error) {
    console.error("Require auth error:", error)
    redirect("/admin")
  }
}

export async function requireAdmin(): Promise<User> {
  try {
    const user = await requireAuth()

    if (!user.is_admin) {
      redirect("/admin")
    }

    return user
  } catch (error) {
    console.error("Require admin error:", error)
    redirect("/admin")
  }
}

// Login/Logout
export async function login(
  username: string,
  password: string,
): Promise<{ success: boolean; error?: string; token?: string }> {
  if (!username || !password) {
    return { success: false, error: "Username and password are required" }
  }

  const supabase = createClient()

  try {
    // Get user by username or email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, username, email, password_hash, is_admin")
      .or(`username.eq.${username},email.eq.${username}`)
      .single()

    if (userError || !user) {
      return { success: false, error: "Invalid username or password" }
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return { success: false, error: "Invalid username or password" }
    }

    // Update last login
    await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id)

    // Create session
    const token = await createSession(user.id)

    return { success: true, token }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

export async function logout(): Promise<void> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (sessionToken) {
      await deleteSession(sessionToken)
    }
  } catch (error) {
    console.error("Logout error:", error)
  }
}

// Utility functions
function generateSecureToken(): string {
  // Node.js ortamında crypto.getRandomValues kullanılabilir
  // Tarayıcı ortamında window.crypto.getRandomValues kullanılabilir
  // Her iki ortamda da çalışacak bir çözüm:
  const array = new Uint8Array(32)

  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array)
  } else if (typeof crypto !== "undefined") {
    crypto.getRandomValues(array)
  } else {
    // Fallback: Daha az güvenli ama çalışacak bir yöntem
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }

  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

// Password reset functionality
export async function createPasswordResetToken(email: string): Promise<{ success: boolean; error?: string }> {
  if (!email) {
    return { success: false, error: "Email is required" }
  }

  const supabase = createClient()

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("email", email).single()

    if (userError || !user) {
      // Don't reveal if email exists or not for security
      return { success: true }
    }

    // Generate reset token
    const token = generateSecureToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save reset token
    const { error } = await supabase.from("password_resets").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      console.error("Password reset token creation error:", error)
      throw error
    }

    // TODO: Send email with reset link
    // For now, just log the token (remove in production)
    console.log(`Password reset token for ${email}: ${token}`)

    return { success: true }
  } catch (error) {
    console.error("Password reset error:", error)
    return { success: false, error: "An error occurred while processing your request" }
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!token || !newPassword) {
    return { success: false, error: "Token and new password are required" }
  }

  const supabase = createClient()

  try {
    // Verify reset token
    const { data: resetToken, error: tokenError } = await supabase
      .from("password_resets")
      .select("id, user_id, used")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (tokenError || !resetToken) {
      return { success: false, error: "Invalid or expired reset token" }
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("id", resetToken.user_id)

    if (updateError) {
      console.error("Password update error:", updateError)
      throw updateError
    }

    // Mark token as used
    await supabase.from("password_resets").update({ used: true }).eq("id", resetToken.id)

    // Delete all sessions for this user (force re-login)
    await supabase.from("auth_sessions").delete().eq("user_id", resetToken.user_id)

    return { success: true }
  } catch (error) {
    console.error("Password reset error:", error)
    return { success: false, error: "An error occurred while resetting your password" }
  }
}
