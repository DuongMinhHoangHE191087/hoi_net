// ✅ Force dynamic rendering for database access
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Revalidate every 60 seconds

import { dbServer } from '@/lib/supabase/db-server'
import { getBrandName } from '@/lib/site-metadata'
import { notFound } from 'next/navigation'
import FeatureDetailClient from './FeatureDetailClient'
import { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const [features, brandName] = await Promise.all([
      dbServer.getActiveFeatures(),
      getBrandName()
    ])
    const feature = features.find(f => f.id === id)
    
    if (!feature) {
      return { title: 'Tính năng không tồn tại' }
    }

    return {
      title: `${feature.title} - ${brandName}`,
      description: feature.description,
    }
  } catch {
    return { title: 'Tính năng' }
  }
}

export default async function FeatureDetailPage({ params }: Props) {
  const { id } = await params
  
  try {
    const [allFeatures] = await Promise.all([
      dbServer.getActiveFeatures()
    ])

    const feature = allFeatures.find(f => f.id === id)
    
    if (!feature) {
      notFound()
    }

    // Get related features (other features except current one)
    const relatedFeatures = allFeatures.filter(f => f.id !== id).slice(0, 3)

    return (
      <FeatureDetailClient 
        feature={feature} 
        relatedFeatures={relatedFeatures}
      />
    )
  } catch (error) {
    console.error('Error loading feature:', error)
    notFound()
  }
}
