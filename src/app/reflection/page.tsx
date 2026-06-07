'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, Wind, Anchor, RefreshCw, Play, Pause, RotateCcw,
  ChevronDown, ChevronUp, Eye, Hand, Ear, Flower2, Cookie, PartyPopper,
  Menu, X, LayoutDashboard, SmilePlus, BookOpen, BarChart3, Lock, User,
  Heart, Moon, PenLine, Music, Phone, FileX, Timer, Search, Droplets, Tag, Scan,
  Circle, List
} from 'lucide-react';
import {
  MOOD_LIST, MOOD_COLORS, COPING_STRATEGIES, JOURNAL_PROMPTS,
  type MoodEntry, type MoodType, type CopingStrategy
} from '@/lib/types';

// ==================== INLINE STORE ====================
const STORAGE_KEYS = { MOOD: 'ruangkamu_mood', JOURNAL: 'ruangkamu_journal' };

function getMoodEntries(): MoodEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MOOD);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

// ==================== INLINE AI HELPERS ====================
function generateReflection(mood: MoodType, note: string): string {
  const reflections: Record<MoodType, string[]> = {
    senang: [
      'It\'s beautiful that you\'re feeling happy today. Take a moment to truly savor this feeling — what specifically brought you joy? Holding onto these positive moments helps build emotional resilience.',
      'Your happiness is contagious. Notice what contributed to this feeling and consider how you might create more of these moments intentionally.',
    ],
    biasa: [
      'A neutral day is perfectly valid. Not every day needs to be extraordinary — sometimes calm steadiness is exactly what you need. How does this "okay" feel in your body?',
      'Being okay is enough. In a world that pushes for constant highs, a steady day is a form of peace.',
    ],
    capek: [
      'Your tiredness is real and valid. Your body and mind are telling you something important — that rest isn\'t optional, it\'s necessary. What\'s one thing you can let go of today?',
      'Exhaustion often comes from carrying too much. Remember: you don\'t have to earn rest. It\'s a basic need.',
    ],
    cemas: [
      'Anxiety can feel overwhelming, but remember — the feeling is not the truth. Try to separate what\'s real from what your worry is creating. You\'ve navigated difficult times before.',
      'Your anxiety is trying to protect you, even when it feels like too much. Acknowledge it, then gently ask: what do I actually need right now?',
    ],
    sedih: [
      'It\'s okay to sit with sadness. You don\'t have to fix it or rush through it. Sometimes the bravest thing is simply allowing yourself to feel. What would comfort look like right now?',
      'Sadness often arrives when something matters deeply to us. Honor what you\'re feeling — it speaks to your depth and humanity.',
    ],
    marah: [
      'Anger often signals that a boundary has been crossed or a need is unmet. Before reacting, pause and ask yourself: what am I really feeling beneath the anger?',
      'Your anger is information, not a character flaw. Take space to process it. What would you say to a friend feeling this way?',
    ],
    kosong: [
      'Feeling empty can be unsettling. Know that it\'s a valid state — sometimes our minds need a pause before the next chapter. Be gentle with yourself during this time.',
      'Emptiness doesn\'t mean something is wrong with you. Sometimes it\'s a sign your mind is processing something deep. What\'s one small thing that might bring you a sense of grounding?',
    ],
  };
  const options = reflections[mood] || reflections.biasa;
  let base = options[Math.floor(Math.random() * options.length)];
  if (note && note.length > 10) {
    base += '\n\nBased on what you shared, it sounds like there\'s a lot on your mind. Writing about it is a powerful step toward understanding yourself better.';
  }
  return base;
}

function generateAffirmation(mood: MoodType): string {
  const affirmations: Record<MoodType, string[]> = {
    senang: ['Your joy matters and deserves space.', 'Happiness looks beautiful on you.', 'You are allowed to enjoy this moment fully.'],
    biasa: ['Being okay is more than enough.', 'Not every day needs to sparkle — steady is strong.', 'You are doing better than you think.'],
    capek: ['Rest is productive. You deserve it.', 'Your worth isn\'t measured by your output.', 'It\'s okay to slow down.'],
    cemas: ['This feeling will pass. You are safe.', 'You have survived every difficult moment so far.', 'Breathe. You are doing your best.'],
    sedih: ['It\'s okay to not be okay.', 'Your feelings are valid and they matter.', 'Sadness is not weakness — it\'s depth.'],
    marah: ['Your anger is telling you something important.', 'You can feel angry and still be a good person.', 'Take space. You deserve peace.'],
    kosong: ['Even in emptiness, you exist beautifully.', 'This too shall pass. Be patient with yourself.', 'Numbness is not nothing — it\'s protection.'],
  };
  const options = affirmations[mood] || affirmations.biasa;
  return options[Math.floor(Math.random() * options.length)];
}

// ==================== ICON MAP ====================
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wind, Anchor, Circle, PenLine, Music, Phone, FileX, Timer, Search,
  Moon, Eye, List, Droplets, Tag, Scan, Heart,
};


// ==================== BREATHING EXERCISE ====================
function BreathingExercise() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef(phase);
  const countdownRef = useRef(countdown);

  phaseRef.current = phase;
  countdownRef.current = countdown;

  const PHASES = { inhale: 4, hold: 7, exhale: 8 };

  const stop = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(() => {
    stop();
    setPhase('inhale');
    setCountdown(4);
    setTotalSeconds(0);
  }, [stop]);

  const start = useCallback(() => {
    setRunning(true);
    setPhase('inhale');
    setCountdown(PHASES.inhale);
    intervalRef.current = setInterval(() => {
      setTotalSeconds(s => s + 1);
      setCountdown(prev => {
        if (prev <= 1) {
          const currentPhase = phaseRef.current;
          if (currentPhase === 'inhale') { setPhase('hold'); return PHASES.hold; }
          if (currentPhase === 'hold') { setPhase('exhale'); return PHASES.exhale; }
          setPhase('inhale'); return PHASES.inhale;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const phaseLabel = phase === 'inhale' ? 'Breathe In' : phase === 'hold' ? 'Hold' : 'Breathe Out';
  const phaseColors = { inhale: '#8B7EC8', hold: '#6B9BD2', exhale: '#7DA87B' };
  const ringScale = phase === 'inhale' ? 1.15 : phase === 'hold' ? 1.15 : 0.85;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  return (
    <div className="glass-card rounded-2xl p-8">
      <h3 className="text-lg font-semibold text-[#0a0a0a] mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
        <Wind className="w-5 h-5 text-[#0a0a0a]" />Breathing Exercise
      </h3>
      <div className="flex flex-col items-center">
        {/* Circles */}
        <div className="relative w-52 h-52 flex items-center justify-center mb-8">
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{ scale: running ? ringScale : 1, opacity: running ? 0.3 + (i * 0.2) : 0.15 }}
              transition={{ duration: phase === 'inhale' ? 4 : phase === 'hold' ? 0.3 : 8, ease: 'easeInOut' }}
              className="absolute rounded-full border-2"
              style={{
                width: `${208 - i * 36}px`, height: `${208 - i * 36}px`,
                borderColor: phaseColors[phase],
                background: `radial-gradient(circle, ${phaseColors[phase]}10 0%, transparent 70%)`,
              }}
            />
          ))}
          <div className="relative z-10 text-center">
            <motion.p key={phase} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="text-lg font-semibold" style={{ color: phaseColors[phase] }}>
              {running ? phaseLabel : 'Ready'}
            </motion.p>
            <p className="text-3xl font-bold text-[#0a0a0a] mt-1">{running ? countdown : '—'}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-4">
          {!running ? (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={start}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0a0a0a] text-white font-medium text-sm hover:bg-[#1a1a1a] transition-colors">
              <Play className="w-4 h-4" />Start
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={stop}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-black/[0.10] text-[#0a0a0a] font-medium text-sm hover:bg-black/4 transition-colors">
              <Pause className="w-4 h-4" />Pause
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/4 text-[#9a9a9a] text-sm hover:text-[#0a0a0a] transition-colors">
            <RotateCcw className="w-4 h-4" />Reset
          </motion.button>
        </div>
        <p className="text-xs text-[#9a9a9a]">Session: {mins}:{secs.toString().padStart(2, '0')}</p>
      </div>
    </div>
  );
}

// ==================== GROUNDING EXERCISE ====================
function GroundingExercise() {
  const steps = [
    { count: 5, sense: 'see', label: '5 things you can see', icon: Eye, color: '#8B7EC8' },
    { count: 4, sense: 'touch', label: '4 things you can touch', icon: Hand, color: '#6B9BD2' },
    { count: 3, sense: 'hear', label: '3 things you can hear', icon: Ear, color: '#7DA87B' },
    { count: 2, sense: 'smell', label: '2 things you can smell', icon: Flower2, color: '#D4A0A0' },
    { count: 1, sense: 'taste', label: '1 thing you can taste', icon: Cookie, color: '#FFD93D' },
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [inputs, setInputs] = useState<string[][]>(steps.map(s => Array(s.count).fill('')));
  const [completed, setCompleted] = useState(false);

  const handleInput = (stepIdx: number, inputIdx: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[stepIdx] = [...newInputs[stepIdx]];
    newInputs[stepIdx][inputIdx] = value;
    setInputs(newInputs);
  };

  const canProceed = inputs[currentStep]?.every(v => v.trim().length > 0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else setCompleted(true);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setInputs(steps.map(s => Array(s.count).fill('')));
    setCompleted(false);
  };

  return (
    <div className="glass-card rounded-2xl p-8">
      <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
        <Anchor className="w-5 h-5 text-[#0a0a0a]" />5-4-3-2-1 Grounding
      </h3>

      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
            style={{ background: i <= currentStep || completed ? s.color : 'rgba(0,0,0,0.08)' }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {completed ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
              <PartyPopper className="w-16 h-16 text-[#FFD93D] mx-auto mb-4" />
            </motion.div>
            <h4 className="text-xl font-bold text-[#0a0a0a] mb-2">Grounding Complete!</h4>
            <p className="text-[#9a9a9a] text-sm mb-6">You&apos;re present. You&apos;re here. You&apos;re safe.</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-5 py-2 rounded-xl bg-black/4 text-sm text-[#0a0a0a] hover:bg-black/8 transition-colors">
              Start Again
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}>
            {(() => {
              const step = steps[currentStep];
              const StepIcon = step.icon;
              return (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg" style={{ background: `${step.color}20` }}>
                      <StepIcon className="w-5 h-5" style={{ color: step.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0a0a0a]">{step.label}</p>
                      <p className="text-xs text-[#9a9a9a]">Step {currentStep + 1} of {steps.length}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {inputs[currentStep].map((val, idx) => (
                      <input key={idx} value={val} onChange={e => handleInput(currentStep, idx, e.target.value)}
                        placeholder={`${step.sense} #${idx + 1}...`}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#f8f8f8] border border-black/[0.08] text-sm text-[#0a0a0a] placeholder-[#9a9a9a]/50 focus:border-black/25 transition-colors"
                      />
                    ))}
                  </div>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleNext} disabled={!canProceed}
                    className="w-full py-2.5 rounded-xl bg-[#0a0a0a] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors">
                    {currentStep === steps.length - 1 ? 'Complete' : 'Next Step'}
                  </motion.button>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== MAIN PAGE ====================
export default function ReflectionPage() {
  const [latestMood, setLatestMood] = useState<MoodEntry | null>(null);
  const [reflection, setReflection] = useState('');
  const [affirmation, setAffirmation] = useState('');
  const [copingStrategies, setCopingStrategies] = useState<CopingStrategy | null>(null);
  const [expandedStrategy, setExpandedStrategy] = useState<number | null>(null);
  const [journalPrompt, setJournalPrompt] = useState('');
  const [reflectionRevealed, setReflectionRevealed] = useState(false);

  useEffect(() => {
    const entries = getMoodEntries();
    const latest = entries[0] || null;
    setLatestMood(latest);
    if (latest) {
      setReflection(generateReflection(latest.mood, latest.note));
      setAffirmation(generateAffirmation(latest.mood));
      const relevantCoping = COPING_STRATEGIES.find(c => c.mood === latest.mood) || COPING_STRATEGIES[0];
      setCopingStrategies(relevantCoping);
    } else {
      setAffirmation(generateAffirmation('biasa'));
    }
    const shuffled = [...JOURNAL_PROMPTS].sort(() => Math.random() - 0.5);
    setJournalPrompt(shuffled[0]);
    // Start reveal
    setTimeout(() => setReflectionRevealed(true), 500);
  }, []);

  const refreshAffirmation = () => {
    const mood = latestMood?.mood || 'biasa';
    setAffirmation(generateAffirmation(mood));
  };

  const moodInfo = latestMood ? MOOD_LIST.find(m => m.type === latestMood.mood) : null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-14 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-black/5">
                <Brain className="w-6 h-6 text-[#0a0a0a]" />
              </div>
              <h1 className="text-3xl font-bold text-[#0a0a0a]" style={{ fontFamily: 'var(--font-heading)' }}>Reflection & Coping</h1>
            </div>
            <p className="text-[#9a9a9a] ml-14">Tools to help you process, breathe, and find peace.</p>
          </motion.div>

          <div className="space-y-8">
            {/* AI Reflection */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-8 border-l-4 border-[#0a0a0a]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#0a0a0a]" />
                <h3 className="text-lg font-semibold text-[#0a0a0a]" style={{ fontFamily: 'var(--font-heading)' }}>AI Reflection</h3>
                {moodInfo && (
                  <span className="ml-auto text-sm px-3 py-1 rounded-full border"
                    style={{ color: MOOD_COLORS[moodInfo.type as MoodType], borderColor: `${MOOD_COLORS[moodInfo.type as MoodType]}40`, backgroundColor: `${MOOD_COLORS[moodInfo.type as MoodType]}15` }}>
                    {moodInfo.emoji} {moodInfo.label}
                  </span>
                )}
              </div>
              {latestMood ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: reflectionRevealed ? 1 : 0 }} transition={{ duration: 1.5 }}>
                  {reflection.split('\n\n').map((paragraph, i) => (
                    <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.4 }}
                      className="text-[#0a0a0a]/80 leading-relaxed mb-3 text-sm">
                      {paragraph}
                    </motion.p>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[#9a9a9a] mb-4">No mood data yet. Do a check-in to receive your personalized reflection.</p>
                  <Link href="/checkin">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="px-5 py-2 rounded-xl bg-[#0a0a0a] text-white text-sm font-medium hover:bg-[#1a1a1a] transition-colors">
                      Check In Now
                    </motion.button>
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Affirmation */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-black/[0.02] via-black/[0.01] to-black/[0.02]" />
              <div className="relative z-10">
                <p className="text-xs text-[#9a9a9a] uppercase tracking-widest mb-4">Daily Affirmation</p>
                <motion.p key={affirmation} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-2xl md:text-3xl font-light leading-relaxed gradient-text-warm mb-6"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                  &ldquo;{affirmation}&rdquo;
                </motion.p>
                <motion.button whileHover={{ scale: 1.05, rotate: 180 }} whileTap={{ scale: 0.9 }}
                  onClick={refreshAffirmation}
                  className="p-2 rounded-full bg-black/4 text-[#9a9a9a] hover:text-[#0a0a0a] hover:bg-black/8 transition-all">
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>

            {/* Coping Recommendations */}
            {copingStrategies && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Heart className="w-5 h-5 text-[#888888]" />{copingStrategies.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {copingStrategies.strategies.map((strategy, i) => {
                    const IconComp = iconMap[strategy.icon] || Heart;
                    const isExpanded = expandedStrategy === i;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        whileHover={{ y: -2 }}
                        className="glass-card rounded-xl p-5 cursor-pointer transition-all hover:border-black/15"
                        onClick={() => setExpandedStrategy(isExpanded ? null : i)}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-black/5 shrink-0">
                            <IconComp className="w-5 h-5 text-[#0a0a0a]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-[#0a0a0a]">{strategy.name}</h4>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-[#9a9a9a] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#9a9a9a] shrink-0" />}
                            </div>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                   className="text-xs text-[#9a9a9a] leading-relaxed mt-2 overflow-hidden">
                                  {strategy.description}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Breathing + Grounding Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <BreathingExercise />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <GroundingExercise />
              </motion.div>
            </div>

            {/* Journal Prompt */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="glass-card rounded-2xl p-8 text-center">
              <PenLine className="w-8 h-8 text-[#555555] mx-auto mb-4" />
              <p className="text-xs text-[#9a9a9a] uppercase tracking-widest mb-3">Journaling Prompt</p>
              <p className="text-lg text-[#0a0a0a] mb-6 italic" style={{ fontFamily: 'var(--font-heading)' }}>
                &ldquo;{journalPrompt}&rdquo;
              </p>
              <Link href="/journal">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0a0a0a] text-white font-medium text-sm hover:bg-[#1a1a1a] transition-colors">
                  <PenLine className="w-4 h-4" />Write About This
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
