# ⚡ Multiple Daily Check-ins - Quick Start

## 3 Steps to Deploy

### ✅ Step 1: Run Migration (5 menit)

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project **Ruang Kamu**
3. Klik **SQL Editor** di sidebar
4. Klik **New Query**
5. Copy-paste file: `supabase/migrations/003_mood_checkins_system.sql`
6. Klik **Run**
7. Tunggu success ✅

### ✅ Step 2: Deploy Code (2 menit)

```bash
git add .
git commit -m "feat: multiple daily mood check-ins"
git push
```

Tunggu Vercel deploy (2-3 menit).

### ✅ Step 3: Test (3 menit)

1. Buka production site
2. Login
3. **Lihat FAB** (floating button 😊) di bottom-right
4. Klik FAB → Modal opens
5. Pilih mood → Set score → Done
6. Navigate ke `/checkin` page
7. Lihat summary & timeline

---

## ✨ What's New

### Floating Action Button (FAB)
- Muncul di semua pages
- Bottom-right corner
- Pulse animation
- Quick access untuk check-in

### Quick Check-in Modal
- 3-step flow (5-10 detik):
  1. Select mood emoji
  2. Rate intensity (1-10)
  3. Optional: Add note & triggers

### Check-in Page (`/checkin`)
- Daily summary widget
- Timeline view
- All check-ins hari ini
- Insights & patterns

### Features
- ✅ Multiple check-ins per day
- ✅ Auto-calculated daily average
- ✅ Best/worst time tracking
- ✅ Mood volatility indicator
- ✅ Mood distribution chart
- ✅ Context tracking (location/activity)
- ✅ Trigger analysis

---

## 🎯 User Flow

```
Morning (07:30):
Click FAB → 😊 Senang (8/10) → "Good morning!" → Done

Afternoon (15:00):
Click FAB → 😓 Capek (5/10) → [Kerja, Kelelahan] → Done

Evening (21:00):
Click FAB → 😊 Senang (7/10) → "Relaxing now" → Done

Then visit /checkin page:
- Average: 6.7/10
- 3 check-ins today
- Best: 07:30 (8/10)
- Worst: 15:00 (5/10)
- Pattern: Mid-day slump 📉
```

---

## 🧪 Quick Test

### Test 1: FAB Visibility
```
✓ FAB visible at bottom-right
✓ Pulse animation works
✓ Click opens modal
```

### Test 2: Check-in Flow
```
✓ Can select mood
✓ Slider moves
✓ Can add note
✓ Can select triggers
✓ Submit works
✓ Success message
```

### Test 3: Data Display
```
✓ Check-in appears in timeline
✓ Summary calculates correctly
✓ Best/worst times show
✓ Mood distribution accurate
```

---

## 🐛 Quick Fixes

### FAB not showing?
```bash
# Hard refresh
Ctrl + Shift + R

# Check console
F12 → Console tab → Look for errors
```

### Check-in not saving?
```sql
-- In Supabase SQL Editor
-- Test insert
INSERT INTO mood_checkins (user_id, date, time, mood, score)
VALUES (auth.uid(), CURRENT_DATE, CURRENT_TIME, 'senang', 8);

-- Check created
SELECT * FROM mood_checkins 
WHERE user_id = auth.uid() 
ORDER BY timestamp DESC LIMIT 1;
```

### Summary not updating?
```sql
-- Manually trigger
SELECT calculate_daily_mood_summary(auth.uid(), CURRENT_DATE);

-- Check result
SELECT * FROM mood_daily_summaries
WHERE user_id = auth.uid() AND date = CURRENT_DATE;
```

---

## 📊 Database Schema

### mood_checkins
```sql
- id: UUID
- user_id: UUID (FK to profiles)
- date: DATE
- time: TIME
- mood: TEXT (senang/biasa/capek/cemas/sedih/marah/kosong)
- score: INTEGER (1-10)
- triggers: TEXT[]
- note: TEXT
- location_context: TEXT (home/work/outside/commute)
- activity_context: TEXT (working/relaxing/socializing/exercising)
```

### mood_daily_summaries
```sql
- id: UUID
- user_id: UUID (FK to profiles)
- date: DATE
- total_checkins: INTEGER
- average_score: DECIMAL
- dominant_mood: TEXT
- mood_distribution: JSONB
- best_time: TIME
- worst_time: TIME
- mood_volatility: DECIMAL
```

**Auto-Updates**: Trigger otomatis calculate summary setiap ada check-in! ✨

---

## 📁 Files Created

### Components
1. `src/components/ui/QuickCheckinFAB.tsx`
2. `src/components/ui/CheckinModal.tsx`
3. `src/components/ui/DailySummary.tsx`
4. `src/components/ui/CheckinCard.tsx`
5. `src/components/ui/CheckinTimeline.tsx`

### Pages
6. `src/app/checkin/page.tsx`

### Services
7. `src/lib/checkin-service.ts`

### Database
8. `supabase/migrations/003_mood_checkins_system.sql`

### Docs
9. `MOOD_CHECKIN_CONCEPT.md`
10. `CHECKIN_IMPLEMENTATION_GUIDE.md`
11. `CHECKIN_SUMMARY.md`
12. `CHECKIN_DEPLOYMENT.md`
13. `CHECKIN_QUICKSTART.md` (this file)

---

## 🎉 Success!

Kalau semua step berhasil, kamu sekarang punya:

- ✅ FAB yang accessible dari semua pages
- ✅ Quick check-in flow (5-10 detik)
- ✅ Daily summary dengan insights
- ✅ Timeline view semua check-ins
- ✅ Auto-calculated analytics
- ✅ Pattern recognition
- ✅ Best/worst time tracking

**Next**: Coba check-in beberapa kali hari ini dan lihat summary-nya! :)

---

Need help? Check:
- `CHECKIN_DEPLOYMENT.md` - Full deployment guide
- `CHECKIN_SUMMARY.md` - Feature overview
- `MOOD_CHECKIN_CONCEPT.md` - Complete design doc

{'<3'}
