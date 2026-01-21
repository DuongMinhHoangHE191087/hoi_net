#!/usr/bin/env node
/**
 * Generate Security Secrets
 * Auto-generate and append to .env.local
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// Generate secure random string
function generateSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex')
}

// Read existing .env.local
const envPath = path.join(__dirname, '..', '.env.local')
let envContent = ''

try {
  envContent = fs.readFileSync(envPath, 'utf8')
} catch (error) {
  console.log('📝 .env.local không tồn tại, sẽ tạo mới...')
}

// Check if secrets already exist
const hasCookieSecret = envContent.includes('COOKIE_SECRET=')
const hasCSRFSecret = envContent.includes('CSRF_SECRET=')

if (hasCookieSecret && hasCSRFSecret) {
  console.log('✅ Secrets đã tồn tại trong .env.local')
  console.log('💡 Để tạo lại, xóa dòng COOKIE_SECRET và CSRF_SECRET trong .env.local')
  process.exit(0)
}

// Generate new secrets
const cookieSecret = generateSecret(32)
const csrfSecret = generateSecret(32)

// Prepare new content
let newContent = envContent

// Add header if not exists
if (!newContent.includes('# Cookie Security')) {
  newContent += '\n\n# ========================================\n'
  newContent += '# Cookie Security Configuration\n'
  newContent += '# Auto-generated: ' + new Date().toISOString() + '\n'
  newContent += '# ========================================\n'
}

// Add secrets
if (!hasCookieSecret) {
  newContent += `COOKIE_SECRET=${cookieSecret}\n`
}

if (!hasCSRFSecret) {
  newContent += `CSRF_SECRET=${csrfSecret}\n`
}

// Write to file
fs.writeFileSync(envPath, newContent, 'utf8')

// Display results
console.log('\n🎉 Secrets đã được tạo và lưu vào .env.local!\n')
console.log('📋 Generated Secrets:')
console.log('━'.repeat(70))
console.log(`COOKIE_SECRET=${cookieSecret}`)
console.log(`CSRF_SECRET=${csrfSecret}`)
console.log('━'.repeat(70))
console.log('\n✅ Next Steps:')
console.log('1. Restart dev server: npm run dev')
console.log('2. Verify trong browser DevTools → Application → Cookies')
console.log('3. Check flags: HttpOnly ✓, Secure ✓, SameSite ✓\n')
console.log('🔒 IMPORTANT: Không commit .env.local lên Git!')
console.log('💡 File .env.local đã có trong .gitignore\n')
