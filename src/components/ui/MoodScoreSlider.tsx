"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface MoodScoreSliderProps {
  value: number;
  onChange: (score: number) => void;
}

function getScoreColor(score: number): string {
  if (score <= 3) return "#FF6B6B";
  if (score <= 5) return "#FFB347";
  if (score <= 7) return "#FFD93D";
  return "#6BCB77";
}

function getScoreLabel(score: number): string {
  if (score <= 2) return "Terrible";
  if (score <= 4) return "Not Great";
  if (score <= 6) return "Okay";
  if (score <= 8) return "Good";
  return "Amazing";
}

function getScoreEmoji(score: number): string {
  if (score <= 2) return "😞";
  if (score <= 4) return "😕";
  if (score <= 6) return "😐";
  if (score <= 8) return "🙂";
  return "😄";
}

export function MoodScoreSlider({ value, onChange }: MoodScoreSliderProps) {
  const color = useMemo(() => getScoreColor(value), [value]);
  const label = useMemo(() => getScoreLabel(value), [value]);
  const emoji = useMemo(() => getScoreEmoji(value), [value]);
  const percentage = ((value - 1) / 9) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >
      {/* Score Display */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="flex items-center gap-3"
        >
          <span className="text-4xl">{emoji}</span>
          <div className="text-center">
            <motion.span
              className="text-5xl font-bold font-heading"
              style={{ color }}
              animate={{ color }}
              transition={{ duration: 0.3 }}
            >
              {value}
            </motion.span>
            <span className="text-lg text-[#94A3B8] ml-1">/10</span>
          </div>
        </motion.div>
        <motion.p
          key={label}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium"
          style={{ color }}
        >
          {label}
        </motion.p>
      </div>

      {/* Slider Container */}
      <div className="relative px-1">
        {/* Track Background */}
        <div className="relative h-3 rounded-full bg-[#1a1a2e] overflow-hidden border border-white/5">
          {/* Filled Track */}
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            style={{
              background: `linear-gradient(90deg, #FF6B6B 0%, #FFB347 30%, #FFD93D 60%, #6BCB77 100%)`,
            }}
          />

          {/* Glow on track */}
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full blur-sm opacity-50"
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            style={{
              background: `linear-gradient(90deg, #FF6B6B 0%, #FFB347 30%, #FFD93D 60%, #6BCB77 100%)`,
            }}
          />
        </div>

        {/* Native Range Input (invisible but interactive) */}
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer z-10"
          style={{ top: "0" }}
        />

        {/* Custom Thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-20"
          animate={{ left: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          style={{ marginLeft: "-14px" }}
        >
          <motion.div
            className="w-7 h-7 rounded-full border-[3px] border-white shadow-lg"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 16px ${color}60, 0 0 32px ${color}30`,
            }}
            animate={{
              backgroundColor: color,
              boxShadow: `0 0 16px ${color}60, 0 0 32px ${color}30`,
            }}
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Step dots */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-[2px] pointer-events-none">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i + 1 <= value ? "bg-white/40" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-[#94A3B8]/60 px-1">
        <span>😞 Terrible</span>
        <span>Amazing 😄</span>
      </div>
    </motion.div>
  );
}

export default MoodScoreSlider;
