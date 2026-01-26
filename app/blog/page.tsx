// ✅ Server Component - SEO Optimized
import { db } from '@/lib/supabase'
import { getBrandName } from '@/lib/site-metadata'
import BlogListClient from './BlogListClient'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const brandName = await getBrandName()
  return {
    title: `Blog - ${brandName}`,
    description: 'Chia sẻ kiến thức, kinh nghiệm và cập nhật mới nhất về công nghệ khôi phục ảnh AI',
  }
}

export default async function BlogPage() {
  // ✅ Fetch blog posts on server - SEO friendly!
  try {
    const { data: posts } = await db.getBlogPosts(true)
    return <BlogListClient posts={posts} />
  } catch (error) {
    console.error('Error loading blog posts:', error)
    // Fallback to empty array if database error
    return <BlogListClient posts={[]} />
  }
}

