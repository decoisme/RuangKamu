import { getMoodCheckins, getWeeklySummaries } from './checkin-service';
import type { MoodType, TriggerType } from './types';
import type { MoodCheckin, MoodDailySummary } from './checkin-service';
import { format, subDays, startOfWeek, endOfWeek, parseISO } from 'date-fns';

// ===== COMBINED ANALYTICS =====

export interface AnalyticsData {
  // New check-ins system
  checkins: MoodCheckin[];
  dailySummaries: MoodDailySummary[];
  
  // Stats
  totalCheckins: number;
  averageScore: number;
  averageCheckinsPerDay: number;
  
  // Time-based data
  weeklyData: Array<{
    day: string;
    score: number;
    mood: MoodType;
    date: string;
    checkins: number;
  }>;
  
  monthlyData: Array<{
    week: string;
    avgScore: number;
    entries: number;
  }>;
  
  // Distribution
  moodDistribution: Array<{
    name: string;
    value: number;
    color: string;
    emoji: string;
  }>;
  
  triggerDistribution: Array<{
    name: string;
    value: number;
    type: TriggerType;
  }>;
  
  // Patterns
  bestTimeOfDay?: string;
  worstTimeOfDay?: string;
  mostVolatileDay?: string;
  mostStableDay?: string;
  
  // Insights
  insights: Array<{
    type: 'info' | 'warning' | 'positive' | 'suggestion';
    title: string;
    description: string;
    icon: string;
  }>;
}

const MOOD_LABELS: Record<MoodType, { label: string; emoji: string; color: string }> = {
  senang: { label: 'Happy', emoji: '😊', color: '#10b981' },
  biasa: { label: 'Okay', emoji: '😐', color: '#6b7280' },
  capek: { label: 'Tired', emoji: '😓', color: '#f59e0b' },
  cemas: { label: 'Anxious', emoji: '😰', color: '#ef4444' },
  sedih: { label: 'Sad', emoji: '😢', color: '#3b82f6' },
  marah: { label: 'Angry', emoji: '😠', color: '#dc2626' },
  kosong: { label: 'Empty', emoji: '😶', color: '#9ca3af' },
};

const TRIGGER_LABELS: Record<TriggerType, string> = {
  work: 'Kerja',
  family: 'Keluarga',
  relationship: 'Hubungan',
  health: 'Kesehatan',
  money: 'Keuangan',
  friends: 'Teman',
  college: 'Kuliah',
  future: 'Masa Depan',
  unknown: 'Lainnya',
};

export async function getAnalyticsData(): Promise<AnalyticsData> {
  // Fetch all checkins only
  const checkins = await getMoodCheckins();
  
  // Get weekly summaries for last 4 weeks
  const fourWeeksAgo = format(subDays(new Date(), 28), 'yyyy-MM-dd');
  const dailySummaries = await getWeeklySummaries(fourWeeksAgo);
  
  // Stats
  const totalCheckins = checkins.length;
  const averageScore = totalCheckins > 0
    ? Number((checkins.reduce((sum, c) => sum + c.score, 0) / totalCheckins).toFixed(1))
    : 0;
  
  // Average check-ins per day
  const uniqueDays = new Set(checkins.map(c => c.date)).size;
  const averageCheckinsPerDay = uniqueDays > 0 ? Number((totalCheckins / uniqueDays).toFixed(1)) : 0;
  
  // Weekly data (last 7 days) — from checkins only
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayCheckins = checkins.filter(c => c.date === dateStr);
    const summary = dailySummaries.find(s => s.date === dateStr);
    const score = summary
      ? summary.averageScore
      : dayCheckins.length > 0
        ? dayCheckins.reduce((sum, c) => sum + c.score, 0) / dayCheckins.length
        : 0;
    const mood = summary?.dominantMood || dayCheckins[0]?.mood || 'biasa';
    weeklyData.push({
      day: format(d, 'EEE'),
      score: Number(score.toFixed(1)),
      mood,
      date: format(d, 'MMM d'),
      checkins: dayCheckins.length,
    });
  }
  
  // Monthly data (last 4 weeks)
  const monthlyData = [];
  for (let i = 3; i >= 0; i--) {
    const ws = startOfWeek(subDays(new Date(), i * 7));
    const we = endOfWeek(subDays(new Date(), i * 7));
    
    const weekSummaries = dailySummaries.filter(s => {
      const d = parseISO(s.date);
      return d >= ws && d <= we;
    });
    
    const avgScore = weekSummaries.length > 0
      ? weekSummaries.reduce((sum, s) => sum + s.averageScore, 0) / weekSummaries.length
      : 0;
    
    const totalEntries = weekSummaries.reduce((sum, s) => sum + s.totalCheckins, 0);
    
    monthlyData.push({
      week: `${format(ws, 'MMM d')}–${format(we, 'd')}`,
      avgScore: Number(avgScore.toFixed(1)),
      entries: totalEntries,
    });
  }
  
  // Mood distribution (from checkins only)
  const moodCounts: Record<string, number> = {};
  checkins.forEach(c => { moodCounts[c.mood] = (moodCounts[c.mood] || 0) + 1; });
  
  const moodDistribution = Object.entries(MOOD_LABELS)
    .map(([mood, info]) => ({
      name: info.label,
      value: moodCounts[mood] || 0,
      color: info.color,
      emoji: info.emoji,
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);
  
  // Trigger distribution (from checkins only)
  const triggerCounts: Record<string, number> = {};
  checkins.forEach(c => {
    c.triggers.forEach(t => { triggerCounts[t] = (triggerCounts[t] || 0) + 1; });
  });
  
  const triggerDistribution = Object.entries(TRIGGER_LABELS)
    .map(([trigger, label]) => ({
      name: label,
      value: triggerCounts[trigger] || 0,
      type: trigger as TriggerType,
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);
  
  // Time-of-day patterns
  const timePattern = analyzeTimePatterns(checkins);
  
  // Day volatility patterns
  const volatilityPattern = analyzeDayVolatility(dailySummaries);
  
  // Generate insights
  const insights = generateInsights({
    averageScore,
    totalCheckins,
    averageCheckinsPerDay,
    recentCheckins: checkins.slice(0, 21), // Last 3 weeks
    moodDistribution,
    triggerDistribution,
    timePattern,
    volatilityPattern,
    dailySummaries,
  });
  
  return {
    checkins,
    dailySummaries,
    totalCheckins,
    averageScore,
    averageCheckinsPerDay,
    weeklyData,
    monthlyData,
    moodDistribution,
    triggerDistribution,
    bestTimeOfDay: timePattern.bestTime,
    worstTimeOfDay: timePattern.worstTime,
    mostVolatileDay: volatilityPattern.mostVolatile,
    mostStableDay: volatilityPattern.mostStable,
    insights,
  };
}

// ===== HELPER FUNCTIONS =====

function analyzeTimePatterns(checkins: MoodCheckin[]) {
  const timeScores: Record<string, { total: number; count: number }> = {};
  
  checkins.forEach(c => {
    const hour = parseInt(c.time.substring(0, 2));
    const period = hour >= 5 && hour < 12 ? 'morning'
                 : hour >= 12 && hour < 17 ? 'afternoon'
                 : hour >= 17 && hour < 21 ? 'evening'
                 : 'night';
    
    if (!timeScores[period]) {
      timeScores[period] = { total: 0, count: 0 };
    }
    timeScores[period].total += c.score;
    timeScores[period].count += 1;
  });
  
  const averages = Object.entries(timeScores).map(([period, data]) => ({
    period,
    average: data.total / data.count,
  }));
  
  averages.sort((a, b) => b.average - a.average);
  
  return {
    bestTime: averages[0]?.period,
    worstTime: averages[averages.length - 1]?.period,
  };
}

function analyzeDayVolatility(summaries: MoodDailySummary[]) {
  if (summaries.length === 0) return { mostVolatile: undefined, mostStable: undefined };
  
  const sorted = [...summaries].sort((a, b) => 
    (b.moodVolatility || 0) - (a.moodVolatility || 0)
  );
  
  return {
    mostVolatile: sorted[0]?.date,
    mostStable: sorted[sorted.length - 1]?.date,
  };
}

function generateInsights(data: {
  averageScore: number;
  totalCheckins: number;
  averageCheckinsPerDay: number;
  recentCheckins: MoodCheckin[];
  moodDistribution: any[];
  triggerDistribution: any[];
  timePattern: any;
  volatilityPattern: any;
  dailySummaries: MoodDailySummary[];
}): Array<{ type: 'info' | 'warning' | 'positive' | 'suggestion'; title: string; description: string; icon: string }> {
  const insights = [];
  
  // Average score insight
  if (data.averageScore >= 7) {
    insights.push({
      type: 'positive' as const,
      title: "You're Thriving!",
      description: `Your average mood is ${data.averageScore}/10. You're experiencing consistent positive energy. Keep nurturing what makes you feel good! 🌟`,
      icon: 'Sun',
    });
  } else if (data.averageScore <= 4) {
    insights.push({
      type: 'warning' as const,
      title: 'Challenging Period',
      description: `Your average score is ${data.averageScore}/10. Remember, it's okay to not be okay. Consider reaching out to someone you trust or trying our breathing exercises.`,
      icon: 'Heart',
    });
  } else {
    insights.push({
      type: 'info' as const,
      title: 'Steady Journey',
      description: `Your average mood is ${data.averageScore}/10. You're navigating life with balance. Keep tracking to understand your patterns better.`,
      icon: 'Compass',
    });
  }
  
  // Check-in frequency insight
  if (data.averageCheckinsPerDay >= 3) {
    insights.push({
      type: 'positive' as const,
      title: 'Excellent Tracking!',
      description: `You're checking in ${data.averageCheckinsPerDay}× per day on average. This detailed tracking helps identify patterns and triggers effectively.`,
      icon: 'Target',
    });
  } else if (data.totalCheckins >= 10 && data.averageCheckinsPerDay < 2) {
    insights.push({
      type: 'suggestion' as const,
      title: 'Track More Often',
      description: `Try checking in 3-5 times daily to better understand mood fluctuations throughout the day. Morning, afternoon, and evening check-ins reveal valuable patterns.`,
      icon: 'Clock',
    });
  }
  
  // Time pattern insight
  if (data.timePattern.bestTime && data.timePattern.worstTime) {
    const timeLabels: Record<string, string> = {
      morning: 'mornings',
      afternoon: 'afternoons',
      evening: 'evenings',
      night: 'nights',
    };
    
    insights.push({
      type: 'info' as const,
      title: 'Time-of-Day Pattern',
      description: `You tend to feel best during ${timeLabels[data.timePattern.bestTime]} and more challenged during ${timeLabels[data.timePattern.worstTime]}. Consider scheduling important activities during your peak times.`,
      icon: 'Sun',
    });
  }
  
  // Mood volatility insight
  const highVolatilityDays = data.dailySummaries.filter(s => (s.moodVolatility || 0) > 2);
  if (highVolatilityDays.length >= 3) {
    insights.push({
      type: 'suggestion' as const,
      title: 'Mood Fluctuations Detected',
      description: `You've had ${highVolatilityDays.length} days with significant mood changes. Consider journaling to identify what triggers these shifts.`,
      icon: 'Activity',
    });
  }
  
  // Trigger insight
  if (data.triggerDistribution.length > 0) {
    const topTrigger = data.triggerDistribution[0];
    insights.push({
      type: 'info' as const,
      title: `"${topTrigger.name}" is a Key Theme`,
      description: `This appears most frequently in your entries (${topTrigger.value}×). Awareness is the first step to understanding and managing your emotional patterns.`,
      icon: 'Tag',
    });
  }
  
  // Recent positive trend
  const recentWeek = data.recentCheckins.slice(0, 7);
  const happyCount = recentWeek.filter(c => c.mood === 'senang').length;
  if (happyCount >= 4) {
    insights.push({
      type: 'positive' as const,
      title: 'Positive Momentum!',
      description: `You've had ${happyCount} happy check-ins recently. What's been going well? Take a moment to appreciate your progress 💚`,
      icon: 'Sparkles',
    });
  }
  
  // Consistency insight
  const uniqueDays = new Set(data.recentCheckins.map(c => c.date)).size;
  if (uniqueDays >= 7) {
    insights.push({
      type: 'positive' as const,
      title: 'Building Healthy Habits',
      description: `You've tracked your mood for ${uniqueDays} days recently. Consistency like this leads to valuable self-awareness and growth.`,
      icon: 'Zap',
    });
  }
  
  return insights;
}
