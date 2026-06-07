'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  SmilePlus,
  BookOpen,
  BarChart3,
  Brain,
  Shield,
  UserCircle,
  LayoutDashboard,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  SkipForward,
  GraduationCap,
  Briefcase,
  Home,
  Users,
  Heart,
  Wallet,
  Activity,
  Compass,
  HelpCircle,
  PenLine,
} from 'lucide-react';
import type { MoodEntry, MoodType, TriggerType } from '@/lib/types';
import { MOOD_LIST, MOOD_COLORS, TRIGGER_LIST } from '@/lib/types';

// ===== INLINE STORE HELPERS =====
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getMoodEntries(): MoodEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('ruangkamu_moods');
  return data ? JSON.parse(data) : [];
}

function saveMoodEntry(entry: MoodEntry) {
  const entries = getMoodEntries();
  // Replace if same date, otherwise push
  const idx = entries.findIndex((e) => e.date === entry.date);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  if (typeof window !== 'undefined') {
    localStorage.setItem('ruangkamu_moods', JSON.stringify(entries));
  }
}

// ===== TRIGGER ICON MAP =====
const triggerIconMap: Record<string, typeof GraduationCap> = {
  GraduationCap,
  Briefcase,
  Home,
  Users,
  Heart,
  Wallet,
  Activity,
  Compass,
  HelpCircle,
};

// ===== INLINE NAVBAR =====
const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/checkin', label: 'Check-in', icon: SmilePlus },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/reflection', label: 'Reflection', icon: Brain },
  { href: '/vault', label: 'Vault', icon: Shield },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

function CheckinNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 px-4 py-3">
      <div className="mx-auto max-w-6xl">
        <div className="glass-strong rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B7EC8] to-[#6B9BD2] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg text-[#E2E8F0] hidden sm:inline">
              Ruang<span className="text-[#8B7EC8]">Kamu</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#8B7EC8]/20 text-[#8B7EC8]'
                      : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/5'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-[#94A3B8] hover:text-[#E2E8F0] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="lg:hidden mt-2 glass-strong rounded-2xl px-4 py-3 overflow-hidden"
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#8B7EC8]/20 text-[#8B7EC8]'
                        : 'text-[#94A3B8] hover:text-[#E2E8F0]'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

// ===== CONFETTI PARTICLE =====
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const x = Math.random() * 300 - 150;
  const y = -(Math.random() * 200 + 100);
  const rotation = Math.random() * 720 - 360;
  const size = 4 + Math.random() * 8;

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        x: [0, x * 0.5, x],
        y: [0, y, y + 100],
        rotate: [0, rotation / 2, rotation],
        scale: [0, 1, 0.5],
      }}
      transition={{ duration: 2, delay, ease: 'easeOut' }}
      className="absolute rounded-sm"
      style={{
        width: size,
        height: size,
        background: color,
        left: '50%',
        top: '50%',
      }}
    />
  );
}

// ===== STEP INDICATOR =====
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progress = ((currentStep) / totalSteps) * 100;

  return (
    <div className="mb-8">
      {/* Step dots */}
      <div className="flex items-center justify-center gap-3 mb-3">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: i === currentStep ? 1.2 : 1,
                backgroundColor: i <= currentStep ? '#0a0a0a' : 'rgba(0,0,0,0.1)',
              }}
              className="w-3 h-3 rounded-full transition-colors"
            />
            {i < totalSteps - 1 && (
              <div
                className="w-8 h-0.5 rounded-full transition-colors"
                style={{
                  background: i < currentStep ? '#0a0a0a' : 'rgba(0,0,0,0.1)',
                }}
              />
            )}
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 rounded-full bg-black/6 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#0a0a0a]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-[#9a9a9a] text-center mt-2">
        Step {currentStep + 1} of {totalSteps}
      </p>
    </div>
  );
}

// ===== MAIN CHECK-IN PAGE =====
export default function CheckinPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const totalSteps = 5;

  // Form state
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<TriggerType[]>([]);
  const [score, setScore] = useState(5);
  const [note, setNote] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [saved, setSaved] = useState(false);

  const noteMaxLength = 300;

  const canProceed = () => {
    switch (step) {
      case 0:
        return selectedMood !== null;
      case 1:
        return true; // triggers are optional
      case 2:
        return true; // score has default
      case 3:
        return true; // note is optional
      default:
        return true;
    }
  };

  const goNext = () => {
    if (step < totalSteps - 1 && canProceed()) {
      if (step === 3) {
        // Save entry before showing confirmation
        handleSave();
      }
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSave = useCallback(() => {
    if (!selectedMood) return;
    const now = new Date();
    const entry: MoodEntry = {
      id: generateId(),
      date: now.toISOString().split('T')[0],
      mood: selectedMood,
      score,
      triggers: selectedTriggers,
      note,
      timestamp: now.toISOString(),
      createdAt: now.toISOString(),
    };
    saveMoodEntry(entry);
    setSaved(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, [selectedMood, score, selectedTriggers, note]);

  const toggleTrigger = (trigger: TriggerType) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const selectedMoodInfo = selectedMood ? MOOD_LIST.find((m) => m.type === selectedMood) : null;

  const stepVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  // Score color interpolation
  const getScoreColor = (s: number) => {
    if (s <= 3) return '#FF6B6B';
    if (s <= 5) return '#FFD93D';
    if (s <= 7) return '#6BCB77';
    return '#7DA87B';
  };

  const confettiColors = ['#8B7EC8', '#6B9BD2', '#FFD93D', '#7DA87B', '#D4A0A0', '#BDB2FF', '#FF6B6B'];

  return (
    <div className="min-h-screen bg-white pt-14">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a]">
            How are you <span className="gradient-text">feeling</span>?
          </h1>
          <p className="text-sm text-[#9a9a9a] mt-1">Be honest — this is your safe space.</p>
        </motion.div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} totalSteps={totalSteps} />

        {/* Step Content */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden min-h-[350px]">
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

          <AnimatePresence mode="wait">
            {/* STEP 0: Select Mood */}
            {step === 0 && (
              <motion.div
                key="step0"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-[#0a0a0a] mb-2">Select your mood</h2>
                <p className="text-sm text-[#9a9a9a] mb-6">What best describes how you feel right now?</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {MOOD_LIST.map((mood) => {
                    const isSelected = selectedMood === mood.type;
                    return (
                      <motion.button
                        key={mood.type}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedMood(mood.type)}
                        className="relative rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200"
                        style={{
                          background: isSelected
                            ? `${mood.color}12`
                            : 'rgba(0,0,0,0.02)',
                          border: `2px solid ${isSelected ? mood.color + '50' : 'rgba(0,0,0,0.07)'}`,
                          boxShadow: isSelected ? `0 0 20px ${mood.color}18` : 'none',
                        }}
                        animate={{
                          scale: isSelected ? 1.05 : 1,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <span className="text-3xl sm:text-4xl">{mood.emoji}</span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: isSelected ? mood.color : '#9a9a9a' }}
                        >
                          {mood.label}
                        </span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: mood.color }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 1: Select Triggers */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-[#0a0a0a] mb-2">What triggered this?</h2>
                <p className="text-sm text-[#9a9a9a] mb-6">Select all that apply (or skip if unsure)</p>

                <div className="flex flex-wrap gap-3 justify-center">
                  {TRIGGER_LIST.map((trigger) => {
                    const isSelected = selectedTriggers.includes(trigger.type);
                    const IconComponent = triggerIconMap[trigger.icon] || HelpCircle;
                    return (
                      <motion.button
                        key={trigger.type}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTrigger(trigger.type)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                        style={{
                          background: isSelected ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.02)',
                          border: `1.5px solid ${isSelected ? 'rgba(0,0,0,0.20)' : 'rgba(0,0,0,0.07)'}`,
                          color: isSelected ? '#0a0a0a' : '#9a9a9a',
                        }}
                      >
                        <IconComponent className="w-4 h-4" />
                        {trigger.label}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Mood Score */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-[#0a0a0a] mb-2">Rate your mood</h2>
                <p className="text-sm text-[#9a9a9a] mb-8">On a scale of 1 to 10, how would you rate it?</p>

                <div className="flex flex-col items-center">
                  {/* Large number display */}
                  <motion.div
                    key={score}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-7xl sm:text-8xl font-bold mb-8"
                    style={{ color: getScoreColor(score) }}
                  >
                    {score}
                  </motion.div>

                  {/* Custom range slider */}
                  <div className="w-full max-w-md px-2">
                    <div className="relative mb-3">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={score}
                        onChange={(e) => setScore(parseInt(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #FF6B6B 0%, #FFD93D 40%, #6BCB77 70%, #7DA87B 100%)`,
                          accentColor: getScoreColor(score),
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[#9a9a9a]">
                      <span>Terrible</span>
                      <span>Amazing</span>
                    </div>
                  </div>

                  {/* Score description */}
                  <motion.p
                    key={`desc-${score}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-[#9a9a9a] mt-6 text-center"
                  >
                    {score <= 2
                      ? "It's okay to not be okay. You're brave for acknowledging it."
                      : score <= 4
                      ? "Tough day? That's valid. You're still here, and that matters."
                      : score <= 6
                      ? "Not bad, not great — and that's perfectly fine."
                      : score <= 8
                      ? "Nice! Something good seems to be going your way."
                      : "You're glowing! Let's capture this good energy."}
                  </motion.p>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Quick Note */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-[#0a0a0a] mb-2">Quick note</h2>
                <p className="text-sm text-[#9a9a9a] mb-6">
                  Anything you want to remember about how you feel right now?
                </p>

                <div className="relative">
                  <textarea
                    value={note}
                    onChange={(e) => {
                      if (e.target.value.length <= noteMaxLength) setNote(e.target.value);
                    }}
                    placeholder="How are you really feeling? (optional)"
                    rows={5}
                    className="w-full rounded-2xl bg-[#f8f8f8] border border-black/[0.08] focus:border-black/25 text-[#0a0a0a] placeholder-[#9a9a9a]/60 p-5 text-sm leading-relaxed resize-none transition-colors"
                  />
                  <div className="flex justify-between items-center mt-2 px-1">
                    <p className="text-xs text-[#9a9a9a]/50">This step is optional</p>
                    <p
                      className="text-xs"
                      style={{
                        color:
                          note.length >= noteMaxLength
                            ? '#FF6B6B'
                            : note.length >= noteMaxLength * 0.8
                            ? '#FFD93D'
                            : '#94A3B8',
                      }}
                    >
                      {note.length}/{noteMaxLength}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Confirmation */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center relative"
              >
                {/* Confetti */}
                {showConfetti && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <ConfettiParticle
                        key={i}
                        delay={i * 0.03}
                        color={confettiColors[i % confettiColors.length]}
                      />
                    ))}
                  </div>
                )}

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{
                    background: selectedMoodInfo ? `${selectedMoodInfo.color}15` : 'rgba(139,126,200,0.15)',
                    border: `2px solid ${selectedMoodInfo ? selectedMoodInfo.color + '40' : 'rgba(139,126,200,0.3)'}`,
                  }}
                >
                  <span className="text-4xl">{selectedMoodInfo?.emoji || '✨'}</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-[#0a0a0a] mb-2"
                >
                  Check-in complete! 🎉
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-[#9a9a9a] mb-8"
                >
                  Thank you for being honest with yourself today.
                </motion.p>

                {/* Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="rounded-2xl bg-[#f5f5f5] border border-black/[0.08] p-5 text-left mb-8 max-w-sm mx-auto"
                >
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#9a9a9a]">Mood</span>
                      <span className="text-[#0a0a0a] font-medium">
                        {selectedMoodInfo?.emoji} {selectedMoodInfo?.label}
                      </span>
                    </div>
                    <div className="w-full h-px bg-black/6" />
                    <div className="flex justify-between">
                      <span className="text-[#9a9a9a]">Score</span>
                      <span style={{ color: getScoreColor(score) }} className="font-medium">
                        {score}/10
                      </span>
                    </div>
                    <div className="w-full h-px bg-black/6" />
                    <div className="flex justify-between">
                      <span className="text-[#9a9a9a]">Triggers</span>
                      <span className="text-[#0a0a0a] text-right max-w-[60%]">
                        {selectedTriggers.length > 0
                          ? selectedTriggers
                              .map((t) => TRIGGER_LIST.find((tr) => tr.type === t)?.label)
                              .join(', ')
                          : 'None selected'}
                      </span>
                    </div>
                    {note && (
                      <>
                        <div className="w-full h-px bg-black/6" />
                        <div>
                          <span className="text-[#9a9a9a] block mb-1">Note</span>
                          <span className="text-[#0a0a0a] text-xs leading-relaxed">&ldquo;{note}&rdquo;</span>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0a0a0a] text-white font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Dashboard
                    </motion.button>
                  </Link>
                  <Link href="/journal">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl border border-black/[0.10] text-[#0a0a0a] font-medium flex items-center justify-center gap-2 hover:bg-black/4 transition-colors cursor-pointer"
                    >
                      <PenLine className="w-4 h-4" />
                      Write in Journal
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {step < 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mt-6"
          >
            <button
              onClick={goBack}
              disabled={step === 0}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                step === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'border border-black/[0.08] text-[#9a9a9a] hover:text-[#0a0a0a] hover:bg-black/4'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              {/* Skip button for optional steps */}
              {(step === 1 || step === 3) && (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-[#9a9a9a] hover:text-[#0a0a0a] transition-colors cursor-pointer"
                >
                  Skip
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0a0a0a] text-white text-sm font-semibold shadow-lg shadow-black/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-[#1a1a1a] transition-colors"
              >
                {step === 3 ? 'Submit' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
