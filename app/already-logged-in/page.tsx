'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { motion } from 'framer-motion'
import { CheckCircle, Home, LayoutDashboard, Shield } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function AlreadyLoggedIn() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()

  useEffect(() => {
    // If not logged in, redirect to login
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="glassmorphism-strong p-8 rounded-2xl">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600 font-medium">Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glassmorphism-strong max-w-md w-full p-8 rounded-2xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow-pink">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Bạn Đã Đăng Nhập
        </h1>

        <p className="text-gray-600 mb-2">
          Đang đăng nhập với tài khoản:
        </p>
        <p className="text-lg font-semibold text-primary mb-6">
          {user.email}
        </p>

        {isAdmin && (
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold">
              <Shield className="w-4 h-4" />
              Admin Account
            </span>
          </div>
        )}

        <div className="space-y-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => router.push(isAdmin ? '/admin' : '/dashboard')}
              className="w-full flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-5 h-5" />
              Đi đến {isAdmin ? 'Admin Panel' : 'Dashboard'}
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => router.push('/')}
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Quay về Trang Chủ
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

