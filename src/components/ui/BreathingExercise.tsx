"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, RotateCcw } from "lucide-react";

type Phase = "idle" | "inhale" | "hold" | "exhale";

const PHASES: { type: Phase; label: string; duration: number }[] = [
  { type: "inhale", label: "Breathe In", duration: 4 },
  { type: "hold", label: "Hold", duration: 7 },
  { type: "exhale", label: "Breathe Out", duration: 8 },
];

const PHASE_COLORS: Record<Phase, string> = {
  idle: "#8B7EC8",
  inhale: "#6B9BD2",
  hold: "#8B7EC8",
  exhale: "#7DA87B",
};

export function BreathingExercise() {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [phaseTime, setPhaseTime] = useState(0);
  const [phaseDuration, setPhaseDuration] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [cycles, setCycles] = useState(0);
  const phaseIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPhase = useCallback((index: number) => {
    const p = PHASES[index % PHASES.length];
    phaseIndexRef.current = index;
    setPhase(p.type);
    setPhaseDuration(p.duration);
    setPhaseTime(p.duration);
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
    setSessionTime(0);
    setCycles(0);
    startPhase(0);
  }, [startPhase]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setPhase("idle");
    setPhaseTime(0);
    setPhaseDuration(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setPhaseTime((prev) => {
        if (prev <= 1) {
          const nextIndex = phaseIndexRef.current + 1;
          // Track completed cycles (each cycle = 3 phases)
          if (nextIndex % 3 === 0) {
            setCycles((c) => c + 1);
          }
          startPhase(nextIndex);
          return PHASES[nextIndex % PHASES.length].duration;
        }
        return prev - 1;
      });
      setSessionTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, startPhase]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const circleScale = phase === "inhale" ? 1.3 : phase === "exhale" ? 0.85 : 1.1;
  const currentColor = PHASE_COLORS[phase];
  const progress = phaseDuration > 0 ? (phaseDuration - phaseTime) / phaseDuration : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center gap-8 py-8"
    >
      {/* Breathing Circle */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* Outermost glow */}
        <motion.div
          animate={{
            scale: isRunning ? circleScale * 1.15 : 1,
            opacity: isRunning ? 0.15 : 0.05,
          }}
          transition={{ duration: phase === "inhale" ? 4 : phase === "exhale" ? 8 : 0.5, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${currentColor}30 0%, transparent 70%)`,
          }}
        />

        {/* Outer circle */}
        <motion.div
          animate={{
            scale: isRunning ? circleScale : 1,
            opacity: isRunning ? 0.3 : 0.1,
          }}
          transition={{
            duration: phase === "inhale" ? 4 : phase === "exhale" ? 8 : 0.5,
            ease: "easeInOut",
            delay: 0.15,
          }}
          className="absolute inset-4 rounded-full border"
          style={{
            borderColor: `${currentColor}30`,
            background: `radial-gradient(circle, ${currentColor}08 0%, transparent 70%)`,
          }}
        />

        {/* Middle circle */}
        <motion.div
          animate={{
            scale: isRunning ? circleScale : 1,
            opacity: isRunning ? 0.5 : 0.15,
          }}
          transition={{
            duration: phase === "inhale" ? 4 : phase === "exhale" ? 8 : 0.5,
            ease: "easeInOut",
            delay: 0.08,
          }}
          className="absolute inset-10 rounded-full border"
          style={{
            borderColor: `${currentColor}40`,
            background: `radial-gradient(circle, ${currentColor}12 0%, transparent 70%)`,
          }}
        />

        {/* Inner circle (main) */}
        <motion.div
          animate={{
            scale: isRunning ? circleScale : 1,
          }}
          transition={{
            duration: phase === "inhale" ? 4 : phase === "exhale" ? 8 : 0.5,
            ease: "easeInOut",
          }}
          className="absolute inset-16 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${currentColor}25 0%, ${currentColor}10 100%)`,
            border: `2px solid ${currentColor}40`,
            boxShadow: `0 0 40px ${currentColor}20, inset 0 0 40px ${currentColor}10`,
          }}
        >
          {/* Center content */}
          <div className="flex flex-col items-center gap-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={phaseTime}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-bold font-heading text-[#0a0a0a]"
              >
                {isRunning ? phaseTime : "•"}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Progress ring */}
        {isRunning && (
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={`${currentColor}15`}
              strokeWidth="1.5"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={currentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46}`}
              animate={{
                strokeDashoffset: 2 * Math.PI * 46 * (1 - progress),
              }}
              transition={{ duration: 0.5, ease: "linear" }}
              style={{
                filter: `drop-shadow(0 0 6px ${currentColor}60)`,
              }}
            />
          </svg>
        )}
      </div>

      {/* Phase Label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p
            className="text-xl font-heading font-semibold"
            style={{ color: isRunning ? currentColor : "#9a9a9a" }}
          >
            {isRunning
              ? PHASES.find((p) => p.type === phase)?.label || ""
              : "Ready to begin?"}
          </p>
          {!isRunning && (
            <p className="text-sm text-[#9a9a9a]/60 mt-1">
              4-7-8 breathing technique
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Session Stats */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-6 text-sm text-[#9a9a9a]"
        >
          <div className="flex flex-col items-center">
            <span className="text-xs text-[#9a9a9a]/60">Duration</span>
            <span className="font-medium text-[#0a0a0a] font-heading">
              {formatTime(sessionTime)}
            </span>
          </div>
          <div className="w-px h-8 bg-black/8" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-[#9a9a9a]/60">Cycles</span>
            <span className="font-medium text-[#0a0a0a] font-heading">{cycles}</span>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRunning ? (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={start}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#0a0a0a] text-white font-medium hover:bg-[#1a1a1a] transition-colors"
          >
            <Play size={18} fill="currentColor" />
            Start Breathing
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stop}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-black/[0.10] text-[#0a0a0a] hover:bg-black/5 transition-colors font-medium"
            >
              <Square size={16} fill="currentColor" />
              Stop
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                stop();
                setTimeout(start, 100);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-black/[0.10] text-[#9a9a9a] hover:bg-black/5 transition-colors font-medium"
            >
              <RotateCcw size={16} />
              Reset
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default BreathingExercise;
