import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext'
import LoadingWrapper from '@/components/LoadingWrapper'
import QueryProvider from '@/lib/providers/QueryProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import AbortErrorSuppressor from '@/components/AbortErrorSuppressor'
import { Toaster } from 'react-hot-toast'
import { getAllSiteSettings } from '@/lib/supabase/server-utils'

// This app relies on auth cookies in multiple places; force dynamic rendering
// to prevent build-time prerender errors when reading cookies in server utilities.
export const dynamic = 'force-dynamic'

/**
 * ============================================
 * 📱 VIEWPORT CONFIGURATION (Mobile SEO)
 * ============================================
 * Cấu hình viewport riêng cho mobile-first
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FF6B35' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
}

/**
 * ============================================
 * 🔍 SEO METADATA CONFIGURATION
 * ============================================
 * 
 * CÁC SETTING CẦN CẤU HÌNH TRONG ADMIN PANEL:
 * 
 * 1. site_meta_title        - Tiêu đề trang (50-60 ký tự)
 * 2. site_meta_description  - Mô tả (150-160 ký tự)
 * 3. seo_keywords           - Từ khóa (cách nhau bởi dấu phẩy)
 * 4. site_og_image          - Ảnh Open Graph (1200x630px)
 * 5. site_favicon_url       - Favicon URL
 * 6. site_url               - URL chính của website
 * 7. brand_name             - Tên thương hiệu
 * 8. seo_author             - Tên tác giả
 * 9. seo_robots             - Robots meta (index,follow)
 * 10. seo_canonical         - Canonical URL
 */
export async function generateMetadata(): Promise<Metadata> {
  let settings: Record<string, string> = {}
  try {
    settings = await getAllSiteSettings()
  } catch {
    settings = {}
  }

  // === CORE SEO SETTINGS ===
  const siteName = settings.brand_name || 'Hồi Nét'
  const siteUrl = settings.site_url || 'https://hoinet.tech'
  
  const title = settings.site_meta_title || settings.seo_title || 'Hồi Nét - Khôi phục ảnh cũ bằng AI'
  const description = settings.site_meta_description || settings.seo_description || 'Khôi phục ảnh cũ, làm nét ảnh mờ và ghép ảnh gia đình bằng công nghệ AI tiên tiến. Dịch vụ chuyên nghiệp, nhanh chóng, chất lượng cao.'
  
  // Keywords (comma-separated in settings)
  const keywords = settings.seo_keywords?.split(',').map(k => k.trim()) || [
    'khôi phục ảnh cũ',
    'làm nét ảnh',
    'AI ảnh',
    'ghép ảnh gia đình',
    'phục chế ảnh',
    'tô màu ảnh cũ',
  ]

  // === IMAGES ===
  const ogImage = settings.site_og_image || settings.brand_logo_url || `${siteUrl}/og-image.jpg`
  const faviconUrl = settings.site_favicon_url || settings.site_logo_url || '/favicon.ico'

  // === AUTHOR & ROBOTS ===
  const author = settings.seo_author || 'Hồi Nét Team'
  const robots = settings.seo_robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  const canonical = settings.seo_canonical || siteUrl

  return {
    // === BASIC META ===
    title: {
      default: title,
      template: `%s | ${siteName}`, // Trang con sẽ có format: "Tên trang | Hồi Nét"
    },
    description,
    keywords,
    authors: [{ name: author }],
    creator: siteName,
    publisher: siteName,
    
    // === ROBOTS ===
    robots,
    
    // === CANONICAL ===
    alternates: {
      canonical,
      languages: {
        'vi-VN': canonical,
      },
    },

    // === ICONS ===
    icons: {
      icon: [
        { url: faviconUrl },
        { url: faviconUrl, sizes: '32x32', type: 'image/png' },
        { url: faviconUrl, sizes: '16x16', type: 'image/png' },
      ],
      apple: [{ url: faviconUrl, sizes: '180x180' }],
      shortcut: faviconUrl,
    },

    // === OPEN GRAPH (Facebook, LinkedIn) ===
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      url: siteUrl,
      siteName,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/jpeg',
        },
      ],
    },

    // === TWITTER CARD ===
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: settings.twitter_handle || '@hoinet_tech',
      site: settings.twitter_handle || '@hoinet_tech',
    },

    // === VERIFICATION (thêm vào Admin Settings nếu cần) ===
    verification: {
      google: settings.google_site_verification || undefined,
      yandex: settings.yandex_verification || undefined,
      other: {
        'facebook-domain-verification': settings.facebook_domain_verification || '',
        'msvalidate.01': settings.bing_site_verification || '',
      },
    },

    // === APP LINKS ===
    appleWebApp: {
      capable: true,
      title: siteName,
      statusBarStyle: 'default',
    },

    // === CATEGORY ===
    category: 'technology',
    
    // === FORMAT DETECTION ===
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* ============================================
            🔍 JSON-LD STRUCTURED DATA (SEO Rich Snippets)
            ============================================ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Hồi Nét',
              alternateName: 'HoiNet',
              url: 'https://hoinet.tech',
              logo: 'https://res.cloudinary.com/domuc9uy5/image/upload/v1748449789/logos/logo_qyonhg.png',
              description: 'Hồi Nét - Dịch vụ khôi phục ảnh cũ bằng công nghệ AI tiên tiến',
              foundingDate: '2024',
              founders: [
                {
                  '@type': 'Person',
                  name: 'Duong Minh Hoang',
                },
              ],
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'VN',
                addressLocality: 'Ho Chi Minh City',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                email: 'duongminhhoanginwork@gmail.com',
                availableLanguage: ['Vietnamese', 'English'],
              },
              sameAs: [
                'https://www.facebook.com/fpthoinet',
                'https://twitter.com/hoinet_tech',
              ],
            }),
          }}
        />
        
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Hồi Nét',
              url: 'https://hoinet.tech',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://hoinet.tech/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* Service Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Service',
              serviceType: 'Hồi Nét - Khôi phục ảnh',
              name: 'Hồi Nét - Khôi phục ảnh cũ bằng AI',
              description: 'Hồi Nét - Dịch vụ khôi phục, làm nét và tô màu ảnh cũ sử dụng công nghệ AI tiên tiến',
              provider: {
                '@type': 'Organization',
                name: 'Hồi Nét',
                url: 'https://hoinet.tech',
              },
              areaServed: {
                '@type': 'Country',
                name: 'Vietnam',
              },
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Dịch vụ khôi phục ảnh',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Làm nét ảnh',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Tô màu ảnh cũ',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Ghép ảnh gia đình',
                    },
                  },
                ],
              },
            }),
          }}
        />

        {/* Preload critical fonts for faster LCP */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        
        {/* Prevent FOUC: Apply background immediately */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%);
            min-height: 100vh;
          }
          /* Hide content until CSS loads */
          body { opacity: 1; transition: opacity 0.2s ease-in; }
        `}} />
      </head>
      <body className="antialiased">
        <AbortErrorSuppressor />
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <SiteSettingsProvider>
                {/* ⚡ Loading with dynamic branding from database */}
                <LoadingWrapper>
                  {children}
                </LoadingWrapper>

                {/* 🔔 Toast Notifications - Bottom Right */}
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
                      fontSize: '14px',
                      fontWeight: '500',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                      style: {
                        borderLeft: '4px solid #10B981',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                      style: {
                        borderLeft: '4px solid #EF4444',
                      },
                    },
                    loading: {
                      iconTheme: {
                        primary: '#F59E0B',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </SiteSettingsProvider>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}


