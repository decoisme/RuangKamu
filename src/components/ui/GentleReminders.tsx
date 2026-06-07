"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Moon, Sun, Smile, Heart } from "lucide-react";
import { useState, useEffect } from "react";

interface ReminderData {
  icon: typeof Coffee;
  message: string;
  emoji: string;
  timeRange: [number, number]; // hours in 24-hour format
}

const REMINDERS: ReminderData[] = [
  {
    icon: Coffee,
    message: "Remember to stay hydrated :)",
    emoji: "💧",
    timeRange: [9, 17]
  },
  {
    icon: Sun,
    message: "Good morning! How are you feeling today? <3",
    emoji: "☀️",
    timeRange: [6, 12]
  },
  {
    icon: Moon,
    message: "Getting late — rest is important too :)",
    emoji: "🌙",
    timeRange: [22, 24]
  },
  {
    icon: Moon,
    message: "Late night? We're here for you <3",
    emoji: "✨",
    timeRange: [0, 4]
  },
  {
    icon: Smile,
    message: "Take a deep breath. You're doing great <3",
    emoji: "🫂",
    timeRange: [12, 18]
  },
  {
    icon: Heart,
    message: "Be kind to yourself today :)",
    emoji: "💝",
    timeRange: [8, 20]
  }
];

export function GentleReminders() {
  const [currentReminder, setCurrentReminder] = useState<ReminderData | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      const applicable = REMINDERS.filter(r => {
        const [start, end] = r.timeRange;
        if (end < start) {
          // Spans midnight
          return hour >= start || hour < end;
        }
        return hour >= start && hour < end;
      });

      if (applicable.length > 0) {
        const selected = applicable[Math.floor(Math.random() * applicable.length)];
        setCurrentReminder(selected);
        setShow(true);
        
        // Auto-hide after 8 seconds
        setTimeout(() => setShow(false), 8000);
      }
    };

    // Check on mount and every 30 minutes
    checkTime();
    const interval = setInterval(checkTime, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!currentReminder) return null;

  const Icon = currentReminder.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed top-24 right-6 z-40 max-w-xs"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="glass-card rounded-2xl p-4 border border-black/[0.08] shadow-xl"
          >
            <button
              onClick={() => setShow(false)}
              className="absolute top-2 right-2 text-[#9a9a9a] hover:text-[#0a0a0a] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center"
              >
                <span className="text-xl">{currentReminder.emoji}</span>
              </motion.div>
              
              <div className="flex-1 pt-1">
                <p className="text-sm text-[#0a0a0a] leading-relaxed">
                  {currentReminder.message}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Breathing reminder widget
export function BreathingReminder({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div className="text-center">
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#8B7EC8]/30 to-[#6B9BD2]/30 backdrop-blur-xl"
            />
            
            <motion.p
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-white text-xl font-medium"
            >
              Breathe in... and out :)
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-white/70 text-sm mt-2"
            >
              You&apos;re doing great {'<3'}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
