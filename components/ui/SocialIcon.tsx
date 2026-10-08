import { Facebook, Linkedin, Twitter, Youtube } from 'lucide-react'
import type { SocialLink } from '@/lib/company-info'

interface SocialIconProps {
  name: SocialLink['key']
  className?: string
}

/** Icon mạng xã hội. lucide-react không có TikTok nên dùng SVG nội tuyến. */
export default function SocialIcon({ name, className = 'w-4 h-4' }: SocialIconProps) {
  switch (name) {
    case 'facebook':
      return <Facebook className={className} aria-hidden="true" />
    case 'x':
      return <Twitter className={className} aria-hidden="true" />
    case 'linkedin':
      return <Linkedin className={className} aria-hidden="true" />
    case 'youtube':
      return <Youtube className={className} aria-hidden="true" />
    case 'tiktok':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M19.6 6.7a4.9 4.9 0 0 1-3.8-4.2V2h-3.4v13.4a2.9 2.9 0 1 1-2-2.8V9.2a6.3 6.3 0 1 0 5.4 6.2V9a8.2 8.2 0 0 0 4.8 1.5V7.1a4.8 4.8 0 0 1-1-.4Z" />
        </svg>
      )
    default:
      return null
  }
}
