# 🔐 Google OAuth Setup Guide

Panduan lengkap untuk mengaktifkan login dengan Google menggunakan Supabase Auth :)

## 📋 Prerequisites

- Supabase project sudah dibuat
- Environment variables sudah di-set (`NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 🚀 Setup Steps

### 1. Enable Google Provider di Supabase

1. **Login ke Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Navigate to Authentication**:
   - Klik "Authentication" di sidebar
   - Klik "Providers" tab
4. **Enable Google**:
   - Scroll ke "Google" provider
   - Toggle "Enable Sign in with Google" to ON
5. **Copy Callback URL** (nanti akan dipakai):
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```

### 2. Create Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create or Select Project**:
   - Klik dropdown project di top bar
   - Create new project atau pilih existing
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API"
   - Click dan enable
4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill required fields:
     - App name: "Ruang Kamu"
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - Skip "Scopes" (click "Save and Continue")
   - Add test users if needed
   - Click "Save and Continue"
5. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Ruang Kamu Auth"
   - **Authorized redirect URIs**: Add Supabase callback URL:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
   - Click "Create"
6. **Copy Credentials**:
   - You'll get:
     - Client ID: `xxxxx.apps.googleusercontent.com`
     - Client Secret: `GOCSPX-xxxxx`
   - Keep these safe!

### 3. Configure Google Provider in Supabase

1. **Back to Supabase Dashboard** → Authentication → Providers
2. **Click Google provider** to expand settings
3. **Enter Google credentials**:
   - Client ID: paste dari Google Console
   - Client Secret: paste dari Google Console
4. **Click "Save"**

### 4. Add Redirect URL to Your App (Optional)

For local development, add to Google Console:

1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add local development URL:
   ```
   http://localhost:3000/auth/callback
   ```
4. Save

### 5. Test the Integration

1. **Run your app**: `npm run dev`
2. **Go to** http://localhost:3000/auth
3. **Click "Continue with Google"**
4. **Expected flow**:
   - Redirects to Google login
   - Select Google account
   - Consent screen (first time)
   - Redirects back to your app
   - User logged in to `/dashboard`

## ✅ Verification

### Check if Google Auth is working:

1. **Supabase Dashboard** → Authentication → Users
   - After login, new user should appear
   - Provider: "google"
   - Email from Google account

2. **Browser localStorage**:
   - Open DevTools → Application → Local Storage
   - Should see Supabase session token

3. **User stays logged in**:
   - Refresh page → still logged in
   - Close/reopen browser → still logged in (session persists)

## 🔧 Troubleshooting

### Error: "Redirect URI mismatch"
**Solution**: Make sure redirect URI in Google Console matches exactly with Supabase callback URL.

### Error: "Google login requires Supabase configuration"
**Solution**: 
- Check `.env.local` has correct Supabase credentials
- Make sure `isSupabaseConfigured()` returns `true`
- Restart dev server after adding env variables

### Google button shows "requires Supabase setup" message
**Solution**: This is expected in localStorage mode (development without Supabase). Google OAuth only works with Supabase configured.

### User redirected but not logged in
**Solution**:
- Check Supabase logs: Dashboard → Logs → Auth Logs
- Verify Google OAuth consent screen is published
- Check browser console for errors

### "Access blocked: This app's request is invalid"
**Solution**:
- OAuth consent screen not configured properly
- Add required scopes in Google Console
- Publish OAuth consent screen

## 🌐 Production Deployment

### Vercel (Recommended)

1. **Add Redirect URLs** in Google Console:
   ```
   https://your-app.vercel.app/auth/callback
   https://your-domain.com/auth/callback
   ```

2. **Update Supabase URLs**:
   - Dashboard → Project Settings → URL Configuration
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: Add your production domain

3. **Deploy to Vercel**:
   - Environment variables already set
   - Deploy!
   - Test Google login on production

## 📊 User Data from Google

When user logs in with Google, you get:

```json
{
  "id": "uuid-from-supabase",
  "email": "user@gmail.com",
  "user_metadata": {
    "name": "User Full Name",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "email_verified": true,
    "full_name": "User Full Name",
    "picture": "https://lh3.googleusercontent.com/...",
    "provider_id": "google-id",
    "sub": "google-id"
  },
  "app_metadata": {
    "provider": "google",
    "providers": ["google"]
  }
}
```

## 🎨 UI Features

### Google Button Styling
- Official Google colors (blue, green, yellow, red)
- Google logo SVG
- Hover effects
- Consistent with Ruang Kamu design

### Conditional Rendering
- Button shows on both Login & Register tabs
- Helper text shown if Supabase not configured
- Seamless UX with loading states

## 🔒 Security Best Practices

1. **Never commit credentials**:
   - `.env.local` is in `.gitignore`
   - Use Vercel environment variables for production

2. **Use environment variables**:
   - Keep Client ID/Secret in env vars
   - Different credentials for dev/prod

3. **Restrict OAuth scopes**:
   - Only request email & profile
   - Don't request unnecessary permissions

4. **Verify email domain** (optional):
   - Add allowed domains in Supabase Auth settings
   - Restrict to specific organizations

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

## 🎯 Summary

Setup Google OAuth:
1. ✅ Enable Google in Supabase
2. ✅ Create Google OAuth credentials
3. ✅ Configure callback URLs
4. ✅ Test login flow
5. ✅ Deploy to production

Google login sekarang tersedia dan siap digunakan! {'<3'}

---

**Note**: Google OAuth hanya bekerja dengan Supabase configured. Dalam localStorage mode (development tanpa Supabase), button akan show pesan bahwa Google login requires Supabase setup.
