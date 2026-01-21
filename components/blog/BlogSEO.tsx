'use client'

import Head from 'next/head'
import { useEffect } from 'react'
import { BlogPost } from '@/lib/supabase'

interface BlogSEOProps {
  post: BlogPost
  url: string
}

export default function BlogSEO({ post, url }: BlogSEOProps) {
  // Extract plain text from HTML content for description
  const getMetaDescription = (html: string): string => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    const text = tempDiv.textContent || tempDiv.innerText || ''
    return text.substring(0, 160).trim() + '...'
  }

  const description = post.excerpt || getMetaDescription(post.content)
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const fullUrl = `${siteUrl}${url}`
  const imageUrl = post.featured_image || `${siteUrl}/og-image.png`

  useEffect(() => {
    // Update document title
    document.title = `${post.title} | Photo Restore Blog`

    // Add JSON-LD structured data
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: description,
      image: imageUrl,
      datePublished: post.created_at,
      dateModified: post.updated_at,
      author: {
        '@type': 'Person',
        name: post.author_name,
        image: post.author_avatar,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Photo Restore',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullUrl,
      },
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(jsonLd)
    document.head.appendChild(script)

    // Update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { property: 'og:title', content: post.title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: imageUrl },
      { property: 'og:url', content: fullUrl },
      { property: 'og:type', content: 'article' },
      { property: 'article:published_time', content: post.created_at },
      { property: 'article:modified_time', content: post.updated_at },
      { property: 'article:author', content: post.author_name },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: post.title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
    ]

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`
      let meta = document.querySelector(selector) as HTMLMetaElement

      if (!meta) {
        meta = document.createElement('meta')
        if (name) meta.name = name
        if (property) meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }

      meta.content = content
    })

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [post, description, fullUrl, imageUrl, siteUrl])

  return null
}
