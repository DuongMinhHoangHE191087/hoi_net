'use client'

import { useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Có lỗi xảy ra
        </h1>

        <p className="text-gray-600 mb-6">
          Xin lỗi, đã xảy ra lỗi khi tải dashboard của bạn.
        </p>

        {error.message && (
          <p className="text-sm text-gray-500 mb-6 p-4 bg-gray-100 rounded">
            {error.message}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <Button
            variant="primary"
            onClick={reset}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>

          <Button
            variant="secondary"
            onClick={() => window.location.href = '/'}
          >
            <Home className="w-4 h-4 mr-2" />
            Về trang chủ
          </Button>
        </div>
      </Card>
    </div>
  )
}

