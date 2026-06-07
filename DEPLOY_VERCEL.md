# 🚀 Deploy Ruang Kamu ke Vercel

## Cara Deploy

### Opsi 1: Deploy Tanpa Supabase (Pakai localStorage)

Paling mudah! App akan otomatis pakai localStorage.

1. Push code ke GitHub
2. Import project ke Vercel
3. Deploy! ✨

**Tidak perlu environment variables!**

---

### Opsi 2: Deploy Dengan Supabase (Recommended)

Untuk cross-device sync dan cloud storage.

#### Step 1: Setup Supabase (5 menit)

1. Buat project di [supabase.com](https://supabase.com)
2. Run migration SQL dari `supabase/migrations/001_initial_schema.sql`
3. Catat credentials:
   - Project URL (https://xxx.supabase.co)
   - Anon key (eyJxxx...)

#### Step 2: Deploy ke Vercel

1. Push code ke GitHub

2. Import project ke Vercel

3. **Tambahkan Environment Variables:**
   
   Di Vercel Dashboard → Settings → Environment Variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-actual-anon-key
   ```

4. Deploy!

---

## Perbaikan Build Error

### Error: "supabaseUrl is required"

✅ **Sudah Diperbaiki!**

Yang sudah dilakukan:

1. **Placeholder values** di `src/lib/supabase.ts`
   ```typescript
   export const supabase = createClient(
     supabaseUrl || 'https://placeholder.supabase.co',
     supabaseAnonKey || 'placeholder-anon-key-for-build-time'
   );
   ```

2. **Force dynamic** di semua pages:
   ```typescript
   'use client';
   export const dynamic = 'force-dynamic';
   ```

### Kenapa Error Terjadi?

- Next.js 16 mencoba pre-render pages saat build
- Supabase client butuh URL & key
- Saat build, env variables mungkin tidak ada
- Solution: Pakai placeholder + force-dynamic

### Apa Yang Berubah?

✅ Pages yang diperbaiki:
- `/analytics` - force-dynamic
- `/dashboard` - force-dynamic
- `/checkin` - force-dynamic
- `/journal` - force-dynamic
- `/vault` - force-dynamic

✅ Supabase client sekarang:
- Pakai placeholder saat build
- Cek `isSupabaseConfigured()` runtime
- Fallback ke localStorage jika tidak configured

---

## Testing Build Lokal

Test sebelum deploy:

```bash
# Build production
npm run build

# Test production build
npm start
```

Seharusnya:
- ✅ Build berhasil tanpa error
- ✅ Semua pages ter-generate
- ✅ App berjalan normal
- ✅ Data pakai localStorage (jika env tidak di-set)

---

## Vercel Environment Variables

### Required (untuk Supabase)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Optional (untuk AI Features)

```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
# atau
NEXT_PUBLIC_GEMINI_API_KEY=...
```

### Cara Set Environment Variables di Vercel

1. Buka project di Vercel Dashboard
2. Klik **Settings**
3. Klik **Environment Variables**
4. Tambahkan variables:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://xxx.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
5. Klik **Save**
6. Ulangi untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. **Redeploy** project (Deployments → ... → Redeploy)

---

## Troubleshooting

### Build Error di Vercel?

1. Check Vercel logs untuk detail error
2. Pastikan tidak ada syntax errors
3. Test `npm run build` secara lokal dulu

### Supabase Tidak Connect?

1. Verify environment variables di Vercel
2. Check URL ends dengan `.supabase.co`
3. Check anon key dimulai dengan `eyJ`
4. Test connection di local dulu

### App Pakai localStorage di Production?

Artinya:
- ✅ App berjalan normal (expected behavior)
- ❌ Supabase env variables tidak di-set
- ❌ Atau env variables salah

Check Vercel Environment Variables!

### "Environment variables not found"?

1. Set environment variables di Vercel
2. Redeploy (jangan cuma rebuild!)
3. Environment changes butuh redeploy penuh

---

## Deployment Checklist

### Pre-Deploy

- [ ] Code di-push ke GitHub
- [ ] Test `npm run build` lokal berhasil
- [ ] Test `npm start` lokal berjalan normal

### Supabase Setup (Optional)

- [ ] Project Supabase dibuat
- [ ] Migration SQL dijalankan
- [ ] Credentials dicatat

### Vercel Deploy

- [ ] Project di-import ke Vercel
- [ ] Environment variables di-set (jika pakai Supabase)
- [ ] Deploy berhasil
- [ ] Test di production URL
- [ ] Check browser console untuk errors

### Post-Deploy Testing

- [ ] Homepage loads
- [ ] Check-in works
- [ ] Journal works
- [ ] Data persists (refresh page)
- [ ] Analytics shows data
- [ ] Vault dengan PIN works

---

## Production URLs

Setelah deploy, Anda akan dapat:

- **Production**: `https://your-app.vercel.app`
- **Preview**: `https://your-app-git-branch.vercel.app` (untuk setiap branch)

---

## Performance Tips

### Untuk Production

1. **Database Indexes** (sudah ada di migration SQL)
2. **Image Optimization** (Next.js otomatis)
3. **Edge Functions** (Vercel otomatis)
4. **Caching** (Browser caching untuk static assets)

### Monitoring

Vercel Dashboard menyediakan:
- Analytics (page views, visitors)
- Performance metrics (load time)
- Error tracking
- Build logs

---

## Security Checklist

### Before Production

- [ ] Update RLS policies di Supabase (saat ini terbuka!)
- [ ] Implement proper authentication
- [ ] Add rate limiting
- [ ] Secure API keys (jangan commit ke git)
- [ ] Enable HTTPS (Vercel otomatis)

### Supabase RLS Policies

**Current** (Demo):
```sql
CREATE POLICY "Allow all for demo" ON table_name FOR ALL USING (true);
```

**Production** (Recommended):
```sql
CREATE POLICY "Users can only access their own data"
  ON table_name FOR ALL
  USING (auth.uid() = user_id);
```

Update policies di Supabase SQL Editor setelah implement auth!

---

## Rollback

Jika ada masalah:

1. Di Vercel Dashboard → Deployments
2. Pilih deployment sebelumnya yang working
3. Klik **...** → **Promote to Production**
4. Done! Instant rollback

---

## Cost Estimate

### Free Tier

**Vercel:**
- ✅ Unlimited deploys
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Edge network
- ✅ Analytics

**Supabase:**
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 2GB bandwidth
- ✅ 50,000 monthly active users
- ✅ Automatic backups

**Perfect untuk production dengan traffic moderat!**

### Upgrade Nanti (Optional)

- Vercel Pro: $20/month (lebih bandwidth, analytics)
- Supabase Pro: $25/month (lebih storage, compute)

---

## Next Steps

Setelah deploy berhasil:

1. ✅ Test semua fitur di production
2. 🔐 Setup Supabase Auth untuk multi-user
3. 📊 Monitor analytics di Vercel Dashboard
4. 🔒 Update RLS policies untuk security
5. 🎨 Customize domain (optional)
6. 📱 Add PWA support (optional)
7. 📧 Setup error monitoring (Sentry, optional)

---

## Support

**Issues?**
- Check Vercel logs
- Check browser console
- Check Supabase logs
- Test locally first

**Resources:**
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

## Summary

🎉 **App sudah siap deploy!**

- ✅ Build error fixed
- ✅ Force dynamic implemented
- ✅ Supabase fallback working
- ✅ Production-ready architecture

**Cara deploy tercepat:**
1. Push ke GitHub
2. Import ke Vercel
3. Deploy!

**Data akan pakai localStorage** (works perfectly!)

**Untuk enable Supabase:**
1. Setup Supabase project
2. Add env variables di Vercel
3. Redeploy
4. Done! Cloud sync enabled ☁️

Happy deploying! 🚀💜
