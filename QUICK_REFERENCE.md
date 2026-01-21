# 📋 QUICK REFERENCE - Setup Commands

## ✅ Status: Packages Installed, Ready for Database Setup

---

## 🗄️ Database Migration (Copy & Paste in Supabase SQL Editor)

**File to use:** `COMPLETE_DATABASE_MIGRATION.sql`

**Steps:**
1. Go to: https://supabase.com/dashboard → Your Project → SQL Editor
2. Click "New Query"
3. Open `COMPLETE_DATABASE_MIGRATION.sql` from project folder
4. Copy ALL contents and paste
5. Click "Run" (or Ctrl+Enter)
6. Verify: Should see 3 tables created (user_profiles, user_requests, blog_posts)

---

## 💾 Storage Setup

**Step 1: Create Bucket (In Supabase Dashboard)**
1. Go to: Storage → Create new bucket
2. Name: `user-uploads`
3. **✅ CHECK "Public bucket"** (Important!)
4. Click "Create bucket"

**Step 2: Apply Policies (Copy & Paste in SQL Editor)**
1. Open `COMPLETE_STORAGE_SETUP.sql`
2. Copy ALL contents
3. Paste in SQL Editor → Run

---

## 🔐 Update Admin Emails (3 Places)

### 1. contexts/AuthContext.tsx (Line ~15)
```typescript
const ADMIN_EMAILS = [
  'YOUR_EMAIL@gmail.com',  // <-- CHANGE
]
```

### 2. middleware.ts (Line ~6)
```typescript
const ADMIN_EMAILS = [
  'YOUR_EMAIL@gmail.com',  // <-- CHANGE
]
```

### 3. Already in SQL files
The migration files already have placeholders. Update if needed.

---

## 🧪 Quick Test Commands

### Start Dev Server
```bash
cd D:\GITHUB\WEB-SSG
npm run dev
```

### Test URLs
- Homepage: http://localhost:3000
- Register: http://localhost:3000/register
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard
- Profile: http://localhost:3000/profile
- New Request: http://localhost:3000/requests/new
- View Requests: http://localhost:3000/requests
- Admin Panel: http://localhost:3000/admin
- Blog Editor: http://localhost:3000/admin/blog/new

---

## 📊 What Should Work After Setup

✅ **Authentication**
- Register with email/password
- Login with Google OAuth
- Admin panel access (for admin emails only)
- Logout

✅ **User Profile**
- Upload avatar (max 5MB)
- Edit name, phone, address, Facebook URL
- View in dashboard

✅ **Request System**
- Submit photo restoration requests
- Upload 1-5 images (max 10MB each)
- Track request status
- Download restored images (when admin completes)

✅ **Blog Posts** (Admin only)
- Create posts with rich text editor
- Preview before publishing
- Auto-generate slug from title
- Publish or save as draft

✅ **Dashboard**
- View profile summary
- See request statistics
- Quick action buttons
- Admin panel link (for admins)

---

## 🚨 If Something Goes Wrong

### Database Error
```sql
-- Check if tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public';

-- Should show: blog_posts, user_profiles, user_requests
```

### Storage Error
```sql
-- Check if bucket exists
SELECT * FROM storage.buckets
WHERE name = 'user-uploads';

-- Should show 1 row with public = true
```

### Admin Access Error
1. Check email in ADMIN_EMAILS arrays
2. Logout and login again
3. Clear browser cache

### Upload Error
1. Check bucket is PUBLIC
2. Check file size limits
3. Check file is an image
4. Check storage policies exist

---

## 📁 Important Files Reference

### Setup Files
- `SETUP_INSTRUCTIONS.md` - Complete setup guide
- `COMPLETE_DATABASE_MIGRATION.sql` - All database tables
- `COMPLETE_STORAGE_SETUP.sql` - Storage policies

### Documentation
- `PROFILE_SETUP_GUIDE.md` - Profile system docs
- `REQUESTS_SETUP_GUIDE.md` - Request system docs
- `RICH_EDITOR_SETUP_GUIDE.md` - Editor docs
- `FINAL_IMPLEMENTATION_REPORT.md` - Complete feature list

### Core Code
- `contexts/AuthContext.tsx` - Authentication logic
- `middleware.ts` - Route protection
- `lib/security.ts` - Security utilities
- `lib/validation.ts` - Validation schemas
- `components/editor/RichTextEditor.tsx` - Rich text editor

---

## ⏱️ Estimated Setup Time

- Database Migration: **5 minutes**
- Storage Setup: **2 minutes**
- Update Admin Emails: **2 minutes**
- Testing: **15 minutes**
- **Total: ~25 minutes**

---

## 🎯 Deploy Checklist

- [ ] Run database migration
- [ ] Create storage bucket (public)
- [ ] Apply storage policies
- [ ] Update admin emails
- [ ] Test authentication
- [ ] Test profile upload
- [ ] Test request system
- [ ] Test blog editor
- [ ] Build project (`npm run build`)
- [ ] Deploy to Vercel/Netlify
- [ ] Test in production

---

**Ready to go! Start with database migration, then storage setup.** 🚀
