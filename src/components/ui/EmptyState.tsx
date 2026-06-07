"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const FLOATING_SHAPES = [
  {
    type: "circle",
    size: 60,
    color: "#8B7EC8",
    x: -40,
    y: -30,
    delay: 0,
    duration: 6,
    blur: 0,
  },
  {
    type: "square",
    size: 40,
    color: "#6B9BD2",
    x: 50,
    y: -50,
    delay: 1,
    duration: 7,
    blur: 1,
  },
  {
    type: "circle",
    size: 24,
    color: "#D4A0A0",
    x: -60,
    y: 40,
    delay: 0.5,
    duration: 5,
    blur: 0,
  },
  {
    type: "diamond",
    size: 32,
    color: "#7DA87B",
    x: 65,
    y: 30,
    delay: 2,
    duration: 8,
    blur: 1,
  },
  {
    type: "circle",
    size: 16,
    color: "#FFD93D",
    x: 20,
    y: -60,
    delay: 1.5,
    duration: 6,
    blur: 0,
  },
  {
    type: "square",
    size: 20,
    color: "#A89BD9",
    x: -30,
    y: 60,
    delay: 0.8,
    duration: 7,
    blur: 2,
  },
  {
    type: "circle",
    size: 48,
    color: "#6B9BD2",
    x: 0,
    y: 0,
    delay: 0.3,
    duration: 9,
    blur: 2,
  },
];

function Shape({
  type,
  size,
  color,
}: {
  type: string;
  size: number;
  color: string;
}) {
  const baseStyle = {
    width: size,
    height: size,
    backgroundColor: `${color}25`,
    border: `1.5px solid ${color}40`,
  };

  if (type === "circle") {
    return <div style={{ ...baseStyle, borderRadius: "50%" }} />;
  }

  if (type === "diamond") {
    return <div style={{ ...baseStyle, borderRadius: "4px", transform: "rotate(45deg)" }} />;
  }

  // square
  return <div style={{ ...baseStyle, borderRadius: "8px" }} />;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      {/* Floating Shapes Illustration */}
      <div className="relative w-48 h-48 mb-8" style={{ perspective: "600px" }}>
        {/* Background glow */}
        <div className="absolute inset-0 rounded-full bg-[#8B7EC8]/10 blur-3xl" />

        {/* Center orb */}
        <motion.div
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-2xl glass-card flex items-center justify-center"
          style={{
            boxShadow: "0 8px 40px rgba(139, 126, 200, 0.2)",
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B7EC8]/30 to-[#6B9BD2]/30 border border-white/10 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#8B7EC8] to-[#6B9BD2] opacity-60" />
          </div>
        </motion.div>

        {/* Floating shapes */}
        {FLOATING_SHAPES.map((shape, i) => (
          <motion.div
            key={i}
            initial={{
              x: shape.x,
              y: shape.y,
              opacity: 0,
            }}
            animate={{
              x: shape.x,
              y: [shape.y, shape.y - 15, shape.y],
              opacity: [0.4, 0.8, 0.4],
              rotateZ: [0, shape.type === "diamond" ? 90 : 10, 0],
            }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2"
            style={{
              filter: shape.blur ? `blur(${shape.blur}px)` : undefined,
              transformStyle: "preserve-3d",
              translateZ: `${(i % 3) * -20}px`,
            }}
          >
            <Shape type={shape.type} size={shape.size} color={shape.color} />
          </motion.div>
        ))}

        {/* Orbiting ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-dashed border-white/5"
        />
      </div>

      {/* Text Content */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-heading font-semibold text-[#0a0a0a] mb-2 text-center"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-[#9a9a9a] text-center max-w-sm mb-6 leading-relaxed"
      >
        {description}
      </motion.p>

      {/* CTA Button */}
      {actionLabel && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0a0a0a] text-white text-sm font-medium hover:bg-[#1a1a1a] transition-colors"
        >
          <Plus size={18} />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

export default EmptyState;
