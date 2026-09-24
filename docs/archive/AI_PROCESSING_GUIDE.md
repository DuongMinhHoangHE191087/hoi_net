# 🤖 AI Quick Processing Feature - Complete Guide

## ✅ What's Been Implemented

### 1. **Fixed Supabase Errors** ✅
- **File:** `app/dashboard/page.tsx`
- **Fix:** Replaced `createClientComponentClient` with `supabase` from `@/lib/supabase`
- **Issue:** `createClientComponentClient is not a function` error

### 2. **Enhanced Requests Page** ✅
- **File:** `app/requests/page.tsx`
- **New Features:**
  - ✅ Back button to dashboard (with hover animation)
  - ✅ AI Quick Processing framework
  - ✅ 3 preset AI prompts (Restore, Enhance, Colorize)
  - ✅ Progress tracking (0% → 100%)
  - ✅ Toast notifications for each stage
  - ✅ Automatic status updates (pending → processing → completed)

### 3. **AI Processing Modal** ✅
- **Location:** Request detail modal
- **Shows when:** Request status is "pending"
- **Features:**
  - 3 AI preset buttons with icons
  - Real-time progress bar
  - Disabled state during processing
  - Smooth animations

### 4. **API Endpoint** ✅
- **File:** `app/api/process-images/route.ts`
- **Methods:** POST, GET
- **Status:** Mock implementation (ready for integration)

---

## 🎯 How It Works

### User Flow:

1. **Navigate to Requests**
   - User clicks "Yêu Cầu Của Tôi" or visits `/requests`
   - See all their requests with status filters

2. **View Request Details**
   - Click "Eye" icon on any request
   - Modal opens with full details

3. **AI Quick Processing** (for pending requests only)
   - See 3 preset options:
     - **Phục Hồi Tiêu Chuẩn** - Standard photo restoration
     - **Nâng Cao Chất Lượng** - Quality enhancement
     - **Tô Màu Tự Động** - Auto colorization

4. **Processing Stages**
   ```
   Stage 1 (20%): Chuẩn bị xử lý ảnh...
   Stage 2 (40%): Đang xử lý ảnh bằng AI...
   Stage 3 (60%): [API processing]
   Stage 4 (80%): Đang lưu kết quả...
   Stage 5 (100%): Xử lý ảnh thành công!
   ```

5. **Results**
   - Request status changes to "completed"
   - Processed images appear in "Ảnh đã xử lý" section
   - Download buttons available

---

## 🔧 Integration Guide

### Replace Mock API with Real AI Service

**File to edit:** `app/api/process-images/route.ts`

#### Option 1: Replicate AI (Recommended)

```bash
npm install replicate
```

```typescript
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const processedImages = await Promise.all(
  images.map(async (imageUrl) => {
    const output = await replicate.run(
      "sczhou/codeformer:7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
      {
        input: {
          image: imageUrl,
          codeformer_fidelity: 0.7,
          upscale: 2
        }
      }
    )
    return output
  })
)
```

**Environment variable:**
```bash
REPLICATE_API_TOKEN=your_token_here
```

#### Option 2: Stability AI

```bash
npm install stability-ai
```

```typescript
import StabilityAI from 'stability-ai'

const stabilityai = new StabilityAI({
  apiKey: process.env.STABILITY_API_KEY
})

const processedImages = await Promise.all(
  images.map(async (imageUrl) => {
    const response = await stabilityai.imageToImage({
      image: imageUrl,
      prompt: prompt,
      strength: 0.75
    })
    return response.artifacts[0].base64
  })
)
```

#### Option 3: Custom ML Model

```typescript
const processedImages = await Promise.all(
  images.map(async (imageUrl) => {
    const response = await fetch('https://your-ml-api.com/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ML_API_KEY}`
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: prompt,
        options: {
          enhance: true,
          denoise: true,
          upscale: 2
        }
      }),
    })

    const data = await response.json()
    return data.processed_image_url
  })
)
```

---

## 📝 AI Preset Prompts

### Current Presets (Editable in `app/requests/page.tsx`)

```typescript
const AI_PRESETS = {
  restore: {
    label: 'Phục Hồi Tiêu Chuẩn',
    prompt: 'Enhance and restore this old photo. Remove scratches, fix colors, improve clarity, and restore faded areas. Maintain the original composition and subjects.',
    icon: Sparkles,
  },
  enhance: {
    label: 'Nâng Cao Chất Lượng',
    prompt: 'Enhance photo quality with AI. Improve sharpness, color balance, and lighting. Remove noise and artifacts while preserving natural look.',
    icon: Sparkles,
  },
  colorize: {
    label: 'Tô Màu Tự Động',
    prompt: 'Colorize this black and white photo naturally. Apply realistic colors based on historical context and common color schemes.',
    icon: Sparkles,
  },
}
```

### Adding More Presets

```typescript
const AI_PRESETS = {
  // ... existing presets ...

  upscale: {
    label: 'Phóng To 4K',
    prompt: 'Upscale image to 4K resolution with AI. Enhance details, sharpen edges, and improve overall quality.',
    icon: Sparkles,
  },

  denoise: {
    label: 'Khử Nhiễu',
    prompt: 'Remove noise and grain from photo. Smooth out artifacts while preserving important details and textures.',
    icon: Sparkles,
  },

  portrait: {
    label: 'Tối Ưu Chân Dung',
    prompt: 'Optimize portrait photo. Enhance facial features, smooth skin, improve lighting, and adjust colors for natural look.',
    icon: Sparkles,
  },
}
```

---

## 🎨 UI Components

### Back Button
```tsx
<Link href="/dashboard">
  <motion.button
    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
    whileHover={{ scale: 1.05, x: -2 }}
    whileTap={{ scale: 0.95 }}
    title="Quay lại Dashboard"
  >
    <ArrowLeft className="w-6 h-6 text-gray-700" />
  </motion.button>
</Link>
```

### AI Processing Buttons
- Glassmorphism style with gradient backgrounds
- Hover effects: scale up + lift
- Disabled during processing
- Icon rotation on hover
- Truncated prompt preview

### Progress Bar
- Animated width transition
- Gradient background
- Percentage display
- Smooth motion with Framer Motion

---

## 🔐 Security & Best Practices

### 1. **User Validation**
```typescript
// Only allow users to process their own requests
.eq('user_id', user?.id)
```

### 2. **Status Management**
- Only "pending" requests can be processed
- Auto-revert to "pending" on error
- Prevent duplicate processing

### 3. **Error Handling**
```typescript
try {
  // Processing logic
} catch (error) {
  // Revert status
  await supabase
    .from('user_requests')
    .update({ status: 'pending' })
    .eq('id', request.id)

  toast.error('Không thể xử lý ảnh. Vui lòng thử lại sau.')
}
```

### 4. **Rate Limiting**
Add to API route:
```typescript
// Check rate limit (example with Upstash Redis)
const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
const rateLimitResult = await ratelimit.limit(identifier)

if (!rateLimitResult.success) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429 }
  )
}
```

---

## 📊 Database Schema

### Request Status Flow
```
pending → processing → completed
         ↓
      rejected (if failed/admin rejected)
```

### Fields Updated During Processing
```typescript
{
  status: 'processing' | 'completed',
  restored_images: string[], // Array of processed image URLs
  completed_at: timestamp,   // ISO string
}
```

---

## 🚀 Testing

### 1. **Test with Mock API**
- Current implementation returns original images with query params
- No external API calls needed
- Simulates 2-second processing time

### 2. **Check Processing Flow**
```
✅ Click AI preset button
✅ See progress bar (20% → 40% → 60% → 80% → 100%)
✅ Toast notifications appear
✅ Status changes to "processing" then "completed"
✅ Processed images appear in modal
✅ Request list auto-refreshes
```

### 3. **Test Error Handling**
- Disconnect internet → Click process
- Should show error toast
- Status should revert to "pending"

---

## 📁 Files Modified/Created

### Modified:
1. ✅ `app/dashboard/page.tsx` - Fixed Supabase import
2. ✅ `app/requests/page.tsx` - Added AI processing + back button

### Created:
1. ✅ `app/api/process-images/route.ts` - API endpoint
2. ✅ `AI_PROCESSING_GUIDE.md` - This documentation

**Total:** 4 files

---

## 🎯 Customer Request Handling Framework

### Current Implementation

**Request Creation Flow:**
```
User → Upload Images → Fill Form → Submit
  ↓
Database: status = 'pending'
  ↓
Admin/User can process with AI presets
  ↓
status = 'processing' → API call → status = 'completed'
```

### Processing Options

1. **Manual Processing (Admin)**
   - Admin views request in admin panel
   - Updates status manually
   - Uploads processed images

2. **AI Quick Processing (User/Admin)**
   - Click preset button
   - Automatic API call
   - Auto-update with results

3. **Custom Processing**
   - User can add custom prompts (future enhancement)
   - Admin can override AI results

---

## 🔮 Future Enhancements

### Recommended Additions

1. **Custom Prompt Input**
   ```typescript
   const [customPrompt, setCustomPrompt] = useState('')

   <textarea
     value={customPrompt}
     onChange={(e) => setCustomPrompt(e.target.value)}
     placeholder="Nhập prompt tùy chỉnh..."
   />
   ```

2. **Batch Processing**
   - Process multiple requests at once
   - Queue system for large batches

3. **Processing History**
   - Track all processing attempts
   - Show before/after comparisons
   - Cost tracking per processing

4. **Advanced Options**
   ```typescript
   interface ProcessingOptions {
     upscale: number // 1x, 2x, 4x
     denoise: boolean
     enhance_faces: boolean
     preserve_grain: boolean
     color_accuracy: number // 0-1
   }
   ```

5. **A/B Testing**
   - Generate multiple versions
   - Let user choose best result

---

## 💰 Cost Estimation

### Replicate AI Pricing (Example)
- CodeFormer model: ~$0.005 per image
- 10 images = $0.05
- 100 images = $0.50
- 1000 images = $5.00

**Recommendation:** Add credit system for users

---

## ❓ FAQ

**Q: Why is it called "Quick Processing"?**
A: Uses preset prompts for instant processing without manual configuration.

**Q: Can users add custom prompts?**
A: Not yet. Easy to add - see "Future Enhancements" section.

**Q: What happens if processing fails?**
A: Status reverts to "pending" and user sees error message.

**Q: Can admin override AI results?**
A: Yes, admin can manually upload different processed images.

**Q: Is there a processing queue?**
A: Not yet. Currently processes one request at a time per user.

---

## 🎉 Summary

✅ **Fixed:** Supabase error in dashboard
✅ **Added:** Back button to requests page
✅ **Created:** AI Quick Processing framework
✅ **Implemented:** 3 preset prompts with icons
✅ **Built:** API endpoint structure (ready for integration)
✅ **Added:** Progress tracking and toast notifications
✅ **Documented:** Complete integration guide

**Next Steps:**
1. Choose AI service (Replicate/Stability/Custom)
2. Add API credentials to `.env.local`
3. Replace mock implementation in `route.ts`
4. Test with real images
5. Monitor costs and performance

---

**Questions or need help with integration?** The framework is ready - just plug in your preferred AI service! 🚀
