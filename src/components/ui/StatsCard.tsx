"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "stable";
}

const TREND_CONFIG = {
  up: {
    icon: TrendingUp,
    color: "#6BCB77",
    bg: "rgba(107, 203, 119, 0.1)",
    label: "Trending up",
  },
  down: {
    icon: TrendingDown,
    color: "#FF6B6B",
    bg: "rgba(255, 107, 107, 0.1)",
    label: "Trending down",
  },
  stable: {
    icon: Minus,
    color: "#94A3B8",
    bg: "rgba(148, 163, 184, 0.1)",
    label: "Stable",
  },
};

export function StatsCard({ icon, label, value, trend }: StatsCardProps) {
  const trendConfig = trend ? TREND_CONFIG[trend] : null;
  const TrendIcon = trendConfig?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="glass-card rounded-2xl p-5 group cursor-default"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon + Label + Value */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-3">
            {/* Icon container */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-black/5 border border-black/8 flex items-center justify-center text-[#555555] group-hover:bg-black/8 transition-colors">
              {icon}
            </div>
            <span className="text-xs font-medium text-[#9a9a9a] uppercase tracking-wider truncate">
              {label}
            </span>
          </div>

          {/* Value */}
          <motion.p
            className="text-2xl sm:text-3xl font-bold font-heading text-[#0a0a0a] ml-0.5"
            key={String(value)}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {value}
          </motion.p>
        </div>

        {/* Trend */}
        {trendConfig && TrendIcon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg"
            style={{ backgroundColor: trendConfig.bg }}
            title={trendConfig.label}
          >
            <TrendIcon size={14} style={{ color: trendConfig.color }} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default StatsCard;
