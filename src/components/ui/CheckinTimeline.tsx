'use client';

import { motion } from 'framer-motion';
import { Lightbulb, ClipboardList } from 'lucide-react';
import type { MoodCheckin } from '@/lib/checkin-service';
import CheckinCard from './CheckinCard';

interface CheckinTimelineProps {
  checkins: MoodCheckin[];
  onUpdate?: () => void;
}

export default function CheckinTimeline({ checkins, onUpdate }: CheckinTimelineProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Hapus check-in ini?')) return;
    const { deleteMoodCheckin } = await import('@/lib/checkin-service');
    const success = await deleteMoodCheckin(id);
    if (success && onUpdate) onUpdate();
  };

  if (checkins.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-14"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#f2f2f2] flex items-center justify-center mx-auto mb-4">
          <ClipboardList size={28} strokeWidth={1.5} className="text-[#c5c5c5]" />
        </div>
        <h3 className="text-lg font-bold text-[#0a0a0a] mb-1.5">
          Belum ada check-in hari ini
        </h3>
        <p className="text-sm text-[#9a9a9a] mb-5 max-w-xs mx-auto">
          Tap tombol di bawah untuk mulai catat moodmu
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-[#9a9a9a] bg-[#f7f7f7] px-4 py-2 rounded-full">
          <Lightbulb size={13} strokeWidth={2} className="text-amber-400" />
          Catat moodmu beberapa kali sehari
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Timeline header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[#0a0a0a] flex items-center gap-2">
          <ClipboardList size={16} strokeWidth={2} className="text-[#9a9a9a]" />
          Timeline Hari Ini
        </h2>
        <div className="text-xs font-medium text-[#9a9a9a] bg-[#f2f2f2] px-3 py-1.5 rounded-full">
          {checkins.length} {checkins.length === 1 ? 'entri' : 'entri'}
        </div>
      </div>

      {/* Cards */}
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

      {/* Tips for < 3 */}
      {checkins.length < 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5 p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
            <Lightbulb size={16} strokeWidth={2} className="text-sky-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-sky-900 mb-0.5">
              Tambah lebih banyak
            </div>
            <div className="text-xs text-sky-700 leading-relaxed">
              Catat 3–5 kali sehari untuk lihat pola dan saran yang lebih akurat.
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
