# 🔐 HỆ THỐNG BẢO MẬT & QUẢN LÝ TOÀN DIỆN

## ✅ ĐÃ HOÀN THÀNH

### 1. Authentication & Authorization
- ✅ Fix logout button (với proper state clearing & redirect)
- ✅ Token refresh tự động (Supabase handles this)
- ✅ Admin role system (email-based)
- ✅ Protected admin routes với middleware
- ✅ Email/password authentication support
- ✅ Unauthorized page

### 2. Files Đã Tạo/Cập Nhật
- ✅ `contexts/AuthContext.tsx` - CẬP NHẬT toàn diện
  - `isAdmin` state
  - `signInWithEmail()`
  - `signUpWithEmail()`
  - `updateProfile()`
  - Token refresh handling
  - Proper logout

- ✅ `middleware.ts` - MỚI
  - Bảo vệ `/admin` routes
  - Check admin permissions
  - Auto redirect nếu không có quyền

- ✅ `app/unauthorized/page.tsx` - MỚI
  - Trang báo lỗi khi không có quyền

## 📋 CẦN TRIỂN KHAI TIẾP

Vì yêu cầu quá nhiều, tôi sẽ chia thành các phần và làm từng bước:

---

## PHASE 1: EMAIL/PASSWORD AUTHENTICATION ⚡

### Cập nhật Login Page
```typescript
// app/login/page.tsx
- Thêm form email/password
- Toggle Google vs Email login
- Validation
- Error messages
```

### Cập nhật Register Page
```typescript
// app/register/page.tsx
- Form đăng ký với email/password
- Password strength indicator
- Email verification notice
- Terms agreement checkbox
```

**Files cần tạo:**
1. `app/login/page.tsx` - Cập nhật
2. `app/register/page.tsx` - Cập nhật
3. `components/auth/EmailLoginForm.tsx` - MỚI
4. `components/auth/EmailRegisterForm.tsx` - MỚI

---

## PHASE 2: USER MANAGEMENT SYSTEM 👥

### User Profile System

**Database Updates:**
```sql
-- Thêm user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  phone TEXT,
  address TEXT,
  facebook_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Components:**
1. `app/dashboard/page.tsx` - User dashboard
2. `app/profile/page.tsx` - Profile management
3. `app/requests/page.tsx` - User requests
4. `components/user/ProfileForm.tsx` - Profile editor
5. `components/user/RequestForm.tsx` - Submit requests

---

## PHASE 3: SECURITY - SQL INJECTION & XSS PROTECTION 🛡️

### Input Sanitization Utility

**File:** `lib/security.ts`
```typescript
import DOMPurify from 'isomorphic-dompurify'

// XSS Prevention
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  })
}

// SQL Injection Prevention (Supabase handles this, but validate inputs)
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function sanitizeInput(input: string): string {
  return input.trim()
    .replace(/[<>]/g, '') // Remove < >
    .substring(0, 500) // Limit length
}

// Phone validation
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10,11}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}
```

### Validation Schemas với Zod

**File:** `lib/validation.ts`
```typescript
import { z } from 'zod'

export const profileSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().regex(/^[0-9]{10,11}$/),
  address: z.string().max(200).optional(),
  facebook_url: z.string().url().optional(),
})

export const requestSchema = z.object({
  type: z.enum(['restore', 'family']),
  description: z.string().min(10).max(1000),
  images: z.array(z.instanceof(File)).min(1).max(5),
})
```

**Install:**
```bash
npm install zod isomorphic-dompurify
```

---

## PHASE 4: RICH TEXT EDITOR 📝

### TipTap Integration

**Install:**
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image
```

**Component:** `components/editor/RichTextEditor.tsx`
```typescript
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-100 p-2 flex gap-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        {/* More buttons... */}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="prose p-4" />
    </div>
  )
}
```

**Usage trong Admin:**
```typescript
// app/admin/blog/edit/page.tsx
const [content, setContent] = useState('')

<RichTextEditor value={content} onChange={setContent} />
```

---

## PHASE 5: EXTENDED SITE SETTINGS ⚙️

### Database Schema Update

```sql
-- Mở rộng site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS data_type TEXT DEFAULT 'text';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Thêm nhiều settings
INSERT INTO site_settings (key, value, category, description) VALUES
  ('company_phone', '0123 456 789', 'contact', 'Company phone number'),
  ('company_email', 'contact@photoai.com', 'contact', 'Company email'),
  ('company_address', '123 Street, City', 'contact', 'Company address'),
  ('facebook_url', 'https://facebook.com/photoai', 'social', 'Facebook page'),
  ('zalo_url', 'https://zalo.me/photoai', 'social', 'Zalo contact'),
  ('working_hours', '8:00 - 20:00', 'general', 'Working hours'),
  ('banner_text', 'Welcome to PhotoAI!', 'general', 'Homepage banner'),
  ('seo_title', 'Photo Restoration AI', 'seo', 'SEO title'),
  ('seo_description', 'Restore old photos with AI', 'seo', 'SEO description'),
  ('google_analytics_id', '', 'analytics', 'GA tracking ID'),
  ('facebook_pixel_id', '', 'analytics', 'FB pixel ID');
```

### Admin Settings Component

**File:** `components/admin/AdminSettingsExtended.tsx`
```typescript
export default function AdminSettingsExtended() {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [categories, setCategories] = useState<string[]>([])

  // Group settings by category
  const settingsByCategory = useMemo(() => {
    return settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    }, {})
  }, [settings])

  return (
    <div className="space-y-8">
      {Object.entries(settingsByCategory).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-2xl font-bold mb-4 capitalize">
            {category}
          </h3>
          <div className="grid gap-4">
            {items.map(setting => (
              <SettingField
                key={setting.key}
                setting={setting}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## PHASE 6: USER REQUEST SYSTEM 📸

### Database Schema

```sql
-- Cập nhật requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS user_phone TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- RLS Policies
CREATE POLICY "Users can create requests"
  ON requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own requests"
  ON requests FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can see all
CREATE POLICY "Admins can view all requests"
  ON requests FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@photoai.com',
      'duonghoang@gmail.com'
    )
  );
```

### Request Form Component

**File:** `components/user/RequestForm.tsx`
```typescript
export default function RequestForm() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    type: 'restore',
    description: '',
    images: [],
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate
    const validation = requestSchema.safeParse(formData)
    if (!validation.success) {
      // Show errors
      return
    }

    // Upload images to Supabase Storage
    const imageUrls = await uploadImages(formData.images)

    // Create request
    await db.createRequest({
      user_id: user.id,
      type: formData.type,
      description: sanitizeInput(formData.description),
      image_urls: imageUrls,
      user_name: user.user_metadata?.full_name,
      user_email: user.email,
    })

    // Success
    toast.success('Yêu cầu đã được gửi!')
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

---

## PHASE 7: NAVBAR WITH USER DROPDOWN 🎨

### Update Navbar

**File:** `components/layout/Navbar.tsx`
```typescript
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <nav>
      {/* ... existing nav ... */}

      {user ? (
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)}>
            <img
              src={user.user_metadata?.avatar_url || '/default-avatar.png'}
              className="w-10 h-10 rounded-full"
            />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 glassmorphism-strong rounded-xl">
              <Link href="/profile">Thông Tin Cá Nhân</Link>
              <Link href="/requests">Yêu Cầu Của Tôi</Link>
              {isAdmin && (
                <Link href="/admin">Admin Panel</Link>
              )}
              <button onClick={signOut}>Đăng Xuất</button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login">Đăng Nhập</Link>
      )}
    </nav>
  )
}
```

---

## IMPLEMENTATION PRIORITY 🎯

### ĐỘ ƯU TIÊN CAO (Làm ngay)
1. ✅ Fix logout button (DONE)
2. ✅ Admin middleware (DONE)
3. ✅ Admin role system (DONE)
4. 🔄 Email/password auth (IN PROGRESS)
5. 🔄 Security validation (IN PROGRESS)

### ĐỘ ƯU TIÊN TRUNG BÌNH
6. User profile system
7. Request submission system
8. Navbar with user dropdown
9. Extended site settings

### ĐỘ ƯU TIÊN THẤP
10. Rich text editor
11. Analytics integration
12. SEO optimization

---

## INSTALLATION COMMANDS 📦

```bash
# Security & Validation
npm install zod isomorphic-dompurify

# Rich Text Editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image

# UI Components
npm install react-hot-toast react-dropzone

# Auth helpers
npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
```

---

## TESTING CHECKLIST ✅

### Authentication
- [ ] Login với Google works
- [ ] Login với Email/Password works
- [ ] Logout clears session properly
- [ ] Token refresh automatic
- [ ] Admin can access /admin
- [ ] Non-admin cannot access /admin
- [ ] Redirect to /unauthorized works

### Security
- [ ] SQL injection prevented (Supabase RLS)
- [ ] XSS prevented (DOMPurify)
- [ ] Input validation works
- [ ] Email validation works
- [ ] Phone validation works

### User Features
- [ ] User can view profile
- [ ] User can edit profile
- [ ] User can upload avatar
- [ ] User can submit requests
- [ ] User can view own requests

### Admin Features
- [ ] Admin can access all pages
- [ ] Admin can manage settings
- [ ] Admin can use rich text editor
- [ ] Admin can view all requests
- [ ] Admin can update request status

---

## SECURITY BEST PRACTICES 🔒

### 1. Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-side only
ADMIN_EMAILS=admin@photoai.com,duonghoang@gmail.com
```

### 2. RLS Policies
- ✅ Enable for all tables
- ✅ User-specific SELECT policies
- ✅ Admin bypass policies
- ✅ Validate auth.uid() in policies

### 3. Input Validation
- ✅ Validate all user inputs
- ✅ Sanitize HTML content
- ✅ Limit input lengths
- ✅ Use Zod schemas

### 4. File Uploads
- Validate file types
- Limit file sizes
- Scan for malware (optional)
- Use Supabase Storage with policies

---

## NEXT STEPS 🚀

Vì yêu cầu quá nhiều, tôi đề xuất làm từng phase:

**Bây giờ:** Tôi sẽ tiếp tục với:
1. Email/Password Authentication (Phase 1)
2. Security Validation (Phase 3)

**Sau đó:** Bạn chọn phase nào cần ưu tiên tiếp theo.

Bạn muốn tôi tiếp tục với Phase nào trước? 🎯
