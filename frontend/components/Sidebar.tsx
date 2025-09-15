'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Folder, 
  CheckSquare, 
  Wrench, 
  User, 
  Settings,
  LogOut,
  Clock
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: Folder },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Time Tracking', href: '/dashboard/time-tracking', icon: Clock },
  { name: 'Tools', href: '/dashboard/tools', icon: Wrench },
  { name: 'Users', href: '/dashboard/users', icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center space-x-2 px-6 py-4 border-b border-white/10">
        <div className="w-8 h-8 bg-olive-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">Q</span>
        </div>
        <span className="text-xl font-bold text-white">QuickBird</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-olive-500/20 text-olive-400 border border-olive-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="space-y-2">
          <Link
            href="/dashboard/profile"
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === '/dashboard/profile'
                ? 'bg-olive-500/20 text-olive-400 border border-olive-500/30'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            )}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
          
          <Link
            href="/dashboard/settings"
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === '/dashboard/settings'
                ? 'bg-olive-500/20 text-olive-400 border border-olive-500/30'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            )}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          
          <button
            onClick={() => logout()}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}