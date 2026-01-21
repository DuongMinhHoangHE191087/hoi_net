# 🚀 BACKEND UPGRADE COMPREHENSIVE GUIDE

## 📋 Table of Contents
1. [API Architecture](#1-api-architecture)
2. [Database Optimization](#2-database-optimization)
3. [Authentication & Security](#3-authentication--security)
4. [Background Processing](#4-background-processing)
5. [Caching Strategy](#5-caching-strategy)
6. [Real-time Features](#6-real-time-features)
7. [File Storage](#7-file-storage)
8. [Monitoring & Logging](#8-monitoring--logging)
9. [Performance](#9-performance)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. API Architecture

### Current State
```typescript
// app/api/requests/route.ts
export async function POST(req: Request) {
  const { data } = await req.json()
  // Direct Supabase call
  const result = await supabase.from('user_requests').insert(data)
  return Response.json(result)
}
```

### ✅ Recommended: API Layer Architecture

#### A. Create API Service Layer
```typescript
// lib/services/requestService.ts
import { supabase } from '@/lib/supabase'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'

export class RequestService {
  private static CACHE_TTL = 300 // 5 minutes

  static async createRequest(userId: string, data: CreateRequestDTO) {
    try {
      // Validate input
      const validated = await validateRequestData(data)

      // Check rate limit
      await this.checkRateLimit(userId)

      // Create in database
      const { data: request, error } = await supabase
        .from('user_requests')
        .insert({
          ...validated,
          user_id: userId,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Invalidate cache
      await redis.del(`user:${userId}:requests`)

      // Queue background job
      await this.queueImageProcessing(request.id)

      // Log action
      logger.info('Request created', { requestId: request.id, userId })

      return request
    } catch (error) {
      logger.error('Failed to create request', { error, userId })
      throw error
    }
  }

  static async getRequests(userId: string, filters?: RequestFilters) {
    const cacheKey = `user:${userId}:requests:${JSON.stringify(filters)}`

    // Try cache first
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    // Fetch from database
    let query = supabase
      .from('user_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) throw error

    // Cache result
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(data))

    return data
  }

  private static async checkRateLimit(userId: string) {
    const key = `ratelimit:create_request:${userId}`
    const count = await redis.incr(key)

    if (count === 1) {
      await redis.expire(key, 3600) // 1 hour
    }

    if (count > 10) { // Max 10 requests per hour
      throw new Error('Rate limit exceeded')
    }
  }

  private static async queueImageProcessing(requestId: string) {
    // Add to background queue (BullMQ)
    await queue.add('process-image', { requestId })
  }
}
```

#### B. API Route Implementation
```typescript
// app/api/v1/requests/route.ts
import { RequestService } from '@/lib/services/requestService'
import { auth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'

export async function POST(req: Request) {
  try {
    // Authenticate
    const user = await auth(req)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request
    const data = await req.json()

    // Call service layer
    const request = await RequestService.createRequest(user.id, data)

    return Response.json({
      success: true,
      data: request
    }, { status: 201 })

  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(req: Request) {
  try {
    const user = await auth(req)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const requests = await RequestService.getRequests(user.id, { status })

    return Response.json({
      success: true,
      data: requests
    })

  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## 2. Database Optimization

### ✅ A. Strategic Indexes

```sql
-- File: supabase/migrations/002_comprehensive_indexes.sql

-- Performance-critical indexes
CREATE INDEX CONCURRENTLY idx_user_requests_user_status_created
  ON user_requests(user_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_user_requests_status_priority
  ON user_requests(status, priority DESC, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_user_requests_processing
  ON user_requests(status, updated_at)
  WHERE status IN ('pending', 'processing');

-- Full-text search
CREATE INDEX idx_user_requests_search
  ON user_requests USING gin(to_tsvector('english',
    coalesce(title, '') || ' ' || coalesce(description, '')));

-- Partial index for active requests only
CREATE INDEX idx_user_requests_active
  ON user_requests(user_id, created_at DESC)
  WHERE status != 'completed' AND deleted_at IS NULL;
```

### ✅ B. Database Functions (RPC)

```sql
-- File: supabase/migrations/003_functions.sql

-- Get user statistics (single query instead of multiple)
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'processing', COUNT(*) FILTER (WHERE status = 'processing'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'failed', COUNT(*) FILTER (WHERE status = 'failed'),
    'success_rate', ROUND(
      (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL /
       NULLIF(COUNT(*), 0) * 100), 2
    )
  )
  INTO result
  FROM user_requests
  WHERE user_id = p_user_id
    AND deleted_at IS NULL;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Batch update status
CREATE OR REPLACE FUNCTION batch_update_status(
  p_request_ids UUID[],
  p_new_status TEXT
)
RETURNS INT AS $$
DECLARE
  updated_count INT;
BEGIN
  UPDATE user_requests
  SET status = p_new_status,
      updated_at = NOW()
  WHERE id = ANY(p_request_ids);

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;
```

### ✅ C. Connection Pooling

```typescript
// lib/db/pool.ts
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum 20 connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Prepared statements for frequently used queries
export const preparedStatements = {
  getUserRequests: {
    name: 'get-user-requests',
    text: `
      SELECT * FROM user_requests
      WHERE user_id = $1
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `
  },

  getRequestById: {
    name: 'get-request-by-id',
    text: `
      SELECT * FROM user_requests
      WHERE id = $1 AND deleted_at IS NULL
    `
  }
}

export async function query(text: string, params?: any[]) {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start

  // Log slow queries
  if (duration > 100) {
    console.warn('Slow query detected', { duration, text })
  }

  return res
}
```

---

## 3. Authentication & Security

### ✅ A. Enhanced Auth Middleware

```typescript
// lib/middleware/auth.ts
import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { redis } from '@/lib/redis'

export async function authMiddleware(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
      }
    }
  )

  // Get session
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    return null
  }

  // Check if session is blacklisted (logout)
  const isBlacklisted = await redis.get(`blacklist:session:${session.access_token}`)
  if (isBlacklisted) {
    return null
  }

  return session.user
}
```

### ✅ B. Rate Limiting

```typescript
// lib/middleware/rateLimit.ts
import { redis } from '@/lib/redis'

interface RateLimitConfig {
  window: number // seconds
  max: number    // max requests
}

export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number }> {
  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, config.window)
  }

  const ttl = await redis.ttl(key)
  const remaining = Math.max(0, config.max - current)

  if (current > config.max) {
    throw new Error(`Rate limit exceeded. Try again in ${ttl} seconds`)
  }

  return {
    success: true,
    remaining
  }
}

// Usage in API route
export async function POST(req: Request) {
  const userId = req.headers.get('x-user-id')

  await rateLimit(`api:create_request:${userId}`, {
    window: 3600, // 1 hour
    max: 10       // 10 requests
  })

  // ... rest of handler
}
```

### ✅ C. Input Validation (Zod)

```typescript
// lib/validators/request.ts
import { z } from 'zod'

export const CreateRequestSchema = z.object({
  type: z.enum(['photo_restore', 'photo_merge', 'remove_background']),
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    filename: z.string()
  })).min(1).max(10),
  priority: z.enum(['low', 'normal', 'high']).default('normal')
})

export type CreateRequestDTO = z.infer<typeof CreateRequestSchema>

// Usage
export async function POST(req: Request) {
  const body = await req.json()

  try {
    const validated = CreateRequestSchema.parse(body)
    // ... use validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
  }
}
```

---

## 4. Background Processing

### ✅ A. BullMQ Queue Setup

```typescript
// lib/queue/index.ts
import { Queue, Worker, QueueScheduler } from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
})

// Create queue
export const imageProcessingQueue = new Queue('image-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,    // Keep max 1000 jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
})

// Create scheduler (for delayed/repeated jobs)
new QueueScheduler('image-processing', { connection })
```

### ✅ B. Worker Implementation

```typescript
// workers/imageProcessor.ts
import { Worker, Job } from 'bullmq'
import { processImage } from '@/lib/ai/imageProcessing'
import { supabase } from '@/lib/supabase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'

const worker = new Worker(
  'image-processing',
  async (job: Job) => {
    const { requestId, imageUrl, type } = job.data

    logger.info('Processing image', { requestId, type })

    try {
      // Update status to processing
      await supabase
        .from('user_requests')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', requestId)

      // Progress reporting
      await job.updateProgress(10)

      // Download image
      const imageBuffer = await downloadImage(imageUrl)
      await job.updateProgress(25)

      // Process with AI
      const processed = await processImage(imageBuffer, type)
      await job.updateProgress(75)

      // Upload result
      const resultUrl = await uploadToCloudinary(processed)
      await job.updateProgress(90)

      // Update database
      await supabase
        .from('user_requests')
        .update({
          status: 'completed',
          result_url: resultUrl,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      await job.updateProgress(100)

      logger.info('Image processed successfully', { requestId })

      return { success: true, resultUrl }

    } catch (error) {
      logger.error('Image processing failed', { requestId, error })

      // Update to failed status
      await supabase
        .from('user_requests')
        .update({
          status: 'failed',
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      throw error
    }
  },
  {
    connection,
    concurrency: 5, // Process 5 jobs concurrently
    limiter: {
      max: 10,      // Max 10 jobs
      duration: 60000, // per minute
    },
  }
)

// Event listeners
worker.on('completed', (job) => {
  logger.info('Job completed', { jobId: job.id })
})

worker.on('failed', (job, error) => {
  logger.error('Job failed', { jobId: job?.id, error })
})

worker.on('progress', (job, progress) => {
  logger.debug('Job progress', { jobId: job.id, progress })
})
```

---

## 5. Caching Strategy

### ✅ A. Redis Setup with Upstash

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache wrapper
export async function cached<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = await redis.get<T>(key)
  if (cached) return cached

  // Execute function
  const result = await fn()

  // Store in cache
  await redis.setex(key, ttl, result)

  return result
}

// Example usage
export async function getUserRequests(userId: string) {
  return cached(
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
}
```

### ✅ B. Cache Invalidation

```typescript
// lib/cache/invalidation.ts
import { redis } from '@/lib/redis'

export class CacheInvalidator {
  static async invalidateUser(userId: string) {
    const keys = await redis.keys(`user:${userId}:*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  static async invalidateRequest(requestId: string) {
    // Invalidate request cache
    await redis.del(`request:${requestId}`)

    // Get request to find user
    const { data } = await supabase
      .from('user_requests')
      .select('user_id')
      .eq('id', requestId)
      .single()

    if (data) {
      await this.invalidateUser(data.user_id)
    }
  }

  static async invalidatePattern(pattern: string) {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}
```

---

**Continued in Part 2...**

File size limit reached. This is Part 1 of the comprehensive backend guide covering:
- API Architecture
- Database Optimization
- Authentication & Security
- Background Processing
- Caching Strategy

Would you like me to create Part 2 with the remaining sections?
