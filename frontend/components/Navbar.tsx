'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <nav className="glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-olive-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <span className="text-xl font-bold text-white">QuickBird</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/projects" className="text-gray-300 hover:text-white transition-colors">
              Projects
            </Link>
            <Link href="/dashboard/tasks" className="text-gray-300 hover:text-white transition-colors">
              Tasks
            </Link>
            <Link href="/dashboard/tools" className="text-gray-300 hover:text-white transition-colors">
              Tools
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-olive-500/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-olive-400" />
                  </div>
                  <span className="text-white text-sm">{user.username}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="glass border-gray-600 hover:border-olive-500"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="glass border-gray-600 hover:border-olive-500">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="glass-card-hover olive-glow-hover">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass-card mt-4 rounded-lg">
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/projects"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Projects
              </Link>
              <Link
                href="/dashboard/tasks"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Tasks
              </Link>
              <Link
                href="/dashboard/tools"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Tools
              </Link>
              
              {user ? (
                <div className="pt-4 border-t border-gray-600">
                  <div className="flex items-center px-3 py-2">
                    <div className="w-8 h-8 bg-olive-500/20 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-olive-400" />
                    </div>
                    <span className="text-white text-sm">{user.username}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                    className="w-full mt-2 glass border-gray-600 hover:border-olive-500"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-600 space-y-2">
                  <Link href="/auth/login" className="block" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full glass border-gray-600 hover:border-olive-500">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="block" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full glass-card-hover olive-glow-hover">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}