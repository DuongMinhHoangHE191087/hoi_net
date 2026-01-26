import { createHash } from 'crypto'
import { supabase } from './supabase'
import { ProcessedResult } from './gemini'
import { logger } from './logger'

/**
 * AI Analysis Caching System
 * Reduces API costs and latency by caching Gemini results
 */

interface CacheKey {
  imageUrl: string
  prompt?: string
  model: string
  actionType: string
}

/**
 * Generate a unique hash for the cache key
 */
function generateCacheHash(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

/**
 * Retrieve cached result if available
 */
export async function getCachedResult(key: CacheKey): Promise<ProcessedResult | null> {
  const imageHash = generateCacheHash(key.imageUrl)
  const promptHash = key.prompt ? generateCacheHash(key.prompt) : 'default'
  
  try {
    const { data, error } = await supabase
      .from('ai_analysis_cache')
      .select('result')
      .eq('image_hash', imageHash)
      .eq('prompt_hash', promptHash)
      .eq('action_type', key.actionType)
      .eq('model', key.model)
      .single()
      
    if (data && !error) {
      logger.info('Cache HIT', { metadata: { key } })
      
      // Update last accessed time asynchronously
      supabase.from('ai_analysis_cache')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('image_hash', imageHash)
        .eq('prompt_hash', promptHash)
        .then()
        
      return data.result as ProcessedResult
    }
  } catch (err) {
    logger.warn('Cache lookup failed', { error: err })
  }
  
  logger.info('Cache MISS', { metadata: { key } })
  return null
}

/**
 * Save result to cache
 */
export async function cacheResult(key: CacheKey, result: ProcessedResult): Promise<void> {
  if (!result.success) return // Don't cache errors
  
  const imageHash = generateCacheHash(key.imageUrl)
  const promptHash = key.prompt ? generateCacheHash(key.prompt) : 'default'
  
  try {
    const { error } = await supabase
      .from('ai_analysis_cache')
      .upsert({
        image_hash: imageHash,
        prompt_hash: promptHash,
        action_type: key.actionType,
        model: key.model,
        result: result,
        last_accessed_at: new Date().toISOString()
      }, {
        onConflict: 'image_hash, prompt_hash, model, action_type'
      })
      
    if (error) {
      logger.error('Failed to cache result', { error })
    } else {
      logger.info('Result cached successfully')
    }
  } catch (err) {
    logger.error('Cache save error', { error: err })
  }
}

