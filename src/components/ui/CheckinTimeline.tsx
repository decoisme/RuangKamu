'use client';

import { motion } from 'framer-motion';
import type { MoodCheckin } from '@/lib/checkin-service';
import CheckinCard from './CheckinCard';

interface CheckinTimelineProps {
  checkins: MoodCheckin[];
  onUpdate?: () => void;
}

export default function CheckinTimeline({ checkins, onUpdate }: CheckinTimelineProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this check-in?')) return;
    
    const { deleteMoodCheckin } = await import('@/lib/checkin-service');
    const success = await deleteMoodCheckin(id);
    
    if (success && onUpdate) {
      onUpdate();
    }
  };

  if (checkins.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">
          No check-ins yet today
        </h3>
        <p className="text-[#9a9a9a] mb-6">
          Tap the button below to record your first mood :)
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-[#9a9a9a]">
          <span>💡</span>
          <span>Track your mood multiple times throughout the day</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0a0a0a]">Timeline</h2>
        <div className="text-sm text-[#9a9a9a]">
          {checkins.length} {checkins.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      <div className="space-y-3">
        {checkins.map((checkin, index) => (
          <CheckinCard
            key={checkin.id}
            checkin={checkin}
            index={index}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Tips */}
      {checkins.length < 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100"
        >
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <div className="text-sm font-medium text-blue-900 mb-1">
                Track more for better insights
              </div>
              <div className="text-xs text-blue-700">
                Check in 3-5 times a day to see patterns and get personalized suggestions :)
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
