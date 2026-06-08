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
  Sunrise,
  Sun,
  Cloud,
  Moon,
  Home,
  Briefcase,
  Globe,
  Car,
  Monitor,
  Leaf,
  Users,
  Dumbbell,
  BookOpen,
  BedDouble,
  Pencil,
  Trash2,
  MessageSquareQuote,
} from 'lucide-react';
import type { MoodCheckin } from '@/lib/checkin-service';
import type { MoodType, TriggerType } from '@/lib/types';

interface CheckinCardProps {
  checkin: MoodCheckin;
  index: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const MOOD_META: Record<
  MoodType,
  { icon: React.ReactNode; color: string; bg: string; label: string }
> = {
  senang: {
    icon: <Smile size={22} strokeWidth={1.8} />,
    color: '#059669',
    bg: '#ecfdf5',
    label: 'Senang',
  },
  biasa: {
    icon: <Minus size={22} strokeWidth={1.8} />,
    color: '#6b7280',
    bg: '#f3f4f6',
    label: 'Biasa',
  },
  capek: {
    icon: <Wind size={22} strokeWidth={1.8} />,
    color: '#d97706',
    bg: '#fffbeb',
    label: 'Capek',
  },
  cemas: {
    icon: <AlertCircle size={22} strokeWidth={1.8} />,
    color: '#dc2626',
    bg: '#fef2f2',
    label: 'Cemas',
  },
  sedih: {
    icon: <Frown size={22} strokeWidth={1.8} />,
    color: '#2563eb',
    bg: '#eff6ff',
    label: 'Sedih',
  },
  marah: {
    icon: <Zap size={22} strokeWidth={1.8} />,
    color: '#b91c1c',
    bg: '#fff1f2',
    label: 'Marah',
  },
  kosong: {
    icon: <Circle size={22} strokeWidth={1.8} />,
    color: '#9ca3af',
    bg: '#f9fafb',
    label: 'Kosong',
  },
};

const TIME_ICONS: Record<string, { icon: React.ReactNode; label: string }> = {
  morning: { icon: <Sunrise size={16} strokeWidth={1.8} />, label: 'Pagi' },
  afternoon: { icon: <Sun size={16} strokeWidth={1.8} />, label: 'Siang' },
  evening: { icon: <Cloud size={16} strokeWidth={1.8} />, label: 'Sore' },
  night: { icon: <Moon size={16} strokeWidth={1.8} />, label: 'Malam' },
};

const LOCATION_ICONS: Record<string, React.ReactNode> = {
  home: <Home size={12} strokeWidth={2} />,
  work: <Briefcase size={12} strokeWidth={2} />,
  outside: <Globe size={12} strokeWidth={2} />,
  commute: <Car size={12} strokeWidth={2} />,
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  working: <Monitor size={12} strokeWidth={2} />,
  relaxing: <Leaf size={12} strokeWidth={2} />,
  socializing: <Users size={12} strokeWidth={2} />,
  exercising: <Dumbbell size={12} strokeWidth={2} />,
  studying: <BookOpen size={12} strokeWidth={2} />,
  sleeping: <BedDouble size={12} strokeWidth={2} />,
};

const TRIGGER_LABELS: Record<TriggerType, string> = {
  work: 'Kerja',
  family: 'Keluarga',
  relationship: 'Hubungan',
  health: 'Kesehatan',
  money: 'Keuangan',
  friends: 'Teman',
  college: 'Kuliah',
  future: 'Masa Depan',
  unknown: 'Lainnya',
};

export default function CheckinCard({ checkin, index, onEdit, onDelete }: CheckinCardProps) {
  const formatTime = (time: string) => time.substring(0, 5);

  const getTimeOfDay = (time: string): string => {
    const hour = parseInt(time.substring(0, 2));
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const timeOfDay = getTimeOfDay(checkin.time);
  const timeInfo = TIME_ICONS[timeOfDay];
  const moodMeta = MOOD_META[checkin.mood];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="group bg-white rounded-2xl border border-black/[0.06] hover:border-black/[0.12] hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Mood color strip */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: moodMeta.color, opacity: 0.6 }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between">
          {/* Left: time + mood */}
          <div className="flex items-center gap-4">
            {/* Time block */}
            <div className="flex flex-col items-center min-w-[44px]">
              <div className="text-[#9a9a9a] mb-0.5" style={{ color: '#9a9a9a' }}>
                {timeInfo.icon}
              </div>
              <div className="text-base font-black text-[#0a0a0a] leading-none tracking-tight">
                {formatTime(checkin.time)}
              </div>
              <div className="text-[10px] text-[#c5c5c5] mt-0.5 font-medium">
                {timeInfo.label}
              </div>
            </div>

            {/* Divider */}
            <div className="h-12 w-px bg-gray-100" />

            {/* Mood block */}
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: moodMeta.bg, color: moodMeta.color }}
              >
                {moodMeta.icon}
              </div>
              <div>
                <div
                  className="text-sm font-bold leading-tight"
                  style={{ color: moodMeta.color }}
                >
                  {moodMeta.label}
                </div>
                {/* Score bar */}
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex gap-[3px]">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className="rounded-sm transition-all"
                        style={{
                          width: '4px',
                          height: i < checkin.score ? '10px' : '6px',
                          backgroundColor:
                            i < checkin.score ? moodMeta.color : '#e5e7eb',
                          opacity: i < checkin.score ? 1 : 0.5,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#9a9a9a] font-medium">
                    {checkin.score}/10
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {(onEdit || onDelete) && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={() => onEdit(checkin.id)}
                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-[#9a9a9a] hover:text-[#0a0a0a]"
                  aria-label="Edit"
                >
                  <Pencil size={13} strokeWidth={2} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(checkin.id)}
                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-50 transition-colors flex items-center justify-center text-[#9a9a9a] hover:text-red-500"
                  aria-label="Hapus"
                >
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Note */}
        {checkin.note && (
          <div className="mt-3.5 bg-[#f7f7f7] rounded-xl p-3.5 flex gap-2.5 items-start">
            <MessageSquareQuote
              size={14}
              className="text-[#c5c5c5] shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <p className="text-sm text-[#5a5a5a] italic leading-relaxed">{checkin.note}</p>
          </div>
        )}

        {/* Tags: location, activity, triggers */}
        {(checkin.locationContext ||
          checkin.activityContext ||
          (checkin.triggers && checkin.triggers.length > 0)) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {checkin.locationContext && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                {LOCATION_ICONS[checkin.locationContext]}
                <span className="capitalize">{checkin.locationContext}</span>
              </span>
            )}
            {checkin.activityContext && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium">
                {ACTIVITY_ICONS[checkin.activityContext]}
                <span className="capitalize">{checkin.activityContext}</span>
              </span>
            )}
            {checkin.triggers?.map((trigger) => (
              <span
                key={trigger}
                className="px-2.5 py-1 rounded-lg bg-[#f2f2f2] text-[#5a5a5a] text-xs font-medium"
              >
                {TRIGGER_LABELS[trigger] || trigger}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
