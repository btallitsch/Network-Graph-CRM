import { type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Network,
  LayoutDashboard,
  Users,
  LogOut,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/graph', icon: Network, label: 'Network Graph' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
]

interface AppLayoutProps {
  children: ReactNode
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex h-screen bg-void overflow-hidden font-body">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-abyss border-r border-border">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
              <Network size={16} className="text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-mono font-medium text-slate-100 tracking-wider">NEXUS</p>
              <p className="text-xs font-mono text-slate-600">CRM v1.0</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  isActive
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-muted border border-transparent'
                )
              }
            >
              <Icon size={16} />
              <span>{label}</span>
              {location.pathname === to && (
                <ChevronRight size={14} className="ml-auto text-teal-500/60" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-border space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                isActive
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-muted border border-transparent'
              )
            }
          >
            <Settings size={16} />
            <span>Settings</span>
          </NavLink>

          <div className="flex items-center gap-3 px-3 py-3 mt-1">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xs font-mono font-medium text-teal-400">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">
                {user?.displayName ?? 'User'}
              </p>
              <p className="text-xs text-slate-600 truncate">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
