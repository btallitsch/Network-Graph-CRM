import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Network } from 'lucide-react'
import { LoginForm, RegisterForm } from '@/components/auth/AuthForms'
import { useAuthContext } from '@/contexts/AuthContext'

export const AuthPage = () => {
  const { user, loading } = useAuthContext()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/graph" replace />

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 font-body relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(45, 212, 191, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 212, 191, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(45,212,191,0.4) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 mb-4 shadow-[0_0_30px_rgba(45,212,191,0.15)]">
            <Network size={24} className="text-teal-400" />
          </div>
          <h1 className="text-2xl font-mono font-medium text-slate-100 tracking-tight">
            NEXUS CRM
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-body">
            {mode === 'login'
              ? 'Sign in to your network intelligence platform'
              : 'Create your network intelligence account'}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-panel border border-border rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-6">
            {mode === 'login' ? '— Sign In' : '— Create Account'}
          </h2>
          {mode === 'login' ? (
            <LoginForm onSwitch={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitch={() => setMode('login')} />
          )}
        </div>

        <p className="text-center text-xs text-slate-700 mt-6 font-mono">
          Secure · Private · Your data stays yours
        </p>
      </div>
    </div>
  )
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-void flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
      <p className="text-xs font-mono text-slate-600">Initializing Nexus…</p>
    </div>
  </div>
)
