"use client";

import { motion, type Variants } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  Home,
  Users,
  Heart,
  Wallet,
  Activity,
  Compass,
  HelpCircle,
} from "lucide-react";
import { TRIGGER_LIST } from "@/lib/types";
import type { TriggerType } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

interface TriggerSelectorProps {
  selected: TriggerType[];
  onToggle: (trigger: TriggerType) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 250, damping: 18 },
  },
};

export function TriggerSelector({ selected, onToggle }: TriggerSelectorProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap gap-2.5"
    >
      {TRIGGER_LIST.map((trigger) => {
        const isSelected = selected.includes(trigger.type);
        const Icon = ICON_MAP[trigger.icon];

        return (
          <motion.button
            key={trigger.type}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggle(trigger.type)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
              isSelected
                ? "bg-black/5 text-[#0a0a0a] border-black/20 shadow-sm"
                : "glass text-[#9a9a9a] hover:text-[#0a0a0a] hover:bg-black/5"
            }`}
            style={{
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: isSelected ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 0, 0, 0.07)",
            }}
          >
            {/* Inner glow for selected state */}
            {isSelected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B7EC8]/10 to-[#6B9BD2]/10"
              />
            )}

            {Icon && (
              <Icon
                size={16}
                className={`relative z-10 transition-colors duration-200 ${
                  isSelected ? "text-[#A89BD9]" : ""
                }`}
              />
            )}

            <span className="relative z-10">{trigger.label}</span>

            {/* Selected indicator dot */}
            <motion.div
              initial={false}
              animate={{
                scale: isSelected ? 1 : 0,
                opacity: isSelected ? 1 : 0,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative z-10 w-1.5 h-1.5 rounded-full bg-[#A89BD9]"
            />
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export default TriggerSelector;
