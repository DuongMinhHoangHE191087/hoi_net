/**
 * Lazy RichTextEditor Loader
 * 
 * RichTextEditor là component nặng (~100KB+ với tiptap)
 * Chỉ load khi user thực sự cần edit content
 */

'use client'

import dynamic from 'next/dynamic'

// Skeleton cho editor khi đang load
function EditorSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar skeleton */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 bg-gray-200 rounded animate-pulse"
          />
        ))}
      </div>
      {/* Content area skeleton */}
      <div className="p-4 min-h-[200px] bg-white">
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  )
}

// Lazy load RichTextEditor - only when component mounts
export const LazyRichTextEditor = dynamic(
  () => import('./RichTextEditor'),
  {
    loading: () => <EditorSkeleton />,
    ssr: false, // Editor uses window/document, disable SSR
  }
)

// Lazy load AdvancedRichTextEditor
export const LazyAdvancedRichTextEditor = dynamic(
  () => import('./AdvancedRichTextEditor'),
  {
    loading: () => <EditorSkeleton />,
    ssr: false,
  }
)

// Re-export types
export type { default as RichTextEditorProps } from './RichTextEditor'
