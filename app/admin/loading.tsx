import { Loader2 } from 'lucide-react'
import Card from '@/components/ui/Card'

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded-lg w-80 animate-pulse mb-4"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
          ))}
        </div>

        {/* Content Skeleton */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          </div>
        </Card>

        {/* Loading Spinner */}
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mb-4" />
          <p className="text-gray-600 text-lg">Đang tải admin panel...</p>
        </div>
      </div>
    </div>
  )
}
