'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import BackgroundRemoval from '@/components/studio/BackgroundRemoval'

export default function BackgroundRemoverPage() {
  return (
    <div className="min-h-screen bg-gray-50 bg-[url('/grid-pattern.svg')]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-16 text-center">
        <div className="max-w-4xl mx-auto mb-8 text-left">
          <Link 
            href="/studio" 
            className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại Studio
          </Link>
        </div>

        <BackgroundRemoval />
      </main>
    </div>
  )
}
