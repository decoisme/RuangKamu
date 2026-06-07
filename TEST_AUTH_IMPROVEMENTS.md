# 🧪 Test Auth Improvements - Quick Guide

Test 3 perbaikan utama dalam 5 menit :)

**Dev server**: http://localhost:3000

---

## ✅ Test 1: Name Persistence (2 minutes)

**Goal**: Verify nama user tidak berubah jadi email setelah login

### Steps:
```
1. Clear localStorage:
   - DevTools (F12) → Application → Local Storage
   - Delete "ruangkamu_user" key
   - Refresh page

2. Register new account:
   - Go to http://localhost:3000/auth
   - Tab "Register"
   - Name: "John Doe"
   - Email: "john@test.com"
   - Password: "password123"
   - Confirm: "password123"
   - Click "Create Account"
   
3. Check dashboard:
   ✅ Should redirect to /dashboard
   ✅ Welcome message should show "John Doe" (not "john")

4. Logout:
   - Click logout icon (red button, top-right)
   - Should redirect to /auth

5. Login again:
   - Email: "john@test.com"
   - Password: "password123"
   - Click "Sign In"

6. Check profile page:
   - Go to http://localhost:3000/profile
   - Look at "Name" field
   ✅ Should still show "John Doe" (NOT "john")
```

### ✅ PASS Criteria:
- Name stays "John Doe" after logout & login
- NOT changed to "john" (email prefix)

---

## ✅ Test 2: Duplicate Email Detection (1 minute)

**Goal**: Verify system menolak email yang sudah terdaftar

### Steps:
```
1. While logged in from Test 1, logout

2. Try register with same email:
   - Tab "Register"
   - Name: "Jane Smith" (different name)
   - Email: "john@test.com" (SAME email as before)
   - Password: "newpassword"
   - Confirm: "newpassword"
   - Click "Create Account"

3. Check for errors:
   ✅ Red alert box should appear at top
   ✅ Message: "Email already registered. Please login instead."
   ✅ Email field should have red border
   ✅ Error text under email field
   ✅ Should NOT redirect to dashboard
```

### ✅ PASS Criteria:
- Registration blocked
- Clear error message shown
- User instructed to login instead

---

## ✅ Test 3: Login Validation (1 minute)

**Goal**: Verify login hanya works untuk registered users

### Steps:
```
1. At /auth page, tab "Login"

2. Try login with non-existent email:
   - Email: "nobody@test.com"
   - Password: "anything123"
   - Click "Sign In"

3. Check for errors:
   ✅ Red alert box should appear
   ✅ Message: "No account found with this email. Please register first."
   ✅ Should NOT redirect to dashboard
   ✅ Should NOT create new account

4. Switch to "Register" tab:
   - Email field should be empty
   - Ready to register new account
```

### ✅ PASS Criteria:
- Login blocked for non-existent email
- Clear error message
- User instructed to register

---

## ✅ Test 4: Google Button UI (1 minute)

**Goal**: Verify Google login button tampil dengan benar

### Steps:
```
1. At http://localhost:3000/auth

2. Login tab:
   ✅ "Continue with Google" button visible
   ✅ Google logo (4 colors) displayed
   ✅ Button below email/password form
   ✅ "Or continue with" divider above button
   ✅ Helper text: "Google login requires Supabase setup"

3. Switch to Register tab:
   ✅ Same Google button visible
   ✅ Same styling & position
   ✅ Same helper text

4. Hover over button:
   ✅ Background changes (hover effect)
   ✅ Cursor becomes pointer

5. Click Google button:
   ✅ Error message appears (expected - no Supabase config)
   ✅ Message: "Google login requires Supabase configuration"
```

### ✅ PASS Criteria:
- Button looks professional
- Google logo correct
- Helper text clear
- Error handling works

---

## 🎨 Visual Checklist

### Email Field Errors:
- [ ] Red border when error
- [ ] Error text below field (red color)
- [ ] Clear error icon

### Alert Box:
- [ ] Red/pink background
- [ ] AlertCircle icon on left
- [ ] Clear error message
- [ ] Proper spacing

### Google Button:
- [ ] White background
- [ ] Subtle border
- [ ] Google logo (4 colors visible)
- [ ] "Continue with Google" text
- [ ] Hover effect works

### Divider:
- [ ] Horizontal line
- [ ] "Or continue with" text centered
- [ ] Proper spacing above/below

---

## 📊 Expected Results Summary

| Test | Expected Result | Status |
|------|----------------|--------|
| **Name Persistence** | Name stays "John Doe" after login | ✅ |
| **Duplicate Email** | Registration blocked with error | ✅ |
| **Login Validation** | Login fails for non-existent email | ✅ |
| **Google Button** | Button visible & styled correctly | ✅ |

---

## 🐛 Troubleshooting

### Name still changes to email:
- Clear localStorage completely
- Restart dev server
- Try again with fresh data

### Errors not showing:
- Check browser console for errors
- Make sure React DevTools shows component re-rendering
- Verify error state is being set

### Google button not visible:
- Check if component rendered
- Inspect element in DevTools
- Verify import statements

---

## 🔧 Debug Commands

### Check localStorage:
```javascript
// In browser console:
localStorage.getItem('ruangkamu_user')
```

### Clear localStorage:
```javascript
// In browser console:
localStorage.clear()
location.reload()
```

### Force error state:
```javascript
// In auth page component:
setLoginErrors({ general: 'Test error message' })
```

---

## ✅ All Tests Passed?

If all 4 tests pass, improvements are working correctly! 🎉

### Next Steps:
1. ✅ Local testing complete
2. 📝 Read GOOGLE_AUTH_SETUP.md for OAuth setup
3. 🚀 Deploy to production
4. 🎨 Enjoy improved auth system!

---

## 📊 Quick Verification

**Open http://localhost:3000/auth and verify:**

1. ✅ Two tabs: Login & Register
2. ✅ Form validation works (try empty fields)
3. ✅ Password visibility toggles work (eye icon)
4. ✅ Google button visible on both tabs
5. ✅ Error messages display correctly
6. ✅ Loading states show during operations
7. ✅ Smooth animations throughout
8. ✅ Mobile responsive (resize window)

---

**Status**: All improvements ready for testing! {'<3'}

**Total test time**: ~5 minutes
**Required setup**: None (works with localStorage mode)
