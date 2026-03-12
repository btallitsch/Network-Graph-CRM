import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import type { AuthUser } from '@/types'

const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

// ─── Mappers ───────────────────────────────────────────────────────────────────

export const mapFirebaseUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
})

// ─── Auth Operations ───────────────────────────────────────────────────────────

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<AuthUser> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  return mapFirebaseUser(credential.user)
}

export const loginWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return mapFirebaseUser(credential.user)
}

export const loginWithGoogle = async (): Promise<AuthUser> => {
  const credential = await signInWithPopup(auth, googleProvider)
  return mapFirebaseUser(credential.user)
}

export const logout = async (): Promise<void> => {
  await signOut(auth)
}

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email)
}

export const subscribeToAuthState = (
  callback: (user: AuthUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? mapFirebaseUser(user) : null)
  })
}
