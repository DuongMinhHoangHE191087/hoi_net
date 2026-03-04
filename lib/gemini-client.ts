/**
 * Gemini AI Client-side Processing (BYOK)
 * Updated to use Gemini 2.5 Flash and Native Image Generation
 * 
 * Runs entirely in browser - API key NEVER sent to server
 * Stored in localStorage
 */

import { GoogleGenAI } from '@google/genai'

// ============================================
// Types
// ============================================

export interface ClientProcessingResult {
  success: boolean
  description?: string
  analysis?: ClientImageAnalysis
  error?: string
  processingTime?: number
  model?: string
  restoredImageBase64?: string
  restoredImageMimeType?: string
}

export interface ClientImageAnalysis {
  description: string
  quality: string
  issues: string[]
  suggestions: string[]
  isBlackAndWhite: boolean
  estimatedAge?: string
}

// ============================================
// Constants - Using Gemini 2.5 Flash
// ============================================

const DEFAULT_MODEL = 'gemini-2.5-flash'
const STORAGE_KEY = 'gemini_user_api_key'
const STORAGE_VALIDATED_KEY = 'gemini_key_validated'
const STORAGE_MODEL_KEY = 'gemini_preferred_model'

// ============================================
// LocalStorage Management
// ============================================

// Save API key to localStorage (client-side only)
export function saveApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, key)
    // Mark as unvalidated when saving new key
    localStorage.removeItem(STORAGE_VALIDATED_KEY)
  }
}

// Get API key from localStorage
export function getApiKey(): string | null {
  if (typeof window !== 'undefined') {
    const key = localStorage.getItem(STORAGE_KEY)
    return key && key.trim() !== '' ? key : null
  }
  return null
}

// Remove API key from localStorage
export function removeApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_VALIDATED_KEY)
  }
}

// Check if API key exists and was validated
export function hasValidApiKey(): boolean {
  if (typeof window !== 'undefined') {
    const hasKey = !!localStorage.getItem(STORAGE_KEY)
    const isValidated = localStorage.getItem(STORAGE_VALIDATED_KEY) === 'true'
    return hasKey && isValidated
  }
  return false
}

// Save/Get preferred model
export function savePreferredModel(model: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_MODEL_KEY, model)
  }
}

export function getPreferredModel(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_MODEL_KEY) || DEFAULT_MODEL
  }
  return DEFAULT_MODEL
}

// ============================================
// Image Utilities
// ============================================

// Convert File to base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = error => reject(error)
  })
}

// Convert image URL to base64 (client-side)
export async function urlToBase64Client(imageUrl: string): Promise<{
  data: string
  mimeType: string
}> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`)
    
    const blob = await response.blob()
    const mimeType = blob.type || 'image/jpeg'
    
    const base64Str = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove Data URL prefix
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        } else {
          reject(new Error('Failed to read visual data'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    
    return { data: base64Str, mimeType }
  } catch (error) {
    console.error('Lỗi chuyển ảnh sang base64:', error)
    throw new Error('Không thể tải ảnh. Ảnh có thể bị chặn CORS.')
  }
}

// ============================================
// Processing Functions - Gemini 2.5 Flash
// ============================================

const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
]

const RESTORATION_PROMPT = `
You are an expert photo restoration AI using Gemini 2.5 Flash.
You must perform TWO tasks simultaneously:
TASK 1: GENERATE AN IMAGE
Create a restored/enhanced version.
TASK 2: PROVIDE A JSON ANALYSIS
Provide a JSON response analyzing the image. 
Format exactly like this string (no markdown ticks):
{"description":"...","quality":"low","issues":[],"suggestions":[],"hasNoise":false,"hasDamage":false,"isBlackAndWhite":false}
`

const ANALYSIS_JSON_PROMPT = `Phân tích ảnh này. Trả về JSON duy nhất:
{
  "description": "mô tả ngắn",
  "quality": "low/medium/high",
  "issues": ["danh sách vấn đề"],
  "suggestions": ["danh sách đề xuất"],
  "isBlackAndWhite": false,
  "estimatedAge": "khoảng thời gian"
}`

/**
 * Validate API key with Gemini 2.5 Flash (client-side)
 */
export async function validateApiKeyClient(apiKey: string): Promise<{
  valid: boolean
  error?: string
  model?: string
}> {
  try {
    const genAI = new GoogleGenAI({ apiKey })
    
    // Quick validation request
    const response = await genAI.models.generateContent({
      model: DEFAULT_MODEL,
      contents: 'Trả lời: "OK"'
    })
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_VALIDATED_KEY, 'true')
    }
    
    return { 
      valid: true,
      model: DEFAULT_MODEL 
    }
  } catch (error: any) {
    let errorMessage = 'API key không hợp lệ'
    
    if (error.message?.includes('API_KEY_INVALID')) {
      errorMessage = 'API key không hợp lệ. Vui lòng kiểm tra lại.'
    } else if (error.message?.includes('QUOTA')) {
      errorMessage = 'API key đã hết quota. Vui lòng đợi hoặc tạo key mới.'
    }
    
    return { valid: false, error: errorMessage }
  }
}

/**
 * Process image with user's API key using Gemini 2.5 Flash (BYOK)
 * Runs entirely in browser - key never sent to server
 */
export async function processWithUserKey(
  imageUrl: string,
  actionType: 'restore' | 'enhance' | 'colorize' | 'upscale' = 'restore',
  customPrompt?: string,
  modelOverride?: string
): Promise<ClientProcessingResult> {
  const startTime = Date.now()
  const modelToUse = modelOverride || getPreferredModel()
  
  try {
    const apiKey = getApiKey()
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Chưa có API key. Vui lòng nhập API key của bạn.'
      }
    }
    
    const genAI = new GoogleGenAI({ apiKey })
    
    console.log(`[BYOK ${modelToUse}] Processing image native...`)
    
    // Convert image to base64
    const imageData = await urlToBase64Client(imageUrl)
    
    // Base prompts specific for native output 
    const promptText = `${RESTORATION_PROMPT}

Action requested: ${actionType}
${customPrompt ? `Custom instructions: ${customPrompt}` : ''}`

    // We run the requests in parallel for max performance
    const promises: Promise<any>[] = []
    
    // 1. Text Analysis Request (Gemini 2.5 Flash)
    promises.push(
      genAI.models.generateContent({
        model: modelToUse,
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
          safetySettings: SAFETY_SETTINGS as any,
          temperature: 0.4,
        }
      })
    )

    // 2. Image Generation Request (Imagen 3)
    const imagenPrompt = `An expert high-quality perfectly restored and enhanced version of this image. Focus: ${actionType}. ${customPrompt ? customPrompt : ""}`;
    promises.push(
      genAI.models.generateContent({
        model: 'imagen-3.0-generate-002',
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
      }).catch((err) => {
        console.warn(`[BYOK] Imagen 3 Generation failed (fallback to text-only analysis): ${err.message}`);
        return null; // Return null to gracefully degrade rather than crashing the text analysis
      })
    )
    
    const responses = await Promise.all(promises)
    const textResponse = responses[0]
    const imageResponse = responses[1]
    
    const textOutput = textResponse.text || ''
    const processingTime = Date.now() - startTime
    
    console.log(`[BYOK ${modelToUse}] Complete in ${processingTime}ms`)
    
    let analysis: ClientImageAnalysis | undefined
    try {
      const match = textOutput.match(/\{[\s\S]*\}/)
      if (match) analysis = JSON.parse(match[0])
    } catch(e) {}
    
    let restoredImageBase64: string | undefined
    let restoredImageMimeType: string | undefined
    
    if (imageResponse && imageResponse.candidates && imageResponse.candidates.length > 0) {
      const parts = imageResponse.candidates[0].content?.parts || []
      const imagePart = parts.find((p: any) => p.inlineData && p.inlineData.data)
      if (imagePart && imagePart.inlineData) {
        restoredImageBase64 = imagePart.inlineData.data
        restoredImageMimeType = imagePart.inlineData.mimeType
      }
    }

    return {
      success: true,
      description: textOutput,
      analysis,
      processingTime,
      model: modelToUse,
      restoredImageBase64,
      restoredImageMimeType
    }
  } catch (error: any) {
    console.error('[BYOK] Processing error:', error)
    
    let errorMessage = 'Lỗi xử lý ảnh'
    
    if (error.message?.includes('API_KEY_INVALID')) {
      errorMessage = 'API key không hợp lệ. Vui lòng kiểm tra lại.'
      removeApiKey()
    } else if (error.message?.includes('QUOTA')) {
      errorMessage = 'API key đã hết quota.'
    }
    
    return {
      success: false,
      error: errorMessage,
      processingTime: Date.now() - startTime,
      model: modelToUse
    }
  }
}

/**
 * Process multiple images with user's API key
 */
export async function processMultipleWithUserKey(
  imageUrls: string[],
  actionType: 'restore' | 'enhance' | 'colorize' | 'upscale' = 'restore',
  onProgress?: (current: number, total: number) => void
): Promise<ClientProcessingResult[]> {
  const results: ClientProcessingResult[] = []
  
  for (let i = 0; i < imageUrls.length; i++) {
    onProgress?.(i + 1, imageUrls.length)
    const result = await processWithUserKey(imageUrls[i], actionType)
    results.push(result)
    
    if (i < imageUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}

/**
 * Get available models for BYOK
 */
export function getAvailableModelsClient(): { id: string; name: string }[] {
  return [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Mới nhất)' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Legacy)' }
  ]
}

// ============================================
// Export
// ============================================

export const geminiClient = {
  // Key management
  saveKey: saveApiKey,
  getKey: getApiKey,
  removeKey: removeApiKey,
  hasKey: hasValidApiKey,
  
  // Settings
  saveModel: savePreferredModel,
  getModel: getPreferredModel,
  getAvailableModels: getAvailableModelsClient,
  
  // Validation
  validateKey: validateApiKeyClient,
  
  // Processing
  process: processWithUserKey,
  processMultiple: processMultipleWithUserKey,
  
  // Utilities
  fileToBase64,
  urlToBase64: urlToBase64Client,
  
  // Constants
  DEFAULT_MODEL,
}

export default geminiClient
