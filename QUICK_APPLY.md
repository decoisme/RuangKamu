# ⚡ Quick Apply - Google OAuth Fix

## 3 Steps untuk Fix Semua

### ✅ Step 1: Run Migration (2 menit)

1. Buka: https://supabase.com/dashboard
2. Pilih project **Ruang Kamu**
3. Klik **SQL Editor** (di sidebar kiri)
4. Klik **New Query**
5. Copy-paste semua dari file: `supabase/migrations/002_fix_profiles_auth.sql`
6. Klik **Run** (atau Ctrl+Enter)
7. Tunggu sampai sukses (hijau checkmark)

**Kalau error**: Screenshot dan kasih tau aku!

---

### ✅ Step 2: Deploy to Vercel (1 menit)

Code sudah fix, tinggal push:

```bash
git add .
git commit -m "fix: Google OAuth integration dengan profiles"
git push
```

Tunggu Vercel selesai deploy (1-2 menit).

---

### ✅ Step 3: Test (2 menit)

1. **Buka production site** kamu di browser
2. **Open browser console** (F12)
3. **Clear storage**:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```
4. **Refresh** page
5. **Klik "Continue with Google"**
6. **Login dengan Google account** kamu
7. **Harus muncul welcome screen** dengan prompt nama
8. **Input nama** (atau skip)
9. **Harus redirect ke dashboard**
10. **Cek profile page** - nama dan email harus benar

---

## ✅ Expected Results

### Saat Login Pertama Kali:
- ✅ Redirect ke Google OAuth
- ✅ Authorize app
- ✅ Redirect ke `/auth/callback`
- ✅ Muncul welcome prompt "👋 Welcome to Ruang Kamu!"
- ✅ Nama dari Google auto-fill
- ✅ Input nama (atau skip)
- ✅ Redirect ke dashboard
- ✅ Navbar show nama yang benar

### Saat Login Kedua Kali:
- ✅ Redirect ke Google OAuth
- ✅ Langsung masuk dashboard (no prompt lagi)
- ✅ Nama tetap sama seperti yang disimpan

### Di Profile Page:
- ✅ Nama yang benar ditampilkan
- ✅ Email dari Google ditampilkan
- ✅ Tanggal join ditampilkan
- ✅ Bisa edit settings

---

## 🐛 Kalau Ada Error

### Error: "Foreign key violation"
```
❌ Migration belum jalan
✅ Solution: Run step 1 lagi dengan teliti
```

### Error: "Profile not found" setelah login
```
❌ Trigger tidak jalan atau RLS block
✅ Solution: Check di Supabase SQL Editor:

SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 1;
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;

-- Kalau user ada tapi profile tidak ada, manual create:
INSERT INTO profiles (id, name, email, theme, is_logged_in)
VALUES (
  'USER_ID_DARI_QUERY_ATAS',
  'Nama Kamu',
  'email@kamu.com',
  'light',
  true
);
```

### Error: "Cannot read properties of null"
```
❌ Session tidak ada atau expired
✅ Solution: 
- Logout completely
- Clear all cookies for your domain
- Login lagi
```

### Nama masih salah (email prefix bukan nama asli)
```
❌ Profile created tapi nama tidak update
✅ Solution: Manual update:

UPDATE profiles 
SET name = 'Nama Asli Kamu'
WHERE email = 'email@kamu.com';
```

---

## 📋 Verification Queries

Kalau mau verify manually di Supabase SQL Editor:

```sql
-- 1. Check profile structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- 2. Check trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 3. Check your profile data
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  au.raw_user_meta_data->>'name' as google_name,
  p.id as profile_id,
  p.name as profile_name,
  p.email as profile_email
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- 4. Check RLS works
SELECT * FROM profiles WHERE id = auth.uid();
```

Yang harus sama: `auth_id = profile_id` untuk setiap user!

---

## 🎯 Files Yang Berubah

Semua file sudah updated di repo:

1. ✅ `supabase/migrations/002_fix_profiles_auth.sql` - Migration baru
2. ✅ `src/app/auth/callback/page.tsx` - Fixed auth callback
3. ✅ `src/lib/supabase-service.ts` - Auto-detect current user
4. ✅ `AUTH_FIX_GUIDE.md` - Detailed troubleshooting guide
5. ✅ `AUTH_INTEGRATION_FIXED.md` - Complete explanation

---

## 💬 Quick Check

Setelah selesai, coba ini:

1. Login dengan **Google Account A** → Add mood entry
2. Logout
3. Login dengan **Google Account B** → Should NOT see Account A's mood
4. Check works? **Data isolation perfect!** ✅

---

## ⏱️ Total Time: ~5 menit

- Migration: 2 min
- Deploy: 1 min  
- Test: 2 min

Semua done! :)

---

**Need detailed help?** Baca `AUTH_FIX_GUIDE.md` untuk troubleshooting lengkap.

**Still confused?** Let me know dan aku bantu!
