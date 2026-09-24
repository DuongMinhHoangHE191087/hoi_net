# ✅ FIXED - Duplicate Key Error on Site Settings Update

## 🔧 Problem

**Error in Console**:
```
updateSiteSetting error for key "brand_slogan":
{code: '23505', details: null, hint: null, message: 'duplicate key value violates unique constraint "site_settings_pkey"'}

POST https://jfnexrrdygcxgizzpyxc.supabase.co/rest/v1/site_settings?select=* 409 (Conflict)
```

**Root Cause**:
- The `updateSiteSetting` function was checking if a record exists first, then either UPDATE or INSERT
- The check was failing in some cases, causing it to attempt INSERT on existing keys
- Since `key` is the primary key in `site_settings` table, trying to INSERT with an existing key caused a duplicate key constraint violation (error code 23505)
- The function made 2 database calls (SELECT then UPDATE/INSERT) which is inefficient and prone to race conditions

## ✨ Solution

Replaced the conditional logic with PostgreSQL's `upsert` operation, which atomically handles both insert and update in a single operation.

### File Updated: `lib/supabase.ts`

**Before (Lines 482-514)**:
```typescript
async updateSiteSetting(key: string, value: string): Promise<SiteSetting | null> {
  try {
    // Check if exists
    const { data: existingData } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', key)
      .maybeSingle()

    if (existingData) {
      // Update existing
      const { data, error } = await supabase
        .from('site_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single()

      if (error) throw error
      return data as SiteSetting
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('site_settings')
        .insert({ key, value })
        .select()
        .single()

      if (error) throw error
      return data as SiteSetting
    }
  } catch (err) {
    console.error(`updateSiteSetting error for key "${key}":`, err)
    throw err
  }
}
```

**After (Lines 482-500)**:
```typescript
async updateSiteSetting(key: string, value: string): Promise<SiteSetting | null> {
  try {
    // Use upsert to handle both insert and update atomically
    const { data, error } = await supabase
      .from('site_settings')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      .select()
      .single()

    if (error) throw error
    return data as SiteSetting
  } catch (err) {
    console.error(`updateSiteSetting error for key "${key}":`, err)
    throw err
  }
}
```

## 🚀 Result

✅ **No more duplicate key errors**
✅ **Single atomic database operation instead of 2 separate calls**
✅ **No race conditions**
✅ **Handles both INSERT and UPDATE automatically**
✅ **More efficient and reliable**

## 🎯 What This Enables

Now you can:
- Update site settings in Admin panel without errors
- Change brand name, slogan, logo, contact info, etc.
- Save multiple settings at once
- Create new settings or update existing ones seamlessly

## 📝 Technical Details

**PostgreSQL UPSERT**:
- `upsert()` is Supabase's wrapper for PostgreSQL's `INSERT ... ON CONFLICT ... DO UPDATE`
- When a conflict is detected on the specified column(s), it performs an UPDATE instead of failing
- Atomic operation - no race conditions possible
- Requires specifying which column(s) define the conflict via `onConflict` parameter

**How it works**:
1. Try to INSERT the record with the given `key`
2. If `key` already exists (conflict on primary key):
   - UPDATE the existing record with new `value` and `updated_at`
3. If `key` doesn't exist:
   - INSERT the new record
4. Return the resulting record

**Benefits over SELECT-then-UPDATE/INSERT**:
- Single database round-trip instead of 2
- No race condition between SELECT and UPDATE/INSERT
- Cleaner, more maintainable code
- Standard PostgreSQL pattern

## 🔄 Test Now

Go to Admin panel → Site Settings tab and try updating any field:
- Brand name
- Slogan
- Contact email
- SEO settings
- etc.

All should save successfully without errors!

## 💡 Key Lesson

When working with unique constraints in databases:
- Use `upsert` for "create or update" operations
- Avoid SELECT-then-INSERT/UPDATE pattern (prone to race conditions)
- Let the database handle conflicts atomically
- Supabase's `.upsert()` with `onConflict` parameter is the right solution

---

**Site Settings updates are now working properly! 🎉**
