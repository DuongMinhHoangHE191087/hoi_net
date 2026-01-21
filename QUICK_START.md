# 🎯 QUICK START - AUTH FIX (3 PHÚT)

## 📋 TÓM TẮT

Chạy 2 migrations + 1 query để fix toàn bộ auth issues.

---

## ⚡ 3 BƯỚC NHANH

### 1️⃣ Migration A - Tables & Triggers
```
File: database/migrations/016a_tables_triggers.sql
→ Supabase SQL Editor → Copy & Run
```

### 2️⃣ Migration B - Admin Users (SAFE)
```
File: database/migrations/016b_admin_users_safe.sql  ← USE THIS
→ Supabase SQL Editor → Copy & Run
```

### 3️⃣ Grant Admin
```sql
INSERT INTO public.admin_users (user_id, granted_by)
SELECT id, id FROM auth.users WHERE email = 'YOUR-EMAIL@gmail.com'
ON CONFLICT DO NOTHING;
```

---

## ✅ VERIFY (1 Query)

```sql
SELECT
  (SELECT count(*) FROM public.users) as users,
  (SELECT count(*) FROM public.user_profiles) as profiles,
  (SELECT count(*) FROM public.admin_users) as admins,
  public.is_admin((SELECT id FROM auth.users WHERE email = 'YOUR-EMAIL@gmail.com')) as you_are_admin;
```

**Expected:**
- users > 0
- profiles > 0
- admins = 1
- you_are_admin = true

---

## 🚀 RESTART & TEST

```bash
rm -rf .next && bun run dev
```

Then:
1. Login với email admin
2. Go to http://localhost:3000/admin
3. Success! ✅

---

## 📖 CHI TIẾT

- **Full guide:** `FIX_FUNCTION_DEPENDENCY_ERROR.md`
- **Deployment:** `DEPLOYMENT_AUTH_GUIDE.md`
- **Analysis:** `AUTH_ANALYSIS_REPORT.md`

---

## 🐛 TROUBLESHOOTING

**Lỗi:** "cannot drop function"
→ **Fix:** Dùng file `016b_admin_users_safe.sql` (không drop function)

**Lỗi:** "relation already exists"
→ **Fix:** Bỏ qua - OK!

**Lỗi:** "no rows" khi grant admin
→ **Fix:** Email chưa đăng ký. Register trước, sau đó grant.

---

That's it! 🎉
