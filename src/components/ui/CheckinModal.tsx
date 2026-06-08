'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { saveMoodCheckin } from '@/lib/checkin-service';
import type { MoodType, TriggerType } from '@/lib/types';

interface CheckinModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const MOODS: Array<{ value: MoodType; emoji: string; label: string; color: string }> = [
  { value: 'senang', emoji: '😊', label: 'Senang', color: '#10b981' },
  { value: 'biasa', emoji: '😐', label: 'Biasa', color: '#6b7280' },
  { value: 'capek', emoji: '😓', label: 'Capek', color: '#f59e0b' },
  { value: 'cemas', emoji: '😰', label: 'Cemas', color: '#ef4444' },
  { value: 'sedih', emoji: '😢', label: 'Sedih', color: '#3b82f6' },
  { value: 'marah', emoji: '😠', label: 'Marah', color: '#dc2626' },
  { value: 'kosong', emoji: '😶', label: 'Kosong', color: '#9ca3af' },
];

const TRIGGERS: Array<{ value: TriggerType; label: string }> = [
  { value: 'work', label: 'Kerja' },
  { value: 'family', label: 'Keluarga' },
  { value: 'relationship', label: 'Hubungan' },
  { value: 'health', label: 'Kesehatan' },
  { value: 'money', label: 'Keuangan' },
  { value: 'friends', label: 'Teman' },
  { value: 'college', label: 'Kuliah' },
  { value: 'future', label: 'Masa Depan' },
];

const ENCOURAGING_MESSAGES = {
  high: [
    "Love your energy! {'<3'}",
    "You're doing great! :)",
    "Keep that good vibe going!",
    "Amazing! Keep shining ✨",
  ],
  medium: [
    "Every moment matters :)",
    "You've got this!",
    "Thanks for checking in {'<3'}",
    "One step at a time :)",
  ],
  low: [
    "It's okay to have tough moments :)",
    "Be gentle with yourself {'<3'}",
    "Tomorrow is a new day",
    "You're not alone in this",
  ],
};

export default function CheckinModal({ onClose, onSuccess }: CheckinModalProps) {
  const [step, setStep] = useState<'mood' | 'score' | 'details'>('mood');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [score, setScore] = useState(5);
  const [note, setNote] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<TriggerType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    setStep('score');
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    
    setLoading(true);
    
    const now = new Date();
    const checkin = {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      timestamp: now.toISOString(),
      mood: selectedMood,
      score,
      triggers: selectedTriggers,
      note: note.trim() || undefined,
    };
    
    const result = await saveMoodCheckin(checkin);
    
    if (result) {
      onSuccess();
    } else {
      alert('Failed to save check-in. Please try again.');
      setLoading(false);
    }
  };

  const getEncouragingMessage = () => {
    const messages = score >= 7 ? ENCOURAGING_MESSAGES.high 
                    : score >= 4 ? ENCOURAGING_MESSAGES.medium 
                    : ENCOURAGING_MESSAGES.low;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
          aria-label="Close"
        >
          <span className="text-gray-600">×</span>
        </button>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full ${step !== 'mood' ? 'bg-black' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'details' ? 'bg-black' : 'bg-gray-200'}`} />
        </div>

        {/* Step 1: Mood Selection */}
        {step === 'mood' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">
              How are you feeling?
            </h2>
            <p className="text-[#9a9a9a] text-sm mb-6">
              Right now, in this moment :)
            </p>

            <div className="grid grid-cols-4 gap-3">
              {MOODS.map((mood) => (
                <motion.button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 rounded-2xl bg-[#f5f5f5] hover:bg-gray-200 transition-all flex flex-col items-center gap-2"
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-xs text-[#0a0a0a] font-medium">{mood.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Score */}
        {step === 'score' && selectedMood && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <button
              onClick={() => setStep('mood')}
              className="text-sm text-[#9a9a9a] hover:text-[#0a0a0a] mb-4 flex items-center gap-1"
            >
              ← Back
            </button>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">
                {MOODS.find(m => m.value === selectedMood)?.emoji}
              </span>
              <div>
                <h2 className="text-2xl font-bold text-[#0a0a0a] capitalize">
                  {selectedMood}
                </h2>
                <p className="text-[#9a9a9a] text-sm">
                  How intense is this feeling?
                </p>
              </div>
            </div>

            {/* Score Slider */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-[#9a9a9a]">Intensity</span>
                <motion.span
                  key={score}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-[#0a0a0a]"
                >
                  {score}/10
                </motion.span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                style={{
                  background: `linear-gradient(to right, #0a0a0a 0%, #0a0a0a ${(score - 1) * 11.11}%, #e5e5e5 ${(score - 1) * 11.11}%, #e5e5e5 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-[#9a9a9a] mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep('details');
                }}
                className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
              >
                Add details
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-black text-white hover:bg-gray-900 transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? 'Saving...' : 'Done ✓'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Details (Optional) */}
        {step === 'details' && selectedMood && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <button
              onClick={() => setStep('score')}
              className="text-sm text-[#9a9a9a] hover:text-[#0a0a0a] mb-4 flex items-center gap-1"
            >
              ← Back
            </button>

            <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
              Add some context (optional)
            </h2>

            {/* Note */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                What's happening?
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type here..."
                className="w-full px-4 py-3 rounded-xl bg-[#f5f5f5] border-none resize-none text-[#0a0a0a] placeholder-[#9a9a9a] focus:bg-white focus:ring-2 focus:ring-black/10"
                rows={3}
              />
            </div>

            {/* Triggers */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                Related to:
              </label>
              <div className="flex flex-wrap gap-2">
                {TRIGGERS.map((trigger) => (
                  <button
                    key={trigger.value}
                    onClick={() => {
                      if (selectedTriggers.includes(trigger.value)) {
                        setSelectedTriggers(selectedTriggers.filter(t => t !== trigger.value));
                      } else {
                        setSelectedTriggers([...selectedTriggers, trigger.value]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedTriggers.includes(trigger.value)
                        ? 'bg-black text-white'
                        : 'bg-[#f5f5f5] text-[#0a0a0a] hover:bg-gray-200'
                    }`}
                  >
                    {trigger.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-black text-white hover:bg-gray-900 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Saving...' : 'Check In ✓'}
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
