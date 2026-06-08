import { supabase, isSupabaseConfigured } from './supabase';
import type { MoodType, TriggerType } from './types';

// ===== TYPES =====

export type LocationContext = 'home' | 'work' | 'outside' | 'commute';
export type ActivityContext = 'working' | 'relaxing' | 'socializing' | 'exercising' | 'studying' | 'sleeping';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface MoodCheckin {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timestamp: string;
  
  mood: MoodType;
  score: number;
  
  triggers: TriggerType[];
  note?: string;
  locationContext?: LocationContext;
  activityContext?: ActivityContext;
  
  createdAt: string;
  
  // Computed fields
  timeFormatted?: string;
  datetimeFormatted?: string;
  timeOfDay?: TimeOfDay;
}

export interface MoodDailySummary {
  id: string;
  userId: string;
  date: string;
  
  totalCheckins: number;
  averageScore: number;
  dominantMood: MoodType;
  
  moodDistribution: Record<string, number>;
  
  bestTime?: string;
  bestScore?: number;
  worstTime?: string;
  worstScore?: number;
  moodVolatility?: number;
  
  createdAt: string;
  updatedAt: string;
}

// ===== FALLBACK TO LOCALSTORAGE =====

const USE_SUPABASE = isSupabaseConfigured();

function getLocalStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setLocalStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ===== MOOD CHECK-INS =====

export async function getMoodCheckins(
  date?: string, // YYYY-MM-DD, if not provided returns all recent
  userId?: string
): Promise<MoodCheckin[]> {
  if (!USE_SUPABASE) {
    // Fallback to localStorage
    const checkins = getLocalStorage<MoodCheckin>('ruangkamu_checkins');
    if (date) {
      return checkins.filter(c => c.date === date);
    }
    return checkins;
  }

  // Get current user if not provided
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    profileId = user.id;
  }

  let query = supabase
    .from('mood_checkins')
    .select('*')
    .eq('user_id', profileId);

  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query.order('time', { ascending: true });

  if (error) {
    console.error('Error fetching mood check-ins:', error);
    return [];
  }

  return data.map(entry => ({
    id: entry.id,
    userId: entry.user_id,
    date: entry.date,
    time: entry.time,
    timestamp: entry.timestamp,
    mood: entry.mood as MoodType,
    score: entry.score,
    triggers: entry.triggers as TriggerType[],
    note: entry.note || undefined,
    locationContext: entry.location_context || undefined,
    activityContext: entry.activity_context || undefined,
    createdAt: entry.created_at,
  }));
}

export async function getTodayCheckins(userId?: string): Promise<MoodCheckin[]> {
  const today = new Date().toISOString().split('T')[0];
  return getMoodCheckins(today, userId);
}

export async function saveMoodCheckin(
  checkin: Omit<MoodCheckin, 'id' | 'userId' | 'createdAt'>,
  userId?: string
): Promise<MoodCheckin | null> {
  if (!USE_SUPABASE) {
    // Fallback to localStorage
    const checkins = getLocalStorage<MoodCheckin>('ruangkamu_checkins');
    const newCheckin: MoodCheckin = {
      ...checkin,
      id: `checkin_${Date.now()}`,
      userId: 'local',
      createdAt: new Date().toISOString(),
    };
    checkins.unshift(newCheckin);
    setLocalStorage('ruangkamu_checkins', checkins);
    return newCheckin;
  }

  // Get current user if not provided
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    profileId = user.id;
  }

  const { data, error } = await supabase
    .from('mood_checkins')
    .insert({
      user_id: profileId,
      date: checkin.date,
      time: checkin.time,
      timestamp: checkin.timestamp,
      mood: checkin.mood,
      score: checkin.score,
      triggers: checkin.triggers,
      note: checkin.note || null,
      location_context: checkin.locationContext || null,
      activity_context: checkin.activityContext || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving mood check-in:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    time: data.time,
    timestamp: data.timestamp,
    mood: data.mood as MoodType,
    score: data.score,
    triggers: data.triggers as TriggerType[],
    note: data.note || undefined,
    locationContext: data.location_context || undefined,
    activityContext: data.activity_context || undefined,
    createdAt: data.created_at,
  };
}

export async function updateMoodCheckin(
  id: string,
  updates: Partial<Omit<MoodCheckin, 'id' | 'userId' | 'createdAt'>>
): Promise<MoodCheckin | null> {
  if (!USE_SUPABASE) {
    const checkins = getLocalStorage<MoodCheckin>('ruangkamu_checkins');
    const index = checkins.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    checkins[index] = { ...checkins[index], ...updates };
    setLocalStorage('ruangkamu_checkins', checkins);
    return checkins[index];
  }

  const { data, error } = await supabase
    .from('mood_checkins')
    .update({
      mood: updates.mood,
      score: updates.score,
      triggers: updates.triggers,
      note: updates.note || null,
      location_context: updates.locationContext || null,
      activity_context: updates.activityContext || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating mood check-in:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    time: data.time,
    timestamp: data.timestamp,
    mood: data.mood as MoodType,
    score: data.score,
    triggers: data.triggers as TriggerType[],
    note: data.note || undefined,
    locationContext: data.location_context || undefined,
    activityContext: data.activity_context || undefined,
    createdAt: data.created_at,
  };
}

export async function deleteMoodCheckin(id: string): Promise<boolean> {
  if (!USE_SUPABASE) {
    const checkins = getLocalStorage<MoodCheckin>('ruangkamu_checkins');
    const filtered = checkins.filter(c => c.id !== id);
    setLocalStorage('ruangkamu_checkins', filtered);
    return true;
  }

  const { error } = await supabase
    .from('mood_checkins')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting mood check-in:', error);
    return false;
  }

  return true;
}

// ===== DAILY SUMMARIES =====

export async function getDailySummary(
  date: string, // YYYY-MM-DD
  userId?: string
): Promise<MoodDailySummary | null> {
  if (!USE_SUPABASE) {
    // Calculate from localStorage checkins
    const checkins = getLocalStorage<MoodCheckin>('ruangkamu_checkins')
      .filter(c => c.date === date);
    
    if (checkins.length === 0) return null;
    
    return calculateSummaryFromCheckins(checkins, date);
  }

  // Get current user if not provided
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    profileId = user.id;
  }

  const { data, error } = await supabase
    .from('mood_daily_summaries')
    .select('*')
    .eq('user_id', profileId)
    .eq('date', date)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching daily summary:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    totalCheckins: data.total_checkins,
    averageScore: parseFloat(data.average_score),
    dominantMood: data.dominant_mood as MoodType,
    moodDistribution: data.mood_distribution || {},
    bestTime: data.best_time || undefined,
    bestScore: data.best_score || undefined,
    worstTime: data.worst_time || undefined,
    worstScore: data.worst_score || undefined,
    moodVolatility: data.mood_volatility ? parseFloat(data.mood_volatility) : undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getTodaySummary(userId?: string): Promise<MoodDailySummary | null> {
  const today = new Date().toISOString().split('T')[0];
  return getDailySummary(today, userId);
}

export async function getWeeklySummaries(
  startDate: string,
  userId?: string
): Promise<MoodDailySummary[]> {
  if (!USE_SUPABASE) {
    return []; // TODO: Implement localStorage version
  }

  // Get current user if not provided
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    profileId = user.id;
  }

  const { data, error } = await supabase
    .from('mood_daily_summaries')
    .select('*')
    .eq('user_id', profileId)
    .gte('date', startDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching weekly summaries:', error);
    return [];
  }

  return data.map(summary => ({
    id: summary.id,
    userId: summary.user_id,
    date: summary.date,
    totalCheckins: summary.total_checkins,
    averageScore: parseFloat(summary.average_score),
    dominantMood: summary.dominant_mood as MoodType,
    moodDistribution: summary.mood_distribution || {},
    bestTime: summary.best_time || undefined,
    bestScore: summary.best_score || undefined,
    worstTime: summary.worst_time || undefined,
    worstScore: summary.worst_score || undefined,
    moodVolatility: summary.mood_volatility ? parseFloat(summary.mood_volatility) : undefined,
    createdAt: summary.created_at,
    updatedAt: summary.updated_at,
  }));
}

// ===== HELPER FUNCTIONS =====

function calculateSummaryFromCheckins(
  checkins: MoodCheckin[],
  date: string
): MoodDailySummary {
  const totalCheckins = checkins.length;
  const averageScore = checkins.reduce((sum, c) => sum + c.score, 0) / totalCheckins;
  
  // Find dominant mood
  const moodCounts: Record<string, number> = {};
  checkins.forEach(c => {
    moodCounts[c.mood] = (moodCounts[c.mood] || 0) + 1;
  });
  const dominantMood = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])[0][0] as MoodType;
  
  // Find best and worst
  const sortedByScore = [...checkins].sort((a, b) => b.score - a.score);
  const best = sortedByScore[0];
  const worst = sortedByScore[sortedByScore.length - 1];
  
  return {
    id: `summary_${date}`,
    userId: 'local',
    date,
    totalCheckins,
    averageScore: Math.round(averageScore * 10) / 10,
    dominantMood,
    moodDistribution: moodCounts,
    bestTime: best.time,
    bestScore: best.score,
    worstTime: worst.score !== best.score ? worst.time : undefined,
    worstScore: worst.score !== best.score ? worst.score : undefined,
    moodVolatility: calculateVolatility(checkins.map(c => c.score)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function calculateVolatility(scores: number[]): number {
  if (scores.length < 2) return 0;
  
  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / scores.length;
  
  return Math.round(Math.sqrt(variance) * 100) / 100;
}

// Export singleton status
export { USE_SUPABASE };
