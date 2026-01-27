# 🚀 PRODUCTION DEPLOYMENT GUIDE

## ✅ Pre-Deployment Checklist

Before deploying to production, ensure you have completed:

- [ ] Run database migration (`COMPLETE_DATABASE_MIGRATION.sql`)
- [ ] Create storage bucket (`avatars` for avatars, optionally `user-uploads` for requests)
- [ ] Apply storage policies (`CREATE_STORAGE_BUCKET.sql`)
- [ ] Update admin emails in code (3 locations)
- [ ] Test all features locally
- [ ] Build succeeds without errors (`npm run build`)
- [ ] Environment variables are set

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel:**
- Built for Next.js
- Zero configuration
- Automatic HTTPS
- Global CDN
- Free tier available

**Steps:**

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Photo Restore App"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/photo-restore-app.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Connect your GitHub account
   - Select your repository
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add these variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `https://your-app.vercel.app`

---

### Option 2: Netlify

**Steps:**

1. **Create netlify.toml**
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy to Netlify**
   - Go to https://netlify.com
   - Drag and drop your `.next` folder
   - Or connect GitHub repo
   - Add environment variables in site settings

---

### Option 3: Self-Hosted (VPS/Docker)

**Requirements:**
- Ubuntu 20.04+ server
- Node.js 18+
- PM2 process manager
- Nginx reverse proxy

**Docker Setup:**

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   # Build app
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   # Production image
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production

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

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     web:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
         - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
       restart: unless-stopped
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

---

## 🔒 Production Security Checklist

### 1. Supabase Configuration

**Enable Email Confirmation:**
```
Supabase Dashboard → Authentication → Settings
✅ Enable email confirmations
✅ Secure email templates
```

**Set Auth Redirect URLs:**
```
Supabase Dashboard → Authentication → URL Configuration
- Site URL: https://your-domain.com
- Redirect URLs: https://your-domain.com/auth/callback
```

**Configure CORS:**
```sql
-- In Supabase SQL Editor
ALTER DATABASE postgres SET "app.cors_allowed_origins" TO 'https://your-domain.com';
```

### 2. Environment Variables

**Never commit these to Git:**
- Create `.env.local` (already in .gitignore)
- Use Vercel/Netlify environment variables UI
- For Docker, use `.env` file (add to .gitignore)

### 3. Update Admin Emails

**Change from development to production emails:**

**File 1: contexts/AuthContext.tsx**
```typescript
const ADMIN_EMAILS = [
  'your-real-admin@yourdomain.com',  // CHANGE THIS
]
```

**File 2: middleware.ts**
```typescript
const ADMIN_EMAILS = [
  'your-real-admin@yourdomain.com',  // CHANGE THIS
]
```

**File 3: Database Policies**
Re-run migration with production emails, or update manually:
```sql
-- Update all policies that check admin emails
-- Search for 'admin@photoai.com' and replace with your emails
```

### 4. Rate Limiting (Optional but Recommended)

Install rate limiter:
```bash
npm install express-rate-limit
```

Create `lib/rate-limit.ts`:
```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})
```

### 5. Content Security Policy

Add to `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## 📊 Performance Optimization

### 1. Image Optimization

**Already implemented:**
- Next.js Image component with automatic optimization
- WebP conversion
- Lazy loading

**Additional optimization:**
```typescript
// In next.config.js
module.exports = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
}
```

### 2. Bundle Size Optimization

**Check bundle size:**
```bash
npm run build
# Look for large chunks
```

**Add dynamic imports for large components:**
```typescript
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/editor/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
})
```

### 3. Database Indexing

**Already implemented:**
- Indexes on user_id, status, created_at
- Proper foreign keys

**Monitor slow queries:**
```sql
-- In Supabase SQL Editor
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### 4. Caching Strategy

**Add caching headers:**
```typescript
// In API routes or page components
export const revalidate = 3600 // Revalidate every hour
```

**Supabase query caching:**
```typescript
const { data, error } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('published', true)
  .order('created_at', { ascending: false })
  // Add caching
  .returns<BlogPost[]>()
  .abortSignal(AbortSignal.timeout(5000))
```

---

## 📈 Monitoring & Analytics

### 1. Error Tracking (Sentry)

**Install Sentry:**
```bash
npm install @sentry/nextjs
```

**Configure:**
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

### 2. Analytics (Vercel Analytics)

**For Vercel deployments:**
```bash
npm install @vercel/analytics
```

**Add to layout:**
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 3. Uptime Monitoring

**Use services like:**
- UptimeRobot (free tier)
- Pingdom
- StatusCake

**Monitor these endpoints:**
- `GET /` - Homepage
- `GET /api/health` - Health check (create this)
- `GET /login` - Auth system

### 4. Supabase Logging

**Enable in Supabase Dashboard:**
```
Settings → Logs → Enable all log types
- PostgreSQL logs
- API logs
- Storage logs
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

**Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
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

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test
        continue-on-error: true

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🧪 Production Testing Checklist

After deployment, test these features:

### Authentication
- [ ] Register new user with email/password
- [ ] Login with email/password
- [ ] Login with Google OAuth
- [ ] Logout
- [ ] Admin access to /admin routes
- [ ] Non-admin redirected from /admin
- [ ] Email confirmation (if enabled)

### User Profile
- [ ] View profile page
- [ ] Upload avatar
- [ ] Edit profile fields
- [ ] Data persists after refresh
- [ ] Avatar shows in navbar

### Request System
- [ ] Create new request
- [ ] Upload images
- [ ] View requests list
- [ ] Filter by status
- [ ] View request details
- [ ] Download restored images (when available)

### Blog System
- [ ] Create blog post (admin)
- [ ] Rich text formatting works
- [ ] Preview mode
- [ ] Publish post
- [ ] View published posts

### Performance
- [ ] Page load time < 3 seconds
- [ ] Images load properly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Works on all browsers

---

## 🐛 Troubleshooting Production Issues

### Issue: "Failed to fetch" errors

**Solution:**
1. Check CORS settings in Supabase
2. Verify environment variables are set
3. Check browser console for details

### Issue: Images not loading

**Solution:**
1. Verify storage bucket is public
2. Check Supabase storage URL in Next.js config
3. Verify storage policies are applied

### Issue: Authentication redirects fail

**Solution:**
1. Check redirect URLs in Supabase settings
2. Verify middleware is working
3. Check cookies are enabled

### Issue: Slow page loads

**Solution:**
1. Enable caching
2. Optimize images
3. Add CDN
4. Check database query performance

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- [ ] Check error logs
- [ ] Review analytics
- [ ] Monitor storage usage

**Monthly:**
- [ ] Update dependencies (`npm outdated`)
- [ ] Review security advisories
- [ ] Backup database
- [ ] Review and optimize slow queries

**Quarterly:**
- [ ] Update Node.js version
- [ ] Review and update packages
- [ ] Performance audit
- [ ] Security audit

### Database Backups

**Automated (Supabase):**
- Supabase automatically backs up your database
- Backups retained for 7 days (free tier) or 30 days (pro)

**Manual Backup:**
```bash
# Export all data
supabase db dump > backup-$(date +%Y%m%d).sql
```

### Rollback Strategy

**Vercel:**
- Go to Deployments
- Find previous working deployment
- Click "Promote to Production"

**Database:**
```sql
-- Restore from backup
psql -U postgres -d your_database < backup-20260116.sql
```

---

## 🎯 Post-Deployment Checklist

- [ ] All features tested in production
- [ ] Admin emails updated
- [ ] SSL certificate active (HTTPS)
- [ ] Custom domain configured (optional)
- [ ] Monitoring enabled
- [ ] Error tracking enabled
- [ ] Analytics enabled
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team trained on admin panel
- [ ] Support email configured
- [ ] Legal pages added (Terms, Privacy)

---

## 🌟 Optional Enhancements

### 1. Custom Domain
- Purchase domain (Namecheap, GoDaddy)
- Configure DNS in Vercel/Netlify
- Add SSL certificate (automatic)

### 2. Email Notifications
- Set up SendGrid or Mailgun
- Send notifications for:
  - New requests
  - Request status changes
  - Account verification

### 3. Advanced Features
- PDF export for requests
- Batch image processing
- Payment integration
- Multi-language support
- Dark mode

---

**Status:** ✅ Ready for Production Deployment

**Deployment Time:** ~30 minutes (Vercel) to 2 hours (Self-hosted)

**Next Steps:**
1. Choose deployment platform
2. Run production checklist
3. Deploy!
4. Test thoroughly
5. Monitor and maintain

Good luck with your deployment! 🚀
