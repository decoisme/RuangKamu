// Auth helper dengan Supabase integration
import { supabase, isSupabaseConfigured } from './supabase';

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  // Jika Supabase configured, check session
  if (isSupabaseConfigured()) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session !== null;
    } catch {
      return false;
    }
  }
  
  // Fallback ke localStorage
  try {
    const user = localStorage.getItem('ruangkamu_user');
    if (!user) return false;
    
    const userData = JSON.parse(user);
    return userData?.isLoggedIn === true;
  } catch {
    return false;
  }
}

// Get authenticated user
export async function getAuthUser() {
  if (typeof window === 'undefined') return null;
  
  // Jika Supabase configured, get user dari session
  if (isSupabaseConfigured()) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  }
  
  // Fallback ke localStorage
  try {
    const user = localStorage.getItem('ruangkamu_user');
    if (!user) return null;
    
    return JSON.parse(user);
  } catch {
    return null;
  }
}

// Login dengan Supabase Auth
export async function loginWithEmail(email: string, password: string) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }
  
  // Fallback: localStorage login
  const user = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    email,
    name: email.split('@')[0],
    theme: 'light',
    createdAt: new Date().toISOString(),
    isLoggedIn: true,
  };
  
  localStorage.setItem('ruangkamu_user', JSON.stringify(user));
  return { user };
}

// Register dengan Supabase Auth
export async function registerWithEmail(email: string, password: string, name: string) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) throw error;
    return data;
  }
  
  // Fallback: localStorage register
  const user = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    email,
    name,
    theme: 'light',
    createdAt: new Date().toISOString(),
    isLoggedIn: true,
  };
  
  localStorage.setItem('ruangkamu_user', JSON.stringify(user));
  return { user };
}

// Logout
export async function logout() {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
  
  // Clear localStorage
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('ruangkamu_user');
    if (user) {
      const userData = JSON.parse(user);
      userData.isLoggedIn = false;
      localStorage.setItem('ruangkamu_user', JSON.stringify(userData));
    }
  }
}

// Check localStorage auth (sync version for quick checks)
export function isAuthenticatedSync(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const user = localStorage.getItem('ruangkamu_user');
    if (!user) return false;
    
    const userData = JSON.parse(user);
    return userData?.isLoggedIn === true;
  } catch {
    return false;
  }
}
