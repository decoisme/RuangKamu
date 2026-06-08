'use client';

// Disable static generation for this page (uses dynamic data)
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Activity, Hash, Sparkles, AlertCircle, Lightbulb,
  CheckCircle, Info, ArrowRight, Clock, Target
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

// ==================== NEW ANALYTICS SERVICE ====================
import { getAnalyticsData, type AnalyticsData } from '@/lib/analytics-service';
import type { MoodType } from '@/lib/types';

// ==================== CONSTANTS ====================
const MOOD_LABELS: Record<MoodType, { label: string; emoji: string; color: string }> = {
  senang: { label: 'Happy', emoji: '😊', color: '#10b981' },
  biasa: { label: 'Okay', emoji: '😐', color: '#6b7280' },
  capek: { label: 'Tired', emoji: '😓', color: '#f59e0b' },
  cemas: { label: 'Anxious', emoji: '😰', color: '#ef4444' },
  sedih: { label: 'Sad', emoji: '😢', color: '#3b82f6' },
  marah: { label: 'Angry', emoji: '😠', color: '#dc2626' },
  kosong: { label: 'Empty', emoji: '😶', color: '#9ca3af' },
};

// ==================== CUSTOM TOOLTIP ====================
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { mood: MoodType; date: string } }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];
  const moodInfo = MOOD_LABELS[data.payload.mood];
  return (
    <div className="bg-white/95 backdrop-blur rounded-xl p-3 text-sm border border-black/[0.08] shadow-lg">
      <p className="text-[#0a0a0a] font-medium">{data.payload.date} · {label}</p>
      <p className="text-[#9a9a9a]">Score: <span className="text-[#0a0a0a] font-semibold">{data.value}/10</span></p>
      {moodInfo && <p className="text-[#9a9a9a]">Mood: {moodInfo.emoji} {moodInfo.label}</p>}
    </div>
  );
}

// ==================== INSIGHT ICON ====================
function InsightIcon({ type }: { type: 'info' | 'warning' | 'positive' | 'suggestion' }) {
  switch (type) {
    case 'positive': return <CheckCircle className="w-5 h-5" />;
    case 'warning': return <AlertCircle className="w-5 h-5" />;
    case 'suggestion': return <Lightbulb className="w-5 h-5" />;
    default: return <Info className="w-5 h-5" />;
  }
}

const INSIGHT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  positive: { bg: 'rgba(0,0,0,0.03)', border: 'rgba(0,0,0,0.08)', text: '#3a7a3a' },
  warning:  { bg: 'rgba(0,0,0,0.03)', border: 'rgba(0,0,0,0.08)', text: '#8a4a4a' },
  suggestion:{ bg: 'rgba(0,0,0,0.03)', border: 'rgba(0,0,0,0.08)', text: '#0a0a0a' },
  info:     { bg: 'rgba(0,0,0,0.03)', border: 'rgba(0,0,0,0.08)', text: '#3a5a8a' },
};

const CHART_COLORS = ['#0a0a0a', '#555555', '#7DA87B', '#D4A0A0', '#FFD93D', '#FF6B6B', '#A0C4FF'];

// ==================== MAIN PAGE ====================
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { 
    const loadData = async () => {
      try {
        const analyticsData = await getAnalyticsData();
        setData(analyticsData);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pt-14 pb-12 px-4 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-black/10 border-t-[#0a0a0a] rounded-full"
          />
        </div>
      </>
    );
  }

  // Empty state
  if (!data || (data.totalEntries === 0 && data.totalCheckins === 0)) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pt-14 pb-12 px-4 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-12 text-center max-w-lg">
            <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-[#0a0a0a]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0a0a0a] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>No Data Yet</h2>
            <p className="text-[#9a9a9a] mb-6 leading-relaxed">
              Start tracking your mood to see beautiful analytics and patterns here. Your journey begins with a single check-in.
            </p>
            <Link href="/checkin">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0a0a0a] text-white font-medium hover:bg-[#1a1a1a] transition-colors">
                Do Your First Check-in <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  // Get top mood info
  const topMood = data.moodDistribution[0];
  const topTrigger = data.triggerDistribution[0];

  const stats = [
    { 
      label: 'Average Score', 
      value: data.averageScore.toString(), 
      sub: '/10', 
      icon: TrendingUp, 
      color: '#0a0a0a' 
    },
    { 
      label: 'Most Frequent', 
      value: topMood?.emoji || '—', 
      sub: topMood?.name || '', 
      icon: Activity, 
      color: topMood?.color || '#9a9a9a' 
    },
    { 
      label: 'Check-ins/Day', 
      value: data.averageCheckinsPerDay.toString(), 
      sub: 'average', 
      icon: Clock, 
      color: '#3a7a3a' 
    },
    { 
      label: 'Total Check-ins', 
      value: data.totalCheckins.toString(), 
      sub: `+${data.totalEntries} entries`, 
      icon: BarChart3, 
      color: '#555555' 
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-14 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-black/5">
                <BarChart3 className="w-6 h-6 text-[#0a0a0a]" />
              </div>
              <h1 className="text-3xl font-bold text-[#0a0a0a]" style={{ fontFamily: 'var(--font-heading)' }}>Mood Analytics</h1>
            </div>
            <p className="text-[#9a9a9a] ml-14">Discover patterns in your emotional journey.</p>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-black/10 transition-all">
                <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <stat.icon className="w-10 h-10" style={{ color: stat.color }} />
                </div>
                <p className="text-xs text-[#9a9a9a] mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
                  <span className="text-sm text-[#9a9a9a]">{stat.sub}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Weekly Mood</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.weeklyData}>
                    <defs>
                      <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0a0a0a" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="day"   stroke="#9a9a9a" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis domain={[0,10]} stroke="#9a9a9a" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="score" stroke="#0a0a0a" strokeWidth={2}
                      fill="url(#gradientArea)"
                      dot={{ r: 4, fill: '#0a0a0a', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#0a0a0a', strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Monthly Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Monthly Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="week" stroke="#9a9a9a" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis domain={[0,10]} stroke="#9a9a9a" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', fontSize: '13px', color: '#0a0a0a' }} />
                    <Bar dataKey="avgScore" radius={[8,8,0,0]} fill="#0a0a0a" maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Mood Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Mood Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.moodDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      dataKey="value" nameKey="name" paddingAngle={3} strokeWidth={0}>
                      {data.moodDistribution.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', fontSize: '13px', color: '#0a0a0a' }} />
                    <Legend formatter={(value) => <span style={{ color: '#9a9a9a', fontSize: '12px' }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Trigger Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Trigger Frequency</h3>
              <div className="space-y-3 mt-2">
                {data.triggerDistribution.length === 0 ? (
                  <p className="text-sm text-[#9a9a9a]">No trigger data yet.</p>
                ) : data.triggerDistribution.map((t, i) => {
                  const maxVal = data.triggerDistribution[0]?.value || 1;
                  const pct = Math.round((t.value / (data.totalCheckins + data.totalEntries)) * 100);
                  return (
                    <motion.div key={t.type} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-[#0a0a0a]">{t.name}</span>
                        <span className="text-xs text-[#9a9a9a]">{t.value}× ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(t.value / maxVal) * 100}%` }}
                          transition={{ delay: 0.6 + i * 0.08, duration: 0.6 }}
                          className="h-full rounded-full bg-[#0a0a0a]" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Insights */}
          {data.insights.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Sparkles className="w-5 h-5 text-[#0a0a0a]" />Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.insights.map((insight, i) => {
                  const colors = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.info;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="rounded-2xl p-5 border transition-all hover:scale-[1.02]"
                      style={{ background: colors.bg, borderColor: colors.border }}>
                      <div className="flex items-center gap-2 mb-2" style={{ color: colors.text }}>
                        <InsightIcon type={insight.type} />
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                      </div>
                      <p className="text-sm text-[#0a0a0a]/70 leading-relaxed">{insight.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
