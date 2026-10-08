import type { Tone } from '@/lib/about-content'

/**
 * Bảng màu dùng chung cho các section About. Mỗi class được viết đầy đủ
 * (không ghép chuỗi) để Tailwind JIT nhận diện được.
 */
export const TONES: Record<
  Tone,
  { gradient: string; glow: string; soft: string; text: string; hex: string }
> = {
  pink: {
    gradient: 'bg-gradient-primary',
    glow: 'hover:shadow-glow-pink',
    soft: 'bg-primary/10',
    text: 'text-primary',
    hex: '#FF6B9D',
  },
  blue: {
    gradient: 'bg-gradient-blue',
    glow: 'hover:shadow-glow-blue',
    soft: 'bg-soft-blue-bg',
    text: 'text-soft-blue-DEFAULT',
    hex: '#4F8FFF',
  },
  green: {
    gradient: 'bg-gradient-green',
    glow: 'hover:shadow-glow-green',
    soft: 'bg-soft-green-bg',
    text: 'text-soft-green-DEFAULT',
    hex: '#4ECB71',
  },
  orange: {
    gradient: 'bg-gradient-orange',
    glow: 'hover:shadow-glow-orange',
    soft: 'bg-soft-orange-bg',
    text: 'text-soft-orange-DEFAULT',
    hex: '#FF8F6B',
  },
  purple: {
    gradient: 'bg-gradient-purple',
    glow: 'hover:shadow-glow-purple',
    soft: 'bg-soft-purple-bg',
    text: 'text-soft-purple-DEFAULT',
    hex: '#8B7FD4',
  },
  cyan: {
    gradient: 'bg-gradient-cyan',
    glow: 'hover:shadow-glow-cyan',
    soft: 'bg-soft-cyan-bg',
    text: 'text-soft-cyan-DEFAULT',
    hex: '#6BCFCF',
  },
}
