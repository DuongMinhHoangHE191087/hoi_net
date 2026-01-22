// ✅ Server Component with Static Generation - CRITICAL for SEO!
import { db } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import BlogPostClient from './BlogPostClient'
import { Metadata } from 'next'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

// ✅ Generate static paths at build time for all blog posts
export async function generateStaticParams() {
  try {
    const { data: posts } = await db.getBlogPosts(true)
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// ✅ Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const post = await db.getBlogPost(params.slug)

    return {
      title: `${post.title} - Photo Restore Blog`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.featured_image ? [post.featured_image] : [],
        type: 'article',
        publishedTime: post.created_at,
        authors: [post.author_name],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: post.featured_image ? [post.featured_image] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Blog Post - Photo Restore',
      description: 'Khôi phục ảnh cũ bằng AI',
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // ✅ Fetch post data on server - Perfect for SEO!
  try {
    const post = await db.getBlogPost(params.slug)
    return <BlogPostClient post={post} />
  } catch (error) {
    console.error('Error loading blog post:', error)
    // Return 404 if post not found
    notFound()
  }
}
