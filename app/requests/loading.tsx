import { Loader2 } from 'lucide-react'
import Card from '@/components/ui/Card'

export default function RequestsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-80 animate-pulse"></div>
        </div>

        {/* Filter Skeleton */}
        <div className="flex gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg w-28 animate-pulse"></div>
          ))}
        </div>

        {/* Requests List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Loading Spinner */}
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mb-4" />
          <p className="text-gray-600 text-lg">Đang tải yêu cầu...</p>
        </div>
      </div>
    </div>
  )
}
