# Phase 3: Notification System - Implementation Complete ✅

## Tổng Quan

Phase 3 đã hoàn thành việc implement hệ thống thông báo toàn diện với:
- ✅ In-app notifications với Realtime subscriptions
- ✅ Browser push notifications
- ✅ Email notification preferences
- ✅ Notification center UI
- ✅ Notification bell với unread badge
- ✅ Full CRUD API

## Các Tính Năng Đã Implement

### 1. Database Schema ✅

**Migration File**: `lib/migrations/016_notifications.sql`

**Bảng `notifications`**:
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key -> users)
- type: TEXT (info|success|warning|error|request_update|request_delivered|system|payment|admin_message)
- title: TEXT
- message: TEXT
- read: BOOLEAN (default: false)
- action_url: TEXT (optional)
- action_label: TEXT (optional)
- metadata: JSONB (additional data)
- expires_at: TIMESTAMP (optional auto-hide)
- created_at, updated_at
```

**Bảng `notification_preferences`**:
```sql
- id: UUID
- user_id: UUID (unique)
- email_notifications: BOOLEAN (default: true)
- push_notifications: BOOLEAN (default: true)
- request_updates: BOOLEAN (default: true)
- request_delivered: BOOLEAN (default: true)
- system_announcements: BOOLEAN (default: true)
- marketing_emails: BOOLEAN (default: false)
- email_frequency: TEXT (instant|daily|weekly|never)
- created_at, updated_at
```

**Database Functions**:
- `create_notification_preferences()` - Auto-create preferences for new users
- `delete_old_notifications()` - Clean up old read notifications (30 days)
- `get_unread_count(user_id)` - Get unread count

**Triggers**:
- Auto-create preferences when user is created
- Auto-update `updated_at` timestamp

**RLS Policies**:
- Users can view/update/delete own notifications
- Admins can insert notifications for any user
- Service role can insert (for system notifications)

### 2. Notification Service ✅

**File**: `lib/notifications.ts`

**NotificationService Class** - Server-side utility:
```typescript
- createNotification(data) - Create single notification
- createBulkNotifications(userIds, data) - Bulk create
- notifyRequestUpdate(userId, requestId, status) - Notify about request status
- notifyRequestDelivered(userId, requestId, resultUrl) - Notify completion
- notifySystemAnnouncement(title, message) - Broadcast to all users
- notifyAdminMessage(userId, title, message) - Admin message
- getUnreadCount(userId) - Get unread count
- markAsRead(notificationId) - Mark as read
- markAllAsRead(userId) - Mark all as read
- deleteOldNotifications() - Cleanup old notifications
```

**Helper Functions**:
```typescript
- getNotificationIcon(type) - Get emoji icon for type
- getNotificationColor(type) - Get color for type
```

**Notification Types**:
- `info` - Thông tin chung
- `success` - Thành công
- `warning` - Cảnh báo
- `error` - Lỗi
- `request_update` - Cập nhật yêu cầu
- `request_delivered` - Kết quả sẵn sàng
- `system` - Thông báo hệ thống
- `payment` - Thanh toán
- `admin_message` - Tin nhắn từ admin

### 3. API Routes ✅

#### `/api/notifications` - Main notifications API
**GET** - Get user's notifications:
```typescript
Query params:
  - unreadOnly: boolean
  - limit: number (default: 50)
  - offset: number (default: 0)

Response:
  - notifications: Notification[]
  - total: number
  - unreadCount: number
```

**PATCH** - Mark as read:
```typescript
Body:
  - notificationId: string (single)
  - markAllRead: boolean (all)
```

**DELETE** - Delete notifications:
```typescript
Query params:
  - id: string (single)
  - deleteAll: boolean (all read)
```

#### `/api/notifications/preferences` - Preferences API
**GET** - Get user preferences:
```typescript
Response:
  - preferences: NotificationPreferences
```

**PUT** - Update preferences:
```typescript
Body: Partial<NotificationPreferences>
```

### 4. Custom Hooks ✅

**File**: `hooks/useNotifications.ts`

**Data Hooks**:
```typescript
- useNotifications(unreadOnly?) - Get notifications with auto-refetch
- useUnreadCount() - Get unread count only
- useNotificationPreferences() - Get preferences
```

**Mutation Hooks**:
```typescript
- useMarkAsRead() - Mark single notification as read
- useMarkAllAsRead() - Mark all as read
- useDeleteNotification() - Delete notification
- useUpdateNotificationPreferences() - Update preferences
```

**Realtime Hook**:
```typescript
- useRealtimeNotifications(userId) - Subscribe to realtime updates
  ✓ Listens to INSERT/UPDATE on notifications table
  ✓ Auto-refetch queries when new notification arrives
  ✓ Shows browser notification if permission granted
  ✓ Auto-cleanup on unmount
```

**Browser Notification**:
```typescript
- useNotificationPermission() - Manage browser permissions
  ✓ Check permission status
  ✓ Request permission
  ✓ Check if supported
```

### 5. UI Components ✅

#### `NotificationBell.tsx` - Notification Bell Icon
**Features**:
- 🔔 Bell icon with unread badge
- 📬 Dropdown with notifications list
- 🔍 Filter: All/Unread only
- ✅ Mark as read (single/all)
- 🗑️ Delete notifications
- 🎯 Click to navigate to action URL
- ⏱️ Relative time display (formatDistanceToNow)
- 🎨 Color-coded by type
- 📱 Responsive design
- ✨ Smooth animations (Framer Motion)

#### `NotificationCenterClient.tsx` - Full Notification Page
**Features**:
- 📋 Full-page notification list
- 🔍 Filter: All/Unread
- 📊 Statistics (total, unread count)
- ✅ Bulk mark as read
- 🗑️ Delete individual notifications
- 🎯 Action buttons
- 🎨 Beautiful card design
- ⚙️ Link to settings
- 📱 Mobile responsive
- 🔄 Auto-refresh

**Page**: `/app/notifications/page.tsx`

#### `NotificationPreferencesTab.tsx` - Settings UI
**Features**:
- 📧 Email notifications toggle
- 📱 Browser push toggle with permission request
- 🔔 Notification type preferences:
  - Request updates
  - Request delivered
  - System announcements
  - Marketing emails
- 📅 Email frequency selector (instant/daily/weekly/never)
- 💾 Save preferences
- 🎨 Toggle switches (custom CSS)
- ⚠️ Permission denied warning
- 📊 Clear UI layout

### 6. Integration ✅

**Navbar Integration**:
- Added `<NotificationBell />` next to user menu
- Enabled `useRealtimeNotifications(user?.id)` for logged-in users
- Automatic subscription to realtime updates

**Files Modified**:
- `components/layout/Navbar.tsx` - Added NotificationBell + Realtime

### 7. Realtime Subscriptions ✅

**Supabase Realtime**:
```typescript
Channel: notifications:{userId}

Events listened:
  - INSERT on notifications table
  - UPDATE on notifications table

Actions on event:
  - Invalidate React Query cache
  - Show browser notification
  - Update unread badge immediately
```

**Auto-cleanup**: Unsubscribe on component unmount

### 8. Browser Notifications ✅

**Features**:
- Request permission UI in preferences
- Show browser notification when new in-app notification arrives
- Notification includes title, message, icon
- Click notification opens app
- Only works if permission granted

## Cách Sử Dụng

### Bước 1: Chạy Migration

```bash
# Mở Supabase SQL Editor
# Copy & paste: lib/migrations/016_notifications.sql
# Execute
```

### Bước 2: Khởi Động Server

```bash
npm run dev
```

### Bước 3: Test Notifications

#### A. Test In-App Notifications

**Method 1: Manual Insert (SQL)**
```sql
INSERT INTO notifications (user_id, type, title, message, action_url, action_label)
VALUES (
  'YOUR_USER_ID',
  'success',
  'Test Notification',
  'This is a test notification!',
  '/dashboard',
  'Go to Dashboard'
);
```

**Method 2: Use NotificationService (Code)**
```typescript
import { NotificationService } from '@/lib/notifications'

// In API route or server component
await NotificationService.createNotification({
  user_id: userId,
  type: 'info',
  title: 'Welcome!',
  message: 'Thank you for signing up.',
  action_url: '/request-photo',
  action_label: 'Get Started'
})
```

#### B. Test Realtime
1. Login with user account
2. Keep app open
3. In another tab, insert notification via SQL
4. Notification bell updates immediately! ✨

#### C. Test Browser Notifications
1. Go to Settings → Notifications tab
2. Click "Bật thông báo"
3. Allow browser permission
4. Insert notification
5. Browser notification pops up even if tab inactive

### Bước 4: Integrate với Request Flow

**Example: Notify when request completed**

```typescript
// In app/api/admin/requests/[id]/deliver/route.ts
import { NotificationService } from '@/lib/notifications'

export async function POST(request: NextRequest, { params }: any) {
  // ... deliver request logic ...

  // Notify user
  await NotificationService.notifyRequestDelivered(
    request.user_id,
    request.id,
    request.result_url
  )

  return NextResponse.json({ success: true })
}
```

**Example: Notify when request status changes**

```typescript
// When status changes to 'processing'
await NotificationService.notifyRequestUpdate(
  userId,
  requestId,
  'processing',
  'AI đang xử lý ảnh của bạn...'
)

// When completed
await NotificationService.notifyRequestUpdate(
  userId,
  requestId,
  'completed',
  'Ảnh của bạn đã được khôi phục thành công!'
)
```

## API Usage Examples

### Create Notification (Server-side)
```typescript
import { NotificationService } from '@/lib/notifications'

// Simple notification
await NotificationService.createNotification({
  user_id: userId,
  type: 'info',
  title: 'New Feature!',
  message: 'Check out our new AI model.'
})

// With action button
await NotificationService.createNotification({
  user_id: userId,
  type: 'success',
  title: 'Payment Received',
  message: 'Your payment of $9.99 was successful.',
  action_url: '/invoices/123',
  action_label: 'View Invoice',
  metadata: { invoice_id: '123', amount: 9.99 }
})
```

### Broadcast to All Users
```typescript
await NotificationService.notifySystemAnnouncement(
  'Maintenance Notice',
  'System will be down for maintenance on Sunday 2AM-4AM.',
  '/announcements/maintenance',
  'Read More'
)
```

### Get Notifications (Client-side)
```typescript
import { useNotifications } from '@/hooks/useNotifications'

function MyComponent() {
  const { data, isLoading } = useNotifications()

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  return (
    <div>
      <h2>You have {unreadCount} unread notifications</h2>
      {notifications.map(notif => (
        <NotificationCard key={notif.id} notification={notif} />
      ))}
    </div>
  )
}
```

### Mark as Read
```typescript
import { useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications'

function NotificationItem({ notification }) {
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  return (
    <div>
      <button onClick={() => markAsRead.mutate(notification.id)}>
        Mark as Read
      </button>
      <button onClick={() => markAllAsRead.mutate()}>
        Mark All as Read
      </button>
    </div>
  )
}
```

### Update Preferences
```typescript
import { useUpdateNotificationPreferences } from '@/hooks/useNotifications'

function PreferencesForm() {
  const updatePrefs = useUpdateNotificationPreferences()

  const handleSave = () => {
    updatePrefs.mutate({
      email_notifications: true,
      push_notifications: true,
      request_updates: true,
      email_frequency: 'instant'
    })
  }

  return <button onClick={handleSave}>Save</button>
}
```

## Security

### Row Level Security (RLS)
- ✅ Users can only see their own notifications
- ✅ Users can only update/delete their own notifications
- ✅ Only admins can create notifications for others
- ✅ Service role can create system notifications

### API Protection
- ✅ All routes protected with `verifyAuth()`
- ✅ User ID validation on all operations
- ✅ No exposure of other users' notifications

### Realtime Security
- ✅ Supabase RLS applies to realtime subscriptions
- ✅ Users only receive their own notifications in realtime
- ✅ No cross-user data leakage

## Performance Optimization

### Caching
- React Query caching với staleTime: 10s
- Auto-refetch every 30 seconds
- Realtime updates invalidate cache instantly

### Database Indexes
```sql
- idx_notifications_user_id
- idx_notifications_read
- idx_notifications_created_at DESC
- idx_notifications_type
- idx_notifications_user_read (composite)
```

### Pagination
- Default limit: 50 notifications
- Offset-based pagination
- Load more functionality

### Auto-cleanup
- Function `delete_old_notifications()` deletes read notifications > 30 days
- Can be scheduled with cron job

## Troubleshooting

### Notifications not appearing
1. Check user is logged in
2. Check database: `SELECT * FROM notifications WHERE user_id = 'xxx'`
3. Check browser console for errors
4. Verify RLS policies

### Realtime not working
1. Check Supabase Realtime is enabled
2. Check browser console: Should see `[Realtime] Subscription status: SUBSCRIBED`
3. Verify user ID is correct
4. Check network tab for websocket connection

### Browser notifications not showing
1. Check permission status in Settings
2. If denied, user must manually enable in browser settings
3. Chrome: Settings → Privacy and security → Site settings → Notifications
4. Check if notification API supported: `'Notification' in window`

### Unread count not updating
1. Check React Query devtools
2. Verify realtime subscription is active
3. Manual refetch: `queryClient.invalidateQueries({ queryKey: ['notifications'] })`

## Files Created/Modified

### Created:
- `lib/migrations/016_notifications.sql`
- `lib/notifications.ts`
- `app/api/notifications/route.ts`
- `app/api/notifications/preferences/route.ts`
- `hooks/useNotifications.ts`
- `components/NotificationBell.tsx`
- `components/NotificationCenterClient.tsx`
- `app/notifications/page.tsx`
- `components/NotificationPreferencesTab.tsx`

### Modified:
- `components/layout/Navbar.tsx` - Added NotificationBell + Realtime

## Summary

Phase 3 implementation hoàn thành! Bạn giờ có:

✅ **Realtime in-app notifications** - Cập nhật ngay lập tức
✅ **Browser push notifications** - Thông báo ngay cả khi tab inactive
✅ **Notification center** - Trang xem tất cả thông báo
✅ **Notification bell** - Icon với unread badge
✅ **Preferences management** - User tự quản lý settings
✅ **Full CRUD API** - Create, read, update, delete
✅ **NotificationService** - Server-side utility dễ dùng
✅ **Type-safe** - TypeScript types cho tất cả
✅ **Secure** - RLS policies protect data
✅ **Performant** - Caching, pagination, indexes

Admin/developer giờ có thể:
- Send notifications tới users programmatically
- Broadcast announcements tới tất cả users
- Track user engagement với notifications
- Let users customize notification preferences

Users giờ có thể:
- Nhận thông báo realtime về request updates
- Xem tất cả notifications ở một nơi
- Customize preferences (email/push/types)
- Mark as read, delete notifications
- Get browser notifications

---

**Ngày hoàn thành**: 2026-01-19
**Phase**: 3/6 Complete
**Next Phase**: Payment Integration (Phase 2) hoặc Advanced Analytics (Phase 4)
