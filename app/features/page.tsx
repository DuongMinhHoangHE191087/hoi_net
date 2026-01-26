import { db } from '@/lib/supabase'
import { getBrandName } from '@/lib/site-metadata'
import FeaturesPageClient from './FeaturesPageClient'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const brandName = await getBrandName()
  return {
    title: `Tính Năng - ${brandName}`,
    description: `Khám phá tất cả tính năng mạnh mẽ của ${brandName} - Khôi phục ảnh cũ, tăng độ phân giải, ghép ảnh gia đình và nhiều hơn nữa.`,
  }
}

export default async function FeaturesPage() {
  try {
    const features = await db.getActiveFeatures()
    
    return <FeaturesPageClient features={features} />
  } catch (error) {
    console.error('Error loading features:', error)
    return <FeaturesPageClient features={[]} />
  }
}

