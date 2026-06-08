'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Target,
  Timer,
  ShieldCheck,
  Loader2,
  Sunrise,
} from 'lucide-react';
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

  useEffect(() => {
    const handleUpdate = () => loadData();
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
            className="w-10 h-10 mx-auto border-[3px] border-black/10 border-t-[#0a0a0a] rounded-full mb-4"
          />
          <p className="text-[#9a9a9a] text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#0a0a0a] flex items-center justify-center">
              <BarChart3 size={15} color="white" strokeWidth={2} />
            </div>
            <span className="text-xs font-semibold text-[#9a9a9a] uppercase tracking-widest">
              Mood Check-in
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0a0a0a] leading-tight tracking-tight">
            Gimana harimu?
          </h1>
          <p className="text-[#9a9a9a] mt-1.5 text-sm">
            Catat perasaanmu sepanjang hari untuk temukan polanya
          </p>
        </motion.div>

        {/* ── Loading State ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 size={28} className="text-[#c5c5c5]" />
            </motion.div>
            <p className="text-sm text-[#9a9a9a]">Memuat check-in kamu...</p>
          </div>
        ) : (
          <>
            {/* ── Daily Summary ── */}
            {summary && <DailySummary summary={summary} />}

            {/* ── Empty State ── */}
            {checkins.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.35 }}
                className="mb-6 p-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl border border-orange-100 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-100">
                  <Sunrise size={32} color="white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">
                  Mulai hari ini dengan check-in
                </h3>
                <p className="text-[#6b7280] text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                  Catat moodmu beberapa kali sehari untuk memahami pola dan mendapat insight personal
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-[#9a9a9a]">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 size={14} className="text-orange-400" />
                    <span>Daily insights</span>
                  </div>
                  <div className="w-px h-3 bg-gray-200" />
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-orange-400" />
                    <span>Pattern recognition</span>
                  </div>
                  <div className="w-px h-3 bg-gray-200" />
                  <div className="flex items-center gap-1.5">
                    <Lightbulb size={14} className="text-orange-400" />
                    <span>Smart suggestions</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Timeline ── */}
            <CheckinTimeline checkins={checkins} onUpdate={loadData} />

            {/* ── Great Tracking Banner ── */}
            {checkins.length >= 3 && summary && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-5 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl border border-violet-100"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-violet-100">
                    <Sparkles size={18} color="white" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[#0a0a0a] mb-1">
                      Konsisten banget! 🎉
                    </h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed">
                      Kamu sudah log {checkins.length} check-in hari ini. Terus pantau untuk lihat pola moodmu.
                    </p>

                    {summary.moodVolatility !== undefined && summary.moodVolatility > 2 && (
                      <div className="mt-3 bg-white/70 rounded-xl p-3 border border-violet-100">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 mb-1">
                          <Lightbulb size={13} />
                          Insight
                        </div>
                        <p className="text-xs text-[#6b7280] leading-relaxed">
                          Moodmu cukup berfluktuasi hari ini. Coba identifikasi apa yang memicu perubahan tersebut.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* ── Info Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: loading ? 0 : 0.45 }}
          className="mt-8 grid grid-cols-3 gap-3"
        >
          {[
            {
              icon: <Target size={18} strokeWidth={1.8} className="text-[#0a0a0a]" />,
              title: '3–5 check-in',
              sub: 'Pagi, siang, dan malam untuk hasil terbaik',
            },
            {
              icon: <Timer size={18} strokeWidth={1.8} className="text-[#0a0a0a]" />,
              title: '5–10 detik',
              sub: 'Cepat & mudah, cukup pilih mood & intensitas',
            },
            {
              icon: <ShieldCheck size={18} strokeWidth={1.8} className="text-[#0a0a0a]" />,
              title: 'Privasi aman',
              sub: 'Data terenkripsi, hanya bisa dilihat kamu',
            },
          ].map((card, i) => (
            <div
              key={i}
              className="p-4 bg-white rounded-2xl border border-black/[0.06] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 rounded-xl bg-[#f2f2f2] flex items-center justify-center mb-3">
                {card.icon}
              </div>
              <div className="text-xs font-bold text-[#0a0a0a] mb-1 leading-tight">
                {card.title}
              </div>
              <div className="text-[10px] text-[#9a9a9a] leading-relaxed">
                {card.sub}
              </div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
