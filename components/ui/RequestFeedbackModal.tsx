'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Star, Send, Loader2, CheckCircle, ThumbsUp, ThumbsDown,
  Sparkles, MessageSquare, Clock, Award
} from 'lucide-react'
import toast from 'react-hot-toast'

interface RequestFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: string
  requestType: 'restore' | 'family'
  onFeedbackSubmitted?: () => void
}

const FEEDBACK_TAGS = [
  { id: 'quality', label: '✨ Chất lượng tốt', icon: Award },
  { id: 'fast', label: '⚡ Xử lý nhanh', icon: Clock },
  { id: 'natural', label: '🎨 Màu sắc tự nhiên', icon: Sparkles },
  { id: 'detail', label: '🔍 Chi tiết sắc nét', icon: Sparkles },
  { id: 'exceeded', label: '🎉 Vượt mong đợi', icon: ThumbsUp },
]

export default function RequestFeedbackModal({
  isOpen,
  onClose,
  requestId,
  requestType,
  onFeedbackSubmitted
}: RequestFeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [qualityRating, setQualityRating] = useState(0)
  const [speedRating, setSpeedRating] = useState(0)
  const [comment, setComment] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingFeedback, setExistingFeedback] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing feedback
  useEffect(() => {
    if (isOpen && requestId) {
      checkExistingFeedback()
    }
  }, [isOpen, requestId])

  const checkExistingFeedback = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/requests/${requestId}/feedback`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.feedback) {
          setExistingFeedback(data.feedback)
          setRating(data.feedback.rating || 0)
          setQualityRating(data.feedback.quality_rating || 0)
          setSpeedRating(data.feedback.speed_rating || 0)
          setComment(data.feedback.comment || '')
          setWouldRecommend(data.feedback.would_recommend)
          setSelectedTags(data.feedback.tags || [])
        }
      }
    } catch (error) {
      console.error('Error checking existing feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/requests/${requestId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rating,
          quality_rating: qualityRating || undefined,
          speed_rating: speedRating || undefined,
          comment: comment.trim() || undefined,
          would_recommend: wouldRecommend,
          tags: selectedTags.length > 0 ? selectedTags : undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      setSubmitted(true)
      toast.success(data.message || 'Cảm ơn bạn đã gửi đánh giá!')
      
      // Call callback if provided
      onFeedbackSubmitted?.()

      // Close after delay
      setTimeout(() => {
        onClose()
        // Reset form
        setSubmitted(false)
        setRating(0)
        setQualityRating(0)
        setSpeedRating(0)
        setComment('')
        setWouldRecommend(null)
        setSelectedTags([])
      }, 2000)

    } catch (error: any) {
      console.error('Submit feedback error:', error)
      toast.error(error.message || 'Không thể gửi đánh giá')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (
    value: number,
    setValue: (v: number) => void,
    hovered: number,
    setHovered: (v: number) => void,
    size: 'sm' | 'lg' = 'lg'
  ) => {
    const sizeClass = size === 'lg' ? 'w-10 h-10' : 'w-6 h-6'
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`transition-all duration-200 ${
              star <= (hovered || value)
                ? 'text-yellow-400 scale-110'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
          >
            <Star 
              className={`${sizeClass} ${
                star <= (hovered || value) ? 'fill-current' : ''
              }`} 
            />
          </button>
        ))}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {existingFeedback ? 'Cập Nhật Đánh Giá' : 'Đánh Giá Kết Quả'}
                  </h2>
                  <p className="text-sm text-white/80">
                    Chia sẻ trải nghiệm của bạn
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                <p className="mt-2 text-gray-500">Đang tải...</p>
              </div>
            ) : submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-12 text-center"
              >
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Cảm Ơn Bạn!
                </h3>
                <p className="text-gray-600">
                  Đánh giá của bạn giúp chúng tôi phục vụ tốt hơn
                </p>
                <div className="mt-4 flex justify-center gap-1">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Main Rating */}
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Bạn hài lòng với kết quả như thế nào? *
                  </label>
                  {renderStars(rating, setRating, hoveredRating, setHoveredRating)}
                  <div className="mt-2 text-sm text-gray-500">
                    {rating === 1 && 'Rất không hài lòng 😞'}
                    {rating === 2 && 'Không hài lòng 😕'}
                    {rating === 3 && 'Bình thường 😐'}
                    {rating === 4 && 'Hài lòng 😊'}
                    {rating === 5 && 'Rất hài lòng! 🤩'}
                  </div>
                </div>

                {/* Quick Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điều bạn thích (chọn nhiều)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FEEDBACK_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedTags.includes(tag.id)
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Ratings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chất lượng ảnh
                    </label>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setQualityRating(star)}
                          className={`transition-all ${
                            star <= qualityRating
                              ? 'text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        >
                          <Star className={`w-5 h-5 ${star <= qualityRating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tốc độ xử lý
                    </label>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSpeedRating(star)}
                          className={`transition-all ${
                            star <= speedRating
                              ? 'text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        >
                          <Star className={`w-5 h-5 ${star <= speedRating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Would Recommend */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bạn có giới thiệu cho bạn bè?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setWouldRecommend(true)}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                        wouldRecommend === true
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <ThumbsUp className={`w-5 h-5 ${wouldRecommend === true ? 'fill-current' : ''}`} />
                      Có, chắc chắn!
                    </button>
                    <button
                      type="button"
                      onClick={() => setWouldRecommend(false)}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                        wouldRecommend === false
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <ThumbsDown className={`w-5 h-5 ${wouldRecommend === false ? 'fill-current' : ''}`} />
                      Chưa chắc
                    </button>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Góp ý thêm (tùy chọn)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn, điều bạn thích hoặc cần cải thiện..."
                    rows={3}
                    maxLength={1000}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                  />
                  <div className="text-xs text-gray-400 text-right mt-1">
                    {comment.length}/1000
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={rating === 0 || submitting}
                  className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 ${
                    rating === 0 || submitting
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {existingFeedback ? 'Cập Nhật Đánh Giá' : 'Gửi Đánh Giá'}
                    </>
                  )}
                </button>

                {/* Skip Link */}
                <button
                  onClick={onClose}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                >
                  Bỏ qua lần này
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
