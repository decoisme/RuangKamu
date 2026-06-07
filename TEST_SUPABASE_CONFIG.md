# 🔍 Test Supabase Configuration

Quick test untuk verify Supabase credentials ter-load dengan benar.

## 🧪 Test Steps

### 1. Check Browser Console

1. **Open**: http://localhost:3000/auth
2. **Open DevTools**: Press F12
3. **Go to Console tab**
4. **Look for**: `[Supabase Config Check]` log

**Expected Output** (jika configured):
```javascript
[Supabase Config Check] {
  urlValid: true,
  keyValid: true,
  urlLength: 47,
  keyLength: 200+,
  url: "https://lzbqcjmnbiystmepglza...",
  configured: true
}
```

**If configured = false**, check mana yang invalid:
- `urlValid: false` → URL issue
- `keyValid: false` → Key issue

---

### 2. Manual Check di Browser Console

Run this di browser console:

```javascript
// Check if env vars are loaded
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);
```

**Expected**:
- URL should show: `https://lzbqcjmnbiystmepglza.supabase.co`
- Key length should be: `>200` characters

---

### 3. Check .env.local File

```bash
cat .env.local
```

**Should contain**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://lzbqcjmnbiystmepglza.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Check for**:
- ✅ No spaces before/after `=`
- ✅ No quotes around values
- ✅ Correct variable names (NEXT_PUBLIC_*)

---

## 🐛 Common Issues

### Issue 1: Environment Variables Not Loading

**Symptoms**:
- Console shows empty values
- `configured: false` in logs

**Solutions**:
1. **Restart dev server** (MUST DO after .env changes):
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Check file location**:
   - File MUST be: `.env.local` (with dot at start)
   - Location: Project root (same level as package.json)

3. **Check file format**:
   - UTF-8 encoding
   - No BOM (Byte Order Mark)
   - LF or CRLF line endings

---

### Issue 2: urlValid = false

**Symptoms**:
- `urlValid: false` in console
- URL looks correct

**Possible Causes**:
- Extra spaces in .env.local
- Wrong variable name
- URL doesn't include `.supabase.co`

**Fix**:
```env
# BAD ❌
NEXT_PUBLIC_SUPABASE_URL = https://lzbqcjmnbiystmepglza.supabase.co

# GOOD ✅
NEXT_PUBLIC_SUPABASE_URL=https://lzbqcjmnbiystmepglza.supabase.co
```

---

### Issue 3: keyValid = false

**Symptoms**:
- `keyValid: false` in console
- Key length < 20

**Possible Causes**:
- Key not copied completely
- Extra newlines/spaces
- Wrong variable name

**Fix**:
- Copy entire key from Supabase
- Should be very long (200+ chars)
- No line breaks in middle of key

---

### Issue 4: Google Button Not Clickable

**Symptoms**:
- Button disabled or doesn't respond
- No error shown

**Possible Causes**:
- Previous error state blocking
- Form validation issue

**Fix**:
1. Refresh page (clear error state)
2. Check console for errors
3. Try clicking from Login tab instead

---

## ✅ Success Indicators

### In Browser Console:
```javascript
✅ [Supabase Config Check] { configured: true }
✅ No errors about "localStorage mode"
✅ Google button clickable
```

### When Clicking Google Button:
```javascript
✅ No error messages
✅ Redirects to Google (if provider enabled)
OR
✅ Error about provider not enabled (expected if not setup yet)
```

---

## 🔧 Debug Commands

### Check environment in terminal:
```bash
# Show .env.local content
type .env.local

# Check if file exists
dir .env.local
```

### Force environment reload:
```bash
# Stop dev server
# Delete .next folder
rmdir /s /q .next

# Restart
npm run dev
```

---

## 📊 Expected Behavior

### Before Google Provider Setup:
- ✅ Supabase configured: true
- ✅ Google button clickable
- ✅ Clicking shows: "Provider not enabled" or similar Supabase error
- ❌ NOT: "Google login is only available with Supabase"

### After Google Provider Setup:
- ✅ Clicking redirects to Google
- ✅ Auth flow completes
- ✅ User logged in

---

## 🎯 Quick Fix Checklist

If Google button not working:

- [ ] `.env.local` file exists in project root
- [ ] File contains correct Supabase URL & Key
- [ ] No spaces around `=` in .env.local
- [ ] Dev server restarted after .env changes
- [ ] Browser console shows `configured: true`
- [ ] No errors in browser console
- [ ] Page refreshed to clear error state

---

**Status**: Use this guide to debug configuration issues :)
