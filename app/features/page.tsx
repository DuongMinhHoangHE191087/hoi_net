// ✅ Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Revalidate every 60 seconds

import { dbServer } from '@/lib/supabase/db-server'
import { getBrandName } from '@/lib/site-metadata'
import FeaturesPageClient from './FeaturesPageClient'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const brandName = await getBrandName()
  return {
    title: `Công Cụ Phục Chế Ảnh AI: Làm Nét, Tô Màu & Ghép Ảnh - ${brandName}`,
    description: `Khám phá bộ công cụ phục chế ảnh chuyên nghiệp của ${brandName} - Nâng cấp độ phân giải, làm rõ ảnh mờ, tô màu ảnh trắng đen và phục dựng ảnh thờ gia đình.`,
  }
}

export default async function FeaturesPage() {
  try {
    const features = await dbServer.getActiveFeatures()
    
    return <FeaturesPageClient features={features} />
  } catch (error) {
    console.error('Error loading features:', error)
    return <FeaturesPageClient features={[]} />
  }
}

