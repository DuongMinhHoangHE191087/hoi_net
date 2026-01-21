// ✅ React Query Hooks for User Requests
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { supabase, db, SystemPrompt } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface UserRequest {
  id: string
  type: 'restore' | 'family'
  description: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  original_images: string[]
  restored_images: string[] | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

// ✅ Fetch user requests with automatic caching
export function useUserRequests(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-requests', userId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('user_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as UserRequest[]
    },
    enabled: !!userId, // Only run query if userId exists
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  })
}

// ✅ Fetch system prompts
export function useSystemPrompts() {
  return useQuery({
    queryKey: ['system-prompts'],
    queryFn: async () => {
      const prompts = await db.getSystemPrompts()
      return prompts
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (prompts rarely change)
  })
}

// ✅ Delete request mutation with optimistic update
export function useDeleteRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('user_requests')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
      return id
    },
    // ✅ Optimistic update - instant UI feedback
    onMutate: async ({ id, userId }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['user-requests', userId] })

      // Get current data
      const previousRequests = queryClient.getQueryData<UserRequest[]>(['user-requests', userId])

      // Optimistically update (remove from list immediately)
      if (previousRequests) {
        queryClient.setQueryData<UserRequest[]>(
          ['user-requests', userId],
          previousRequests.filter((req) => req.id !== id)
        )
      }

      // Return context for rollback
      return { previousRequests }
    },
    // ✅ Rollback on error
    onError: (error, { userId }, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(['user-requests', userId], context.previousRequests)
      }
      toast.error('Không thể xóa yêu cầu. Vui lòng thử lại.')
    },
    // ✅ Success feedback
    onSuccess: () => {
      toast.success('Đã xóa yêu cầu thành công')
    },
    // ✅ Always refetch after mutation settles
    onSettled: (data, error, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-requests', userId] })
    },
  })
}

// ✅ Send to admin mutation
export function useSendToAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('user_requests')
        .update({
          status: 'processing',
          admin_notes: `Được gửi đến admin lúc ${new Date().toLocaleString('vi-VN')}. Đang chờ xử lý thủ công.`
        })
        .eq('id', id)

      if (error) throw error
      return id
    },
    // ✅ Optimistic update
    onMutate: async ({ id, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['user-requests', userId] })

      const previousRequests = queryClient.getQueryData<UserRequest[]>(['user-requests', userId])

      if (previousRequests) {
        queryClient.setQueryData<UserRequest[]>(
          ['user-requests', userId],
          previousRequests.map((req) =>
            req.id === id
              ? {
                  ...req,
                  status: 'processing' as const,
                  admin_notes: `Được gửi đến admin lúc ${new Date().toLocaleString('vi-VN')}. Đang chờ xử lý thủ công.`
                }
              : req
          )
        )
      }

      return { previousRequests }
    },
    onError: (error, { userId }, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(['user-requests', userId], context.previousRequests)
      }
      toast.error('Không thể gửi cho Admin. Vui lòng thử lại sau.')
    },
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu cho Admin! Bạn sẽ nhận được thông báo khi hoàn thành.')
    },
    onSettled: (data, error, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-requests', userId] })
    },
  })
}

// ✅ AI Processing mutation with quota handling
export function useProcessWithAI() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      requestId,
      imageUrls,
      systemPromptName,
      customPrompt,
      advancedOptions,
    }: {
      requestId: string
      imageUrls: string[]
      systemPromptName: string
      customPrompt?: string
      advancedOptions?: any
    }) => {
      // Call AI processing API
      const response = await fetch('/api/process-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for auth
        body: JSON.stringify({
          request_id: requestId,
          images: imageUrls,
          prompt: customPrompt || systemPromptName,
          type: systemPromptName || 'restore',
          advanced_options: advancedOptions,
        }),
      })

      const result = await response.json()

      // Handle quota exceeded error
      if (response.status === 429) {
        throw new Error(result.message || 'Bạn đã sử dụng hết lượt trong tháng này')
      }

      // Handle auth error
      if (response.status === 401) {
        throw new Error('Vui lòng đăng nhập lại để tiếp tục')
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process images')
      }

      return result
    },
    onSuccess: (data, { requestId }) => {
      // Show quota info if available
      if (data.quota) {
        toast.success(`Xử lý AI hoàn tất! Còn ${data.quota.remaining}/${data.quota.monthlyLimit} lượt`)
      } else {
        toast.success('Xử lý AI hoàn tất!')
      }
      // Invalidate to refetch updated request
      queryClient.invalidateQueries({ queryKey: ['user-requests'] })
      queryClient.invalidateQueries({ queryKey: ['user-quota'] })
    },
    onError: (error: Error) => {
      if (error.message.includes('lượt') || error.message.includes('quota')) {
        toast.error(error.message, { duration: 5000 })
      } else {
        toast.error(error.message || 'Lỗi khi xử lý AI')
      }
    },
  })
}

// ✅ Hook to fetch user quota
export function useUserQuota(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-quota', userId],
    queryFn: async () => {
      const response = await fetch('/api/process-images', {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) return null

      const data = await response.json()
      return data.quota || null
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // Cache for 1 minute
    refetchOnWindowFocus: true,
  })
}

// ✅ Infinite scroll hook for requests with pagination
export function useInfiniteUserRequests(userId: string | undefined, pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: ['user-requests-infinite', userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) return { requests: [], nextCursor: null }

      const from = pageParam
      const to = from + pageSize - 1

      const { data, error, count } = await supabase
        .from('user_requests')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      const nextCursor = data && data.length === pageSize ? to + 1 : null

      return {
        requests: data as UserRequest[],
        nextCursor,
        totalCount: count
      }
    },
    enabled: !!userId,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30 * 1000,
  })
}
