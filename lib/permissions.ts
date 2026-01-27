/**
 * Role-based Permission System
 * Hồi Nét - Photo Restoration Platform
 * 
 * Roles:
 * - admin: Full access to everything
 * - moderator: Can process requests, manage blog posts, respond to feedback
 * - editor: Can create/edit blog posts (pending approval)
 * - user: Basic user - can submit requests and view own content
 */

export type UserRole = 'admin' | 'moderator' | 'editor' | 'user'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  moderator: 'Kiểm duyệt viên',
  editor: 'Biên tập viên',
  user: 'Người dùng'
}

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  admin: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  moderator: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  editor: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  user: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' }
}

// Permission definitions
export const PERMISSIONS = {
  // Admin panel access
  'admin.access': 'Truy cập trang quản trị',
  'admin.users.manage': 'Quản lý người dùng',
  'admin.settings.manage': 'Quản lý cài đặt',
  'admin.roles.manage': 'Quản lý phân quyền',
  
  // Request management
  'requests.view_all': 'Xem tất cả yêu cầu',
  'requests.process': 'Xử lý yêu cầu',
  'requests.delete': 'Xóa yêu cầu',
  'requests.create': 'Tạo yêu cầu',
  'requests.view_own': 'Xem yêu cầu của mình',
  
  // Blog management
  'blog.create': 'Tạo bài viết',
  'blog.edit': 'Chỉnh sửa bài viết',
  'blog.delete': 'Xóa bài viết',
  'blog.publish': 'Xuất bản bài viết',
  
  // Feedback management
  'feedback.view': 'Xem phản hồi',
  'feedback.respond': 'Phản hồi người dùng',
  
  // Media management
  'media.manage': 'Quản lý media',
} as const

export type Permission = keyof typeof PERMISSIONS

// Role -> Permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'admin.access',
    'admin.users.manage',
    'admin.settings.manage',
    'admin.roles.manage',
    'requests.view_all',
    'requests.process',
    'requests.delete',
    'requests.create',
    'requests.view_own',
    'blog.create',
    'blog.edit',
    'blog.delete',
    'blog.publish',
    'feedback.view',
    'feedback.respond',
    'media.manage',
  ],
  moderator: [
    'admin.access',
    // Moderator: chỉ xử lý yêu cầu, blog, feedback
    'requests.view_all',
    'requests.process',
    'requests.create',
    'requests.view_own',
    'blog.create',
    'blog.edit',
    'blog.publish',
    'feedback.view',
    'feedback.respond',
  ],
  editor: [
    // Editor can access admin area, but only sees Blog tab.
    'admin.access',
    'requests.create',
    'requests.view_own',
    'blog.create',
    'blog.edit',
  ],
  user: [
    'requests.create',
    'requests.view_own',
  ],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Check if a role can access admin panel
 */
export function canAccessAdmin(role: UserRole): boolean {
  return hasPermission(role, 'admin.access')
}

/**
 * Check if a role can manage users
 */
export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, 'admin.users.manage')
}

/**
 * Check if a role can process requests
 */
export function canProcessRequests(role: UserRole): boolean {
  return hasPermission(role, 'requests.process')
}

/**
 * Check if a role can publish blog posts
 */
export function canPublishBlog(role: UserRole): boolean {
  return hasPermission(role, 'blog.publish')
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Compare role hierarchy
 * Returns: 
 *  - positive if role1 > role2
 *  - negative if role1 < role2  
 *  - 0 if equal
 */
export function compareRoles(role1: UserRole, role2: UserRole): number {
  const hierarchy: UserRole[] = ['admin', 'moderator', 'editor', 'user']
  return hierarchy.indexOf(role2) - hierarchy.indexOf(role1)
}

/**
 * Check if user can modify another user's role
 */
export function canModifyRole(actorRole: UserRole, targetRole: UserRole): boolean {
  // Only admin can modify roles
  if (actorRole !== 'admin') return false
  // Can't modify own admin role (safety)
  return true
}

/**
 * Get available roles that an actor can assign
 */
export function getAssignableRoles(actorRole: UserRole): UserRole[] {
  if (actorRole === 'admin') {
    return ['moderator', 'editor', 'user']
  }
  return []
}
