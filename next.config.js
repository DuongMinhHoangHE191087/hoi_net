/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build to avoid circular dependency issues
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      '*.supabase.co', // Supabase storage
      '*.supabase.in', // Supabase storage alternative
      'res.cloudinary.com', // Cloudinary
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Webpack configuration for onnxruntime-web
  webpack: (config, { isServer, webpack }) => {
    // Handle onnxruntime-web module resolution issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }

      // Ignore onnxruntime-web in client-side bundles to avoid import.meta issues
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^onnxruntime-web/,
        })
      )
    }

    // Also ignore on server-side
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'onnxruntime-web': 'commonjs onnxruntime-web',
        'onnxruntime-web/webgpu': 'commonjs onnxruntime-web/webgpu',
      })
    }

    return config
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ]
  },

  // Optimize production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
    ],
  },
}

module.exports = nextConfig
