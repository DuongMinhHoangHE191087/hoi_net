'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ImagePlus, Settings, Shield, LogOut, User } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useState } from 'react'
import LogoutConfirmDialog from '@/components/ui/LogoutConfirmDialog'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdmin, signOut } = useAuth()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, showAlways: true },
    { href: '/request-photo', label: 'Yêu Cầu Phục Hồi', icon: ImagePlus, showAlways: true },
    { href: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
    { href: '/settings', label: 'Cài Đặt', icon: Settings, showAlways: true },
  ]

  // Filter menu items based on admin status
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false
    return true
  })

  const isActive = (href: string) => pathname === href

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true)
      console.log('[Sidebar] Logout confirmed')

      await signOut()

      setShowLogoutDialog(false)
      toast.success('Đã đăng xuất thành công!', {
        icon: '👋',
        duration: 3000
      })

      console.log('[Sidebar] Logout successful, redirecting...')
    } catch (error) {
      console.error('[Sidebar] Logout failed:', error)
      toast.error('Đăng xuất thất bại. Vui lòng thử lại.')
      setIsLoggingOut(false)
    }
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'Người dùng'
    if (user.user_metadata?.full_name) return user.user_metadata.full_name
    return user.email?.split('@')[0] || 'Người dùng'
  }

  // Get user initials
  const getUserInitials = () => {
    if (!user) return 'U'
    if (user.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.split(' ')
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase()
    }
    return user.email?.[0].toUpperCase() || 'U'
  }

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
        {/* User Profile Section */}
        {user && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {getUserInitials()}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="flex flex-col gap-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer
                    ${isActive(item.href)
                      ? 'bg-gradient-primary text-white font-semibold shadow-lg'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all font-medium group"
          >
            <LogOut className="w-5 h-5 group-hover:animate-pulse" />
            Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => !isLoggingOut && setShowLogoutDialog(false)}
        onConfirm={handleLogoutConfirm}
        loading={isLoggingOut}
      />
    </>
  )
}

