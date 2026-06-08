'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getTodayCheckins, getTodaySummary } from '@/lib/checkin-service';
import { isAuthenticated } from '@/lib/auth';
import type { MoodCheckin, MoodDailySummary } from '@/lib/checkin-service';
import DailySummary from '@/components/ui/DailySummary';
import CheckinTimeline from '@/components/ui/CheckinTimeline';
import Navbar from '@/components/layout/Navbar';

export const dynamic = 'force-dynamic';

export default function CheckinPage() {
  const router = useRouter();
  const [checkins, setCheckins] = useState<MoodCheckin[]>([]);
  const [summary, setSummary] = useState<MoodDailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const auth = await isAuthenticated();
    if (!auth) {
      router.push('/auth');
      return;
    }
    setAuthenticated(true);
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [checkinsData, summaryData] = await Promise.all([
        getTodayCheckins(),
        getTodaySummary(),
      ]);
      setCheckins(checkinsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading check-in data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for check-in updates
  useEffect(() => {
    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('checkin-updated', handleUpdate);
    return () => window.removeEventListener('checkin-updated', handleUpdate);
  }, []);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto border-4 border-black/10 border-t-[#0a0a0a] rounded-full mb-4"
          />
          <p className="text-[#9a9a9a]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#0a0a0a] mb-2">
            Mood Check-ins
          </h1>
          <p className="text-[#9a9a9a]">
            Track your emotional journey throughout the day :)
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 mx-auto border-4 border-black/10 border-t-[#0a0a0a] rounded-full mb-4"
            />
            <p className="text-[#9a9a9a]">Loading your check-ins...</p>
          </div>
        ) : (
          <>
            {/* Daily Summary */}
            {summary && <DailySummary summary={summary} />}

            {/* Timeline */}
            <CheckinTimeline 
              checkins={checkins} 
              onUpdate={loadData}
            />

            {/* Quick Tips */}
            {checkins.length >= 3 && summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl border border-purple-100"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">✨</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#0a0a0a] mb-2">
                      Great tracking!
                    </h3>
                    <p className="text-sm text-[#6b7280] mb-3">
                      You've logged {checkins.length} check-ins today. Keep it up to discover patterns in your mood {'<3'}
                    </p>
                    
                    {summary.moodVolatility !== undefined && summary.moodVolatility > 2 && (
                      <div className="bg-white/60 rounded-xl p-3 text-sm">
                        <div className="font-medium text-[#0a0a0a] mb-1">
                          💡 Insight
                        </div>
                        <div className="text-[#6b7280]">
                          Your mood varied today. Consider what triggered the changes and how you can maintain stability :)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Empty State with CTA */}
            {checkins.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8 p-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl border border-orange-100 text-center"
              >
                <div className="text-6xl mb-4">🌅</div>
                <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">
                  Start your day with a check-in
                </h3>
                <p className="text-[#6b7280] mb-6 max-w-md mx-auto">
                  Track your mood multiple times throughout the day to understand patterns and get personalized insights
                </p>
                <div className="flex items-center justify-center gap-3 text-sm text-[#9a9a9a]">
                  <div className="flex items-center gap-2">
                    <span>📊</span>
                    <span>Daily insights</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <span>📈</span>
                    <span>Pattern recognition</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <span>💡</span>
                    <span>Smart suggestions</span>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="p-4 bg-[#f5f5f5] rounded-2xl">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm font-medium text-[#0a0a0a] mb-1">
              Target: 3-5 check-ins
            </div>
            <div className="text-xs text-[#9a9a9a]">
              Check in morning, afternoon, and evening for best insights
            </div>
          </div>

          <div className="p-4 bg-[#f5f5f5] rounded-2xl">
            <div className="text-2xl mb-2">⏱️</div>
            <div className="text-sm font-medium text-[#0a0a0a] mb-1">
              Takes 5-10 seconds
            </div>
            <div className="text-xs text-[#9a9a9a]">
              Quick and easy - just pick a mood and rate the intensity
            </div>
          </div>

          <div className="p-4 bg-[#f5f5f5] rounded-2xl">
            <div className="text-2xl mb-2">🔒</div>
            <div className="text-sm font-medium text-[#0a0a0a] mb-1">
              Private & secure
            </div>
            <div className="text-xs text-[#9a9a9a]">
              Your data is encrypted and only visible to you
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
