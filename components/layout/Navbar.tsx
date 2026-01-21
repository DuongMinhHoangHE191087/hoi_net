'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ImageIcon, Menu, X, Sparkles, User, LogOut, Settings, FileText, ShieldCheck, ChevronDown, ExternalLink } from 'lucide-react'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useSiteSettings, useNavigationLinks, DEFAULT_SITE_SETTINGS } from '@/hooks/useSiteSettings'
import toast from 'react-hot-toast'
import LogoutConfirmDialog from '@/components/ui/LogoutConfirmDialog'
import NotificationBell from '@/components/NotificationBell'
import { useRealtimeNotifications } from '@/hooks/useNotifications'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, isAdmin, signOut, loading } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Enable realtime notifications for logged in users
  useRealtimeNotifications(user?.id)

  // Dynamic settings
  const { data: settings = DEFAULT_SITE_SETTINGS } = useSiteSettings()
  const { data: navLinks = [] } = useNavigationLinks()

  // Memoize computed values to prevent recalculation on every render
  const brandName = useMemo(() => settings.brand_name || DEFAULT_SITE_SETTINGS.brand_name, [settings.brand_name])
  const brandLogoUrl = useMemo(() => settings.brand_logo_url || '', [settings.brand_logo_url])
  const brandLogoType = useMemo(() => settings.brand_logo_type || 'icon', [settings.brand_logo_type])

  // Filter navigation links based on auth status - memoized
  const filteredLinks = useMemo(() => {
    return navLinks.filter((link) => {
      if (link.requires_admin && !isAdmin) return false
      if (link.requires_auth && !user) return false
      return true
    })
  }, [navLinks, isAdmin, user])

  // Fallback links if database is empty - memoized
  const displayLinks = useMemo(() => {
    if (filteredLinks.length > 0) return filteredLinks

    return [
      { id: '1', label: 'Blog', href: '/blog', is_external: false, show_in_mobile: true },
      { id: '2', label: 'Về Chúng Tôi', href: '/about', is_external: false, show_in_mobile: true },
      { id: '3', label: 'Liên Hệ', href: '/contact', is_external: false, show_in_mobile: true },
    ]
  }, [filteredLinks])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      console.log('[Navbar] Logout confirmed')

      await signOut()

      setUserMenuOpen(false)
      setShowLogoutDialog(false)
      setIsOpen(false)

      toast.success('Đã đăng xuất thành công!', {
        icon: '👋',
        duration: 3000
      })

      console.log('[Navbar] Logout successful')
    } catch (error) {
      console.error('[Navbar] Logout failed:', error)
      toast.error('Đăng xuất thất bại. Vui lòng thử lại.')
      setIsLoggingOut(false)
    }
  }

  // Get user initials for avatar
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

  // Render brand logo
  const renderLogo = () => {
    if (brandLogoType === 'image' && brandLogoUrl) {
      return (
        <Image
          src={brandLogoUrl}
          alt={brandName}
          width={32}
          height={32}
          className="w-8 h-8 object-contain"
        />
      )
    }
    return (
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <ImageIcon className="w-7 h-7 text-primary" />
        <Sparkles className="w-3 h-3 text-secondary absolute -top-1 -right-1 animate-pulse" />
      </motion.div>
    )
  }

  // Render navigation link
  const renderNavLink = (link: typeof displayLinks[0], isMobile = false) => {
    const baseClassName = isMobile
      ? "text-gray-700 hover:text-primary transition-colors py-3 px-4 hover:bg-white/30 rounded-lg font-medium"
      : "text-gray-700 hover:text-primary transition-colors font-medium relative group"

    if (link.is_external) {
      return (
        <a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClassName} inline-flex items-center gap-1`}
          onClick={() => isMobile && setIsOpen(false)}
        >
          {link.label}
          <ExternalLink className="w-3 h-3" />
          {!isMobile && (
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300"></span>
          )}
        </a>
      )
    }

    return (
      <Link
        key={link.id}
        href={link.href}
        className={baseClassName}
        onClick={() => isMobile && setIsOpen(false)}
      >
        {link.label}
        {!isMobile && (
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300"></span>
        )}
      </Link>
    )
  }

  return (
    <motion.nav
      className="fixed top-4 left-4 right-4 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glassmorphism-strong px-6 py-4 shadow-glow">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 group">
            {renderLogo()}
            <span className="text-xl font-bold gradient-text">{brandName}</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {displayLinks.map((link) => renderNavLink(link))}

            {/* User Authentication Section */}
            {!loading && (
              <>
                {user ? (
                  // Logged In - Show Notification Bell + User Menu
                  <div className="flex items-center gap-2">
                    {/* Notification Bell */}
                    <NotificationBell />

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                    <motion.button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/50 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-glow-pink">
                        {getUserInitials()}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </motion.button>

                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-64 glassmorphism-strong shadow-xl rounded-xl overflow-hidden"
                        >
                          {/* User Info */}
                          <div className="p-4 border-b border-white/30">
                            <p className="text-sm font-semibold text-gray-800">
                              {user.user_metadata?.full_name || 'Người dùng'}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {user.email}
                            </p>
                            {isAdmin && (
                              <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-gradient-primary text-white text-xs font-semibold rounded-full">
                                <ShieldCheck className="w-3 h-3" />
                                Admin
                              </span>
                            )}
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white/50 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <User className="w-4 h-4" />
                              <span className="text-sm font-medium">Dashboard</span>
                            </Link>

                            <Link
                              href="/profile"
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white/50 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Settings className="w-4 h-4" />
                              <span className="text-sm font-medium">Hồ Sơ</span>
                            </Link>

                            <Link
                              href="/requests"
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white/50 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <FileText className="w-4 h-4" />
                              <span className="text-sm font-medium">Yêu Cầu</span>
                            </Link>

                            {isAdmin && (
                              <Link
                                href="/admin"
                                className="flex items-center gap-3 px-4 py-3 text-primary hover:bg-white/50 transition-colors border-t border-white/30"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-sm font-semibold">Admin Panel</span>
                              </Link>
                            )}

                            <button
                              onClick={() => {
                                setUserMenuOpen(false)
                                setShowLogoutDialog(true)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors border-t border-white/30"
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="text-sm font-medium">Đăng Xuất</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  // Not Logged In - Show Login/Register Buttons
                  <>
                    <Link href="/login">
                      <motion.button
                        className="px-6 py-2.5 text-gray-700 font-semibold rounded-lg hover:bg-white/50 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Đăng Nhập
                      </motion.button>
                    </Link>
                    <Link href="/register">
                      <motion.button
                        className="btn-glass-primary px-6 py-2.5 text-base"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="flex items-center gap-2">
                          Đăng Ký
                          <Sparkles className="w-4 h-4" />
                        </span>
                      </motion.button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden cursor-pointer p-2 hover:bg-white/30 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6 text-primary" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 pt-4 border-t border-white/30 overflow-hidden"
            >
              <div className="flex flex-col gap-3">
                {displayLinks
                  .filter((link) => link.show_in_mobile !== false)
                  .map((link) => renderNavLink(link, true))}

                {/* Mobile User Menu */}
                {!loading && (
                  <>
                    {user ? (
                      <>
                        {/* User Info Mobile */}
                        <div className="p-4 bg-white/30 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold shadow-glow-pink">
                              {getUserInitials()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {user.user_metadata?.full_name || 'Người dùng'}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          {isAdmin && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-primary text-white text-xs font-semibold rounded-full">
                              <ShieldCheck className="w-3 h-3" />
                              Admin
                            </span>
                          )}
                        </div>

                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors py-3 px-4 hover:bg-white/30 rounded-lg font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="w-5 h-5" />
                          Dashboard
                        </Link>

                        <Link
                          href="/profile"
                          className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors py-3 px-4 hover:bg-white/30 rounded-lg font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          <Settings className="w-5 h-5" />
                          Hồ Sơ
                        </Link>

                        <Link
                          href="/requests"
                          className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors py-3 px-4 hover:bg-white/30 rounded-lg font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          <FileText className="w-5 h-5" />
                          Yêu Cầu
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 text-primary hover:bg-white/30 transition-colors py-3 px-4 rounded-lg font-semibold"
                            onClick={() => setIsOpen(false)}
                          >
                            <ShieldCheck className="w-5 h-5" />
                            Admin Panel
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            setIsOpen(false)
                            setShowLogoutDialog(true)
                          }}
                          className="flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors py-3 px-4 rounded-lg font-medium w-full"
                        >
                          <LogOut className="w-5 h-5" />
                          Đăng Xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="text-gray-700 hover:text-primary transition-colors py-3 px-4 hover:bg-white/30 rounded-lg font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          Đăng Nhập
                        </Link>
                        <Link href="/register" onClick={() => setIsOpen(false)}>
                          <button className="btn-glass-primary w-full py-3">
                            <span className="flex items-center justify-center gap-2">
                              Đăng Ký
                              <Sparkles className="w-4 h-4" />
                            </span>
                          </button>
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => !isLoggingOut && setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        loading={isLoggingOut}
      />
    </motion.nav>
  )
}
