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
  // Check if user exists
  const existingUserData = localStorage.getItem('ruangkamu_user');
  if (existingUserData) {
    const existingUser = JSON.parse(existingUserData);
    if (existingUser.email === email) {
      // User exists, update login status
      existingUser.isLoggedIn = true;
      localStorage.setItem('ruangkamu_user', JSON.stringify(existingUser));
      return { user: existingUser };
    }
  }
  
  // User not found - throw error
  throw new Error('No account found with this email. Please register first.');
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
  // Check if email already registered
  const existingUserData = localStorage.getItem('ruangkamu_user');
  if (existingUserData) {
    const existingUser = JSON.parse(existingUserData);
    if (existingUser.email === email) {
      throw new Error('Email already registered. Please login instead.');
    }
  }
  
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

// Login with Google OAuth
export async function loginWithGoogle() {
  if (!isSupabaseConfigured()) {
    throw new Error('Google login requires Supabase configuration. Please set up your environment variables.');
  }
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  
  if (error) throw error;
  return data;
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
