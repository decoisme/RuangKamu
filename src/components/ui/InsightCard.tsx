"use client";

import { motion } from "framer-motion";
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  Heart,
  Shield,
  Brain,
  Sparkles,
  Eye,
  type LucideIcon,
} from "lucide-react";
import type { MoodInsight } from "@/lib/types";

interface InsightCardProps {
  insight: MoodInsight;
}

const TYPE_STYLES: Record<
  MoodInsight["type"],
  { borderColor: string; bgColor: string; iconColor: string }
> = {
  info: {
    borderColor: "#6B9BD2",
    bgColor: "rgba(107, 155, 210, 0.08)",
    iconColor: "#6B9BD2",
  },
  warning: {
    borderColor: "#FFB347",
    bgColor: "rgba(255, 179, 71, 0.08)",
    iconColor: "#FFB347",
  },
  positive: {
    borderColor: "#6BCB77",
    bgColor: "rgba(107, 203, 119, 0.08)",
    iconColor: "#6BCB77",
  },
  suggestion: {
    borderColor: "#8B7EC8",
    bgColor: "rgba(139, 126, 200, 0.08)",
    iconColor: "#A89BD9",
  },
};

const ICON_MAP: Record<string, LucideIcon> = {
  Info,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  Heart,
  Shield,
  Brain,
  Sparkles,
  Eye,
};

const DEFAULT_TYPE_ICONS: Record<MoodInsight["type"], LucideIcon> = {
  info: Info,
  warning: AlertTriangle,
  positive: CheckCircle2,
  suggestion: Lightbulb,
};

export function InsightCard({ insight }: InsightCardProps) {
  const style = TYPE_STYLES[insight.type];
  const Icon =
    ICON_MAP[insight.icon] || DEFAULT_TYPE_ICONS[insight.type] || Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative glass-card rounded-2xl overflow-hidden group cursor-default"
    >
      {/* Left accent border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: style.borderColor }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 0% 50%, ${style.bgColor} 0%, transparent 60%)`,
        }}
      />

      <div className="relative flex items-start gap-4 p-5 pl-6">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
          style={{
            backgroundColor: `${style.borderColor}15`,
            border: `1px solid ${style.borderColor}25`,
          }}
        >
          <Icon size={20} style={{ color: style.iconColor }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-[#0a0a0a] mb-1">
            {insight.title}
          </h4>
          <p className="text-sm text-[#9a9a9a] leading-relaxed">
            {insight.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default InsightCard;
