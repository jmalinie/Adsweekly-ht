"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

// Kullanıcı doğrulama fonksiyonu
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  try {
    console.log("Login action started for:", username)

    // Supabase client oluştur
    const supabase = createClient()

    // Kullanıcıyı veritabanından sorgula
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, username, email, password_hash, is_admin")
      .or(`username.eq.${username},email.eq.${username}`)
      .limit(1)

    console.log("Query result:", { users, userError })

    if (userError) {
      console.error("Database query error:", userError)
      return { success: false, error: "Database error occurred" }
    }

    if (!users || users.length === 0) {
      console.log("No user found for:", username)
      return { success: false, error: "Invalid username or password" }
    }

    const user = users[0]
    console.log("Found user:", { id: user.id, username: user.username })

    // Demo kullanıcı için özel kontrol
    if (username === "admin" && password === "123456") {
      console.log("Demo user login successful")

      // Session oluştur
      const { data: session, error: sessionError } = await supabase
        .from("auth_sessions")
        .insert({
          user_id: user.id,
          token: crypto.randomUUID(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün
        })
        .select("token")
        .single()

      if (sessionError) {
        console.error("Session creation error:", sessionError)
        return { success: false, error: "Failed to create session" }
      }

      // Son giriş zamanını güncelle
      await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id)

      // Cookie'ye token'ı kaydet
      const cookieStore = cookies()
      cookieStore.set("session_token", session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 gün
        path: "/",
      })

      return { success: true }
    }

    // Normal kullanıcı doğrulama
    const isValidPassword = await verifyPassword(password, user.password_hash)
    console.log("Password verification result:", isValidPassword)

    if (!isValidPassword) {
      console.log("Password verification failed")
      return { success: false, error: "Invalid username or password" }
    }

    // Session oluştur
    const { data: session, error: sessionError } = await supabase
      .from("auth_sessions")
      .insert({
        user_id: user.id,
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün
      })
      .select("token")
      .single()

    if (sessionError) {
      console.error("Session creation error:", sessionError)
      return { success: false, error: "Failed to create session" }
    }

    // Son giriş zamanını güncelle
    await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id)

    // Cookie'ye token'ı kaydet
    const cookieStore = cookies()
    cookieStore.set("session_token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 gün
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Login action error:", error)
    return { error: "An unexpected error occurred during login" }
  }
}

// Add the login export that's being imported elsewhere
export const login = loginAction

export async function logoutAction() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (sessionToken) {
      const supabase = createClient()
      await supabase.from("auth_sessions").delete().eq("token", sessionToken)
    }

    // Clear session cookie
    cookieStore.delete("session_token")

    redirect("/admin")
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { error: "An error occurred during logout" }
  }
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const supabase = createClient()

    // Check if user exists
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("email", email).single()

    if (userError || !user) {
      // Don't reveal if email exists or not for security
      return { success: true, message: "If an account with that email exists, a password reset link has been sent." }
    }

    // Generate reset token
    const token = crypto.randomUUID()
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

    return {
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    }
  } catch (error) {
    console.error("Password reset error:", error)
    return {
      success: false,
      error: "An error occurred while processing your request",
    }
  }
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!token || !password || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" }
  }

  try {
    const supabase = createClient()

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
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

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
    return {
      success: false,
      error: "An error occurred while resetting your password",
    }
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return null
    }

    const supabase = createClient()

    const { data: session, error: sessionError } = await supabase
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
      .eq("token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return null
    }

    return session.users
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}
