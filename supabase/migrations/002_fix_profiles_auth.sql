-- Fix profiles table to properly link with Supabase Auth
-- This migration changes the primary key to match auth.users

-- Step 1: Drop existing foreign key constraints that reference profiles
ALTER TABLE mood_entries DROP CONSTRAINT IF EXISTS mood_entries_user_id_fkey;
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_user_id_fkey;
ALTER TABLE gratitude_entries DROP CONSTRAINT IF EXISTS gratitude_entries_user_id_fkey;
ALTER TABLE vault_entries DROP CONSTRAINT IF EXISTS vault_entries_user_id_fkey;

-- Step 2: Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Step 3: Create new profiles table with proper auth link
CREATE TABLE profiles_new (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  pin TEXT,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  is_logged_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Copy existing data if any (match by email if possible)
-- Note: This is best-effort migration. Manual cleanup may be needed.
INSERT INTO profiles_new (id, name, email, pin, theme, is_logged_in, created_at, updated_at)
SELECT 
  au.id,
  p.name,
  p.email,
  p.pin,
  p.theme,
  p.is_logged_in,
  p.created_at,
  p.updated_at
FROM profiles p
INNER JOIN auth.users au ON p.email = au.email
ON CONFLICT (id) DO NOTHING;

-- Step 5: Drop old table and rename new one
DROP TABLE profiles CASCADE;
ALTER TABLE profiles_new RENAME TO profiles;

-- Step 6: Recreate foreign key constraints
ALTER TABLE mood_entries 
  ADD CONSTRAINT mood_entries_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE journal_entries 
  ADD CONSTRAINT journal_entries_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE gratitude_entries 
  ADD CONSTRAINT gratitude_entries_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE vault_entries 
  ADD CONSTRAINT vault_entries_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 7: Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 8: Create proper RLS policies using auth.uid()
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 9: Recreate updated_at trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Create trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, theme, is_logged_in)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'light',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 11: Update RLS policies for related tables to use auth.uid()
DROP POLICY IF EXISTS "Users can view own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can insert own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can update own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can delete own mood entries" ON mood_entries;

CREATE POLICY "Users can view own mood entries"
  ON mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries"
  ON mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
  ON mood_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries"
  ON mood_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Journal entries
DROP POLICY IF EXISTS "Users can view own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON journal_entries;

CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Gratitude entries
DROP POLICY IF EXISTS "Users can view own gratitude entries" ON gratitude_entries;
DROP POLICY IF EXISTS "Users can insert own gratitude entries" ON gratitude_entries;
DROP POLICY IF EXISTS "Users can update own gratitude entries" ON gratitude_entries;
DROP POLICY IF EXISTS "Users can delete own gratitude entries" ON gratitude_entries;

CREATE POLICY "Users can view own gratitude entries"
  ON gratitude_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gratitude entries"
  ON gratitude_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gratitude entries"
  ON gratitude_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gratitude entries"
  ON gratitude_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Vault entries
DROP POLICY IF EXISTS "Users can view own vault entries" ON vault_entries;
DROP POLICY IF EXISTS "Users can insert own vault entries" ON vault_entries;
DROP POLICY IF EXISTS "Users can update own vault entries" ON vault_entries;
DROP POLICY IF EXISTS "Users can delete own vault entries" ON vault_entries;

CREATE POLICY "Users can view own vault entries"
  ON vault_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vault entries"
  ON vault_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault entries"
  ON vault_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault entries"
  ON vault_entries FOR DELETE
  USING (auth.uid() = user_id);
