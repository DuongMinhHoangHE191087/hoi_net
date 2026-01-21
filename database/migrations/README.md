# Database Migrations

This folder contains SQL migration files for the WEB-SSG project.

## How to Run Migrations

### 1. Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file you want to run
4. Paste into the SQL Editor
5. Click **Run**

### 2. Via Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

## Migration Files

### Core Migrations

| File | Description | Status |
|------|-------------|--------|
| `002_ai_usage_quotas.sql` | AI usage tracking and quotas | ✅ Core |
| `003_ai_caching.sql` | AI analysis caching | ✅ Core |
| `004_optimization_indexes.sql` | Performance indexes | ✅ Core |
| `005_cleanup_cron.sql` | Automated cleanup jobs | ⚠️ Optional |
| `006_create_user_profiles.sql` | User profiles table | ✅ Core |
| `008_enhance_admin_delivery.sql` | Admin delivery features | ✅ Core |
| `011_complete_system_upgrade.sql` | System-wide upgrade | ✅ Core |
| `012_site_settings_expansion.sql` | Site settings | ✅ Core |
| `014_fix_admin_rls_policies.sql` | Admin RLS policies | ✅ **UPDATED** |
| `015_create_system_logs.sql` | System logging | ⚠️ Optional |

## Important Notes

### Migration 014 - Admin RLS Policies (UPDATED)
**Status:** ✅ Fixed and ready to run

**What it does:**
- Creates `is_admin()` function to check admin access
- Sets up RLS policies for admin operations
- Creates `admin_actions` audit table
- Creates `admin_dashboard_stats` view

**Changes made:**
- ✅ Fixed `uuid_generate_v4()` → `gen_random_uuid()`
- ✅ Removed `system_logs` dependency
- ✅ Uses `user_profiles.role` for admin check
- ✅ Fallback to email check for backwards compatibility
- ✅ Added COALESCE for safe table access

**To run:**
```sql
-- Copy and paste the entire content of:
-- database/migrations/014_fix_admin_rls_policies.sql
```

### Migration 015 - System Logs (Optional)
**Status:** ⚠️ Optional - Not required for basic functionality

**What it does:**
- Creates `system_logs` table for error tracking
- Adds helper functions `log_error()` and `log_info()`
- Sets up RLS policies for logs

**When to run:**
- Only if you want detailed system logging
- Can be added later without breaking existing functionality

## Troubleshooting

### Error: "relation does not exist"
This usually means a table referenced in the migration hasn't been created yet. Check migration order.

### Error: "function uuid_generate_v4 does not exist"
Use `gen_random_uuid()` instead. This has been fixed in migration 014.

### Error: "permission denied"
Make sure you're running migrations with sufficient permissions in Supabase SQL Editor.

## Recommended Migration Order

Run migrations in this order for a fresh database:

1. ✅ `006_create_user_profiles.sql` - Create user profiles first
2. ✅ `002_ai_usage_quotas.sql` - Set up AI quotas
3. ✅ `003_ai_caching.sql` - Set up caching
4. ✅ `004_optimization_indexes.sql` - Add performance indexes
5. ✅ `011_complete_system_upgrade.sql` - System upgrade
6. ✅ `012_site_settings_expansion.sql` - Site settings
7. ✅ `014_fix_admin_rls_policies.sql` - **Admin RLS (UPDATED)**
8. ⚠️ `015_create_system_logs.sql` - Optional logging
9. ⚠️ `005_cleanup_cron.sql` - Optional cleanup jobs

## Verification

After running migrations, verify with:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if is_admin function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'is_admin';

-- Check admin dashboard stats view
SELECT * FROM admin_dashboard_stats;
```

## Admin Setup

After running migration 014, ensure your admin user has the correct role:

```sql
-- Update your user to admin role
UPDATE user_profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'duongminhhoanggame@gmail.com'
);
```

## Support

If you encounter issues:
1. Check Supabase logs in the Dashboard
2. Verify all dependencies are met
3. Run migrations in the correct order
4. Contact support if problems persist
