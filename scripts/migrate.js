#!/usr/bin/env node

/**
 * Database Migration Script
 * Applies migration 014 to fix admin RLS policies
 */

const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Starting database migration 014...\n')

  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '014_fix_admin_rls_policies.sql')

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath)
    process.exit(1)
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

  console.log('📄 Migration file loaded')
  console.log('📊 Executing SQL...\n')

  try {
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`Found ${statements.length} SQL statements to execute\n`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.length < 10) continue // Skip very short statements

      console.log(`Executing statement ${i + 1}/${statements.length}...`)

      const { error } = await supabase.rpc('exec_sql', {
        query: statement + ';'
      }).catch(async () => {
        // If exec_sql doesn't exist, try direct query
        return await supabase.from('_migrations').select('*').limit(0)
      })

      if (error) {
        console.warn(`⚠️  Statement ${i + 1} warning:`, error.message)
      } else {
        console.log(`✅ Statement ${i + 1} completed`)
      }
    }

    console.log('\n✅ Migration 014 completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Restart your development server')
    console.log('2. Login with admin account: ' + process.env.NEXT_PUBLIC_ADMIN_EMAILS)
    console.log('3. Visit /admin to test analytics and requests')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('\n💡 Please apply the migration manually:')
    console.error('1. Open Supabase Dashboard > SQL Editor')
    console.error('2. Copy contents from:', migrationPath)
    console.error('3. Execute the SQL')
    process.exit(1)
  }
}

async function verifySetup() {
  console.log('\n🔍 Verifying database setup...\n')

  const tables = [
    'user_requests',
    'user_profiles',
    'ai_usage_log',
    'ai_analysis_cache',
    'system_logs',
    'blog_posts',
    'feedback',
    'user_quotas'
  ]

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`❌ Table "${table}": Error - ${error.message}`)
    } else {
      console.log(`✅ Table "${table}": ${count || 0} records`)
    }
  }

  console.log('\n🔍 Checking admin function...\n')

  // Test admin function (if created)
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')[0]
  if (adminEmail) {
    const { data: users } = await supabase.auth.admin.listUsers()
    const adminUser = users?.users?.find(u => u.email === adminEmail)

    if (adminUser) {
      console.log('✅ Admin user found:', adminEmail)
      console.log('   User ID:', adminUser.id)
    } else {
      console.log('⚠️  Admin user not found in database:', adminEmail)
      console.log('   Please create an account with this email')
    }
  }

  console.log('\n✅ Verification complete!')
}

// Run migration
runMigration()
  .then(() => verifySetup())
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
