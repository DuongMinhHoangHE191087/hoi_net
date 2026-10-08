/**
 * ============================================
 * 🏢 COMPANY INFO — nguồn dữ liệu DUY NHẤT (hardcode)
 * ============================================
 *
 * Mọi nơi hiển thị thông tin công ty (Footer, About, Contact, Terms, Privacy,
 * metadata SEO, JSON-LD, sitemap) đều đọc từ file này. Muốn đổi thông tin chỉ
 * cần sửa tại đây.
 *
 * ⚠️ Những mục đánh dấu [MOCK] là dữ liệu mẫu — hãy thay bằng thông tin thật
 *    trước khi chạy production:
 *      - COMPANY.address / COMPANY.phone  (địa chỉ, số điện thoại)
 *      - COMPANY.taxCode / COMPANY.businessLicense  (để trống = không hiển thị)
 *      - SOCIAL_LINKS (trừ Facebook)
 *    Nội dung trang About (số liệu, mốc phát triển, giải thưởng, nhân sự, VI/EN)
 *    nằm ở lib/about-content.ts.
 *
 * Về sau có thể chuyển sang Supabase (site_settings + bảng milestones) bằng
 * cách đổi nguồn của các hằng số bên dưới; các component không cần sửa.
 *
 * File này không import gì từ React/Next nên dùng được ở cả server lẫn client.
 */

// ============================================
// Types
// ============================================

export interface CompanyAddress {
  street: string
  ward: string
  district: string
  city: string
  /** Mã quốc gia ISO 3166-1 alpha-2 (dùng cho JSON-LD) */
  countryCode: string
  country: string
  postalCode: string
  /** Địa chỉ in một dòng, dùng cho Footer/Contact */
  full: string
  /** Link mở Google Maps */
  mapUrl: string
}

export interface SocialLink {
  key: 'facebook' | 'x' | 'linkedin' | 'youtube' | 'tiktok'
  label: string
  url: string
}

// ============================================
// Công ty
// ============================================

export const SITE_URL = 'https://hoinet.tech'
const DOMAIN = 'hoinet.tech'

// [MOCK] Địa chỉ lấy theo trụ sở XGame Studio, Cầu Giấy, Hà Nội
const ADDRESS_STREET = 'Tòa The Nine, Số 9 Phạm Văn Đồng'
const ADDRESS_WARD = 'Phường Mai Dịch'
const ADDRESS_DISTRICT = 'Quận Cầu Giấy'
const ADDRESS_CITY = 'Hà Nội'

export const COMPANY = {
  /** Tên thương hiệu / dự án */
  brandName: 'Hồi Nét',
  alternateName: 'HoiNet',
  tagline: 'Hồi sinh ký ức, kết nối các thế hệ',
  shortDescription:
    'Hồi Nét là dự án phi lợi nhuận phục chế và khôi phục ảnh cũ bằng công nghệ AI, giúp mỗi gia đình Việt giữ gìn những kỷ niệm quý giá.',

  /** Pháp nhân chủ quản */
  legalName: 'Công ty TNHH Công nghệ Hồi Nét',
  legalNameEn: 'Hoi Net Technology Company Limited',
  organizationType: 'Dự án phi lợi nhuận thuộc Công ty TNHH Công nghệ Hồi Nét',
  /** Thành lập tháng 9/2025 */
  foundedDate: '2025-09-15',
  foundedYear: 2025,
  foundedLabel: 'Tháng 9/2025',
  /**
   * [MOCK] Chỉ đúng ĐỊNH DẠNG: MST doanh nghiệp VN gồm 10 chữ số (Hà Nội bắt đầu bằng 01).
   * Số ĐKKD của doanh nghiệp trùng với MST. Để trống nếu chưa có — component sẽ tự ẩn dòng này.
   */
  taxCode: '0109876543',
  businessLicense: 'Số ĐKKD 0109876543 — Sở Kế hoạch và Đầu tư TP. Hà Nội cấp lần đầu ngày 15/09/2025',
  /** [MOCK] */
  charterCapital: '1.000.000.000 VNĐ',

  /** Người sáng lập / đại diện */
  founder: {
    name: 'Dương Minh Hoàng',
    role: 'Nhà sáng lập & Giám đốc dự án',
  },

  website: SITE_URL,
  domain: DOMAIN,

  // Liên hệ — tất cả dùng tên miền @hoinet.tech
  // (cần tạo các mailbox/alias này ở nhà cung cấp email của domain)
  emails: {
    contact: `contact@${DOMAIN}`,
    support: `support@${DOMAIN}`,
    press: `press@${DOMAIN}`,
    careers: `careers@${DOMAIN}`,
  },
  /** [MOCK] — lấy từ số đang dùng ở trang /donate, hãy đổi nếu cần */
  phone: '039 449 7949',
  phoneRaw: '+84394497949',
  workingHours: 'Thứ Hai – Thứ Sáu, 08:00 – 17:30 (GMT+7)',
  responseTime: 'Phản hồi trong vòng 24 giờ làm việc',

  address: {
    street: ADDRESS_STREET,
    ward: ADDRESS_WARD,
    district: ADDRESS_DISTRICT,
    city: ADDRESS_CITY,
    countryCode: 'VN',
    country: 'Việt Nam',
    postalCode: '100000',
    full: `${ADDRESS_STREET}, ${ADDRESS_WARD}, ${ADDRESS_DISTRICT}, ${ADDRESS_CITY}`,
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(
        `${ADDRESS_STREET}, ${ADDRESS_WARD}, ${ADDRESS_DISTRICT}, ${ADDRESS_CITY}`
      ),
  } satisfies CompanyAddress,

  mission:
    'Dùng công nghệ AI để hồi sinh những bức ảnh cũ, giúp mọi gia đình Việt lưu giữ và trao truyền ký ức cho các thế hệ sau — miễn phí cho nhu cầu cơ bản.',
  vision:
    'Trở thành nền tảng phục chế ảnh bằng AI phi lợi nhuận được tin dùng nhất tại Việt Nam, nơi mỗi tấm ảnh xưa đều có cơ hội được hồi sinh.',
  nonprofitNote:
    'Hồi Nét vận hành theo mô hình phi lợi nhuận: dịch vụ cơ bản miễn phí, chi phí hạ tầng được duy trì nhờ đóng góp từ cộng đồng và công ty chủ quản.',
} as const

// ============================================
// Mạng xã hội [MOCK — trừ Facebook]
// ============================================

export const SOCIAL_LINKS: SocialLink[] = [
  { key: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/fpthoinet' },
  { key: 'x', label: 'X (Twitter)', url: 'https://twitter.com/hoinet_tech' },
  { key: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/hoinet' },
  { key: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@hoinet' },
  { key: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@hoinet.tech' },
]

export const TWITTER_HANDLE = '@hoinet_tech'

// ============================================
// Helpers
// ============================================

/** Chuỗi bản quyền cho Footer */
export function getCopyright(year: number = new Date().getFullYear()): string {
  return `© ${year} ${COMPANY.legalName}. Dự án ${COMPANY.brandName} — phi lợi nhuận.`
}

// ============================================
// JSON-LD
// ============================================

/**
 * Schema.org Organization cho layout. Chỉ xuất các trường có giá trị thật
 * (taxCode trống thì bỏ qua, không tạo trường rỗng).
 */
export function buildOrganizationJsonLd() {
  const sameAs = SOCIAL_LINKS.map((s) => s.url)

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: COMPANY.brandName,
    alternateName: [COMPANY.alternateName, COMPANY.legalName, COMPANY.legalNameEn],
    legalName: COMPANY.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    description: COMPANY.shortDescription,
    slogan: COMPANY.tagline,
    foundingDate: COMPANY.foundedDate.slice(0, 7),
    founder: { '@type': 'Person', name: COMPANY.founder.name, jobTitle: COMPANY.founder.role },
    ...(COMPANY.taxCode ? { taxID: COMPANY.taxCode } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.street,
      addressLocality: `${COMPANY.address.district}, ${COMPANY.address.city}`,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.countryCode,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: COMPANY.emails.support,
        telephone: COMPANY.phoneRaw,
        availableLanguage: ['Vietnamese', 'English'],
        areaServed: 'VN',
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '17:30',
        },
      },
      {
        '@type': 'ContactPoint',
        contactType: 'press',
        email: COMPANY.emails.press,
        availableLanguage: ['Vietnamese', 'English'],
      },
    ],
    email: COMPANY.emails.contact,
    sameAs,
  }
}
