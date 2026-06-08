# 🎭 Multiple Daily Mood Check-in System

## Konsep Overview

Sistem baru ini memungkinkan user untuk:
- ✅ Check-in mood **berkali-kali dalam sehari**
- ✅ Melihat **timeline perubahan mood** per hari
- ✅ Mendapatkan **rata-rata mood harian**
- ✅ Mengetahui **kapan dan mengapa** mood berubah
- ✅ Melihat **pola perubahan mood** (morning vs evening, etc)

---

## 📊 Data Model

### Database Schema Baru

```sql
-- Tabel baru: mood_checkins (multiple per day)
CREATE TABLE mood_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Mood data
  mood TEXT NOT NULL CHECK (mood IN ('senang', 'biasa', 'capek', 'cemas', 'sedih', 'marah', 'kosong')),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  
  -- Context
  triggers TEXT[] DEFAULT '{}',
  note TEXT,
  location_context TEXT, -- 'home', 'work', 'outside', 'commute'
  activity_context TEXT, -- 'working', 'relaxing', 'socializing', 'exercising'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_mood_checkins_user_date (user_id, date DESC, time DESC)
);

-- Tabel untuk daily summary (computed dari checkins)
CREATE TABLE mood_daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Aggregated data
  total_checkins INTEGER NOT NULL DEFAULT 0,
  average_score DECIMAL(3,1) NOT NULL,
  dominant_mood TEXT NOT NULL,
  
  -- Mood distribution
  mood_distribution JSONB, -- {"senang": 2, "capek": 1, "biasa": 3}
  
  -- Insights
  best_time TIME, -- Time of highest score
  worst_time TIME, -- Time of lowest score
  mood_volatility DECIMAL(3,2), -- Standard deviation of scores
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);
```

### TypeScript Types

```typescript
// Individual check-in
interface MoodCheckin {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timestamp: string;
  
  mood: MoodType;
  score: number; // 1-10
  
  triggers: TriggerType[];
  note?: string;
  locationContext?: 'home' | 'work' | 'outside' | 'commute';
  activityContext?: 'working' | 'relaxing' | 'socializing' | 'exercising';
  
  createdAt: string;
}

// Daily summary
interface MoodDailySummary {
  id: string;
  userId: string;
  date: string;
  
  totalCheckins: number;
  averageScore: number;
  dominantMood: MoodType;
  
  moodDistribution: Record<MoodType, number>;
  
  bestTime?: string;
  worstTime?: string;
  moodVolatility: number;
  
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎨 UI/UX Design

### 1. Quick Check-in Widget (Floating Button)

**Location**: Available on all pages  
**Design**: Floating action button (FAB) di bottom-right

```
┌─────────────────────────────────────┐
│                                     │
│   [Page Content]                    │
│                                     │
│                              ┌────┐ │
│                              │ 😊 │ │ ← FAB: Quick Check-in
│                              └────┘ │
└─────────────────────────────────────┘
```

**Interaction**:
- Click → Opens modal with mood selector
- Quick 3-step flow:
  1. Select mood emoji
  2. Rate 1-10
  3. Optional: Add note/trigger

### 2. Check-in Modal

```
┌────────────────────────────────────┐
│  How are you feeling right now?    │
│                                    │
│  😊  😐  😓  😰  😢  😠  😶      │
│  ↑ Selected                        │
│                                    │
│  Rate your mood: [1──●─────10]     │
│                    ↑ 7             │
│                                    │
│  What's happening? (optional)      │
│  ┌──────────────────────────────┐ │
│  │ Just finished a good meeting │ │
│  └──────────────────────────────┘ │
│                                    │
│  Quick triggers:                   │
│  [Kerja] [Keluarga] [Kesehatan]   │
│  [Hubungan] [Keuangan] [Cuaca]    │
│                                    │
│  Context (optional):               │
│  Location: [🏠 Home ▼]             │
│  Activity: [💼 Working ▼]          │
│                                    │
│  [Cancel]          [Check In] ✓   │
└────────────────────────────────────┘
```

### 3. Daily Timeline View

**Page**: `/checkin` (new page)

```
┌────────────────────────────────────────────┐
│  📅 Today's Mood Journey                   │
│                                            │
│  Average: 7.2/10  │  Check-ins: 4         │
│  Dominant: 😊 Senang                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                            │
│  Timeline                                  │
│  ┌────────────────────────────────────┐   │
│  │ 🌅 07:30 - Morning                 │   │
│  │ 😊 Senang (8/10)                   │   │
│  │ "Bangun dengan semangat!"          │   │
│  │ 🏠 Home · 🧘 Relaxing               │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ ☀️ 12:15 - Afternoon               │   │
│  │ 😐 Biasa (6/10)                     │   │
│  │ "Kerjaan mulai menumpuk"           │   │
│  │ 💼 Work · 💻 Working                │   │
│  │ Triggers: Kerja                    │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ 🌤️ 15:45 - Afternoon                │   │
│  │ 😊 Senang (7/10)                   │   │
│  │ "Meeting sukses!"                  │   │
│  │ 💼 Work · 👥 Socializing            │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ 🌙 20:30 - Evening                  │   │
│  │ 😓 Capek (5/10)                     │   │
│  │ "Lelah setelah seharian kerja"    │   │
│  │ 🏠 Home · 🧘 Relaxing               │   │
│  └────────────────────────────────────┘   │
│                                            │
│  [+ Add Check-in]                          │
└────────────────────────────────────────────┘
```

### 4. Mood Graph (Visual Timeline)

```
┌────────────────────────────────────────────┐
│  Mood Score Throughout the Day             │
│                                            │
│  10 ┤                                      │
│   9 ┤     ●                                │
│   8 ┤    ╱                                 │
│   7 ┤   ╱   ●                              │
│   6 ┤  ╱   ╱ ╲                             │
│   5 ┤       ╲  ●                           │
│   4 ┤        ╲╱                            │
│   3 ┤                                      │
│   2 ┤                                      │
│   1 ┤                                      │
│     └─┬───┬───┬───┬───┬───┬───┬───┬──     │
│       7   9  11  13  15  17  19  21       │
│      AM  AM  AM  PM  PM  PM  PM  PM       │
└────────────────────────────────────────────┘
```

### 5. Weekly Pattern View

```
┌────────────────────────────────────────────┐
│  📊 This Week's Mood Patterns              │
│                                            │
│  Mon  ━━━━●━━━━  7.2  (5 check-ins)      │
│  Tue  ━━━━━●━━━  8.1  (4 check-ins)      │
│  Wed  ━━●━━━━━━  5.5  (6 check-ins) ⚠️   │
│  Thu  ━━━━━━●━━  8.8  (3 check-ins)      │
│  Fri  ━━━━━●━━━  7.9  (5 check-ins)      │
│  Sat  ━━━━━━━●━  9.0  (2 check-ins)      │
│  Sun  ━━━━━━●━━  8.5  (3 check-ins)      │
│                                            │
│  Insights:                                 │
│  📈 Mood improving towards weekend         │
│  ⚠️  Wednesday was challenging             │
│  🌙 Evening moods typically higher         │
└────────────────────────────────────────────┘
```

---

## 💡 Smart Features

### 1. Suggested Check-in Times

**Smart Reminders** berdasarkan pola user:

```typescript
interface CheckinReminder {
  time: string;
  reason: string;
  enabled: boolean;
}

const suggestedTimes = [
  { time: '07:30', reason: 'Morning check-in - Start your day', enabled: true },
  { time: '12:00', reason: 'Midday check-in - How\'s lunch going?', enabled: true },
  { time: '17:00', reason: 'End of work - Time to unwind', enabled: true },
  { time: '21:00', reason: 'Evening reflection', enabled: true },
];
```

### 2. Mood Change Alerts

Deteksi perubahan mood drastis:

```typescript
interface MoodChangeAlert {
  type: 'significant_drop' | 'significant_rise' | 'high_volatility';
  message: string;
  suggestion?: string;
}

// Example
{
  type: 'significant_drop',
  message: 'Your mood dropped from 8 to 4 in 2 hours',
  suggestion: 'Consider taking a break or trying a breathing exercise'
}
```

### 3. Context-based Insights

```typescript
interface ContextInsight {
  context: string;
  averageScore: number;
  count: number;
  insight: string;
}

// Examples
{
  context: 'work',
  averageScore: 5.8,
  count: 45,
  insight: 'Your mood at work is typically lower. Consider breaks every 2 hours.'
}

{
  context: 'socializing',
  averageScore: 8.2,
  count: 12,
  insight: 'Socializing consistently boosts your mood! {'<3'}'
}
```

### 4. Mood Prediction

Berdasarkan historical data:

```typescript
interface MoodPrediction {
  time: string;
  predictedScore: number;
  confidence: number; // 0-1
  basedOn: string;
}

// Example: "Based on the past 2 weeks, your mood typically dips around 3 PM"
```

---

## 🎯 User Flow

### Quick Check-in Flow

```
1. User clicks FAB
   ↓
2. Modal opens with mood selector
   ↓
3. User selects mood emoji (😊)
   ↓
4. Slider appears for score (1-10)
   ↓
5. Optional: Add note + triggers
   ↓
6. Click "Check In"
   ↓
7. Success animation + encouraging message
   ↓
8. Modal closes
```

**Time to complete**: 5-10 seconds (quick!)

### View Timeline Flow

```
1. User navigates to /checkin
   ↓
2. See today's timeline with all check-ins
   ↓
3. Can scroll to see history
   ↓
4. Click on a check-in to see details
   ↓
5. Can edit/delete old check-ins
   ↓
6. See insights at top (average, patterns, etc)
```

---

## 📱 Component Structure

```
src/
├── app/
│   └── checkin/
│       ├── page.tsx              # Main check-in timeline page
│       └── components/
│           ├── CheckinTimeline.tsx
│           ├── CheckinCard.tsx
│           ├── MoodGraph.tsx
│           ├── DailySummary.tsx
│           └── WeeklyPattern.tsx
│
├── components/
│   └── ui/
│       ├── QuickCheckinFAB.tsx   # Floating action button
│       ├── CheckinModal.tsx      # Check-in modal
│       ├── MoodSelector.tsx      # Emoji selector
│       ├── ScoreSlider.tsx       # 1-10 slider
│       └── ContextSelector.tsx   # Location/activity
│
└── lib/
    ├── checkin-service.ts        # API calls
    └── mood-analytics.ts         # Analytics functions
```

---

## 🔥 Key Features

### 1. **Quick & Easy**
- FAB accessible from anywhere
- 3-step check-in (5 seconds)
- Smart defaults based on time of day

### 2. **Visual Timeline**
- See all check-ins for a day
- Color-coded by mood
- Time indicators (morning/afternoon/evening)

### 3. **Insights & Analytics**
- Daily average score
- Mood volatility indicator
- Best/worst times
- Pattern recognition

### 4. **Context Awareness**
- Location (home/work/outside)
- Activity (working/relaxing/etc)
- Triggers correlation

### 5. **Encouraging**
- Success messages after check-in
- Celebrate consistency
- Gentle reminders (not pushy)

### 6. **Privacy First**
- All data encrypted
- Can mark notes as private
- Optional sharing

---

## 📊 Analytics & Insights

### Daily Insights

```typescript
interface DailyInsights {
  // Basic stats
  totalCheckins: number;
  averageScore: number;
  dominantMood: MoodType;
  
  // Time-based
  bestTime: string;        // "You feel best around 8 AM"
  worstTime: string;       // "Mood dips around 3 PM"
  
  // Patterns
  moodTrajectory: 'improving' | 'declining' | 'stable' | 'volatile';
  volatility: number;      // How much mood changes
  
  // Recommendations
  suggestions: string[];   // ["Consider a break at 3 PM", "Morning routine working well!"]
}
```

### Weekly Insights

```typescript
interface WeeklyInsights {
  // Aggregated
  weeklyAverage: number;
  bestDay: string;
  worstDay: string;
  totalCheckins: number;
  
  // Patterns
  weekdayVsWeekend: {
    weekday: number;
    weekend: number;
    difference: number;
  };
  
  // Trends
  trend: 'improving' | 'declining' | 'stable';
  comparedToLastWeek: number; // +1.2 or -0.8
  
  // Top triggers (positive & negative)
  positiveCorrelations: Array<{trigger: string, avgScore: number}>;
  negativeCorrelations: Array<{trigger: string, avgScore: number}>;
}
```

---

## 🎨 Visual Design Notes

### Colors by Mood

```typescript
const moodColors = {
  senang: '#10b981',  // Green - Happy
  biasa: '#6b7280',   // Gray - Neutral
  capek: '#f59e0b',   // Orange - Tired
  cemas: '#ef4444',   // Red - Anxious
  sedih: '#3b82f6',   // Blue - Sad
  marah: '#dc2626',   // Dark Red - Angry
  kosong: '#9ca3af',  // Light Gray - Empty
};
```

### Animations

- **Check-in success**: Confetti or emoji burst
- **FAB**: Pulse animation to encourage check-in
- **Timeline**: Slide in from bottom
- **Graph**: Smooth line animation

---

## 🚀 Implementation Priority

### Phase 1: Core (Week 1)
- [ ] Database migration for new schema
- [ ] Quick check-in FAB + Modal
- [ ] Basic timeline view
- [ ] Save/retrieve check-ins

### Phase 2: Analytics (Week 2)
- [ ] Daily summary calculation
- [ ] Average score computation
- [ ] Mood graph visualization
- [ ] Basic insights

### Phase 3: Enhanced (Week 3)
- [ ] Context tracking (location/activity)
- [ ] Weekly patterns
- [ ] Smart suggestions
- [ ] Mood change alerts

### Phase 4: Advanced (Week 4)
- [ ] Mood prediction
- [ ] Export data
- [ ] Sharing features
- [ ] Advanced analytics

---

## 📝 Example Scenarios

### Scenario 1: Typical Workday

```
07:30 - 😊 Senang (8/10) - "Good morning!"
12:30 - 😐 Biasa (6/10) - "Work piling up" [Kerja]
15:00 - 😓 Capek (4/10) - "Meeting marathon" [Kerja, Kelelahan]
18:00 - 😊 Senang (7/10) - "Finally done!"
21:00 - 😊 Senang (8/10) - "Relaxing at home"

Average: 6.6/10
Pattern: Mid-day slump
Suggestion: "Take breaks around 3 PM"
```

### Scenario 2: Weekend

```
10:00 - 😊 Senang (9/10) - "Lazy morning" [🏠 Home]
14:00 - 😊 Senang (9/10) - "Brunch with friends" [Hubungan]
19:00 - 😊 Senang (8/10) - "Movie night"

Average: 8.7/10
Pattern: Consistently high
Insight: "Social time boosts your mood! {'<3'}"
```

---

## 🎯 Success Metrics

- **Engagement**: Check-ins per day (target: 3-5)
- **Consistency**: Days with at least 1 check-in (target: 80%)
- **Completion time**: Average check-in time (target: <10 sec)
- **Insights value**: User finds insights helpful (survey)

---

## 💬 Encouraging Messages

After check-in:

```typescript
const encouragingMessages = {
  high: [
    "Love your energy! {'<3'}",
    "You're doing great today! :)",
    "Keep that good vibe going!",
  ],
  medium: [
    "Every moment matters :)",
    "You've got this!",
    "Thanks for checking in {'<3'}",
  ],
  low: [
    "It's okay to have tough moments :)",
    "Be gentle with yourself {'<3'}",
    "Tomorrow is a new day",
    "Want to try a breathing exercise?",
  ],
};
```

---

This concept creates a comprehensive mood tracking system that's:
- ✅ **Quick** - 5-second check-ins
- ✅ **Insightful** - Rich analytics
- ✅ **Encouraging** - Supportive messaging
- ✅ **Actionable** - Smart suggestions
- ✅ **Beautiful** - Intuitive UI

Ready to implement! :)
