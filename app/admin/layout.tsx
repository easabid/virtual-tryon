'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  LogOut,
  Sparkles,
  ChevronLeft
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!adminUser) {
        router.push('/dashboard')
        return
      }

      setUser(user)
      setIsAdmin(true)
      setIsLoading(false)
    }

    checkAdmin()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/dresses', icon: ShoppingBag, label: 'Manage Dresses' },
    { href: '/admin/users', icon: Users, label: 'Manage Users' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-purple-900 to-purple-800 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 bg-purple-950">
            <Sparkles className="h-8 w-8 text-purple-300" />
            <span className="ml-2 text-xl font-bold text-white">Admin Panel</span>
          </div>

          {/* Back to Dashboard */}
          <Link
            href="/dashboard"
            className="mx-4 mt-4 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to User View
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-700 text-white'
                      : 'text-purple-100 hover:bg-purple-700/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="ml-3 font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User info & Logout */}
          <div className="border-t border-purple-700 p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.user_metadata?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-purple-300 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-purple-100 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
