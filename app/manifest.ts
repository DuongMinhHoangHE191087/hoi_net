import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hồi Nét - Phục Chế & Khôi Phục Ảnh Cũ',
    short_name: 'Hồi Nét',
    description: 'Dịch vụ phục chế ảnh cũ, làm nét ảnh mờ và tô màu ảnh trắng đen bằng AI',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF5F8',
    theme_color: '#ec4899',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
