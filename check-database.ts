import { db } from './lib/supabase'

/**
 * 🔍 Database Health Check
 * Kiểm tra tất cả bảng cần thiết
 */

async function checkDatabase() {
  console.log('🔍 Checking database health...\n')

  const checks = {
    blog_posts: false,
    team_members: false,
    value_sections: false,
  }

  // Check blog_posts
  try {
    const posts = await db.getBlogPosts(true)
    checks.blog_posts = true
    console.log('✅ blog_posts:', posts.length, 'rows')
  } catch (error: any) {
    console.log('❌ blog_posts:', error.message)
  }

  // Check team_members
  try {
    const team = await db.getTeamMembers()
    checks.team_members = true
    console.log('✅ team_members:', team.length, 'rows')
  } catch (error: any) {
    console.log('❌ team_members:', error.message)
  }

  // Check value_sections
  try {
    const values = await db.getValueSections()
    checks.value_sections = true
    console.log('✅ value_sections:', values.length, 'rows')
  } catch (error: any) {
    console.log('❌ value_sections:', error.message)
  }

  console.log('\n📊 Summary:')
  const total = Object.keys(checks).length
  const passed = Object.values(checks).filter(Boolean).length

  console.log(`${passed}/${total} tables OK`)

  if (passed === total) {
    console.log('\n🎉 Database is healthy! All tables exist.')
    console.log('✅ You can now use the app!')
  } else {
    console.log('\n⚠️ Some tables are missing!')
    console.log('📝 Please run the SQL migration:')
    console.log('   1. Open Supabase Dashboard')
    console.log('   2. Go to SQL Editor')
    console.log('   3. Run FIX-ALL-DATABASE-TABLES.sql')
  }

  process.exit(passed === total ? 0 : 1)
}

checkDatabase()
