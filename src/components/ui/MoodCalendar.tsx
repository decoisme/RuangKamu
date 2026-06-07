"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { MOOD_LIST, MOOD_COLORS, type MoodEntry, type MoodType } from "@/lib/types";

interface MoodCalendarProps {
  entries: MoodEntry[];
  onDateClick?: (date: string) => void;
}

export function MoodCalendar({ entries, onDateClick }: MoodCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Array<{ date: string; day: number; entry?: MoodEntry }> = [];
    
    // Previous month padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: "", day: 0 });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = entries.find(e => e.date === dateStr);
      days.push({ date: dateStr, day, entry });
    }
    
    return days;
  }, [currentMonth, entries]);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDateClick = (date: string, entry?: MoodEntry) => {
    if (!date) return;
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const getMoodColor = (entry?: MoodEntry) => {
    if (!entry) return "transparent";
    return MOOD_COLORS[entry.mood as MoodType] || "#8B7EC8";
  };

  const getMoodEmoji = (entry?: MoodEntry) => {
    if (!entry) return null;
    const mood = MOOD_LIST.find(m => m.type === entry.mood);
    return mood?.emoji;
  };

  const hoveredEntry = hoveredDate ? entries.find(e => e.date === hoveredDate) : null;
  const selectedEntry = selectedDate ? entries.find(e => e.date === selectedDate) : null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-black/5">
            <CalendarIcon className="w-5 h-5 text-[#555555]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0a0a0a]">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <p className="text-xs text-[#9a9a9a]">Your mood journey :)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#555555]" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToToday}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#555555] hover:bg-black/5 transition-colors"
          >
            Today
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-[#555555]" />
          </motion.button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs font-medium text-[#9a9a9a] py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (!day.date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isToday = day.date === today;
          const isSelected = day.date === selectedDate;
          const hasEntry = !!day.entry;
          const moodColor = getMoodColor(day.entry);
          const emoji = getMoodEmoji(day.entry);

          return (
            <motion.button
              key={day.date}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDateClick(day.date, day.entry)}
              onMouseEnter={() => setHoveredDate(day.date)}
              onMouseLeave={() => setHoveredDate(null)}
              className="aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer transition-all"
              style={{
                background: hasEntry 
                  ? `${moodColor}20` 
                  : isToday 
                  ? "rgba(0,0,0,0.04)" 
                  : "transparent",
                border: isSelected 
                  ? `2px solid ${moodColor}` 
                  : isToday 
                  ? "2px solid rgba(0,0,0,0.15)" 
                  : "2px solid transparent",
              }}
            >
              {/* Day number */}
              <span 
                className="text-xs font-medium"
                style={{ 
                  color: hasEntry ? moodColor : "#555555",
                  fontWeight: isToday ? "bold" : "medium"
                }}
              >
                {day.day}
              </span>

              {/* Emoji */}
              {emoji && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-sm mt-0.5"
                >
                  {emoji}
                </motion.span>
              )}

              {/* Score indicator */}
              {day.entry && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {Array.from({ length: Math.ceil(day.entry.score / 2) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{ background: moodColor }}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredDate && hoveredEntry && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 rounded-xl border border-black/[0.08] bg-[#f8f8f8]"
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${getMoodColor(hoveredEntry)}20` }}
              >
                <span className="text-2xl">{getMoodEmoji(hoveredEntry)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[#0a0a0a]">
                    {new Date(hoveredDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span 
                    className="text-sm font-bold"
                    style={{ color: getMoodColor(hoveredEntry) }}
                  >
                    {hoveredEntry.score}/10
                  </span>
                </div>
                {hoveredEntry.note && (
                  <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed">
                    &ldquo;{hoveredEntry.note}&rdquo;
                  </p>
                )}
                {hoveredEntry.triggers && hoveredEntry.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {hoveredEntry.triggers.map(trigger => (
                      <span 
                        key={trigger}
                        className="text-xs px-2 py-0.5 rounded-full bg-black/5 text-[#555555]"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-black/[0.06]">
        <p className="text-xs text-[#9a9a9a] mb-2">Mood colors</p>
        <div className="flex flex-wrap gap-2">
          {MOOD_LIST.slice(0, 6).map(mood => (
            <div key={mood.type} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ background: mood.color }}
              />
              <span className="text-xs text-[#555555]">{mood.emoji} {mood.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
