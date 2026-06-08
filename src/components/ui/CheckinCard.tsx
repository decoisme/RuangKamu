'use client';

import { motion } from 'framer-motion';
import type { MoodCheckin } from '@/lib/checkin-service';
import type { MoodType } from '@/lib/types';

interface CheckinCardProps {
  checkin: MoodCheckin;
  index: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
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

const TIME_ICONS: Record<string, string> = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌤️',
  night: '🌙',
};

const LOCATION_ICONS: Record<string, string> = {
  home: '🏠',
  work: '💼',
  outside: '🌍',
  commute: '🚗',
};

const ACTIVITY_ICONS: Record<string, string> = {
  working: '💻',
  relaxing: '🧘',
  socializing: '👥',
  exercising: '🏃',
  studying: '📚',
  sleeping: '😴',
};

export default function CheckinCard({ checkin, index, onEdit, onDelete }: CheckinCardProps) {
  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM
  };

  const getTimeOfDay = (time: string): string => {
    const hour = parseInt(time.substring(0, 2));
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const timeOfDay = getTimeOfDay(checkin.time);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl p-5 border border-black/[0.08] hover:shadow-md transition-shadow"
    >
      {/* Header: Time & Mood */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-xl">{TIME_ICONS[timeOfDay]}</span>
            <span className="text-lg font-bold text-[#0a0a0a]">
              {formatTime(checkin.time)}
            </span>
            <span className="text-xs text-[#9a9a9a] capitalize">
              {timeOfDay}
            </span>
          </div>
          
          <div className="h-12 w-px bg-gray-200" />
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">{MOOD_EMOJIS[checkin.mood]}</span>
              <div>
                <div className="text-sm font-medium text-[#0a0a0a] capitalize">
                  {checkin.mood}
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-3 rounded-sm ${
                          i < checkin.score 
                            ? 'bg-black' 
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#9a9a9a] ml-1">
                    {checkin.score}/10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(checkin.id)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
                aria-label="Edit"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(checkin.id)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 transition-colors flex items-center justify-center text-sm"
                aria-label="Delete"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      {/* Note */}
      {checkin.note && (
        <div className="mb-3 bg-[#f5f5f5] rounded-xl p-3">
          <p className="text-sm text-[#0a0a0a]">&quot;{checkin.note}&quot;</p>
        </div>
      )}

      {/* Context & Triggers */}
      <div className="flex flex-wrap gap-2">
        {/* Location */}
        {checkin.locationContext && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            {LOCATION_ICONS[checkin.locationContext]}
            <span className="capitalize">{checkin.locationContext}</span>
          </span>
        )}

        {/* Activity */}
        {checkin.activityContext && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
            {ACTIVITY_ICONS[checkin.activityContext]}
            <span className="capitalize">{checkin.activityContext}</span>
          </span>
        )}

        {/* Triggers */}
        {checkin.triggers && checkin.triggers.length > 0 && (
          <>
            {checkin.triggers.map((trigger) => (
              <span
                key={trigger}
                className="px-2.5 py-1 rounded-full bg-gray-100 text-[#0a0a0a] text-xs font-medium"
              >
                {trigger}
              </span>
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}
