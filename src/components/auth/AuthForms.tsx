import { useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'

// ─── Login Form ────────────────────────────────────────────────────────────────

export const LoginForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const { signInWithEmail, signInWithGoogle, isPending, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    signInWithEmail(email, password)
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={14} />}
          required
        />
        <div className="flex flex-col gap-1.5">
          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={14} />}
            required
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="self-end flex items-center gap-1 text-xs text-slate-500 hover:text-teal-400 transition-colors"
          >
            {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
            {showPass ? 'Hide' : 'Show'} password
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400 font-body bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button variant="primary" size="lg" type="submit" loading={isPending} className="mt-1">
          Sign In
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-mono text-slate-600">OR</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button
        variant="secondary"
        size="lg"
        onClick={() => signInWithGoogle()}
        loading={isPending}
        icon={
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        }
      >
        Continue with Google
      </Button>

      <p className="text-center text-sm text-slate-500 font-body">
        No account?{' '}
        <button onClick={onSwitch} className="text-teal-400 hover:text-teal-300 transition-colors">
          Create one
        </button>
      </p>
    </div>
  )
}

// ─── Register Form ─────────────────────────────────────────────────────────────

export const RegisterForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const { register, signInWithGoogle, isPending, error } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register(email, password, name)
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Alex Chen"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User size={14} />}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={14} />}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={14} />}
          required
          minLength={6}
        />

        {error && (
          <p className="text-xs text-red-400 font-body bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button variant="primary" size="lg" type="submit" loading={isPending} className="mt-1">
          Create Account
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-mono text-slate-600">OR</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button
        variant="secondary"
        size="lg"
        onClick={() => signInWithGoogle()}
        loading={isPending}
        icon={
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        }
      >
        Sign up with Google
      </Button>

      <p className="text-center text-sm text-slate-500 font-body">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-teal-400 hover:text-teal-300 transition-colors">
          Sign in
        </button>
      </p>
    </div>
  )
}
