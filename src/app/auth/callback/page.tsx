'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase will automatically handle the OAuth callback
        // and set the session from the URL hash/params
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth?error=auth_failed');
          return;
        }

        if (session) {
          // Successfully authenticated
          console.log('Google OAuth success:', session.user.email);
          router.push('/dashboard');
        } else {
          // No session found, redirect to auth
          router.push('/auth');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        router.push('/auth?error=unexpected');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 mx-auto border-4 border-black/10 border-t-[#0a0a0a] rounded-full mb-4"
        />
        <p className="text-[#0a0a0a] font-medium">Completing sign in...</p>
        <p className="text-[#9a9a9a] text-sm mt-2">Please wait</p>
      </div>
    </div>
  );
}
