# Fix Blog Posts Database Error

## Problem
```
Error loading blog posts: {
  code: 'PGRST205',
  message: "Could not find the table 'public.blog_posts' in the schema cache"
}
```

## Solution

The `blog_posts` table doesn't exist in your Supabase database. Follow these steps to create it:

### Step 1: Open Supabase SQL Editor

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `jfnexrrdygcxgizzpyxc`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the SQL Migration

1. Open the file `create-blog-posts-table.sql` in this project
2. Copy ALL the contents
3. Paste into the Supabase SQL Editor
4. Click **Run** button (or press `Ctrl+Enter`)

### Step 3: Verify Success

You should see:
- ✅ "Success. No rows returned" message
- ✅ A verification query showing the table structure
- ✅ One sample blog post inserted

### Step 4: Refresh Your App

1. Go back to your Next.js app at `http://localhost:3000/blog`
2. Refresh the page
3. You should now see the blog post!

## What This Creates

The SQL file creates:
- ✅ `blog_posts` table with proper columns
- ✅ Indexes for fast queries (slug, published, created_at)
- ✅ Row Level Security (RLS) policies
- ✅ Trigger for automatic `updated_at` timestamp
- ✅ One sample blog post for testing

## Table Structure

```sql
blog_posts (
  id              UUID PRIMARY KEY
  title           TEXT NOT NULL
  slug            TEXT UNIQUE NOT NULL
  excerpt         TEXT NOT NULL
  content         TEXT NOT NULL
  author_name     TEXT NOT NULL
  author_avatar   TEXT (optional)
  featured_image  TEXT (optional)
  published       BOOLEAN DEFAULT false
  created_at      TIMESTAMPTZ DEFAULT NOW()
  updated_at      TIMESTAMPTZ DEFAULT NOW()
)
```

## Troubleshooting

### Error: "relation already exists"
The table already exists. You can skip this migration.

### Error: "permission denied"
Make sure you're logged in as the project owner in Supabase.

### Still seeing the error?
1. Clear your browser cache
2. Restart your Next.js dev server (`npm run dev`)
3. Check that your `.env.local` has the correct Supabase URL and keys

## After Migration

Once the table is created, you can:
- ✅ View blog posts at `/blog`
- ✅ Create new posts at `/admin/blog/new` (admin only)
- ✅ Manage posts in the admin panel

---

**Need Help?**
Check the Supabase dashboard to verify the table exists:
`https://supabase.com/dashboard/project/jfnexrrdygcxgizzpyxc/editor`
