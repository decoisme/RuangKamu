"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { 
  Lightbulb, RefreshCw, TrendingUp, TrendingDown, 
  Coffee, Music, BookOpen, Sun, Users, Heart,
  MessageCircle, Leaf, Smile
} from "lucide-react";
import type { MoodCheckin } from "@/lib/checkin-service";
import { MOOD_LIST, MOOD_COLORS } from "@/lib/types";

interface Activity {
  id: string;
  icon: typeof Coffee;
  label: string;
  description: string;
  moodBoost: string;
  color: string;
}

const ACTIVITIES: Activity[] = [
  {
    id: "music",
    icon: Music,
    label: "Listen to Music",
    description: "Your favorite playlist can shift your mood instantly",
    moodBoost: "+2 mood boost",
    color: "#8B7EC8"
  },
  {
    id: "walk",
    icon: Sun,
    label: "Take a Walk",
    description: "Fresh air and movement work wonders",
    moodBoost: "+3 mood boost",
    color: "#FFD93D"
  },
  {
    id: "journal",
    icon: BookOpen,
    label: "Write it Out",
    description: "Express your thoughts freely in your journal",
    moodBoost: "+2 mood boost",
    color: "#6B9BD2"
  },
  {
    id: "friend",
    icon: Users,
    label: "Call a Friend",
    description: "Connection is powerful medicine",
    moodBoost: "+3 mood boost",
    color: "#FF6B9D"
  },
  {
    id: "tea",
    icon: Coffee,
    label: "Make Some Tea",
    description: "A warm ritual to ground yourself",
    moodBoost: "+1 mood boost",
    color: "#7DA87B"
  },
  {
    id: "breathe",
    icon: Leaf,
    label: "Breathing Exercise",
    description: "5 minutes to calm your nervous system",
    moodBoost: "+2 mood boost",
    color: "#BDB2FF"
  },
  {
    id: "gratitude",
    icon: Heart,
    label: "List 3 Gratitudes",
    description: "Shift focus to what's going well",
    moodBoost: "+2 mood boost",
    color: "#FF8C6B"
  },
  {
    id: "talk",
    icon: MessageCircle,
    label: "Talk to Someone",
    description: "You don't have to go through this alone",
    moodBoost: "+3 mood boost",
    color: "#9B8FFF"
  }
];

interface MoodInsightsProps {
  checkins: MoodCheckin[];
  todayScore?: number;
}

export function MoodInsights({ checkins, todayScore }: MoodInsightsProps) {
  const [currentInsight, setCurrentInsight] = useState(0);
  const [suggestedActivities, setSuggestedActivities] = useState<Activity[]>([]);

  // Generate insights
  const insights = useMemo(() => {
    if (checkins.length === 0) return [];
    
    const result: Array<{
      type: "trend" | "pattern" | "suggestion";
      icon: typeof Lightbulb;
      title: string;
      message: string;
      color: string;
    }> = [];

    // Recent trend
    const recentEntries = checkins.slice(0, 7);
    if (recentEntries.length >= 3) {
      const avgRecent = recentEntries.reduce((sum, e) => sum + e.score, 0) / recentEntries.length;
      const olderEntries = checkins.slice(7, 14);
      
      if (olderEntries.length >= 3) {
        const avgOlder = olderEntries.reduce((sum, e) => sum + e.score, 0) / olderEntries.length;
        const diff = avgRecent - avgOlder;
        
        if (diff > 1) {
          result.push({
            type: "trend",
            icon: TrendingUp,
            title: "Upward Trend",
            message: `Your mood has been improving! Up ${diff.toFixed(1)} points from last week. Keep doing what you're doing :)`,
            color: "#7DA87B"
          });
        } else if (diff < -1) {
          result.push({
            type: "trend",
            icon: TrendingDown,
            title: "Dip Noticed",
            message: `Your mood has been lower lately. It's okay to have tough periods. Be gentle with yourself {'<3'}`,
            color: "#FF6B9D"
          });
        }
      }
    }

    // Best day pattern
    const dayScores: Record<string, number[]> = {};
    checkins.forEach(entry => {
      const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!dayScores[day]) dayScores[day] = [];
      dayScores[day].push(entry.score);
    });
    
    const dayAverages = Object.entries(dayScores).map(([day, scores]) => ({
      day,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length
    })).sort((a, b) => b.avg - a.avg);
    
    if (dayAverages.length > 0 && dayAverages[0].avg > 6) {
      result.push({
        type: "pattern",
        icon: Smile,
        title: "Happy Days",
        message: `You tend to feel best on ${dayAverages[0].day}s (${dayAverages[0].avg.toFixed(1)}/10 average). Plan something nice for yourself!`,
        color: "#FFD93D"
      });
    }

    // Streak motivation
    let streak = 0;
    const today = new Date();
    const uniqueDates = new Set(checkins.map(c => c.date));
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.has(dateStr)) { streak++; } else break;
    }
    
    if (streak >= 7) {
      result.push({
        type: "pattern",
        icon: TrendingUp,
        title: `${streak}-Day Streak!`,
        message: `You've checked in ${streak} days in a row. This consistency is building powerful self-awareness :)`,
        color: "#8B7EC8"
      });
    }

    // Common triggers
    const allTriggers: Record<string, number> = {};
    checkins.forEach(entry => {
      entry.triggers?.forEach(trigger => {
        allTriggers[trigger] = (allTriggers[trigger] || 0) + 1;
      });
    });

    const topTrigger = Object.entries(allTriggers).sort((a, b) => b[1] - a[1])[0];
    if (topTrigger && topTrigger[1] >= 3) {
      result.push({
        type: "pattern",
        icon: Lightbulb,
        title: "Pattern Detected",
        message: `${topTrigger[0]} affects your mood often (${topTrigger[1]}x). Being aware of triggers is the first step to managing them.`,
        color: "#6B9BD2"
      });
    }

    return result;
  }, [checkins]);

  // Suggest activities based on current mood
  useEffect(() => {
    if (todayScore === undefined) {
      // Random 3 activities
      const shuffled = [...ACTIVITIES].sort(() => Math.random() - 0.5);
      setSuggestedActivities(shuffled.slice(0, 3));
      return;
    }

    // Personalized based on score
    let suggested: Activity[];
    
    if (todayScore <= 4) {
      // Low mood - focus on comfort & connection
      suggested = ACTIVITIES.filter(a => 
        ['friend', 'talk', 'breathe', 'tea'].includes(a.id)
      ).slice(0, 3);
    } else if (todayScore <= 7) {
      // Medium mood - boost activities
      suggested = ACTIVITIES.filter(a => 
        ['walk', 'music', 'journal', 'gratitude'].includes(a.id)
      ).slice(0, 3);
    } else {
      // Good mood - maintain & celebrate
      suggested = ACTIVITIES.filter(a => 
        ['music', 'friend', 'walk', 'gratitude'].includes(a.id)
      ).slice(0, 3);
    }
    
    setSuggestedActivities(suggested);
  }, [todayScore]);

  const rotateInsight = () => {
    setCurrentInsight((prev) => (prev + 1) % insights.length);
  };

  const currentInsightData = insights[currentInsight];

  if (insights.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#FFD93D]/20">
            <Lightbulb className="w-5 h-5 text-[#FFD93D]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0a0a0a]">Your Insights</h3>
            <p className="text-xs text-[#9a9a9a]">Check in a few more times to see patterns :)</p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[#f8f8f8] border border-black/[0.06] text-center">
          <span className="text-4xl mb-3 block">🌱</span>
          <p className="text-sm text-[#555555] leading-relaxed">
            Keep checking in! We'll analyze your patterns and give you personalized insights after a few entries.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      {/* Insight Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFD93D]/20">
              <Lightbulb className="w-5 h-5 text-[#FFD93D]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0a0a0a]">Your Insights</h3>
              <p className="text-xs text-[#9a9a9a]">Based on your patterns</p>
            </div>
          </div>

          {insights.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={rotateInsight}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors"
              title="Next insight"
            >
              <RefreshCw className="w-4 h-4 text-[#9a9a9a]" />
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {currentInsightData && (
            <motion.div
              key={currentInsight}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-5 rounded-xl border"
              style={{ 
                background: `${currentInsightData.color}15`,
                borderColor: `${currentInsightData.color}30`
              }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ background: `${currentInsightData.color}30` }}
                >
                  <currentInsightData.icon 
                    className="w-5 h-5" 
                    style={{ color: currentInsightData.color }} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#0a0a0a] mb-1">
                    {currentInsightData.title}
                  </h4>
                  <p className="text-sm text-[#555555] leading-relaxed">
                    {currentInsightData.message}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {insights.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {insights.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentInsight(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  background: i === currentInsight ? '#0a0a0a' : 'rgba(0,0,0,0.15)',
                  width: i === currentInsight ? '16px' : '6px',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Suggested Activities */}
      {suggestedActivities.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[#0a0a0a] mb-3">
            Suggested for you today
          </h4>
          <div className="space-y-2">
            {suggestedActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className="p-4 rounded-xl border border-black/[0.06] hover:bg-black/[0.02] transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${activity.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: activity.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h5 className="text-sm font-semibold text-[#0a0a0a]">
                          {activity.label}
                        </h5>
                        <span 
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ 
                            background: `${activity.color}20`,
                            color: activity.color
                          }}
                        >
                          {activity.moodBoost}
                        </span>
                      </div>
                      <p className="text-xs text-[#9a9a9a] leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
