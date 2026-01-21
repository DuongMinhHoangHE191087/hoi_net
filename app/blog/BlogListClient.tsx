'use client'

import Link from 'next/link'
import { Calendar, User, ArrowRight, Sparkles } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { BlogPost } from '@/lib/supabase'

interface BlogListClientProps {
  posts: BlogPost[]
}

export default function BlogListClient({ posts }: BlogListClientProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen gradient-mesh relative overflow-hidden">
      {/* ✅ Pure CSS Animated background - NO Framer Motion */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.6;
          }
        }
        @keyframes pulse-slower {
          0%, 100% {
            transform: scale(1.3);
            opacity: 0.6;
          }
          50% {
            transform: scale(1);
            opacity: 0.3;
          }
        }
        .pulse-bg-1 {
          animation: pulse-slow 9s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .pulse-bg-2 {
          animation: pulse-slower 11s ease-in-out infinite;
          will-change: transform, opacity;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
          transform: scale(0);
        }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }
        @keyframes arrow-move {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .arrow-animate {
          animation: arrow-move 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="pulse-bg-1 absolute top-20 left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="pulse-bg-2 absolute bottom-20 right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <Navbar />

      <section className="pt-32 pb-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <div className="scale-in inline-block mb-6">
              <div className="p-4 bg-gradient-primary rounded-3xl shadow-glow animate-glow">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text-alt">Blog</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Chia sẻ kiến thức, kinh nghiệm và cập nhật mới nhất về công nghệ khôi phục ảnh AI
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="glassmorphism-strong p-12 text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Chưa có bài viết nào
              </h3>
              <p className="text-gray-600">
                Hãy quay lại sau để đọc những bài viết mới nhất
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className={`fade-in-up stagger-${Math.min(index + 1, 6)}`}
                  style={{ opacity: 0 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="glassmorphism-strong p-6 h-full flex flex-col relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-2 hover:scale-105">
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

                      {post.featured_image && (
                        <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                      )}

                      <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                        <span className="gradient-text-alt">{post.title}</span>
                      </h2>

                      <p className="text-gray-700 mb-4 flex-grow leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author_name}
                        </div>
                      </div>

                      <div className="flex items-center text-primary font-semibold">
                        Đọc tiếp
                        <div className="arrow-animate ml-2">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Bottom accent line */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
