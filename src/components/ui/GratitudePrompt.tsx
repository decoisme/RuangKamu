"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Heart, Plus, X, Sparkles, TrendingUp } from "lucide-react";
import { FloatingHearts } from "./FloatingEmoji";
import {
  getGratitudeEntries as getGratitudeEntriesService,
  saveGratitudeEntry as saveGratitudeEntryService,
} from "@/lib/supabase-service";

interface GratitudeEntry {
  id: string;
  items: string[];
  date: string;
  createdAt: string;
}

const PROMPTS = [
  "What made you smile today?",
  "Who are you grateful for?",
  "What's something small that brought you joy?",
  "What comfort did you experience today?",
  "What's working well in your life right now?",
  "What ability or skill are you thankful for?",
];

export function GratitudePrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(["", "", ""]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [todayEntry, setTodayEntry] = useState<GratitudeEntry | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Random prompt
    setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    
    // Load today's entry
    loadTodayEntry();
    calculateStreak();
  }, []);

  const loadTodayEntry = async () => {
    const today = new Date().toISOString().split('T')[0];
    const entries = await getGratitudeEntriesService();
    const entry = entries.find(e => e.date === today);
    
    if (entry) {
      setTodayEntry(entry);
      // Pre-fill dengan existing items jika user klik "Add more"
      if (gratitudeItems.every(item => !item.trim())) {
        setGratitudeItems([...entry.items, "", "", ""]);
      }
    } else {
      setTodayEntry(null);
    }
  };

  const calculateStreak = async () => {
    const entries = await getGratitudeEntriesService();
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (entries.find(e => e.date === dateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  };

  const handleSave = async () => {
    const filledItems = gratitudeItems.filter(item => item.trim());
    
    if (filledItems.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const entries = await getGratitudeEntriesService();
    const existingEntry = entries.find(e => e.date === today);
    
    let allItems: string[];
    
    if (existingEntry) {
      // Merge dengan existing items, hindari duplikat
      const existingSet = new Set(existingEntry.items.map(i => i.toLowerCase().trim()));
      const newUniqueItems = filledItems.filter(
        item => !existingSet.has(item.toLowerCase().trim())
      );
      allItems = [...existingEntry.items, ...newUniqueItems];
    } else {
      allItems = filledItems;
    }

    const entry: Omit<GratitudeEntry, 'id' | 'createdAt'> = {
      items: allItems,
      date: today,
    };

    // Save to Supabase (will upsert automatically)
    const savedEntry = await saveGratitudeEntryService(entry);
    
    if (savedEntry) {
      setTodayEntry(savedEntry);
      setShowCelebration(true);
      await calculateStreak();
      
      setTimeout(() => {
        setShowCelebration(false);
        setIsOpen(false);
        setGratitudeItems(["", "", ""]);
      }, 3000);
    }
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...gratitudeItems];
    newItems[index] = value;
    setGratitudeItems(newItems);
  };

  const addMoreItem = () => {
    if (gratitudeItems.length < 10) {
      setGratitudeItems([...gratitudeItems, ""]);
    }
  };

  const removeItem = (index: number) => {
    if (gratitudeItems.length > 1) {
      const newItems = gratitudeItems.filter((_, i) => i !== index);
      setGratitudeItems(newItems);
    }
  };

  return (
    <>
      {showCelebration && <FloatingHearts count={12} />}
      
      <div className="glass-card rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="p-2.5 rounded-xl bg-gradient-to-br from-[#FFD93D]/20 to-[#FF6B9D]/20"
            >
              <Heart className="w-5 h-5 text-[#FF6B9D]" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-[#0a0a0a] flex items-center gap-2">
                Daily Gratitude
                {streak > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs px-2 py-1 rounded-full bg-[#FFD93D]/20 text-[#FF8C00] font-semibold flex items-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" />
                    {streak} day{streak > 1 ? 's' : ''}
                  </motion.span>
                )}
              </h3>
              <p className="text-xs text-[#9a9a9a]">
                {todayEntry ? "Completed today {'<3'}" : "What are you grateful for? :)"}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Entry (if exists) */}
        {todayEntry && !isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {todayEntry.items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 p-3 rounded-xl bg-gradient-to-r from-[#FFD93D]/10 to-[#FF6B9D]/10"
              >
                <span className="text-lg mt-0.5">✨</span>
                <p className="text-sm text-[#0a0a0a] leading-relaxed flex-1">{item}</p>
              </motion.div>
            ))}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsOpen(true);
                // Pre-fill existing items untuk menambah
                if (todayEntry) {
                  setGratitudeItems([...todayEntry.items, "", "", ""]);
                }
              }}
              className="w-full mt-3 px-4 py-2 rounded-xl text-sm text-[#555555] hover:bg-black/4 transition-colors"
            >
              Add more gratitude
            </motion.button>
          </motion.div>
        ) : !isOpen ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpen(true)}
            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#FFD93D]/20 to-[#FF6B9D]/20 hover:from-[#FFD93D]/30 hover:to-[#FF6B9D]/30 transition-all flex items-center justify-center gap-2 text-[#0a0a0a] font-medium border border-[#FFD93D]/30"
          >
            <Heart className="w-4 h-4" />
            Start Gratitude Practice
          </motion.button>
        ) : null}

        {/* Gratitude Form */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                {/* Prompt */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-[#FFD93D]/10 to-[#FF6B9D]/10 border border-[#FFD93D]/20"
                >
                  <p className="text-sm text-[#555555] italic flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FFD93D]" />
                    {currentPrompt}
                  </p>
                </motion.div>

                {/* Input fields */}
                <div className="space-y-3">
                  {gratitudeItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <span className="text-lg mt-2">{index === 0 ? '💛' : index === 1 ? '💚' : index === 2 ? '💙' : '💜'}</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateItem(index, e.target.value)}
                        placeholder={`Gratitude ${index + 1}...`}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#f8f8f8] border border-black/[0.08] focus:border-[#FFD93D]/50 transition-colors text-sm text-[#0a0a0a] placeholder-[#9a9a9a]/50"
                      />
                      {gratitudeItems.length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeItem(index)}
                          className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                        >
                          <X className="w-4 h-4 text-[#9a9a9a]" />
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Add more button */}
                {gratitudeItems.length < 10 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addMoreItem}
                    className="w-full px-4 py-2 rounded-xl border-2 border-dashed border-black/[0.10] text-sm text-[#9a9a9a] hover:text-[#0a0a0a] hover:border-black/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add another
                  </motion.button>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-black/[0.10] text-sm text-[#555555] hover:bg-black/4 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={gratitudeItems.filter(i => i.trim()).length === 0}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD93D] to-[#FF6B9D] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#FFD93D]/25"
                  >
                    Save {'<3'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Benefits reminder */}
        {!isOpen && !todayEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 rounded-xl bg-[#f8f8f8] border border-black/[0.06]"
          >
            <p className="text-xs text-[#555555] leading-relaxed">
              💡 <span className="font-medium">Science says:</span> Daily gratitude practice improves mood, 
              reduces stress, and increases overall well-being :)
            </p>
          </motion.div>
        )}
      </div>
    </>
  );
}
