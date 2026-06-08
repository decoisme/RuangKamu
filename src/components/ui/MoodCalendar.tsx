"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { MOOD_LIST, MOOD_COLORS, type MoodType } from "@/lib/types";
import type { MoodCheckin } from "@/lib/checkin-service";

interface MoodCalendarProps {
  checkins: MoodCheckin[];
  onDateClick?: (date: string) => void;
}

// Helper: group checkins by date, derive dominant mood & avg score
interface DaySummary {
  date: string;
  mood: MoodType;
  avgScore: number;
  count: number;
  note?: string;
  triggers: string[];
}

function buildDaySummaries(checkins: MoodCheckin[]): Map<string, DaySummary> {
  const map = new Map<string, DaySummary>();

  checkins.forEach((c) => {
    const existing = map.get(c.date);
    if (!existing) {
      map.set(c.date, {
        date: c.date,
        mood: c.mood,
        avgScore: c.score,
        count: 1,
        note: c.note,
        triggers: c.triggers as string[],
      });
    } else {
      // Accumulate scores; we'll compute avg at end
      existing.avgScore += c.score;
      existing.count += 1;
      if (c.note && !existing.note) existing.note = c.note;
      existing.triggers = [...new Set([...existing.triggers, ...(c.triggers as string[])])];
    }
  });

  // Compute dominant mood & true avg score per day
  const moodGroups = new Map<string, Record<string, number>>();
  checkins.forEach((c) => {
    if (!moodGroups.has(c.date)) moodGroups.set(c.date, {});
    const g = moodGroups.get(c.date)!;
    g[c.mood] = (g[c.mood] || 0) + 1;
  });

  map.forEach((summary, date) => {
    summary.avgScore = Math.round((summary.avgScore / summary.count) * 10) / 10;
    // Pick dominant mood (most frequent)
    const g = moodGroups.get(date) || {};
    const dominant = Object.entries(g).sort((a, b) => b[1] - a[1])[0]?.[0] as MoodType;
    if (dominant) summary.mood = dominant;
  });

  return map;
}

export function MoodCalendar({ checkins, onDateClick }: MoodCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Build per-day summaries from checkins
  const daySummaries = useMemo(() => buildDaySummaries(checkins), [checkins]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: string; day: number; summary?: DaySummary }> = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: "", day: 0 });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({ date: dateStr, day, summary: daySummaries.get(dateStr) });
    }

    return days;
  }, [currentMonth, daySummaries]);

  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const goToToday = () => setCurrentMonth(new Date());

  const handleDateClick = (date: string) => {
    if (!date) return;
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const getMoodColor = (mood?: MoodType) =>
    mood ? MOOD_COLORS[mood] || "#8B7EC8" : "transparent";

  const getMoodEmoji = (mood?: MoodType) => {
    if (!mood) return null;
    return MOOD_LIST.find((m) => m.type === mood)?.emoji ?? null;
  };

  const hoveredSummary = hoveredDate ? daySummaries.get(hoveredDate) : null;
  const today = new Date().toISOString().split("T")[0];

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
        {daysOfWeek.map((day) => (
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
          const summary = day.summary;
          const moodColor = getMoodColor(summary?.mood);
          const emoji = getMoodEmoji(summary?.mood);

          return (
            <motion.button
              key={day.date}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDateClick(day.date)}
              onMouseEnter={() => setHoveredDate(day.date)}
              onMouseLeave={() => setHoveredDate(null)}
              className="aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer transition-all"
              style={{
                background: summary
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
                  color: summary ? moodColor : "#555555",
                  fontWeight: isToday ? "bold" : "normal",
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

              {/* Score dots */}
              {summary && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {Array.from({ length: Math.ceil(summary.avgScore / 2) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{ background: moodColor }}
                    />
                  ))}
                </div>
              )}

              {/* Multi-checkin badge */}
              {summary && summary.count > 1 && (
                <div
                  className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                  style={{ background: moodColor, fontSize: "7px", fontWeight: "bold" }}
                >
                  {summary.count}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredDate && hoveredSummary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 rounded-xl border border-black/[0.08] bg-[#f8f8f8]"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${getMoodColor(hoveredSummary.mood)}20` }}
              >
                <span className="text-2xl">{getMoodEmoji(hoveredSummary.mood)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[#0a0a0a]">
                    {new Date(hoveredDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: getMoodColor(hoveredSummary.mood) }}
                  >
                    {hoveredSummary.avgScore}/10
                  </span>
                </div>
                <p className="text-xs text-[#9a9a9a] mb-1">
                  {hoveredSummary.count} check-in{hoveredSummary.count > 1 ? "s" : ""} hari ini
                </p>
                {hoveredSummary.note && (
                  <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed">
                    &ldquo;{hoveredSummary.note}&rdquo;
                  </p>
                )}
                {hoveredSummary.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {hoveredSummary.triggers.slice(0, 4).map((trigger) => (
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
          {MOOD_LIST.slice(0, 6).map((mood) => (
            <div key={mood.type} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: mood.color }} />
              <span className="text-xs text-[#555555]">
                {mood.emoji} {mood.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
