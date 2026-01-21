# Rich Text Editor Setup Guide

## Overview
TipTap-based rich text editor component for blog posts and site settings with full formatting capabilities.

## Features
- ✅ Text formatting (Bold, Italic, Strikethrough, Code)
- ✅ Headings (H1, H2, H3)
- ✅ Lists (Bullet, Numbered)
- ✅ Blockquotes
- ✅ Links (with URL prompt)
- ✅ Images (with URL prompt)
- ✅ Horizontal rules
- ✅ Undo/Redo
- ✅ Placeholder text
- ✅ Read-only mode
- ✅ Responsive toolbar
- ✅ Keyboard shortcuts

## Installation

### 1. Install TipTap Packages

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder --legacy-peer-deps
```

### 2. Add Tailwind Typography

```bash
npm install @tailwindcss/typography --legacy-peer-deps
```

### 3. Update Tailwind Config

Add typography plugin to `tailwind.config.js`:

```javascript
module.exports = {
  // ... existing config
  plugins: [
    require('@tailwindcss/typography'),
    // ... other plugins
  ],
}
```

## Component Usage

### Basic Usage

```typescript
import RichTextEditor from '@/components/editor/RichTextEditor'
import { useState } from 'react'

function MyComponent() {
  const [content, setContent] = useState('<p>Initial content</p>')

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Start writing..."
    />
  )
}
```

### Props

```typescript
interface RichTextEditorProps {
  content: string           // HTML content
  onChange: (content: string) => void  // Callback when content changes
  placeholder?: string      // Placeholder text (default: "Bắt đầu viết...")
  className?: string        // Additional CSS classes
  editable?: boolean        // Enable/disable editing (default: true)
}
```

### Read-Only Mode

```typescript
<RichTextEditor
  content={blogPost.content}
  onChange={() => {}}
  editable={false}
/>
```

## Toolbar Features

### Text Formatting
- **Bold** (Ctrl+B): Make text bold
- **Italic** (Ctrl+I): Make text italic
- **Strikethrough**: Strike through text
- **Code**: Inline code formatting

### Headings
- **H1**: Large heading
- **H2**: Medium heading
- **H3**: Small heading

### Lists
- **Bullet List**: Unordered list
- **Numbered List**: Ordered list
- **Blockquote**: Quote formatting

### Insert
- **Link**: Add/edit hyperlinks (prompts for URL)
- **Image**: Insert images (prompts for URL)
- **Horizontal Rule**: Insert horizontal line

### History
- **Undo** (Ctrl+Z): Undo last change
- **Redo** (Ctrl+Shift+Z): Redo last undone change

## Keyboard Shortcuts

```
Ctrl+B          - Bold
Ctrl+I          - Italic
Ctrl+Z          - Undo
Ctrl+Shift+Z    - Redo
Ctrl+Alt+1      - Heading 1
Ctrl+Alt+2      - Heading 2
Ctrl+Alt+3      - Heading 3
```

## Styling

The editor uses Tailwind's typography plugin for consistent styling:

```html
<div class="prose prose-sm max-w-none">
  <!-- Editor content -->
</div>
```

### Custom Styles

You can customize the editor appearance:

```typescript
<RichTextEditor
  content={content}
  onChange={setContent}
  className="min-h-[400px] border-2 border-primary"
/>
```

## Integration Examples

### Blog Post Editor

```typescript
'use client'

import { useState } from 'react'
import RichTextEditor from '@/components/editor/RichTextEditor'

export default function BlogPostEditor() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: ''
  })

  return (
    <form>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />

      <RichTextEditor
        content={formData.content}
        onChange={(content) => setFormData({ ...formData, content })}
        placeholder="Write your blog post..."
      />

      <button type="submit">Publish</button>
    </form>
  )
}
```

### Site Settings Editor

```typescript
'use client'

import { useState } from 'react'
import RichTextEditor from '@/components/editor/RichTextEditor'

export default function SiteSettingsEditor() {
  const [settings, setSettings] = useState({
    about_us: '<p>About us content...</p>',
    terms: '<p>Terms content...</p>',
    privacy: '<p>Privacy content...</p>'
  })

  return (
    <div>
      <h3>About Us</h3>
      <RichTextEditor
        content={settings.about_us}
        onChange={(content) => setSettings({ ...settings, about_us: content })}
      />

      <h3>Terms of Service</h3>
      <RichTextEditor
        content={settings.terms}
        onChange={(content) => setSettings({ ...settings, terms: content })}
      />
    </div>
  )
}
```

## Image Upload Integration

For uploading images to Supabase Storage instead of using URLs:

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const addImage = async () => {
  // Create file input
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    // Upload to Supabase
    const supabase = createClientComponentClient()
    const fileName = `blog/${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from('user-uploads')
      .upload(fileName, file)

    if (error) {
      console.error('Upload error:', error)
      return
    }

    // Get public URL
    const { data } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(fileName)

    // Insert image in editor
    editor.chain().focus().setImage({ src: data.publicUrl }).run()
  }

  input.click()
}
```

## Advanced Features

### Custom Extensions

Add more TipTap extensions:

```typescript
import { useEditor } from '@tiptap/react'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Color,
  ],
})
```

### Content Sanitization

Sanitize HTML before saving:

```typescript
import { sanitizeHTML } from '@/lib/security'

const handleSave = () => {
  const sanitizedContent = sanitizeHTML(content)
  // Save sanitizedContent to database
}
```

### Word Count

Display word count:

```typescript
const wordCount = editor?.storage.characterCount?.words() || 0

<p className="text-sm text-gray-500">
  {wordCount} words
</p>
```

## Security Considerations

### XSS Prevention

The editor outputs HTML, which must be sanitized:

```typescript
// When displaying content
import { sanitizeHTML } from '@/lib/security'

<div dangerouslySetInnerHTML={{
  __html: sanitizeHTML(content)
}} />
```

### Allowed Tags

Configure DOMPurify to allow editor tags:

```typescript
// In lib/security.ts
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'hr',
      'img', 'div', 'span', 'strike'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id']
  })
}
```

## Troubleshooting

### Issue: Editor not rendering
**Solution:** Ensure TipTap packages are installed and React 18+ is used

### Issue: Toolbar buttons not working
**Solution:** Check that editor instance is not null before calling methods

### Issue: Content not updating
**Solution:** Use controlled component pattern with content and onChange props

### Issue: Styles not applying
**Solution:** Install @tailwindcss/typography and add to tailwind.config.js

### Issue: Images not displaying
**Solution:** Ensure image URLs are accessible and CORS is configured

## Performance Tips

1. **Debounce onChange**: Debounce the onChange callback for better performance:

```typescript
import { useMemo } from 'react'
import debounce from 'lodash/debounce'

const debouncedOnChange = useMemo(
  () => debounce((content: string) => {
    onChange(content)
  }, 300),
  [onChange]
)
```

2. **Lazy Load**: Lazy load the editor component:

```typescript
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(
  () => import('@/components/editor/RichTextEditor'),
  { ssr: false }
)
```

3. **Limit Content**: Set max length for content:

```typescript
const editor = useEditor({
  extensions: [
    StarterKit,
    CharacterCount.configure({
      limit: 10000,
    }),
  ],
})
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

**Status:** ✅ Ready to use
**Last Updated:** 2026-01-16
