# 🚀 GỢI Ý NÂNG CẤP HỆ THỐNG - PHẦN 2

## 🏗️ INFRASTRUCTURE & DEVOPS

### 1. CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# File: .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  build:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next

  e2e-tests:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: [lint-and-test, build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [lint-and-test, build, e2e-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 2. Docker Setup

#### Multi-stage Dockerfile
```dockerfile
# File: Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Docker Compose for Local Development
```yaml
# File: docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=photo_restore
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    ports:
      - "5050:80"
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@photorestore.com
      - PGADMIN_DEFAULT_PASSWORD=admin

volumes:
  redis_data:
  postgres_data:
```

### 3. Monitoring & Observability

#### Prometheus + Grafana Setup
```yaml
# File: docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"

volumes:
  prometheus_data:
  grafana_data:
```

#### Custom Metrics
```typescript
// File: /lib/metrics/index.ts
import client from 'prom-client'

// Create a Registry
const register = new client.Registry()

// Add default metrics
client.collectDefaultMetrics({ register })

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
})

export const imageProcessingDuration = new client.Histogram({
  name: 'image_processing_duration_seconds',
  help: 'Duration of image processing in seconds',
  labelNames: ['type', 'status'],
  buckets: [1, 5, 10, 30, 60, 120]
})

export const activeUsers = new client.Gauge({
  name: 'active_users_total',
  help: 'Number of active users'
})

export const requestsTotal = new client.Counter({
  name: 'requests_total',
  help: 'Total number of requests',
  labelNames: ['type', 'status']
})

register.registerMetric(httpRequestDuration)
register.registerMetric(imageProcessingDuration)
register.registerMetric(activeUsers)
register.registerMetric(requestsTotal)

// Metrics endpoint
export async function GET() {
  return new Response(await register.metrics(), {
    headers: {
      'Content-Type': register.contentType
    }
  })
}
```

### 4. Database Backup & Recovery

#### Automated Backup Script
```bash
#!/bin/bash
# File: scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DATABASE="photo_restore"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U postgres -h localhost -F c -b -v -f "${BACKUP_DIR}/${DATABASE}_${DATE}.backup" $DATABASE

# Compress backup
gzip "${BACKUP_DIR}/${DATABASE}_${DATE}.backup"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/${DATABASE}_${DATE}.backup.gz" "s3://photo-restore-backups/postgres/${DATE}.backup.gz"

# Remove old backups
find $BACKUP_DIR -name "*.backup.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: ${DATABASE}_${DATE}.backup.gz"
```

#### Restore Script
```bash
#!/bin/bash
# File: scripts/restore-db.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore-db.sh <backup_file>"
  exit 1
fi

# Download from S3 if needed
if [[ $BACKUP_FILE == s3://* ]]; then
  aws s3 cp $BACKUP_FILE /tmp/backup.gz
  BACKUP_FILE=/tmp/backup.gz
fi

# Decompress
gunzip -k $BACKUP_FILE

# Restore
pg_restore -U postgres -h localhost -d photo_restore -c -v "${BACKUP_FILE%.gz}"

echo "Restore completed"
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### 1. Database Query Optimization

#### Connection Pooling
```typescript
// File: /lib/db/pool.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create connection pool
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-connection-pool': 'true'
    }
  }
})

// For edge functions
export const supabaseEdge = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    fetch: fetch.bind(globalThis) // Use native fetch in Edge
  }
})
```

#### Prepared Statements
```sql
-- Create prepared statements for common queries
PREPARE get_user_requests (uuid) AS
  SELECT *
  FROM user_requests
  WHERE user_id = $1
  ORDER BY created_at DESC
  LIMIT 20;

PREPARE get_request_with_profile (uuid) AS
  SELECT
    r.*,
    json_build_object(
      'id', u.id,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url
    ) as user_profile
  FROM user_requests r
  JOIN auth.users u ON r.user_id = u.id
  LEFT JOIN user_profiles p ON u.id = p.id
  WHERE r.id = $1;
```

### 2. Image Optimization Pipeline

#### Cloudinary Transformations
```typescript
// File: /lib/images/optimize.ts
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: 'auto' | number
    format?: 'auto' | 'webp' | 'avif'
    crop?: 'fill' | 'fit' | 'scale'
  } = {}
) {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options

  const transformations = [
    quality && `q_${quality}`,
    format && `f_${format}`,
    width && `w_${width}`,
    height && `h_${height}`,
    crop && `c_${crop}`,
    'dpr_auto' // Auto device pixel ratio
  ].filter(Boolean).join(',')

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`
}

// Generate responsive srcset
export function generateSrcSet(publicId: string, sizes: number[]) {
  return sizes
    .map(size => `${getOptimizedImageUrl(publicId, { width: size })} ${size}w`)
    .join(', ')
}

// Usage
<img
  src={getOptimizedImageUrl(image.publicId, { width: 800 })}
  srcSet={generateSrcSet(image.publicId, [400, 800, 1200, 1600])}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt={image.alt}
/>
```

### 3. Bundle Optimization

#### Webpack Bundle Analyzer
```javascript
// File: next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
  // Optimize images
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30 // 30 days
  },

  // Enable SWC minification
  swcMinify: true,

  // Compress output
  compress: true,

  // Optimize fonts
  optimizeFonts: true,

  // Tree shaking
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mui/icons-material', 'lodash', 'date-fns']
  },

  webpack: (config, { dev, isServer }) => {
    // Split chunks
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      }
    }

    return config
  }
})
```

### 4. CDN & Caching Strategy

#### Next.js ISR (Incremental Static Regeneration)
```typescript
// File: /pages/blog/[slug].tsx
export async function getStaticProps({ params }) {
  const post = await fetchBlogPost(params.slug)

  return {
    props: { post },
    revalidate: 60 * 10 // Revalidate every 10 minutes
  }
}

export async function getStaticPaths() {
  const posts = await fetchAllBlogPosts()

  return {
    paths: posts.map(post => ({
      params: { slug: post.slug }
    })),
    fallback: 'blocking' // Generate on-demand for missing pages
  }
}
```

#### Edge Caching Headers
```typescript
// File: /middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Cache static assets
  if (request.nextUrl.pathname.startsWith('/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // Cache API responses
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
  }

  // Cache pages
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  }

  return response
}
```

---

## 📊 MONITORING & ANALYTICS

### 1. Application Performance Monitoring

#### Implement Vercel Analytics
```typescript
// File: /pages/_app.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </>
  )
}
```

#### Custom Web Vitals Tracking
```typescript
// File: /pages/_app.tsx
import { useReportWebVitals } from 'next/web-vitals'

export default function App({ Component, pageProps }) {
  useReportWebVitals((metric) => {
    // Send to analytics
    window.gtag?.('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric)
    }

    // Send to custom endpoint
    fetch('/api/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric)
    })
  })

  return <Component {...pageProps} />
}
```

### 2. Business Analytics

#### Google Analytics 4
```typescript
// File: /lib/analytics/gtag.ts
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const pageview = (url: string) => {
  window.gtag('config', GA_MEASUREMENT_ID!, {
    page_path: url
  })
}

export const event = (action: string, params: any) => {
  window.gtag('event', action, params)
}

// Usage
import { event } from '@/lib/analytics/gtag'

// Track custom events
event('request_created', {
  type: 'restore',
  images_count: 3,
  user_id: user.id
})

event('ai_processing_completed', {
  request_id: requestId,
  duration: processingTime,
  status: 'success'
})
```

#### Mixpanel Integration
```typescript
// File: /lib/analytics/mixpanel.ts
import mixpanel from 'mixpanel-browser'

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!, {
  debug: process.env.NODE_ENV === 'development',
  track_pageview: true,
  persistence: 'localStorage'
})

export const Mixpanel = {
  identify: (id: string) => {
    mixpanel.identify(id)
  },

  alias: (id: string) => {
    mixpanel.alias(id)
  },

  track: (name: string, props?: any) => {
    mixpanel.track(name, props)
  },

  people: {
    set: (props: any) => {
      mixpanel.people.set(props)
    }
  }
}

// Usage
Mixpanel.identify(user.id)
Mixpanel.people.set({
  $email: user.email,
  $name: user.full_name,
  plan: user.plan
})

Mixpanel.track('Request Created', {
  type: 'restore',
  images: 3
})
```

### 3. Error Tracking

#### Detailed Error Logging
```typescript
// File: /lib/monitoring/errorTracking.ts
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'

export class ErrorTracker {
  static capture(error: Error, context?: any) {
    // Log to console
    logger.error({ err: error, ...context }, 'Error occurred')

    // Send to Sentry
    Sentry.captureException(error, {
      tags: context?.tags,
      extra: context?.extra,
      level: context?.level || 'error'
    })

    // Send to custom endpoint
    fetch('/api/errors/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      // Ignore errors in error logging
    })
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    Sentry.captureMessage(message, level)
    logger[level](message)
  }

  static setUser(user: { id: string; email: string; name?: string }) {
    Sentry.setUser(user)
  }

  static clearUser() {
    Sentry.setUser(null)
  }
}
```

---

## 🗺️ IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
- [ ] Setup CI/CD pipeline
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Setup monitoring (Sentry, Analytics)
- [ ] Database indexing
- [ ] Redis caching

### Phase 2: Core Improvements (Week 3-4)
- [ ] Implement queue system (BullMQ)
- [ ] API versioning
- [ ] Optimize database queries
- [ ] Image optimization pipeline
- [ ] State management (Zustand/React Query)
- [ ] Form validation (Zod + React Hook Form)

### Phase 3: Advanced Features (Week 5-6)
- [ ] GraphQL API
- [ ] Real-time updates (WebSockets)
- [ ] Background job processing
- [ ] Advanced caching strategy
- [ ] PWA implementation
- [ ] Offline support

### Phase 4: Optimization (Week 7-8)
- [ ] Bundle optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] ISR implementation
- [ ] CDN setup
- [ ] Performance testing

### Phase 5: Production Ready (Week 9-10)
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation
- [ ] Backup/restore procedures
- [ ] Monitoring dashboards
- [ ] Final optimization

---

## 📝 QUICK WINS (Implement Now)

### High Impact, Low Effort

1. **Add Loading States Everywhere**
   - Already done with UnifiedLoading ✅

2. **Implement React Query**
   ```bash
   npm install @tanstack/react-query
   ```

3. **Add Error Boundary**
   ```typescript
   // File: /components/ErrorBoundary.tsx
   import { Component, ReactNode } from 'react'

   export class ErrorBoundary extends Component<
     { children: ReactNode },
     { hasError: boolean }
   > {
     state = { hasError: false }

     static getDerivedStateFromError() {
       return { hasError: true }
     }

     componentDidCatch(error: Error, errorInfo: any) {
       console.error('Error caught:', error, errorInfo)
       // Send to Sentry
     }

     render() {
       if (this.state.hasError) {
         return <ErrorFallback />
       }
       return this.props.children
     }
   }
   ```

4. **Database Indexes** (Run Now!)
   ```sql
   CREATE INDEX idx_user_requests_user_status ON user_requests(user_id, status);
   CREATE INDEX idx_user_requests_created ON user_requests(created_at DESC);
   ```

5. **Add Redis Caching**
   - Use Upstash for serverless Redis
   - Cache user requests for 5 minutes

6. **Optimize Images**
   - Use next/image everywhere
   - Add responsive images
   - Implement lazy loading

---

**Bạn muốn tôi tập trung vào phần nào để implement ngay?**
