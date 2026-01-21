// ✅ Server Component - SEO Optimized
import { db } from '@/lib/supabase'
import BlogListClient from './BlogListClient'

export const metadata = {
  title: 'Blog - Photo Restore AI',
  description: 'Chia sẻ kiến thức, kinh nghiệm và cập nhật mới nhất về công nghệ khôi phục ảnh AI',
}

export default async function BlogPage() {
  // ✅ Fetch blog posts on server - SEO friendly!
  try {
    const posts = await db.getBlogPosts(true)
    return <BlogListClient posts={posts} />
  } catch (error) {
    console.error('Error loading blog posts:', error)
    // Fallback to empty array if database error
    return <BlogListClient posts={[]} />
  }
}
