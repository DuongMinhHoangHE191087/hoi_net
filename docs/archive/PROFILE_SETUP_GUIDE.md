# User Profile Setup Guide

## Overview
User profile system with extended fields for managing user information including avatar upload.

## Features
- ✅ Full name, phone, address, Facebook URL
- ✅ Avatar upload with image preview
- ✅ Form validation with Zod
- ✅ Input sanitization
- ✅ Supabase database integration
- ✅ Supabase Storage for avatars
- ✅ Row Level Security (RLS)
- ✅ Responsive design
- ✅ Real-time updates

## Database Setup

### 1. Create User Profiles Table

Run `database-user-profiles.sql` in Supabase SQL Editor:

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. New Query
# 3. Copy contents from database-user-profiles.sql
# 4. Run query
```

This creates:
- `user_profiles` table
- RLS policies (users can only edit their own profile)
- Admin policies (admins can view all profiles)
- Indexes for performance
- Auto-update trigger for `updated_at`

### 2. Create Storage Bucket

**Via Supabase Dashboard:**

1. Go to **Storage** → **Create new bucket**
2. Bucket name: `avatars`
3. **Public bucket**: ✅ Yes (checked)
4. Click **Create bucket**

**Then run storage policies:**

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. New Query
# 3. Copy contents from CREATE_STORAGE_BUCKET.sql
# 4. Run query
```

This creates:
- Upload policies (users can upload to their own folder: `{userId}/avatar-xxx.ext`)
- Read policies (public can view uploaded images)
- Delete policies (users can delete their own files)
- Admin policy (admins can manage all avatars)

## Environment Variables

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## File Structure

```
app/
  profile/
    page.tsx          # User profile page

lib/
  validation.ts       # profileSchema already exists
  security.ts         # validation functions already exist

database-user-profiles.sql   # Database schema
database-storage-setup.sql   # Storage policies
```

## Profile Schema

```typescript
{
  full_name: string (2-100 chars, required)
  phone: string (Vietnamese format: 0XXXXXXXXX, optional)
  address: string (10-200 chars, optional)
  facebook_url: string (must be facebook.com URL, optional)
  avatar_url: string (URL from storage)
}
```

## Validation Rules

### Full Name
- Min: 2 characters
- Max: 100 characters
- Required

### Phone
- Format: Vietnamese phone number
- Pattern: `^0[0-9]{9,10}$`
- Example: `0912345678`
- Optional

### Address
- Min: 10 characters
- Max: 200 characters
- Optional

### Facebook URL
- Must be valid URL
- Must include 'facebook.com'
- Example: `https://facebook.com/username`
- Optional

### Avatar
- File types: image/jpeg, image/png, image/webp, image/gif
- Max size: 5MB
- Uploaded to: `avatars/{userId}/avatar-{timestamp}.ext`

## Usage Flow

1. **User navigates to `/profile`**
   - Middleware checks authentication
   - Redirects to login if not authenticated

2. **Profile page loads**
   - Fetches existing profile from `user_profiles` table
   - Falls back to auth metadata if no profile exists
   - Displays current avatar or initials

3. **User edits information**
   - Real-time validation
   - Field-level error messages
   - Sanitization on input

4. **User uploads avatar**
   - Click camera icon
   - Select image file
   - Validates file type and size
   - Uploads to Supabase Storage
   - Updates avatar preview

5. **User saves profile**
   - Validates all fields with Zod
   - Sanitizes inputs
   - Upserts to `user_profiles` table
   - Updates auth metadata
   - Shows success toast

## Testing Checklist

### Database
- [ ] Run user_profiles SQL migration
- [ ] Verify table created
- [ ] Check RLS policies active
- [ ] Test as regular user (can only see own profile)
- [ ] Test as admin (can see all profiles)

### Storage
- [ ] Create `avatars` bucket (run CREATE_STORAGE_BUCKET.sql)
- [ ] Set bucket to public
- [ ] Run storage policies SQL
- [ ] Test file upload
- [ ] Verify public URL works
- [ ] Test file size limits (5MB max)

### Profile Page
- [ ] Navigate to `/profile` without login → redirects to login
- [ ] Navigate to `/profile` after login → loads profile
- [ ] Fill in all fields → saves successfully
- [ ] Leave optional fields empty → saves successfully
- [ ] Enter invalid phone → shows error
- [ ] Enter invalid Facebook URL → shows error
- [ ] Upload avatar < 5MB → works
- [ ] Upload avatar > 5MB → shows error
- [ ] Upload non-image file → shows error
- [ ] Click save without name → shows error
- [ ] Refresh page → data persists

### Integration
- [ ] Navbar shows correct initials
- [ ] Navbar shows correct name after update
- [ ] Dashboard shows profile info
- [ ] Admin can view user profiles

## Common Issues

### Issue: "relation user_profiles does not exist"
**Solution:** Run `database-user-profiles.sql` in Supabase SQL Editor

### Issue: "storage bucket not found"
**Solution:** Create `user-uploads` bucket in Supabase Dashboard Storage

### Issue: "permission denied for table user_profiles"
**Solution:** Check RLS policies are created and user is authenticated

### Issue: "Failed to upload image"
**Solution:**
1. Verify bucket exists and is public
2. Check storage policies are created
3. Verify user is authenticated
4. Check file size < 5MB

### Issue: "Avatar not displaying"
**Solution:**
1. Check bucket is public
2. Verify public URL is correct
3. Check image file is accessible
4. Clear browser cache

## Security Notes

✅ **Implemented:**
- Input sanitization for all text fields
- File type validation for images
- File size limits (5MB)
- XSS prevention via DOMPurify
- SQL injection prevention via Supabase prepared statements
- RLS policies (users can only edit own profile)
- Phone number format validation
- URL validation for Facebook link

⚠️ **Best Practices:**
- Never store sensitive data in profile
- Validate all inputs server-side and client-side
- Use RLS policies for all database access
- Limit file upload sizes
- Sanitize user-generated content before display
- Rate limit file uploads (implement if needed)

## Admin Features

Admins can:
- View all user profiles via admin panel (to be implemented)
- Access user management dashboard
- See user statistics

Admin emails configured in:
- `contexts/AuthContext.tsx` (ADMIN_EMAILS)
- `middleware.ts` (ADMIN_EMAILS)
- `database-user-profiles.sql` (RLS policies)

## Next Steps

After profile page is working:

1. **Create Dashboard page** (`/dashboard`)
   - Show profile summary
   - Quick links to edit profile
   - Show user requests

2. **Create Requests page** (`/requests`)
   - Submit AI restoration requests
   - Upload multiple images
   - Track request status

3. **Admin User Management**
   - View all users
   - View user profiles
   - Manage user requests

## API Reference

### Supabase Client Methods

```typescript
// Fetch profile
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', userId)
  .single()

// Upsert profile
const { error } = await supabase
  .from('user_profiles')
  .upsert({
    id: userId,
    full_name: 'John Doe',
    // ... other fields
  }, { onConflict: 'id' })

// Upload avatar
const { error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar-${Date.now()}.jpg`, file)

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar-${Date.now()}.jpg`)
```

## Support

If you encounter issues:
1. Check Supabase logs
2. Check browser console
3. Verify environment variables
4. Test database connection
5. Verify RLS policies

---

**Status:** ✅ Ready for testing
**Last Updated:** 2026-01-16
