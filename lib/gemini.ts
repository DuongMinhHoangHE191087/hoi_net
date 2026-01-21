/**
 * Gemini AI Server-side Client
 * Updated to use Gemini 3 Flash Preview - Latest Model (January 2026)
 * 
 * Model: gemini-3-flash-preview
 * Features:
 * - 1M+ input tokens
 * - Supports: Text, Image, Video, Audio, PDF
 * - Thinking mode supported
 * - media_resolution parameter for quality control
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// ============================================
// Types
// ============================================

export interface ProcessingOptions {
  model?: 'gemini-3-flash-preview' | 'gemini-2.5-flash' | 'gemini-2.0-flash'
  temperature?: number
  maxOutputTokens?: number
  mediaResolution?: 'low' | 'medium' | 'high'
}

export interface ProcessedResult {
  success: boolean
  description?: string
  enhancedPrompt?: string
  analysis?: ImageAnalysis
  error?: string
  model?: string
  processingTimeMs?: number
}

export interface ImageAnalysis {
  description: string
  quality: 'low' | 'medium' | 'high'
  issues: string[]
  suggestions: string[]
  hasNoise: boolean
  hasDamage: boolean
  isBlackAndWhite: boolean
  estimatedAge?: string
  detectedObjects?: DetectedObject[]
}

export interface DetectedObject {
  label: string
  confidence: number
  boundingBox: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
}

// ============================================
// Constants - Using Gemini 3 Flash Preview
// ============================================

const DEFAULT_MODEL = 'gemini-2.5-flash-lite' // Free tier: 15 RPM, 1000 RPD

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
]

// ============================================
// Photo Restoration Prompts - Optimized for Gemini 3
// ============================================

const ANALYSIS_PROMPT = `You are an expert photo restoration AI using Gemini 3 Flash.

Analyze this image for photo restoration purposes. Provide a detailed JSON response with:

{
  "description": "Brief description of the image content, subjects, and setting",
  "quality": "low/medium/high - current image quality assessment",
  "issues": ["detailed list of all detected issues: scratches, fading, tears, stains, noise, discoloration, blur, damage"],
  "suggestions": ["specific restoration suggestions with priority order"],
  "hasNoise": true/false,
  "hasDamage": true/false,
  "isBlackAndWhite": true/false,
  "estimatedAge": "estimated age of the photo if it appears old (e.g., '1950s', '1970s')",
  "detectedObjects": [{"label": "object name", "confidence": 0.95}]
}

Be extremely detailed and precise in your analysis. Identify even subtle issues.
ONLY respond with valid JSON, no additional text.`

const RESTORATION_PROMPTS: Record<string, string> = {
  restore: `You are an expert photo restoration specialist using the most advanced AI (Gemini 3 Flash).

Analyze this old/damaged photo comprehensively and provide:

## 1. DAMAGE ASSESSMENT
- List ALL visible damage (scratches, cracks, fading, tears, stains, water damage, mold)
- Rate severity of each issue (1-10)
- Identify areas needing immediate attention

## 2. COLOR ANALYSIS
- Current color state (faded, discolored, original)
- Original color palette estimation
- Skin tone restoration recommendations
- Background color suggestions

## 3. DETAIL RECOVERY
- Facial features that need enhancement
- Text or important details to preserve
- Areas with potential for detail recovery
- Sharpness and clarity improvements needed

## 4. STEP-BY-STEP RESTORATION PLAN
1. [First priority action]
2. [Second priority action]
... (continue with all steps)

## 5. EXPECTED OUTCOME
- Realistic expectations for restoration quality
- Elements that may not be fully recoverable

Be extremely specific and technical. Use professional restoration terminology.`,

  enhance: `You are an expert image enhancement AI (Gemini 3 Flash).

Analyze this photo and provide detailed enhancement recommendations:

## 1. CURRENT QUALITY ASSESSMENT
- Resolution and sharpness analysis
- Noise levels and types
- Dynamic range evaluation

## 2. LIGHTING & EXPOSURE
- Underexposed/overexposed areas
- Shadow detail recovery potential
- Highlight clipping issues
- HDR recommendations

## 3. COLOR OPTIMIZATION
- White balance analysis
- Color cast detection
- Saturation levels
- Color grading suggestions

## 4. SHARPNESS & CLARITY
- Current sharpness level
- Areas benefiting from sharpening
- Clarity enhancement opportunities
- Texture preservation tips

## 5. ENHANCEMENT WORKFLOW
[Provide step-by-step enhancement process]

Be specific and actionable.`,

  colorize: `You are an expert photo colorization AI (Gemini 3 Flash) with deep knowledge of historical accuracy.

Analyze this black and white photo and provide:

## 1. IMAGE CONTEXT
- Era estimation (decade, historical period)
- Location/setting clues
- Subject identification (people, objects, scenery)

## 2. COLOR PALETTE RECOMMENDATIONS

### Skin Tones
- Base skin tone: [hex color]
- Shadows: [hex color]
- Highlights: [hex color]

### Clothing
- [Item]: [color recommendation with hex]
- (list all clothing items)

### Background/Environment
- [Element]: [color with hex]
- (list all elements)

### Hair Colors
- [Subject]: [hair color]

## 3. HISTORICAL ACCURACY NOTES
- Common colors for this era
- Fashion trends of the period
- Environmental considerations

## 4. TECHNICAL COLORIZATION TIPS
- Layer blending recommendations
- Edge handling for color boundaries
- Gradient suggestions for natural look

Be historically accurate and detailed.`,

  upscale: `You are an expert image upscaling AI (Gemini 3 Flash).
  
  Analyze this image for upscaling:
  
  ## 1. CURRENT RESOLUTION ASSESSMENT
  - Estimated current resolution
  - Pixel quality analysis
  - Compression artifacts detected
  
  ## 2. DETAIL PRESERVATION PRIORITIES
  - Facial features (if present)
  - Text readability
  - Fine textures
  - Sharp edges
  
  ## 3. UPSCALING RECOMMENDATIONS
  - Recommended upscale factor (2x, 4x, 8x)
  - Best upscaling algorithm suggestion
  - Pre-processing steps needed
  
  ## 4. POTENTIAL ISSUES
  - Areas that may artifact
  - Details that may be lost
  - Noise amplification concerns
  
  ## 5. POST-UPSCALING WORKFLOW
  [Steps to optimize after upscaling]`,

  harmonize: `You are an expert photo editor AI.
  
  Analyze this composite image (multiple photos merged together) and suggest CSS filters to make the lighting and colors look cohesive and natural.
  
  Respond ONLY with a JSON object containing global filter values:
  
  {
    "brightness": 1.0,   // range 0.5 - 1.5 (default 1.0)
    "contrast": 1.0,     // range 0.5 - 1.5 (default 1.0)
    "saturation": 1.0,   // range 0.0 - 2.0 (default 1.0)
    "temperature": 0,    // range -20 to 20 (default 0)
    "tint": 0,           // range -20 to 20 (default 0)
    "sepia": 0,          // range 0.0 - 1.0
    "blur": 0,           // range 0 - 5 px
    "reason": "Brief explanation of why these adjustments are needed"
  }
  
  Focus on unifying the subjects with the background.`
}

// ============================================
// Core Functions
// ============================================

/**
 * Initialize Gemini client with API key
 */
function getGeminiClient(apiKey?: string): GoogleGenerativeAI {
  const key = apiKey || process.env.GEMINI_API_KEY
  
  if (!key) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY environment variable.')
  }
  
  return new GoogleGenerativeAI(key)
}

/**
 * Convert image URL to base64 for Gemini
 */
async function urlToBase64(imageUrl: string): Promise<{ data: string; mimeType: string }> {
  try {
    const response = await fetch(imageUrl)
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    return {
      data: base64,
      mimeType: contentType
    }
  } catch (error) {
    console.error('Error converting URL to base64:', error)
    throw new Error('Failed to fetch image from URL')
  }
}

/**
 * Analyze image for restoration using Gemini 3 Flash
 */
export async function analyzeImage(
  imageUrl: string,
  apiKey?: string
): Promise<ImageAnalysis> {
  const startTime = Date.now()
  
  try {
    const genAI = getGeminiClient(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: DEFAULT_MODEL,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        temperature: 0.4, // Lower for more consistent analysis
        maxOutputTokens: 4096,
      }
    })
    
    const imageData = await urlToBase64(imageUrl)
    
    console.log(`[Gemini 3 Flash] Analyzing image...`)
    
    const result = await model.generateContent([
      ANALYSIS_PROMPT,
      {
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data
        }
      }
    ])
    
    const response = result.response.text()
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]) as ImageAnalysis
      console.log(`[Gemini 3 Flash] Analysis complete in ${Date.now() - startTime}ms`)
      return analysis
    }
    
    throw new Error('Failed to parse analysis response')
  } catch (error: any) {
    console.error('[Gemini 3 Flash] Image analysis error:', error)
    throw error
  }
}

/**
 * Process image with Gemini 3 Flash for restoration recommendations
 */
export async function processImageWithGemini(
  imageUrl: string,
  actionType: 'restore' | 'enhance' | 'colorize' | 'upscale' | 'harmonize' = 'restore',
  customPrompt?: string,
  options: ProcessingOptions = {},
  apiKey?: string
): Promise<ProcessedResult> {
  const startTime = Date.now()
  
  try {
    const genAI = getGeminiClient(apiKey)
    const modelName = options.model || DEFAULT_MODEL
    
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 8192,
      }
    })
    
    const imageData = await urlToBase64(imageUrl)
    const prompt = customPrompt || RESTORATION_PROMPTS[actionType] || RESTORATION_PROMPTS.restore
    
    console.log(`[${modelName}] Processing image with action: ${actionType}`)
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data
        }
      }
    ])
    
    const responseText = result.response.text()
    const processingTimeMs = Date.now() - startTime
    
    // Also get analysis
    let analysis: ImageAnalysis | undefined
    try {
      analysis = await analyzeImage(imageUrl, apiKey)
    } catch {
      // Analysis is optional
      console.log('[Gemini] Analysis skipped due to error')
    }
    
    console.log(`[${modelName}] Processing complete in ${processingTimeMs}ms`)
    
    return {
      success: true,
      description: responseText,
      enhancedPrompt: prompt,
      analysis,
      model: modelName,
      processingTimeMs
    }
  } catch (error: any) {
    console.error('[Gemini] Processing error:', error)
    
    // Handle specific errors
    let errorMessage = error.message || 'Failed to process image with Gemini'
    
    if (error.message?.includes('API_KEY_INVALID')) {
      errorMessage = 'API key không hợp lệ'
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'Đã hết quota API. Vui lòng đợi hoặc sử dụng key khác.'
    } else if (error.message?.includes('SAFETY')) {
      errorMessage = 'Ảnh bị chặn bởi bộ lọc an toàn. Vui lòng thử ảnh khác.'
    }
    
    return {
      success: false,
      error: errorMessage,
      processingTimeMs: Date.now() - startTime
    }
  }
}

/**
 * Validate API key with Gemini 3 Flash
 */
export async function validateGeminiKey(apiKey: string): Promise<{
  valid: boolean
  error?: string
  model?: string
}> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL })
    
    // Simple test request
    const result = await model.generateContent('Respond with exactly: "API key validated successfully"')
    const response = result.response.text()
    
    return {
      valid: response.includes('validated') || response.includes('API'),
      model: DEFAULT_MODEL
    }
  } catch (error: any) {
    console.error('API key validation error:', error)
    
    let errorMessage = 'Invalid API key'
    if (error.message?.includes('API_KEY_INVALID')) {
      errorMessage = 'API key không hợp lệ. Vui lòng kiểm tra lại.'
    } else if (error.message?.includes('QUOTA')) {
      errorMessage = 'API key đã hết quota. Vui lòng đợi hoặc tạo key mới.'
    } else if (error.message?.includes('PERMISSION')) {
      errorMessage = 'API key không có quyền truy cập Gemini API.'
    }
    
    return {
      valid: false,
      error: errorMessage
    }
  }
}

/**
 * Process multiple images in batch with Gemini 3 Flash
 * Uses parallel processing with concurrency limit for better performance
 */
export async function processImagesInBatch(
  imageUrls: string[],
  actionType: 'restore' | 'enhance' | 'colorize' | 'upscale' | 'harmonize' = 'restore',
  customPrompt?: string,
  options: ProcessingOptions = {},
  apiKey?: string,
  onProgress?: (current: number, total: number) => void,
  concurrency: number = 3 // Process up to 3 images in parallel
): Promise<ProcessedResult[]> {
  const results: ProcessedResult[] = new Array(imageUrls.length)
  let completed = 0

  // Process in chunks for parallel execution with rate limiting
  const processChunk = async (startIndex: number, endIndex: number): Promise<void> => {
    const promises = []

    for (let i = startIndex; i < endIndex && i < imageUrls.length; i++) {
      const index = i
      promises.push(
        processImageWithGemini(imageUrls[index], actionType, customPrompt, options, apiKey)
          .then(result => {
            results[index] = result
            completed++
            onProgress?.(completed, imageUrls.length)
          })
          .catch(error => {
            results[index] = {
              success: false,
              error: error.message || 'Processing failed',
              processingTimeMs: 0
            }
            completed++
            onProgress?.(completed, imageUrls.length)
          })
      )
    }

    await Promise.all(promises)
  }

  // Process all images in parallel chunks
  for (let i = 0; i < imageUrls.length; i += concurrency) {
    await processChunk(i, Math.min(i + concurrency, imageUrls.length))

    // Add delay between chunks to avoid rate limiting
    if (i + concurrency < imageUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return results
}

/**
 * Get available Gemini models
 */
export function getAvailableModels(): { id: string; name: string; description: string }[] {
  return [
    {
      id: 'gemini-3-flash-preview',
      name: 'Gemini 3 Flash (Preview)',
      description: 'Mới nhất - Nhanh, thông minh, 1M+ tokens'
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      description: 'Ổn định - Cân bằng tốc độ và chất lượng'
    },
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      description: 'Legacy - Đã được thử nghiệm kỹ'
    }
  ]
}

// ============================================
// Export
// ============================================

export const gemini = {
  analyze: analyzeImage,
  process: processImageWithGemini,
  processBatch: processImagesInBatch,
  validateKey: validateGeminiKey,
  getModels: getAvailableModels,
  DEFAULT_MODEL,
}

export default gemini
