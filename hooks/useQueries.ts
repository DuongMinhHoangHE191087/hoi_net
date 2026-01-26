import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Define UserRequest type inline to avoid missing dependency
interface UserRequest {
  id: string
  user_id: string
  type: string
  description: string
  status: string
  created_at: string
  updated_at: string
}

// Query Keys
export const queryKeys = {
  requests: {
    all: ['requests'] as const,
    list: (filters?: { status?: string; userId?: string }) =>
      ['requests', 'list', filters] as const,
    detail: (id: string) => ['requests', 'detail', id] as const,
  },
  stats: {
    all: ['stats'] as const,
    dashboard: (userId: string) => ['stats', 'dashboard', userId] as const,
  },
  admin: {
    all: ['admin'] as const,
    requests: (filters?: { status?: string }) =>
      ['admin', 'requests', filters] as const,
  },
}

// ============ User Requests ============

export function useUserRequests(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.requests.list({ userId }),
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
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 phút - giảm refetch không cần thiết
    gcTime: 5 * 60 * 1000,    // 5 phút - cache lifetime
  })
}

export function useRequestDetail(requestId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.requests.detail(requestId || ''),
    queryFn: async () => {
      if (!requestId) return null

      const { data, error } = await supabase
        .from('user_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (error) throw error
      return data as UserRequest
    },
    enabled: !!requestId,
    staleTime: 1 * 60 * 1000, // 1 phút
    gcTime: 3 * 60 * 1000,    // 3 phút
  })
}

// ============ Dashboard Stats ============

export function useDashboardStats(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.stats.dashboard(userId || ''),
    queryFn: async () => {
      if (!userId) return null

      // Tối ưu: Dùng database aggregation thay vì load toàn bộ data
      // Count total
      const { count: total } = await supabase
        .from('user_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Count by status - chạy song song
      const [
        { count: completed },
        { count: processing },
        { count: pending }
      ] = await Promise.all([
        supabase
          .from('user_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'completed'),
        supabase
          .from('user_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'processing'),
        supabase
          .from('user_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'pending')
      ])

      return {
        total: total || 0,
        completed: completed || 0,
        processing: processing || 0,
        pending: pending || 0,
        successRate: (total || 0) > 0 ? Math.round(((completed || 0) / (total || 0)) * 100) : 0,
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 5 * 60 * 1000,    // 5 phút
  })
}

// ============ Admin Queries ============

export function useAdminRequests(filters?: { status?: string }) {
  return useQuery({
    queryKey: queryKeys.admin.requests(filters),
    queryFn: async () => {
      let query = supabase
        .from('user_requests')
        .select('*, users:user_id(email, full_name)')
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 5 * 60 * 1000,    // 5 phút
  })
}

// ============ Mutations ============

export function useCreateRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newRequest: Omit<UserRequest, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('user_requests')
        .insert(newRequest)
        .select()
        .single()

      if (error) throw error
      return data as UserRequest
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard(data.user_id) })
    },
  })
}

export function useUpdateRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UserRequest> }) => {
      const { data, error } = await supabase
        .from('user_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as UserRequest
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
    },
  })
}

export function useDeleteRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_requests')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate all request-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
    },
  })
}

// ============ Optimistic Updates Example ============

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('user_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as UserRequest
    },
    // Optimistic update
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.requests.detail(id) })

      // Snapshot previous value
      const previousRequest = queryClient.getQueryData(queryKeys.requests.detail(id))

      // Optimistically update
      queryClient.setQueryData(queryKeys.requests.detail(id), (old: any) => ({
        ...old,
        status,
      }))

      return { previousRequest }
    },
    // Rollback on error
    onError: (err, { id }, context) => {
      if (context?.previousRequest) {
        queryClient.setQueryData(queryKeys.requests.detail(id), context.previousRequest)
      }
    },
    // Always refetch after error or success
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all })
    },
  })
}

