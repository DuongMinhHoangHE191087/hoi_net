# System Prompts - Quick Start Guide

## 🚀 Setup (5 Minutes)

### 1. Database Setup

Run the SQL schema to create the `system_prompts` table:

```bash
# If using Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of database/system_prompts.sql
# 3. Click "Run"

# If using local PostgreSQL:
psql -U postgres -d your_database -f database/system_prompts.sql
```

This creates:
- ✅ `system_prompts` table
- ✅ 7 pre-configured prompts
- ✅ Automatic timestamp triggers
- ✅ Indexes for performance

### 2. Environment Configuration

Add your Gemini API key to `.env.local`:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

Get your API key at: https://makersuite.google.com/app/apikey

### 3. Verify Installation

Check if the API is working:

```bash
# Using curl
curl http://localhost:3000/api/process-images-v2

# Expected response:
{
  "status": "online",
  "gemini_configured": true,
  "features": {
    "gemini_ai": true,
    "system_prompts": true,
    "custom_prompts": true,
    "advanced_options": true
  }
}
```

## 📝 Admin Interface

### Accessing the Admin Panel

1. Navigate to `/admin`
2. Click on "AI Prompts" tab
3. You'll see all system prompts

### Creating Your First Custom Prompt

1. Click "Tạo Prompt Mới" (Create New Prompt)
2. Fill in the form:

```
Name: my_custom_restore
Display Name: My Custom Restoration
Category: restoration
Description: Custom restoration for vintage photos

System Prompt:
You are a photo restoration expert specializing in vintage photographs.
Focus on preserving the historical authenticity while enhancing quality.
Pay special attention to facial features and important details.

User Prompt Template:
{user_input}
Processing {image_type} photo with {priority} priority.

Parameters (JSON):
{
  "upscale": 2,
  "denoise": true,
  "enhanceFaces": true,
  "colorAccuracy": 0.7
}
```

3. Check "Kích hoạt" (Active)
4. Click "Lưu Prompt" (Save Prompt)

## 🎯 Using System Prompts

### Quick Processing (User Interface)

1. Go to `/requests`
2. Click on any pending request
3. See preset buttons with your system prompts
4. Click any button to process with that prompt

### Custom Processing

1. Click "▶ Tùy Chỉnh Prompt & Tùy Chọn Nâng Cao"
2. Select system prompt from dropdown
3. Enter custom instructions
4. Adjust parameters (upscale, denoise, etc.)
5. Click "Xử Lý Với Tùy Chỉnh"

### API Integration

```typescript
const response = await fetch('/api/process-images-v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    request_id: 'your-request-id',
    images: ['https://example.com/image.jpg'],
    prompt: 'Make this photo look amazing',
    system_prompt_name: 'general_restore',  // Your prompt name
    options: {
      upscale: 2,
      denoise: true
    }
  })
})

const result = await response.json()
console.log(result.processed_images)
```

## 🔍 Testing Your Prompts

### Test Workflow

1. Create a test request with sample images
2. Try different system prompts
3. Compare results
4. Adjust prompt text or parameters
5. Re-test until satisfied

### A/B Testing

```typescript
// Test 1: General restore
await processWithAI(request, 'general_restore')

// Test 2: Advanced restore
await processWithAI(request, 'photo_restore_advanced')

// Compare restored_images in both results
```

## 📊 Default Prompts Overview

| Name | Use Case | Key Features |
|------|----------|--------------|
| `general_restore` | Default for all restoration | Balanced, natural look |
| `photo_restore_advanced` | Historical photos | Detailed analysis, context-aware |
| `colorize_bw` | Black & white photos | Natural colorization |
| `enhance_quality` | Quality boost | Sharpening, detail enhancement |
| `upscale_4k` | High-resolution output | 4x upscaling |
| `portrait_enhance` | Portrait photos | Face-focused enhancement |
| `denoise_photo` | Noisy/grainy images | Noise reduction |

## 🛠️ Common Customizations

### 1. Changing the Default Prompt

In admin panel:
1. Find the prompt you want as default
2. Click "Đặt Làm Mặc Định"
3. Previous default automatically unset

### 2. Creating Category-Specific Prompts

```sql
-- Restoration prompts
category: 'restoration'

-- Enhancement prompts
category: 'enhancement'

-- Colorization prompts
category: 'colorization'

-- Custom category
category: 'vintage-photos'
```

### 3. Adding Processing Parameters

```json
{
  "upscale": 2,           // 1-4x resolution
  "denoise": true,        // Remove noise
  "enhanceFaces": true,   // Face enhancement
  "colorAccuracy": 0.8,   // 0.0 (natural) - 1.0 (precise)
  "customParam": "value"  // Add your own
}
```

### 4. Using Prompt Variables

In User Prompt Template:
```
Restore this {image_type} photo from {era}.
Quality level: {quality}
Special instructions: {user_input}
```

When calling API:
```typescript
prompt_variables: {
  image_type: 'family',
  era: '1960s',
  quality: 'high'
}
```

## 🐛 Troubleshooting

### "No prompts showing"
- ✅ Check: Database connection in Supabase dashboard
- ✅ Verify: `is_active = true` for prompts
- ✅ Reload: Clear cache and refresh page

### "Gemini API not working"
- ✅ Check: `GEMINI_API_KEY` in `.env.local`
- ✅ Verify: API key is valid at https://makersuite.google.com
- ✅ Check: API quota and billing status

### "Prompts not updating"
- ✅ Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- ✅ Check: Browser console for errors
- ✅ Verify: Changes saved in admin panel

### "Processing fails with error"
```typescript
// Check API response
const result = await response.json()
console.log(result.error, result.details)

// Check browser console
// Check server logs
```

## 📖 Next Steps

1. **Read Full Documentation**: `docs/SYSTEM_PROMPTS.md`
2. **Experiment**: Try different prompts and parameters
3. **Monitor**: Check processing results and adjust
4. **Scale**: Add more specialized prompts as needed

## 💡 Pro Tips

1. **Start Simple**: Use default prompts, customize later
2. **Be Specific**: More detailed prompts = better results
3. **Test First**: Try on sample images before production
4. **Version Control**: Keep old prompts inactive instead of deleting
5. **Document**: Add clear descriptions for team members
6. **Monitor Costs**: Gemini API charges per request
7. **Cache Results**: Don't re-process same images

## 🎓 Examples

### Vintage Photo Restoration

```
System Prompt:
You are a vintage photo restoration specialist.
Preserve the nostalgic character while fixing damage.
Maintain period-appropriate colors and tones.

User Prompt Template:
Restore this vintage {image_type} from the {era}.
Damage level: {damage_level}
{user_input}

Parameters:
{
  "upscale": 2,
  "denoise": true,
  "colorAccuracy": 0.6
}
```

### Professional Portrait Enhancement

```
System Prompt:
You are a professional portrait retoucher.
Focus on natural skin tones and flattering light.
Preserve authentic features while removing blemishes.

User Prompt Template:
Enhance this portrait photo for {purpose}.
Style: {style}
{user_input}

Parameters:
{
  "upscale": 3,
  "enhanceFaces": true,
  "denoise": true,
  "colorAccuracy": 0.9
}
```

### Black & White Colorization

```
System Prompt:
You are a photo colorization expert.
Use historically accurate colors based on era and context.
Ensure natural, believable color tones.

User Prompt Template:
Colorize this {era} black and white {image_type}.
Region: {region}
{user_input}

Parameters:
{
  "upscale": 2,
  "colorAccuracy": 0.7
}
```

## 🔗 Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- Full documentation: `docs/SYSTEM_PROMPTS.md`

---

Need help? Check the full documentation or open an issue on GitHub.
