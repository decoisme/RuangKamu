-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  pin TEXT,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  is_logged_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood entries table
CREATE TABLE mood_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('senang', 'biasa', 'capek', 'cemas', 'sedih', 'marah', 'kosong')),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  triggers TEXT[] DEFAULT '{}',
  note TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Journal entries table
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  prompt TEXT,
  is_private BOOLEAN DEFAULT false,
  ai_summary TEXT,
  drawing TEXT, -- base64 encoded image
  drawing_ai_interpretation TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gratitude entries table
CREATE TABLE gratitude_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  items TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Vault entries table (private notes)
CREATE TABLE vault_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_mood_entries_user_date ON mood_entries(user_id, date DESC);
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, date DESC);
CREATE INDEX idx_gratitude_entries_user_date ON gratitude_entries(user_id, date DESC);
CREATE INDEX idx_vault_entries_user ON vault_entries(user_id, created_at DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_entries_updated_at
  BEFORE UPDATE ON vault_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gratitude_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies (public read for own profile, authenticated write)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (true); -- For demo, allow all. In production: auth.uid() = id

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (true); -- For demo, allow all. In production: auth.uid() = id

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (true); -- For demo, allow all

-- Mood entries policies
CREATE POLICY "Users can view own mood entries"
  ON mood_entries FOR SELECT
  USING (true); -- For demo, allow all. In production: auth.uid() = user_id

CREATE POLICY "Users can insert own mood entries"
  ON mood_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own mood entries"
  ON mood_entries FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own mood entries"
  ON mood_entries FOR DELETE
  USING (true);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE
  USING (true);

-- Gratitude entries policies
CREATE POLICY "Users can view own gratitude entries"
  ON gratitude_entries FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own gratitude entries"
  ON gratitude_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own gratitude entries"
  ON gratitude_entries FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own gratitude entries"
  ON gratitude_entries FOR DELETE
  USING (true);

-- Vault entries policies
CREATE POLICY "Users can view own vault entries"
  ON vault_entries FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own vault entries"
  ON vault_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own vault entries"
  ON vault_entries FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own vault entries"
  ON vault_entries FOR DELETE
  USING (true);
