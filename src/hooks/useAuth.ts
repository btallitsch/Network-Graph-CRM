import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loginWithEmail,
  loginWithGoogle,
  logout,
  registerWithEmail,
  resetPassword,
} from '@/services/auth.service'
import { useAuthContext } from '@/contexts/AuthContext'

export const useAuth = () => {
  const { user, loading, error, setError } = useAuthContext()
  const [isPending, setIsPending] = useState(false)
  const navigate = useNavigate()

  const handleAsync = async (fn: () => Promise<void>) => {
    setIsPending(true)
    setError(null)
    try {
      await fn()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(formatFirebaseError(msg))
    } finally {
      setIsPending(false)
    }
  }

  const signInWithEmail = (email: string, password: string) =>
    handleAsync(async () => {
      await loginWithEmail(email, password)
      navigate('/graph')
    })

  const signInWithGoogle = () =>
    handleAsync(async () => {
      await loginWithGoogle()
      navigate('/graph')
    })

  const register = (email: string, password: string, displayName: string) =>
    handleAsync(async () => {
      await registerWithEmail(email, password, displayName)
      navigate('/graph')
    })

  const signOut = () =>
    handleAsync(async () => {
      await logout()
      navigate('/auth')
    })

  const sendPasswordReset = (email: string) =>
    handleAsync(async () => {
      await resetPassword(email)
    })

  return {
    user,
    loading,
    isPending,
    error,
    signInWithEmail,
    signInWithGoogle,
    register,
    signOut,
    sendPasswordReset,
    clearError: () => setError(null),
  }
}

// ─── Error Formatting ──────────────────────────────────────────────────────────

const formatFirebaseError = (msg: string): string => {
  if (msg.includes('user-not-found')) return 'No account found with this email.'
  if (msg.includes('wrong-password')) return 'Incorrect password. Please try again.'
  if (msg.includes('email-already-in-use')) return 'This email is already registered.'
  if (msg.includes('weak-password')) return 'Password must be at least 6 characters.'
  if (msg.includes('invalid-email')) return 'Please enter a valid email address.'
  if (msg.includes('too-many-requests')) return 'Too many attempts. Please try again later.'
  if (msg.includes('popup-closed-by-user')) return 'Sign-in was cancelled.'
  return 'Authentication failed. Please try again.'
}
