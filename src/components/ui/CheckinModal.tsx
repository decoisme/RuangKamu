'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowLeft,
  Check,
  Loader2,
  Smile,
  Minus,
  Frown,
  AlertCircle,
  Zap,
  Wind,
  Circle,
  ChevronRight,
  Briefcase,
  Home,
  Heart,
  Stethoscope,
  Wallet,
  Users,
  GraduationCap,
  Telescope,
} from 'lucide-react';
import { saveMoodCheckin } from '@/lib/checkin-service';
import type { MoodType, TriggerType } from '@/lib/types';

interface CheckinModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const MOODS: Array<{
  value: MoodType;
  label: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    value: 'senang',
    label: 'Senang',
    color: '#059669',
    bg: '#ecfdf5',
    icon: <Smile size={28} strokeWidth={1.8} />,
    description: 'Bahagia & positif',
  },
  {
    value: 'biasa',
    label: 'Biasa',
    color: '#6b7280',
    bg: '#f3f4f6',
    icon: <Minus size={28} strokeWidth={1.8} />,
    description: 'Netral & stabil',
  },
  {
    value: 'capek',
    label: 'Capek',
    color: '#d97706',
    bg: '#fffbeb',
    icon: <Wind size={28} strokeWidth={1.8} />,
    description: 'Lelah & kehabisan energi',
  },
  {
    value: 'cemas',
    label: 'Cemas',
    color: '#dc2626',
    bg: '#fef2f2',
    icon: <AlertCircle size={28} strokeWidth={1.8} />,
    description: 'Gelisah & khawatir',
  },
  {
    value: 'sedih',
    label: 'Sedih',
    color: '#2563eb',
    bg: '#eff6ff',
    icon: <Frown size={28} strokeWidth={1.8} />,
    description: 'Murung & berduka',
  },
  {
    value: 'marah',
    label: 'Marah',
    color: '#b91c1c',
    bg: '#fff1f2',
    icon: <Zap size={28} strokeWidth={1.8} />,
    description: 'Frustrasi & marah',
  },
  {
    value: 'kosong',
    label: 'Kosong',
    color: '#9ca3af',
    bg: '#f9fafb',
    icon: <Circle size={28} strokeWidth={1.8} />,
    description: 'Hampa & mati rasa',
  },
];

const TRIGGERS: Array<{ value: TriggerType; label: string; icon: React.ReactNode }> = [
  { value: 'work', label: 'Kerja', icon: <Briefcase size={13} strokeWidth={2} /> },
  { value: 'family', label: 'Keluarga', icon: <Home size={13} strokeWidth={2} /> },
  { value: 'relationship', label: 'Hubungan', icon: <Heart size={13} strokeWidth={2} /> },
  { value: 'health', label: 'Kesehatan', icon: <Stethoscope size={13} strokeWidth={2} /> },
  { value: 'money', label: 'Keuangan', icon: <Wallet size={13} strokeWidth={2} /> },
  { value: 'friends', label: 'Teman', icon: <Users size={13} strokeWidth={2} /> },
  { value: 'college', label: 'Kuliah', icon: <GraduationCap size={13} strokeWidth={2} /> },
  { value: 'future', label: 'Masa Depan', icon: <Telescope size={13} strokeWidth={2} /> },
];

const STEPS = ['mood', 'score', 'details'] as const;
type Step = (typeof STEPS)[number];

function StepDots({ step }: { step: Step }) {
  const idx = STEPS.indexOf(step);
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`rounded-full transition-all duration-300 ${
              i < idx
                ? 'w-2 h-2 bg-[#0a0a0a]'
                : i === idx
                ? 'w-6 h-2 bg-[#0a0a0a]'
                : 'w-2 h-2 bg-gray-200'
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export default function CheckinModal({ onClose, onSuccess }: CheckinModalProps) {
  const [step, setStep] = useState<Step>('mood');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [score, setScore] = useState(5);
  const [note, setNote] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<TriggerType[]>([]);
  const [loading, setLoading] = useState(false);

  const currentMood = MOODS.find((m) => m.value === selectedMood);

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    setTimeout(() => setStep('score'), 200);
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
      alert('Gagal menyimpan check-in. Coba lagi.');
      setLoading(false);
    }
  };

  const getScoreLabel = () => {
    if (score >= 9) return 'Sangat intens';
    if (score >= 7) return 'Intens';
    if (score >= 5) return 'Sedang';
    if (score >= 3) return 'Ringan';
    return 'Sangat ringan';
  };

  const getScoreColor = () => {
    if (!currentMood) return '#0a0a0a';
    return currentMood.color;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative overflow-hidden"
      >
        {/* Decorative top bar (mobile swipe indicator) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <StepDots step={step} />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-800"
            aria-label="Tutup"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="px-6 pb-8 min-h-[360px]">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Mood Selection ── */}
            {step === 'mood' && (
              <motion.div
                key="mood"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-[#0a0a0a] mb-1">
                  Lagi gimana?
                </h2>
                <p className="text-[#9a9a9a] text-sm mb-6">
                  Ceritain perasaanmu sekarang
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {MOODS.map((mood) => (
                    <motion.button
                      key={mood.value}
                      onClick={() => handleMoodSelect(mood.value)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative p-4 rounded-2xl border-2 border-transparent hover:border-black/10 transition-all text-left group overflow-hidden"
                      style={{ backgroundColor: mood.bg }}
                    >
                      <div
                        className="mb-3 transition-transform duration-200 group-hover:scale-110"
                        style={{ color: mood.color }}
                      >
                        {mood.icon}
                      </div>
                      <div
                        className="text-sm font-semibold"
                        style={{ color: mood.color }}
                      >
                        {mood.label}
                      </div>
                      <div className="text-xs text-[#9a9a9a] mt-0.5 leading-tight">
                        {mood.description}
                      </div>
                      <ChevronRight
                        size={14}
                        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-40 transition-opacity"
                        style={{ color: mood.color }}
                      />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Intensity Score ── */}
            {step === 'score' && currentMood && (
              <motion.div
                key="score"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => setStep('mood')}
                  className="flex items-center gap-1.5 text-sm text-[#9a9a9a] hover:text-[#0a0a0a] transition-colors mb-5 -ml-0.5"
                >
                  <ArrowLeft size={15} />
                  Kembali
                </button>

                {/* Mood badge */}
                <div
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl mb-5"
                  style={{ backgroundColor: currentMood.bg }}
                >
                  <span style={{ color: currentMood.color }}>{currentMood.icon}</span>
                  <div>
                    <div
                      className="text-base font-bold leading-tight"
                      style={{ color: currentMood.color }}
                    >
                      {currentMood.label}
                    </div>
                    <div className="text-xs text-[#9a9a9a]">{currentMood.description}</div>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-[#0a0a0a] mb-1">
                  Seberapa intens?
                </h2>
                <p className="text-sm text-[#9a9a9a] mb-6">
                  Geser untuk menunjukkan intensitas perasaanmu
                </p>

                {/* Score display */}
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <motion.div
                      key={score}
                      initial={{ scale: 1.15, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl font-black text-[#0a0a0a] leading-none"
                    >
                      {score}
                      <span className="text-xl font-normal text-[#9a9a9a]">/10</span>
                    </motion.div>
                    <motion.div
                      key={`label-${score}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-medium mt-1"
                      style={{ color: getScoreColor() }}
                    >
                      {getScoreLabel()}
                    </motion.div>
                  </div>

                  {/* Mini intensity dots */}
                  <div className="flex items-end gap-1 pb-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: i <= score ? `${8 + i * 3}px` : '8px',
                          opacity: i <= score ? 1 : 0.2,
                        }}
                        transition={{ duration: 0.15 }}
                        className="w-2 rounded-full"
                        style={{
                          backgroundColor: i <= score ? getScoreColor() : '#e5e7eb',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Slider */}
                <div className="mb-6">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${getScoreColor()} 0%, ${getScoreColor()} ${
                        (score - 1) * 11.11
                      }%, #e5e7eb ${(score - 1) * 11.11}%, #e5e7eb 100%)`,
                      accentColor: getScoreColor(),
                    }}
                  />
                  <div className="flex justify-between text-xs text-[#c5c5c5] mt-2">
                    <span>Sangat ringan</span>
                    <span>Sangat intens</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setStep('details')}
                    className="flex-1 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-[#5a5a5a]"
                  >
                    + Tambah Catatan
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-3.5 rounded-2xl bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] active:scale-[0.98] transition-all disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check size={16} strokeWidth={2.5} />
                        Selesai
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Details ── */}
            {step === 'details' && currentMood && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => setStep('score')}
                  className="flex items-center gap-1.5 text-sm text-[#9a9a9a] hover:text-[#0a0a0a] transition-colors mb-5 -ml-0.5"
                >
                  <ArrowLeft size={15} />
                  Kembali
                </button>

                <h2 className="text-xl font-bold text-[#0a0a0a] mb-1">
                  Ceritain lebih lanjut
                </h2>
                <p className="text-sm text-[#9a9a9a] mb-5">
                  Opsional — boleh dilewati
                </p>

                {/* Textarea */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider mb-2">
                    Apa yang lagi terjadi?
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Tulis perasaanmu di sini..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#f7f7f7] border border-transparent focus:border-black/10 resize-none text-[#0a0a0a] placeholder-[#c5c5c5] text-sm leading-relaxed transition-all"
                    rows={3}
                    maxLength={300}
                  />
                  <div className="text-right text-xs text-[#c5c5c5] mt-1">
                    {note.length}/300
                  </div>
                </div>

                {/* Triggers */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider mb-2.5">
                    Berhubungan dengan
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TRIGGERS.map((trigger) => {
                      const isSelected = selectedTriggers.includes(trigger.value);
                      return (
                        <button
                          key={trigger.value}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTriggers(
                                selectedTriggers.filter((t) => t !== trigger.value)
                              );
                            } else {
                              setSelectedTriggers([...selectedTriggers, trigger.value]);
                            }
                          }}
                          className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#0a0a0a] text-white shadow-sm scale-[1.02]'
                              : 'bg-[#f2f2f2] text-[#5a5a5a] hover:bg-[#ebebeb]'
                          }`}
                        >
                          <span className={isSelected ? 'text-white' : 'text-[#9a9a9a]'}>{trigger.icon}</span>
                          {trigger.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] active:scale-[0.99] transition-all disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check size={16} strokeWidth={2.5} />
                      Simpan Check-in
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
