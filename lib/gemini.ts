/**
 * Gemini AI Server-side Client
 * Updated to use @google/genai and Gemini 2.5 Flash
 * 
 * Model: gemini-2.5-flash
 * Features:
 * - Native Image Output (responseModalities: ['TEXT', 'IMAGE'])
 * - 1M+ input tokens
 * - Combined Analysis + Restoration in a single API call
 */

import { GoogleGenAI } from '@google/genai'

// ============================================
// Types
// ============================================

export interface ProcessingOptions {
  model?: 'gemini-2.5-flash' | 'gemini-2.0-flash'
  temperature?: number
  outputFormat?: 'analysis_only' | 'image_and_analysis'
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
}

export interface ProcessedResult {
  success: boolean
  description?: string
  analysis?: ImageAnalysis
  enhancedPrompt?: string
  error?: string
  model?: string
  processingTimeMs?: number
  
  // Native image output
  restoredImageBase64?: string
  restoredImageMimeType?: string
  restoredImageUrl?: string // To be populated after Cloudinary upload
}

// ============================================
// Constants
// ============================================

const DEFAULT_MODEL = 'gemini-2.5-flash'

// Max time to wait for a single Gemini/Imagen call before giving up.
// Without this, a hung upstream request keeps the serverless invocation
// alive until the platform's own (much longer, often minutes) timeout.
const REQUEST_TIMEOUT_MS = 45_000

/**
 * Race a promise against a timeout so a hung Gemini/Imagen call fails fast
 * instead of hanging until the platform's own function timeout.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`))
    }, ms)

    promise.then(
      (value) => { clearTimeout(timer); resolve(value) },
      (error) => { clearTimeout(timer); reject(error) }
    )
  })
}

/**
 * Only transient failures (network hiccups, timeouts, rate limits, upstream
 * 5xx) are worth retrying. A permanently invalid API key or a request the
 * API rejects as malformed will fail identically on every retry - retrying
 * those just burns the retry budget and makes the user wait longer for the
 * same error.
 */
function isRetryableError(error: any): boolean {
  const message: string = error?.message || ''
  const status = error?.status

  if (message.includes('API_KEY_INVALID') || message.includes('INVALID_ARGUMENT')) return false
  if (message.includes('SAFETY') || message.includes('PERMISSION_DENIED')) return false
  if (message.includes('timed out')) return true
  if (message.includes('QUOTA') || status === 429) return true
  if (typeof status === 'number' && status >= 500) return true
  // Unknown/unclassified errors (e.g. network failures) - assume transient
  if (status === undefined && !message.includes('INVALID')) return true

  return false
}

const SAFETY_SETTINGS = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_NONE',
  },
]

// ============================================
// Photo Restoration Prompts (Native Output)
// ============================================

const BASE_PROMPT_INSTRUCTION = `
You are an expert photo restoration AI using Gemini 2.5 Flash.
You must perform TWO tasks simultaneously based on the provided image:

TASK 1: GENERATE AN IMAGE
Create and output a restored, enhanced, or colorized version of the photo according to the user's request.
Always return the best quality image you can generate.

TASK 2: PROVIDE A JSON ANALYSIS
Provide a detailed JSON response analyzing the original image and explaining what you did.
ONLY use this exact JSON format for the text part of your response (do not wrap in markdown code blocks, just raw JSON):
{
  "description": "Brief description of the original image",
  "quality": "low or medium or high",
  "issues": ["list", "of", "detected", "issues"],
  "suggestions": ["list", "of", "restoration", "actions", "performed"],
  "hasNoise": true/false,
  "hasDamage": true/false,
  "isBlackAndWhite": true/false,
  "estimatedAge": "e.g. 1970s"
}
`

const ACTION_SPECIFIC_INSTRUCTIONS: Record<string, string> = {
  restore: `ACTION: RESTORE AND REPAIR
Fix all visible damage (scratches, cracks, fading, tears, stains).
Recover facial features and details. Minimize noise and artifacts.`,
  
  enhance: `ACTION: ENHANCE AND OPTIMIZE
Improve resolution, sharpness, and clarity.
Correct lighting, dynamic range, and color balance. Make it look professional.`,
  
  colorize: `ACTION: COLORIZE
This is a black and white photo. Add historically accurate, natural-looking colors.
Ensure skin tones, clothing, and environment colors look realistic and consistent.`,
  
  upscale: `ACTION: UPSCALE
Substantially increase the resolution and detail of this image without amplifying noise.
Preserve edge sharpness and texture.`,
  
  harmonize: `ACTION: HARMONIZE
Adjust the lighting, color temperature, and contrast so all elements in the image look cohesive.`
}

// ============================================
// Core Functions
// ============================================

/**
 * Initialize Gemini client with API key
 */
function getGeminiClient(apiKey?: string): GoogleGenAI {
  const key = apiKey || process.env.GEMINI_API_KEY
  
  if (!key) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY environment variable.')
  }
  
  return new GoogleGenAI({ apiKey: key })
}

/**
 * Convert image URL to base64
 */
async function urlToBase64(imageUrl: string): Promise<{ data: string; mimeType: string }> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
    
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    return { data: base64, mimeType: contentType }
  } catch (error) {
    console.error('Error converting URL to base64:', error)
    throw new Error('Failed to fetch image from URL')
  }
}

/**
 * Extract JSON from Gemini mixed text response
 */
function extractJsonFromText(text: string): ImageAnalysis | undefined {
  try {
    const match = text.match(/\\{[\\s\\S]*\\}/)
    if (match) {
      return JSON.parse(match[0]) as ImageAnalysis
    }
  } catch (e) {
    console.error('Failed to parse Gemini JSON output', e)
  }
  return undefined
}

/**
 * Process image with Gemini 2.5 Flash for native image generation
 */
export async function processImageWithGemini(
  imageUrl: string,
  actionType: 'restore' | 'enhance' | 'colorize' | 'upscale' | 'harmonize' = 'restore',
  customPrompt?: string,
  options: ProcessingOptions = {},
  apiKey?: string
): Promise<ProcessedResult> {
  const startTime = Date.now()
  let retryCount = 0
  const maxRetries = 2
  
  const modelNameText = options.model || DEFAULT_MODEL
  const modelNameImage = 'imagen-3.0-generate-002'
  const isAnalysisOnly = options.outputFormat === 'analysis_only'
  
  const promptText = `${BASE_PROMPT_INSTRUCTION}\n\n${ACTION_SPECIFIC_INSTRUCTIONS[actionType] || ACTION_SPECIFIC_INSTRUCTIONS.restore}\n\n${customPrompt ? `USER CUSTOM INSTRUCTION: ${customPrompt}` : ''}`
  
  while (retryCount <= maxRetries) {
    try {
      const ai = getGeminiClient(apiKey)
      const imageData = await urlToBase64(imageUrl)
      
      console.log(`[Gemini SDK] Requesting generation | Action: ${actionType} | Modalities: ${isAnalysisOnly ? 'TEXT' : 'TEXT+IMAGE'} | Attempt: ${retryCount + 1}`)
      
      // We run the requests in parallel for max performance
      const promises: Promise<any>[] = []
      
      // 1. Text Analysis Request (Gemini 2.5 Flash)
      promises.push(
        withTimeout(
          ai.models.generateContent({
            model: modelNameText,
            contents: [
              {
                role: 'user',
                parts: [
                  { text: promptText },
                  { inlineData: { data: imageData.data, mimeType: imageData.mimeType } }
                ]
              }
            ],
            config: {
              responseModalities: ['TEXT'],
              temperature: options.temperature || 0.4,
              safetySettings: SAFETY_SETTINGS as any,
            }
          }),
          REQUEST_TIMEOUT_MS,
          'Gemini text analysis'
        )
      )

      // 2. Image Generation Request (Imagen 3)
      if (!isAnalysisOnly) {
         // Create a prompt specifically for imagen
         const imagenPrompt = `An expert high-quality perfectly restored and enhanced version of this image. Focus: ${actionType}. ${customPrompt ? customPrompt : ""}`;
         promises.push(
           withTimeout(
             ai.models.generateContent({
               model: modelNameImage,
               contents: [
                 {
                   role: 'user',
                   parts: [
                     { text: imagenPrompt },
                     { inlineData: { data: imageData.data, mimeType: imageData.mimeType } }
                   ]
                 }
               ],
               config: {
                 responseModalities: ['IMAGE'],
               }
             }),
             REQUEST_TIMEOUT_MS,
             'Imagen 3 generation'
           ).catch((err) => {
             console.warn(`[Gemini SDK] Imagen 3 Generation failed (fallback to text-only analysis): ${err.message}`);
             // Return null to gracefully degrade rather than crashing the text analysis
             return null;
           })
         )
      }
      
      const responses = await Promise.all(promises)
      const textResponse = responses[0]
      const imageResponse = responses.length > 1 ? responses[1] : null
      
      const processingTimeMs = Date.now() - startTime
      
      // Parse Output
      const responseText = textResponse.text || ''
      const analysis = extractJsonFromText(responseText)
      
      let restoredImageBase64: string | undefined
      let restoredImageMimeType: string | undefined
      
      // Find image part from Imagen 3 response
      if (imageResponse && imageResponse.candidates && imageResponse.candidates.length > 0) {
        const parts = imageResponse.candidates[0].content?.parts || []
        const imagePart = parts.find((p: any) => p.inlineData && p.inlineData.data)
        if (imagePart && imagePart.inlineData) {
          restoredImageBase64 = imagePart.inlineData.data
          restoredImageMimeType = imagePart.inlineData.mimeType
        }
      }
      
      console.log(`[Gemini] Processing complete in ${processingTimeMs}ms. HasImage: ${!!restoredImageBase64}`)
      
      return {
        success: true,
        description: responseText,
        enhancedPrompt: promptText,
        analysis,
        model: isAnalysisOnly ? modelNameText : `${modelNameText} + ${modelNameImage}`,
        processingTimeMs,
        restoredImageBase64,
        restoredImageMimeType
      }
      
    } catch (error: any) {
      console.error(`[Gemini] Processing error (Attempt ${retryCount + 1}):`, error)

      if (retryCount < maxRetries && isRetryableError(error)) {
        // Exponential backoff: 1s, 2s
        const delay = Math.pow(2, retryCount) * 1000
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(res => setTimeout(res, delay))
        retryCount++
        continue
      }
      
      let errorMessage = error.message || 'Failed to process image with Gemini'
      
      if (error.message?.includes('API_KEY_INVALID')) {
        errorMessage = 'API key không hợp lệ'
      } else if (error.message?.includes('QUOTA') || error.status === 429) {
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
  
  return { success: false, error: 'Max retries exceeded' }
}

/**
 * Validate API key
 */
export async function validateGeminiKey(apiKey: string): Promise<{
  valid: boolean
  error?: string
  model?: string
}> {
  try {
    const ai = new GoogleGenAI({ apiKey })
    // Simple text-only request
    const response = await withTimeout(
      ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: 'Respond with exactly: "API key validated successfully"'
      }),
      REQUEST_TIMEOUT_MS,
      'Gemini key validation'
    )
    
    return {
      valid: !!response.text?.includes('validated') || !!response.text?.includes('API'),
      model: DEFAULT_MODEL
    }
  } catch (error: any) {
    console.error('API key validation error:', error)
    return {
      valid: false,
      error: error.message?.includes('API_KEY_INVALID') 
        ? 'API key không hợp lệ. Vui lòng kiểm tra lại.' 
        : 'Lỗi xác thực API key.'
    }
  }
}

/**
 * Process multiple images in batch with Gemini 2.5 Flash
 */
export async function processImagesInBatch(
  imageUrls: string[],
  actionType: 'restore' | 'enhance' | 'colorize' | 'upscale' | 'harmonize' = 'restore',
  customPrompt?: string,
  options: ProcessingOptions = {},
  apiKey?: string,
  onProgress?: (current: number, total: number) => void,
  concurrency: number = 2 // Reduced concurrency for image generation due to limits
): Promise<ProcessedResult[]> {
  const results: ProcessedResult[] = new Array(imageUrls.length)
  let completed = 0

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
            results[index] = { success: false, error: error.message }
            completed++
            onProgress?.(completed, imageUrls.length)
          })
      )
    }
    await Promise.all(promises)
  }

  for (let i = 0; i < imageUrls.length; i += concurrency) {
    await processChunk(i, i + concurrency)
    if (i + concurrency < imageUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2s pause between chunks
    }
  }

  return results
}

export const gemini = {
  process: processImageWithGemini,
  processBatch: processImagesInBatch,
  validateKey: validateGeminiKey,
  DEFAULT_MODEL,
}

export default gemini
