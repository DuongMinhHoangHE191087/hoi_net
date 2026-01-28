import type { Metadata } from 'next'
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

export async function generateMetadata(): Promise<Metadata> {
  let settings: Record<string, string> = {}
  try {
    settings = await getAllSiteSettings()
  } catch {
    settings = {}
  }

  const title =
    settings.site_meta_title ||
    settings.seo_title ||
    'Hồi Nét - Khôi phục ảnh cũ bằng AI'

  const description =
    settings.site_meta_description ||
    settings.seo_description ||
    'Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI'

  const faviconUrl =
    settings.site_favicon_url ||
    settings.site_logo_url ||
    settings.brand_logo_url ||
    undefined

  const ogImageUrl = settings.site_og_image || faviconUrl || undefined

  const icons = faviconUrl
    ? {
        icon: [{ url: faviconUrl }],
        apple: [{ url: faviconUrl }],
      }
    : undefined

  return {
    title,
    description,
    icons,
    openGraph: ogImageUrl
      ? {
          title,
          description,
          type: 'website',
          images: [{ url: ogImageUrl }],
        }
      : undefined,
    twitter: ogImageUrl
      ? {
          card: 'summary_large_image',
          title,
          description,
          images: [ogImageUrl],
        }
      : {
          card: 'summary',
          title,
          description,
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


