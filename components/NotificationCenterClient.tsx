'use client'

import { useState } from 'react'
import { Bell, Filter, CheckCheck, Trash2, Settings } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/hooks/useNotifications'
import { getNotificationColor, getNotificationIcon } from '@/lib/notifications-client'
import type { Notification } from '@/lib/notifications-client'
import { formatRelativeTime } from '@/lib/date-utils'
import { useRouter } from 'next/navigation'

export default function NotificationCenterClient() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const { data, isLoading } = useNotifications(filter === 'unread')
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id)
    }

    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  const getColorClasses = (type: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
      gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' }
    }
    return colorMap[type] || colorMap.gray
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-pink-500" />
            Trung Tâm Thông Báo
          </h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Bạn đã đọc hết thông báo'}
          </p>
        </div>

        {/* Actions */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'secondary'}
                onClick={() => setFilter('all')}
              >
                <Bell className="w-4 h-4 mr-2" />
                Tất cả ({data?.total || 0})
              </Button>
              <Button
                variant={filter === 'unread' ? 'primary' : 'secondary'}
                onClick={() => setFilter('unread')}
              >
                <Filter className="w-4 h-4 mr-2" />
                Chưa đọc ({unreadCount})
              </Button>
            </div>

            <div className="flex gap-2 ml-auto">
              {unreadCount > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => markAllAsRead.mutate()}
                  loading={markAllAsRead.isPending}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Đánh dấu đã đọc
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => router.push('/settings?tab=notifications')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt
              </Button>
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Đang tải thông báo...</p>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'Bạn đã đọc hết tất cả thông báo'
                : 'Thông báo sẽ xuất hiện ở đây khi có cập nhật mới'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification: Notification) => {
              const color = getNotificationColor(notification.type)
              const classes = getColorClasses(color)

              return (
                <Card
                  key={notification.id}
                  className={`p-5 hover:shadow-md transition cursor-pointer ${
                    !notification.read ? 'border-l-4 border-l-pink-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${classes.bg} ${classes.border}`}>
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className={`text-lg font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full">
                            Mới
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 mb-3">{notification.message}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${classes.bg} ${classes.text}`}>
                            {notification.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatRelativeTime(notification.created_at)}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {notification.action_label && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNotificationClick(notification)
                              }}
                            >
                              {notification.action_label}
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification.mutate(notification.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Load More */}
        {notifications.length > 0 && data?.total > notifications.length && (
          <div className="mt-6 text-center">
            <Button variant="secondary">Tải thêm</Button>
          </div>
        )}
      </div>
    </div>
  )
}
