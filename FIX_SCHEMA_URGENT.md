# 🚨 URGENT: Fix Database Schema

## Problem

Database error: `Could not find the 'original_images' column of 'user_requests' in the schema cache`

**Cause:** The `user_requests` table is missing required columns for image storage.

---

## ✅ Quick Fix (3 minutes)

### Step 1: Apply Migration

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" in left sidebar

2. **Run this SQL:**

```sql
-- Add missing columns to user_requests table
ALTER TABLE user_requests
ADD COLUMN IF NOT EXISTS original_images TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS restored_images TEXT[],
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_requests'
ORDER BY column_name;
```

3. **Click "Run"**

4. **Expected output:**
```
✅ ALTER TABLE
✅ Columns: admin_id, admin_notes, completed_at, created_at,
   description, id, original_images, restored_images, status,
   type, updated_at, user_id
```

---

### Step 2: Rebuild Application

```bash
# Clear build cache
rm -rf .next

# Rebuild
npm run build
```

**Expected:**
```
✓ Compiled successfully
✓ Generating static pages (33/33)
```

---

### Step 3: Restart Dev Server

```bash
npm run dev
```

**Go to:** http://localhost:3000/requests/new

---

## ✅ Test Upload

1. Select request type: "Phục hồi ảnh cũ"
2. Enter description: "Test upload after schema fix"
3. Upload 1-3 images
4. Click "Gửi yêu cầu"

**Expected:**
- ✅ Upload to Cloudinary
- ✅ Store URLs in database
- ✅ No error: "Could not find the 'original_images' column"
- ✅ Success toast
- ✅ Redirect to /requests

---

## 🔍 Verify Database

In Supabase SQL Editor:

```sql
-- Check latest request
SELECT
  id,
  user_id,
  type,
  status,
  original_images, -- Should have Cloudinary URLs
  created_at
FROM user_requests
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
```json
{
  "id": "uuid",
  "original_images": [
    "https://res.cloudinary.com/dt6p7wm6i/image/upload/...",
    "https://res.cloudinary.com/dt6p7wm6i/image/upload/..."
  ]
}
```

---

## 📝 Why This Happened

The `user_requests` table was created without the image columns. The schema file `database-user-requests.sql` has them defined, but the migration wasn't applied to your live Supabase database.

**Fix:** Apply the migration above to add the missing columns.

---

## ✅ Checklist

- [ ] SQL migration applied in Supabase
- [ ] Columns verified in database
- [ ] Build cleared (.next deleted)
- [ ] App rebuilt successfully
- [ ] Dev server restarted
- [ ] Upload test completed
- [ ] URLs stored in database

---

## 🎯 After Fix

**Upload Flow:**
```
Files → Cloudinary → URLs → Database (original_images TEXT[])
```

**No more errors!** ✅
