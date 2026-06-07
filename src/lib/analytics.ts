import { format, subDays, startOfWeek, endOfWeek, subWeeks, parseISO } from 'date-fns';
import type {
  MoodType,
  TriggerType,
  MoodFrequency,
  TriggerFrequency,
  WeeklyMoodData,
  MonthlyMoodData,
  MoodInsight,
} from './types';
import { MOOD_LIST, TRIGGER_LIST } from './types';
import { getMoodEntries, getMoodEntriesByDateRange } from './store';
import { getToday, getDayOfWeek } from './utils';

// ===== MOOD SCORE MAPPING =====

const MOOD_SCORE_MAP: Record<MoodType, number> = {
  senang: 9,
  biasa: 7,
  capek: 5,
  cemas: 4,
  sedih: 3,
  marah: 2,
  kosong: 1,
};

// ===== FREQUENCY ANALYSIS =====

/**
 * Returns the count and percentage of each mood type across all entries.
 */
export function getMoodFrequencies(): MoodFrequency[] {
  const entries = getMoodEntries();
  const total = entries.length;
  if (total === 0) return [];

  const countMap = new Map<MoodType, number>();
  for (const entry of entries) {
    countMap.set(entry.mood, (countMap.get(entry.mood) ?? 0) + 1);
  }

  return MOOD_LIST.map((m) => ({
    mood: m.type,
    count: countMap.get(m.type) ?? 0,
    percentage: total > 0 ? Math.round(((countMap.get(m.type) ?? 0) / total) * 100) : 0,
  }))
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count);
}

/**
 * Returns the count and percentage of each trigger type across all entries.
 */
export function getTriggerFrequencies(): TriggerFrequency[] {
  const entries = getMoodEntries();
  const triggerCounts = new Map<TriggerType, number>();
  let totalTriggers = 0;

  for (const entry of entries) {
    for (const trigger of entry.triggers) {
      triggerCounts.set(trigger, (triggerCounts.get(trigger) ?? 0) + 1);
      totalTriggers++;
    }
  }

  if (totalTriggers === 0) return [];

  return TRIGGER_LIST.map((t) => ({
    trigger: t.type,
    count: triggerCounts.get(t.type) ?? 0,
    percentage: totalTriggers > 0
      ? Math.round(((triggerCounts.get(t.type) ?? 0) / totalTriggers) * 100)
      : 0,
  }))
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count);
}

// ===== WEEKLY & MONTHLY DATA =====

/**
 * Returns mood data for the last 7 days.
 */
export function getWeeklyMoodData(): WeeklyMoodData[] {
  const today = new Date();
  const result: WeeklyMoodData[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLabel = format(date, 'EEE');
    const entries = getMoodEntriesByDateRange(dateStr, dateStr);

    if (entries.length > 0) {
      const entry = entries[0];
      result.push({
        day: dayLabel,
        score: entry.score,
        mood: entry.mood,
        date: dateStr,
      });
    } else {
      result.push({
        day: dayLabel,
        score: 0,
        mood: 'kosong' as MoodType,
        date: dateStr,
      });
    }
  }

  return result;
}

/**
 * Returns averaged mood data for the last 4 weeks.
 */
export function getMonthlyMoodData(): MonthlyMoodData[] {
  const today = new Date();
  const result: MonthlyMoodData[] = [];

  for (let i = 3; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const startStr = format(weekStart, 'yyyy-MM-dd');
    const endStr = format(weekEnd, 'yyyy-MM-dd');
    const entries = getMoodEntriesByDateRange(startStr, endStr);

    const avgScore =
      entries.length > 0
        ? Math.round((entries.reduce((sum, e) => sum + e.score, 0) / entries.length) * 10) / 10
        : 0;

    const weekLabel = `Week ${format(weekStart, 'MMM d')}`;

    result.push({
      week: weekLabel,
      avgScore,
      entries: entries.length,
    });
  }

  return result;
}

// ===== AGGREGATED STATS =====

/**
 * Returns the most frequently logged mood, or null if no data.
 */
export function getMostFrequentMood(): { mood: MoodType; count: number } | null {
  const frequencies = getMoodFrequencies();
  if (frequencies.length === 0) return null;
  return { mood: frequencies[0].mood, count: frequencies[0].count };
}

/**
 * Returns the most frequently logged trigger, or null if no data.
 */
export function getDominantTrigger(): { trigger: TriggerType; count: number } | null {
  const frequencies = getTriggerFrequencies();
  if (frequencies.length === 0) return null;
  return { trigger: frequencies[0].trigger, count: frequencies[0].count };
}

/**
 * Returns the average mood score across all entries (0 if no data).
 */
export function getAverageMoodScore(): number {
  const entries = getMoodEntries();
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, e) => sum + e.score, 0);
  return Math.round((total / entries.length) * 10) / 10;
}

/**
 * Returns a list of dates (YYYY-MM-DD) where the mood score was below 4.
 */
export function getDropDays(): string[] {
  const entries = getMoodEntries();
  return entries.filter((e) => e.score < 4).map((e) => e.date);
}

/**
 * Analyzes the last 7 days of mood data to determine the overall trend.
 */
export function getMoodTrend(): 'improving' | 'declining' | 'stable' {
  const weeklyData = getWeeklyMoodData();
  const scored = weeklyData.filter((d) => d.score > 0);

  if (scored.length < 3) return 'stable';

  // Compare first half average to second half average
  const midpoint = Math.floor(scored.length / 2);
  const firstHalf = scored.slice(0, midpoint);
  const secondHalf = scored.slice(midpoint);

  const firstAvg = firstHalf.reduce((s, d) => s + d.score, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((s, d) => s + d.score, 0) / secondHalf.length;
  const diff = secondAvg - firstAvg;

  if (diff > 1) return 'improving';
  if (diff < -1) return 'declining';
  return 'stable';
}

// ===== INSIGHT GENERATION =====

/**
 * Generates 3-5 data-driven insights based on mood patterns.
 */
export function generateInsights(): MoodInsight[] {
  const entries = getMoodEntries();
  if (entries.length === 0) {
    return [
      {
        type: 'info',
        title: 'Start Tracking',
        description: 'Log your first mood entry to start seeing insights about your emotional patterns.',
        icon: 'Sparkles',
      },
    ];
  }

  const insights: MoodInsight[] = [];
  const trend = getMoodTrend();
  const mostFrequent = getMostFrequentMood();
  const dominantTrigger = getDominantTrigger();
  const avgScore = getAverageMoodScore();
  const dropDays = getDropDays();
  const triggerFreqs = getTriggerFrequencies();

  // 1. Mood trend insight
  if (trend === 'improving') {
    insights.push({
      type: 'positive',
      title: 'Upward Trend',
      description: 'Your mood has been improving over the past week! Keep up whatever you\'re doing.',
      icon: 'TrendingUp',
    });
  } else if (trend === 'declining') {
    insights.push({
      type: 'warning',
      title: 'Dipping Mood',
      description: 'Your mood has been lower than usual this week. Be extra gentle with yourself.',
      icon: 'TrendingDown',
    });
  } else {
    insights.push({
      type: 'info',
      title: 'Steady State',
      description: 'Your mood has been relatively stable this week. Consistency can be a good thing.',
      icon: 'Minus',
    });
  }

  // 2. Most frequent mood insight
  if (mostFrequent) {
    const moodInfo = MOOD_LIST.find((m) => m.type === mostFrequent.mood);
    const moodLabel = moodInfo?.label ?? mostFrequent.mood;
    insights.push({
      type: mostFrequent.mood === 'senang' || mostFrequent.mood === 'biasa' ? 'positive' : 'info',
      title: 'Your Most Common Mood',
      description: `You've felt "${moodLabel}" the most — ${mostFrequent.count} time${mostFrequent.count > 1 ? 's' : ''} so far. That's ${Math.round((mostFrequent.count / entries.length) * 100)}% of your entries.`,
      icon: 'BarChart3',
    });
  }

  // 3. Dominant trigger insight
  if (dominantTrigger) {
    const triggerInfo = TRIGGER_LIST.find((t) => t.type === dominantTrigger.trigger);
    const triggerLabel = triggerInfo?.label ?? dominantTrigger.trigger;
    insights.push({
      type: 'info',
      title: 'Top Trigger',
      description: `Your most frequent trigger this month was ${triggerLabel.toLowerCase()}. It appeared in ${dominantTrigger.count} of your entries.`,
      icon: 'Target',
    });
  }

  // 4. Drop days / low mood pattern
  if (dropDays.length > 0) {
    // Check if specific days of the week are common
    const dayNames = dropDays.map((d) => getDayOfWeek(d));
    const dayCounts = new Map<string, number>();
    for (const day of dayNames) {
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    }
    const sortedDays = Array.from(dayCounts.entries()).sort((a, b) => b[1] - a[1]);
    if (sortedDays.length > 0 && sortedDays[0][1] >= 2) {
      insights.push({
        type: 'suggestion',
        title: 'Pattern Detected',
        description: `You tend to feel lower on ${sortedDays[0][0]}s. Maybe plan something comforting for those days.`,
        icon: 'CalendarDays',
      });
    } else {
      insights.push({
        type: 'warning',
        title: 'Tough Days',
        description: `You've had ${dropDays.length} day${dropDays.length > 1 ? 's' : ''} where your mood dipped below 4. Remember, rough patches are temporary.`,
        icon: 'CloudRain',
      });
    }
  }

  // 5. Check-in consistency (weekday vs weekend)
  const weekdayEntries = entries.filter((e) => {
    const day = parseISO(e.date).getDay();
    return day >= 1 && day <= 5;
  });
  const weekendEntries = entries.filter((e) => {
    const day = parseISO(e.date).getDay();
    return day === 0 || day === 6;
  });

  if (entries.length >= 5) {
    if (weekdayEntries.length > weekendEntries.length * 2) {
      insights.push({
        type: 'info',
        title: 'Weekday Tracker',
        description: 'You check in most consistently on weekdays. Try to log on weekends too — your rest days matter.',
        icon: 'Calendar',
      });
    } else if (weekendEntries.length > weekdayEntries.length) {
      insights.push({
        type: 'info',
        title: 'Weekend Reflector',
        description: 'You tend to journal more on weekends. That\'s great self-reflection time!',
        icon: 'Coffee',
      });
    }
  }

  // 6. Multiple triggers pattern
  if (triggerFreqs.length >= 3) {
    const topThree = triggerFreqs.slice(0, 3).map((t) => {
      const info = TRIGGER_LIST.find((tl) => tl.type === t.trigger);
      return info?.label ?? t.trigger;
    });
    insights.push({
      type: 'suggestion',
      title: 'Multiple Stressors',
      description: `Your top 3 triggers are ${topThree[0]}, ${topThree[1]}, and ${topThree[2]}. Consider which one you can address first.`,
      icon: 'Layers',
    });
  }

  // 7. Average mood context
  if (avgScore > 0 && insights.length < 6) {
    if (avgScore >= 7) {
      insights.push({
        type: 'positive',
        title: 'Above Average',
        description: `Your average mood score is ${avgScore}/10 — you're doing better than you might think!`,
        icon: 'Star',
      });
    } else if (avgScore <= 4) {
      insights.push({
        type: 'suggestion',
        title: 'Reaching Out',
        description: `Your average mood score is ${avgScore}/10. If things feel heavy, talking to someone you trust can help.`,
        icon: 'Heart',
      });
    }
  }

  // Cap at 5 insights
  return insights.slice(0, 5);
}
