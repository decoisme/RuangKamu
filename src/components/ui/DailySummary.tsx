'use client';

import { motion } from 'framer-motion';
import type { MoodDailySummary } from '@/lib/checkin-service';
import type { MoodType } from '@/lib/types';

interface DailySummaryProps {
  summary: MoodDailySummary;
}

const MOOD_EMOJIS: Record<MoodType, string> = {
  senang: '😊',
  biasa: '😐',
  capek: '😓',
  cemas: '😰',
  sedih: '😢',
  marah: '😠',
  kosong: '😶',
};

const MOOD_COLORS: Record<MoodType, string> = {
  senang: '#10b981',
  biasa: '#6b7280',
  capek: '#f59e0b',
  cemas: '#ef4444',
  sedih: '#3b82f6',
  marah: '#dc2626',
  kosong: '#9ca3af',
};

export default function DailySummary({ summary }: DailySummaryProps) {
  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5); // HH:MM
  };

  const getVolatilityLabel = (volatility?: number) => {
    if (!volatility) return 'Stable';
    if (volatility < 1) return 'Very stable';
    if (volatility < 2) return 'Stable';
    if (volatility < 3) return 'Moderate';
    return 'Volatile';
  };

  const getVolatilityColor = (volatility?: number) => {
    if (!volatility) return 'text-green-600';
    if (volatility < 2) return 'text-green-600';
    if (volatility < 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 mb-6 border border-black/[0.08] shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0a0a0a]">Today's Summary</h2>
          <p className="text-sm text-[#9a9a9a]">
            {new Date(summary.date).toLocaleDateString('id-ID', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-5xl"
        >
          {MOOD_EMOJIS[summary.dominantMood]}
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Average Score */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#f5f5f5] rounded-2xl p-4"
        >
          <div className="text-sm text-[#9a9a9a] mb-1">Average Mood</div>
          <div className="text-3xl font-bold text-[#0a0a0a]">
            {summary.averageScore.toFixed(1)}
            <span className="text-lg text-[#9a9a9a]">/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${summary.averageScore * 10}%` }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="h-2 rounded-full bg-black"
            />
          </div>
        </motion.div>

        {/* Total Check-ins */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#f5f5f5] rounded-2xl p-4"
        >
          <div className="text-sm text-[#9a9a9a] mb-1">Check-ins</div>
          <div className="text-3xl font-bold text-[#0a0a0a]">
            {summary.totalCheckins}
          </div>
          <div className="text-xs text-[#9a9a9a] mt-2">
            {summary.totalCheckins >= 5 ? 'Great tracking! 🎉' : 'Keep checking in :)'}
          </div>
        </motion.div>
      </div>

      {/* Best & Worst Times */}
      {summary.bestTime && summary.worstTime && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          {/* Best Time */}
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📈</span>
              <span className="text-sm font-medium text-green-900">Best moment</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {formatTime(summary.bestTime)}
            </div>
            <div className="text-sm text-green-700 mt-1">
              Score: {summary.bestScore}/10
            </div>
          </div>

          {/* Worst Time */}
          {summary.worstScore !== summary.bestScore && (
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📉</span>
                <span className="text-sm font-medium text-blue-900">Challenging moment</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatTime(summary.worstTime)}
              </div>
              <div className="text-sm text-blue-700 mt-1">
                Score: {summary.worstScore}/10
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Mood Distribution */}
      {Object.keys(summary.moodDistribution).length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="text-sm font-medium text-[#0a0a0a] mb-3">Mood Distribution</div>
          <div className="flex gap-2 h-3 rounded-full overflow-hidden bg-gray-100">
            {Object.entries(summary.moodDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([mood, count]) => (
                <motion.div
                  key={mood}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(count / summary.totalCheckins) * 100}%` 
                  }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  style={{ 
                    backgroundColor: MOOD_COLORS[mood as MoodType]
                  }}
                  className="h-full"
                  title={`${mood}: ${count}`}
                />
              ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {Object.entries(summary.moodDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([mood, count]) => (
                <div key={mood} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: MOOD_COLORS[mood as MoodType] }}
                  />
                  <span className="text-[#0a0a0a] capitalize">{mood}</span>
                  <span className="text-[#9a9a9a]">({count})</span>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Volatility */}
      {summary.moodVolatility !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#f5f5f5] rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#9a9a9a] mb-1">Mood Stability</div>
              <div className={`text-lg font-bold ${getVolatilityColor(summary.moodVolatility)}`}>
                {getVolatilityLabel(summary.moodVolatility)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#0a0a0a]">
                {summary.moodVolatility.toFixed(1)}
              </div>
              <div className="text-xs text-[#9a9a9a]">volatility</div>
            </div>
          </div>
          <div className="text-xs text-[#9a9a9a] mt-2">
            {summary.moodVolatility < 2 
              ? 'Your mood has been consistent today :)'
              : 'Your mood varied throughout the day'}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
