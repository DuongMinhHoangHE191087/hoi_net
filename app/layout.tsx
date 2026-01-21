import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext'
import PageTransition from '@/components/layout/PageTransition'
import PageTransitionLoader from '@/components/PageTransitionLoader'
import TopLoadingBar from '@/components/TopLoadingBar'
import QueryProvider from '@/lib/providers/QueryProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Photo Restoration App',
  description: 'Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
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
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <SiteSettingsProvider>
                {/* ⚡ Lightweight loading indicator - Keep only ONE transition system */}
                <TopLoadingBar />
                {/* Removed PageTransitionLoader and PageTransition - causing triple work on navigation */}
                {children}

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

