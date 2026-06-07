import { createClient } from '@supabase/supabase-js';

// Client-side environment variables (available in browser)
// Next.js should automatically inject NEXT_PUBLIC_* variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback for development if env vars not loaded
// (This ensures Google OAuth works even if env var injection has issues)
const FALLBACK_URL = 'https://lzbqcjmnbiystmepglza.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6YnFjam1uYml5c3RtZXBnbHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzU4ODEsImV4cCI6MjA5NjM1MTg4MX0.QQE4Dha_Q3OeL04P9BEHjfuoEa40Da4Ne4D50tGEvcs';

const finalUrl = supabaseUrl || FALLBACK_URL;
const finalKey = supabaseAnonKey || FALLBACK_KEY;

/**
 * Supabase client instance.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * environment variables for configuration.
 * 
 * For build-time, uses placeholder values to prevent errors.
 * The isSupabaseConfigured() check will return false, triggering localStorage fallback.
 */
export const supabase = createClient(
  finalUrl || 'https://placeholder.supabase.co',
  finalKey || 'placeholder-anon-key-for-build-time'
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

  const urlValid: boolean = Boolean(
    finalUrl && 
    finalUrl.length > 0 &&
    finalUrl.startsWith('https://') &&
    finalUrl.includes('.supabase.co') &&
    !placeholders.includes(finalUrl)
  );

  const keyValid: boolean = Boolean(
    finalKey && 
    finalKey.length > 20 &&
    !placeholders.includes(finalKey)
  );

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('[Supabase Config Check]', {
      urlValid,
      keyValid,
      urlLength: finalUrl?.length || 0,
      keyLength: finalKey?.length || 0,
      url: finalUrl?.substring(0, 40) + '...',
      configured: urlValid && keyValid,
      source: supabaseUrl ? 'env' : 'fallback'
    });
  }

  const result: boolean = urlValid && keyValid;
  return result;
}
