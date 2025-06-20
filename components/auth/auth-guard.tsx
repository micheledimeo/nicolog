"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, redirectTo = "/auth" }: AuthGuardProps) {
  const { user, checkingAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!checkingAuth && !user) {
      router.push(redirectTo)
    }
  }, [user, checkingAuth, router, redirectTo])

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return user ? <>{children}</> : null
}