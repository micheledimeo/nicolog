"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { ConfirmRegistrationForm } from "@/components/auth/confirm-registration-form"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register" | "confirm">("login")
  const [confirmationEmail, setConfirmationEmail] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  // Reindirizza se l'utente è già autenticato
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleToggleMode = () => {
    setMode(mode === "login" ? "register" : "login")
  }

  const handleRegistrationSuccess = (email: string, needsConfirmation: boolean) => {
    if (needsConfirmation) {
      setConfirmationEmail(email)
      setMode("confirm")
    } else {
      router.push("/")
    }
  }
  const handleConfirmationSuccess = () => {
    setMode("login")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        {mode === "login" && (
          <LoginForm onToggleMode={handleToggleMode} />
        )}
        {mode === "register" && (
          <RegisterForm 
            onToggleMode={handleToggleMode} 
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        )}
        {mode === "confirm" && (
          <ConfirmRegistrationForm
            email={confirmationEmail}
            onConfirmationSuccess={handleConfirmationSuccess}
            onBackToLogin={() => setMode("login")}
          />
        )}
      </div>
    )
  }

  return null
}