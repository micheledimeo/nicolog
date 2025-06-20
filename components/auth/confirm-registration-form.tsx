"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"

interface ConfirmRegistrationFormProps {
  email: string
  onConfirmationSuccess: () => void
  onBackToLogin: () => void
}

export function ConfirmRegistrationForm({ 
  email, 
  onConfirmationSuccess, 
  onBackToLogin 
}: ConfirmRegistrationFormProps) {
  const [code, setCode] = useState("")
  const { confirmRegistration, resendConfirmationCode, loading } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code) {
      toast({
        title: "Errore",
        description: "Inserisci il codice di conferma",
        variant: "destructive",
      })
      return
    }

    try {
      await confirmRegistration(email, code)
      toast({
        title: "Email confermata",
        description: "Ora puoi accedere al tuo account",
      })
      onConfirmationSuccess()
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Codice non valido",
        variant: "destructive",
      })
    }
  }

  const handleResendCode = async () => {
    try {
      await resendConfirmationCode(email)
      toast({
        title: "Codice inviato",
        description: "Controlla la tua email per il nuovo codice",
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nell'invio del codice",
        variant: "destructive",
      })
    }
  }
  return (
    <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Conferma la tua email
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Abbiamo inviato un codice di conferma a {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-gray-900 dark:text-white">
              Codice di conferma
            </Label>
            <Input
              id="code"
              type="text"
              placeholder="Inserisci il codice a 6 cifre"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              disabled={loading}
              maxLength={6}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conferma in corso...
              </>
            ) : (
              "Conferma email"
            )}
          </Button>
        </form>
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleResendCode}
            className="w-full"
            disabled={loading}
          >
            Invia nuovo codice
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onBackToLogin}
            className="w-full"
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna al login
          </Button>
        </div>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Non hai ricevuto il codice? Controlla la cartella spam o richiedi un nuovo codice.
        </p>
      </CardContent>
    </Card>
  )
}