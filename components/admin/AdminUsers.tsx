'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Users, Search, Shield, ShieldCheck, ShieldX, UserX, UserCheck,
  Loader2, RefreshCw, AlertCircle, Mail, Phone, Calendar, Plus, X,
  Eye, EyeOff, Key, Download, Upload, Crown, UserPlus, Settings, Edit
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import UserProfileEditModal from '@/components/admin/UserProfileEditModal'
import { SafeAvatar } from '@/components/ui/SafeImage'
import { authFetch } from '@/lib/auth-fetch'
import { useAuth } from '@/lib/auth'
import { useUserRole } from '@/hooks/useUserRole'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'user' | 'editor' | 'moderator' | 'admin'
  is_blocked: boolean
  blocked_at: string | null
  blocked_reason: string | null
  created_at: string
  request_count?: number
  last_active?: string
}

const ROLE_OPTIONS = [
  { value: 'user', label: 'Người dùng', icon: Users, color: 'gray', description: 'Quyền cơ bản, có thể gửi yêu cầu' },
  { value: 'editor', label: 'Biên tập viên', icon: Edit, color: 'emerald', description: 'Chỉ được tạo và sửa bài viết blog' },
  { value: 'moderator', label: 'Kiểm duyệt viên', icon: Shield, color: 'blue', description: 'Có thể xem và xử lý yêu cầu' },
  { value: 'admin', label: 'Quản trị viên', icon: Crown, color: 'purple', description: 'Toàn quyền quản lý hệ thống' },
]

export default function AdminUsers() {
  // ✅ Get current user to prevent self-actions
  const { user } = useAuth()
  const actorRole = useUserRole()
  
  // ✅ OPTIMIZED: Trust AdminPage parent - no auth check needed
  // If this component rendered, user IS authenticated and admin
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'editor' | 'moderator' | 'admin'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // New user form
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'user' as 'user' | 'editor' | 'moderator' | 'admin',
  })
  const [showPassword, setShowPassword] = useState(false)
  const didFetch = useRef(false)

  useEffect(() => {
    // Prevent double-fetch on mount (React StrictMode)
    if (didFetch.current && process.env.NODE_ENV === 'development') {
      return
    }
    didFetch.current = true
    
    console.log('[AdminUsers] Fetching users...')
    fetchUsers()
  }, [])

  const fetchUsers = async (retryCount = 0) => {
    setLoading(true)
    setError(null)

    try {
      console.log('[AdminUsers] Fetching from /api/admin/users... (retry:', retryCount, ')')
      const response = await authFetch.get('/api/admin/users')
      console.log('[AdminUsers] Response status:', response.status)

      if (!response.ok) {
        const errData = await response.json()
        console.error('[AdminUsers] API error:', errData)
        
        // Retry on 401 (auth might not be ready yet)
        if (response.status === 401 && retryCount < 2) {
          console.log('[AdminUsers] Auth error, retrying in 1s...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchUsers(retryCount + 1)
        }
        
        throw new Error(errData.error || 'Failed to fetch users')
      }

      const data = await response.json()
      console.log('[AdminUsers] Users fetched:', data.users?.length || 0)
      setUsers(data.users || [])
      toast.success(`Đã tải ${data.users?.length || 0} người dùng`)
    } catch (err: any) {
      console.error('[AdminUsers] Fetch users error:', err)
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserForm.email || !newUserForm.password) {
      toast.error('Vui lòng điền email và mật khẩu')
      return
    }

    setActionLoading(true)
    try {
      const response = await authFetch.post('/api/admin/users/create', newUserForm)
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to create user')
      }

      toast.success('Đã tạo tài khoản thành công!')
      setShowCreateModal(false)
      setNewUserForm({ email: '', password: '', full_name: '', phone: '', role: 'user' })
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo tài khoản')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: 'user' | 'editor' | 'moderator' | 'admin') => {
    if (actorRole.role !== 'admin') {
      toast.error('Chỉ admin mới có thể thay đổi phân quyền')
      return
    }
    setActionLoading(true)
    try {
      const response = await authFetch.patch(`/api/admin/users/${userId}`, { role: newRole })
      if (!response.ok) throw new Error('Failed to update role')

      toast.success(`Đã cập nhật vai trò thành ${getRoleLabel(newRole)}`)
      setShowRoleModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật vai trò')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBlockUser = async () => {
    if (!selectedUser) return

    setActionLoading(true)
    try {
      const response = await authFetch.patch(`/api/admin/users/${selectedUser.id}`, {
        is_blocked: true,
        blocked_reason: blockReason
      })
      if (!response.ok) throw new Error('Failed to block user')

      toast.success('Đã chặn người dùng')
      setShowBlockModal(false)
      setSelectedUser(null)
      setBlockReason('')
      fetchUsers()
    } catch (err: any) {
      toast.error('Lỗi khi chặn người dùng')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnblockUser = async (userId: string) => {
    setActionLoading(true)
    try {
      const response = await authFetch.patch(`/api/admin/users/${userId}`, {
        is_blocked: false,
        blocked_reason: null
      })
      if (!response.ok) throw new Error('Failed to unblock user')

      toast.success('Đã bỏ chặn người dùng')
      fetchUsers()
    } catch (err: any) {
      toast.error('Lỗi khi bỏ chặn người dùng')
    } finally {
      setActionLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return

    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setActionLoading(true)
    try {
      const response = await authFetch.post(`/api/admin/users/${selectedUser.id}/reset-password`, {
        new_password: newPassword
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to reset password')
      }

      toast.success('Đã đặt lại mật khẩu thành công!')
      setShowResetPasswordModal(false)
      setSelectedUser(null)
      setNewPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đặt lại mật khẩu')
    } finally {
      setActionLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    const option = ROLE_OPTIONS.find(o => o.value === role)
    return option?.label || role
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'moderator': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'editor': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'user': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown
      case 'moderator': return Shield
      case 'editor': return Edit
      case 'user': return Users
      default: return Users
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery)

    const matchesRole = roleFilter === 'all' || u.role === roleFilter

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'blocked' && u.is_blocked) ||
      (statusFilter === 'active' && !u.is_blocked)

    return matchesSearch && matchesRole && matchesStatus
  })

  // Stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    moderators: users.filter(u => u.role === 'moderator').length,
    editors: users.filter(u => u.role === 'editor').length,
    blocked: users.filter(u => u.is_blocked).length,
    active: users.filter(u => !u.is_blocked).length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Quản Lý Người Dùng
          </h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản, phân quyền và trạng thái người dùng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Tạo Tài Khoản
          </Button>
          <Button variant="secondary" onClick={() => fetchUsers()} size="sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="text-center py-4">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-500">Tổng</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-500">Hoạt động</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
          <div className="text-sm text-gray-500">Admin</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-2xl font-bold text-blue-600">{stats.moderators}</div>
          <div className="text-sm text-gray-500">Moderator</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
          <div className="text-sm text-gray-500">Đã chặn</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1">
              {(['all', 'user', 'editor', 'moderator', 'admin'] as const).map((role) => (
                <Button
                  key={role}
                  variant={roleFilter === role ? 'primary' : 'secondary'}
                  onClick={() => setRoleFilter(role)}
                  size="sm"
                >
                  {role === 'all' ? 'Tất cả' : getRoleLabel(role)}
                </Button>
              ))}
            </div>
            <div className="flex gap-1">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'secondary'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                Mọi trạng thái
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'primary' : 'secondary'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                Hoạt động
              </Button>
              <Button
                variant={statusFilter === 'blocked' ? 'primary' : 'secondary'}
                onClick={() => setStatusFilter('blocked')}
                size="sm"
              >
                Đã chặn
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Chạy file migration <code className="bg-gray-100 px-2 py-1 rounded">011_complete_system_upgrade.sql</code> trong Supabase SQL Editor
          </p>
          <Button onClick={() => fetchUsers()}>Thử lại</Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredUsers.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Không có người dùng</h3>
          <p className="text-gray-500 mb-4">Chưa có người dùng nào phù hợp với bộ lọc</p>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Tạo Tài Khoản Đầu Tiên
          </Button>
        </Card>
      )}

      {/* User List */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="space-y-4">
          {filteredUsers.map((userItem) => {
            const RoleIcon = getRoleIcon(userItem.role)
            const createdDate = new Date(userItem.created_at).toLocaleString('vi-VN')

            return (
              <motion.div
                key={userItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card hover className={`relative ${userItem.is_blocked ? 'border-l-4 border-l-red-500' : ''}`}>
                  {/* Blocked Badge */}
                  {userItem.is_blocked && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                        <UserX className="w-3 h-3" />
                        Đã chặn
                      </span>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <SafeAvatar
                        src={userItem.avatar_url}
                        alt={userItem.full_name || userItem.email || 'User'}
                        size="lg"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-bold text-text truncate">
                          {userItem.full_name || 'Chưa có tên'}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getRoleColor(userItem.role)}`}>
                          <RoleIcon className="w-3 h-3" />
                          {getRoleLabel(userItem.role)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {userItem.email}
                        </span>
                        {userItem.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {userItem.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {createdDate}
                        </span>
                      </div>

                      {userItem.blocked_reason && (
                        <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                          Lý do chặn: {userItem.blocked_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2 flex-wrap">
                    {userItem.id !== user?.id ? (
                      <>
                        {/* Edit Profile */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(userItem)
                            setShowEditProfileModal(true)
                          }}
                          disabled={actionLoading}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Sửa hồ sơ
                        </Button>

                        {/* Change Role */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            if (actorRole.role !== 'admin') {
                              toast.error('Chỉ admin mới có thể thay đổi phân quyền')
                              return
                            }
                            setSelectedUser(userItem)
                            setShowRoleModal(true)
                          }}
                          disabled={actionLoading}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Phân quyền
                        </Button>

                        {/* Reset Password */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(userItem)
                            setNewPassword('')
                            setShowResetPasswordModal(true)
                          }}
                          disabled={actionLoading}
                        >
                          <Key className="w-4 h-4 mr-1" />
                          Reset mật khẩu
                        </Button>

                        {/* Block/Unblock */}
                        {!userItem.is_blocked ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(userItem)
                              setShowBlockModal(true)
                            }}
                            disabled={actionLoading}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Chặn
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUnblockUser(userItem.id)}
                            disabled={actionLoading}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Bỏ chặn
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-500 italic flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        Đây là tài khoản của bạn
                      </span>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-primary" />
                  Tạo Tài Khoản Mới
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                      placeholder="Nhập mật khẩu..."
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    value={newUserForm.full_name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                    placeholder="0123 456 789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò
                  </label>
                  <div className="space-y-2">
                    {ROLE_OPTIONS.map((role) => {
                      const RoleIcon = role.icon
                      return (
                        <label
                          key={role.value}
                          className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            newUserForm.role === role.value
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={newUserForm.role === role.value}
                            onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                            className="sr-only"
                          />
                          <RoleIcon className={`w-5 h-5 mr-3 text-${role.color}-600`} />
                          <div>
                            <div className="font-medium text-gray-800">{role.label}</div>
                            <div className="text-xs text-gray-500">{role.description}</div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={actionLoading}
                    className="flex-1"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Tạo tài khoản
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Role Modal */}
      <AnimatePresence>
        {showRoleModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRoleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-primary" />
                  Phân Quyền
                </h3>
                <button onClick={() => setShowRoleModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Thay đổi vai trò cho:</p>
                <p className="font-semibold text-gray-800">{selectedUser.full_name || selectedUser.email}</p>
              </div>

              <div className="space-y-2">
                {ROLE_OPTIONS.map((role) => {
                  const RoleIcon = role.icon
                  const isSelected = selectedUser.role === role.value
                  return (
                    <button
                      key={role.value}
                      onClick={() => handleUpdateRole(selectedUser.id, role.value as any)}
                      disabled={actionLoading || isSelected}
                      className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 cursor-default'
                          : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                      } ${actionLoading ? 'opacity-50' : ''}`}
                    >
                      <RoleIcon className={`w-6 h-6 mr-3 text-${role.color}-600`} />
                      <div className="text-left flex-1">
                        <div className="font-medium text-gray-800">{role.label}</div>
                        <div className="text-xs text-gray-500">{role.description}</div>
                      </div>
                      {isSelected && (
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Hiện tại</span>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button variant="secondary" onClick={() => setShowRoleModal(false)} className="w-full">
                  Đóng
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block User Modal */}
      <AnimatePresence>
        {showBlockModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBlockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UserX className="w-6 h-6 text-red-500" />
                Chặn Người Dùng
              </h3>

              <p className="text-gray-600 mb-4">
                Bạn có chắc muốn chặn <strong>{selectedUser.full_name || selectedUser.email}</strong>?
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do chặn (tùy chọn)
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                  rows={3}
                  placeholder="Nhập lý do chặn người dùng..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowBlockModal(false)
                    setSelectedUser(null)
                    setBlockReason('')
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  onClick={handleBlockUser}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserX className="w-4 h-4 mr-2" />
                  )}
                  Xác nhận chặn
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      {selectedUser && (
        <UserProfileEditModal
          user={selectedUser}
          isOpen={showEditProfileModal}
          onClose={() => {
            setShowEditProfileModal(false)
            setSelectedUser(null)
          }}
          onSuccess={fetchUsers}
        />
      )}

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetPasswordModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowResetPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Key className="w-6 h-6 text-primary" />
                  Đặt Lại Mật Khẩu
                </h3>
                <button onClick={() => setShowResetPasswordModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Đặt lại mật khẩu cho:</p>
                <p className="font-semibold text-gray-800">{selectedUser.full_name || selectedUser.email}</p>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                    placeholder="Nhập mật khẩu mới..."
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowResetPasswordModal(false)
                    setSelectedUser(null)
                    setNewPassword('')
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  onClick={handleResetPassword}
                  disabled={actionLoading || !newPassword || newPassword.length < 6}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4 mr-2" />
                  )}
                  Xác nhận
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

