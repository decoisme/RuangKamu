"use client";

import { motion, type Variants } from "framer-motion";
import { MOOD_LIST } from "@/lib/types";
import type { MoodType } from "@/lib/types";

interface MoodSelectorProps {
  selected: MoodType | null;
  onSelect: (mood: MoodType) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 15 },
  },
};

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3"
    >
      {MOOD_LIST.map((mood) => {
        const isSelected = selected === mood.type;

        return (
          <motion.button
            key={mood.type}
            variants={itemVariants}
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(mood.type)}
            className="relative group"
          >
            {/* Glow effect behind card */}
            <motion.div
              animate={{
                opacity: isSelected ? 0.4 : 0,
                scale: isSelected ? 1.1 : 0.8,
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-2xl blur-xl"
              style={{ backgroundColor: mood.color }}
            />

            {/* Card */}
            <div
              className={`relative flex flex-col items-center gap-2 py-5 px-3 rounded-2xl transition-all duration-300 border ${
                isSelected
                  ? "bg-white border-black/20 shadow-md"
                  : "bg-white border-black/[0.07] hover:border-black/15 hover:bg-[#fafafa]"
              }`}
              style={{
                borderColor: isSelected ? `${mood.color}50` : undefined,
                borderWidth: isSelected ? 2 : 1,
                boxShadow: isSelected
                  ? `0 0 24px ${mood.color}25, 0 0 48px ${mood.color}10, inset 0 1px 0 rgba(255,255,255,0.1)`
                  : undefined,
              }}
            >
              {/* Emoji */}
              <motion.span
                animate={{
                  scale: isSelected ? 1.2 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="text-3xl sm:text-4xl"
              >
                {mood.emoji}
              </motion.span>

              {/* Label */}
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  isSelected ? "text-[#0a0a0a] font-semibold" : "text-[#9a9a9a]"
                }`}
              >
                {mood.label}
              </span>

              {/* Selected check indicator */}
              <motion.div
                initial={false}
                animate={{
                  scale: isSelected ? 1 : 0,
                  opacity: isSelected ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg"
                style={{ backgroundColor: mood.color }}
              >
                ✓
              </motion.div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export default MoodSelector;
