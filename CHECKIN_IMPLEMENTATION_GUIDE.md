# 🚀 Mood Check-in Implementation Guide

## Overview

Sistem multiple daily check-ins sudah ready untuk diimplementasikan! :)

**What's Ready:**
- ✅ Database schema & migration (`003_mood_checkins_system.sql`)
- ✅ TypeScript types & service layer (`checkin-service.ts`)
- ✅ Detailed concept document (`MOOD_CHECKIN_CONCEPT.md`)

**What's Next:**
- Build UI components
- Create check-in page
- Integrate with existing app

---

## 📋 Step-by-Step Implementation

### Phase 1: Database Setup (10 minutes)

**1. Run Migration**

```bash
# In Supabase Dashboard → SQL Editor
# Copy & paste: supabase/migrations/003_mood_checkins_system.sql
# Click Run
```

**What it creates:**
- `mood_checkins` table - stores individual check-ins
- `mood_daily_summaries` table - pre-computed daily stats
- Auto-calculation trigger - updates summaries automatically
- RLS policies - data security
- Helper functions - summary calculations

**2. Verify Migration**

```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'mood_%';

-- Should return:
-- mood_entries (old)
-- mood_checkins (new)
-- mood_daily_summaries (new)

-- Test insert (replace with your user ID)
INSERT INTO mood_checkins (user_id, date, time, mood, score, note)
VALUES (
  auth.uid(),
  CURRENT_DATE,
  CURRENT_TIME,
  'senang',
  8,
  'Testing the new system!'
);

-- Check summary auto-created
SELECT * FROM mood_daily_summaries 
WHERE user_id = auth.uid() 
AND date = CURRENT_DATE;
```

---

### Phase 2: Build Components (2-3 hours)

#### Component 1: Quick Check-in FAB

**File**: `src/components/ui/QuickCheckinFAB.tsx`

```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CheckinModal from './CheckinModal';

export default function QuickCheckinFAB() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-black text-white shadow-2xl flex items-center justify-center"
      >
        <span className="text-2xl">😊</span>
      </motion.button>
      
      {/* Check-in Modal */}
      <AnimatePresence>
        {showModal && (
          <CheckinModal 
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              // TODO: Show success toast
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
```

#### Component 2: Check-in Modal

**File**: `src/components/ui/CheckinModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { saveMoodCheckin } from '@/lib/checkin-service';
import type { MoodType, TriggerType } from '@/lib/types';

interface CheckinModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const MOODS: Array<{ value: MoodType; emoji: string; label: string }> = [
  { value: 'senang', emoji: '😊', label: 'Senang' },
  { value: 'biasa', emoji: '😐', label: 'Biasa' },
  { value: 'capek', emoji: '😓', label: 'Capek' },
  { value: 'cemas', emoji: '😰', label: 'Cemas' },
  { value: 'sedih', emoji: '😢', label: 'Sedih' },
  { value: 'marah', emoji: '😠', label: 'Marah' },
  { value: 'kosong', emoji: '😶', label: 'Kosong' },
];

const TRIGGERS: TriggerType[] = [
  'Kerja', 'Keluarga', 'Hubungan', 'Kesehatan', 
  'Keuangan', 'Cuaca', 'Kelelahan', 'Kesendirian'
];

export default function CheckinModal({ onClose, onSuccess }: CheckinModalProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [score, setScore] = useState(5);
  const [note, setNote] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<TriggerType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedMood) return;
    
    setLoading(true);
    
    const now = new Date();
    const checkin = {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      timestamp: now.toISOString(),
      mood: selectedMood,
      score,
      triggers: selectedTriggers,
      note: note.trim() || undefined,
    };
    
    const result = await saveMoodCheckin(checkin);
    
    if (result) {
      onSuccess();
    } else {
      alert('Failed to save check-in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
      >
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          How are you feeling right now?
        </h2>

        {/* Mood Selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`p-3 rounded-xl transition-all ${
                selectedMood === mood.value
                  ? 'bg-black text-white scale-105'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl">{mood.emoji}</div>
              <div className="text-xs mt-1">{mood.label}</div>
            </button>
          ))}
        </div>

        {/* Score Slider */}
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
              Rate your mood: {score}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full"
            />
          </motion.div>
        )}

        {/* Note */}
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
              What's happening? (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-3 py-2 rounded-xl bg-gray-100 border-none resize-none"
              rows={2}
            />
          </motion.div>
        )}

        {/* Triggers */}
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
              Quick triggers:
            </label>
            <div className="flex flex-wrap gap-2">
              {TRIGGERS.map((trigger) => (
                <button
                  key={trigger}
                  onClick={() => {
                    if (selectedTriggers.includes(trigger)) {
                      setSelectedTriggers(selectedTriggers.filter(t => t !== trigger));
                    } else {
                      setSelectedTriggers([...selectedTriggers, trigger]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedTriggers.includes(trigger)
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedMood || loading}
            className="flex-1 py-3 rounded-xl bg-black text-white hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Check In ✓'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

#### Component 3: Check-in Timeline

**File**: `src/components/ui/CheckinTimeline.tsx`

See full implementation in concept doc - includes timeline cards, mood graph, daily summary, etc.

---

### Phase 3: Create Check-in Page (1 hour)

**File**: `src/app/checkin/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getTodayCheckins, getTodaySummary } from '@/lib/checkin-service';
import type { MoodCheckin, MoodDailySummary } from '@/lib/checkin-service';
import CheckinTimeline from '@/components/ui/CheckinTimeline';
import DailySummary from '@/components/ui/DailySummary';

export default function CheckinPage() {
  const [checkins, setCheckins] = useState<MoodCheckin[]>([]);
  const [summary, setSummary] = useState<MoodDailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [checkinsData, summaryData] = await Promise.all([
      getTodayCheckins(),
      getTodaySummary(),
    ]);
    setCheckins(checkinsData);
    setSummary(summaryData);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-6">Today's Mood Journey</h1>
      
      {summary && <DailySummary summary={summary} />}
      
      <CheckinTimeline 
        checkins={checkins} 
        onUpdate={loadData}
      />
    </div>
  );
}
```

---

### Phase 4: Integration (30 minutes)

**1. Add FAB to Layout**

**File**: `src/app/layout.tsx`

```typescript
import QuickCheckinFAB from '@/components/ui/QuickCheckinFAB';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <QuickCheckinFAB />  {/* Add this */}
      </body>
    </html>
  );
}
```

**2. Add Navigation Link**

**File**: `src/components/layout/Navbar.tsx` (or Sidebar)

Add link to `/checkin` page:

```typescript
<Link href="/checkin" className="nav-link">
  📊 Check-ins
</Link>
```

**3. Update Dashboard**

Show today's summary on dashboard:

```typescript
import { getTodaySummary } from '@/lib/checkin-service';

// In component
const summary = await getTodaySummary();

if (summary) {
  return (
    <div className="card">
      <h3>Today's Mood</h3>
      <p>Average: {summary.averageScore}/10</p>
      <p>Check-ins: {summary.totalCheckins}</p>
      <Link href="/checkin">View Timeline →</Link>
    </div>
  );
}
```

---

## 🎨 UI Component Checklist

### Must-Have Components

- [x] `QuickCheckinFAB.tsx` - Floating action button
- [x] `CheckinModal.tsx` - Quick check-in form
- [ ] `CheckinTimeline.tsx` - Timeline of check-ins
- [ ] `CheckinCard.tsx` - Individual check-in card
- [ ] `DailySummary.tsx` - Daily stats widget
- [ ] `MoodGraph.tsx` - Visual mood chart
- [ ] `WeeklyPattern.tsx` - Week overview

### Nice-to-Have Components

- [ ] `MoodPrediction.tsx` - Predicted mood based on patterns
- [ ] `ContextInsights.tsx` - Insights from location/activity
- [ ] `MoodChangeAlert.tsx` - Alert for significant changes
- [ ] `CheckinReminders.tsx` - Smart reminder settings

---

## 📊 Data Flow

### Check-in Flow

```
User clicks FAB
  ↓
CheckinModal opens
  ↓
User selects mood + score
  ↓
saveMoodCheckin() called
  ↓
Data saved to mood_checkins table
  ↓
Trigger fires → calculate_daily_mood_summary()
  ↓
mood_daily_summaries table updated
  ↓
Success message shown
  ↓
Modal closes
```

### View Flow

```
User navigates to /checkin
  ↓
getTodayCheckins() fetches check-ins
  ↓
getTodaySummary() fetches summary
  ↓
CheckinTimeline renders timeline
  ↓
DailySummary shows stats
```

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] saveMoodCheckin() creates check-in
- [ ] getDailySummary() returns correct data
- [ ] Summary calculation is accurate
- [ ] Trigger updates summary correctly

### Integration Tests

- [ ] FAB opens modal
- [ ] Modal submits data
- [ ] Timeline displays check-ins
- [ ] Summary updates after check-in

### E2E Tests

- [ ] Complete check-in flow works
- [ ] Multiple check-ins per day work
- [ ] Summary calculates correctly
- [ ] Data persists after refresh

---

## 🚀 Deployment Steps

### 1. Run Migration

```bash
# In Supabase Dashboard
# Run: supabase/migrations/003_mood_checkins_system.sql
```

### 2. Deploy Code

```bash
git add .
git commit -m "feat: multiple daily mood check-ins system"
git push
```

### 3. Test in Production

1. Login to production site
2. Click FAB
3. Complete check-in
4. Verify data in Supabase Dashboard
5. Check `/checkin` page loads
6. Verify summary calculates correctly

---

## 📈 Success Metrics

Track these after launch:

- **Engagement**: Check-ins per user per day (target: 3-5)
- **Retention**: Users with check-ins 7 days in a row (target: 50%)
- **Speed**: Average check-in completion time (target: <10 seconds)
- **Satisfaction**: User finds insights helpful (survey)

---

## 🐛 Common Issues & Solutions

### Issue: Summary not updating

**Solution**: 
```sql
-- Manually trigger calculation
SELECT calculate_daily_mood_summary(auth.uid(), CURRENT_DATE);
```

### Issue: RLS blocking queries

**Solution**:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'mood_checkins';

-- Test query as user
SELECT * FROM mood_checkins WHERE user_id = auth.uid();
```

### Issue: FAB not showing

**Solution**: Check z-index conflicts, ensure layout includes component.

---

## 📚 Additional Resources

- Concept Document: `MOOD_CHECKIN_CONCEPT.md`
- Service Layer: `src/lib/checkin-service.ts`
- Database Schema: `supabase/migrations/003_mood_checkins_system.sql`
- Types: See `checkin-service.ts` exports

---

## 🎉 Next Steps After Implementation

Once basic system is working:

1. **Add reminders** - Smart notifications for check-ins
2. **Add insights** - Pattern recognition & predictions
3. **Add export** - Download mood data as CSV/PDF
4. **Add sharing** - Share progress with trusted people
5. **Add gamification** - Badges for consistency

---

Ready to build! Start with Phase 1 (database) then Phase 2 (components) :)
