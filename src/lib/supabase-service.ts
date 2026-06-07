import { supabase, isSupabaseConfigured } from './supabase';
import type { 
  MoodEntry, 
  JournalEntry, 
  UserProfile, 
  VaultEntry,
  MoodType,
  TriggerType 
} from './types';

// ===== FALLBACK TO LOCALSTORAGE =====
const USE_SUPABASE = isSupabaseConfigured();

// Default user ID for demo (single user mode)
const DEFAULT_USER_ID = 'demo-user-001';

// ===== HELPER FUNCTIONS =====

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

// ===== MOOD ENTRIES =====

export async function getMoodEntries(userId?: string): Promise<MoodEntry[]> {
  if (!USE_SUPABASE) {
    return getLocalStorage<MoodEntry>('ruangkamu_moods');
  }

  // If no userId provided, get from current session
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    profileId = user.id;
  }

  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', profileId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching mood entries:', error);
    return [];
  }

  return data.map(entry => ({
    id: entry.id,
    date: entry.date,
    mood: entry.mood as MoodType,
    score: entry.score,
    triggers: entry.triggers as TriggerType[],
    note: entry.note || '',
    timestamp: entry.timestamp,
    createdAt: entry.created_at,
  }));
}

export async function saveMoodEntry(
  entry: Omit<MoodEntry, 'id' | 'createdAt'>,
  userId?: string
): Promise<MoodEntry | null> {
  if (!USE_SUPABASE) {
    const entries = getLocalStorage<MoodEntry>('ruangkamu_moods');
    const existingIndex = entries.findIndex(e => e.date === entry.date);
    
    const newEntry: MoodEntry = {
      ...entry,
      id: existingIndex >= 0 ? entries[existingIndex].id : `mood_${Date.now()}`,
      createdAt: existingIndex >= 0 ? entries[existingIndex].createdAt : new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      entries[existingIndex] = newEntry;
    } else {
      entries.push(newEntry);
    }

    setLocalStorage('ruangkamu_moods', entries);
    return newEntry;
  }

  // If no userId provided, get from current session
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    profileId = user.id;
  }

  const { data, error } = await supabase
    .from('mood_entries')
    .upsert({
      user_id: profileId,
      date: entry.date,
      mood: entry.mood,
      score: entry.score,
      triggers: entry.triggers,
      note: entry.note,
      timestamp: entry.timestamp,
    }, {
      onConflict: 'user_id,date'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving mood entry:', error);
    return null;
  }

  return {
    id: data.id,
    date: data.date,
    mood: data.mood as MoodType,
    score: data.score,
    triggers: data.triggers as TriggerType[],
    note: data.note || '',
    timestamp: data.timestamp,
    createdAt: data.created_at,
  };
}

export async function deleteMoodEntry(id: string): Promise<boolean> {
  if (!USE_SUPABASE) {
    const entries = getLocalStorage<MoodEntry>('ruangkamu_moods');
    const filtered = entries.filter(e => e.id !== id);
    setLocalStorage('ruangkamu_moods', filtered);
    return true;
  }

  const { error } = await supabase
    .from('mood_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting mood entry:', error);
    return false;
  }

  return true;
}

// ===== JOURNAL ENTRIES =====

export async function getJournalEntries(userId?: string): Promise<JournalEntry[]> {
  if (!USE_SUPABASE) {
    return getLocalStorage<JournalEntry>('ruangkamu_journal');
  }

  // If no userId provided, get from current session
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    profileId = user.id;
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', profileId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }

  return data.map(entry => ({
    id: entry.id,
    date: entry.date,
    content: entry.content,
    prompt: entry.prompt || '',
    isPrivate: entry.is_private,
    aiSummary: entry.ai_summary,
    drawing: entry.drawing,
    drawingAiInterpretation: entry.drawing_ai_interpretation,
    timestamp: entry.timestamp,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
  }));
}

export async function saveJournalEntry(
  entry: Omit<JournalEntry, 'id'>,
  userId?: string
): Promise<JournalEntry | null> {
  if (!USE_SUPABASE) {
    const entries = getLocalStorage<JournalEntry>('ruangkamu_journal');
    const newEntry: JournalEntry = {
      ...entry,
      id: `journal_${Date.now()}`,
    };
    entries.unshift(newEntry);
    setLocalStorage('ruangkamu_journal', entries);
    return newEntry;
  }

  // If no userId provided, get from current session
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    profileId = user.id;
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: profileId,
      date: entry.date,
      content: entry.content,
      prompt: entry.prompt,
      is_private: entry.isPrivate,
      ai_summary: entry.aiSummary,
      drawing: entry.drawing,
      drawing_ai_interpretation: entry.drawingAiInterpretation,
      timestamp: entry.timestamp,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving journal entry:', error);
    return null;
  }

  return {
    id: data.id,
    date: data.date,
    content: data.content,
    prompt: data.prompt || '',
    isPrivate: data.is_private,
    aiSummary: data.ai_summary,
    drawing: data.drawing,
    drawingAiInterpretation: data.drawing_ai_interpretation,
    timestamp: data.timestamp,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function deleteJournalEntry(id: string): Promise<boolean> {
  if (!USE_SUPABASE) {
    const entries = getLocalStorage<JournalEntry>('ruangkamu_journal');
    const filtered = entries.filter(e => e.id !== id);
    setLocalStorage('ruangkamu_journal', filtered);
    return true;
  }

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting journal entry:', error);
    return false;
  }

  return true;
}

// ===== GRATITUDE ENTRIES =====

interface GratitudeEntry {
  id: string;
  items: string[];
  date: string;
  createdAt: string;
}

export async function getGratitudeEntries(userId?: string): Promise<GratitudeEntry[]> {
  if (!USE_SUPABASE) {
    return getLocalStorage<GratitudeEntry>('ruangkamu_gratitude');
  }

  // If no userId provided, get from current session
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    profileId = user.id;
  }

  const { data, error } = await supabase
    .from('gratitude_entries')
    .select('*')
    .eq('user_id', profileId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching gratitude entries:', error);
    return [];
  }

  return data.map(entry => ({
    id: entry.id,
    items: entry.items,
    date: entry.date,
    createdAt: entry.created_at,
  }));
}

export async function saveGratitudeEntry(
  entry: Omit<GratitudeEntry, 'id' | 'createdAt'>,
  userId?: string
): Promise<GratitudeEntry | null> {
  if (!USE_SUPABASE) {
    const entries = getLocalStorage<GratitudeEntry>('ruangkamu_gratitude');
    const existingIndex = entries.findIndex(e => e.date === entry.date);
    
    const newEntry: GratitudeEntry = {
      ...entry,
      id: existingIndex >= 0 ? entries[existingIndex].id : `gratitude_${Date.now()}`,
      createdAt: existingIndex >= 0 ? entries[existingIndex].createdAt : new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      entries[existingIndex] = newEntry;
    } else {
      entries.unshift(newEntry);
    }

    setLocalStorage('ruangkamu_gratitude', entries);
    return newEntry;
  }

  // If no userId provided, get from current session
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    profileId = user.id;
  }

  const { data, error } = await supabase
    .from('gratitude_entries')
    .upsert({
      user_id: profileId,
      date: entry.date,
      items: entry.items,
    }, {
      onConflict: 'user_id,date'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving gratitude entry:', error);
    return null;
  }

  return {
    id: data.id,
    items: data.items,
    date: data.date,
    createdAt: data.created_at,
  };
}

// ===== USER PROFILE =====

export async function getUserProfile(userId?: string): Promise<UserProfile | null> {
  if (!USE_SUPABASE) {
    const data = localStorage.getItem('ruangkamu_user');
    return data ? JSON.parse(data) : null;
  }

  // If no userId provided, get from current session
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    profileId = user.id;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email || '',
    pin: data.pin,
    theme: data.theme as 'dark' | 'light',
    createdAt: data.created_at,
    isLoggedIn: data.is_logged_in,
  };
}

export async function saveUserProfile(profile: Partial<UserProfile>, userId?: string): Promise<UserProfile | null> {
  if (!USE_SUPABASE) {
    const existing = localStorage.getItem('ruangkamu_user');
    const updated = existing ? { ...JSON.parse(existing), ...profile } : profile;
    localStorage.setItem('ruangkamu_user', JSON.stringify(updated));
    return updated as UserProfile;
  }

  // If no userId provided, get from current session
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    profileId = user.id;
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: profileId,
      name: profile.name,
      email: profile.email,
      pin: profile.pin,
      theme: profile.theme,
      is_logged_in: profile.isLoggedIn,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving profile:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email || '',
    pin: data.pin,
    theme: data.theme as 'dark' | 'light',
    createdAt: data.created_at,
    isLoggedIn: data.is_logged_in,
  };
}

// ===== VAULT ENTRIES =====

export async function getVaultEntries(userId?: string): Promise<VaultEntry[]> {
  if (!USE_SUPABASE) {
    return getLocalStorage<VaultEntry>('ruangkamu_vault');
  }

  // If no userId provided, get from current session
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    profileId = user.id;
  }

  const { data, error } = await supabase
    .from('vault_entries')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vault entries:', error);
    return [];
  }

  return data.map(entry => ({
    id: entry.id,
    title: entry.title,
    content: entry.content,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
  }));
}

export async function saveVaultEntry(
  entry: Omit<VaultEntry, 'id'>,
  userId?: string
): Promise<VaultEntry | null> {
  if (!USE_SUPABASE) {
    const entries = getLocalStorage<VaultEntry>('ruangkamu_vault');
    const newEntry: VaultEntry = {
      ...entry,
      id: `vault_${Date.now()}`,
    };
    entries.unshift(newEntry);
    setLocalStorage('ruangkamu_vault', entries);
    return newEntry;
  }

  // If no userId provided, get from current session
  let profileId = userId;
  if (!profileId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    profileId = user.id;
  }

  const { data, error } = await supabase
    .from('vault_entries')
    .insert({
      user_id: profileId,
      title: entry.title,
      content: entry.content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving vault entry:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function deleteVaultEntry(id: string): Promise<boolean> {
  if (!USE_SUPABASE) {
    const entries = getLocalStorage<VaultEntry>('ruangkamu_vault');
    const filtered = entries.filter(e => e.id !== id);
    setLocalStorage('ruangkamu_vault', filtered);
    return true;
  }

  const { error } = await supabase
    .from('vault_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting vault entry:', error);
    return false;
  }

  return true;
}

// Export singleton status
export { USE_SUPABASE, DEFAULT_USER_ID };
