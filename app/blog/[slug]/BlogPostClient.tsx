'use client'

import Link from 'next/link'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import TableOfContents from '@/components/blog/TableOfContents'
import { SafeAvatar } from '@/components/ui/SafeImage'
import { BlogPost } from '@/lib/supabase'

interface BlogPostClientProps {
  post: BlogPost
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen gradient-mesh relative overflow-hidden">
      {/* ✅ Pure CSS Animated background */}
      <style jsx>{`
        @keyframes pulse-blog {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
        }
        .pulse-bg {
          animation: pulse-blog 10s ease-in-out infinite;
          will-change: transform, opacity;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>

      {/* Table of Contents */}
      <TableOfContents content={post.content} />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="pulse-bg absolute top-40 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="pulse-bg absolute bottom-40 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <Navbar />

      <article className="pt-32 pb-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <div className="fade-in mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại Blog
            </Link>
          </div>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="fade-in mb-8 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-[400px] object-cover"
              />
            </div>
          )}

          {/* Post Header */}
          <header className="fade-in mb-12 glassmorphism-strong p-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text-alt">{post.title}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.author_name}</span>
              </div>
            </div>

            {post.excerpt && (
              <p className="mt-6 text-xl text-gray-700 leading-relaxed italic border-l-4 border-primary pl-4">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Post Content */}
          <div className="fade-in glassmorphism-strong p-8 md:p-12">
            <div
              className="prose prose-lg max-w-none
                prose-headings:gradient-text-alt
                prose-headings:font-bold
                prose-p:text-gray-700
                prose-p:leading-relaxed
                prose-a:text-primary
                prose-a:no-underline
                hover:prose-a:underline
                prose-strong:text-text
                prose-code:bg-gray-100
                prose-code:px-2
                prose-code:py-1
                prose-code:rounded
                prose-pre:bg-gray-900
                prose-pre:text-gray-100
                prose-img:rounded-xl
                prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Author Info */}
          <div className="fade-in mt-12 glassmorphism-strong p-8">
            <h3 className="text-xl font-bold mb-4 gradient-text">
              Về tác giả
            </h3>
            <div className="flex items-center gap-4">
              <div className="border-4 border-white/50 shadow-lg rounded-full overflow-hidden">
                <SafeAvatar
                  src={post.author_avatar}
                  alt={post.author_name}
                  size="lg"
                />
              </div>
              <div>
                <p className="font-bold text-text text-lg">{post.author_name}</p>
                <p className="text-gray-600">Tác giả</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="fade-in mt-12 flex justify-center">
            <Link href="/blog">
              <button className="btn-glass-primary px-8 py-4 transition-all hover:scale-105 hover:-translate-y-1 active:scale-95">
                <span className="flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Xem tất cả bài viết
                </span>
              </button>
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
