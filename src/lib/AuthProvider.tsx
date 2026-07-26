"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { Amplify } from "aws-amplify"
import { Hub } from "aws-amplify/utils"
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth"

// Configure Amplify on client side (only if credentials are set)
const cognitoPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || ""
const cognitoClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ""

if (cognitoPoolId && cognitoClientId) {
  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId: cognitoPoolId,
          userPoolClientId: cognitoClientId,
          loginWith: {
            email: true,
          },
          signUpVerificationMethod: "code",
          userAttributes: {
            email: { required: true },
            name: { required: false },
          },
          passwordFormat: {
            minLength: 8,
            requireLowercase: true,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialCharacters: false,
          },
        },
      },
    },
    { ssr: true }
  )
}

export interface AuthUser {
  userId: string
  username: string
  email?: string
  name?: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function refresh() {
    try {
      const current = await getCurrentUser()
      const attrs = await fetchUserAttributes()
      setUser({
        userId: current.userId,
        username: current.username,
        email: attrs.email,
        name: attrs.name,
      })
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
        case "tokenRefresh":
          refresh()
          break
        case "signedOut":
          setUser(null)
          break
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
