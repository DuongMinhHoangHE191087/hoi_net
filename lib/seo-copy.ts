/**
 * Nội dung SEO song ngữ (metadata + JSON-LD) cho layout gốc.
 * Bản tiếng Việt vẫn ưu tiên giá trị admin đặt trong site_settings (chỉ có tiếng Việt);
 * bản tiếng Anh dùng các hằng số dưới đây.
 */

import type { Lang } from './i18n'
import { COMPANY, SITE_URL } from './company-info'

export const SEO = {
  title: {
    vi: 'Hồi Nét - Dịch Vụ Phục Chế & Khôi Phục Ảnh Cũ Chuyên Nghiệp Bằng AI',
    en: 'Hoi Net — Professional AI Photo Restoration & Old Photo Recovery',
  },
  description: {
    vi: 'Dịch vụ phục chế ảnh cũ, làm nét ảnh mờ và ghép ảnh gia đình bằng công nghệ AI tiên tiến. Khôi phục kỷ niệm, tô màu ảnh trắng đen chuyên nghiệp, chất lượng cao.',
    en: 'Hoi Net is a non-profit AI project that restores old photos, sharpens blurry images, colorizes black-and-white pictures and composes family portraits — free for everyday needs.',
  },
  keywords: {
    vi: ['khôi phục ảnh cũ', 'làm nét ảnh', 'AI ảnh', 'ghép ảnh gia đình', 'phục chế ảnh', 'tô màu ảnh cũ'],
    en: [
      'old photo restoration',
      'AI photo restoration',
      'photo enhancer',
      'colorize black and white photos',
      'sharpen blurry photos',
      'family photo restoration',
      'non-profit AI project Vietnam',
    ],
  },
} as const

export function buildServiceJsonLd(lang: Lang) {
  const en = lang === 'en'
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: en ? 'AI photo restoration' : 'Hồi Nét - Phục chế và khôi phục ảnh',
    name: en ? 'Hoi Net — Professional AI Photo Restoration' : 'Hồi Nét - Phục chế & Khôi phục ảnh cũ chuyên nghiệp bằng AI',
    description: en
      ? 'Restoration, enhancement, sharpening and colorization of damaged old photographs using advanced AI technology.'
      : 'Hồi Nét - Dịch vụ phục chế, khôi phục, làm nét và tô màu ảnh cũ hư hỏng nặng sử dụng công nghệ AI tiên tiến',
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: en ? 'Vietnam' : 'Vietnam' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: en ? 'Photo restoration services' : 'Dịch vụ khôi phục ảnh',
      itemListElement: (en
        ? ['Photo sharpening', 'Old photo colorization', 'Family photo composition']
        : ['Làm nét ảnh', 'Tô màu ảnh cũ', 'Ghép ảnh gia đình']
      ).map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
    },
  }
}

const FAQ: Record<Lang, { q: string; a: string }[]> = {
  vi: [
    {
      q: 'Khôi phục ảnh cũ giá bao nhiêu?',
      a: 'Hồi Nét cung cấp dịch vụ khôi phục ảnh cơ bản hoàn toàn miễn phí. Đối với các yêu cầu phục chế chuyên sâu hoặc ghép ảnh phức tạp, chúng tôi có các gói dịch vụ linh hoạt phù hợp với nhu cầu của bạn.',
    },
    {
      q: 'Làm nét ảnh mờ bằng AI có hiệu quả không?',
      a: 'Công nghệ AI của Hồi Nét có khả năng tái tạo chi tiết, khử nhiễu và làm rõ nét các bức ảnh bị mờ nhòe do rung tay hoặc độ phân giải thấp một cách kinh ngạc.',
    },
    {
      q: 'Thời gian phục chế một bức ảnh là bao lâu?',
      a: 'Với sức mạnh của trí tuệ nhân tạo, phần lớn các bức ảnh sẽ được xử lý hoàn tất chỉ trong vòng vài phút.',
    },
  ],
  en: [
    {
      q: 'How much does old photo restoration cost?',
      a: 'Hoi Net offers basic photo restoration completely free of charge. For in-depth restoration or complex photo composition, we provide flexible plans that fit your needs.',
    },
    {
      q: 'Does AI sharpening really work on blurry photos?',
      a: 'Hoi Net’s AI reconstructs fine detail, removes noise and sharpens photos blurred by camera shake or low resolution — often with remarkable results.',
    },
    {
      q: 'How long does it take to restore a photo?',
      a: 'Thanks to artificial intelligence, most photos are fully processed within a few minutes.',
    },
  ],
}

export function buildFaqJsonLd(lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ[lang].map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

/** Mô tả/slogan Organization theo ngôn ngữ (ghi đè lên bản tiếng Việt trong buildOrganizationJsonLd) */
export function organizationCopy(lang: Lang) {
  return lang === 'en'
    ? {
        description:
          'Hoi Net is a non-profit project that restores and enhances old photos with AI, helping every Vietnamese family preserve its most precious memories.',
        slogan: 'Restoring memories, connecting generations',
      }
    : { description: COMPANY.shortDescription, slogan: COMPANY.tagline }
}
