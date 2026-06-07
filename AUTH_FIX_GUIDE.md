# 🔧 Auth Integration Fix Guide

## Problem Identified

The Google OAuth integration was broken because:

1. **Two separate ID systems**: 
   - `profiles` table had its own UUID (`id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`)
   - Supabase Auth users have their own UUID (in `auth.users`)
   - These were NOT linked!

2. **Email-based lookup is unreliable**:
   - Using email to match profiles creates race conditions
   - Email can change or be null
   - Multiple auth providers can use same email

3. **No auto-creation of profiles**:
   - When user logs in with Google, profile wasn't created automatically
   - Manual creation led to mismatches

## Solution Overview

✅ **Changed profiles.id to be a foreign key to auth.users.id**  
✅ **Added trigger to auto-create profile on user signup**  
✅ **Updated all queries to use auth.uid() instead of email**  
✅ **Fixed RLS policies to use proper auth context**  

---

## 🚀 How to Apply This Fix

### Step 1: Run the Migration

You need to run the migration file in your Supabase dashboard:

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **SQL Editor** in left sidebar
3. Click **New Query**
4. Copy the entire content of `supabase/migrations/002_fix_profiles_auth.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)

**⚠️ WARNING**: This migration will:
- Drop and recreate the profiles table
- Attempt to preserve existing data by matching emails
- Update all foreign key relationships
- Change RLS policies

**Backup First**: If you have important data, export your profiles table before running!

### Step 2: Verify Migration Success

After running the migration, check:

```sql
-- Check if profiles table structure is correct
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if trigger exists
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'auth';

-- Check if foreign key exists
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'profiles'
AND tc.constraint_type = 'FOREIGN KEY';
```

### Step 3: Test Google OAuth

1. **Clear existing session**:
   ```javascript
   // In browser console on your site
   localStorage.clear();
   ```

2. **Try logging in with Google**:
   - Click "Continue with Google"
   - Authorize the app
   - Should redirect to `/auth/callback`
   - Should show welcome prompt with your Google name pre-filled
   - Enter your name (or use suggested name)
   - Should redirect to `/dashboard`

3. **Verify profile created**:
   ```sql
   SELECT id, name, email, created_at
   FROM profiles
   ORDER BY created_at DESC
   LIMIT 5;
   ```

4. **Check auth user matches**:
   ```sql
   SELECT 
     au.id as auth_id,
     au.email as auth_email,
     p.id as profile_id,
     p.name as profile_name,
     p.email as profile_email
   FROM auth.users au
   LEFT JOIN profiles p ON au.id = p.id
   ORDER BY au.created_at DESC
   LIMIT 5;
   ```
   
   👉 **auth_id** should match **profile_id** for each user!

---

## 🎯 What Changed in Code

### 1. Auth Callback Page (`src/app/auth/callback/page.tsx`)

**Before**: Used email to lookup profile
```typescript
.eq('email', email)
```

**After**: Uses auth user ID
```typescript
.eq('id', user.id)
```

### 2. Supabase Service (`src/lib/supabase-service.ts`)

**Before**: Required userId parameter with default fallback
```typescript
export async function getUserProfile(userId: string = DEFAULT_USER_ID)
```

**After**: Auto-detects current user from session
```typescript
export async function getUserProfile(userId?: string) {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    profileId = user.id;
  }
}
```

This pattern was applied to ALL data functions:
- `getMoodEntries()`
- `saveMoodEntry()`
- `getJournalEntries()`
- `saveJournalEntry()`
- `getGratitudeEntries()`
- `saveGratitudeEntry()`
- `getVaultEntries()`
- `saveVaultEntry()`
- `getUserProfile()`
- `saveUserProfile()`

### 3. Database Schema Changes

**Profiles Table**:
```sql
-- OLD
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ...
)

-- NEW
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ...
)
```

**Auto-create Profile Trigger**:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

When a user signs up (via Google or email), this trigger automatically creates their profile using their auth UUID.

---

## 🔍 Testing Checklist

- [ ] Migration runs without errors
- [ ] Foreign key exists between profiles.id and auth.users.id
- [ ] Trigger `on_auth_user_created` exists
- [ ] Google OAuth login works
- [ ] Welcome prompt appears for new users
- [ ] Name saves correctly
- [ ] Profile page shows correct name and email
- [ ] Dashboard loads without errors
- [ ] Data (moods, journal) is scoped to correct user
- [ ] Logout works
- [ ] Login again shows existing profile (no prompt)

---

## 🐛 Troubleshooting

### "Error: new row violates foreign key constraint"

**Problem**: Trying to create profile with ID that doesn't exist in auth.users

**Solution**: Make sure you're using the actual auth user ID:
```typescript
const { data: { user } } = await supabase.auth.getUser();
// Use user.id, not a random UUID!
```

### "Profile not found after login"

**Problem**: Trigger didn't fire or profile wasn't created

**Solution**: Manually check and create:
```sql
-- Check if user exists but no profile
SELECT au.id, au.email, p.id as profile_id
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Manually create profile if needed
INSERT INTO profiles (id, name, email, theme, is_logged_in)
SELECT id, 
       COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
       email,
       'light',
       true
FROM auth.users
WHERE id = 'USER_ID_HERE';
```

### "RLS policy violation" when fetching data

**Problem**: RLS policies aren't matching correctly

**Solution**: Test RLS context:
```sql
-- Test as authenticated user
SELECT auth.uid(); -- Should return your user ID

-- Test profile access
SELECT * FROM profiles WHERE id = auth.uid();
```

### Name still shows email after saving

**Problem**: Profile update didn't work or wrong profile was updated

**Solution**: Check the actual database:
```sql
SELECT id, name, email FROM profiles;
```

If name is wrong, update manually:
```sql
UPDATE profiles 
SET name = 'Your Correct Name'
WHERE id = auth.uid();
```

---

## 📝 Summary

This fix properly integrates Google OAuth with the profiles system by:

1. ✅ Using auth user IDs as the primary key (not generating new UUIDs)
2. ✅ Auto-creating profiles when users sign up
3. ✅ Using auth.uid() in all queries and RLS policies
4. ✅ Showing friendly welcome prompt for name collection
5. ✅ Maintaining proper data isolation per user

The integration is now solid and follows Supabase best practices! :)

---

## 🎉 Next Steps After Fix

Once this is working:

1. **Test with multiple Google accounts** to ensure data isolation
2. **Add email/password registration** if needed (will also auto-create profile)
3. **Add profile editing** on the profile page
4. **Consider adding avatar** using Google profile picture
5. **Add "Continue as [Name]"** on login page if already logged in

Need help? Check the Supabase docs: https://supabase.com/docs/guides/auth
