-- Migration: Multiple Daily Mood Check-ins System
-- This adds support for multiple mood entries per day with timeline tracking

-- Step 1: Create mood_checkins table for multiple entries per day
CREATE TABLE mood_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Date and time
  date DATE NOT NULL,
  time TIME NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Mood data
  mood TEXT NOT NULL CHECK (mood IN ('senang', 'biasa', 'capek', 'cemas', 'sedih', 'marah', 'kosong')),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  
  -- Context
  triggers TEXT[] DEFAULT '{}',
  note TEXT,
  location_context TEXT CHECK (location_context IN ('home', 'work', 'outside', 'commute', NULL)),
  activity_context TEXT CHECK (activity_context IN ('working', 'relaxing', 'socializing', 'exercising', 'studying', 'sleeping', NULL)),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Step 2: Create mood_daily_summaries for aggregated daily data
CREATE TABLE mood_daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  
  -- Aggregated data
  total_checkins INTEGER NOT NULL DEFAULT 0,
  average_score DECIMAL(3,1) NOT NULL,
  dominant_mood TEXT NOT NULL,
  
  -- Mood distribution (JSON: {"senang": 2, "capek": 1, "biasa": 3})
  mood_distribution JSONB DEFAULT '{}',
  
  -- Time-based insights
  best_time TIME,
  best_score INTEGER,
  worst_time TIME,
  worst_score INTEGER,
  mood_volatility DECIMAL(3,2), -- Standard deviation
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id, date)
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_mood_checkins_user_date_time 
  ON mood_checkins(user_id, date DESC, time DESC);

CREATE INDEX idx_mood_checkins_timestamp 
  ON mood_checkins(timestamp DESC);

CREATE INDEX idx_mood_daily_summaries_user_date 
  ON mood_daily_summaries(user_id, date DESC);

-- Step 4: Enable RLS
ALTER TABLE mood_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_daily_summaries ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for mood_checkins
CREATE POLICY "Users can view own check-ins"
  ON mood_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins"
  ON mood_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins"
  ON mood_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own check-ins"
  ON mood_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- Step 6: Create RLS policies for mood_daily_summaries
CREATE POLICY "Users can view own summaries"
  ON mood_daily_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries"
  ON mood_daily_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summaries"
  ON mood_daily_summaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own summaries"
  ON mood_daily_summaries FOR DELETE
  USING (auth.uid() = user_id);

-- Step 7: Create function to calculate daily summary
CREATE OR REPLACE FUNCTION calculate_daily_mood_summary(p_user_id UUID, p_date DATE)
RETURNS void AS $$
DECLARE
  v_total_checkins INTEGER;
  v_avg_score DECIMAL(3,1);
  v_dominant_mood TEXT;
  v_mood_dist JSONB;
  v_best_time TIME;
  v_best_score INTEGER;
  v_worst_time TIME;
  v_worst_score INTEGER;
  v_volatility DECIMAL(3,2);
BEGIN
  -- Calculate total check-ins
  SELECT COUNT(*) INTO v_total_checkins
  FROM mood_checkins
  WHERE user_id = p_user_id AND date = p_date;
  
  -- Skip if no check-ins
  IF v_total_checkins = 0 THEN
    RETURN;
  END IF;
  
  -- Calculate average score
  SELECT ROUND(AVG(score)::numeric, 1) INTO v_avg_score
  FROM mood_checkins
  WHERE user_id = p_user_id AND date = p_date;
  
  -- Find dominant mood (most frequent)
  SELECT mood INTO v_dominant_mood
  FROM mood_checkins
  WHERE user_id = p_user_id AND date = p_date
  GROUP BY mood
  ORDER BY COUNT(*) DESC, MAX(timestamp) DESC
  LIMIT 1;
  
  -- Calculate mood distribution
  SELECT jsonb_object_agg(mood, cnt) INTO v_mood_dist
  FROM (
    SELECT mood, COUNT(*) as cnt
    FROM mood_checkins
    WHERE user_id = p_user_id AND date = p_date
    GROUP BY mood
  ) sub;
  
  -- Find best time (highest score)
  SELECT time, score INTO v_best_time, v_best_score
  FROM mood_checkins
  WHERE user_id = p_user_id AND date = p_date
  ORDER BY score DESC, timestamp DESC
  LIMIT 1;
  
  -- Find worst time (lowest score)
  SELECT time, score INTO v_worst_time, v_worst_score
  FROM mood_checkins
  WHERE user_id = p_user_id AND date = p_date
  ORDER BY score ASC, timestamp ASC
  LIMIT 1;
  
  -- Calculate mood volatility (standard deviation)
  SELECT ROUND(STDDEV(score)::numeric, 2) INTO v_volatility
  FROM mood_checkins
  WHERE user_id = p_user_id AND date = p_date;
  
  -- Upsert summary
  INSERT INTO mood_daily_summaries (
    user_id, date, total_checkins, average_score, dominant_mood,
    mood_distribution, best_time, best_score, worst_time, worst_score,
    mood_volatility
  ) VALUES (
    p_user_id, p_date, v_total_checkins, v_avg_score, v_dominant_mood,
    v_mood_dist, v_best_time, v_best_score, v_worst_time, v_worst_score,
    v_volatility
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_checkins = v_total_checkins,
    average_score = v_avg_score,
    dominant_mood = v_dominant_mood,
    mood_distribution = v_mood_dist,
    best_time = v_best_time,
    best_score = v_best_score,
    worst_time = v_worst_time,
    worst_score = v_worst_score,
    mood_volatility = v_volatility,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create trigger to auto-update summary when check-in is added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_daily_mood_summary(OLD.user_id, OLD.date);
    RETURN OLD;
  ELSE
    PERFORM calculate_daily_mood_summary(NEW.user_id, NEW.date);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_mood_checkin_change
  AFTER INSERT OR UPDATE OR DELETE ON mood_checkins
  FOR EACH ROW EXECUTE FUNCTION trigger_update_daily_summary();

-- Step 9: Create trigger for updated_at on summaries
CREATE TRIGGER update_mood_daily_summaries_updated_at
  BEFORE UPDATE ON mood_daily_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Migrate existing mood_entries to mood_checkins (if any exist)
-- This preserves existing data by converting single daily entries to check-ins
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Check if mood_entries table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mood_entries') THEN
    -- Migrate each mood_entry as a single check-in at noon
    FOR r IN SELECT * FROM mood_entries ORDER BY date, timestamp LOOP
      INSERT INTO mood_checkins (
        user_id, date, time, timestamp,
        mood, score, triggers, note
      ) VALUES (
        r.user_id, 
        r.date, 
        COALESCE(r.timestamp::time, '12:00:00'::time), 
        COALESCE(r.timestamp, r.created_at, NOW()),
        r.mood, 
        r.score, 
        r.triggers, 
        r.note
      )
      ON CONFLICT DO NOTHING;
      
      -- Calculate summary for migrated date
      PERFORM calculate_daily_mood_summary(r.user_id, r.date);
    END LOOP;
  END IF;
END $$;

-- Step 11: Add helpful view for quick queries
CREATE OR REPLACE VIEW mood_checkins_with_context AS
SELECT 
  mc.*,
  to_char(mc.time, 'HH24:MI') as time_formatted,
  to_char(mc.timestamp, 'YYYY-MM-DD HH24:MI') as datetime_formatted,
  CASE 
    WHEN EXTRACT(HOUR FROM mc.time) BETWEEN 5 AND 11 THEN 'morning'
    WHEN EXTRACT(HOUR FROM mc.time) BETWEEN 12 AND 16 THEN 'afternoon'
    WHEN EXTRACT(HOUR FROM mc.time) BETWEEN 17 AND 20 THEN 'evening'
    ELSE 'night'
  END as time_of_day,
  p.name as user_name
FROM mood_checkins mc
JOIN profiles p ON mc.user_id = p.id;

-- Step 12: Grant access to view
GRANT SELECT ON mood_checkins_with_context TO authenticated;

-- Comments for documentation
COMMENT ON TABLE mood_checkins IS 'Stores multiple mood check-ins per day for detailed timeline tracking';
COMMENT ON TABLE mood_daily_summaries IS 'Aggregated daily mood summaries calculated from check-ins';
COMMENT ON FUNCTION calculate_daily_mood_summary IS 'Calculates and updates daily mood summary from all check-ins for a given date';
COMMENT ON COLUMN mood_daily_summaries.mood_volatility IS 'Standard deviation of mood scores (higher = more volatile)';
