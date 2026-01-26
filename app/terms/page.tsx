'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileText, ChevronLeft, Shield, Users, AlertTriangle, Scale } from 'lucide-react'

export default function TermsPage() {
  const sections = [
    {
      icon: Users,
      title: '1. Điều Kiện Sử Dụng',
      content: [
        'Bằng việc truy cập và sử dụng dịch vụ Hồi Nét, bạn đồng ý tuân thủ các điều khoản này.',
        'Bạn phải đủ 13 tuổi trở lên để sử dụng dịch vụ.',
        'Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình.',
        'Nghiêm cấm sử dụng dịch vụ cho mục đích bất hợp pháp.'
      ]
    },
    {
      icon: FileText,
      title: '2. Dịch Vụ Của Chúng Tôi',
      content: [
        'Hồi Nét cung cấp dịch vụ khôi phục ảnh cũ sử dụng công nghệ AI.',
        'Chúng tôi cung cấp dịch vụ ghép ảnh gia đình chuyên nghiệp.',
        'Kết quả xử lý phụ thuộc vào chất lượng ảnh gốc.',
        'Chúng tôi có quyền từ chối xử lý nội dung không phù hợp.'
      ]
    },
    {
      icon: Shield,
      title: '3. Quyền Sở Hữu Trí Tuệ',
      content: [
        'Bạn giữ toàn bộ quyền sở hữu đối với ảnh gốc của mình.',
        'Bạn có quyền sử dụng ảnh đã xử lý cho mục đích cá nhân.',
        'Nghiêm cấm sao chép, phân phối giao diện và mã nguồn của Hồi Nét.',
        'Logo, thương hiệu Hồi Nét thuộc sở hữu của chúng tôi.'
      ]
    },
    {
      icon: AlertTriangle,
      title: '4. Giới Hạn Trách Nhiệm',
      content: [
        'Dịch vụ được cung cấp "nguyên trạng" không có bảo đảm.',
        'Chúng tôi không chịu trách nhiệm về thiệt hại gián tiếp.',
        'Giới hạn bồi thường tối đa bằng số tiền bạn đã thanh toán.',
        'Bạn nên sao lưu ảnh gốc trước khi sử dụng dịch vụ.'
      ]
    },
    {
      icon: Scale,
      title: '5. Thay Đổi Điều Khoản',
      content: [
        'Chúng tôi có thể cập nhật điều khoản này bất cứ lúc nào.',
        'Thay đổi sẽ có hiệu lực ngay khi được đăng tải.',
        'Tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp nhận thay đổi.',
        'Vui lòng kiểm tra trang này thường xuyên để cập nhật.'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại trang chủ
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Điều Khoản Sử Dụng</h1>
              <p className="text-muted-foreground">Cập nhật lần cuối: Tháng 1, 2026</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border rounded-2xl p-6 mb-8"
          >
            <p className="text-lg text-muted-foreground">
              Chào mừng bạn đến với <strong className="text-foreground">Hồi Nét</strong>. 
              Vui lòng đọc kỹ các điều khoản sử dụng dưới đây trước khi sử dụng dịch vụ của chúng tôi.
              Bằng việc sử dụng dịch vụ, bạn đồng ý với các điều khoản này.
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 2) }}
                className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                    <ul className="space-y-3">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center"
          >
            <h3 className="text-lg font-semibold mb-2">Có câu hỏi?</h3>
            <p className="text-muted-foreground mb-4">
              Liên hệ với chúng tôi nếu bạn cần giải đáp về điều khoản sử dụng.
            </p>
            <a 
              href="mailto:duongminhhoanginwork@gmail.com" 
              className="text-primary font-medium hover:underline"
            >
              duongminhhoanginwork@gmail.com
            </a>
          </motion.div>

          {/* Related Links */}
          <div className="mt-8 flex justify-center gap-4">
            <Link 
              href="/privacy" 
              className="text-primary hover:underline font-medium"
            >
              Chính Sách Bảo Mật →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
