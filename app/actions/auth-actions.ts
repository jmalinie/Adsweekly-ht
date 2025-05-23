"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { login as authLogin, logout as authLogout, createPasswordResetToken, resetPassword } from "@/lib/auth"

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  try {
    const result = await authLogin(username, password)

    if (result.success && result.token) {
      // Set session cookie
      const cookieStore = cookies()
      cookieStore.set("session_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      })

      redirect("/admin/dashboard")
      return { success: true }
    }

    return { error: result.error || "Invalid username or password" }
  } catch (error) {
    console.error("Login action error:", error)
    return { error: "An unexpected error occurred during login" }
  }
}

export async function logoutAction() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (sessionToken) {
      await authLogout()
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
    const result = await createPasswordResetToken(email)

    if (result.success) {
      return { success: true, message: "If an account with that email exists, a password reset link has been sent." }
    }

    return { error: result.error || "An error occurred while processing your request" }
  } catch (error) {
    console.error("Password reset request error:", error)
    return { error: "An error occurred while processing your request" }
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
    const result = await resetPassword(token, password)

    if (result.success) {
      return {
        success: true,
        message: "Password has been reset successfully. You can now log in with your new password.",
      }
    }

    return { error: result.error || "An error occurred while resetting your password" }
  } catch (error) {
    console.error("Password reset error:", error)
    return { error: "An error occurred while resetting your password" }
  }
}
