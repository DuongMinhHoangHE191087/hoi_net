/**
 * Gemini AI Client-side Processing (BYOK)
 * Updated to use Gemini 3 Flash Preview - Latest Model (January 2026)
 * 
 * Runs entirely in browser - API key NEVER sent to server
 * Stored in localStorage
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

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
// Constants - Using Gemini 3 Flash Preview
// ============================================

const DEFAULT_MODEL = 'gemini-3-flash-preview'
const STORAGE_KEY = 'gemini_user_api_key'
const STORAGE_VALIDATED_KEY = 'gemini_key_validated'
const STORAGE_MODEL_KEY = 'gemini_preferred_model'

// ============================================
// LocalStorage Management
// ============================================

/**
 * Save API key to localStorage (client-side only)
 */
export function saveApiKey(key: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, key)
    localStorage.setItem(STORAGE_VALIDATED_KEY, 'true')
  } catch (error) {
    console.error('Failed to save API key:', error)
  }
}

/**
 * Get API key from localStorage
 */
export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Remove API key from localStorage
 */
export function removeApiKey(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_VALIDATED_KEY)
  } catch (error) {
    console.error('Failed to remove API key:', error)
  }
}

/**
 * Check if API key exists and was validated
 */
export function hasValidApiKey(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const key = localStorage.getItem(STORAGE_KEY)
    const validated = localStorage.getItem(STORAGE_VALIDATED_KEY)
    return !!key && validated === 'true'
  } catch {
    return false
  }
}

/**
 * Save/Get preferred model
 */
export function savePreferredModel(model: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_MODEL_KEY, model)
}

export function getPreferredModel(): string {
  if (typeof window === 'undefined') return DEFAULT_MODEL
  return localStorage.getItem(STORAGE_MODEL_KEY) || DEFAULT_MODEL
}

// ============================================
// Image Utilities
// ============================================

/**
 * Convert File to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Convert image URL to base64 (client-side)
 */
export async function urlToBase64Client(imageUrl: string): Promise<{
  data: string
  mimeType: string
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0)
      
      // Use high quality JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
      const base64 = dataUrl.split(',')[1]
      
      resolve({
        data: base64,
        mimeType: 'image/jpeg'
      })
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageUrl
  })
}

// ============================================
// Processing Functions - Gemini 3 Flash
// ============================================

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
]

const RESTORATION_PROMPT = `Bạn là chuyên gia khôi phục ảnh AI sử dụng Gemini 3 Flash - model AI tiên tiến nhất.

Phân tích ảnh này và cung cấp:

## 1. ĐÁNH GIÁ TỔNG QUAN
- Mô tả ngắn về nội dung ảnh
- Chất lượng hiện tại (thấp/trung bình/cao)
- Ước tính niên đại của ảnh

## 2. VẤN ĐỀ PHÁT HIỆN
Liệt kê CHI TIẾT tất cả các vấn đề:
- Vết trầy, xước
- Bạc màu, ố vàng  
- Rách, gấp
- Nhiễu, hạt
- Vết ố, bẩn
- Mất chi tiết

## 3. ĐỀ XUẤT KHÔI PHỤC
Hướng dẫn từng bước với độ ưu tiên:
1. [Bước ưu tiên cao nhất]
2. [Bước tiếp theo]
...

## 4. DỰ BÁO KẾT QUẢ
- Mức độ khôi phục khả thi
- Những phần khó phục hồi

Hãy chi tiết, cụ thể và chuyên nghiệp.`

const ANALYSIS_JSON_PROMPT = `Phân tích ảnh này. Trả về JSON duy nhất:
{
  "description": "mô tả ngắn",
  "quality": "low/medium/high",
  "issues": ["danh sách vấn đề"],
  "suggestions": ["danh sách đề xuất"],
  "isBlackAndWhite": true/false,
  "estimatedAge": "ước tính niên đại nếu là ảnh cũ"
}`

const ACTION_PROMPTS: Record<string, string> = {
  restore: RESTORATION_PROMPT,
  
  enhance: `Bạn là chuyên gia nâng cao chất lượng ảnh (Gemini 3 Flash).

Phân tích và đề xuất:
1. Đánh giá độ nét, nhiễu, độ phân giải
2. Vấn đề ánh sáng và phơi sáng
3. Cân bằng trắng và màu sắc
4. Workflow nâng cao chi tiết

Cụ thể và actionable.`,
  
  colorize: `Bạn là chuyên gia tô màu ảnh đen trắng (Gemini 3 Flash).

Phân tích và đề xuất:
1. Xác định niên đại và bối cảnh
2. Bảng màu chi tiết cho từng phần (mã hex)
   - Màu da: #xxx
   - Quần áo: #xxx  
   - Nền: #xxx
3. Lưu ý độ chính xác lịch sử
4. Kỹ thuật tô màu tự nhiên

Chi tiết và chính xác lịch sử.`,
  
  upscale: `Bạn là chuyên gia phóng to ảnh (Gemini 3 Flash).

Phân tích:
1. Đánh giá độ phân giải hiện tại
2. Chi tiết cần bảo toàn
3. Đề xuất tỷ lệ phóng to (2x, 4x, 8x)
4. Vấn đề tiềm ẩn khi phóng to
5. Workflow xử lý sau phóng to`
}

/**
 * Validate API key with Gemini 3 Flash (client-side)
 */
export async function validateApiKeyClient(apiKey: string): Promise<{
  valid: boolean
  error?: string
  model?: string
}> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL })
    
    // Quick validation request
    const result = await model.generateContent('Trả lời: "OK"')
    const response = result.response.text()
    
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
    } else if (error.message?.includes('PERMISSION')) {
      errorMessage = 'API key không có quyền truy cập.'
    } else if (error.message?.includes('fetch')) {
      errorMessage = 'Lỗi kết nối. Vui lòng kiểm tra mạng.'
    } else if (error.message?.includes('404')) {
      // Model not available, try fallback
      errorMessage = 'Model không khả dụng. Thử model khác.'
    }
    
    return { valid: false, error: errorMessage }
  }
}

/**
 * Process image with user's API key using Gemini 3 Flash (BYOK)
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
    
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: modelToUse,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    })
    
    console.log(`[BYOK ${modelToUse}] Processing image...`)
    
    // Convert image to base64
    const imageData = await urlToBase64Client(imageUrl)
    
    // Get prompt
    const prompt = customPrompt || ACTION_PROMPTS[actionType] || RESTORATION_PROMPT
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data
        }
      }
    ])
    
    const description = result.response.text()
    const processingTime = Date.now() - startTime
    
    console.log(`[BYOK ${modelToUse}] Complete in ${processingTime}ms`)
    
    // Try to get quick analysis
    let analysis: ClientImageAnalysis | undefined
    try {
      const analysisResult = await model.generateContent([
        ANALYSIS_JSON_PROMPT,
        {
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data
          }
        }
      ])
      
      const analysisText = analysisResult.response.text()
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      }
    } catch {
      // Analysis is optional
    }
    
    return {
      success: true,
      description,
      analysis,
      processingTime,
      model: modelToUse
    }
  } catch (error: any) {
    console.error('[BYOK] Processing error:', error)
    
    let errorMessage = 'Lỗi xử lý ảnh'
    
    if (error.message?.includes('API_KEY_INVALID')) {
      errorMessage = 'API key không hợp lệ. Vui lòng kiểm tra lại.'
      removeApiKey() // Remove invalid key
    } else if (error.message?.includes('QUOTA')) {
      errorMessage = 'API key đã hết quota. Vui lòng đợi 1 phút hoặc tạo key mới.'
    } else if (error.message?.includes('SAFETY')) {
      errorMessage = 'Ảnh bị chặn bởi bộ lọc an toàn. Vui lòng thử ảnh khác.'
    } else if (error.message?.includes('Failed to load image')) {
      errorMessage = 'Không thể tải ảnh. Vui lòng kiểm tra URL hoặc thử lại.'
    } else if (error.message?.includes('404') || error.message?.includes('not found')) {
      errorMessage = 'Model không khả dụng. Đang thử model khác...'
      // Try fallback to 2.5 flash
      if (modelToUse === DEFAULT_MODEL) {
        return processWithUserKey(imageUrl, actionType, customPrompt, 'gemini-2.5-flash')
      }
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
    
    // Add delay between requests to avoid rate limiting
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
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Mới nhất)' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Ổn định)' },
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
  validateKey: validateApiKeyClient,
  
  // Model preferences
  saveModel: savePreferredModel,
  getModel: getPreferredModel,
  getModels: getAvailableModelsClient,
  
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

