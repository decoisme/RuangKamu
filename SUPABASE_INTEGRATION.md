# Supabase Integration Guide 🗄️

## Overview

Ruang Kamu is now fully integrated with Supabase for data persistence. The app automatically falls back to localStorage if Supabase is not configured, making it flexible for both development and production.

## Features Integrated

All data is now stored in Supabase with automatic localStorage fallback:

- ✅ **Mood Entries** - Daily check-ins with mood, score, triggers, and notes
- ✅ **Journal Entries** - Written reflections with AI summaries and drawing interpretations
- ✅ **Gratitude Entries** - Daily gratitude practice with streak tracking
- ✅ **Vault Entries** - Private, secure notes
- ✅ **User Profile** - User settings, PIN, and preferences

## Database Schema

The complete database schema is in `supabase/migrations/001_initial_schema.sql` including:

- **profiles** - User information and settings
- **mood_entries** - Mood check-in data
- **journal_entries** - Journal entries with drawings and AI interpretations
- **gratitude_entries** - Daily gratitude lists
- **vault_entries** - Private vault notes

All tables include:
- RLS (Row Level Security) policies
- Automatic `updated_at` triggers
- Proper indexes for performance
- Foreign key relationships

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

### 2. Run Database Migration

Copy the contents of `supabase/migrations/001_initial_schema.sql` and run it in your Supabase SQL Editor:

1. Go to SQL Editor in your Supabase dashboard
2. Create new query
3. Paste the migration SQL
4. Run the query

### 3. Configure Environment Variables

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these in your Supabase project settings under API.

### 4. Restart Development Server

```bash
npm run dev
```

The app will now use Supabase for data storage!

## How It Works

### Service Layer (`src/lib/supabase-service.ts`)

All database operations go through a unified service layer that:

1. **Checks if Supabase is configured** via `isSupabaseConfigured()`
2. **Uses Supabase** if credentials are present
3. **Falls back to localStorage** if not configured
4. **Handles errors gracefully** with console warnings

### Example Usage

```typescript
import { getMoodEntries, saveMoodEntry } from '@/lib/supabase-service';

// Fetch entries (works with both Supabase and localStorage)
const entries = await getMoodEntries();

// Save new entry
const newEntry = await saveMoodEntry({
  date: '2024-01-15',
  mood: 'senang',
  score: 8,
  triggers: ['keluarga', 'olahraga'],
  note: 'Great day!',
  timestamp: new Date().toISOString()
});
```

### Demo Mode

The app uses a `DEFAULT_USER_ID` for single-user demo mode. In production, you would:

1. Implement proper authentication (Supabase Auth)
2. Pass the actual user ID to service functions
3. Update RLS policies to restrict data access by user

## API Functions

### Mood Entries
- `getMoodEntries(userId?)` - Fetch all mood entries
- `saveMoodEntry(entry, userId?)` - Save/update mood entry (upserts by date)
- `deleteMoodEntry(id)` - Delete a mood entry

### Journal Entries
- `getJournalEntries(userId?)` - Fetch all journal entries
- `saveJournalEntry(entry, userId?)` - Save new journal entry
- `deleteJournalEntry(id)` - Delete a journal entry

### Gratitude Entries
- `getGratitudeEntries(userId?)` - Fetch all gratitude entries
- `saveGratitudeEntry(entry, userId?)` - Save/update gratitude entry (upserts by date)

### User Profile
- `getUserProfile(userId?)` - Fetch user profile
- `saveUserProfile(profile, userId?)` - Save/update user profile

### Vault Entries
- `getVaultEntries(userId?)` - Fetch all vault entries
- `saveVaultEntry(entry, userId?)` - Save new vault entry
- `deleteVaultEntry(id)` - Delete a vault entry

## Components Updated

All these components now use Supabase:

- ✅ `src/app/dashboard/page.tsx`
- ✅ `src/app/checkin/page.tsx`
- ✅ `src/app/journal/page.tsx`
- ✅ `src/app/analytics/page.tsx`
- ✅ `src/app/vault/page.tsx`
- ✅ `src/components/ui/GratitudePrompt.tsx`

## Data Migration

If you have existing localStorage data and want to migrate to Supabase:

1. Configure Supabase credentials
2. The service layer will automatically start using Supabase
3. Old localStorage data will remain but won't be used
4. You can manually migrate by:
   - Exporting localStorage data
   - Inserting into Supabase via SQL or service functions

## RLS Policies

Current RLS policies are permissive for demo purposes:

```sql
-- Current: Allow all for demo
CREATE POLICY "Allow all for demo" ON table_name FOR ALL USING (true);
```

For production, update to:

```sql
-- Production: Restrict to user
CREATE POLICY "Users can only access their own data"
  ON table_name FOR ALL
  USING (auth.uid() = user_id);
```

## Troubleshooting

### Data not syncing?

1. Check browser console for errors
2. Verify `.env.local` has correct credentials
3. Check Supabase dashboard logs
4. Ensure migration was run successfully

### Still using localStorage?

1. Verify environment variables are set
2. Restart Next.js dev server
3. Check if `isSupabaseConfigured()` returns true in console

### CORS errors?

1. Check Supabase project URL is correct
2. Ensure you're using the anon key, not service role key
3. Verify your domain is allowed in Supabase settings

## Production Deployment

Before deploying to production:

1. ✅ Run the database migration
2. ✅ Set environment variables on your hosting platform
3. ⚠️ Update RLS policies for proper access control
4. ⚠️ Implement Supabase Auth for multi-user support
5. ⚠️ Add data backups and monitoring

## Benefits

- 📱 **Cross-device sync** - Access your data from any device
- 🔒 **Secure** - Data stored in Supabase with encryption
- 🚀 **Scalable** - No localStorage size limits
- 💪 **Real-time** - Can add real-time subscriptions later
- 🔄 **Backup** - Automatic backups via Supabase
- 📊 **Analytics** - Query data with SQL for insights

## Next Steps

Consider adding:

- 🔐 Supabase Authentication for multi-user support
- 🔄 Real-time subscriptions for live updates
- 📤 Export/import data functionality
- 🎨 Data visualization with aggregated queries
- 📧 Email reminders using Supabase Edge Functions
- 🌐 PWA support for offline-first experience

---

Need help? Check the [Supabase docs](https://supabase.com/docs) or open an issue! :)
