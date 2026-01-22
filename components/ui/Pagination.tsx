'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import Button from './Button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = []
  const showPages = 5 // Số trang hiển thị tối đa

  // Calculate page range
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
  let endPage = Math.min(totalPages, startPage + showPages - 1)

  if (endPage - startPage < showPages - 1) {
    startPage = Math.max(1, endPage - showPages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* First Page */}
      <Button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        variant="secondary"
        size="sm"
        className="hidden sm:flex"
      >
        <ChevronsLeft className="w-4 h-4" />
      </Button>

      {/* Previous Page */}
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="secondary"
        size="sm"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="ml-1 hidden sm:inline">Trước</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {startPage > 1 && (
          <>
            <Button
              onClick={() => onPageChange(1)}
              variant="secondary"
              size="sm"
              className="w-10"
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}

        {pages.map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            variant={currentPage === page ? 'primary' : 'secondary'}
            size="sm"
            className="w-10"
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
            <Button
              onClick={() => onPageChange(totalPages)}
              variant="secondary"
              size="sm"
              className="w-10"
            >
              {totalPages}
            </Button>
          </>
        )}
      </div>

      {/* Next Page */}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="secondary"
        size="sm"
      >
        <span className="mr-1 hidden sm:inline">Sau</span>
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Last Page */}
      <Button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        variant="secondary"
        size="sm"
        className="hidden sm:flex"
      >
        <ChevronsRight className="w-4 h-4" />
      </Button>

      {/* Page Info */}
      <span className="text-sm text-gray-600 ml-2 hidden md:block">
        Trang {currentPage} / {totalPages}
      </span>
    </div>
  )
}
