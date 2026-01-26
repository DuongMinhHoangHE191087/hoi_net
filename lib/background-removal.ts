import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal'

export interface BackgroundRemovalOptions {
  progress?: (progress: number) => void
  debug?: boolean
  model?: 'isnet' | 'isnet_fp16' | 'isnet_quint8'
}

/**
 * Client-side Background Removal using @imgly/background-removal
 * Runs entirely in the browser using WebAssembly
 */
export async function removeBackground(
  imageSource: string | File | Blob,
  options: BackgroundRemovalOptions = {}
): Promise<Blob> {
  const config = {
    progress: (key: string, current: number, total: number) => {
      if (options.progress) {
        // Convert to percentage (0-100)
        // The library emits "fetch" and "compute" stages
        const percent = Math.round((current / total) * 100)
        options.progress(percent)
      }
    },
    debug: options.debug || false,
    model: options.model || 'isnet', // isnet is the default model
    publicPath: 'https://static.imgly.com/lib/background-removal-data/'
  }

  try {
    const blob = await imglyRemoveBackground(imageSource, config)
    
    return blob
  } catch (error) {
    console.error('Background removal failed:', error)
    throw new Error('Failed to remove background')
  }
}

/**
 * Convert Blob to Object URL for display
 */
export function blobToUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

/**
 * Convert Blob to File (for uploading)
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: 'image/png' })
}

