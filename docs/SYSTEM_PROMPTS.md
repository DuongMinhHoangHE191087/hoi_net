# System Prompts - AI Image Processing Documentation

## Overview

The System Prompts feature provides a flexible, database-driven approach to managing AI image processing prompts for Gemini API integration. This allows administrators to create, edit, and customize AI processing behaviors without code changes.

## Architecture

### Components

1. **Database Layer** (`database/system_prompts.sql`)
   - PostgreSQL table storing system prompts
   - 7 pre-configured prompts for common use cases
   - Triggers for automatic timestamp updates

2. **API Layer** (`lib/supabase.ts`)
   - TypeScript types for type safety
   - 9 CRUD functions for prompt management
   - Prompt builder with variable substitution

3. **Processing API** (`app/api/process-images-v2/route.ts`)
   - Gemini API integration
   - System prompt loading from database
   - Image processing with custom prompts

4. **Admin Interface** (`components/admin/AdminSystemPrompts.tsx`)
   - Full CRUD UI for managing prompts
   - Search and filter functionality
   - Category organization

5. **User Interface** (`app/requests/page.tsx`)
   - Quick processing with preset prompts
   - Custom prompt with system prompt selection
   - Advanced processing options

## Database Schema

### Table: `system_prompts`

```sql
CREATE TABLE system_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,              -- Internal identifier (e.g., "general_restore")
  display_name TEXT NOT NULL,             -- User-facing name (e.g., "General Photo Restoration")
  category TEXT NOT NULL DEFAULT 'general',  -- Organization category
  system_prompt TEXT NOT NULL,            -- Main AI instruction
  user_prompt_template TEXT,              -- Template with {variables}
  description TEXT,                        -- User-facing description
  parameters JSONB DEFAULT '{}',          -- Processing parameters
  is_active BOOLEAN DEFAULT true,         -- Show/hide from users
  is_default BOOLEAN DEFAULT false,       -- Default prompt for API
  display_order INTEGER DEFAULT 0,        -- Sort order in UI
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Default Prompts

1. **general_restore** (Default)
   - General purpose photo restoration
   - Balanced quality and natural look

2. **photo_restore_advanced**
   - Advanced restoration with historical context
   - Detailed analysis and enhancement

3. **colorize_bw**
   - Black & white photo colorization
   - Natural and historically accurate colors

4. **enhance_quality**
   - Quality enhancement and sharpening
   - Detail preservation and upscaling

5. **upscale_4k**
   - 4K upscaling with detail preservation
   - High-resolution output

6. **portrait_enhance**
   - Portrait-specific optimization
   - Face enhancement and skin smoothing

7. **denoise_photo**
   - Noise and grain removal
   - Artifact reduction

## API Functions

### Database Functions (`lib/supabase.ts`)

#### Get Functions
```typescript
// Get all active prompts
await db.getSystemPrompts()

// Get all prompts (including inactive)
await db.getAllSystemPrompts()

// Get specific prompt by name
await db.getSystemPromptByName('general_restore')

// Get prompts by category
await db.getSystemPromptsByCategory('restoration')

// Get default prompt
await db.getDefaultSystemPrompt()
```

#### CRUD Functions
```typescript
// Create new prompt
await db.createSystemPrompt({
  name: 'custom_restore',
  display_name: 'Custom Restoration',
  category: 'restoration',
  system_prompt: 'You are a professional photo restoration AI...',
  user_prompt_template: '{user_input}',
  description: 'Custom restoration with specific settings',
  parameters: { upscale: 2, denoise: true },
  is_active: true,
  is_default: false,
  display_order: 10
})

// Update existing prompt
await db.updateSystemPrompt('prompt-id', {
  display_name: 'Updated Name',
  is_active: false
})

// Delete prompt
await db.deleteSystemPrompt('prompt-id')
```

#### Build Final Prompt
```typescript
const promptData = db.buildAIPrompt(
  systemPrompt,
  'Restore this old family photo',
  {
    image_type: 'family',
    priority: 'high',
    era: '1950s'
  }
)
// Returns:
// {
//   systemPrompt: "You are a professional photo restoration AI...",
//   userPrompt: "Restore this old family photo",
//   parameters: { upscale: 2, denoise: true, ... }
// }
```

## Processing API

### Endpoint: `/api/process-images-v2`

#### POST Request
```typescript
const response = await fetch('/api/process-images-v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    request_id: 'uuid',
    images: ['https://...', 'https://...'],
    prompt: 'Custom user instructions',
    type: 'restore',
    options: {
      upscale: 2,
      denoise: true,
      enhanceFaces: true,
      colorAccuracy: 0.8
    },
    system_prompt_name: 'general_restore',  // Optional, uses default if omitted
    prompt_variables: {
      image_type: 'family',
      priority: 'high'
    }
  })
})
```

#### Response
```json
{
  "success": true,
  "request_id": "uuid",
  "processed_images": ["https://...", "https://..."],
  "details": [
    {
      "original": "https://...",
      "processed": "https://...",
      "analysis": "AI analysis text...",
      "parameters_used": { "upscale": 2, "denoise": true }
    }
  ],
  "system_prompt_used": "general_restore",
  "processing_time": "2s",
  "message": "Images processed successfully with Gemini AI"
}
```

### GET Status Check
```typescript
const response = await fetch('/api/process-images-v2')
// Returns API status and configuration
```

## Admin Interface

### Features

1. **Prompt List**
   - Search by name or description
   - Filter by category
   - Expandable cards with full prompt text
   - Status badges (Active/Inactive, Default)

2. **Create/Edit Form**
   - All prompt fields editable
   - Parameter configuration (JSON)
   - Category selection
   - Display order control

3. **Actions**
   - Copy prompt to clipboard
   - Toggle active/inactive
   - Set as default
   - Delete prompt (with confirmation)

### Access
Navigate to: `/admin` → "AI Prompts" tab

## User Interface

### Quick Processing

Users can select from preset prompts for one-click processing:

```tsx
// Displays all active system prompts as buttons
{systemPrompts.map((prompt) => (
  <button onClick={() => processWithAI(request, prompt.name)}>
    {prompt.display_name}
    <p>{prompt.description}</p>
  </button>
))}
```

### Custom Processing

Advanced users can:
1. Choose a system prompt from dropdown
2. Enter custom user prompt
3. Adjust processing parameters:
   - Upscale (1x-4x)
   - Denoise (on/off)
   - Enhance Faces (on/off)
   - Color Accuracy (0-100%)

## Variable Substitution

### User Prompt Templates

Templates support variable placeholders:

```
Template: "Restore this {image_type} photo from the {era} era. Priority: {priority}"
Variables: { image_type: 'family', era: '1950s', priority: 'high' }
Result: "Restore this family photo from the 1950s era. Priority: high"
```

### Reserved Variables
- `{user_input}` - User's custom prompt
- `{image_type}` - Request type (restore/family)
- Custom variables can be added in API call

## Processing Parameters

### Supported Parameters

```typescript
{
  upscale: number,          // 1-4x resolution multiplier
  denoise: boolean,         // Remove noise and grain
  enhanceFaces: boolean,    // Enhance facial features
  colorAccuracy: number     // 0.0-1.0 (natural to precise)
}
```

### Parameter Application

Parameters from system prompt are merged with options from the request:

```typescript
// System prompt parameters
{ upscale: 2, denoise: true }

// Request options
{ upscale: 4, enhanceFaces: true }

// Final parameters (request overrides)
{ upscale: 4, denoise: true, enhanceFaces: true }
```

## Gemini Integration

### Model Configuration

```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  systemInstruction: promptData.systemPrompt
})
```

### Image Processing

```typescript
const result = await model.generateContent([
  {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64ImageData
    }
  },
  enhancedUserPrompt  // User prompt + parameters
])
```

### Mock Mode

If `GEMINI_API_KEY` is not configured, the API falls back to mock processing:
- Simulates 2s processing time
- Returns original images with timestamp
- Displays warning message

## Best Practices

### Creating System Prompts

1. **Be Specific**: Detailed instructions produce better results
2. **Set Context**: Define the AI's role and expertise
3. **Include Constraints**: Specify what to avoid or preserve
4. **Use Templates**: Add variable placeholders for flexibility

Example:
```
System Prompt:
You are a professional photo restoration specialist with 20 years of experience.
Your expertise includes color correction, damage repair, and detail enhancement.

Focus on:
- Natural, authentic restoration
- Preserving original character
- Removing artifacts while maintaining texture
- Enhancing details without over-processing

Avoid:
- Over-saturation
- Artificial sharpening
- Removing intentional grain
- Changing original composition

User Prompt Template:
{user_input}
Image type: {image_type}
Priority level: {priority}
```

### Organizing Prompts

1. **Categories**: Use meaningful categories (restoration, enhancement, colorization)
2. **Display Order**: Order from most common to specialized
3. **Naming**: Use descriptive names (general_restore vs prompt1)
4. **Descriptions**: Write clear, user-facing descriptions

### Managing Parameters

1. **Defaults**: Set sensible defaults for each prompt type
2. **Constraints**: Document valid ranges
3. **Testing**: Test parameter combinations before enabling
4. **Documentation**: Document what each parameter does

## Troubleshooting

### Common Issues

**Issue**: No prompts showing in user interface
- Check: Prompts must have `is_active = true`
- Verify: `loadSystemPrompts()` is called on component mount
- Check: Database connection is working

**Issue**: Gemini API not processing
- Verify: `GEMINI_API_KEY` is set in `.env.local`
- Check: API key is valid and has quota
- Review: Console logs for error messages

**Issue**: Variables not being replaced
- Verify: Variable names match exactly (case-sensitive)
- Check: Variables are passed in `prompt_variables` object
- Use: `{variable}` syntax in templates

**Issue**: Prompt changes not reflecting
- Clear: Browser cache and reload
- Verify: `updated_at` timestamp in database
- Check: Correct prompt name is being used

## Environment Setup

### Required Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Gemini API
GEMINI_API_KEY=your-gemini-api-key
```

### Database Setup

```bash
# Run the SQL schema
psql -U postgres -d your_database -f database/system_prompts.sql
```

## Future Enhancements

### Planned Features
1. Prompt versioning and history
2. A/B testing different prompts
3. Usage analytics per prompt
4. Prompt templates library
5. Import/export prompts
6. Collaborative prompt editing
7. Prompt performance metrics

### API Improvements
1. Batch processing optimization
2. Progress tracking for long jobs
3. Webhook notifications
4. Cost tracking per prompt
5. Rate limiting per user

## Support

For issues or questions:
- Check the console for detailed error logs
- Review the API response for error details
- Verify database connection and schema
- Test with mock processing first
- Check Gemini API quota and status

## References

- [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
