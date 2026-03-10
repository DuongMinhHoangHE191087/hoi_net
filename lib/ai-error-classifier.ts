/**
 * AI Error Classifier
 * Classifies Gemini/Imagen3 errors into structured categories
 * Provides user-friendly Vietnamese messages and admin technical details
 */

// ============================================
// Types
// ============================================

export type AIErrorCategory =
  | 'quota_exceeded'
  | 'safety_filter'
  | 'api_key_invalid'
  | 'network_error'
  | 'image_format'
  | 'image_too_large'
  | 'timeout'
  | 'model_unavailable'
  | 'content_blocked'
  | 'rate_limited'
  | 'unknown'

export type AIErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface ClassifiedAIError {
  category: AIErrorCategory
  severity: AIErrorSeverity
  // User-facing (Vietnamese)
  userTitle: string
  userMessage: string
  userSuggestion: string
  // Admin-facing (technical)
  adminMessage: string
  adminDetails: string
  // Actions
  retryable: boolean
  retryAfterMs?: number
  suggestedActions: string[]
  // Raw data
  rawError: string
  timestamp: string
}

export interface AIProcessingLog {
  requestId: string
  action: string
  startedAt: string
  completedAt?: string
  totalImages: number
  results: AIImageResult[]
  overallStatus: 'success' | 'partial' | 'failed'
  processingTimeMs: number
  adminEmail?: string
}

export interface AIImageResult {
  index: number
  originalUrl: string
  processedUrl?: string
  success: boolean
  analysis?: {
    description?: string
    quality?: string
    issues?: string[]
    suggestions?: string[]
  }
  error?: ClassifiedAIError
  processingTimeMs?: number
}

// ============================================
// Error Classification Rules
// ============================================

interface ErrorRule {
  patterns: (string | RegExp)[]
  category: AIErrorCategory
  severity: AIErrorSeverity
  userTitle: string
  userMessage: string
  userSuggestion: string
  adminMessage: string
  retryable: boolean
  retryAfterMs?: number
  suggestedActions: string[]
}

const ERROR_RULES: ErrorRule[] = [
  {
    patterns: ['QUOTA', 'quota', 'Resource has been exhausted', 'resourceExhausted'],
    category: 'quota_exceeded',
    severity: 'high',
    userTitle: 'Hệ thống đang bận',
    userMessage: 'Hệ thống AI đang xử lý quá nhiều yêu cầu. Vui lòng đợi một chút.',
    userSuggestion: 'Admin sẽ thử lại sau ít phút. Bạn sẽ nhận thông báo khi hoàn thành.',
    adminMessage: 'API quota đã hết. Cần đợi reset hoặc dùng key khác.',
    retryable: true,
    retryAfterMs: 60000,
    suggestedActions: ['Đợi 1-2 phút rồi thử lại', 'Kiểm tra quota tại Google AI Studio', 'Chuyển sang API key dự phòng']
  },
  {
    patterns: ['429', 'Too Many Requests', 'rate limit', 'rateLimited'],
    category: 'rate_limited',
    severity: 'medium',
    userTitle: 'Đang xử lý quá nhanh',
    userMessage: 'Hệ thống cần thêm thời gian giữa các lần xử lý.',
    userSuggestion: 'Yêu cầu của bạn sẽ được xử lý lại tự động sau vài giây.',
    adminMessage: 'Rate limit hit. Giảm concurrency hoặc đợi vài giây.',
    retryable: true,
    retryAfterMs: 5000,
    suggestedActions: ['Tự động retry sau 5 giây', 'Giảm số ảnh xử lý đồng thời']
  },
  {
    patterns: ['SAFETY', 'safety', 'blocked', 'BLOCK_', 'HarmCategory'],
    category: 'safety_filter',
    severity: 'medium',
    userTitle: 'Ảnh không phù hợp',
    userMessage: 'AI không thể xử lý ảnh này do vi phạm chính sách nội dung.',
    userSuggestion: 'Vui lòng thử với ảnh khác hoặc liên hệ admin để xử lý thủ công.',
    adminMessage: 'Ảnh bị chặn bởi Safety Filter của Gemini/Imagen.',
    retryable: false,
    suggestedActions: ['Xử lý thủ công (không dùng AI)', 'Thử crop/edit ảnh trước khi gửi lại', 'Điều chỉnh safety settings']
  },
  {
    patterns: ['API_KEY_INVALID', 'api_key', 'apiKey', 'UNAUTHENTICATED', 'invalid API key'],
    category: 'api_key_invalid',
    severity: 'critical',
    userTitle: 'Lỗi hệ thống',
    userMessage: 'Hệ thống AI đang gặp sự cố kỹ thuật. Admin đã được thông báo.',
    userSuggestion: 'Vui lòng đợi admin xử lý. Bạn sẽ nhận thông báo khi sẵn sàng.',
    adminMessage: 'API key không hợp lệ hoặc đã hết hạn!',
    retryable: false,
    suggestedActions: ['Kiểm tra GEMINI_API_KEY trong .env', 'Tạo API key mới tại Google AI Studio', 'Kiểm tra billing account']
  },
  {
    patterns: ['fetch', 'network', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'Failed to fetch'],
    category: 'network_error',
    severity: 'medium',
    userTitle: 'Lỗi kết nối',
    userMessage: 'Không thể kết nối tới hệ thống AI. Vui lòng thử lại.',
    userSuggestion: 'Thường lỗi này tự khắc phục sau vài giây. Admin sẽ thử lại cho bạn.',
    adminMessage: 'Lỗi network khi gọi API Gemini hoặc fetch ảnh gốc.',
    retryable: true,
    retryAfterMs: 3000,
    suggestedActions: ['Thử lại ngay', 'Kiểm tra kết nối internet của server', 'Kiểm tra URL ảnh gốc có hợp lệ']
  },
  {
    patterns: ['image', 'format', 'mime', 'unsupported', 'Invalid image'],
    category: 'image_format',
    severity: 'low',
    userTitle: 'Định dạng ảnh không hỗ trợ',
    userMessage: 'Ảnh có định dạng không được hỗ trợ bởi AI.',
    userSuggestion: 'Vui lòng chuyển ảnh sang định dạng JPG hoặc PNG và thử lại.',
    adminMessage: 'Định dạng ảnh không được Gemini/Imagen hỗ trợ.',
    retryable: false,
    suggestedActions: ['Chuyển đổi ảnh sang JPG/PNG', 'Kiểm tra mime type của ảnh', 'Upload lại ảnh với định dạng khác']
  },
  {
    patterns: ['too large', 'size limit', 'payload too large', 'request entity too large'],
    category: 'image_too_large',
    severity: 'low',
    userTitle: 'Ảnh quá lớn',
    userMessage: 'Kích thước ảnh vượt quá giới hạn cho phép.',
    userSuggestion: 'Vui lòng giảm kích thước ảnh (dưới 20MB) và thử lại.',
    adminMessage: 'Ảnh vượt quá kích thước tối đa cho API.',
    retryable: false,
    suggestedActions: ['Resize ảnh trước khi upload', 'Nén ảnh xuống dưới 20MB', 'Dùng công cụ compress ảnh online']
  },
  {
    patterns: ['timeout', 'Timeout', 'DEADLINE_EXCEEDED', 'deadline'],
    category: 'timeout',
    severity: 'medium',
    userTitle: 'Xử lý quá lâu',
    userMessage: 'AI mất quá nhiều thời gian để xử lý ảnh này.',
    userSuggestion: 'Admin sẽ thử lại. Ảnh phức tạp có thể cần xử lý thủ công.',
    adminMessage: 'Request timeout - ảnh có thể quá phức tạp hoặc server quá tải.',
    retryable: true,
    retryAfterMs: 10000,
    suggestedActions: ['Thử lại với timeout dài hơn', 'Giảm số ảnh xử lý cùng lúc', 'Xử lý từng ảnh riêng biệt']
  },
  {
    patterns: ['model', 'not found', 'MODEL_NOT_FOUND', 'unavailable', 'gemini', 'imagen'],
    category: 'model_unavailable',
    severity: 'high',
    userTitle: 'Hệ thống AI đang bảo trì',
    userMessage: 'Mô hình AI hiện đang không khả dụng. Vui lòng thử lại sau.',
    userSuggestion: 'Hệ thống sẽ tự động khôi phục. Admin sẽ thử lại cho bạn.',
    adminMessage: 'Model AI không khả dụng. Có thể đang maintenance hoặc bị deprecated.',
    retryable: true,
    retryAfterMs: 30000,
    suggestedActions: ['Kiểm tra trạng thái Google AI Platform', 'Thử model fallback khác', 'Đợi 5 phút rồi thử lại']
  },
  {
    patterns: ['content', 'RECITATION', 'copyright', 'blocked'],
    category: 'content_blocked',
    severity: 'medium',
    userTitle: 'Nội dung bị hạn chế',
    userMessage: 'AI không thể xử lý nội dung trong ảnh này.',
    userSuggestion: 'Vui lòng liên hệ admin để được xử lý thủ công.',
    adminMessage: 'Nội dung ảnh bị chặn bởi content policy (có thể là copyright hoặc sensitive content).',
    retryable: false,
    suggestedActions: ['Xử lý thủ công', 'Kiểm tra nội dung ảnh', 'Thử với prompt khác']
  }
]

// ============================================
// Classifier Class
// ============================================

export class AIErrorClassifier {
  /**
   * Classify an error into a structured AIError
   */
  static classify(error: unknown): ClassifiedAIError {
    const errorMessage = error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : JSON.stringify(error)

    // Find matching rule
    for (const rule of ERROR_RULES) {
      const matches = rule.patterns.some(pattern => {
        if (typeof pattern === 'string') {
          return errorMessage.toLowerCase().includes(pattern.toLowerCase())
        }
        return pattern.test(errorMessage)
      })

      if (matches) {
        return {
          category: rule.category,
          severity: rule.severity,
          userTitle: rule.userTitle,
          userMessage: rule.userMessage,
          userSuggestion: rule.userSuggestion,
          adminMessage: rule.adminMessage,
          adminDetails: errorMessage,
          retryable: rule.retryable,
          retryAfterMs: rule.retryAfterMs,
          suggestedActions: rule.suggestedActions,
          rawError: errorMessage,
          timestamp: new Date().toISOString()
        }
      }
    }

    // Default: unknown error
    return {
      category: 'unknown',
      severity: 'medium',
      userTitle: 'Lỗi không xác định',
      userMessage: 'Đã xảy ra lỗi khi xử lý ảnh. Admin đã được thông báo.',
      userSuggestion: 'Vui lòng đợi admin xem xét và xử lý.',
      adminMessage: 'Lỗi không xác định khi xử lý AI.',
      adminDetails: errorMessage,
      retryable: true,
      retryAfterMs: 5000,
      suggestedActions: ['Xem log chi tiết', 'Thử lại', 'Xử lý thủ công nếu lỗi lặp lại'],
      rawError: errorMessage,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Get severity color for UI rendering
   */
  static getSeverityColor(severity: AIErrorSeverity): {
    bg: string; text: string; border: string; icon: string
  } {
    switch (severity) {
      case 'low':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'text-yellow-500' }
      case 'medium':
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-500' }
      case 'high':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' }
      case 'critical':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: 'text-red-600' }
    }
  }

  /**
   * Get category icon name (Lucide icon names)
   */
  static getCategoryIcon(category: AIErrorCategory): string {
    switch (category) {
      case 'quota_exceeded': return 'Gauge'
      case 'rate_limited': return 'Timer'
      case 'safety_filter': return 'ShieldAlert'
      case 'api_key_invalid': return 'KeyRound'
      case 'network_error': return 'WifiOff'
      case 'image_format': return 'FileImage'
      case 'image_too_large': return 'FileWarning'
      case 'timeout': return 'Clock'
      case 'model_unavailable': return 'ServerCrash'
      case 'content_blocked': return 'Ban'
      case 'unknown': return 'CircleAlert'
    }
  }

  /**
   * Get category label in Vietnamese
   */
  static getCategoryLabel(category: AIErrorCategory): string {
    switch (category) {
      case 'quota_exceeded': return 'Hết quota'
      case 'rate_limited': return 'Giới hạn tốc độ'
      case 'safety_filter': return 'Bộ lọc an toàn'
      case 'api_key_invalid': return 'API key lỗi'
      case 'network_error': return 'Lỗi mạng'
      case 'image_format': return 'Định dạng ảnh'
      case 'image_too_large': return 'Ảnh quá lớn'
      case 'timeout': return 'Hết thời gian'
      case 'model_unavailable': return 'Model không khả dụng'
      case 'content_blocked': return 'Nội dung bị chặn'
      case 'unknown': return 'Lỗi không xác định'
    }
  }

  /**
   * Build a user-friendly notification message from processing results
   */
  static buildNotificationMessage(log: AIProcessingLog): {
    title: string
    message: string
    type: 'success' | 'info' | 'warning' | 'error'
  } {
    const { overallStatus, totalImages, results } = log
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    if (overallStatus === 'success') {
      return {
        title: '🎉 Xử lý AI hoàn thành!',
        message: `Tất cả ${totalImages} ảnh đã được xử lý thành công. Vui lòng kiểm tra kết quả.`,
        type: 'success'
      }
    }

    if (overallStatus === 'partial') {
      const errors = results.filter(r => !r.success && r.error)
      const mainError = errors[0]?.error

      return {
        title: '⚠️ Xử lý AI hoàn thành một phần',
        message: `Đã xử lý ${successCount}/${totalImages} ảnh thành công. ${failCount} ảnh gặp lỗi${mainError ? `: ${mainError.userMessage}` : '.'}. Admin sẽ xử lý phần còn lại.`,
        type: 'warning'
      }
    }

    // Failed
    const errors = results.filter(r => !r.success && r.error)
    const mainError = errors[0]?.error

    return {
      title: '❌ Xử lý AI thất bại',
      message: mainError
        ? `${mainError.userMessage} ${mainError.userSuggestion}`
        : 'AI không thể xử lý ảnh. Admin sẽ xử lý thủ công cho bạn sớm nhất.',
      type: 'error'
    }
  }
}

export default AIErrorClassifier
