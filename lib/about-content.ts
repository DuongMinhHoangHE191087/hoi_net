/**
 * ============================================
 * 📖 ABOUT CONTENT — nội dung song ngữ VI/EN (hardcode)
 * ============================================
 *
 * Toàn bộ nội dung trang "Về Chúng Tôi" nằm ở đây, mỗi đoạn văn bản có dạng
 * { vi, en }. Thông tin định danh công ty (tên, địa chỉ, email...) lấy từ
 * lib/company-info.ts để chỉ có một nguồn sự thật.
 *
 * ⚠️ TẤT CẢ số liệu, giải thưởng, nhân sự bên dưới là [MOCK]:
 *    - Tên giải thưởng và đơn vị trao giải đều là tên giả định, KHÔNG tham chiếu tổ chức thật.
 *    - Nhân sự (trừ nhà sáng lập) là tên giả định.
 *    - Hãy thay bằng dữ liệu thật trước khi chạy production.
 *
 * File này không import React nên dùng được ở cả server lẫn client.
 */

import { COMPANY } from './company-info'

// ============================================
// Types
// ============================================

import type { Lang, L } from './i18n'
export type { Lang, L } from './i18n'

export type Tone = 'pink' | 'blue' | 'green' | 'orange' | 'purple' | 'cyan'

// ============================================
// Nhãn giao diện
// ============================================

export const UI = {
  langName: { vi: 'Tiếng Việt', en: 'English' } satisfies L,
  switchLabel: { vi: 'Chọn ngôn ngữ', en: 'Choose language' } satisfies L,

  overviewTitle: { vi: 'Về Hồi Nét', en: 'About Hoi Net' } satisfies L,
  mission: { vi: 'Sứ mệnh', en: 'Mission' } satisfies L,
  vision: { vi: 'Tầm nhìn', en: 'Vision' } satisfies L,
  nonprofit: { vi: 'Cam kết phi lợi nhuận', en: 'Non-profit commitment' } satisfies L,
  companyInfo: { vi: 'Thông tin công ty', en: 'Company information' } satisfies L,

  storyTitle: { vi: 'Câu Chuyện Của Chúng Tôi', en: 'Our Story' } satisfies L,

  valuesTitle: { vi: 'Giá Trị Cốt Lõi', en: 'Core Values' } satisfies L,
  valuesSub: {
    vi: 'Sáu nguyên tắc định hình cách chúng tôi xây sản phẩm và đối xử với cộng đồng',
    en: 'Six principles that shape how we build our product and treat our community',
  } satisfies L,

  statsTitle: { vi: 'Con Số Nổi Bật', en: 'Key Numbers' } satisfies L,
  statsSub: {
    vi: 'Tăng trưởng thần tốc sau hơn một năm đồng hành cùng các gia đình Việt',
    en: 'Rapid growth after more than a year alongside Vietnamese families',
  } satisfies L,

  growthTitle: { vi: 'Đường Cong Tăng Trưởng', en: 'Growth Curve' } satisfies L,
  growthSub: {
    vi: 'Người dùng hoạt động hằng tháng (nghìn người), từ 09/2025 đến 10/2026',
    en: 'Monthly active users (thousands), from Sep 2025 to Oct 2026',
  } satisfies L,
  growthMau: { vi: 'Người dùng hoạt động / tháng', en: 'Monthly active users' } satisfies L,

  achievementsTitle: { vi: 'Thành Tựu & Ghi Nhận', en: 'Achievements & Recognition' } satisfies L,
  achievementsSub: {
    vi: 'Những dấu mốc ghi nhận nỗ lực của đội ngũ và cộng đồng',
    en: 'Milestones that recognise the effort of our team and community',
  } satisfies L,

  expertiseTitle: { vi: 'Chuyên Môn & Công Nghệ', en: 'Expertise & Technology' } satisfies L,
  expertiseSub: {
    vi: 'Kinh nghiệm tích lũy từ nghiên cứu AI đến vận hành sản phẩm phục vụ hàng chục nghìn người',
    en: 'Experience built from AI research to operating a product used by tens of thousands',
  } satisfies L,
  techStack: { vi: 'Nền tảng công nghệ', en: 'Technology stack' } satisfies L,

  timelineTitle: { vi: 'Hành Trình Phát Triển', en: 'Our Journey' } satisfies L,
  timelineSub: {
    vi: 'Từ ý tưởng tháng 9/2025 đến cộng đồng hàng chục nghìn bức ảnh được hồi sinh',
    en: 'From an idea in September 2025 to a community of tens of thousands of restored photos',
  } satisfies L,
  upcoming: { vi: 'Sắp tới', en: 'Upcoming' } satisfies L,

  roadmapTitle: { vi: 'Lộ Trình 2026 – 2030', en: 'Roadmap 2026 – 2030' } satisfies L,
  roadmapSub: {
    vi: 'Tham vọng trở thành nền tảng phục chế ảnh AI vì cộng đồng lớn nhất Đông Nam Á',
    en: 'Our ambition: become the largest community-driven AI photo restoration platform in Southeast Asia',
  } satisfies L,

  leadershipTitle: { vi: 'Ban Lãnh Đạo', en: 'Leadership' } satisfies L,
  leadershipSub: {
    vi: 'Những người dẫn dắt Hồi Nét từ ngày đầu',
    en: 'The people leading Hoi Net since day one',
  } satisfies L,

  profileTitle: { vi: 'Hồ Sơ Doanh Nghiệp', en: 'Company Profile' } satisfies L,
  profileSub: {
    vi: 'Thông tin song ngữ Việt – Anh dành cho đối tác, nhà tài trợ và báo chí',
    en: 'Bilingual Vietnamese – English information for partners, sponsors and press',
  } satisfies L,
  colItem: { vi: 'Hạng mục', en: 'Item' } satisfies L,
  colVi: { vi: 'Tiếng Việt', en: 'Vietnamese' } satisfies L,
  colEn: { vi: 'Tiếng Anh', en: 'English' } satisfies L,

  ctaTitle: { vi: 'Cùng Hồi Sinh Những Ký Ức', en: 'Let’s Bring Memories Back to Life' } satisfies L,
  ctaSub: {
    vi: 'Thử phục chế một bức ảnh, đồng hành cùng dự án hoặc trở thành một phần của đội ngũ.',
    en: 'Restore a photo, support the project, or become part of our team.',
  } satisfies L,
}

// ============================================
// Nội dung tiếng Anh của thông tin công ty
// (bản tiếng Việt nằm trong COMPANY)
// ============================================

export const COMPANY_EN = {
  tagline: 'Restoring memories, connecting generations',
  shortDescription:
    'Hoi Net is a non-profit project that restores and enhances old photos with AI, helping every Vietnamese family preserve its most precious memories.',
  organizationType: 'A non-profit project of Hoi Net Technology Company Limited',
  founderRole: 'Founder & Project Director',
  workingHours: 'Monday – Friday, 08:00 – 17:30 (GMT+7)',
  responseTime: 'We reply within 24 business hours',
  mission:
    'Use AI to bring old photographs back to life, so every Vietnamese family can keep and pass on its memories to future generations — free for everyday needs.',
  vision:
    'To become the most trusted non-profit AI photo-restoration platform in Vietnam, where every old photograph has a chance to live again.',
  nonprofitNote:
    'Hoi Net operates as a non-profit: core services are free, and infrastructure costs are sustained by community contributions and the parent company.',
  addressFull: 'The Nine Building, No. 9 Pham Van Dong Street, Mai Dich Ward, Cau Giay District, Hanoi, Vietnam',
  businessLicense:
    'Enterprise Reg. No. 0109876543 — first issued on 15/09/2025 by the Hanoi Department of Planning and Investment',
  charterCapital: 'VND 1,000,000,000 (≈ USD 40,000)',
} as const

// ============================================
// Từ khóa nổi bật dưới thẻ Sứ mệnh / Tầm nhìn / Cam kết
// ============================================

export const OVERVIEW_CHIPS: { mission: L[]; vision: L[]; nonprofit: L[] } = {
  mission: [
    { vi: 'Miễn phí cho nhu cầu cơ bản', en: 'Free for everyday needs' },
    { vi: 'Trung thực với bản gốc', en: 'Faithful to the original' },
    { vi: 'Riêng tư là ưu tiên', en: 'Privacy first' },
  ],
  vision: [
    { vi: 'Số 1 Việt Nam', en: '#1 in Vietnam' },
    { vi: 'Đông Nam Á 2028', en: 'Southeast Asia by 2028' },
    { vi: '1 triệu người dùng 2030', en: '1M users by 2030' },
  ],
  nonprofit: [
    { vi: 'Minh bạch đóng góp', en: 'Transparent contributions' },
    { vi: 'Tái đầu tư cho cộng đồng', en: 'Reinvested in the community' },
    { vi: 'Hạ tầng bền vững', en: 'Sustainable infrastructure' },
  ],
}

// ============================================
// Hero
// ============================================

export const HERO = {
  badges: [
    { vi: 'Startup công nghệ tăng trưởng nhanh', en: 'Hyper-growth tech startup' },
    { vi: 'Phi lợi nhuận', en: 'Non-profit' },
    { vi: 'Thành lập 09/2025', en: 'Founded Sep 2025' },
  ] satisfies L[],
  title: { vi: 'Hồi sinh ký ức,', en: 'Restoring memories,' } satisfies L,
  highlight: { vi: 'kết nối các thế hệ', en: 'connecting generations' } satisfies L,
  subtitle: {
    vi: 'Hồi Nét ứng dụng AI để phục chế những bức ảnh cũ hư hỏng, giúp hàng chục nghìn gia đình Việt giữ gìn và trao truyền ký ức — miễn phí cho nhu cầu cơ bản.',
    en: 'Hoi Net uses AI to restore damaged old photographs, helping tens of thousands of Vietnamese families preserve and pass on their memories — free for everyday needs.',
  } satisfies L,
  ctaPrimary: { vi: 'Phục chế ảnh ngay', en: 'Restore a photo now' } satisfies L,
  ctaSecondary: { vi: 'Liên hệ hợp tác', en: 'Partner with us' } satisfies L,
  scroll: { vi: 'Khám phá hành trình', en: 'Explore our journey' } satisfies L,
}

// ============================================
// Câu chuyện thương hiệu
// ============================================

export const STORY = {
  paragraphs: [
    {
      vi: 'Hồi Nét bắt đầu từ một bức ảnh gia đình đã ố vàng, nhàu nát sau nhiều năm cất kỹ trong ngăn tủ. Nhìn gương mặt người thân dần mờ đi, chúng tôi nhận ra: ký ức không chỉ nằm trong đầu — nó nằm trong từng tấm ảnh.',
      en: 'Hoi Net began with a single yellowed family photograph, creased after years in a drawer. Watching a loved one’s face slowly fade, we realised that memories do not live only in our minds — they live in our photographs.',
    },
    {
      vi: 'Tháng 9/2025, một nhóm kỹ sư và nhà thiết kế trẻ tại Hà Nội quyết định biến công nghệ AI thành công cụ hồi sinh những ký ức ấy: đơn giản, tử tế và dành cho tất cả mọi người.',
      en: 'In September 2025, a small team of young engineers and designers in Hanoi decided to turn AI into a tool for bringing those memories back — simple, kind, and open to everyone.',
    },
    {
      vi: 'Hơn một năm sau, hàng chục nghìn gia đình Việt đã đưa ảnh xưa trở về với màu sắc và nụ cười nguyên vẹn. Chúng tôi vẫn giữ lời hứa ban đầu: dịch vụ cơ bản luôn miễn phí, dữ liệu của bạn luôn thuộc về bạn.',
      en: 'More than a year later, tens of thousands of Vietnamese families have seen their old photos return with colour and smiles intact. We still keep our first promise: core services stay free, and your data stays yours.',
    },
  ] satisfies L[],
  quote: {
    vi: 'Một bức ảnh được hồi sinh là một câu chuyện được kể tiếp.',
    en: 'Every restored photograph is a story that gets to be told again.',
  } satisfies L,
}

// ============================================
// Giá trị cốt lõi
// ============================================

export interface ValueItem {
  icon: 'heart' | 'sparkles' | 'shield' | 'rocket' | 'award' | 'users'
  tone: Tone
  title: L
  description: L
}

export const VALUES: ValueItem[] = [
  {
    icon: 'heart',
    tone: 'pink',
    title: { vi: 'Tận tâm với ký ức', en: 'Devoted to memories' },
    description: {
      vi: 'Mỗi bức ảnh là một câu chuyện gia đình. Chúng tôi xử lý từng tấm ảnh bằng sự trân trọng như chính ảnh của mình.',
      en: 'Every photo is a family story. We treat each one with the same care as our own.',
    },
  },
  {
    icon: 'sparkles',
    tone: 'purple',
    title: { vi: 'Sáng tạo không ngừng', en: 'Relentless creativity' },
    description: {
      vi: 'Liên tục thử nghiệm mô hình AI mới để đạt chất lượng phục chế tự nhiên, giữ nguyên thần thái người trong ảnh.',
      en: 'We constantly test new AI models to deliver natural restoration that preserves the soul of every face.',
    },
  },
  {
    icon: 'shield',
    tone: 'blue',
    title: { vi: 'Minh bạch & riêng tư', en: 'Transparent & private' },
    description: {
      vi: 'Ảnh của bạn thuộc về bạn. Chúng tôi minh bạch về cách xử lý dữ liệu và chi tiêu từ nguồn đóng góp.',
      en: 'Your photos belong to you. We are transparent about data handling and how contributions are spent.',
    },
  },
  {
    icon: 'rocket',
    tone: 'orange',
    title: { vi: 'Tham vọng lớn', en: 'Bold ambition' },
    description: {
      vi: 'Nghĩ lớn, làm thông minh: xây dựng nền tảng có thể phục vụ hàng triệu gia đình trong khu vực.',
      en: 'Think big, work smart: build a platform that can serve millions of families across the region.',
    },
  },
  {
    icon: 'award',
    tone: 'green',
    title: { vi: 'Chuyên nghiệp', en: 'Professional' },
    description: {
      vi: 'Quy trình rõ ràng, chất lượng nhất quán, phản hồi nhanh — chuẩn mực của một đội ngũ công nghệ thực thụ.',
      en: 'Clear processes, consistent quality and fast replies — the standard of a real technology team.',
    },
  },
  {
    icon: 'users',
    tone: 'cyan',
    title: { vi: 'Vì cộng đồng', en: 'For the community' },
    description: {
      vi: 'Dịch vụ cơ bản luôn miễn phí. Mỗi đóng góp được tái đầu tư để phục chế thêm nhiều ảnh tư liệu cho cộng đồng.',
      en: 'Core services stay free. Every contribution is reinvested to restore more archival photos for the community.',
    },
  },
]

// ============================================
// Số liệu nổi bật (tính đến 10/2026)
// ============================================

export interface StatItem {
  value: number
  prefix?: string
  suffix?: L
  icon: 'image' | 'users' | 'map' | 'smile' | 'clock' | 'calendar'
  label: L
  description: L
}

const same = (text: string): L => ({ vi: text, en: text })

export const STATS: StatItem[] = [
  {
    value: 128000,
    suffix: same('+'),
    icon: 'image',
    label: { vi: 'Ảnh đã phục chế', en: 'Photos restored' },
    description: { vi: 'Từ ngày ra mắt công khai tháng 2/2026', en: 'Since public launch in Feb 2026' },
  },
  {
    value: 36000,
    suffix: same('+'),
    icon: 'users',
    label: { vi: 'Người dùng', en: 'Users' },
    description: { vi: 'Gia đình và cá nhân tin dùng mỗi tháng', en: 'Families and individuals every month' },
  },
  {
    value: 34,
    suffix: same('/34'),
    icon: 'map',
    label: { vi: 'Tỉnh, thành phố', en: 'Provinces & cities' },
    description: { vi: 'Có người dùng trên khắp cả nước', en: 'With users across the country' },
  },
  {
    value: 98,
    suffix: same('%'),
    icon: 'smile',
    label: { vi: 'Hài lòng', en: 'Satisfaction' },
    description: { vi: 'Theo khảo sát sau mỗi lượt phục chế', en: 'From post-restoration surveys' },
  },
  {
    value: 3,
    prefix: '~',
    suffix: { vi: ' phút', en: ' min' },
    icon: 'clock',
    label: { vi: 'Thời gian xử lý', en: 'Processing time' },
    description: { vi: 'Trung bình cho một bức ảnh', en: 'Average per photo' },
  },
  {
    value: 13,
    suffix: { vi: ' tháng', en: ' months' },
    icon: 'calendar',
    label: { vi: 'Đồng hành cùng bạn', en: 'Months of service' },
    description: { vi: 'Kể từ khi thành lập tháng 9/2025', en: 'Since founding in Sep 2025' },
  },
]

// ============================================
// Đường cong tăng trưởng [MOCK] — MAU (nghìn người)
// ============================================

export interface GrowthPoint {
  /** yyyy-mm */
  month: string
  /** Người dùng hoạt động hằng tháng, đơn vị: nghìn */
  mau: number
}

export const GROWTH: GrowthPoint[] = [
  { month: '2025-09', mau: 0.1 },
  { month: '2025-10', mau: 0.4 },
  { month: '2025-11', mau: 0.9 },
  { month: '2025-12', mau: 1.8 },
  { month: '2026-01', mau: 3.1 },
  { month: '2026-02', mau: 6.5 },
  { month: '2026-03', mau: 10.2 },
  { month: '2026-04', mau: 14.8 },
  { month: '2026-05', mau: 19.5 },
  { month: '2026-06', mau: 24.1 },
  { month: '2026-07', mau: 28.0 },
  { month: '2026-08', mau: 32.4 },
  { month: '2026-09', mau: 34.8 },
  { month: '2026-10', mau: 36.0 },
]

export const GROWTH_HIGHLIGHTS: { value: string; label: L }[] = [
  { value: '×360', label: { vi: 'Tăng trưởng người dùng kể từ tháng đầu', en: 'User growth since the first month' } },
  { value: '+57%', label: { vi: 'Tăng trưởng trung bình mỗi tháng', en: 'Average month-over-month growth' } },
  { value: '62%', label: { vi: 'Người dùng quay lại sau 30 ngày', en: 'Users returning after 30 days' } },
]

// ============================================
// Thành tựu & ghi nhận [MOCK — tên giả định]
// ============================================

export interface Achievement {
  year: number
  tone: Tone
  rank: L
  title: L
  issuer: L
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    year: 2026,
    tone: 'pink',
    rank: { vi: 'Top 10', en: 'Top 10' },
    title: { vi: 'Dự án Công nghệ vì Cộng đồng', en: 'Technology for Community Projects' },
    issuer: { vi: 'Hội đồng Đổi mới Sáng tạo Cộng đồng', en: 'Community Innovation Council' },
  },
  {
    year: 2026,
    tone: 'orange',
    rank: { vi: 'Hạng nhất', en: '1st place' },
    title: { vi: 'Startup Xã hội Tăng trưởng Nhanh nhất', en: 'Fastest-Growing Social Startup' },
    issuer: { vi: 'Giải thưởng Startup Việt Tác động', en: 'Vietnam Impact Startup Awards' },
  },
  {
    year: 2026,
    tone: 'purple',
    rank: { vi: 'Bình chọn', en: 'People’s choice' },
    title: { vi: 'Ứng dụng AI Nhân văn của năm', en: 'Humane AI Application of the Year' },
    issuer: { vi: 'Bình chọn Cộng đồng Công nghệ', en: 'Tech Community Vote' },
  },
  {
    year: 2026,
    tone: 'blue',
    rank: { vi: 'Giải Bạc', en: 'Silver award' },
    title: { vi: 'Sản phẩm AI dành cho Gia đình', en: 'AI Product for Families' },
    issuer: { vi: 'Diễn đàn Sản phẩm Số Việt Nam', en: 'Vietnam Digital Product Forum' },
  },
  {
    year: 2025,
    tone: 'green',
    rank: { vi: 'Xuất sắc', en: 'Outstanding' },
    title: { vi: 'Dự án Khởi nghiệp Tiềm năng', en: 'Promising Startup Project' },
    issuer: { vi: 'Chương trình Khởi nghiệp Sáng tạo Hà Nội', en: 'Hanoi Creative Startup Programme' },
  },
  {
    year: 2026,
    tone: 'cyan',
    rank: { vi: 'Cột mốc', en: 'Milestone' },
    title: { vi: '100.000 bức ảnh được hồi sinh', en: '100,000 photos brought back to life' },
    issuer: { vi: 'Cộng đồng Hồi Nét', en: 'The Hoi Net community' },
  },
]

// ============================================
// Chuyên môn & công nghệ
// ============================================

export const EXPERTISE: { label: L; level: number; tone: Tone }[] = [
  { label: { vi: 'Phục hồi ảnh bằng AI', en: 'AI photo restoration' }, level: 96, tone: 'pink' },
  { label: { vi: 'Nâng cao chi tiết khuôn mặt', en: 'Face enhancement' }, level: 94, tone: 'purple' },
  { label: { vi: 'Tô màu ảnh trắng đen', en: 'B&W colorization' }, level: 92, tone: 'orange' },
  { label: { vi: 'Thị giác máy tính', en: 'Computer vision' }, level: 90, tone: 'blue' },
  { label: { vi: 'Hạ tầng đám mây & MLOps', en: 'Cloud infrastructure & MLOps' }, level: 88, tone: 'cyan' },
  { label: { vi: 'Vận hành dự án cộng đồng', en: 'Community & non-profit operations' }, level: 85, tone: 'green' },
]

export const EXPERIENCE_STATS: { value: number; suffix?: string; label: L }[] = [
  { value: 42, label: { vi: 'Thành viên', en: 'Team members' } },
  { value: 15, suffix: '+', label: { vi: 'Chuyên gia AI & thị giác máy tính', en: 'AI & computer-vision experts' } },
  { value: 60, suffix: '+', label: { vi: 'Năm kinh nghiệm cộng gộp', en: 'Combined years of experience' } },
  { value: 24, suffix: '/7', label: { vi: 'Hệ thống giám sát liên tục', en: 'Continuous system monitoring' } },
]

/** Công nghệ thực tế đang dùng trong repo (xem package.json) */
export const TECH_STACK = [
  'Next.js',
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Supabase',
  'PostgreSQL',
  'Google Gemini',
  'ONNX Runtime',
  'Cloudinary',
  'Redis',
  'Three.js',
  'Framer Motion',
]

// ============================================
// Hành trình phát triển [MOCK] — 09/2025 → nay (10/2026)
// ============================================

export interface Milestone {
  /** yyyy-mm */
  date: string
  title: L
  description: L
  upcoming?: boolean
}

export const MILESTONES: Milestone[] = [
  {
    date: '2025-09',
    title: { vi: 'Thành lập', en: 'Company founded' },
    description: {
      vi: 'Công ty TNHH Công nghệ Hồi Nét được thành lập tại Hà Nội và khởi động dự án Hồi Nét — dự án phi lợi nhuận phục chế ảnh cũ bằng AI.',
      en: 'Hoi Net Technology Co., Ltd. is founded in Hanoi and launches Hoi Net — a non-profit AI photo-restoration project.',
    },
  },
  {
    date: '2025-10',
    title: { vi: 'Nghiên cứu & thử nghiệm', en: 'Research & experiments' },
    description: {
      vi: 'Xây dựng bộ ảnh mẫu, thử nghiệm và so sánh các mô hình AI cho bài toán khử nhiễu, làm nét và phục hồi chi tiết khuôn mặt.',
      en: 'Built a sample dataset and benchmarked AI models for denoising, sharpening and face-detail recovery.',
    },
  },
  {
    date: '2025-12',
    title: { vi: 'Closed beta', en: 'Closed beta' },
    description: {
      vi: 'Mở thử nghiệm kín cho 200 người dùng đầu tiên, bổ sung tính năng tô màu ảnh trắng đen dựa trên phản hồi thực tế.',
      en: 'Opened a closed beta to the first 200 users and added B&W colorization based on real feedback.',
    },
  },
  {
    date: '2026-02',
    title: { vi: 'Ra mắt công khai', en: 'Public launch' },
    description: {
      vi: 'Chính thức ra mắt website hoinet.tech với dịch vụ phục chế, làm nét và tô màu ảnh cũ miễn phí cho mọi người.',
      en: 'Officially launched hoinet.tech with free photo restoration, sharpening and colorization for everyone.',
    },
  },
  {
    date: '2026-04',
    title: { vi: 'Ghép ảnh gia đình & Studio', en: 'Family collage & Studio' },
    description: {
      vi: 'Thêm tính năng ghép ảnh gia đình và Studio chỉnh sửa trực tuyến, tách nền ngay trên trình duyệt.',
      en: 'Added family photo compositing and an online Studio with in-browser background removal.',
    },
  },
  {
    date: '2026-06',
    title: { vi: 'Mốc 25.000 ảnh', en: '25,000 photos' },
    description: {
      vi: 'Hoàn thành phục chế hơn 25.000 bức ảnh; nâng cấp hàng đợi xử lý để rút ngắn thời gian chờ xuống còn vài phút.',
      en: 'Restored more than 25,000 photos and upgraded the processing queue to cut waiting time to minutes.',
    },
  },
  {
    date: '2026-08',
    title: { vi: 'Cộng đồng đóng góp', en: 'Community contributions' },
    description: {
      vi: 'Ra mắt trang đóng góp minh bạch để duy trì chi phí hạ tầng, giữ dịch vụ cơ bản luôn miễn phí.',
      en: 'Launched a transparent contribution page to sustain infrastructure costs and keep core services free.',
    },
  },
  {
    date: '2026-09',
    title: { vi: 'Tròn 1 năm hoạt động', en: 'One year milestone' },
    description: {
      vi: 'Vượt mốc 100.000 ảnh phục chế và 30.000 người dùng; đội ngũ mở rộng thêm các vị trí kỹ thuật và vận hành tại Hà Nội.',
      en: 'Passed 100,000 restored photos and 30,000 users; the Hanoi team grew with new engineering and operations roles.',
    },
  },
  {
    date: '2026-12',
    title: { vi: 'Lộ trình sắp tới', en: 'Coming next' },
    description: {
      vi: 'Nâng cấp chất lượng phục chế, hỗ trợ xử lý hàng loạt và mở rộng chương trình phục chế ảnh tư liệu cho cộng đồng.',
      en: 'Higher restoration quality, batch processing, and an expanded archival-photo programme for the community.',
    },
    upcoming: true,
  },
]

/** "2025-09" → "Tháng 9/2025" | "Sep 2025" */
export function formatMilestoneDate(date: string, lang: Lang): string {
  const [year, month] = date.split('-')
  if (!month) return year
  if (lang === 'vi') return `Tháng ${Number(month)}/${year}`
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${names[Number(month) - 1]} ${year}`
}

// ============================================
// Lộ trình 2026 – 2030
// ============================================

export interface RoadmapPhase {
  period: string
  tone: Tone
  title: L
  goal: L
  targets: L[]
}

export const ROADMAP: RoadmapPhase[] = [
  {
    period: '2026',
    tone: 'pink',
    title: { vi: 'Củng cố nền tảng', en: 'Strengthen the foundation' },
    goal: { vi: 'Chất lượng & độ ổn định ở quy mô lớn', en: 'Quality and reliability at scale' },
    targets: [
      { vi: '200.000 ảnh được phục chế', en: '200,000 photos restored' },
      { vi: 'Xử lý hàng loạt cho gia đình', en: 'Batch processing for families' },
    ],
  },
  {
    period: '2027',
    tone: 'orange',
    title: { vi: 'Bứt phá Việt Nam', en: 'Break out in Vietnam' },
    goal: { vi: 'Trở thành lựa chọn số 1 trong nước', en: 'Become the #1 choice nationwide' },
    targets: [
      { vi: '300.000 người dùng', en: '300,000 users' },
      { vi: 'Ứng dụng di động iOS & Android', en: 'iOS & Android mobile apps' },
    ],
  },
  {
    period: '2028',
    tone: 'purple',
    title: { vi: 'Mở rộng Đông Nam Á', en: 'Expand across Southeast Asia' },
    goal: { vi: 'Đa ngôn ngữ, đa thị trường', en: 'Multi-language, multi-market' },
    targets: [
      { vi: '5 quốc gia, 10 ngôn ngữ', en: '5 countries, 10 languages' },
      { vi: 'Chương trình đối tác bảo tàng & thư viện', en: 'Museum & library partnership programme' },
    ],
  },
  {
    period: '2030',
    tone: 'blue',
    title: { vi: 'Hướng tới kỳ lân vì cộng đồng', en: 'On the unicorn track — for good' },
    goal: { vi: 'Nền tảng phục chế ký ức lớn nhất khu vực', en: 'The region’s largest memory-restoration platform' },
    targets: [
      { vi: '1 triệu người dùng', en: '1 million users' },
      { vi: '10 triệu bức ảnh được hồi sinh', en: '10 million photos brought back to life' },
    ],
  },
]

// ============================================
// Ban lãnh đạo [MOCK — trừ nhà sáng lập]
// ============================================

export interface Leader {
  name: string
  tone: Tone
  role: L
  bio: L
}

export const LEADERS: Leader[] = [
  {
    name: COMPANY.founder.name,
    tone: 'pink',
    role: { vi: COMPANY.founder.role, en: COMPANY_EN.founderRole },
    bio: {
      vi: 'Người khởi xướng Hồi Nét. Định hướng sản phẩm và chiến lược phát triển cộng đồng.',
      en: 'Initiator of Hoi Net. Leads product direction and community growth strategy.',
    },
  },
  {
    name: 'Nguyễn Minh Anh',
    tone: 'blue',
    role: { vi: 'Giám đốc Công nghệ (CTO)', en: 'Chief Technology Officer (CTO)' },
    bio: {
      vi: 'Hơn 10 năm xây dựng hệ thống phân tán và hạ tầng AI quy mô lớn.',
      en: '10+ years building distributed systems and large-scale AI infrastructure.',
    },
  },
  {
    name: 'Trần Quốc Bảo',
    tone: 'purple',
    role: { vi: 'Trưởng nhóm Nghiên cứu AI', en: 'Head of AI Research' },
    bio: {
      vi: 'Chuyên gia thị giác máy tính, phụ trách các mô hình phục hồi và tô màu ảnh.',
      en: 'Computer-vision specialist leading restoration and colorization models.',
    },
  },
  {
    name: 'Lê Thu Hà',
    tone: 'orange',
    role: { vi: 'Trưởng nhóm Sản phẩm & Thiết kế', en: 'Head of Product & Design' },
    bio: {
      vi: 'Thiết kế trải nghiệm đơn giản để mọi thế hệ đều có thể phục chế ảnh.',
      en: 'Designs simple experiences so every generation can restore their photos.',
    },
  },
  {
    name: 'Phạm Gia Huy',
    tone: 'green',
    role: { vi: 'Trưởng nhóm Cộng đồng & Vận hành', en: 'Head of Community & Operations' },
    bio: {
      vi: 'Kết nối cộng đồng, nhà tài trợ và đảm bảo vận hành minh bạch.',
      en: 'Connects the community and sponsors and keeps operations transparent.',
    },
  },
]

// ============================================
// Bảng hồ sơ doanh nghiệp song ngữ
// ============================================

export interface ProfileRow {
  item: L
  vi: string
  en: string
}

export const COMPANY_PROFILE: ProfileRow[] = [
  { item: { vi: 'Tên thương hiệu', en: 'Brand name' }, vi: COMPANY.brandName, en: 'Hoi Net' },
  { item: { vi: 'Tên pháp lý', en: 'Legal name' }, vi: COMPANY.legalName, en: COMPANY.legalNameEn },
  {
    item: { vi: 'Loại hình', en: 'Organisation type' },
    vi: COMPANY.organizationType,
    en: COMPANY_EN.organizationType,
  },
  {
    item: { vi: 'Lĩnh vực', en: 'Industry' },
    vi: 'Công nghệ AI — phục chế & khôi phục ảnh',
    en: 'AI technology — photo restoration & enhancement',
  },
  {
    item: { vi: 'Giai đoạn', en: 'Stage' },
    vi: 'Startup tăng trưởng nhanh (Growth stage)',
    en: 'Hyper-growth startup (Growth stage)',
  },
  { item: { vi: 'Ngày thành lập', en: 'Date of founding' }, vi: '15/09/2025', en: 'September 15, 2025' },
  {
    item: { vi: 'Nhà sáng lập', en: 'Founder' },
    vi: `${COMPANY.founder.name} — ${COMPANY.founder.role}`,
    en: `${COMPANY.founder.name} — ${COMPANY_EN.founderRole}`,
  },
  { item: { vi: 'Mã số thuế', en: 'Tax code' }, vi: COMPANY.taxCode, en: COMPANY.taxCode },
  {
    item: { vi: 'Đăng ký kinh doanh', en: 'Business registration' },
    vi: COMPANY.businessLicense,
    en: COMPANY_EN.businessLicense,
  },
  { item: { vi: 'Vốn điều lệ', en: 'Charter capital' }, vi: COMPANY.charterCapital, en: COMPANY_EN.charterCapital },
  { item: { vi: 'Quy mô nhân sự', en: 'Team size' }, vi: '42 thành viên', en: '42 team members' },
  { item: { vi: 'Trụ sở chính', en: 'Headquarters' }, vi: COMPANY.address.full, en: COMPANY_EN.addressFull },
  { item: { vi: 'Giờ làm việc', en: 'Working hours' }, vi: COMPANY.workingHours, en: COMPANY_EN.workingHours },
  { item: { vi: 'Điện thoại', en: 'Phone' }, vi: COMPANY.phone, en: COMPANY.phone },
  { item: { vi: 'Email', en: 'Email' }, vi: COMPANY.emails.contact, en: COMPANY.emails.contact },
  { item: { vi: 'Website', en: 'Website' }, vi: COMPANY.website, en: COMPANY.website },
  { item: { vi: 'Sứ mệnh', en: 'Mission' }, vi: COMPANY.mission, en: COMPANY_EN.mission },
  { item: { vi: 'Tầm nhìn', en: 'Vision' }, vi: COMPANY.vision, en: COMPANY_EN.vision },
]


// ============================================
// Ánh xạ dòng dữ liệu Supabase (snake_case) → kiểu hiển thị
// Nội dung trong DB (migration 041) ưu tiên hơn bản hardcode ở trên.
// ============================================

export interface MilestoneRow {
  period: string
  title_vi: string
  title_en: string
  description_vi: string
  description_en: string
  is_upcoming: boolean
}
export interface AchievementRow {
  year: number
  tone: Tone
  rank_vi: string
  rank_en: string
  title_vi: string
  title_en: string
  issuer_vi: string
  issuer_en: string
}
export interface LeaderRow {
  name: string
  tone: Tone
  role_vi: string
  role_en: string
  bio_vi: string
  bio_en: string
}
export interface StatRow {
  value: number | string
  prefix: string | null
  suffix_vi: string | null
  suffix_en: string | null
  icon: StatItem['icon']
  label_vi: string
  label_en: string
  description_vi: string
  description_en: string
}

/** Nội dung About lấy từ database; trường nào undefined thì dùng bản hardcode */
export interface CompanyContent {
  milestones?: Milestone[]
  achievements?: Achievement[]
  leaders?: Leader[]
  stats?: StatItem[]
}

export const mapMilestoneRows = (rows: MilestoneRow[]): Milestone[] =>
  rows.map((r) => ({
    date: r.period,
    title: { vi: r.title_vi, en: r.title_en },
    description: { vi: r.description_vi, en: r.description_en },
    upcoming: r.is_upcoming,
  }))

export const mapAchievementRows = (rows: AchievementRow[]): Achievement[] =>
  rows.map((r) => ({
    year: r.year,
    tone: r.tone,
    rank: { vi: r.rank_vi, en: r.rank_en },
    title: { vi: r.title_vi, en: r.title_en },
    issuer: { vi: r.issuer_vi, en: r.issuer_en },
  }))

export const mapLeaderRows = (rows: LeaderRow[]): Leader[] =>
  rows.map((r) => ({
    name: r.name,
    tone: r.tone,
    role: { vi: r.role_vi, en: r.role_en },
    bio: { vi: r.bio_vi, en: r.bio_en },
  }))

export const mapStatRows = (rows: StatRow[]): StatItem[] =>
  rows.map((r) => ({
    value: Number(r.value),
    prefix: r.prefix ?? undefined,
    suffix: r.suffix_vi != null || r.suffix_en != null ? { vi: r.suffix_vi ?? '', en: r.suffix_en ?? r.suffix_vi ?? '' } : undefined,
    icon: r.icon,
    label: { vi: r.label_vi, en: r.label_en },
    description: { vi: r.description_vi, en: r.description_en },
  }))
