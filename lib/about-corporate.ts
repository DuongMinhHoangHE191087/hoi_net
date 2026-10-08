/**
 * ============================================
 * 🏛️ ABOUT — NỘI DUNG KIỂU TẬP ĐOÀN (song ngữ EN/VI)
 * ============================================
 *
 * Dịch vụ, quy trình, hệ sinh thái đơn vị thành viên, bảo mật & quản trị, tác động,
 * đối tác, tin tức, tuyển dụng, FAQ. Bổ sung cho lib/about-content.ts.
 *
 * ⚠️ [MOCK] Số liệu tác động, tin tức, vị trí tuyển dụng và trạng thái các đơn vị
 *    là dữ liệu mẫu — thay bằng dữ liệu thật trước khi chạy production.
 * ✅ Các cam kết ở mục "Bảo mật" bám theo tính năng THỰC SỰ có trong mã nguồn
 *    (RLS Supabase, CSRF, rate limit, hCaptcha, phân quyền, nhật ký). Không nêu chứng chỉ
 *    (ISO/SOC) vì dự án chưa có.
 */

import type { L } from './i18n'
import type { Tone } from './about-content'
import { COMPANY } from './company-info'

// ============================================
// Nhãn giao diện của các section này
// ============================================

export const CORP_UI = {
  navLabel: { vi: 'Trên trang này', en: 'On this page' } satisfies L,

  servicesTitle: { vi: 'Chúng Tôi Làm Gì', en: 'What We Do' } satisfies L,
  servicesSub: {
    vi: 'Bộ công cụ phục chế ảnh bằng AI, từ ảnh rách nát đến chân dung gia đình hoàn chỉnh',
    en: 'An AI toolkit for photo restoration — from torn prints to complete family portraits',
  } satisfies L,

  processTitle: { vi: 'Cách Hoạt Động', en: 'How It Works' } satisfies L,
  processSub: {
    vi: 'Bốn bước đơn giản, thường hoàn tất trong vài phút',
    en: 'Four simple steps, usually finished within minutes',
  } satisfies L,
  step: { vi: 'Bước', en: 'Step' } satisfies L,

  ecosystemTitle: { vi: 'Hệ Sinh Thái Hồi Nét', en: 'The Hoi Net Ecosystem' } satisfies L,
  ecosystemSub: {
    vi: 'Các đơn vị và chương trình thành viên cùng hướng tới một sứ mệnh',
    en: 'Member units and programmes working toward one shared mission',
  } satisfies L,
  parent: { vi: 'Đơn vị chủ quản', en: 'Parent company' } satisfies L,

  trustTitle: { vi: 'Tin Cậy, Bảo Mật & Quản Trị', en: 'Trust, Security & Governance' } satisfies L,
  trustSub: {
    vi: 'Bảo vệ ký ức của bạn bằng kỹ thuật vững chắc và nguyên tắc quản trị minh bạch',
    en: 'Protecting your memories with solid engineering and transparent governance',
  } satisfies L,
  securityHeading: { vi: 'Bảo mật theo thiết kế', en: 'Security by design' } satisfies L,
  governanceHeading: { vi: 'Nguyên tắc quản trị', en: 'Governance principles' } satisfies L,

  impactTitle: { vi: 'Tác Động & Phát Triển Bền Vững', en: 'Impact & Sustainability' } satisfies L,
  impactSub: {
    vi: 'Giá trị chúng tôi tạo ra cho gia đình, cộng đồng và di sản văn hóa',
    en: 'The value we create for families, communities and cultural heritage',
  } satisfies L,
  sdgLabel: { vi: 'Đóng góp cho mục tiêu phát triển bền vững của Liên Hợp Quốc', en: 'Contributing to the UN Sustainable Development Goals' } satisfies L,

  partnersTitle: { vi: 'Đối Tác & Nền Tảng', en: 'Partners & Platforms' } satisfies L,
  partnersSub: {
    vi: 'Được xây dựng trên những nền tảng đáng tin cậy và mở rộng cho cộng đồng',
    en: 'Built on trusted platforms and open to the community',
  } satisfies L,
  poweredBy: { vi: 'Vận hành trên', en: 'Powered by' } satisfies L,
  partnerCta: { vi: 'Trở thành đối tác', en: 'Become a partner' } satisfies L,

  newsTitle: { vi: 'Tin Tức & Cập Nhật', en: 'Newsroom' } satisfies L,
  newsSub: {
    vi: 'Những thông tin mới nhất từ Hồi Nét',
    en: 'The latest from Hoi Net',
  } satisfies L,
  allNews: { vi: 'Xem tất cả bài viết', en: 'View all posts' } satisfies L,
  pressContact: { vi: 'Liên hệ báo chí', en: 'Press contact' } satisfies L,

  careersTitle: { vi: 'Gia Nhập Hồi Nét', en: 'Careers at Hoi Net' } satisfies L,
  careersSub: {
    vi: 'Xây dựng công nghệ có ý nghĩa cùng một đội ngũ trẻ, tò mò và tử tế',
    en: 'Build meaningful technology with a young, curious and kind team',
  } satisfies L,
  openRoles: { vi: 'Vị trí đang mở', en: 'Open roles' } satisfies L,
  perks: { vi: 'Quyền lợi', en: 'What you get' } satisfies L,
  apply: { vi: 'Ứng tuyển', en: 'Apply' } satisfies L,
  applySubject: { vi: 'Ứng tuyển', en: 'Application' } satisfies L,

  faqTitle: { vi: 'Câu Hỏi Thường Gặp', en: 'Frequently Asked Questions' } satisfies L,
  faqSub: {
    vi: 'Mọi điều bạn muốn biết về Hồi Nét',
    en: 'Everything you might want to know about Hoi Net',
  } satisfies L,
}

// ============================================
// Điều hướng nhanh (neo vào id của từng section)
// ============================================

export const SECTION_NAV: { id: string; label: L }[] = [
  { id: 'company-overview-title', label: { vi: 'Tổng quan', en: 'Overview' } },
  { id: 'services-title', label: { vi: 'Dịch vụ', en: 'Services' } },
  { id: 'ecosystem-title', label: { vi: 'Hệ sinh thái', en: 'Ecosystem' } },
  { id: 'company-stats-title', label: { vi: 'Con số', en: 'Numbers' } },
  { id: 'trust-title', label: { vi: 'Tin cậy', en: 'Trust' } },
  { id: 'impact-title', label: { vi: 'Tác động', en: 'Impact' } },
  { id: 'company-timeline-title', label: { vi: 'Hành trình', en: 'Journey' } },
  { id: 'leadership-title', label: { vi: 'Lãnh đạo', en: 'Leadership' } },
  { id: 'news-title', label: { vi: 'Tin tức', en: 'News' } },
  { id: 'careers-title', label: { vi: 'Tuyển dụng', en: 'Careers' } },
  { id: 'faq-title', label: { vi: 'FAQ', en: 'FAQ' } },
]

// ============================================
// Dịch vụ
// ============================================

export interface ServiceItem {
  icon: 'wand' | 'palette' | 'face' | 'users' | 'layers' | 'archive'
  tone: Tone
  title: L
  description: L
  tag: L
  href: string
}

export const SERVICES: ServiceItem[] = [
  {
    icon: 'wand',
    tone: 'pink',
    title: { vi: 'Phục chế ảnh bằng AI', en: 'AI Photo Restoration' },
    description: {
      vi: 'Sửa vết xước, rách, ố vàng, phai màu và hư hỏng nặng để trả lại bức ảnh nguyên vẹn.',
      en: 'Repairs scratches, tears, stains, fading and heavy damage to return the photograph to its original state.',
    },
    tag: { vi: 'Miễn phí', en: 'Free' },
    href: '/request-photo',
  },
  {
    icon: 'palette',
    tone: 'orange',
    title: { vi: 'Tô màu ảnh trắng đen', en: 'B&W Colorization' },
    description: {
      vi: 'Thêm màu tự nhiên, hài hòa cho ảnh trắng đen, giữ đúng thần thái của thời đại.',
      en: 'Adds natural, harmonious colour to black-and-white photos while keeping the character of the era.',
    },
    tag: { vi: 'Miễn phí', en: 'Free' },
    href: '/request-photo',
  },
  {
    icon: 'face',
    tone: 'purple',
    title: { vi: 'Làm nét & chi tiết khuôn mặt', en: 'Sharpening & Face Detail' },
    description: {
      vi: 'Khử nhiễu, tăng độ phân giải và tái tạo chi tiết khuôn mặt cho ảnh mờ, nhòe.',
      en: 'Removes noise, increases resolution and reconstructs facial detail in blurry or low-quality photos.',
    },
    tag: { vi: 'Miễn phí', en: 'Free' },
    href: '/request-photo',
  },
  {
    icon: 'users',
    tone: 'blue',
    title: { vi: 'Ghép ảnh gia đình & ảnh thờ', en: 'Family Composite & Memorial Portraits' },
    description: {
      vi: 'Ghép chân dung vào không gian gia đình, phục dựng ảnh thờ trang nghiêm và tự nhiên.',
      en: 'Composes portraits into a shared family setting and restores memorial portraits with dignity and realism.',
    },
    tag: { vi: 'Theo yêu cầu', en: 'On request' },
    href: '/contact',
  },
  {
    icon: 'layers',
    tone: 'green',
    title: { vi: 'Studio chỉnh sửa trực tuyến', en: 'Online Studio' },
    description: {
      vi: 'Công cụ tách nền và chỉnh sửa chạy ngay trên trình duyệt, ảnh không cần rời khỏi máy bạn.',
      en: 'Background removal and editing tools that run right in your browser, so images need not leave your device.',
    },
    tag: { vi: 'Công cụ', en: 'Tool' },
    href: '/studio',
  },
  {
    icon: 'archive',
    tone: 'cyan',
    title: { vi: 'Chương trình lưu trữ cộng đồng', en: 'Community Archive Programme' },
    description: {
      vi: 'Phục chế miễn phí ảnh tư liệu cho thư viện, trường học và các tổ chức cộng đồng.',
      en: 'Free restoration of archival photos for libraries, schools and community organisations.',
    },
    tag: { vi: 'Phi lợi nhuận', en: 'Non-profit' },
    href: '/contact',
  },
]

// ============================================
// Quy trình
// ============================================

export interface ProcessStep {
  icon: 'upload' | 'cpu' | 'sparkles' | 'download'
  title: L
  description: L
}

export const PROCESS: ProcessStep[] = [
  {
    icon: 'upload',
    title: { vi: 'Tải ảnh lên', en: 'Upload your photo' },
    description: {
      vi: 'Chọn ảnh cần phục chế. Kết nối được mã hóa và có bước chống bot.',
      en: 'Choose the photo to restore. Connections are encrypted and protected against bots.',
    },
  },
  {
    icon: 'cpu',
    title: { vi: 'AI phân tích', en: 'AI analysis' },
    description: {
      vi: 'Mô hình nhận diện loại hư hỏng: xước, rách, mờ, phai màu hay nhiễu hạt.',
      en: 'Models identify the type of damage — scratches, tears, blur, fading or grain.',
    },
  },
  {
    icon: 'sparkles',
    title: { vi: 'Phục chế & nâng cấp', en: 'Restore & enhance' },
    description: {
      vi: 'Phục hồi chi tiết, tô màu và làm nét, giữ đúng nét mặt người trong ảnh.',
      en: 'Details are rebuilt, colour and sharpness are added, and every face stays true to the original.',
    },
  },
  {
    icon: 'download',
    title: { vi: 'Xem lại & tải về', en: 'Review & download' },
    description: {
      vi: 'Với yêu cầu phức tạp, đội ngũ kiểm duyệt trước khi giao. Bạn nhận ảnh và thông báo qua email.',
      en: 'For complex requests our team reviews the result before delivery. You receive the photo and an email notice.',
    },
  },
]

// ============================================
// Hệ sinh thái / đơn vị thành viên
// ============================================

export interface BusinessUnit {
  icon: 'building' | 'layers' | 'flask' | 'heart' | 'graduation'
  tone: Tone
  name: string
  role: L
  description: L
  status: { label: L; live: boolean }
}

export const BUSINESS_UNITS: BusinessUnit[] = [
  {
    icon: 'building',
    tone: 'pink',
    name: 'Hoi Net Restore',
    role: { vi: 'Nền tảng chủ lực', en: 'Flagship platform' },
    description: {
      vi: 'Dịch vụ phục chế ảnh trực tuyến tại hoinet.tech, phục vụ hàng chục nghìn gia đình Việt.',
      en: 'The online photo-restoration service at hoinet.tech, serving tens of thousands of Vietnamese families.',
    },
    status: { label: { vi: 'Đang hoạt động', en: 'Live' }, live: true },
  },
  {
    icon: 'layers',
    tone: 'green',
    name: 'Hoi Net Studio',
    role: { vi: 'Công cụ sáng tạo', en: 'Creative tools' },
    description: {
      vi: 'Bộ công cụ chỉnh sửa và tách nền chạy trên trình duyệt cho người dùng cá nhân và nhà sáng tạo.',
      en: 'Browser-based editing and background-removal tools for individuals and creators.',
    },
    status: { label: { vi: 'Đang hoạt động', en: 'Live' }, live: true },
  },
  {
    icon: 'flask',
    tone: 'purple',
    name: 'Hoi Net Labs',
    role: { vi: 'Nghiên cứu & phát triển', en: 'Research & development' },
    description: {
      vi: 'Nhóm R&D thử nghiệm mô hình phục hồi, tô màu và đánh giá chất lượng ảnh mới.',
      en: 'R&D team experimenting with new restoration, colorization and image-quality models.',
    },
    status: { label: { vi: 'Đang nghiên cứu', en: 'Active research' }, live: true },
  },
  {
    icon: 'heart',
    tone: 'orange',
    name: 'Hoi Net Community',
    role: { vi: 'Chương trình cộng đồng', en: 'Community programme' },
    description: {
      vi: 'Quỹ đóng góp minh bạch và chương trình phục chế ảnh tư liệu miễn phí cho cộng đồng.',
      en: 'A transparent contribution fund and a free archival-photo restoration programme for the community.',
    },
    status: { label: { vi: 'Đang hoạt động', en: 'Live' }, live: true },
  },
  {
    icon: 'graduation',
    tone: 'blue',
    name: 'Hoi Net Academy',
    role: { vi: 'Đào tạo & chia sẻ', en: 'Training & sharing' },
    description: {
      vi: 'Hội thảo và tài liệu hướng dẫn số hóa, bảo quản ảnh và tư liệu gia đình.',
      en: 'Workshops and guides on digitising and preserving family photographs and documents.',
    },
    status: { label: { vi: 'Dự kiến 2027', en: 'Planned 2027' }, live: false },
  },
]

// ============================================
// Bảo mật & quản trị
// ============================================

export interface TrustItem {
  icon: 'shield' | 'lock' | 'gauge' | 'user' | 'file' | 'key'
  title: L
  description: L
}

/** Bám theo tính năng thực có trong repo */
export const SECURITY_ITEMS: TrustItem[] = [
  {
    icon: 'shield',
    title: { vi: 'Phân quyền dữ liệu từng dòng', en: 'Row-level data isolation' },
    description: {
      vi: 'Chính sách Row Level Security của cơ sở dữ liệu đảm bảo mỗi người chỉ truy cập dữ liệu của mình.',
      en: 'Database Row Level Security ensures each person can only access their own data.',
    },
  },
  {
    icon: 'lock',
    title: { vi: 'Bảo vệ phiên & CSRF', en: 'Session & CSRF protection' },
    description: {
      vi: 'Cookie phiên được bảo mật và các thao tác ghi dữ liệu có cơ chế chống giả mạo yêu cầu (CSRF).',
      en: 'Session cookies are hardened and state-changing actions are protected against cross-site request forgery.',
    },
  },
  {
    icon: 'gauge',
    title: { vi: 'Giới hạn tốc độ & chống bot', en: 'Rate limiting & bot defence' },
    description: {
      vi: 'Giới hạn số lượt gọi và xác minh hCaptcha giúp ngăn lạm dụng, tấn công dò mật khẩu.',
      en: 'Request rate limits and hCaptcha verification help prevent abuse and credential-stuffing.',
    },
  },
  {
    icon: 'user',
    title: { vi: 'Kiểm soát truy cập theo vai trò', en: 'Role-based access control' },
    description: {
      vi: 'Quản trị viên, kiểm duyệt viên và biên tập viên chỉ có đúng quyền cần thiết.',
      en: 'Administrators, moderators and editors only hold the permissions they need.',
    },
  },
  {
    icon: 'file',
    title: { vi: 'Nhật ký & truy vết', en: 'Audit logging' },
    description: {
      vi: 'Hành động quản trị và sự kiện hệ thống được ghi nhật ký để rà soát khi cần.',
      en: 'Administrative actions and system events are logged for review when needed.',
    },
  },
  {
    icon: 'key',
    title: { vi: 'Bảo vệ tài khoản', en: 'Account protection' },
    description: {
      vi: 'Khóa tạm thời khi đăng nhập sai nhiều lần và quy trình đặt lại mật khẩu có token một lần.',
      en: 'Temporary lockouts after repeated failed sign-ins and a one-time-token password reset flow.',
    },
  },
]

export interface GovernanceItem {
  title: L
  description: L
}

export const GOVERNANCE_ITEMS: GovernanceItem[] = [
  {
    title: { vi: 'AI có trách nhiệm', en: 'Responsible AI' },
    description: {
      vi: 'Phục chế phải trung thực với bản gốc: không đổi danh tính, không tạo nội dung giả mạo người thật.',
      en: 'Restoration stays faithful to the original: we never alter identity or fabricate content about real people.',
    },
  },
  {
    title: { vi: 'Minh bạch tài chính', en: 'Financial transparency' },
    description: {
      vi: 'Công khai cách sử dụng các khoản đóng góp để duy trì hạ tầng và chương trình cộng đồng.',
      en: 'We openly explain how contributions are used to sustain infrastructure and community programmes.',
    },
  },
  {
    title: { vi: 'Quyền riêng tư', en: 'Privacy first' },
    description: {
      vi: 'Chỉ thu thập dữ liệu cần thiết cho dịch vụ. Chi tiết trong Chính sách Bảo mật của chúng tôi.',
      en: 'We collect only what the service needs. Details are set out in our Privacy Policy.',
    },
  },
  {
    title: { vi: 'Sử dụng có đạo đức', en: 'Ethical use' },
    description: {
      vi: 'Tôn trọng ảnh của người đã khuất và ngăn chặn việc dùng dịch vụ cho mục đích lừa đảo.',
      en: 'We treat photos of the departed with respect and prevent the service from being used for deception.',
    },
  },
]

// ============================================
// Tác động [MOCK]
// ============================================

export interface ImpactMetric {
  value: number
  suffix?: string
  label: L
  description: L
}

export const IMPACT_METRICS: ImpactMetric[] = [
  {
    value: 100,
    suffix: '%',
    label: { vi: 'Dịch vụ cơ bản miễn phí', en: 'Core service free' },
    description: { vi: 'Không rào cản chi phí cho nhu cầu phục chế cơ bản', en: 'No cost barrier for everyday restoration' },
  },
  {
    value: 2400,
    suffix: '+',
    label: { vi: 'Ảnh tư liệu cho cộng đồng', en: 'Archival photos for communities' },
    description: { vi: 'Phục chế miễn phí cho thư viện, trường học, tổ chức', en: 'Restored free for libraries, schools and organisations' },
  },
  {
    value: 36,
    suffix: '',
    label: { vi: 'Buổi chia sẻ & hội thảo', en: 'Workshops & talks' },
    description: { vi: 'Hướng dẫn số hóa và bảo quản ảnh gia đình', en: 'On digitising and preserving family photographs' },
  },
  {
    value: 520,
    suffix: '+',
    label: { vi: 'Giờ tình nguyện', en: 'Volunteer hours' },
    description: { vi: 'Từ sinh viên và chuyên gia đồng hành cùng dự án', en: 'From students and professionals supporting the project' },
  },
]

export interface Pillar {
  tone: Tone
  icon: 'users' | 'leaf' | 'scale'
  title: L
  description: L
}

export const PILLARS: Pillar[] = [
  {
    tone: 'pink',
    icon: 'users',
    title: { vi: 'Xã hội', en: 'Social' },
    description: {
      vi: 'Giúp mọi gia đình, đặc biệt là người lớn tuổi, giữ gìn ký ức mà không phải lo chi phí hay kỹ thuật.',
      en: 'Helping every family — especially older generations — keep their memories without cost or technical barriers.',
    },
  },
  {
    tone: 'green',
    icon: 'leaf',
    title: { vi: 'Môi trường', en: 'Environment' },
    description: {
      vi: 'Tối ưu mô hình và dùng chung hạ tầng đám mây để giảm tiêu hao năng lượng cho mỗi lượt xử lý.',
      en: 'Optimising models and sharing cloud infrastructure to reduce the energy used per restoration.',
    },
  },
  {
    tone: 'blue',
    icon: 'scale',
    title: { vi: 'Quản trị', en: 'Governance' },
    description: {
      vi: 'Minh bạch tài chính, AI có trách nhiệm và bảo vệ dữ liệu là nền tảng của mọi quyết định.',
      en: 'Financial transparency, responsible AI and data protection underpin every decision.',
    },
  },
]

export const SDGS: { number: number; label: L; color: string }[] = [
  { number: 4, label: { vi: 'Giáo dục chất lượng', en: 'Quality Education' }, color: '#C5192D' },
  { number: 9, label: { vi: 'Công nghiệp, đổi mới & hạ tầng', en: 'Industry, Innovation & Infrastructure' }, color: '#F36D25' },
  { number: 11, label: { vi: 'Bảo vệ di sản văn hóa (11.4)', en: 'Safeguard cultural heritage (11.4)' }, color: '#F99D26' },
  { number: 17, label: { vi: 'Hợp tác vì mục tiêu', en: 'Partnerships for the Goals' }, color: '#19486A' },
]

// ============================================
// Đối tác & nền tảng
// ============================================

/** Nhà cung cấp công nghệ thực tế đang dùng trong dự án */
export const PLATFORMS = ['Google Gemini', 'Supabase', 'Cloudinary', 'Vercel']

export interface PartnerTier {
  tone: Tone
  title: L
  description: L
}

export const PARTNER_TIERS: PartnerTier[] = [
  {
    tone: 'pink',
    title: { vi: 'Đối tác cộng đồng', en: 'Community partners' },
    description: {
      vi: 'Trường học, câu lạc bộ, thư viện và bảo tàng muốn số hóa ảnh tư liệu.',
      en: 'Schools, clubs, libraries and museums that want to digitise archival photos.',
    },
  },
  {
    tone: 'blue',
    title: { vi: 'Đối tác công nghệ', en: 'Technology partners' },
    description: {
      vi: 'Nhà cung cấp mô hình, hạ tầng và công cụ cùng nâng chất lượng phục chế.',
      en: 'Model, infrastructure and tooling providers helping raise restoration quality.',
    },
  },
  {
    tone: 'orange',
    title: { vi: 'Nhà tài trợ & đồng hành', en: 'Sponsors & supporters' },
    description: {
      vi: 'Doanh nghiệp và cá nhân đóng góp để dịch vụ cơ bản luôn miễn phí.',
      en: 'Businesses and individuals contributing to keep the core service free.',
    },
  },
]

// ============================================
// Tin tức [MOCK]
// ============================================

export interface NewsItem {
  date: string
  tone: Tone
  category: L
  title: L
  excerpt: L
  /** Số liệu nổi bật hiển thị lớn trong bài đầu tiên */
  highlight?: { value: string; label: L }[]
}

export const NEWS: NewsItem[] = [
  {
    date: '2026-09-18',
    tone: 'pink',
    category: { vi: 'Cột mốc', en: 'Milestone' },
    title: { vi: 'Hồi Nét vượt mốc 100.000 bức ảnh được phục chế', en: 'Hoi Net passes 100,000 restored photos' },
    excerpt: {
      vi: 'Chỉ sau tám tháng ra mắt công khai, cộng đồng đã cùng hồi sinh hơn 100.000 bức ảnh gia đình trên khắp cả nước.',
      en: 'Just eight months after public launch, the community has brought more than 100,000 family photos back to life nationwide.',
    },
    highlight: [
      { value: '100K+', label: { vi: 'Ảnh được phục chế', en: 'Photos restored' } },
      { value: '8', label: { vi: 'Tháng kể từ khi ra mắt', en: 'Months since launch' } },
      { value: '34/34', label: { vi: 'Tỉnh, thành phố', en: 'Provinces & cities' } },
    ],
  },
  {
    date: '2026-08-05',
    tone: 'orange',
    category: { vi: 'Cộng đồng', en: 'Community' },
    title: { vi: 'Ra mắt trang đóng góp minh bạch', en: 'Transparent contribution page launches' },
    excerpt: {
      vi: 'Mỗi khoản đóng góp đều được công khai mục đích sử dụng để giữ dịch vụ cơ bản luôn miễn phí.',
      en: 'Every contribution now has a public purpose, keeping the core service free for everyone.',
    },
  },
  {
    date: '2026-06-12',
    tone: 'purple',
    category: { vi: 'Kỹ thuật', en: 'Engineering' },
    title: { vi: 'Rút thời gian phục chế trung bình xuống còn 3 phút', en: 'Cutting average restoration time to 3 minutes' },
    excerpt: {
      vi: 'Đội ngũ chia sẻ cách tối ưu hàng đợi và mô hình để xử lý nhanh hơn mà không giảm chất lượng.',
      en: 'How we re-engineered queues and models to process photos faster without sacrificing quality.',
    },
  },
  {
    date: '2026-04-20',
    tone: 'green',
    category: { vi: 'Sản phẩm', en: 'Product' },
    title: { vi: 'Giới thiệu Hoi Net Studio', en: 'Introducing Hoi Net Studio' },
    excerpt: {
      vi: 'Công cụ chỉnh sửa và tách nền chạy ngay trên trình duyệt, ảnh của bạn không phải rời khỏi thiết bị.',
      en: 'Browser-based editing and background removal — your images never have to leave your device.',
    },
  },
]

export function formatNewsDate(date: string, lang: 'vi' | 'en'): string {
  const d = new Date(date + 'T00:00:00Z')
  return new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d)
}

// ============================================
// Tuyển dụng [MOCK]
// ============================================

export interface Role {
  title: L
  team: L
  location: L
  type: L
}

const HANOI_HYBRID: L = { vi: 'Hà Nội · Linh hoạt', en: 'Hanoi · Hybrid' }
const FULL_TIME: L = { vi: 'Toàn thời gian', en: 'Full-time' }

export const ROLES: Role[] = [
  {
    title: { vi: 'Kỹ sư Machine Learning (Thị giác máy tính)', en: 'Machine Learning Engineer (Computer Vision)' },
    team: { vi: 'Hoi Net Labs', en: 'Hoi Net Labs' },
    location: HANOI_HYBRID,
    type: FULL_TIME,
  },
  {
    title: { vi: 'Kỹ sư Full-stack (Next.js, Supabase)', en: 'Full-stack Engineer (Next.js, Supabase)' },
    team: { vi: 'Nền tảng', en: 'Platform' },
    location: HANOI_HYBRID,
    type: FULL_TIME,
  },
  {
    title: { vi: 'Nhà thiết kế sản phẩm', en: 'Product Designer' },
    team: { vi: 'Sản phẩm & Thiết kế', en: 'Product & Design' },
    location: HANOI_HYBRID,
    type: FULL_TIME,
  },
  {
    title: { vi: 'Quản lý Cộng đồng & Đối tác', en: 'Community & Partnerships Manager' },
    team: { vi: 'Cộng đồng', en: 'Community' },
    location: { vi: 'Hà Nội', en: 'Hanoi' },
    type: FULL_TIME,
  },
  {
    title: { vi: 'Thực tập sinh AI & Sản phẩm', en: 'AI & Product Intern' },
    team: { vi: 'Hoi Net Labs', en: 'Hoi Net Labs' },
    location: { vi: 'Hà Nội · Từ xa', en: 'Hanoi · Remote' },
    type: { vi: 'Thực tập', en: 'Internship' },
  },
]

export const PERKS: L[] = [
  { vi: 'Ngân sách học tập', en: 'Learning budget' },
  { vi: 'Giờ làm linh hoạt', en: 'Flexible hours' },
  { vi: 'Cố vấn 1-1', en: '1-on-1 mentorship' },
  { vi: 'Bảo hiểm sức khỏe', en: 'Health coverage' },
  { vi: 'Tác động xã hội thật', en: 'Real social impact' },
  { vi: 'Làm việc với AI mới nhất', en: 'Work with cutting-edge AI' },
]

export function applyMailto(role: L, lang: 'vi' | 'en'): string {
  const subject = `${CORP_UI.applySubject[lang]}: ${role[lang]}`
  return `mailto:${COMPANY.emails.careers}?subject=${encodeURIComponent(subject)}`
}

// ============================================
// FAQ
// ============================================

export interface FaqItem {
  q: L
  a: L
}

export const FAQS: FaqItem[] = [
  {
    q: { vi: 'Hồi Nét là gì?', en: 'What is Hoi Net?' },
    a: {
      vi: 'Hồi Nét là dự án phi lợi nhuận thuộc Công ty TNHH Công nghệ Hồi Nét, ứng dụng AI để phục chế, làm nét và tô màu ảnh cũ, giúp các gia đình Việt giữ gìn ký ức.',
      en: 'Hoi Net is a non-profit project of Hoi Net Technology Company Limited that uses AI to restore, sharpen and colorize old photographs, helping Vietnamese families preserve their memories.',
    },
  },
  {
    q: { vi: 'Dịch vụ có thật sự miễn phí không?', en: 'Is the service really free?' },
    a: {
      vi: 'Có. Các nhu cầu phục chế cơ bản hoàn toàn miễn phí. Chi phí hạ tầng được duy trì nhờ đóng góp của cộng đồng và công ty chủ quản. Một số yêu cầu chuyên sâu có thể có gói riêng.',
      en: 'Yes. Everyday restoration is completely free. Infrastructure costs are sustained by community contributions and the parent company. Some in-depth requests may have separate plans.',
    },
  },
  {
    q: { vi: 'Ai đứng sau Hồi Nét?', en: 'Who is behind Hoi Net?' },
    a: {
      vi: 'Dự án được khởi xướng bởi Dương Minh Hoàng và vận hành bởi một đội ngũ kỹ sư, nhà thiết kế và tình nguyện viên tại Hà Nội.',
      en: 'The project was initiated by Duong Minh Hoang and is run by a team of engineers, designers and volunteers in Hanoi.',
    },
  },
  {
    q: { vi: 'Ảnh của tôi có an toàn không?', en: 'Are my photos safe?' },
    a: {
      vi: 'Chúng tôi dùng kết nối mã hóa, phân quyền dữ liệu từng dòng và kiểm soát truy cập theo vai trò. Chi tiết về dữ liệu nằm trong Chính sách Bảo mật.',
      en: 'We use encrypted connections, row-level data isolation and role-based access control. Full details are in our Privacy Policy.',
    },
  },
  {
    q: { vi: 'Mất bao lâu để phục chế một bức ảnh?', en: 'How long does a restoration take?' },
    a: {
      vi: 'Phần lớn ảnh được xử lý trong vài phút. Các yêu cầu phức tạp như ghép ảnh hay ảnh thờ có thể cần đội ngũ kiểm duyệt nên lâu hơn.',
      en: 'Most photos finish within minutes. Complex requests such as composites or memorial portraits may need team review and take longer.',
    },
  },
  {
    q: { vi: 'Loại ảnh nào được hỗ trợ?', en: 'Which kinds of photos are supported?' },
    a: {
      vi: 'Ảnh in cũ đã quét hoặc chụp lại, ảnh trắng đen, ảnh mờ nhòe, rách, ố vàng và ảnh chân dung gia đình. Ảnh càng rõ khi quét, kết quả càng tốt.',
      en: 'Scanned or re-photographed prints, black-and-white photos, and blurry, torn or yellowed pictures including family portraits. A cleaner scan gives a better result.',
    },
  },
  {
    q: { vi: 'Tôi có thể hỗ trợ hoặc hợp tác như thế nào?', en: 'How can I support or partner with Hoi Net?' },
    a: {
      vi: `Bạn có thể đóng góp qua trang Ủng hộ, giới thiệu cho người thân, hoặc liên hệ ${COMPANY.emails.press} để hợp tác với tư cách trường học, tổ chức hay doanh nghiệp.`,
      en: `You can contribute on our Donate page, tell family and friends, or write to ${COMPANY.emails.press} to partner as a school, organisation or business.`,
    },
  },
  {
    q: { vi: 'Hồi Nét đang tuyển dụng không?', en: 'Is Hoi Net hiring?' },
    a: {
      vi: `Có. Xem các vị trí đang mở ở mục Tuyển dụng phía trên hoặc gửi CV tới ${COMPANY.emails.careers}.`,
      en: `Yes. See the open roles in the Careers section above or send your CV to ${COMPANY.emails.careers}.`,
    },
  },
]
