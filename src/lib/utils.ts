import { format, parseISO } from 'date-fns';

/**
 * Generates a UUID v4-like random ID.
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Formats an ISO date string (YYYY-MM-DD) to a readable format.
 * Example: "2026-06-06" → "June 6, 2026"
 */
export function formatDate(date: string): string {
  try {
    const parsed = parseISO(date);
    return format(parsed, 'MMMM d, yyyy');
  } catch {
    return date;
  }
}

/**
 * Formats an ISO datetime string to a readable time.
 * Example: "2026-06-06T14:30:00Z" → "2:30 PM"
 */
export function formatTime(timestamp: string): string {
  try {
    const parsed = parseISO(timestamp);
    return format(parsed, 'h:mm a');
  } catch {
    return timestamp;
  }
}

/**
 * Returns today's date as YYYY-MM-DD.
 */
export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Returns a time-based greeting string.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Returns the day name for a given ISO date string.
 * Example: "2026-06-06" → "Saturday"
 */
export function getDayOfWeek(date: string): string {
  try {
    const parsed = parseISO(date);
    return format(parsed, 'EEEE');
  } catch {
    return '';
  }
}

/**
 * Clamps a numeric value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Merges class name strings, filtering out falsy values.
 * A lightweight alternative to clsx/classnames.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
