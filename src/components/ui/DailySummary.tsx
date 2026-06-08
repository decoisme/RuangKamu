'use client';

import { motion } from 'framer-motion';
import {
  Smile,
  Minus,
  Wind,
  AlertCircle,
  Frown,
  Zap,
  Circle,
  TrendingUp,
  TrendingDown,
  Activity,
  PartyPopper,
  LayoutDashboard,
} from 'lucide-react';
import type { MoodDailySummary } from '@/lib/checkin-service';
import type { MoodType } from '@/lib/types';

interface DailySummaryProps {
  summary: MoodDailySummary;
}

const MOOD_META: Record<
  MoodType,
  { icon: React.ReactNode; color: string; bg: string; label: string }
> = {
  senang: {
    icon: <Smile size={26} strokeWidth={1.6} />,
    color: '#059669',
    bg: '#ecfdf5',
    label: 'Senang',
  },
  biasa: {
    icon: <Minus size={26} strokeWidth={1.6} />,
    color: '#6b7280',
    bg: '#f3f4f6',
    label: 'Biasa',
  },
  capek: {
    icon: <Wind size={26} strokeWidth={1.6} />,
    color: '#d97706',
    bg: '#fffbeb',
    label: 'Capek',
  },
  cemas: {
    icon: <AlertCircle size={26} strokeWidth={1.6} />,
    color: '#dc2626',
    bg: '#fef2f2',
    label: 'Cemas',
  },
  sedih: {
    icon: <Frown size={26} strokeWidth={1.6} />,
    color: '#2563eb',
    bg: '#eff6ff',
    label: 'Sedih',
  },
  marah: {
    icon: <Zap size={26} strokeWidth={1.6} />,
    color: '#b91c1c',
    bg: '#fff1f2',
    label: 'Marah',
  },
  kosong: {
    icon: <Circle size={26} strokeWidth={1.6} />,
    color: '#9ca3af',
    bg: '#f9fafb',
    label: 'Kosong',
  },
};

const MOOD_COLORS: Record<MoodType, string> = {
  senang: '#059669',
  biasa: '#6b7280',
  capek: '#d97706',
  cemas: '#dc2626',
  sedih: '#2563eb',
  marah: '#b91c1c',
  kosong: '#9ca3af',
};

export default function DailySummary({ summary }: DailySummaryProps) {
  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  const getVolatilityLabel = (v?: number) => {
    if (!v) return 'Sangat Stabil';
    if (v < 1) return 'Sangat Stabil';
    if (v < 2) return 'Stabil';
    if (v < 3) return 'Sedang';
    return 'Fluktuatif';
  };

  const getVolatilityColor = (v?: number) => {
    if (!v || v < 2) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    if (v < 3) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
  };

  const dominantMoodMeta = MOOD_META[summary.dominantMood];
  const volatilityStyle = getVolatilityColor(summary.moodVolatility);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-3xl border border-black/[0.06] shadow-sm mb-6 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-black/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0a0a0a] flex items-center justify-center">
            <LayoutDashboard size={15} color="white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0a0a0a] leading-tight">
              Ringkasan Hari Ini
            </h2>
            <p className="text-xs text-[#9a9a9a]">
              {new Date(summary.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
        </div>

        {/* Dominant mood badge */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 280 }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl"
          style={{ backgroundColor: dominantMoodMeta.bg, color: dominantMoodMeta.color }}
        >
          {dominantMoodMeta.icon}
          <span className="text-sm font-bold">{dominantMoodMeta.label}</span>
        </motion.div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Average score */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#f7f7f7] rounded-2xl p-4"
          >
            <div className="text-xs font-semibold text-[#9a9a9a] uppercase tracking-wider mb-2">
              Rata-rata Mood
            </div>
            <div className="text-3xl font-black text-[#0a0a0a] leading-none mb-0.5">
              {summary.averageScore.toFixed(1)}
              <span className="text-base font-normal text-[#9a9a9a]">/10</span>
            </div>
            {/* Score bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${summary.averageScore * 10}%` }}
                transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full bg-[#0a0a0a]"
              />
            </div>
          </motion.div>

          {/* Total check-ins */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#f7f7f7] rounded-2xl p-4"
          >
            <div className="text-xs font-semibold text-[#9a9a9a] uppercase tracking-wider mb-2">
              Check-ins
            </div>
            <div className="text-3xl font-black text-[#0a0a0a] leading-none mb-0.5">
              {summary.totalCheckins}
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-xs font-medium">
              {summary.totalCheckins >= 5 ? (
                <>
                  <PartyPopper size={13} className="text-emerald-500" strokeWidth={2} />
                  <span className="text-emerald-600">Tracking keren!</span>
                </>
              ) : (
                <>
                  <Activity size={13} className="text-[#9a9a9a]" strokeWidth={2} />
                  <span className="text-[#9a9a9a]">Terus tambah ya!</span>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Best & Worst moments */}
        {summary.bestTime && summary.worstTime && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp size={14} strokeWidth={2} className="text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">Momen terbaik</span>
              </div>
              <div className="text-2xl font-black text-emerald-900 leading-none">
                {formatTime(summary.bestTime)}
              </div>
              <div className="text-xs text-emerald-700 mt-1.5 font-medium">
                Skor {summary.bestScore}/10
              </div>
            </div>

            {summary.worstScore !== summary.bestScore && (
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingDown size={14} strokeWidth={2} className="text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">Momen berat</span>
                </div>
                <div className="text-2xl font-black text-blue-900 leading-none">
                  {formatTime(summary.worstTime)}
                </div>
                <div className="text-xs text-blue-700 mt-1.5 font-medium">
                  Skor {summary.worstScore}/10
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Mood distribution */}
        {Object.keys(summary.moodDistribution).length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="text-xs font-semibold text-[#9a9a9a] uppercase tracking-wider mb-3">
              Distribusi Mood
            </div>

            {/* Bar */}
            <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 bg-gray-100">
              {Object.entries(summary.moodDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([mood, count]) => (
                  <motion.div
                    key={mood}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / summary.totalCheckins) * 100}%` }}
                    transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
                    style={{ backgroundColor: MOOD_COLORS[mood as MoodType] }}
                    className="h-full"
                    title={`${mood}: ${count}`}
                  />
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
              {Object.entries(summary.moodDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([mood, count]) => (
                  <div key={mood} className="flex items-center gap-1.5 text-xs">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: MOOD_COLORS[mood as MoodType] }}
                    />
                    <span className="text-[#5a5a5a] capitalize font-medium">
                      {MOOD_META[mood as MoodType]?.label ?? mood}
                    </span>
                    <span className="text-[#9a9a9a]">({count}×)</span>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Volatility badge */}
        {summary.moodVolatility !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className={`flex items-center justify-between p-4 rounded-2xl border ${volatilityStyle.bg} ${volatilityStyle.border}`}
          >
            <div>
              <div className="text-xs font-semibold text-[#9a9a9a] mb-1">Stabilitas Mood</div>
              <div className={`text-base font-bold ${volatilityStyle.text}`}>
                {getVolatilityLabel(summary.moodVolatility)}
              </div>
              <div className="text-xs text-[#9a9a9a] mt-0.5">
                {summary.moodVolatility < 2
                  ? 'Moodmu konsisten hari ini'
                  : 'Moodmu cukup berubah-ubah hari ini'}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-black ${volatilityStyle.text}`}>
                {summary.moodVolatility.toFixed(1)}
              </div>
              <div className="text-[10px] text-[#9a9a9a]">volatilitas</div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
