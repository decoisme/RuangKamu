# 🚀 Google OAuth Quick Setup - Supabase

Supabase sudah configured! Tinggal enable Google provider :)

**Your Supabase Project**: `lzbqcjmnbiystmepglza.supabase.co`

---

## ⚡ Quick Steps (5 minutes)

### Step 1: Enable Google di Supabase Dashboard

1. **Go to**: https://supabase.com/dashboard/project/lzbqcjmnbiystmepglza
2. **Login** dengan akun Supabase
3. **Navigate**: Authentication → Providers (left sidebar)
4. **Find "Google"** di list providers
5. **Toggle ON**: "Enable Sign in with Google"
6. **Copy Callback URL** (akan terlihat setelah enable):
   ```
   https://lzbqcjmnbiystmepglza.supabase.co/auth/v1/callback
   ```
   Keep this! Akan dipake di Google Console.

---

### Step 2: Setup Google Cloud Console

1. **Go to**: https://console.cloud.google.com
2. **Select or Create Project**:
   - Top bar → Click project dropdown
   - "New Project" atau pilih existing
   - Nama: "Ruang Kamu" (or anything)

3. **Enable Google+ API** (jika belum):
   - Left menu → "APIs & Services" → "Library"
   - Search "Google+ API"
   - Click dan "Enable"

4. **Configure OAuth Consent Screen**:
   - Left menu → "APIs & Services" → "OAuth consent screen"
   - User Type: **External**
   - App information:
     - App name: `Ruang Kamu`
     - User support email: (your email)
     - Developer contact: (your email)
   - Click "Save and Continue"
   - Scopes: Skip (click "Save and Continue")
   - Test users: Skip (click "Save and Continue")
   - Summary: Click "Back to Dashboard"

5. **Create OAuth Credentials**:
   - Left menu → "APIs & Services" → "Credentials"
   - "+ Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `Ruang Kamu Auth`
   - **Authorized redirect URIs** → "+ Add URI":
     ```
     https://lzbqcjmnbiystmepglza.supabase.co/auth/v1/callback
     ```
   - Click "Create"

6. **Copy Credentials**:
   - Will show popup dengan:
     - **Client ID**: `xxxxx.apps.googleusercontent.com`
     - **Client Secret**: `GOCSPX-xxxxx`
   - ✅ Copy both! You'll need them next.

---

### Step 3: Configure Google Provider di Supabase

1. **Back to Supabase Dashboard**:
   - https://supabase.com/dashboard/project/lzbqcjmnbiystmepglza
   - Authentication → Providers
   - Click "Google" (expand section)

2. **Enter Credentials**:
   - **Client ID (for OAuth)**: Paste dari Google Console
   - **Client Secret (for OAuth)**: Paste dari Google Console

3. **Save** changes

---

### Step 4: Test Google Login

1. **Restart dev server** (jika running):
   ```bash
   # Stop dev server (Ctrl+C)
   npm run dev
   ```

2. **Open**: http://localhost:3000/auth

3. **Click "Continue with Google"**

4. **Expected flow**:
   - ✅ Redirects to Google login page
   - ✅ Select Google account
   - ✅ Consent screen (first time)
   - ✅ Redirects back to http://localhost:3000/dashboard
   - ✅ User logged in!

---

## 🧪 Verify Setup

### Check Supabase Dashboard:

1. Go to: Authentication → Users
2. After Google login, should see new user:
   - Email from Google account
   - Provider: "google"
   - User metadata has Google info

### Check Browser:

1. DevTools (F12) → Application → Local Storage
2. Should see Supabase session tokens
3. User stays logged in after refresh

---

## 🐛 Troubleshooting

### Error: "Redirect URI mismatch"

**Problem**: Google callback URL doesn't match

**Solution**:
1. Check Google Console → Credentials → Your OAuth Client
2. Authorized redirect URIs should have:
   ```
   https://lzbqcjmnbiystmepglza.supabase.co/auth/v1/callback
   ```
3. Make sure NO typos, exact match
4. Save changes in Google Console
5. Try again (may take 1-2 minutes to propagate)

---

### Error: "This app is not verified"

**Problem**: OAuth consent screen not published

**Solution**:
1. Google Console → OAuth consent screen
2. This is NORMAL for development
3. Click "Advanced" → "Go to Ruang Kamu (unsafe)"
4. This warning only shows for developers
5. For production: submit app for verification (optional)

---

### Button clicks but nothing happens

**Problem**: Error in browser console

**Solution**:
1. Open DevTools → Console tab
2. Check for errors
3. Most common: Supabase config not detected
4. Restart dev server: `npm run dev`

---

### "Google login requires Supabase configuration"

**Problem**: Environment variables not loaded

**Solution**:
1. Check `.env.local` file exists
2. Verify credentials are correct:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://lzbqcjmnbiystmepglza.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
   ```
3. Restart dev server (MUST restart after .env changes)
4. Try again

---

## 🌐 Production Setup (Vercel)

### Add Production URLs:

1. **Google Console** → Credentials → Edit OAuth Client
2. **Add Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/auth/v1/callback
   https://your-domain.com/auth/v1/callback
   ```

3. **Supabase Dashboard** → Project Settings → URL Configuration
4. **Site URL**: `https://your-app.vercel.app`
5. **Add Redirect URLs**: 
   - `https://your-app.vercel.app/**`
   - `https://your-domain.com/**`

6. **Deploy to Vercel** → Environment variables already set → Deploy!

---

## ✅ Success Checklist

After setup complete:

- [ ] Google provider enabled di Supabase
- [ ] Google OAuth credentials created
- [ ] Client ID & Secret added to Supabase
- [ ] Dev server restarted
- [ ] Clicked "Continue with Google" button
- [ ] Redirected to Google login
- [ ] Selected Google account
- [ ] Redirected back to /dashboard
- [ ] User logged in successfully
- [ ] User visible di Supabase Users table

---

## 📊 What You Get

**User data from Google**:
```json
{
  "id": "uuid-from-supabase",
  "email": "user@gmail.com",
  "user_metadata": {
    "name": "User Full Name",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "email_verified": true
  },
  "app_metadata": {
    "provider": "google"
  }
}
```

**Features**:
- ✅ No password needed
- ✅ Email pre-verified
- ✅ Profile picture from Google
- ✅ Full name from Google
- ✅ Secure OAuth flow
- ✅ Session management automatic

---

## 🎯 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/lzbqcjmnbiystmepglza
- **Google Console**: https://console.cloud.google.com
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth/social-login/auth-google

---

**Status**: Supabase ready, tinggal enable Google provider! 🚀

**Setup Time**: ~5 minutes
**Difficulty**: Easy
