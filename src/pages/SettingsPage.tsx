import { useState } from 'react'
import { User, Shield, Database, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export const SettingsPage = () => {
  const { user, signOut } = useAuth()

  return (
    <div className="h-full overflow-y-auto bg-void">
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <h1 className="text-xl font-mono font-medium text-slate-100">Settings</h1>
        <p className="text-xs text-slate-600 mt-0.5 font-body">Manage your account and preferences</p>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-2xl">
        {/* Profile */}
        <Section icon={<User size={15} />} title="Profile">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-xl">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                user?.displayName?.[0]?.toUpperCase() ?? '?'
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">{user?.displayName ?? 'Anonymous'}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <p className="text-xs text-slate-600 mt-0.5">UID: {user?.uid?.slice(0, 12)}…</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-body">
            Profile details are managed through your authentication provider (Google or email settings).
          </p>
        </Section>

        {/* Security */}
        <Section icon={<Shield size={15} />} title="Security">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm text-slate-300">Two-Factor Authentication</p>
                <p className="text-xs text-slate-600">Managed by your auth provider</p>
              </div>
              <span className="text-xs font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded">
                Provider Managed
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-slate-300">Session</p>
                <p className="text-xs text-slate-600">Signed in via Firebase Auth</p>
              </div>
              <Button variant="danger" size="sm" icon={<LogOut size={12} />} onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </Section>

        {/* Data */}
        <Section icon={<Database size={15} />} title="Data & Privacy">
          <div className="space-y-3">
            <InfoRow label="Storage" value="Firestore (Google Cloud)" />
            <InfoRow label="Data isolation" value="Per-user Firestore rules" />
            <InfoRow label="Auth provider" value="Firebase Authentication" />
          </div>
          <p className="text-xs text-slate-600 mt-4 font-body leading-relaxed">
            All your network data is stored privately in Firestore, scoped to your user account. Other users cannot access your data.
          </p>
        </Section>

        {/* About */}
        <Section icon={<span className="text-teal-400 text-xs font-mono">v1</span>} title="About Nexus CRM">
          <div className="space-y-2">
            <InfoRow label="Version" value="1.0.0" />
            <InfoRow label="Stack" value="React + TypeScript + Firebase" />
            <InfoRow label="Graph Engine" value="D3.js Force Simulation" />
          </div>
        </Section>
      </div>
    </div>
  )
}

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="bg-panel border border-border rounded-xl p-6">
    <h2 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
      <span className="text-teal-400">{icon}</span> {title}
    </h2>
    {children}
  </div>
)

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
    <span className="text-xs text-slate-500 font-mono">{label}</span>
    <span className="text-xs text-slate-300 font-mono">{value}</span>
  </div>
)
