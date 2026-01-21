# 🚀 GỢI Ý NÂNG CẤP TOÀN DIỆN HỆ THỐNG - BE & FE

## 📋 Mục Lục
1. [Backend Improvements](#backend-improvements)
2. [Frontend Improvements](#frontend-improvements)
3. [Infrastructure & DevOps](#infrastructure--devops)
4. [Security Enhancements](#security-enhancements)
5. [Performance Optimization](#performance-optimization)
6. [User Experience](#user-experience)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Roadmap Implementation](#roadmap-implementation)

---

## 🔧 BACKEND IMPROVEMENTS

### 1. API Architecture

#### RESTful API Standards
```typescript
// Current: Basic endpoints
GET /api/requests
POST /api/requests

// Suggested: Versioned, standardized REST API
GET    /api/v1/requests          // List with pagination
GET    /api/v1/requests/:id      // Get single
POST   /api/v1/requests          // Create
PUT    /api/v1/requests/:id      // Update
PATCH  /api/v1/requests/:id      // Partial update
DELETE /api/v1/requests/:id      // Delete

// Response format standardization
{
  "success": true,
  "data": {...},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  },
  "timestamp": "2026-01-16T10:00:00Z"
}

// Error format
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  },
  "timestamp": "2026-01-16T10:00:00Z"
}
```

#### GraphQL Implementation
```typescript
// For complex queries, implement GraphQL
// File: /pages/api/graphql.ts

import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'

const typeDefs = `
  type Request {
    id: ID!
    user: User!
    type: RequestType!
    status: Status!
    originalImages: [Image!]!
    restoredImages: [Image!]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    requests(
      filter: RequestFilter
      pagination: Pagination
      sort: Sort
    ): RequestConnection!

    request(id: ID!): Request
  }

  type Mutation {
    createRequest(input: CreateRequestInput!): Request!
    updateRequest(id: ID!, input: UpdateRequestInput!): Request!
    processWithAI(id: ID!, options: AIOptions!): ProcessingJob!
  }

  type Subscription {
    requestStatusChanged(id: ID!): Request!
    processingProgress(id: ID!): ProgressUpdate!
  }
`

const resolvers = {
  Query: {
    requests: async (_, { filter, pagination, sort }, context) => {
      // Implement with DataLoader for N+1 query optimization
      return context.dataSources.requestsAPI.getRequests(filter, pagination, sort)
    }
  },
  Subscription: {
    requestStatusChanged: {
      subscribe: (_, { id }, context) => {
        return context.pubsub.asyncIterator([`REQUEST_${id}`])
      }
    }
  }
}
```

### 2. Database Optimization

#### Indexing Strategy
```sql
-- Create strategic indexes for common queries
CREATE INDEX idx_user_requests_user_id_status ON user_requests(user_id, status);
CREATE INDEX idx_user_requests_created_at_desc ON user_requests(created_at DESC);
CREATE INDEX idx_user_requests_status_updated ON user_requests(status, updated_at);

-- Full-text search for descriptions
CREATE INDEX idx_user_requests_description_fts ON user_requests
USING GIN (to_tsvector('english', description));

-- Composite indexes for filtering
CREATE INDEX idx_user_requests_composite ON user_requests(user_id, status, created_at DESC);
```

#### Database Migrations System
```typescript
// File: /db/migrations/20260116_add_request_tags.ts
export async function up(db: Kysely<Database>) {
  await db.schema
    .createTable('request_tags')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('request_id', 'uuid', (col) => col.references('user_requests.id').onDelete('cascade').notNull())
    .addColumn('tag', 'varchar(50)', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema
    .createIndex('idx_request_tags_request_id')
    .on('request_tags')
    .column('request_id')
    .execute()
}

export async function down(db: Kysely<Database>) {
  await db.schema.dropTable('request_tags').execute()
}
```

#### Query Optimization
```typescript
// Use Supabase RPC for complex queries
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'processing', COUNT(*) FILTER (WHERE status = 'processing'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
    'recent_requests', (
      SELECT json_agg(row_to_json(r))
      FROM (
        SELECT id, type, status, created_at
        FROM user_requests
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 5
      ) r
    )
  ) INTO result
  FROM user_requests
  WHERE user_id = p_user_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

// Usage in TypeScript
const { data } = await supabase.rpc('get_user_dashboard_stats', {
  p_user_id: user.id
})
```

### 3. Background Jobs & Queue System

#### Implement BullMQ for Job Processing
```typescript
// File: /lib/queue/processImageQueue.ts
import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis(process.env.REDIS_URL!)

// Create queue
export const imageProcessingQueue = new Queue('image-processing', {
  connection,
  defaultJobOptions:{
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 500
  }
})

// Create worker
const worker = new Worker(
  'image-processing',
  async (job) => {
    const { requestId, images, options } = job.data

    // Update progress
    await job.updateProgress(10)

    // Process with AI
    const results = await processImagesWithAI(images, options)

    await job.updateProgress(80)

    // Save to database
    await supabase
      .from('user_requests')
      .update({
        restored_images: results,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', requestId)

    await job.updateProgress(100)

    return { success: true, results }
  },
  {
    connection,
    concurrency: 5
  }
)

// Job events
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
  // Send notification to user
  sendNotification(job.data.userId, 'processing_complete', job.returnvalue)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
  // Notify admin
  notifyAdmin('job_failed', { jobId: job?.id, error: err })
})

worker.on('progress', (job, progress) => {
  // Send real-time progress to frontend via WebSocket
  broadcastProgress(job.data.requestId, progress)
})
```

#### Usage in API
```typescript
// File: /pages/api/v1/requests/process.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { requestId, options } = req.body

  // Add job to queue
  const job = await imageProcessingQueue.add('process-request', {
    requestId,
    userId: req.user.id,
    images: request.original_images,
    options
  }, {
    jobId: `process-${requestId}`,
    priority: options.isPremium ? 1 : 10
  })

  res.status(202).json({
    success: true,
    data: {
      jobId: job.id,
      status: 'queued',
      estimatedTime: calculateEstimatedTime(images.length)
    }
  })
}
```

### 4. Caching Strategy

#### Redis Caching
```typescript
// File: /lib/cache/redis.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  }

  static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value))
  }

  static async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  static async remember<T>(
    key: string,
    ttl: number,
    callback: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached) return cached

    const fresh = await callback()
    await this.set(key, fresh, ttl)
    return fresh
  }
}

// Usage
const userRequests = await CacheService.remember(
  `user:${userId}:requests`,
  300, // 5 minutes
  async () => {
    const { data } = await supabase
      .from('user_requests')
      .select('*')
      .eq('user_id', userId)
    return data
  }
)
```

### 5. Real-time Updates

#### Supabase Realtime + WebSockets
```typescript
// File: /lib/realtime/subscriptions.ts
import { supabase } from '@/lib/supabase'

export function subscribeToRequestUpdates(
  requestId: string,
  onUpdate: (payload: any) => void
) {
  const channel = supabase
    .channel(`request:${requestId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_requests',
        filter: `id=eq.${requestId}`
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}

// Frontend usage
useEffect(() => {
  if (!selectedRequest) return

  const unsubscribe = subscribeToRequestUpdates(
    selectedRequest.id,
    (updatedRequest) => {
      setSelectedRequest(updatedRequest)
      toast.success('Request updated!')
    }
  )

  return unsubscribe
}, [selectedRequest?.id])
```

#### Socket.IO for Custom Events
```typescript
// File: /lib/socket/server.ts
import { Server } from 'socket.io'

export function initializeSocketServer(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      credentials: true
    }
  })

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    // Verify JWT token
    const user = await verifyToken(token)
    if (user) {
      socket.data.user = user
      next()
    } else {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.data.user.id

    // Join user-specific room
    socket.join(`user:${userId}`)

    // Listen for processing start
    socket.on('start-processing', async (data) => {
      const job = await imageProcessingQueue.add('process', data)
      socket.emit('processing-started', { jobId: job.id })
    })

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`)
    })
  })

  return io
}

// Emit progress from worker
export function emitProgress(userId: string, requestId: string, progress: number) {
  io.to(`user:${userId}`).emit('processing-progress', {
    requestId,
    progress
  })
}
```

### 6. File Upload Optimization

#### Direct Upload to Cloudinary
```typescript
// File: /pages/api/v1/upload/presign.ts
import { v2 as cloudinary } from 'cloudinary'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename, fileType } = req.body

  // Generate signed upload URL
  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: `users/${req.user.id}`,
      upload_preset: 'photo_restore'
    },
    process.env.CLOUDINARY_API_SECRET!
  )

  res.json({
    success: true,
    data: {
      url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      timestamp,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
      folder: `users/${req.user.id}`
    }
  })
}

// Frontend: Direct upload
const uploadDirectly = async (file: File) => {
  // 1. Get presigned URL
  const { data } = await fetch('/api/v1/upload/presign').then(r => r.json())

  // 2. Upload directly to Cloudinary
  const formData = new FormData()
  formData.append('file', file)
  formData.append('timestamp', data.timestamp)
  formData.append('signature', data.signature)
  formData.append('api_key', data.api_key)
  formData.append('folder', data.folder)

  const uploadResponse = await fetch(data.url, {
    method: 'POST',
    body: formData
  })

  return uploadResponse.json()
}
```

#### Chunked Upload for Large Files
```typescript
// File: /lib/upload/chunked.ts
export class ChunkedUploader {
  private chunkSize = 1024 * 1024 * 5 // 5MB chunks

  async upload(file: File, onProgress?: (progress: number) => void) {
    const chunks = Math.ceil(file.size / this.chunkSize)
    const uploadId = await this.initiateUpload(file.name, file.size)

    for (let i = 0; i < chunks; i++) {
      const start = i * this.chunkSize
      const end = Math.min(start + this.chunkSize, file.size)
      const chunk = file.slice(start, end)

      await this.uploadChunk(uploadId, i, chunk)

      const progress = Math.round(((i + 1) / chunks) * 100)
      onProgress?.(progress)
    }

    return this.completeUpload(uploadId)
  }

  private async initiateUpload(filename: string, size: number) {
    const { data } = await fetch('/api/v1/upload/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, size })
    }).then(r => r.json())

    return data.uploadId
  }

  private async uploadChunk(uploadId: string, chunkIndex: number, chunk: Blob) {
    const formData = new FormData()
    formData.append('uploadId', uploadId)
    formData.append('chunkIndex', chunkIndex.toString())
    formData.append('chunk', chunk)

    await fetch('/api/v1/upload/chunk', {
      method: 'POST',
      body: formData
    })
  }

  private async completeUpload(uploadId: string) {
    const { data } = await fetch('/api/v1/upload/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId })
    }).then(r => r.json())

    return data.url
  }
}
```

### 7. AI Processing Improvements

#### Implement AI Service Layer
```typescript
// File: /lib/ai/service.ts
import Replicate from 'replicate'

export class AIService {
  private replicate: Replicate

  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!
    })
  }

  async restoreImage(imageUrl: string, options: RestoreOptions) {
    const output = await this.replicate.run(
      "tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
      {
        input: {
          img: imageUrl,
          version: "v1.4",
          scale: options.upscale || 2
        }
      }
    )

    return output
  }

  async enhanceWithCustomPrompt(imageUrl: string, prompt: string) {
    const output = await this.replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          image: imageUrl,
          prompt: prompt,
          negative_prompt: "blurry, low quality",
          num_inference_steps: 50
        }
      }
    )

    return output
  }

  async batchProcess(images: string[], options: RestoreOptions) {
    // Process images in parallel with concurrency control
    const concurrency = 3
    const results = []

    for (let i = 0; i < images.length; i += concurrency) {
      const batch = images.slice(i, i + concurrency)
      const batchResults = await Promise.all(
        batch.map(img => this.restoreImage(img, options))
      )
      results.push(...batchResults)
    }

    return results
  }
}
```

### 8. Logging & Debugging

#### Structured Logging with Pino
```typescript
// File: /lib/logger/index.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname'
    }
  },
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GIT_COMMIT_SHA
  }
})

// Usage
logger.info({ userId, requestId }, 'Processing request')
logger.error({ err, requestId }, 'Processing failed')
logger.warn({ userId, attempts: 3 }, 'Rate limit approaching')

// Create child loggers
const requestLogger = logger.child({ requestId: '123' })
requestLogger.info('Started processing')
requestLogger.info({ progress: 50 }, 'Halfway done')
requestLogger.info('Completed')
```

#### Error Tracking with Sentry
```typescript
// File: /lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request?.data) {
      delete event.request.data.password
      delete event.request.data.token
    }
    return event
  }
})

// Usage
try {
  await processImage(imageUrl)
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'image-processing',
      userId: user.id
    },
    extra: {
      imageUrl,
      options
    }
  })
  throw error
}
```

---

## 💻 FRONTEND IMPROVEMENTS

### 1. State Management

#### Zustand for Global State
```typescript
// File: /store/requests.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface RequestsStore {
  requests: UserRequest[]
  selectedRequest: UserRequest | null
  filters: RequestFilters
  isLoading: boolean

  // Actions
  setRequests: (requests: UserRequest[]) => void
  addRequest: (request: UserRequest) => void
  updateRequest: (id: string, updates: Partial<UserRequest>) => void
  selectRequest: (request: UserRequest | null) => void
  setFilters: (filters: Partial<RequestFilters>) => void

  // Async actions
  fetchRequests: () => Promise<void>
  deleteRequest: (id: string) => Promise<void>
}

export const useRequestsStore = create<RequestsStore>()(
  devtools(
    persist(
      (set, get) => ({
        requests: [],
        selectedRequest: null,
        filters: { status: 'all', type: 'all' },
        isLoading: false,

        setRequests: (requests) => set({ requests }),

        addRequest: (request) => set((state) => ({
          requests: [request, ...state.requests]
        })),

        updateRequest: (id, updates) => set((state) => ({
          requests: state.requests.map(r =>
            r.id === id ? { ...r, ...updates } : r
          ),
          selectedRequest: state.selectedRequest?.id === id
            ? { ...state.selectedRequest, ...updates }
            : state.selectedRequest
        })),

        selectRequest: (request) => set({ selectedRequest: request }),

        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        })),

        fetchRequests: async () => {
          set({ isLoading: true })
          try {
            const { data } = await supabase
              .from('user_requests')
              .select('*')
              .order('created_at', { ascending: false })
            set({ requests: data || [], isLoading: false })
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        deleteRequest: async (id) => {
          await supabase.from('user_requests').delete().eq('id', id)
          set((state) => ({
            requests: state.requests.filter(r => r.id !== id),
            selectedRequest: state.selectedRequest?.id === id ? null : state.selectedRequest
          }))
        }
      }),
      {
        name: 'requests-storage',
        partialize: (state) => ({
          filters: state.filters
        })
      }
    )
  )
)
```

### 2. React Query for Server State
```typescript
// File: /hooks/useRequests.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useRequests() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_requests')
        .select('*')
        .order('created_at', { ascending: false })
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000 // Refetch every 30s
  })

  const createRequest = useMutation({
    mutationFn: async (newRequest: CreateRequestInput) => {
      const { data } = await supabase
        .from('user_requests')
        .insert(newRequest)
        .select()
        .single()
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      toast.success('Request created!')
    },
    onError: (error) => {
      toast.error('Failed to create request')
      Sentry.captureException(error)
    }
  })

  const updateRequest = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<UserRequest> }) => {
      const { data } = await supabase
        .from('user_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return data
    },
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['requests'] })
      const previous = queryClient.getQueryData(['requests'])

      queryClient.setQueryData(['requests'], (old: any) =>
        old.map((r: any) => r.id === id ? { ...r, ...updates } : r)
      )

      return { previous }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['requests'], context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    }
  })

  return {
    requests: data || [],
    isLoading,
    error,
    createRequest: createRequest.mutate,
    updateRequest: updateRequest.mutate,
    isCreating: createRequest.isPending,
    isUpdating: updateRequest.isPending
  }
}
```

### 3. Form Validation with Zod + React Hook Form
```typescript
// File: /components/forms/CreateRequestForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const requestSchema = z.object({
  type: z.enum(['restore', 'family']),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  images: z.array(z.instanceof(File))
    .min(1, 'At least one image is required')
    .max(5, 'Maximum 5 images allowed')
    .refine(
      files => files.every(f => f.size <= 10 * 1024 * 1024),
      'Each file must be less than 10MB'
    )
    .refine(
      files => files.every(f => f.type.startsWith('image/')),
      'Only image files are allowed'
    ),
  options: z.object({
    upscale: z.number().min(1).max(4).default(2),
    denoise: z.boolean().default(true),
    enhanceFaces: z.boolean().default(true)
  }).optional()
})

type RequestFormData = z.infer<typeof requestSchema>

export function CreateRequestForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      type: 'restore',
      options: {
        upscale: 2,
        denoise: true,
        enhanceFaces: true
      }
    }
  })

  const onSubmit = async (data: RequestFormData) => {
    // Upload images
    const uploadedUrls = await uploadImages(data.images)

    // Create request
    await createRequest({
      ...data,
      original_images: uploadedUrls
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <select {...register('type')}>
        <option value="restore">Restore Old Photo</option>
        <option value="family">Family Photo</option>
      </select>
      {errors.type && <span>{errors.type.message}</span>}

      <textarea {...register('description')} />
      {errors.description && <span>{errors.description.message}</span>}

      <input type="file" multiple accept="image/*" {...register('images')} />
      {errors.images && <span>{errors.images.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Request'}
      </button>
    </form>
  )
}
```

### 4. Virtual Scrolling for Large Lists
```typescript
// File: /components/VirtualRequestList.tsx
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

export function VirtualRequestList({ requests }: { requests: UserRequest[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: requests.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated item height
    overscan: 5 // Render 5 extra items above/below viewport
  })

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const request = requests[virtualItem.index]

          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <RequestCard request={request} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### 5. Image Optimization
```typescript
// File: /components/OptimizedImage.tsx
import Image from 'next/image'
import { useState } from 'react'

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="0%" />
      <stop stop-color="#edeef1" offset="20%" />
      <stop stop-color="#f6f7f8" offset="40%" />
      <stop stop-color="#f6f7f8" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
}

export function OptimizedImage({ src, alt, width, height, priority }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`}
        onLoadingComplete={() => setIsLoading(false)}
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
        `}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}
```

### 6. Progressive Web App (PWA)
```typescript
// File: next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  // ... other config
})

// File: /public/manifest.json
{
  "name": "Photo Restore - AI Photo Restoration",
  "short_name": "PhotoRestore",
  "description": "Restore old photos with AI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#F59E0B",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 7. Offline Support with Service Worker
```typescript
// File: /public/sw.js
const CACHE_NAME = 'photo-restore-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/offline',
  '/styles/globals.css',
  '/styles/theme.css'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response
        }

        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          const responseToCache = response.clone()

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache)
            })

          return response
        }).catch(() => {
          // If both network and cache fail, show offline page
          return caches.match('/offline')
        })
      })
  )
})
```

### 8. Code Splitting & Lazy Loading
```typescript
// File: /pages/requests/index.tsx
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy load heavy components
const RequestDetailModal = dynamic(
  () => import('@/components/RequestDetailModal'),
  {
    loading: () => <ModalSkeleton />,
    ssr: false
  }
)

const AIConfirmDialog = dynamic(
  () => import('@/components/ui/AIConfirmDialog'),
  { ssr: false }
)

const ImageGallery = dynamic(
  () => import('@/components/ImageGallery'),
  {
    loading: () => <GallerySkeleton />,
    ssr: false
  }
)

export default function RequestsPage() {
  return (
    <div>
      <RequestsList />

      <Suspense fallback={<ModalSkeleton />}>
        {showModal && <RequestDetailModal />}
      </Suspense>

      <Suspense fallback={null}>
        {showDialog && <AIConfirmDialog />}
      </Suspense>
    </div>
  )
}
```

---

## 🔒 SECURITY ENHANCEMENTS

### 1. Rate Limiting
```typescript
// File: /lib/security/rateLimiter.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export class RateLimiter {
  static async check(
    identifier: string,
    limit: number = 10,
    window: number = 60
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const key = `ratelimit:${identifier}`
    const now = Date.now()
    const windowMs = window * 1000

    // Get current count
    const count = await redis.get(key) as number | null
    const currentCount = count || 0

    if (currentCount >= limit) {
      const ttl = await redis.ttl(key)
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(now + (ttl * 1000))
      }
    }

    // Increment counter
    await redis.incr(key)
    if (!count) {
      await redis.expire(key, window)
    }

    return {
      allowed: true,
      remaining: limit - currentCount - 1,
      resetAt: new Date(now + windowMs)
    }
  }
}

// Middleware
export async function rateLimitMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const identifier = req.user?.id || req.headers['x-forwarded-for'] as string || 'anonymous'

  const { allowed, remaining, resetAt } = await RateLimiter.check(identifier, 100, 60)

  res.setHeader('X-RateLimit-Limit', '100')
  res.setHeader('X-RateLimit-Remaining', remaining.toString())
  res.setHeader('X-RateLimit-Reset', resetAt.getTime().toString())

  if (!allowed) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        resetAt: resetAt.toISOString()
      }
    })
  }

  next()
}
```

### 2. CSRF Protection
```typescript
// File: /lib/security/csrf.ts
import { randomBytes, createHmac } from 'crypto'

const CSRF_SECRET = process.env.CSRF_SECRET!

export function generateCSRFToken(sessionId: string): string {
  const timestamp = Date.now()
  const random = randomBytes(16).toString('hex')
  const payload = `${sessionId}:${timestamp}:${random}`

  const signature = createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex')

  return Buffer.from(`${payload}:${signature}`).toString('base64')
}

export function verifyCSRFToken(token: string, sessionId: string, maxAge: number = 3600000): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [session, timestamp, random, signature] = decoded.split(':')

    // Verify session matches
    if (session !== sessionId) return false

    // Verify not expired
    const age = Date.now() - parseInt(timestamp)
    if (age > maxAge) return false

    // Verify signature
    const payload = `${session}:${timestamp}:${random}`
    const expectedSignature = createHmac('sha256', CSRF_SECRET)
      .update(payload)
      .digest('hex')

    return signature === expectedSignature
  } catch {
    return false
  }
}

// Middleware
export function csrfMiddleware(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method!)) {
    const token = req.headers['x-csrf-token'] as string
    const sessionId = req.session?.id

    if (!token || !sessionId || !verifyCSRFToken(token, sessionId)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_TOKEN_INVALID',
          message: 'Invalid or missing CSRF token'
        }
      })
    }
  }

  next()
}
```

### 3. Content Security Policy
```typescript
// File: /middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data: https://res.cloudinary.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim())

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.headers.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim())
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}
```

---

*Document này chỉ là phần 1. Tiếp theo sẽ có các phần:*
- *Infrastructure & DevOps*
- *Performance Optimization*
- *Monitoring & Analytics*
- *Roadmap Implementation*

**Bạn muốn tôi tiếp tục với phần nào?**
