/**
 * Từ điển trang chủ VI/EN.
 *
 * Trang chủ lấy chữ từ bảng site_settings (chỉ có tiếng Việt, do admin nhập). Với tiếng Anh,
 * `LANDING_EN` cung cấp bản dịch theo đúng key; với tiếng Việt vẫn ưu tiên giá trị admin.
 * Nội dung người dùng tự nhập (đánh giá, tiểu sử đội ngũ) giữ nguyên ngôn ngữ gốc.
 */

import type { L } from './i18n'
import type { Feature } from './supabase'

/** Bản tiếng Anh cho từng key trong site_settings của trang chủ */
export const LANDING_EN: Record<string, string> = {
  hero_title: 'Restore & Revive Old Photos',
  hero_subtitle:
    'Repair damaged photos, colorize black-and-white pictures and sharpen blurry images. AI helps you keep family memories vivid and professional.',
  hero_cta_primary_text: 'Get Started',
  hero_cta_secondary_text: 'Learn More',
  about_section_title: 'About Us',
  about_section_subtitle: 'Our mission and vision',
  features_section_title: 'Featured Capabilities',
  features_section_subtitle: 'Discover powerful tools that help you restore and enhance your photos',
  team_section_title: 'Our Team',
  team_section_subtitle: 'The people alongside you',
  testimonials_section_title: 'What People Say',
  testimonials_section_subtitle: 'Feedback from people who have used the service',
  final_cta_title: 'Ready to Restore Your Photos?',
  final_cta_subtitle: 'Join thousands of people who trust us to keep their precious memories alive.',
  final_cta_button_text: 'Sign Up Free',
}

/** Chuỗi giao diện tĩnh của trang chủ và các section của nó */
export const H = {
  heroTagline: { vi: 'Chuyên Nghiệp Bằng AI', en: 'Professionally, with AI' },
  redirecting: { vi: 'Đang chuyển...', en: 'Redirecting...' },
  loading: { vi: 'Đang tải...', en: 'Loading...' },

  statsTitle: { vi: 'Luôn Bên Bạn Mọi Lúc, Mọi Nơi', en: 'Always With You, Anytime, Anywhere' },
  statsHighlight: { vi: ['Mọi Lúc', 'Mọi Nơi'], en: ['Anytime', 'Anywhere'] },
  statsCta: { vi: 'Khám Phá Dịch Vụ Của Chúng Tôi', en: 'Explore Our Services' },
  statsAiModels: { vi: 'Mô Hình AI', en: 'AI Models' },
  statsUsers: { vi: 'Người Dùng Tin Dùng', en: 'Trusted Users' },
  statsPhotos: { vi: 'Ảnh Đã Khôi Phục', en: 'Photos Restored' },
  statsProvinces: { vi: 'Tỉnh, Thành Phố', en: 'Provinces & Cities' },

  testimonialCta: { vi: 'Gửi phản hồi của bạn', en: 'Share your feedback' },
  customer: { vi: 'Khách hàng', en: 'Customer' },

  learnMore: { vi: 'Tìm hiểu thêm', en: 'Learn more' },
  discoverNow: { vi: '✨ Khám phá ngay', en: '✨ Discover now' },
  viewAllFeatures: { vi: 'Xem tất cả tính năng', en: 'View all features' },
  prevSlide: { vi: 'Slide trước', en: 'Previous slide' },
  nextSlide: { vi: 'Slide tiếp theo', en: 'Next slide' },
  goToSlide: { vi: 'Đi đến slide', en: 'Go to slide' },

  verified: { vi: 'Đã xác minh', en: 'Verified' },
  featured: { vi: '⭐ Nổi bật', en: '⭐ Featured' },

  teamUpdatingTitle: { vi: 'Đang cập nhật', en: 'Coming soon' },
  teamUpdatingText: { vi: 'Thông tin đội ngũ sẽ được cập nhật sớm', en: 'Team information will be updated soon' },
  teamTagline: {
    vi: 'Chúng tôi luôn hướng tới sự chuyên nghiệp và hoàn hảo trong mọi sản phẩm.',
    en: 'We strive for professionalism and perfection in everything we build.',
  },

  proofTitle: { vi: 'Được Tin Tưởng Bởi Hàng Ngàn Người Dùng', en: 'Trusted by Thousands of Users' },
  proofPhotos: { vi: 'Ảnh đã xử lý', en: 'Photos processed' },
  proofUsers: { vi: 'Người dùng', en: 'Users' },
  proofSatisfied: { vi: 'Hài lòng', en: 'Satisfied' },
  proofResults: { vi: 'Kết Quả Thực Tế', en: 'Real Results' },
  proofFamily: { vi: 'Phục hồi ảnh gia đình', en: 'Family photo restoration' },
  proofQuality: { vi: 'Nâng cấp chất lượng', en: 'Quality upgrade' },
  badgeSsl: { vi: 'Bảo mật SSL', en: 'SSL security' },
  badgeSslDesc: { vi: 'Dữ liệu được mã hóa', en: 'Data is encrypted' },
  badgeSafe: { vi: 'An toàn dữ liệu', en: 'Data safety' },
  badgeSafeDesc: { vi: 'Không chia sẻ ảnh', en: 'Photos are never shared' },
  badgeFast: { vi: 'Xử lý nhanh', en: 'Fast processing' },
  badgeFastDesc: { vi: 'AI thế hệ mới', en: 'Next-gen AI' },
  beforeLabel: { vi: 'Ảnh Gốc', en: 'Original' },
  afterLabel: { vi: 'Đã Khôi Phục', en: 'Restored' },
} satisfies Record<string, L | { vi: string[]; en: string[] }>

/** Tính năng mặc định tiếng Anh (thay cho danh sách tiếng Việt trong DB khi chọn EN) */
const now = new Date().toISOString()
const feature = (id: string, title: string, description: string, icon: string, order: number): Feature =>
  ({
    id,
    title,
    description,
    icon_type: 'lucide',
    icon_value: icon,
    is_active: true,
    display_order: order,
    created_at: now,
    updated_at: now,
  }) as Feature

export const FEATURES_EN: Feature[] = [
  feature('en-1', 'AI Photo Restoration', 'Advanced AI repairs old, torn and faded photographs and brings family memories back intact.', 'Sparkles', 1),
  feature('en-2', 'Family Composites & Memorial Portraits', 'Compose portraits into a shared family setting or restore memorial portraits with dignity and realism.', 'Users', 2),
  feature('en-3', 'Sharpen & Clarify Blurry Photos', 'Powerful denoising and super-resolution turn blurry images into crisp ones in moments.', 'Wand2', 3),
  feature('en-4', 'Fast & Effortless', 'Upload your photo and let AI do the rest — most results arrive within minutes.', 'Clock', 4),
  feature('en-5', 'High-Quality Output', 'Sharp, natural-looking results that stay true to the original photograph.', 'Award', 5),
]

/** Giá trị / sứ mệnh mặc định tiếng Anh cho khối "About" của trang chủ */
export const VALUES_EN = [
  {
    id: 'en-1',
    title: 'Mission',
    description: 'To deliver value through advanced AI that restores and preserves every family’s precious memories.',
    icon: 'Target',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
  },
  {
    id: 'en-2',
    title: 'Vision',
    description: 'To become Vietnam’s most trusted AI photo-restoration platform, with the best experience for every user.',
    icon: 'Eye',
    gradient: 'from-yellow-500 via-orange-500 to-amber-500',
  },
  {
    id: 'en-3',
    title: 'Core Values',
    description: 'Quality, creativity and dedication — three values that guide everything we do.',
    icon: 'Heart',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
  },
]

export const TESTIMONIALS_EN = [
  { name: 'Mai N.', role: 'Customer', content: 'A wonderful app! It helped me recover precious family photos.', rating: 5, avatar: '👩' },
  { name: 'Hung T.', role: 'Customer', content: 'The restored photos look fantastic — beyond my expectations.', rating: 5, avatar: '👨' },
  { name: 'Hoa L.', role: 'Customer', content: 'Easy to use and fast results. Very happy with the service!', rating: 5, avatar: '👩‍💼' },
]
