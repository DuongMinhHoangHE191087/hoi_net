// Test script for uploading to Cloudinary
import { v2 as cloudinary } from 'cloudinary'

export async function uploadRestoredImage(
  imageBase64: string,
  mimeType: string,
  actionType: string = 'restore'
): Promise<{ url: string; publicId: string }> {
  try {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    })

    const dataURI = `data:${mimeType};base64,${imageBase64}`
    const folderName = `hoi-net/ai-restored/${actionType}`
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folderName,
      resource_type: 'image',
    })

    return {
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload restored image to Cloudinary')
  }
}
