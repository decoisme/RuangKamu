"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Award, Star, Zap, Heart, Sparkles, Target } from "lucide-react";

interface BadgeData {
  id: string;
  icon: typeof Award;
  title: string;
  message: string;
  color: string;
  emoji: string;
}

const BADGES: BadgeData[] = [
  {
    id: "first-checkin",
    icon: Star,
    title: "First Step",
    message: "You took the first step. That's courage! :)",
    color: "#FFD93D",
    emoji: "🌟"
  },
  {
    id: "3-day-streak",
    icon: Zap,
    title: "Building Momentum",
    message: "3 days in a row! You're creating a healthy habit <3",
    color: "#7DA87B",
    emoji: "⚡"
  },
  {
    id: "7-day-streak",
    icon: Target,
    title: "Week Warrior",
    message: "A full week! Your commitment is inspiring :)",
    color: "#8B7EC8",
    emoji: "🎯"
  },
  {
    id: "honest-sharing",
    icon: Heart,
    title: "Authentic Self",
    message: "Thank you for being honest. That takes strength <3",
    color: "#FF6B9D",
    emoji: "💖"
  },
  {
    id: "night-owl",
    icon: Sparkles,
    title: "Night Reflection",
    message: "Late night thoughts? We're here for you :)",
    color: "#BDB2FF",
    emoji: "🌙"
  }
];

interface EncouragementBadgeProps {
  badgeId: string;
  show: boolean;
  onClose?: () => void;
}

export function EncouragementBadge({ badgeId, show, onClose }: EncouragementBadgeProps) {
  const badge = BADGES.find(b => b.id === badgeId);
  
  if (!badge) return null;

  const Icon = badge.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                `0 10px 30px ${badge.color}20`,
                `0 10px 40px ${badge.color}30`,
                `0 10px 30px ${badge.color}20`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="glass-strong rounded-2xl p-5 border-2"
            style={{ borderColor: `${badge.color}40` }}
          >
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ 
                  background: `${badge.color}20`,
                  border: `2px solid ${badge.color}40`
                }}
              >
                <span className="text-2xl">{badge.emoji}</span>
              </motion.div>
              
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#0a0a0a] mb-1 flex items-center gap-2">
                  {badge.title}
                  <Icon className="w-4 h-4" style={{ color: badge.color }} />
                </h3>
                <p className="text-xs text-[#555555] leading-relaxed">
                  {badge.message}
                </p>
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  className="text-[#9a9a9a] hover:text-[#0a0a0a] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Minimal encouragement text that appears randomly
const ENCOURAGEMENTS = [
  "You're doing great :)",
  "We're proud of you <3",
  "One step at a time :)",
  "You matter <3",
  "Keep going, friend :)",
  "You're not alone <3",
  "This is brave :)",
  "You've got this <3"
];

export function RandomEncouragement({ trigger }: { trigger: boolean }) {
  if (!trigger) return null;
  
  const message = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="text-center"
    >
      <motion.p
        animate={{ 
          opacity: [0.6, 1, 0.6],
          scale: [1, 1.02, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-sm text-[#555555] italic"
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
