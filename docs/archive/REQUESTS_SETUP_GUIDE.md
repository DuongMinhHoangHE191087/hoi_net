# User Requests System Setup Guide

## Overview
Complete photo restoration request system allowing users to submit, track, and manage their photo restoration requests.

## Features Implemented
- ✅ Request submission with image upload
- ✅ Request type selection (Restore, Family)
- ✅ Image preview and validation
- ✅ Request status tracking (Pending, Processing, Completed, Rejected)
- ✅ Request viewing and filtering
- ✅ Image gallery with download
- ✅ Admin notes display
- ✅ Delete pending requests
- ✅ Statistics dashboard
- ✅ Responsive design

## Database Setup

### 1. Run SQL Migration

Execute `database-user-requests.sql` in Supabase SQL Editor:

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. New Query
# 3. Copy contents from database-user-requests.sql
# 4. Run query
```

This creates:
- `user_requests` table with all fields
- Request types: `restore`, `family`
- Request statuses: `pending`, `processing`, `completed`, `rejected`
- RLS policies (users can only view/edit their own requests)
- Admin policies (admins can view/edit all requests)
- Indexes for performance
- Triggers for auto-update timestamps
- Statistics view for dashboard

### 2. Verify Image Upload

Request images are uploaded to **Cloudinary** (not Supabase Storage):

```bash
# Ensure Cloudinary env variables are set:
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Note:** Avatar uploads use Supabase Storage bucket `avatars`.
Request images use Cloudinary for better CDN and transformations.

## File Structure

```
app/
  requests/
    page.tsx              # View all requests
    new/
      page.tsx            # Submit new request

database-user-requests.sql  # Database schema
```

## Request Schema

### Database Table: `user_requests`

```typescript
{
  id: UUID (auto-generated)
  user_id: UUID (references auth.users)
  type: 'restore' | 'family'
  description: string (10-1000 characters)
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  original_images: string[] (array of image URLs)
  restored_images: string[] | null (array of restored image URLs)
  admin_notes: string | null
  admin_id: UUID | null (references auth.users)
  created_at: timestamp
  updated_at: timestamp
  completed_at: timestamp | null
}
```

### Request Types

**Restore (Phục Hồi Ảnh Cũ)**
- For restoring old, faded, damaged photos
- Icon: ImageIcon
- Color: Primary gradient

**Family (Ảnh Gia Đình)**
- For family photo editing and composition
- Icon: Camera
- Color: Blue/Purple gradient

### Request Statuses

**Pending (Chờ Xử Lý)**
- Initial state after submission
- User can delete
- Color: Yellow

**Processing (Đang Xử Lý)**
- Admin has started working
- User cannot delete
- Color: Blue

**Completed (Hoàn Thành)**
- Work finished, restored images available
- Download button enabled
- Color: Green

**Rejected (Từ Chối)**
- Request rejected with admin notes
- Color: Red

## Validation Rules

### Description
- Min: 10 characters
- Max: 1000 characters
- Sanitized for XSS

### Images
- Min: 1 image
- Max: 5 images
- File types: image/jpeg, image/png, image/webp
- Max size per image: 10MB
- Stored in: `user-uploads/requests/{userId}-{timestamp}-{random}.{ext}`

## Usage Flow

### Submit Request (`/requests/new`)

1. **User navigates to `/requests/new`**
   - Middleware checks authentication
   - Redirects to login if not authenticated

2. **User fills form**
   - Select request type (Restore or Family)
   - Write description (10-1000 chars)
   - Upload 1-5 images

3. **Image upload**
   - Client-side validation (type, size)
   - Preview generation
   - Can remove images before submit

4. **Submit**
   - Form validation with Zod
   - Images uploaded to Supabase Storage
   - Request created in database
   - Redirect to `/requests`

### View Requests (`/requests`)

1. **Page loads**
   - Fetches all user requests
   - Displays statistics
   - Shows filter options

2. **Filter requests**
   - All (default)
   - Pending
   - Processing
   - Completed
   - Rejected

3. **View request details**
   - Click eye icon or image
   - Modal shows full details
   - View all original images
   - View restored images (if completed)
   - Read admin notes
   - Download images

4. **Delete request**
   - Only for pending requests
   - Confirmation dialog
   - Removes from database

## Integration with Dashboard

The dashboard now shows:
- Total requests count
- Pending requests count
- Processing requests count
- Completed requests count
- Rejected requests count

These stats are loaded from the `user_request_stats` view.

## Admin Features (To Be Implemented)

Admins should be able to:
- View all user requests
- Change request status
- Upload restored images
- Add admin notes
- Reject requests with reasons

This will be implemented in the admin panel.

## Testing Checklist

### Database
- [ ] Run user_requests SQL migration
- [ ] Verify table created
- [ ] Check RLS policies active
- [ ] Test as regular user (can only see own requests)
- [ ] Test as admin (can see all requests)
- [ ] Verify indexes created
- [ ] Test triggers (updated_at, completed_at)

### Request Submission
- [ ] Navigate to `/requests/new` without login → redirects
- [ ] Navigate to `/requests/new` after login → loads
- [ ] Select request type → updates UI
- [ ] Write description < 10 chars → shows error
- [ ] Write description > 1000 chars → shows error
- [ ] Upload 0 images → shows error
- [ ] Upload > 5 images → shows error
- [ ] Upload non-image file → shows error
- [ ] Upload image > 10MB → shows error
- [ ] Upload valid images → shows previews
- [ ] Remove image → updates preview
- [ ] Submit valid form → uploads images
- [ ] Submit valid form → creates request
- [ ] Submit valid form → redirects to `/requests`

### Request Viewing
- [ ] Navigate to `/requests` → loads all requests
- [ ] Click filter buttons → filters work
- [ ] No requests → shows empty state
- [ ] Click request → shows modal
- [ ] Modal shows all images
- [ ] Download button works
- [ ] Delete pending request → confirms and deletes
- [ ] Cannot delete processing/completed requests
- [ ] Refresh page → data persists

### Integration
- [ ] Dashboard shows correct stats
- [ ] Profile card shows correct info
- [ ] Navbar links work
- [ ] Mobile responsive

## Common Issues

### Issue: "relation user_requests does not exist"
**Solution:** Run `database-user-requests.sql` in Supabase SQL Editor

### Issue: "Failed to upload image"
**Solution:**
1. Verify `user-uploads` bucket exists
2. Check storage policies are created
3. Verify user is authenticated
4. Check file size < 10MB

### Issue: "Cannot view requests"
**Solution:** Check RLS policies are active and user owns the requests

### Issue: "Stats not updating"
**Solution:** Refresh the page or check if `user_request_stats` view exists

## Security Notes

✅ **Implemented:**
- Input sanitization for description
- File type validation
- File size limits (10MB)
- RLS policies (users can only view own requests)
- Admin-only access for sensitive operations
- XSS prevention via DOMPurify
- SQL injection prevention via Supabase
- Image upload validation

⚠️ **Best Practices:**
- Never store sensitive data in requests
- Validate all inputs server-side and client-side
- Use RLS policies for all database access
- Limit file upload sizes
- Rate limit submissions (implement if needed)
- Scan uploaded images for malware (implement if needed)

## Performance Optimizations

- Indexes on user_id, status, created_at
- Image lazy loading
- Pagination (implement if many requests)
- Statistics view for faster dashboard loads
- Optimistic UI updates

## API Reference

### Supabase Client Methods

```typescript
// Fetch user requests
const { data, error } = await supabase
  .from('user_requests')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// Create request
const { error } = await supabase
  .from('user_requests')
  .insert({
    user_id: userId,
    type: 'restore',
    description: 'description',
    original_images: ['url1', 'url2'],
    status: 'pending'
  })

// Update request (admin only)
const { error } = await supabase
  .from('user_requests')
  .update({
    status: 'completed',
    restored_images: ['url1', 'url2'],
    admin_notes: 'notes',
    admin_id: adminId
  })
  .eq('id', requestId)

// Delete request
const { error } = await supabase
  .from('user_requests')
  .delete()
  .eq('id', requestId)
  .eq('user_id', userId) // Security check

// Upload image
const { error } = await supabase.storage
  .from('user-uploads')
  .upload('requests/filename.jpg', file)

// Get stats
const { data, error } = await supabase
  .from('user_request_stats')
  .select('*')
  .eq('user_id', userId)
  .single()
```

## Next Steps

After requests system is working:

1. **Admin Request Management**
   - View all requests in admin panel
   - Change status
   - Upload restored images
   - Add notes

2. **Email Notifications**
   - Notify user when status changes
   - Send reminder for pending requests

3. **Advanced Features**
   - Image comparison slider
   - Before/After view
   - Request history
   - User ratings

---

**Status:** ✅ Ready for testing
**Last Updated:** 2026-01-16
