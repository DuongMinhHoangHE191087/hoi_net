'use client'

import { ShieldAlert, Home, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export default function UnauthorizedPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="glassmorphism-strong p-12 max-w-md w-full text-center animate-scale-in">
        <div className="inline-block mb-6">
          <div className="p-4 bg-red-100 rounded-3xl animate-pulse">
            <ShieldAlert className="w-16 h-16 text-red-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">
          <span className="gradient-text-alt">Không Có Quyền Truy Cập</span>
        </h1>

        <p className="text-gray-700 mb-8 leading-relaxed">
          {user ? (
            <>
              Bạn đang đăng nhập với email: <strong>{user.email}</strong>
              <br />
              Tài khoản này không có quyền truy cập Admin Panel.
            </>
          ) : (
            'Bạn cần đăng nhập với tài khoản admin để truy cập trang này.'
          )}
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/">
            <button className="w-full btn-glass-primary py-3 transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]">
              <span className="flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                Về Trang Chủ
              </span>
            </button>
          </Link>

          {user ? (
            <button
              onClick={signOut}
              className="w-full btn-glass-secondary py-3 transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Đăng Xuất
            </button>
          ) : (
            <Link href="/login">
              <button className="w-full btn-glass-secondary py-3 transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]">
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Đăng Nhập
                </span>
              </button>
            </Link>
          )}
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ quản trị viên.
        </p>
      </div>
    </div>
  )
}

