import { createClient } from '@supabase/supabase-js';

// Client-side environment variables (available in browser)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Supabase client instance.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * environment variables for configuration.
 * 
 * For build-time, uses placeholder values to prevent errors.
 * The isSupabaseConfigured() check will return false, triggering localStorage fallback.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key-for-build-time'
);

/**
 * Checks whether real Supabase credentials are configured.
 * Returns false if using placeholder or empty values.
 */
export function isSupabaseConfigured(): boolean {
  const placeholders = [
    '',
    'your-supabase-url',
    'your-supabase-anon-key',
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY',
    'https://your-project.supabase.co',
    'placeholder',
    'PLACEHOLDER',
  ];

  const urlValid =
    supabaseUrl.length > 0 &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co') &&
    !placeholders.includes(supabaseUrl);

  const keyValid =
    supabaseAnonKey.length > 20 &&
    !placeholders.includes(supabaseAnonKey);

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('[Supabase Config Check]', {
      urlValid,
      keyValid,
      urlLength: supabaseUrl.length,
      keyLength: supabaseAnonKey.length,
      url: supabaseUrl.substring(0, 30) + '...',
      configured: urlValid && keyValid
    });
  }

  return urlValid && keyValid;
}
