'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth?error=auth_failed');
          return;
        }

        if (session) {
          const user = session.user;
          console.log('Google OAuth success:', user);
          
          // Get user metadata from Google
          const googleName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          const email = user.email || '';
          
          // Check if profile exists in our profiles table
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

          console.log('Existing profile:', existingProfile);

          if (existingProfile && existingProfile.name) {
            // Profile exists with name, go to dashboard
            console.log('Profile found, going to dashboard');
            router.push('/dashboard');
          } else {
            // New user or no name set - show welcome prompt
            console.log('No profile or no name, showing prompt');
            setUserId(user.id);
            setUserEmail(email);
            setUserName(googleName);
            setLoading(false);
            setShowNamePrompt(true);
          }
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

  const handleSaveName = async () => {
    if (!userName.trim()) return;
    
    try {
      setLoading(true);
      
      // Check if profile exists by email
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({ 
            name: userName.trim(),
            is_logged_in: true,
            updated_at: new Date().toISOString()
          })
          .eq('email', userEmail);

        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            name: userName.trim(),
            email: userEmail,
            theme: 'light',
            is_logged_in: true,
          });

        if (error) {
          console.error('Error creating profile:', error);
          throw error;
        }
      }
      
      console.log('Profile saved successfully');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      setLoading(false);
    }
  };

  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[400px] h-[400px] rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%)', 
              top: '-10%', 
              right: '-10%',
              filter: 'blur(60px)' 
            }} 
          />
          <div className="absolute w-[300px] h-[300px] rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(0,0,0,0.015) 0%, transparent 70%)', 
              bottom: '-10%', 
              left: '-10%',
              filter: 'blur(60px)' 
            }} 
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-white rounded-3xl p-8 border border-black/[0.08] shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
            {/* Welcome emoji & text */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-center mb-6"
            >
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">
                Welcome to Ruang Kamu!
              </h2>
              <p className="text-[#9a9a9a] text-sm">
                We&apos;re so glad you&apos;re here {'<3'}
              </p>
            </motion.div>

            {/* Name input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <label className="block text-sm text-[#0a0a0a] mb-2 font-medium">
                What should we call you?
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                placeholder="Your name"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-[#f5f5f5] border border-transparent text-[#0a0a0a] placeholder-[#9a9a9a] text-sm transition-all focus:bg-white focus:border-black/10 focus:shadow-sm"
              />
              <p className="text-xs text-[#9a9a9a] mt-2">
                This helps us personalize your experience :)
              </p>
            </motion.div>

            {/* Continue button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveName}
              disabled={!userName.trim() || loading}
              className="w-full py-3.5 rounded-xl bg-[#0a0a0a] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Continue
                  <span className="text-base">→</span>
                </>
              )}
            </motion.button>

            {/* Skip option */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-4"
            >
              <button
                onClick={() => {
                  setUserName(userEmail.split('@')[0]);
                  setTimeout(handleSaveName, 100);
                }}
                disabled={loading}
                className="text-xs text-[#9a9a9a] hover:text-[#0a0a0a] transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          </div>

          {/* Bottom note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-[#0a0a0a]/30 mt-6"
          >
            You can always change this later in your profile
          </motion.p>
        </motion.div>
      </div>
    );
  }

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
