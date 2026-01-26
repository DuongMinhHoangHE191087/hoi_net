'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, ChevronLeft, Database, Eye, Lock, Bell, Trash2, Globe } from 'lucide-react'

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: '1. Thông Tin Thu Thập',
      content: [
        'Email và tên khi bạn đăng ký tài khoản.',
        'Ảnh bạn tải lên để sử dụng dịch vụ.',
        'Thông tin thanh toán khi mua gói dịch vụ.',
        'Dữ liệu sử dụng và nhật ký truy cập.'
      ]
    },
    {
      icon: Eye,
      title: '2. Cách Sử Dụng Thông Tin',
      content: [
        'Cung cấp và cải thiện dịch vụ khôi phục ảnh.',
        'Gửi thông báo về đơn hàng và cập nhật dịch vụ.',
        'Hỗ trợ khách hàng khi có yêu cầu.',
        'Phân tích để nâng cao trải nghiệm người dùng.'
      ]
    },
    {
      icon: Lock,
      title: '3. Bảo Mật Dữ Liệu',
      content: [
        'Mã hóa dữ liệu truyền tải bằng SSL/TLS.',
        'Lưu trữ an toàn trên hệ thống đám mây bảo mật.',
        'Giới hạn quyền truy cập nội bộ theo nguyên tắc cần biết.',
        'Kiểm tra bảo mật định kỳ.'
      ]
    },
    {
      icon: Globe,
      title: '4. Chia Sẻ Thông Tin',
      content: [
        'Không bán thông tin cá nhân cho bên thứ ba.',
        'Chỉ chia sẻ với đối tác xử lý thanh toán khi cần.',
        'Có thể chia sẻ theo yêu cầu pháp luật.',
        'Dữ liệu ẩn danh có thể được sử dụng cho nghiên cứu.'
      ]
    },
    {
      icon: Bell,
      title: '5. Cookie & Tracking',
      content: [
        'Sử dụng cookie để duy trì phiên đăng nhập.',
        'Cookie phân tích để cải thiện dịch vụ.',
        'Bạn có thể tắt cookie trong trình duyệt.',
        'Một số tính năng có thể bị ảnh hưởng khi tắt cookie.'
      ]
    },
    {
      icon: Trash2,
      title: '6. Quyền Của Bạn',
      content: [
        'Yêu cầu xem dữ liệu cá nhân chúng tôi lưu trữ.',
        'Yêu cầu chỉnh sửa thông tin không chính xác.',
        'Yêu cầu xóa tài khoản và dữ liệu liên quan.',
        'Rút lại sự đồng ý bất cứ lúc nào.'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="bg-emerald-500/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-emerald-600 transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại trang chủ
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Chính Sách Bảo Mật</h1>
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
              Tại <strong className="text-foreground">Hồi Nét</strong>, chúng tôi cam kết bảo vệ quyền riêng tư của bạn.
              Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn
              khi sử dụng dịch vụ khôi phục ảnh của chúng tôi.
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
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                    <ul className="space-y-3">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Retention Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-600" />
              Thời Gian Lưu Trữ
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Ảnh tải lên: Xóa sau 30 ngày nếu không có yêu cầu xử lý</li>
              <li>• Ảnh đã xử lý: Lưu trữ 90 ngày để bạn tải về</li>
              <li>• Thông tin tài khoản: Lưu trữ cho đến khi bạn yêu cầu xóa</li>
              <li>• Nhật ký truy cập: Xóa sau 12 tháng</li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center"
          >
            <h3 className="text-lg font-semibold mb-2">Liên Hệ Về Quyền Riêng Tư</h3>
            <p className="text-muted-foreground mb-4">
              Nếu bạn có câu hỏi hoặc muốn thực hiện quyền của mình, vui lòng liên hệ.
            </p>
            <a 
              href="mailto:duongminhhoanginwork@gmail.com" 
              className="text-emerald-600 font-medium hover:underline"
            >
              duongminhhoanginwork@gmail.com
            </a>
          </motion.div>

          {/* Related Links */}
          <div className="mt-8 flex justify-center gap-4">
            <Link 
              href="/terms" 
              className="text-primary hover:underline font-medium"
            >
              ← Điều Khoản Sử Dụng
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
