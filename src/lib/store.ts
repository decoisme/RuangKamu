import type { MoodEntry, JournalEntry, VaultEntry, UserProfile } from './types';
import { getToday } from './utils';

// ===== STORAGE KEYS =====

const KEYS = {
  MOOD_ENTRIES: 'ruangkamu_mood_entries',
  JOURNAL_ENTRIES: 'ruangkamu_journal_entries',
  VAULT_ENTRIES: 'ruangkamu_vault_entries',
  USER_PROFILE: 'ruangkamu_user_profile',
} as const;

// ===== INTERNAL HELPERS =====

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[RuangKamu] Failed to parse localStorage key "${key}". Returning fallback.`);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[RuangKamu] Failed to write to localStorage key "${key}":`, error);
  }
}

// ===== MOOD ENTRIES =====

/**
 * Saves a mood entry. If an entry with the same ID already exists, it is replaced.
 */
export function saveMoodEntry(entry: MoodEntry): void {
  const entries = getMoodEntries();
  const existingIndex = entries.findIndex((e) => e.id === entry.id);
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  setItem(KEYS.MOOD_ENTRIES, entries);
}

/**
 * Returns all mood entries, sorted by date descending (newest first).
 */
export function getMoodEntries(): MoodEntry[] {
  const entries = getItem<MoodEntry[]>(KEYS.MOOD_ENTRIES, []);
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Returns mood entries within a date range (inclusive).
 * Dates should be in YYYY-MM-DD format.
 */
export function getMoodEntriesByDateRange(startDate: string, endDate: string): MoodEntry[] {
  const entries = getMoodEntries();
  return entries.filter((e) => e.date >= startDate && e.date <= endDate);
}

/**
 * Returns today's mood entry, or null if none exists.
 */
export function getTodayMoodEntry(): MoodEntry | null {
  const today = getToday();
  const entries = getMoodEntries();
  return entries.find((e) => e.date === today) ?? null;
}

/**
 * Deletes a mood entry by ID.
 */
export function deleteMoodEntry(id: string): void {
  const entries = getMoodEntries();
  const filtered = entries.filter((e) => e.id !== id);
  setItem(KEYS.MOOD_ENTRIES, filtered);
}

// ===== JOURNAL ENTRIES =====

/**
 * Saves a journal entry. If an entry with the same ID already exists, it is replaced.
 */
export function saveJournalEntry(entry: JournalEntry): void {
  const entries = getJournalEntries();
  const existingIndex = entries.findIndex((e) => e.id === entry.id);
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  setItem(KEYS.JOURNAL_ENTRIES, entries);
}

/**
 * Returns all journal entries, sorted by date descending.
 */
export function getJournalEntries(): JournalEntry[] {
  const entries = getItem<JournalEntry[]>(KEYS.JOURNAL_ENTRIES, []);
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Returns a single journal entry by ID, or null if not found.
 */
export function getJournalEntry(id: string): JournalEntry | null {
  const entries = getJournalEntries();
  return entries.find((e) => e.id === id) ?? null;
}

/**
 * Updates a journal entry by ID with partial updates.
 */
export function updateJournalEntry(id: string, updates: Partial<JournalEntry>): void {
  const entries = getJournalEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index >= 0) {
    entries[index] = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(KEYS.JOURNAL_ENTRIES, entries);
  }
}

/**
 * Deletes a journal entry by ID.
 */
export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries();
  const filtered = entries.filter((e) => e.id !== id);
  setItem(KEYS.JOURNAL_ENTRIES, filtered);
}

/**
 * Returns all private journal entries (isPrivate === true).
 */
export function getPrivateJournals(): JournalEntry[] {
  return getJournalEntries().filter((e) => e.isPrivate);
}

// ===== VAULT ENTRIES =====

/**
 * Saves a vault entry. If an entry with the same ID already exists, it is replaced.
 */
export function saveVaultEntry(entry: VaultEntry): void {
  const entries = getVaultEntries();
  const existingIndex = entries.findIndex((e) => e.id === entry.id);
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  setItem(KEYS.VAULT_ENTRIES, entries);
}

/**
 * Returns all vault entries, sorted by creation date descending.
 */
export function getVaultEntries(): VaultEntry[] {
  const entries = getItem<VaultEntry[]>(KEYS.VAULT_ENTRIES, []);
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Deletes a vault entry by ID.
 */
export function deleteVaultEntry(id: string): void {
  const entries = getVaultEntries();
  const filtered = entries.filter((e) => e.id !== id);
  setItem(KEYS.VAULT_ENTRIES, filtered);
}

// ===== USER PROFILE =====

/**
 * Saves the user profile, overwriting any existing profile.
 */
export function saveUserProfile(profile: UserProfile): void {
  setItem(KEYS.USER_PROFILE, profile);
}

/**
 * Returns the user profile, or null if none exists.
 */
export function getUserProfile(): UserProfile | null {
  return getItem<UserProfile | null>(KEYS.USER_PROFILE, null);
}

/**
 * Updates the user profile with partial updates.
 */
export function updateUserProfile(updates: Partial<UserProfile>): void {
  const profile = getUserProfile();
  if (profile) {
    setItem(KEYS.USER_PROFILE, { ...profile, ...updates });
  }
}

// ===== DATA MANAGEMENT =====

/**
 * Clears all Ruang Kamu data from localStorage.
 */
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * Exports all stored data as a JSON string for backup purposes.
 */
export function exportAllData(): string {
  const data = {
    moodEntries: getMoodEntries(),
    journalEntries: getJournalEntries(),
    vaultEntries: getVaultEntries(),
    userProfile: getUserProfile(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}
