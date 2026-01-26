'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, User, Settings as SettingsIcon, ImagePlus } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    interest: ''
  })

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      router.push('/dashboard')
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-text">Chào Mừng!</h1>
            <button onClick={handleSkip} className="text-gray-600 hover:text-gray-900 transition">
              Bỏ qua
            </button>
          </div>

          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full ${
                  s <= step ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-text">Thiết Lập Hồ Sơ</h2>
                <p className="text-gray-600">Cho chúng tôi biết về bạn</p>
              </div>
            </div>

            <Input
              label="Tên của bạn"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Công ty (Tùy chọn)"
              placeholder="Công ty ABC"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />

            <Button variant="primary" onClick={handleNext} className="w-full">
              Tiếp Theo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-text">Thiết Lập Sở Thích</h2>
                <p className="text-gray-600">Bạn muốn sử dụng cho mục đích gì?</p>
              </div>
            </div>

            <div className="space-y-3">
              {['Khôi phục ảnh gia đình', 'Ghép ảnh chuyên nghiệp', 'Sử dụng cá nhân', 'Kinh doanh'].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  <input
                    type="radio"
                    name="interest"
                    value={option}
                    checked={formData.interest === option}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    className="cursor-pointer"
                  />
                  <span className="text-text">{option}</span>
                </label>
              ))}
            </div>

            <Button variant="primary" onClick={handleNext} className="w-full">
              Tiếp Theo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <ImagePlus className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-text">Bắt Đầu Ngay</h2>
                <p className="text-gray-600">Tải lên ảnh đầu tiên của bạn</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition cursor-pointer">
              <ImagePlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Kéo thả ảnh vào đây hoặc</p>
              <Button variant="secondary">Chọn File</Button>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleSkip} className="flex-1">
                Làm Sau
              </Button>
              <Button variant="primary" onClick={handleNext} className="flex-1">
                Hoàn Thành
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

