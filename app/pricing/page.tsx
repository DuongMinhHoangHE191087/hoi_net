import Link from 'next/link'
import { Check, X } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/tháng',
      description: 'Dành cho người dùng cá nhân',
      features: [
        { name: '5 ảnh/tháng', included: true },
        { name: 'Chất lượng cơ bản', included: true },
        { name: 'Hỗ trợ email', included: true },
        { name: 'Ghép ảnh gia đình', included: false },
        { name: 'Ưu tiên xử lý', included: false },
        { name: 'Hỗ trợ 24/7', included: false }
      ],
      cta: 'Bắt Đầu',
      variant: 'secondary' as const,
      popular: false
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/tháng',
      description: 'Dành cho người dùng thường xuyên',
      features: [
        { name: '100 ảnh/tháng', included: true },
        { name: 'Chất lượng cao', included: true },
        { name: 'Hỗ trợ email', included: true },
        { name: 'Ghép ảnh gia đình', included: true },
        { name: 'Lịch sử không giới hạn', included: true },
        { name: 'Hỗ trợ 24/7', included: false }
      ],
      cta: 'Chọn Pro',
      variant: 'primary' as const,
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/tháng',
      description: 'Dành cho doanh nghiệp',
      features: [
        { name: 'Không giới hạn ảnh', included: true },
        { name: 'Chất lượng cao nhất', included: true },
        { name: 'Hỗ trợ email', included: true },
        { name: 'Ghép ảnh gia đình', included: true },
        { name: 'Ưu tiên xử lý', included: true },
        { name: 'Hỗ trợ 24/7', included: true }
      ],
      cta: 'Liên Hệ',
      variant: 'secondary' as const,
      popular: false
    }
  ]

  const faqs = [
    {
      question: 'Tôi có thể hủy gói đăng ký bất cứ lúc nào không?',
      answer: 'Có, bạn có thể hủy gói đăng ký bất cứ lúc nào. Bạn sẽ vẫn có quyền truy cập cho đến hết chu kỳ thanh toán hiện tại.'
    },
    {
      question: 'Chất lượng ảnh sau khi phục hồi như thế nào?',
      answer: 'Chúng tôi sử dụng công nghệ AI tiên tiến để đảm bảo chất lượng ảnh tốt nhất. Tùy vào gói đăng ký, bạn sẽ nhận được chất lượng từ cơ bản đến cao nhất.'
    },
    {
      question: 'Tôi có thể nâng cấp hoặc hạ cấp gói đăng ký không?',
      answer: 'Có, bạn có thể thay đổi gói đăng ký bất cứ lúc nào. Sự thay đổi sẽ có hiệu lực ngay lập tức.'
    },
    {
      question: 'Dữ liệu của tôi có được bảo mật không?',
      answer: 'Chúng tôi cam kết bảo mật tuyệt đối dữ liệu của bạn. Tất cả ảnh được mã hóa và không bao giờ được chia sẻ với bên thứ ba.'
    }
  ]

  return (
    <div className="min-h-screen gradient-mesh">
      <Navbar />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-text mb-6">
              Bảng Giá Đơn Giản
            </h1>
            <p className="text-xl text-gray-600">
              Chọn gói phù hợp với nhu cầu của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? 'border-2 border-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      Phổ Biến Nhất
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-text mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-end justify-center gap-1 mb-6">
                    <span className="text-5xl font-bold text-primary">{plan.price}</span>
                    <span className="text-gray-600 mb-2">{plan.period}</span>
                  </div>
                  <Link href="/register">
                    <Button variant={plan.variant} className="w-full">
                      {plan.cta}
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-success flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-text' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-text mb-8 text-center">
              Câu Hỏi Thường Gặp
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <h3 className="text-lg font-semibold text-text mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-text mb-4">
              Vẫn còn câu hỏi?
            </h3>
            <p className="text-gray-600 mb-6">
              Liên hệ với chúng tôi để được hỗ trợ tốt nhất
            </p>
            <Button variant="primary">Liên Hệ Ngay</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

