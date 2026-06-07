# Quick Start: Supabase Setup 🚀

## Option 1: Use Without Supabase (Easiest)

Just start the app - it works perfectly with localStorage!

```bash
npm run dev
```

All your data is saved locally in the browser. No setup needed! :)

---

## Option 2: Enable Supabase (For Cloud Sync)

Want your data synced across devices? Follow these steps:

### Step 1: Create Supabase Project (2 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/login with GitHub
4. Click "New project"
5. Fill in:
   - **Name**: `ruang-kamu` (or whatever you like)
   - **Database Password**: Choose a strong password
   - **Region**: Pick closest to you
6. Click "Create new project"
7. Wait 2 minutes for setup

### Step 2: Run Database Migration (1 minute)

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `supabase/migrations/001_initial_schema.sql` from your project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Step 3: Get Your Credentials (30 seconds)

1. In Supabase dashboard, click **Project Settings** (gear icon)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL** - something like `https://abcdefgh.supabase.co`
   - **anon public** key - a long string starting with `eyJ...`

### Step 4: Update .env.local (30 seconds)

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-actual-key-here
```

3. Save the file

### Step 5: Restart Dev Server (10 seconds)

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

### Step 6: Test It! (1 minute)

1. Open app in browser
2. Do a check-in
3. Write a journal entry
4. Open Supabase dashboard
5. Click **Table Editor**
6. Check `mood_entries` and `journal_entries` tables
7. You should see your data! ✨

---

## Verify It's Working

Open browser console (F12) and look for:

**With Supabase:**
```
✓ Using Supabase for data storage
```

**Without Supabase (localStorage):**
```
ℹ Supabase not configured, using localStorage fallback
```

---

## Troubleshooting

### "No data showing up in Supabase?"

1. Check browser console for errors
2. Verify `.env.local` has correct URL and key
3. Make sure you ran the migration SQL
4. Restart the dev server

### "CORS error?"

- Make sure you're using the **anon key**, not service_role key
- Check Project URL is correct (should end in `.supabase.co`)

### "Still using localStorage?"

- Verify `.env.local` is in the root folder
- Check environment variables start with `NEXT_PUBLIC_`
- Restart the dev server after changing .env

---

## What's the Difference?

### localStorage (Default)
- ✅ No setup needed
- ✅ Works offline
- ✅ Fast and simple
- ❌ Data only on one device
- ❌ Clears if you clear browser data

### Supabase (Optional)
- ✅ Sync across devices
- ✅ Backup in the cloud
- ✅ Never lose data
- ✅ Can query with SQL
- ⚠️ Requires internet
- ⚠️ 5 minute setup

---

## Migration from localStorage to Supabase

Already have data in localStorage? Here's how to migrate:

1. Export your localStorage data:
   ```javascript
   // Run in browser console
   console.log(localStorage.getItem('ruangkamu_moods'));
   console.log(localStorage.getItem('ruangkamu_journal'));
   console.log(localStorage.getItem('ruangkamu_gratitude'));
   ```

2. Copy the output
3. Enable Supabase (follow steps above)
4. Insert the data using Supabase SQL Editor or the service functions

Or just start fresh with Supabase - your choice! :)

---

## Need Help?

1. Check `SUPABASE_INTEGRATION.md` for detailed docs
2. Check `INTEGRATION_COMPLETE.md` for what's been done
3. Open browser console to see any errors
4. Check [Supabase docs](https://supabase.com/docs)

Happy tracking! 💜
