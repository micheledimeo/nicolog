"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  fetchUserAttributes,
  confirmSignUp,
  resendSignUpCode,
  signInWithRedirect,
  AuthUser
} from "aws-amplify/auth"
import { Hub } from "aws-amplify/utils"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider?: "email" | "google" | "facebook" | "linkedin"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<{ needsConfirmation: boolean }>
  confirmRegistration: (email: string, code: string) => Promise<void>
  resendConfirmationCode: (email: string) => Promise<void>
  loginWithSocial: (provider: "google" | "facebook" | "linkedin") => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  checkingAuth: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Funzione helper per convertire AuthUser di Amplify nel nostro formato User
  const amplifyUserToUser = async (authUser: AuthUser): Promise<User> => {
    try {
      const attributes = await fetchUserAttributes()
      return {
        id: authUser.userId,
        email: attributes.email || '',
        name: attributes.name || attributes.email?.split('@')[0] || '',
        avatar: attributes.picture,
        provider: attributes.identities ? 
          (JSON.parse(attributes.identities)[0]?.providerName?.toLowerCase() as any) : 
          'email'
      }
    } catch (error) {
      console.error('Error fetching user attributes:', error)
      return {
        id: authUser.userId,
        email: '',
        name: '',
        provider: 'email'
      }
    }
  }

  // Controlla se l'utente è già autenticato al caricamento
  useEffect(() => {
    checkAuthState()
    
    // Ascolta gli eventi di autenticazione
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          checkAuthState()
          break
        case 'signInWithRedirect_failure':
          console.error('Error signing in with redirect', payload.data)
          setLoading(false)
          break
      }
    })

    return unsubscribe
  }, [])
  const checkAuthState = async () => {
    try {
      setCheckingAuth(true)
      const authUser = await getCurrentUser()
      const user = await amplifyUserToUser(authUser)
      setUser(user)
    } catch (error) {
      setUser(null)
    } finally {
      setCheckingAuth(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password })
      
      if (isSignedIn) {
        await checkAuthState()
      } else {
        // Gestisci altri step come MFA se necessario
        console.log('Next step:', nextStep)
        throw new Error('Accesso non completato. Potrebbe essere necessario un passaggio aggiuntivo.')
      }
    } catch (error: any) {
      if (error.name === 'UserNotFoundException' || error.name === 'NotAuthorizedException') {
        throw new Error('Email o password non validi')
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name
          }
        }
      })

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        return { needsConfirmation: true }
      }

      if (isSignUpComplete) {
        // Accedi automaticamente dopo la registrazione
        await login(email, password)
        return { needsConfirmation: false }
      }

      return { needsConfirmation: false }
    } catch (error: any) {
      if (error.name === 'UsernameExistsException') {
        throw new Error('Un account con questa email esiste già')
      }
      throw error
    } finally {
      setLoading(false)
    }
  }
  const confirmRegistration = async (email: string, code: string) => {
    setLoading(true)
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code
      })

      if (!isSignUpComplete) {
        throw new Error('Conferma non completata')
      }
    } finally {
      setLoading(false)
    }
  }

  const resendConfirmationCode = async (email: string) => {
    setLoading(true)
    try {
      await resendSignUpCode({ username: email })
    } finally {
      setLoading(false)
    }
  }

  const loginWithSocial = async (provider: "google" | "facebook" | "linkedin") => {
    setLoading(true)
    try {
      // Mappa i provider ai nomi corretti di Cognito
      const providerMap = {
        google: 'Google',
        facebook: 'Facebook',
        linkedin: 'LoginWithAmazon' // LinkedIn usa il provider Amazon in Cognito
      }
      
      await signInWithRedirect({ 
        provider: providerMap[provider] as any 
      })
    } catch (error) {
      console.error(`Errore durante il login con ${provider}:`, error)
      throw new Error(`Errore durante il login con ${provider}`)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Errore durante il logout:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        register, 
        confirmRegistration,
        resendConfirmationCode,
        loginWithSocial, 
        logout, 
        loading,
        checkingAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}