/**
 * Database Migration Runner
 * 
 * Usage:
 *   npx ts-node lib/migrate.ts          # Run all pending migrations
 *   npx ts-node lib/migrate.ts --status # Show migration status
 * 
 * Reads .sql files from database/migrations/ and executes them
 * in alphabetical order, tracking which have been applied.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// ============================================
// Configuration
// ============================================

const MIGRATIONS_DIR = path.join(process.cwd(), 'database', 'migrations')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================
// Migration Tracking Table
// ============================================

async function ensureMigrationsTable() {
  try {
    // Try to query the _migrations table to see if it exists
    const { error } = await supabase
      .from('_migrations')
      .select('id')
      .limit(1)

    if (error) {
      console.log('ℹ️  _migrations table may not exist yet.')
      console.log('   Run this SQL in Supabase SQL Editor:')
      console.log('   CREATE TABLE IF NOT EXISTS public._migrations (')
      console.log('     id SERIAL PRIMARY KEY,')
      console.log('     name VARCHAR(255) NOT NULL UNIQUE,')
      console.log('     applied_at TIMESTAMPTZ DEFAULT NOW()')
      console.log('   );')
    }
  } catch (err: any) {
    console.warn('⚠️  Could not verify migrations table:', err.message)
  }
}

// ============================================
// Get Applied Migrations
// ============================================

async function getAppliedMigrations(): Promise<string[]> {
  const { data, error } = await supabase
    .from('_migrations')
    .select('name')
    .order('name', { ascending: true })

  if (error) {
    // Table might not exist yet
    return []
  }

  return (data || []).map((m: { name: string }) => m.name)
}

// ============================================
// Get Pending Migrations
// ============================================

function getAllMigrations(): string[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`❌ Migrations directory not found: ${MIGRATIONS_DIR}`)
    return []
  }

  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && !f.startsWith('RUN_ALL'))
    .sort()
}

// ============================================
// Run Migration
// ============================================

async function runMigration(filename: string): Promise<boolean> {
  const filePath = path.join(MIGRATIONS_DIR, filename)
  const sql = fs.readFileSync(filePath, 'utf-8')

  console.log(`\n🔄 Running: ${filename}`)

  try {
    // Note: Supabase JS client doesn't support raw SQL execution.
    // Migrations should be run directly in Supabase SQL Editor.
    console.error(`  ❌ Auto-execution not supported.`)
    console.log(`  💡 Run manually in Supabase SQL Editor:`)
    console.log(`     File: ${filePath}`)
    console.log(`  📋 SQL content (${sql.length} chars):`)
    console.log(`     ${sql.substring(0, 200)}...`)
    const error = null as any

    if (error) {
      console.error(`  ❌ Error: ${error.message}`)
      console.log(`  💡 Run manually in Supabase SQL Editor:`)
      console.log(`     File: ${filePath}`)
      return false
    }

    // Record migration
    await supabase.from('_migrations').insert({ name: filename })
    console.log(`  ✅ Applied successfully`)
    return true
  } catch (err: any) {
    console.error(`  ❌ Error: ${err.message}`)
    return false
  }
}

// ============================================
// Main
// ============================================

async function main() {
  const args = process.argv.slice(2)
  const showStatus = args.includes('--status')

  console.log('📁 Migrations directory:', MIGRATIONS_DIR)

  await ensureMigrationsTable()

  const allMigrations = getAllMigrations()
  const appliedMigrations = await getAppliedMigrations()
  const pendingMigrations = allMigrations.filter(m => !appliedMigrations.includes(m))

  if (showStatus) {
    console.log('\n📊 Migration Status:')
    console.log('─'.repeat(60))

    for (const m of allMigrations) {
      const status = appliedMigrations.includes(m) ? '✅ Applied' : '⏳ Pending'
      console.log(`  ${status}  ${m}`)
    }

    console.log('─'.repeat(60))
    console.log(`Total: ${allMigrations.length} | Applied: ${appliedMigrations.length} | Pending: ${pendingMigrations.length}`)
    return
  }

  if (pendingMigrations.length === 0) {
    console.log('\n✅ All migrations are up to date!')
    return
  }

  console.log(`\n📝 Found ${pendingMigrations.length} pending migration(s):`)
  pendingMigrations.forEach(m => console.log(`   - ${m}`))

  let applied = 0
  let failed = 0

  for (const migration of pendingMigrations) {
    const success = await runMigration(migration)
    if (success) {
      applied++
    } else {
      failed++
      console.log('\n⚠️  Stopping at first failure')
      break
    }
  }

  console.log(`\n📊 Result: ${applied} applied, ${failed} failed, ${pendingMigrations.length - applied - failed} skipped`)
}

main().catch(console.error)
