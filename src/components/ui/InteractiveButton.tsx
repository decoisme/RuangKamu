"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { SparkleEffect } from "./FloatingEmoji";

interface InteractiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  emoji?: string;
  encouragement?: string;
  disabled?: boolean;
  className?: string;
}

export function InteractiveButton({
  children,
  onClick,
  variant = "primary",
  emoji,
  encouragement,
  disabled = false,
  className = ""
}: InteractiveButtonProps) {
  const [showSparkle, setShowSparkle] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 600);
    
    if (encouragement) {
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 2000);
    }
    
    onClick?.();
  };

  const baseClasses = "relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] shadow-lg shadow-black/10",
    secondary: "border border-black/10 text-[#0a0a0a] hover:bg-black/4",
    ghost: "text-[#555555] hover:text-[#0a0a0a] hover:bg-black/4"
  };

  return (
    <div className="relative inline-block">
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        onClick={handleClick}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        <span className="relative z-10 flex items-center gap-2">
          {emoji && <span>{emoji}</span>}
          {children}
        </span>
        
        {showSparkle && <SparkleEffect trigger={showSparkle} />}
      </motion.button>

      {/* Floating encouragement */}
      {showEncouragement && encouragement && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: -40 }}
          transition={{ duration: 2 }}
          className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none whitespace-nowrap"
        >
          <div className="px-3 py-1.5 rounded-lg bg-[#0a0a0a] text-white text-xs shadow-lg">
            {encouragement}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Pulse button for important actions
export function PulseButton({
  children,
  onClick,
  pulseColor = "#8B7EC8",
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  pulseColor?: string;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative px-6 py-3 rounded-xl font-medium text-sm cursor-pointer ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          boxShadow: [
            `0 0 0 0 ${pulseColor}40`,
            `0 0 0 10px ${pulseColor}00`,
            `0 0 0 0 ${pulseColor}40`
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
