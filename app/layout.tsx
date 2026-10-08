import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import LoadingWrapper from '@/components/LoadingWrapper'
import QueryProvider from '@/lib/providers/QueryProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import AbortErrorSuppressor from '@/components/AbortErrorSuppressor'
import { Toaster } from 'react-hot-toast'
import { getAllSiteSettings } from '@/lib/supabase/server-utils'
import { COMPANY, SITE_URL, TWITTER_HANDLE, buildOrganizationJsonLd } from '@/lib/company-info'
import { SEO, buildFaqJsonLd, buildServiceJsonLd, organizationCopy } from '@/lib/seo-copy'
import { getRequestLang } from '@/lib/server-lang'

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
  const lang = await getRequestLang()
  const en = lang === 'en'
  let settings: Record<string, string> = {}
  try {
    settings = await getAllSiteSettings()
  } catch {
    settings = {}
  }

  // === CORE SEO SETTINGS ===
  const siteName = settings.brand_name || COMPANY.brandName
  const siteUrl = settings.site_url || SITE_URL
  
  // Site settings trong DB chỉ có tiếng Việt → chỉ dùng cho bản VI; bản EN dùng lib/seo-copy.ts
  const title = en
    ? SEO.title.en
    : settings.site_meta_title || settings.seo_title || SEO.title.vi
  const description = en
    ? SEO.description.en
    : settings.site_meta_description || settings.seo_description || SEO.description.vi

  // Keywords (comma-separated in settings)
  const keywords = en
    ? [...SEO.keywords.en]
    : settings.seo_keywords?.split(',').map(k => k.trim()) || [...SEO.keywords.vi]

  // === IMAGES ===
  const ogImage = settings.site_og_image || settings.brand_logo_url || `${siteUrl}/og-image.jpg`
  const faviconUrl = settings.site_favicon_url || settings.site_logo_url || '/favicon.ico'

  // === AUTHOR & ROBOTS ===
  const author = settings.seo_author || COMPANY.legalName
  const robots = settings.seo_robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  // './' = canonical tự trỏ về chính URL của từng trang (giải theo metadataBase).
  // Nếu đặt canonical cố định ở layout, mọi trang con sẽ bị canonical về trang chủ.
  const canonical = settings.seo_canonical || './'

  return {
    metadataBase: new URL(siteUrl),

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
        // Cùng một URL phục vụ cả hai ngôn ngữ (chọn theo cookie); mặc định là tiếng Anh
        'x-default': canonical,
        en: canonical,
        vi: canonical,
      },
    },

    // === ICONS ===
    icons: {
      icon: [
        { url: faviconUrl || '/favicon.png' },
        { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: [{ url: '/favicon.png', sizes: '180x180' }],
      shortcut: '/favicon.png',
    },

    // === OPEN GRAPH (Facebook, LinkedIn) ===
    openGraph: {
      type: 'website',
      locale: en ? 'en_US' : 'vi_VN',
      alternateLocale: en ? ['vi_VN'] : ['en_US'],
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
      creator: settings.twitter_handle || TWITTER_HANDLE,
      site: settings.twitter_handle || TWITTER_HANDLE,
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const lang = await getRequestLang()

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* ============================================
            🔍 JSON-LD STRUCTURED DATA (SEO Rich Snippets)
            ============================================ */}
        {/* Organization: dữ liệu lấy từ lib/company-info.ts (nguồn duy nhất) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ ...buildOrganizationJsonLd(), ...organizationCopy(lang) }),
          }}
        />

        {/* Website Schema (không khai báo SearchAction vì site chưa có trang /search) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': `${SITE_URL}/#website`,
              name: COMPANY.brandName,
              url: SITE_URL,
              inLanguage: lang === 'en' ? 'en' : 'vi-VN',
              publisher: { '@id': `${SITE_URL}/#organization` },
            }),
          }}
        />

        {/* Service Schema (song ngữ: lib/seo-copy.ts) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildServiceJsonLd(lang)) }}
        />

        {/* FAQ Schema for SEO Rich Snippets (song ngữ: lib/seo-copy.ts) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(lang)) }}
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
        
        {/* Prevent FOUC: Apply background immediately.
            Must match body's bg-gradient-warm utility (tailwind.config.js)
            exactly - this inline tag can win the cascade over that
            utility class, so a different gradient here was overriding
            body's real background with a mismatched color. */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            background: linear-gradient(135deg, #FFF5F8 0%, #FFFBF0 50%, #FFF5F8 100%);
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
               <LanguageProvider initialLang={lang}>
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
               </LanguageProvider>
              </SiteSettingsProvider>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}


