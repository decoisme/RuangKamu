# 🧪 Authentication System Test Guide

Quick guide untuk testing authentication system yang baru diimplementasikan :)

## 🚀 Quick Start

1. **Start dev server** (sudah running di http://localhost:3000)
   ```bash
   npm run dev
   ```

2. **Open browser** ke http://localhost:3000

## ✅ Test Scenarios

### Test 1: Landing Page Redirects
**Expected**: Semua CTA buttons harus redirect ke `/auth`

1. Visit http://localhost:3000
2. Click "Start Check-in" → harus redirect ke `/auth`
3. Back, click "Explore Dashboard" → harus redirect ke `/auth`
4. Back, click "Start for Free" → harus redirect ke `/auth`

✅ PASS jika semua buttons redirect ke `/auth`

---

### Test 2: Route Protection (Not Logged In)
**Expected**: Protected routes tidak bisa diakses tanpa login

Try accessing these URLs directly:
- http://localhost:3000/dashboard
- http://localhost:3000/checkin
- http://localhost:3000/journal
- http://localhost:3000/analytics
- http://localhost:3000/vault
- http://localhost:3000/profile

✅ PASS jika semua redirect ke `/auth`

---

### Test 3: Register New Account
**Expected**: User bisa register dan auto-login

1. Visit http://localhost:3000/auth
2. Click "Register" tab
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm: password123
4. Click "Create Account"

✅ PASS jika:
- Loading animation muncul
- Redirect ke `/dashboard` setelah register
- Navbar menunjukkan user logged in (logout button visible)

---

### Test 4: Protected Routes (Logged In)
**Expected**: Semua protected routes bisa diakses setelah login

Visit these URLs (should work now):
- http://localhost:3000/dashboard ✅
- http://localhost:3000/checkin ✅
- http://localhost:3000/journal ✅
- http://localhost:3000/analytics ✅
- http://localhost:3000/vault ✅
- http://localhost:3000/profile ✅

✅ PASS jika semua pages load normally

---

### Test 5: Auth Page Redirect (Logged In)
**Expected**: User yang sudah login tidak bisa akses `/auth`

1. While logged in, visit http://localhost:3000/auth
2. Should auto-redirect ke `/dashboard`

✅ PASS jika redirect otomatis

---

### Test 6: Logout
**Expected**: Logout button works di desktop & mobile

#### Desktop:
1. Look for red logout icon di top-right navbar
2. Click logout button
3. Should redirect ke `/auth`
4. Try accessing `/dashboard` → should redirect to `/auth`

#### Mobile:
1. Click hamburger menu (top-right)
2. Scroll to bottom of drawer
3. Click "Logout" button (red text)
4. Should redirect ke `/auth`

✅ PASS jika logout works di both views

---

### Test 7: Login Existing User
**Expected**: User bisa login dengan account yang sudah ada

1. Visit http://localhost:3000/auth
2. Make sure "Login" tab active
3. Fill form:
   - Email: test@example.com
   - Password: password123
4. Click "Sign In"

✅ PASS jika:
- Loading animation muncul
- Redirect ke `/dashboard`
- User logged in successfully

---

### Test 8: Form Validation
**Expected**: Error messages muncul untuk invalid inputs

#### Login Validation:
1. Visit `/auth` → "Login" tab
2. Leave email empty, click "Sign In"
   - Should show: "Email is required"
3. Enter invalid email "test", click "Sign In"
   - Should show: "Invalid email format"
4. Enter valid email, leave password empty
   - Should show: "Password is required"
5. Enter password < 6 chars "abc"
   - Should show: "Password must be at least 6 characters"

#### Register Validation:
1. Switch to "Register" tab
2. Test each field empty → should show required errors
3. Test password mismatch → should show "Passwords do not match"

✅ PASS jika semua validations work

---

### Test 9: Password Visibility Toggle
**Expected**: Eye icon toggles password visibility

1. In login or register form
2. Click eye icon di password field
3. Password should become visible
4. Click again → should hide

✅ PASS jika toggle works

---

### Test 10: Tab Switching Animation
**Expected**: Smooth animation saat switch tabs

1. At `/auth` page
2. Click "Register" → should animate smoothly
3. Click "Login" → should animate smoothly
4. Error messages should clear saat switch tabs

✅ PASS jika animations smooth

---

## 🐛 What to Check

### Visual Checks:
- [ ] Login/Register forms look good
- [ ] Loading spinner during auth operations
- [ ] Error messages styled properly (red box with icon)
- [ ] Logout button visible di navbar (desktop & mobile)
- [ ] Animations smooth (tab switching, form validation)

### Functional Checks:
- [ ] Route protection works
- [ ] Login works
- [ ] Register works
- [ ] Logout works
- [ ] Form validation works
- [ ] Redirects work correctly

### Edge Cases:
- [ ] Direct URL access to protected routes
- [ ] Browser back button after logout
- [ ] Refresh page while logged in (should stay logged in)
- [ ] Refresh page while logged out (should stay logged out)

## 📊 Expected localStorage Data

After successful registration/login, check browser DevTools → Application → Local Storage:

```json
{
  "ruangkamu_user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "theme": "light",
    "createdAt": "2024-...",
    "isLoggedIn": true
  }
}
```

## 🔧 Debug Tips

### Check Console:
- Open browser DevTools (F12)
- Look for errors di Console tab
- Check Network tab untuk failed requests

### Check localStorage:
```javascript
// In browser console:
localStorage.getItem('ruangkamu_user')
```

### Force Logout:
```javascript
// In browser console:
localStorage.removeItem('ruangkamu_user')
// Then refresh page
```

## 🎯 Success Criteria

Authentication system dianggap PASSED jika:

1. ✅ Build successful tanpa errors
2. ✅ Protected routes tidak bisa diakses tanpa login
3. ✅ Landing page CTAs redirect ke `/auth`
4. ✅ Register flow works
5. ✅ Login flow works
6. ✅ Logout works (desktop & mobile)
7. ✅ Form validation works
8. ✅ Auto-redirects work correctly
9. ✅ No console errors
10. ✅ Smooth UX dengan animations

## 🚀 Production Testing (With Supabase)

Once Supabase credentials configured:

1. Set environment variables
2. Rebuild: `npm run build`
3. Test register → should create account di Supabase Dashboard
4. Test login → should validate against Supabase
5. Check Supabase Dashboard → Authentication → Users

---

Happy testing! {'<3'}

*Note: Karena menggunakan localStorage mode, data akan persist di browser. Clear localStorage jika ingin reset.*
