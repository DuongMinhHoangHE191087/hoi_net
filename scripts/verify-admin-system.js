#!/usr/bin/env node

/**
 * Admin System Verification Script
 *
 * Script này tự động kiểm tra xem hệ thống admin đã được setup đúng chưa
 *
 * Usage:
 *   node scripts/verify-admin-system.js
 *
 * Or with bun:
 *   bun scripts/verify-admin-system.js
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'duongminhhoanggame@gmail.com'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan')
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'bright')
  log(title, 'bright')
  log('='.repeat(60), 'bright')
}

async function verifyAdminSystem() {
  section('🔍 ADMIN SYSTEM VERIFICATION')

  // Step 1: Check environment variables
  section('1. Environment Variables Check')

  if (!SUPABASE_URL) {
    error('NEXT_PUBLIC_SUPABASE_URL không tồn tại trong .env.local')
    return false
  }
  success(`Supabase URL: ${SUPABASE_URL}`)

  if (!SUPABASE_SERVICE_KEY) {
    error('SUPABASE_SERVICE_ROLE_KEY không tồn tại trong .env.local')
    warning('Bạn cần service role key để chạy script này')
    return false
  }
  success('Supabase Service Key: ✓')

  info(`Admin email để kiểm tra: ${ADMIN_EMAIL}`)

  // Step 2: Connect to database
  section('2. Database Connection')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Test connection by querying auth.users
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (testError && testError.code !== 'PGRST116') { // PGRST116 = empty result
      error(`Không thể kết nối database: ${testError.message}`)
      return false
    }

    success('Kết nối database thành công')
  } catch (err) {
    error(`Lỗi kết nối: ${err.message}`)
    return false
  }

  // Step 3: Check if user exists
  section('3. User Existence Check')

  let userId = null
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .eq('email', ADMIN_EMAIL)
      .single()

    if (error) {
      error(`User không tồn tại trong database: ${ADMIN_EMAIL}`)
      warning('Bạn cần đăng ký tài khoản trước')
      return false
    }

    userId = data.id
    success(`User tìm thấy: ${data.email}`)
    info(`User ID: ${userId}`)
    info(`Created: ${new Date(data.created_at).toLocaleString()}`)
  } catch (err) {
    error(`Lỗi kiểm tra user: ${err.message}`)
    return false
  }

  // Step 4: Check admin_users table exists
  section('4. Admin Users Table Check')

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .limit(1)

    if (error) {
      if (error.code === '42P01') { // Table does not exist
        error('Table admin_users không tồn tại')
        warning('Chạy migration 016b_admin_users_safe.sql để tạo table')
        return false
      }
      throw error
    }

    success('Table admin_users tồn tại')
  } catch (err) {
    error(`Lỗi kiểm tra table: ${err.message}`)
    return false
  }

  // Step 5: Check if user is admin
  section('5. Admin Status Check')

  let isAdmin = false
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id, granted_at, granted_by, permissions')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        warning(`User ${ADMIN_EMAIL} CHƯA được grant admin`)
        info('Chạy script sau để grant admin:')
        console.log('\n' + colors.cyan + `
INSERT INTO public.admin_users (user_id, granted_by, permissions)
VALUES ('${userId}', '${userId}', '{"full_access": true}'::jsonb)
ON CONFLICT (user_id) DO UPDATE SET
  permissions = '{"full_access": true}'::jsonb,
  granted_at = NOW();
        `.trim() + colors.reset + '\n')
        return false
      }
      throw error
    }

    isAdmin = true
    success(`User ${ADMIN_EMAIL} là ADMIN ✓`)
    info(`Granted at: ${new Date(data.granted_at).toLocaleString()}`)
    info(`Permissions: ${JSON.stringify(data.permissions, null, 2)}`)
  } catch (err) {
    error(`Lỗi kiểm tra admin status: ${err.message}`)
    return false
  }

  // Step 6: Check is_admin() function
  section('6. Database Function Check')

  try {
    const { data, error } = await supabase
      .rpc('is_admin', { check_user_id: userId })

    if (error) {
      if (error.code === '42883') { // Function does not exist
        error('Function is_admin() không tồn tại')
        warning('Chạy migration để tạo function')
        return false
      }
      throw error
    }

    if (data === true) {
      success('Function is_admin() hoạt động đúng')
    } else {
      error('Function is_admin() trả về false (không đúng)')
      warning('Có thể function không được cập nhật đúng')
      return false
    }
  } catch (err) {
    error(`Lỗi kiểm tra function: ${err.message}`)
    return false
  }

  // Step 7: Check get_user_role() function
  section('7. User Role Function Check')

  try {
    const { data, error } = await supabase
      .rpc('get_user_role', { user_id: userId })

    if (error) {
      if (error.code === '42883') { // Function does not exist
        warning('Function get_user_role() không tồn tại (optional)')
      } else {
        throw error
      }
    } else {
      if (data === 'admin') {
        success(`Function get_user_role() trả về: '${data}'`)
      } else {
        warning(`Function get_user_role() trả về: '${data}' (expected 'admin')`)
      }
    }
  } catch (err) {
    warning(`Lỗi kiểm tra get_user_role: ${err.message}`)
  }

  // Step 8: Check AdminService file exists
  section('8. AdminService File Check')

  try {
    const fs = await import('fs')
    const path = await import('path')

    const adminServicePath = path.resolve(process.cwd(), 'lib/admin-service.ts')

    if (!fs.existsSync(adminServicePath)) {
      error('File lib/admin-service.ts không tồn tại')
      return false
    }

    success('File lib/admin-service.ts tồn tại')

    const content = fs.readFileSync(adminServicePath, 'utf-8')

    // Check for key exports
    if (content.includes('export class AdminService')) {
      success('AdminService class được export')
    } else {
      error('AdminService class không tìm thấy')
      return false
    }

    if (content.includes('static async isAdmin')) {
      success('Method AdminService.isAdmin() tồn tại')
    } else {
      error('Method AdminService.isAdmin() không tìm thấy')
      return false
    }

    if (content.includes('export function useAdminCheck')) {
      success('Hook useAdminCheck() được export')
    } else {
      warning('Hook useAdminCheck() không tìm thấy (optional)')
    }
  } catch (err) {
    error(`Lỗi kiểm tra files: ${err.message}`)
    return false
  }

  // Step 9: Final Summary
  section('✨ VERIFICATION SUMMARY')

  if (isAdmin) {
    success('TẤT CẢ KIỂM TRA ĐÃ PASS ✅')
    console.log('')
    log('Hệ thống admin đã được setup đúng:', 'bright')
    log('  ✓ Database connected', 'green')
    log('  ✓ User exists', 'green')
    log('  ✓ Admin table exists', 'green')
    log(`  ✓ ${ADMIN_EMAIL} is admin`, 'green')
    log('  ✓ Database functions working', 'green')
    log('  ✓ AdminService files exist', 'green')
    console.log('')
    log('Bạn có thể:', 'cyan')
    log('  1. Restart dev server: bun run dev', 'cyan')
    log('  2. Login với email: ' + ADMIN_EMAIL, 'cyan')
    log('  3. Truy cập: http://localhost:3000/admin', 'cyan')
    console.log('')
    return true
  } else {
    error('MỘT SỐ KIỂM TRA THẤT BẠI ❌')
    console.log('')
    log('Vui lòng xem các bước trên để fix', 'yellow')
    console.log('')
    return false
  }
}

// Run verification
verifyAdminSystem()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((err) => {
    error(`Uncaught error: ${err.message}`)
    console.error(err)
    process.exit(1)
  })
