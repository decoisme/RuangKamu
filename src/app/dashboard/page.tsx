'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  SmilePlus,
  BookOpen,
  BarChart3,
  Brain,
  Heart,
  Shield,
  UserCircle,
  LayoutDashboard,
  Menu,
  X,
  ArrowRight,
  TrendingUp,
  Calendar,
  Lightbulb,
  PenLine,
  Sun,
  Moon as MoonIcon,
  CloudSun,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { MoodEntry, MoodType, UserProfile } from '@/lib/types';
import { MOOD_LIST, MOOD_COLORS } from '@/lib/types';

// ===== INLINE STORE HELPERS =====
function getMoodEntries(): MoodEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('ruangkamu_moods');
  return data ? JSON.parse(data) : [];
}

function getUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('ruangkamu_user');
  return data ? JSON.parse(data) : null;
}

// ===== INLINE NAVBAR =====
const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/checkin', label: 'Check-in', icon: SmilePlus },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/reflection', label: 'Reflection', icon: Brain },
  { href: '/vault', label: 'Vault', icon: Shield },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

function DashboardNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.07] shadow-[0_1px_12px_rgba(0,0,0,0.05)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
            <span className="text-white text-xs font-black">R</span>
          </div>
          <span className="font-heading font-semibold text-[15px] text-[#0a0a0a] tracking-tight hidden sm:inline">
            Ruang Kamu
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-[#0a0a0a]'
                    : 'text-[#0a0a0a]/40 hover:text-[#0a0a0a]/80 hover:bg-black/4'
                }`}
              >
                {isActive && (
                  <motion.span layoutId="dash-nav-pill"
                    className="absolute inset-0 rounded-full bg-black/6 border border-black/10"
                    transition={{ type: 'spring' as const, stiffness: 350, damping: 30 }} />
                )}
                <link.icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full text-[#0a0a0a]/40 hover:text-[#0a0a0a] hover:bg-black/5 transition-all cursor-pointer"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-black/[0.06] bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-0.5">
              {navLinks.map((link) => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-black/6 text-[#0a0a0a]'
                        : 'text-[#0a0a0a]/40 hover:text-[#0a0a0a] hover:bg-black/4'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ===== TIME GREETING =====
function getGreeting(): { text: string; icon: typeof Sun } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: Sun };
  if (hour < 17) return { text: 'Good afternoon', icon: CloudSun };
  return { text: 'Good evening', icon: MoonIcon };
}

// ===== CUSTOM TOOLTIP =====
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { day: string; score: number; mood: string } }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const moodInfo = MOOD_LIST.find((m) => m.type === data.mood);
  return (
    <div className="glass-strong rounded-xl px-4 py-3 text-sm">
      <p className="text-[#E2E8F0] font-medium">{data.day}</p>
      <p className="text-[#94A3B8]">
        Score: {data.score} {moodInfo?.emoji}
      </p>
    </div>
  );
}

// ===== QUICK ACTION CARD =====
function QuickAction({
  href,
  icon: Icon,
  label,
  gradient,
  delay,
}: {
  href: string;
  icon: typeof SmilePlus;
  label: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Link href={href}>
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer group"
        >
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
          >
            <Icon className="w-6 h-6 text-white/90" />
          </div>
          <span className="text-sm font-medium text-[#E2E8F0]">{label}</span>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ===== INSIGHT CARD =====
function InsightCard({
  icon: Icon,
  title,
  description,
  color,
  delay,
}: {
  icon: typeof Lightbulb;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card rounded-2xl p-5 flex gap-4"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-[#E2E8F0] mb-1">{title}</h4>
        <p className="text-xs text-[#94A3B8] leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ===== EMPTY STATE =====
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#8B7EC8]/20 to-[#6B9BD2]/20 flex items-center justify-center">
          <span className="text-5xl">🌱</span>
        </div>
      </motion.div>
      <h3 className="text-xl font-semibold text-[#E2E8F0] mb-2">Your story begins here</h3>
      <p className="text-[#94A3B8] max-w-sm mb-8 leading-relaxed">
        Start your first check-in and begin understanding your emotional patterns, one day at a time.
      </p>
      <Link href="/checkin">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#8B7EC8] to-[#6B9BD2] text-white font-semibold flex items-center gap-2 shadow-lg shadow-[#8B7EC8]/25 cursor-pointer"
        >
          Start Your First Check-in
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </Link>
    </motion.div>
  );
}

// ===== MAIN DASHBOARD PAGE =====
export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setEntries(getMoodEntries());
    setIsLoaded(true);
  }, []);

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  // Today's check-in
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find((e) => e.date === today);
  const todayMood = todayEntry ? MOOD_LIST.find((m) => m.type === todayEntry.mood) : null;

  // Last 7 days data for chart
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = entries.find((e) => e.date === dateStr);
      result.push({
        day: days[d.getDay()],
        score: entry ? entry.score : 0,
        mood: entry ? entry.mood : 'kosong',
        date: dateStr,
      });
    }
    return result;
  }, [entries]);

  const hasData = entries.length > 0;

  // Insights based on data
  const insights = useMemo(() => {
    if (!hasData) return [];
    const result = [];

    // Most common mood
    const moodCounts: Record<string, number> = {};
    entries.forEach((e) => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    if (topMood) {
      const moodInfo = MOOD_LIST.find((m) => m.type === topMood[0]);
      result.push({
        icon: TrendingUp,
        title: 'Most Frequent Mood',
        description: `You've been feeling ${moodInfo?.label?.toLowerCase() || topMood[0]} most often (${topMood[1]} times). ${
          topMood[0] === 'senang'
            ? 'That\'s wonderful — keep nurturing what makes you happy!'
            : 'Understanding this pattern is the first step to growth.'
        }`,
        color: MOOD_COLORS[topMood[0] as MoodType] || '#8B7EC8',
      });
    }

    // Average score
    const avgScore = entries.reduce((sum, e) => sum + e.score, 0) / entries.length;
    result.push({
      icon: Lightbulb,
      title: 'Average Mood Score',
      description: `Your average mood score is ${avgScore.toFixed(1)}/10. ${
        avgScore >= 7
          ? 'You\'re doing great! Keep up the self-care.'
          : avgScore >= 4
          ? 'You\'re on a steady path. Remember, every small step counts.'
          : 'It\'s okay to have tough days. Consider writing in your journal.'
      }`,
      color: avgScore >= 7 ? '#7DA87B' : avgScore >= 4 ? '#6B9BD2' : '#D4A0A0',
    });

    // Streak
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 30; i++) {
      const dateStr = d.toISOString().split('T')[0];
      if (entries.find((e) => e.date === dateStr)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    if (streak > 0) {
      result.push({
        icon: Calendar,
        title: `${streak}-Day Streak!`,
        description:
          streak >= 7
            ? 'Amazing consistency! You\'re building a powerful habit of self-awareness.'
            : `You've checked in ${streak} day${streak > 1 ? 's' : ''} in a row. Keep going!`,
        color: '#8B7EC8',
      });
    }

    return result;
  }, [entries, hasData]);

  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-7 h-7 border-2 border-black/10 border-t-[#0a0a0a] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-14">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-[#9a9a9a] mb-1">
            <GreetingIcon className="w-4 h-4 text-[#0a0a0a]/40" />
            <span className="text-sm">{dateString}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a]">
            {greeting.text},{' '}
            <span className="gradient-text">{user?.name || 'Friend'}</span>
          </h1>
        </motion.div>

        {!hasData ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* Top Row: Today's mood + Weekly chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Mood Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="text-sm font-medium text-[#9a9a9a] mb-4 flex items-center gap-2">
                  <SmilePlus className="w-4 h-4" />
                  Today&apos;s Check-in
                </h3>
                {todayEntry && todayMood ? (
                  <div className="flex items-center gap-5">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ background: `${todayMood.color}15`, border: `1px solid ${todayMood.color}30` }}
                    >
                      <span className="text-4xl">{todayMood.emoji}</span>
                    </motion.div>
                    <div>
                      <p className="text-lg font-semibold text-[#0a0a0a]">{todayMood.label}</p>
                      <p className="text-sm text-[#9a9a9a]">
                        Score: <span style={{ color: todayMood.color }}>{todayEntry.score}/10</span>
                      </p>
                      {todayEntry.note && (
                        <p className="text-xs text-[#9a9a9a]/80 mt-1 line-clamp-2">
                          &ldquo;{todayEntry.note}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4">
                    <p className="text-[#9a9a9a] mb-4 text-sm">You haven&apos;t checked in today</p>
                    <Link href="/checkin">
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.98 }}
                        animate={{ boxShadow: ['0 0 0 0 rgba(0,0,0,0.12)', '0 0 0 12px rgba(0,0,0,0)', '0 0 0 0 rgba(0,0,0,0.12)'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="px-6 py-2.5 rounded-full bg-[#0a0a0a] text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        Check In Now
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Weekly Overview Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="text-sm font-medium text-[#9a9a9a] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Weekly Overview
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={weeklyData} barCategoryGap="20%">
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      width={25}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={32}>
                      {weeklyData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={
                            entry.score > 0
                              ? MOOD_COLORS[entry.mood as MoodType] || '#8B7EC8'
                              : 'rgba(255,255,255,0.05)'
                          }
                          fillOpacity={entry.score > 0 ? 0.7 : 0.3}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-[#9a9a9a] mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <QuickAction
                  href="/checkin"
                  icon={SmilePlus}
                  label="Check-in"
                  gradient="from-black/4 to-black/2"
                  delay={0.3}
                />
                <QuickAction
                  href="/journal"
                  icon={PenLine}
                  label="Journal"
                  gradient="from-black/4 to-black/2"
                  delay={0.4}
                />
                <QuickAction
                  href="/analytics"
                  icon={BarChart3}
                  label="Analytics"
                  gradient="from-black/4 to-black/2"
                  delay={0.5}
                />
                <QuickAction
                  href="/reflection"
                  icon={Brain}
                  label="Reflection"
                  gradient="from-black/4 to-black/2"
                  delay={0.6}
                />
              </div>
            </div>

            {/* Recent Insights */}
            {insights.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[#9a9a9a] mb-3">Recent Insights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insights.map((insight, i) => (
                    <InsightCard
                      key={insight.title}
                      icon={insight.icon}
                      title={insight.title}
                      description={insight.description}
                      color={insight.color}
                      delay={0.3 + i * 0.1}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
