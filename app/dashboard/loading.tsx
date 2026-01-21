import { Loader2 } from 'lucide-react'
import Card from '@/components/ui/Card'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </Card>
          ))}
        </div>

        {/* Loading Spinner */}
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mb-4" />
          <p className="text-gray-600 text-lg">Đang tải dashboard...</p>
        </div>
      </div>
    </div>
  )
}
