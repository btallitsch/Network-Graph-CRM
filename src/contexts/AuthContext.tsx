import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { subscribeToAuthState } from '@/services/auth.service'
import type { AuthUser, AuthState } from '@/types'

// ─── Context ───────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  setError: (error: string | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user: AuthUser | null) => {
      setState((prev) => ({ ...prev, user, loading: false }))
    })
    return unsubscribe
  }, [])

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }))
  }

  return (
    <AuthContext.Provider value={{ ...state, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
