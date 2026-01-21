import NotificationCenterClient from '@/components/NotificationCenterClient'

export const metadata = {
  title: 'Thông Báo | Photo Restore',
  description: 'Xem tất cả thông báo của bạn'
}

export default function NotificationsPage() {
  return <NotificationCenterClient />
}
