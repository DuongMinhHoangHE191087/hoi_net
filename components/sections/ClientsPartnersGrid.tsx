'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, ExternalLink, Sparkles, Database, Cloud, Cpu, Landmark, Camera, HeartHandshake, ShieldCheck } from 'lucide-react'
import { HOINET_LOGO_URL } from '@/hooks/useSiteSettings'
import { COMPANY } from '@/lib/company-info'
import { useLang } from '@/contexts/LanguageContext'

interface PartnerItem {
  name: string
  category: { vi: string; en: string }
  desc: { vi: string; en: string }
  type: 'google' | 'supabase' | 'cloudinary' | 'vercel' | 'museum' | 'heritage' | 'community' | 'lab'
  tag: string
}

const PARTNER_LIST: PartnerItem[] = [
  {
    name: 'Google Gemini AI',
    category: { vi: 'Hạ tầng AI Cốt lõi', en: 'Foundation AI Model' },
    desc: {
      vi: 'Mô hình thị giác máy tính khôi phục nét mặt và màu sắc lịch sử chính xác',
      en: 'Multimodal vision model for accurate facial reconstruction and historic colors',
    },
    type: 'google',
    tag: 'Frontier AI',
  },
  {
    name: 'Supabase Cloud',
    category: { vi: 'Cơ sở dữ liệu & Auth', en: 'Database & Auth' },
    desc: {
      vi: 'Lưu trữ thời gian thực và xác thực bảo mật chuẩn mã hóa Row-Level Security',
      en: 'Realtime database and enterprise-grade row-level encryption',
    },
    type: 'supabase',
    tag: 'Cloud DB',
  },
  {
    name: 'Cloudinary CDN',
    category: { vi: 'Lưu trữ & Mạng Media', en: 'Media Storage & CDN' },
    desc: {
      vi: 'Xử lý nén ảnh 4K/8K không tổn hao, phân phối dữ liệu siêu tốc trên toàn cầu',
      en: 'Lossless 4K/8K media pipeline and ultra-fast global distribution',
    },
    type: 'cloudinary',
    tag: 'Global CDN',
  },
  {
    name: 'Vercel Edge Network',
    category: { vi: 'Máy chủ & Mạng Edge', en: 'Edge Compute' },
    desc: {
      vi: 'Hạ tầng triển khai hiệu năng cao với độ trễ phản hồi cực thấp dưới 50ms',
      en: 'Serverless deployment network ensuring sub-50ms latency',
    },
    type: 'vercel',
    tag: 'Edge Platform',
  },
  {
    name: 'Viện Tư Liệu & Di Sản Lịch Sử',
    category: { vi: 'Cố vấn Giám định', en: 'Historical Advisory' },
    desc: {
      vi: 'Cung cấp kho tư liệu đối chiếu chuẩn và kiểm định độ chân thực trang phục, bối cảnh',
      en: 'Archive verification and period costume authenticity consultation',
    },
    type: 'museum',
    tag: 'Heritage Archive',
  },
  {
    name: 'Hội Nhiếp Ảnh & Phục Chế Di Sản',
    category: { vi: 'Nghệ nhân Phục chế', en: 'Restoration Guild' },
    desc: {
      vi: 'Đội ngũ chuyên gia nhiếp ảnh cổ kiểm định từng điểm ảnh trước khi lưu trữ',
      en: 'Expert guild ensuring pixel-perfect artisan inspection',
    },
    type: 'heritage',
    tag: 'Artisan Guild',
  },
  {
    name: 'Quỹ Ký Ức Gia Đình Việt',
    category: { vi: 'Tài trợ Xã hội (CSR)', en: 'Community Philanthropy' },
    desc: {
      vi: 'Bảo trợ chi phí xử lý để toàn bộ người dân có thể số hóa ảnh gia đình miễn phí',
      en: 'Social grants keeping core photo restoration 100% free for families',
    },
    type: 'community',
    tag: 'Community Fund',
  },
  {
    name: 'Lab Nghiên Cứu Thị Giác Máy Tính',
    category: { vi: 'R&D Đồ họa AI', en: 'Vision AI Research' },
    desc: {
      vi: 'Tối ưu hóa thuật toán khử nhiễu ảnh film cổ và phân giải siêu cao (Super-Resolution)',
      en: 'Advanced de-noising and super-resolution model innovations',
    },
    type: 'lab',
    tag: 'AI R&D',
  },
]

function PartnerIcon({ type }: { type: PartnerItem['type'] }) {
  switch (type) {
    case 'google':
      return <Sparkles className="w-5 h-5 text-amber-500" />
    case 'supabase':
      return <Database className="w-5 h-5 text-emerald-500" />
    case 'cloudinary':
      return <Cloud className="w-5 h-5 text-blue-500" />
    case 'vercel':
      return <Cpu className="w-5 h-5 text-purple-500" />
    case 'museum':
      return <Landmark className="w-5 h-5 text-rose-500" />
    case 'heritage':
      return <Camera className="w-5 h-5 text-indigo-500" />
    case 'community':
      return <HeartHandshake className="w-5 h-5 text-orange-500" />
    case 'lab':
      return <ShieldCheck className="w-5 h-5 text-cyan-500" />
  }
}

/**
 * ClientsPartnersGrid - Khối Đối Tác & Hạ Tầng Chiến Lược trên Landing Page
 */
export default function ClientsPartnersGrid() {
  const { lang } = useLang()
  const en = lang === 'en'

  return (
    <section className="py-20 px-4 relative z-10" aria-label="Đối tác và Hạ tầng của Hồi Nét">
      <div className="max-w-7xl mx-auto">
        {/* Header với logo thương hiệu Hồi Nét */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glassmorphism-strong border border-white/60 mb-5 shadow-sm">
            <div className="relative w-6 h-6 shrink-0">
              <Image
                src={HOINET_LOGO_URL}
                alt={COMPANY.brandName}
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-gray-800 uppercase">
              {en ? 'Trusted Collaboration Ecosystem' : 'Hệ Sinh Thái Đối Tác & Hạ Tầng Chiến Lược'}
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {en ? (
              <>
                Powered by <span className="gradient-text-alt">Industry Leaders</span> & Heritage Allies
              </>
            ) : (
              <>
                Vận Hành Cùng <span className="gradient-text-alt">Đối Tác Công Nghệ Hàng Đầu</span> & Di Sản
              </>
            )}
          </h2>

          <p className="text-gray-700 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
            {en
              ? 'Backed by world-class AI cloud platforms and esteemed heritage archives to preserve every Vietnamese family memory.'
              : 'Sự kết hợp giữa hạ tầng AI đám mây đẳng cấp quốc tế và các tổ chức di sản để mỗi bức ảnh gia đình đều được hồi sinh trọn vẹn.'}
          </p>
        </motion.div>

        {/* Grid thẻ đối tác */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {PARTNER_LIST.map((p, idx) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className="glassmorphism-strong rounded-3xl p-6 border border-white/80 hover:border-primary/40 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/80 border border-gray-100 shadow-sm flex items-center justify-center">
                    <PartnerIcon type={p.type} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    {p.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{p.name}</h3>
                <p className="text-xs font-semibold text-gray-500 mb-2.5">
                  {en ? p.category.en : p.category.vi}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {en ? p.desc.en : p.desc.vi}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{en ? 'Active Integration' : 'Đang đồng hành'}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Thanh tóm tắt 4 Pha Hợp Tác Doanh Nghiệp */}
        <div className="glassmorphism-strong rounded-3xl p-6 sm:p-8 border border-white/80 text-center max-w-4xl mx-auto shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900">
                {en ? 'Need an Enterprise or Institutional Restoration Project?' : 'Dự Án Số Hóa Dành Cho Cơ Quan, Trường Học & Doanh Nghiệp?'}
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {en
                  ? 'We provide a comprehensive 4-phase framework with dedicated support and data protection.'
                  : 'Quy trình 4 Pha chuẩn hóa: Thẩm định ➔ Tinh chỉnh AI ➔ Phục chế quy mô lớn ➔ Bàn giao di sản.'}
              </p>
            </div>
            <Link
              href="/about#partners-title"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-primary text-white text-sm font-bold shadow-glow-pink hover:shadow-glow transition-all hover:scale-105 shrink-0"
            >
              <span>{en ? 'View 4 Phases' : 'Xem Chi Tiết 4 Pha'}</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
