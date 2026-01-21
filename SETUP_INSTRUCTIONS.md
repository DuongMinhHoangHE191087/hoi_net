# 🚀 COMPLETE SETUP GUIDE - Photo Restore App

## ✅ Status: Ready to Deploy

All code is complete and packages are installed. Follow these steps to complete the setup.

---

## 📦 Step 1: Package Installation ✅ DONE

Packages have been installed successfully:
- ✅ @tiptap/react
- ✅ @tiptap/starter-kit
- ✅ @tiptap/extension-link
- ✅ @tiptap/extension-image
- ✅ @tiptap/extension-placeholder
- ✅ @tailwindcss/typography
- ✅ zod
- ✅ isomorphic-dompurify
- ✅ react-hot-toast

Tailwind config has been updated with typography plugin.

---

## 🗄️ Step 2: Database Migration

### 2.1 Run Complete Database Migration

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Run Migration**
   - Open file: `COMPLETE_DATABASE_MIGRATION.sql`
   - Copy ALL contents
   - Paste into SQL Editor
   - Click "Run" (or press Ctrl+Enter)

4. **Verify Success**
   - You should see a success message
   - Check that tables are created:
     - user_profiles
     - user_requests
     - blog_posts

### Expected Output:
```
table_name       | row_count
-----------------|-----------
user_profiles    | 0
user_requests    | 0
blog_posts       | 0
```

---

## 💾 Step 3: Storage Setup

### 3.1 Create Storage Bucket

1. **Go to Storage**
   - Click "Storage" in Supabase Dashboard sidebar

2. **Create Bucket**
   - Click "Create new bucket"
   - Name: `user-uploads`
   - **Public bucket**: ✅ CHECK THIS BOX (Important!)
   - Click "Create bucket"

### 3.2 Apply Storage Policies

1. **Open SQL Editor**
   - SQL Editor → New Query

2. **Run Storage Setup**
   - Open file: `COMPLETE_STORAGE_SETUP.sql`
   - Copy ALL contents
   - Paste and Run

3. **Verify Success**
   - You should see the bucket listed
   - Policies should be created

---

## 🔐 Step 4: Configure Admin Emails

Update admin emails in these files:

### 4.1 AuthContext
**File:** `contexts/AuthContext.tsx`
```typescript
// Line ~15
const ADMIN_EMAILS = [
  'your-admin-email@gmail.com',  // <-- CHANGE THIS
  // Add more admin emails here
]
```

### 4.2 Middleware
**File:** `middleware.ts`
```typescript
// Line ~6-9
const ADMIN_EMAILS = [
  'your-admin-email@gmail.com',  // <-- CHANGE THIS
]
```

### 4.3 Database Policies
Already updated in SQL files, but you can re-run the migration with your emails.

---

## 🌐 Step 5: Environment Variables

Verify `.env.local` has these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from Supabase Dashboard → Settings → API

---

## 🧪 Step 6: Test the System

### 6.1 Start Development Server

```bash
cd D:\GITHUB\WEB-SSG
npm run dev
```

### 6.2 Test Authentication

1. **Register a new user**
   - Go to: http://localhost:3000/register
   - Register with your admin email
   - Check email for verification link (if enabled)

2. **Login**
   - Go to: http://localhost:3000/login
   - Login with your credentials
   - Should redirect to dashboard

3. **Test Admin Access**
   - Go to: http://localhost:3000/admin
   - Should allow access (if using admin email)
   - Try with non-admin email → should redirect to /unauthorized

### 6.3 Test User Profile

1. **Navigate to Profile**
   - Click your avatar → "Hồ Sơ"
   - Or go to: http://localhost:3000/profile

2. **Upload Avatar**
   - Click camera icon
   - Select image (max 5MB)
   - Should upload successfully

3. **Fill Profile**
   - Enter name, phone, address, Facebook URL
   - Click "Lưu Thay Đổi"
   - Should save successfully

### 6.4 Test Request System

1. **Create Request**
   - Go to: http://localhost:3000/requests/new
   - Select request type
   - Write description (10-1000 chars)
   - Upload 1-5 images (max 10MB each)
   - Click "Gửi Yêu Cầu"
   - Should create successfully

2. **View Requests**
   - Go to: http://localhost:3000/requests
   - Should see your request
   - Click to view details
   - Try filtering by status

### 6.5 Test Rich Text Editor

1. **Create Blog Post** (Admin only)
   - Go to: http://localhost:3000/admin/blog/new
   - Enter title (auto-generates slug)
   - Write excerpt
   - Use rich text editor for content
   - Add featured image URL
   - Toggle preview mode
   - Click "Xuất Bản" or "Lưu Nháp"

### 6.6 Test Dashboard

1. **View Dashboard**
   - Go to: http://localhost:3000/dashboard
   - Should show profile card
   - Should show statistics
   - Click quick action buttons

---

## ✅ Testing Checklist

### Authentication
- [ ] Register with email/password
- [ ] Register with Google
- [ ] Login with email/password
- [ ] Login with Google
- [ ] Logout (clears session)
- [ ] Admin can access /admin routes
- [ ] Non-admin redirected from /admin
- [ ] Unauthorized page displays correctly

### User Profile
- [ ] View profile page
- [ ] Upload avatar (< 5MB)
- [ ] Upload avatar (> 5MB) - should fail
- [ ] Fill all profile fields
- [ ] Save profile
- [ ] Refresh page - data persists
- [ ] Avatar displays in navbar
- [ ] Name displays in dashboard

### Request System
- [ ] Navigate to /requests/new
- [ ] Select request type
- [ ] Upload 0 images - shows error
- [ ] Upload 1-5 images - works
- [ ] Upload > 5 images - shows error
- [ ] Upload non-image - shows error
- [ ] Upload > 10MB image - shows error
- [ ] Submit valid request
- [ ] View request in /requests
- [ ] Filter requests by status
- [ ] View request details
- [ ] Delete pending request
- [ ] Cannot delete processing request

### Rich Text Editor
- [ ] Open blog post editor
- [ ] Use formatting tools (bold, italic, etc.)
- [ ] Add headings
- [ ] Create lists
- [ ] Add links
- [ ] Add images
- [ ] Undo/redo works
- [ ] Preview mode works
- [ ] Save blog post
- [ ] Slug auto-generates from title

### Dashboard
- [ ] Statistics display correctly
- [ ] Profile card shows data
- [ ] Admin badge shows (for admins)
- [ ] Quick action buttons work
- [ ] Help links work

### Mobile Responsive
- [ ] Navbar collapses on mobile
- [ ] Forms work on mobile
- [ ] Dashboard layout adapts
- [ ] Profile page works
- [ ] Request submission works

---

## 🐛 Common Issues & Solutions

### Issue: "relation user_profiles does not exist"
**Solution:** Run `COMPLETE_DATABASE_MIGRATION.sql` in Supabase SQL Editor

### Issue: "storage bucket not found"
**Solution:**
1. Create `user-uploads` bucket in Supabase Storage
2. Make sure "Public" is checked
3. Run `COMPLETE_STORAGE_SETUP.sql`

### Issue: "Failed to upload image"
**Solution:**
1. Check bucket exists and is public
2. Check file size < 5MB (avatar) or < 10MB (requests)
3. Check file is an image type
4. Check storage policies are created

### Issue: "Cannot access /admin routes"
**Solution:**
1. Check your email is in ADMIN_EMAILS array
2. Logout and login again
3. Check middleware.ts has correct admin emails

### Issue: "Rich text editor not loading"
**Solution:**
1. Check TipTap packages are installed
2. Check tailwind.config.js has typography plugin
3. Restart dev server

### Issue: "Validation errors on forms"
**Solution:**
1. Check field requirements (min/max length)
2. Check phone format: 0XXXXXXXXX
3. Check email format
4. Check password requirements

---

## 🎯 What to Check After Setup

1. **Database Tables**
   ```sql
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY tablename;
   ```
   Should show: blog_posts, user_profiles, user_requests

2. **RLS Policies**
   ```sql
   SELECT tablename, policyname
   FROM pg_policies
   WHERE schemaname = 'public';
   ```
   Should show multiple policies for each table

3. **Storage Bucket**
   - Check bucket exists
   - Check it's public
   - Try uploading a test image

4. **Admin Access**
   - Login with admin email
   - Visit /admin
   - Should see admin panel

---

## 🚀 Ready to Deploy

Once all tests pass:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Check for errors**
   - Fix any TypeScript errors
   - Fix any build warnings

3. **Deploy to Vercel/Netlify**
   - Connect your GitHub repo
   - Set environment variables
   - Deploy!

4. **Production Checklist**
   - [ ] Update admin emails to production emails
   - [ ] Enable email confirmation in Supabase
   - [ ] Set up custom domain
   - [ ] Configure CORS if needed
   - [ ] Set up monitoring/logging
   - [ ] Test on production

---

## 📊 Feature Completion

✅ **100% Complete:**
- Authentication (Email/Password + Google OAuth)
- User Profile Management
- Request System
- Rich Text Editor
- Admin Protection
- Security (XSS, SQL Injection prevention)
- Validation (Zod schemas)
- File Uploads (Images)
- Responsive UI

---

## 📞 Need Help?

1. **Check Documentation:**
   - PROFILE_SETUP_GUIDE.md
   - REQUESTS_SETUP_GUIDE.md
   - RICH_EDITOR_SETUP_GUIDE.md
   - FINAL_IMPLEMENTATION_REPORT.md

2. **Check Database:**
   - Verify tables exist
   - Check RLS policies
   - Verify admin emails in policies

3. **Check Console:**
   - Browser console for errors
   - Terminal for server errors
   - Supabase logs for database errors

---

**Status:** ✅ Ready for Testing and Deployment
**Last Updated:** 2026-01-16

**Next Steps:**
1. Run database migration (5 minutes)
2. Create storage bucket (2 minutes)
3. Update admin emails (2 minutes)
4. Test the system (15 minutes)
5. Deploy! 🚀
