'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-primary/5 to-secondary/5 p-4">
          <div className="max-w-2xl w-full">
            {/* Error Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Oops! Có lỗi xảy ra</h1>
                    <p className="text-white/90">Đã xảy ra lỗi không mong muốn</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Error Message */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Chi tiết lỗi:</h2>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-mono text-sm break-all">
                      {this.state.error?.message || 'Unknown error'}
                    </p>
                  </div>
                </div>

                {/* Error Stack (Development) */}
                {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Stack Trace:</h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-auto">
                      <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Retry Button */}
                  <button
                    onClick={this.handleReset}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Thử lại
                  </button>

                  {/* Go Home Button */}
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                  >
                    <Home className="w-5 h-5" />
                    Về trang chủ
                  </button>
                </div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Gợi ý:</strong> Nếu lỗi vẫn tiếp tục xảy ra, vui lòng:{' '}
                    <span className="font-semibold">làm mới trang (F5)</span> hoặc{' '}
                    <span className="font-semibold">xóa cache trình duyệt</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Lỗi đã được ghi lại và sẽ được xử lý sớm nhất
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for easier use
export default function ErrorBoundaryWrapper({ children, fallback }: Props) {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>
}
