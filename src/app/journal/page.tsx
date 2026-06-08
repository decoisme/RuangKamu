'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Save, Sparkles, Trash2, Search,
  ChevronDown, ChevronUp, Loader2, Shield, FileText,
  Calendar, MessageSquare, Check, PenLine, Lock,
  Palette, Mic, Heart, Clock, Tag
} from 'lucide-react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import {
  JOURNAL_PROMPTS, MOOD_LIST, MOOD_COLORS,
  type JournalEntry, type MoodType
} from '@/lib/types';
import { getMoodCheckins } from '@/lib/checkin-service';
import type { MoodCheckin } from '@/lib/checkin-service';
import { FloatingEmoji } from '@/components/ui/FloatingEmoji';
import { DrawingCanvas } from '@/components/ui/DrawingCanvas';

// ==================== SUPABASE INTEGRATION ====================
import {
  getJournalEntries as getJournalEntriesService,
  saveJournalEntry as saveJournalEntryService,
  deleteJournalEntry as deleteJournalEntryService,
} from '@/lib/supabase-service';

async function getJournalEntries(): Promise<JournalEntry[]> {
  return await getJournalEntriesService();
}
async function saveJournalEntry(entry: Omit<JournalEntry, 'id'>): Promise<void> {
  await saveJournalEntryService(entry);
}
async function deleteJournalEntry(id: string): Promise<void> {
  await deleteJournalEntryService(id);
}

// ==================== AI JOURNAL SUMMARY ====================
function generateJournalSummary(content: string): string {
  if (!content || content.trim().length < 20) return 'Entry too short for summary.';

  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);

  // Emotion detection with context
  const emotionMap: Record<string, { emoji: string; label: string; weight: number }> = {
    happy:    { emoji: '😊', label: 'joy',        weight: 3 },
    joyful:   { emoji: '🌟', label: 'joy',        weight: 3 },
    grateful: { emoji: '🙏', label: 'gratitude',  weight: 4 },
    thankful: { emoji: '🙏', label: 'gratitude',  weight: 4 },
    sad:      { emoji: '😢', label: 'sadness',    weight: 3 },
    anxious:  { emoji: '😰', label: 'anxiety',    weight: 3 },
    worried:  { emoji: '😟', label: 'worry',      weight: 2 },
    tired:    { emoji: '😴', label: 'fatigue',    weight: 2 },
    exhausted:{ emoji: '😩', label: 'exhaustion', weight: 3 },
    angry:    { emoji: '😤', label: 'anger',      weight: 3 },
    frustrated:{ emoji:'😤', label: 'frustration',weight: 2 },
    love:     { emoji: '❤️', label: 'love',       weight: 4 },
    hope:     { emoji: '✨', label: 'hope',       weight: 3 },
    hopeful:  { emoji: '✨', label: 'hope',       weight: 3 },
    fear:     { emoji: '😨', label: 'fear',       weight: 2 },
    scared:   { emoji: '😨', label: 'fear',       weight: 2 },
    peaceful: { emoji: '☮️', label: 'peace',      weight: 3 },
    calm:     { emoji: '😌', label: 'calm',       weight: 2 },
    excited:  { emoji: '🎉', label: 'excitement', weight: 3 },
    proud:    { emoji: '💪', label: 'pride',      weight: 3 },
    lonely:   { emoji: '🥺', label: 'loneliness', weight: 3 },
    confused: { emoji: '😕', label: 'confusion',  weight: 2 },
    stress:   { emoji: '😩', label: 'stress',     weight: 3 },
    overwhelmed:{ emoji:'😵', label: 'overwhelm', weight: 3 },
  };

  const lower = content.toLowerCase();
  const detectedEmotions: Array<{ emoji: string; label: string; weight: number }> = [];

  for (const [word, data] of Object.entries(emotionMap)) {
    if (lower.includes(word) && !detectedEmotions.find(e => e.label === data.label)) {
      detectedEmotions.push(data);
    }
  }

  // Sort by weight, take top 3
  detectedEmotions.sort((a, b) => b.weight - a.weight);
  const topEmotions = detectedEmotions.slice(0, 3);

  // Build a richer summary
  const firstSentence = sentences[0] || '';
  const wordCount = content.trim().split(/\s+/).length;

  let summary = firstSentence.length > 15 ? firstSentence + '.' : (sentences[1] ? `${firstSentence}. ${sentences[1]}.` : content.slice(0, 120));

  if (topEmotions.length > 0) {
    const emotionStr = topEmotions.map(e => `${e.emoji} ${e.label}`).join(' · ');
    summary += `\n\nEmotions sensed: ${emotionStr}`;
  }

  summary += `\n${wordCount} words · ${sentences.length} thoughts`;

  return summary;
}

// ==================== PROMPT CATEGORIES ====================
const PROMPT_CATEGORIES = [
  {
    label: 'Feelings',
    icon: Heart,
    color: '#FF6B9D',
    prompts: [
      'What emotions are most present for me right now?',
      'When did I feel most like myself today?',
      'What am I afraid to admit that I\'m feeling?',
    ]
  },
  {
    label: 'Reflection',
    icon: Sparkles,
    color: '#8B7EC8',
    prompts: [
      'What\'s one thing I\'m proud of doing recently?',
      'If today had a color, what would it be and why?',
      'What would I tell my past self from a year ago?',
    ]
  },
  {
    label: 'Growth',
    icon: PenLine,
    color: '#7DA87B',
    prompts: [
      'What pattern do I keep seeing in my life?',
      'What am I learning about myself lately?',
      'What boundary do I need to set (or honor) right now?',
    ]
  },
  {
    label: 'Gratitude',
    icon: MessageSquare,
    color: '#6B9BD2',
    prompts: [
      'Three small things I noticed today that brought me comfort.',
      'Who has supported me recently, even in a small way?',
      'What\'s something my body did today that I\'m grateful for?',
    ]
  },
];

// ==================== WRITING MODES ====================
type WritingMode = 'write' | 'draw';

// ==================== MAIN PAGE ====================
export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [checkins, setCheckins] = useState<MoodCheckin[]>([]);
  const [content, setContent] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [activeCategory, setActiveCategory] = useState(0);
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [floatingEmoji, setFloatingEmoji] = useState<string | null>(null);
  const [mode, setMode] = useState<WritingMode>('write');
  const [currentDrawing, setCurrentDrawing] = useState<string>('');
  const [drawingInterpretation, setDrawingInterpretation] = useState<string>('');
  const [wordCount, setWordCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const journals = await getJournalEntries();
      const moodCheckins = await getMoodCheckins();
      setEntries(journals);
      setCheckins(moodCheckins);
    };
    loadData();
  }, []);

  useEffect(() => {
    setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0);
  }, [content]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(e =>
      e.content.toLowerCase().includes(q) ||
      e.prompt.toLowerCase().includes(q) ||
      (e.aiSummary && e.aiSummary.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  const getMoodForDate = useCallback((date: string): MoodCheckin | undefined => {
    return checkins.find(c => c.date === date);
  }, [checkins]);

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);
    setContent(prev => prev ? prev : prompt + '\n\n');
    setMode('write');
  };

  const handleSave = async () => {
    if (!content.trim() && !currentDrawing) return;
    setSaving(true);
    setShowSummary(false);
    setShowEncouragement(true);

    const emojis = ['✨', '💝', '🌟', '🫂', '💖', '🌈', '⭐'];
    setFloatingEmoji(emojis[Math.floor(Math.random() * emojis.length)]);

    await new Promise(r => setTimeout(r, 600));
    const now = new Date().toISOString();
    const summary = generateJournalSummary(content);
    const entry: Omit<JournalEntry, 'id'> = {
      date: format(new Date(), 'yyyy-MM-dd'),
      content: content.trim(),
      prompt: selectedPrompt,
      isPrivate,
      aiSummary: summary,
      drawing: currentDrawing || undefined,
      drawingAiInterpretation: drawingInterpretation || undefined,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
    };
    await saveJournalEntry(entry);
    const updatedEntries = await getJournalEntries();
    setEntries(updatedEntries);
    setAiSummary(summary);
    setShowSummary(true);
    setContent('');
    setSelectedPrompt('');
    setIsPrivate(false);
    setCurrentDrawing('');
    setDrawingInterpretation('');
    setSaving(false);

    setTimeout(() => {
      setShowEncouragement(false);
      setFloatingEmoji(null);
    }, 2500);
  };

  const handleDelete = async (id: string) => {
    await deleteJournalEntry(id);
    const updatedEntries = await getJournalEntries();
    setEntries(updatedEntries);
    setDeleteConfirm(null);
    setExpandedId(null);
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEntries = entries.filter(e => e.date === today);

  return (
    <>
      <Navbar />
      {floatingEmoji && <FloatingEmoji emoji={floatingEmoji} duration={2.5} />}

      <div className="min-h-screen bg-[#fafafa] pt-14 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Page Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="py-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#0a0a0a] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-[#9a9a9a] uppercase tracking-widest">Journal</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-black text-[#0a0a0a] leading-tight tracking-tight">
                  Your Safe Space
                </h1>
                <p className="text-[#9a9a9a] mt-1 text-sm">
                  {format(new Date(), 'EEEE, MMMM d')} · {todayEntries.length > 0 ? `${todayEntries.length} entr${todayEntries.length > 1 ? 'ies' : 'y'} today` : 'No entries yet today'}
                </p>
              </div>
              {showEncouragement && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-4 py-2 rounded-full bg-[#0a0a0a] text-white text-sm font-medium"
                >
                  Entry saved ✓
                </motion.div>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

            {/* ══════ LEFT — EDITOR ══════ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* Mode Switcher */}
              <div className="flex items-center gap-1 p-1 bg-black/[0.05] rounded-xl w-fit">
                <button
                  onClick={() => setMode('write')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === 'write'
                      ? 'bg-white text-[#0a0a0a] shadow-sm'
                      : 'text-[#9a9a9a] hover:text-[#555555]'
                  }`}
                >
                  <PenLine className="w-4 h-4" />
                  Write
                </button>
                <button
                  onClick={() => setMode('draw')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === 'draw'
                      ? 'bg-white text-[#0a0a0a] shadow-sm'
                      : 'text-[#9a9a9a] hover:text-[#555555]'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  Draw
                  {currentDrawing && (
                    <span className="w-2 h-2 rounded-full bg-[#8B7EC8] ml-0.5" />
                  )}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {mode === 'write' ? (
                  <motion.div
                    key="write"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Prompt Picker */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                      {/* Category Tabs */}
                      <div className="flex border-b border-black/[0.06]">
                        {PROMPT_CATEGORIES.map((cat, i) => {
                          const Icon = cat.icon;
                          return (
                            <button
                              key={cat.label}
                              onClick={() => setActiveCategory(i)}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all border-b-2 ${
                                activeCategory === i
                                  ? 'border-[#0a0a0a] text-[#0a0a0a]'
                                  : 'border-transparent text-[#9a9a9a] hover:text-[#555555]'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" style={{ color: activeCategory === i ? cat.color : undefined }} />
                              <span className="hidden sm:inline">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Prompts */}
                      <div className="p-4 space-y-2">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="space-y-2"
                          >
                            {PROMPT_CATEGORIES[activeCategory].prompts.map((prompt, i) => (
                              <motion.button
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => handlePromptClick(prompt)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 group ${
                                  selectedPrompt === prompt
                                    ? 'bg-[#0a0a0a] text-white'
                                    : 'bg-black/[0.03] text-[#555555] hover:bg-black/[0.06] hover:text-[#0a0a0a]'
                                }`}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors"
                                  style={{
                                    background: selectedPrompt === prompt
                                      ? 'white'
                                      : PROMPT_CATEGORIES[activeCategory].color
                                  }}
                                />
                                &ldquo;{prompt}&rdquo;
                              </motion.button>
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Writing Area */}
                    <div
                      className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                        isFocused ? 'shadow-lg border-black/20' : ''
                      }`}
                    >
                      {selectedPrompt && (
                        <div
                          className="px-5 pt-4 pb-2 text-xs text-[#9a9a9a] italic border-b border-black/[0.05] flex items-center gap-2"
                        >
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="line-clamp-1">&ldquo;{selectedPrompt}&rdquo;</span>
                          <button
                            onClick={() => setSelectedPrompt('')}
                            className="ml-auto text-[#9a9a9a] hover:text-[#555555] flex-shrink-0"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={selectedPrompt
                          ? 'Start with your thoughts...'
                          : 'What\'s on your mind today? Write freely — this is just for you.'
                        }
                        className="w-full min-h-[280px] bg-transparent text-[#0a0a0a] placeholder-[#9a9a9a]/40 resize-none p-5 text-[15px] leading-[1.75] outline-none"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      />
                      <div className="flex items-center justify-between px-5 py-3 border-t border-black/[0.05] flex-wrap gap-3">
                        <div className="flex items-center gap-4 text-xs text-[#9a9a9a]">
                          <span>{wordCount} words</span>
                          {currentDrawing && (
                            <span className="flex items-center gap-1 text-[#8B7EC8]">
                              <Palette className="w-3 h-3" />
                              Drawing attached
                            </span>
                          )}
                          <label className="flex items-center gap-1.5 cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={isPrivate}
                                onChange={e => setIsPrivate(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4.5 rounded-full bg-black/8 peer-checked:bg-[#0a0a0a] transition-colors" />
                              <div className="absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full bg-white peer-checked:translate-x-3.5 transition-transform shadow-sm" />
                            </div>
                            <Lock className="w-3 h-3" />
                            Vault
                          </label>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleSave}
                          disabled={(!content.trim() && !currentDrawing) || saving}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0a0a0a] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors"
                        >
                          {saving
                            ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                            : <><Save className="w-4 h-4" />Save Entry</>
                          }
                        </motion.button>
                      </div>
                    </div>

                    {/* AI Summary */}
                    <AnimatePresence>
                      {showSummary && aiSummary && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="glass-card rounded-2xl p-5"
                          style={{ borderLeft: '3px solid #8B7EC8' }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-[#8B7EC8]/15">
                              <Sparkles className="w-4 h-4 text-[#8B7EC8]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#0a0a0a]">Entry Reflection</h3>
                          </div>
                          {aiSummary.split('\n').map((line, i) => (
                            <p key={i} className={`leading-relaxed ${
                              i === 0
                                ? 'text-sm text-[#0a0a0a]/80 mb-2'
                                : 'text-xs text-[#9a9a9a] mt-1'
                            }`}>
                              {line}
                            </p>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="draw"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DrawingCanvas
                      onSave={(imageData, interpretation) => {
                        setCurrentDrawing(imageData);
                        setDrawingInterpretation(interpretation || '');
                        setMode('write');
                      }}
                      initialImage={currentDrawing}
                    />
                    {currentDrawing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 p-3 rounded-xl bg-[#8B7EC8]/8 border border-[#8B7EC8]/20 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 text-[#8B7EC8]" />
                        <p className="text-xs text-[#555555]">
                          Drawing saved — tap <strong>Write</strong> to add text, or save the entry as is.
                        </p>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSave}
                          disabled={saving}
                          className="ml-auto px-3 py-1.5 rounded-lg bg-[#0a0a0a] text-white text-xs font-medium flex-shrink-0"
                        >
                          Save Entry
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ══════ RIGHT — HISTORY ══════ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* History Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0a0a0a] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#9a9a9a]" />
                  Past Entries
                </h2>
                <span className="text-xs bg-black/[0.06] text-[#555555] px-2.5 py-1 rounded-full font-medium">
                  {entries.length} total
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search your entries..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-black/[0.08] text-sm text-[#0a0a0a] placeholder-[#9a9a9a] focus:border-black/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Entry List */}
              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 scrollbar-hide">
                <AnimatePresence mode="popLayout">
                  {filteredEntries.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-2xl p-10 text-center border border-black/[0.06]"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-black/[0.04] flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-6 h-6 text-[#9a9a9a]" />
                      </div>
                      <h3 className="text-sm font-semibold text-[#0a0a0a] mb-1">
                        {searchQuery ? 'No matches found' : 'Your story starts here'}
                      </h3>
                      <p className="text-xs text-[#9a9a9a]">
                        {searchQuery
                          ? 'Try a different search term.'
                          : 'Write your first entry — your thoughts deserve space.'}
                      </p>
                    </motion.div>
                  ) : (
                    filteredEntries.map((entry, i) => {
                      const mood = getMoodForDate(entry.date);
                      const moodInfo = mood ? MOOD_LIST.find(m => m.type === mood.mood) : null;
                      const isExpanded = expandedId === entry.id;
                      const timeAgo = formatDistanceToNow(parseISO(entry.createdAt), { addSuffix: true });

                      return (
                        <motion.div
                          key={entry.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: i * 0.03 }}
                          className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden hover:border-black/10 transition-all hover:shadow-sm"
                        >
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                            className="w-full text-left p-4"
                          >
                            {/* Top Row */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5 text-xs text-[#9a9a9a]">
                                <Clock className="w-3 h-3" />
                                <span>{timeAgo}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {entry.drawing && (
                                  <span className="w-5 h-5 rounded-md bg-[#8B7EC8]/10 flex items-center justify-center">
                                    <Palette className="w-3 h-3 text-[#8B7EC8]" />
                                  </span>
                                )}
                                {entry.isPrivate && (
                                  <span className="w-5 h-5 rounded-md bg-[#D4A0A0]/15 flex items-center justify-center">
                                    <Lock className="w-3 h-3 text-[#D4A0A0]" />
                                  </span>
                                )}
                                {moodInfo && (
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                      color: MOOD_COLORS[moodInfo.type as MoodType],
                                      background: `${MOOD_COLORS[moodInfo.type as MoodType]}15`
                                    }}
                                  >
                                    {moodInfo.emoji}
                                  </span>
                                )}
                                {isExpanded
                                  ? <ChevronUp className="w-3.5 h-3.5 text-[#9a9a9a]" />
                                  : <ChevronDown className="w-3.5 h-3.5 text-[#9a9a9a]" />
                                }
                              </div>
                            </div>

                            {/* Content Preview */}
                            <p className="text-sm text-[#0a0a0a] leading-relaxed line-clamp-2">
                              {entry.content || 'Drawing only'}
                            </p>

                            {/* Date Badge */}
                            <div className="mt-2 text-[11px] text-[#9a9a9a]">
                              {format(parseISO(entry.createdAt), 'MMM d, yyyy')}
                            </div>
                          </button>

                          {/* Expanded */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 space-y-3 border-t border-black/[0.05] pt-3">
                                  {entry.prompt && (
                                    <p className="text-xs text-[#9a9a9a] italic flex items-center gap-1.5">
                                      <MessageSquare className="w-3 h-3 flex-shrink-0" />
                                      &ldquo;{entry.prompt}&rdquo;
                                    </p>
                                  )}
                                  <p className="text-sm text-[#0a0a0a] leading-relaxed whitespace-pre-wrap">
                                    {entry.content}
                                  </p>

                                  {/* Drawing */}
                                  {entry.drawing && (
                                    <div className="rounded-xl overflow-hidden border border-black/[0.06]">
                                      <img
                                        src={entry.drawing}
                                        alt="Journal drawing"
                                        className="w-full"
                                      />
                                      {entry.drawingAiInterpretation && (
                                        <div className="p-3 bg-gradient-to-r from-[#8B7EC8]/8 to-[#6B9BD2]/8 border-t border-[#8B7EC8]/15">
                                          <div className="flex items-center gap-1.5 mb-2">
                                            <Sparkles className="w-3 h-3 text-[#8B7EC8]" />
                                            <span className="text-xs font-semibold text-[#8B7EC8]">AI Reading</span>
                                          </div>
                                          {entry.drawingAiInterpretation.split('\n').map((line, li) => (
                                            <p key={li} className="text-xs text-[#555555] leading-relaxed">
                                              {line}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* AI Summary */}
                                  {entry.aiSummary && (
                                    <div className="p-3 rounded-xl bg-black/[0.03] border border-black/[0.05]">
                                      <p className="text-[11px] font-semibold text-[#9a9a9a] flex items-center gap-1 mb-1.5">
                                        <Sparkles className="w-3 h-3" />Entry Reflection
                                      </p>
                                      {entry.aiSummary.split('\n').map((line, li) => (
                                        <p key={li} className="text-xs text-[#555555] leading-relaxed">
                                          {line}
                                        </p>
                                      ))}
                                    </div>
                                  )}

                                  {/* Delete */}
                                  <div className="flex justify-end">
                                    {deleteConfirm === entry.id ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-[#D4A0A0]">Delete this entry?</span>
                                        <button
                                          onClick={() => handleDelete(entry.id)}
                                          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-medium transition-colors"
                                        >
                                          Yes, delete
                                        </button>
                                        <button
                                          onClick={() => setDeleteConfirm(null)}
                                          className="text-xs px-3 py-1.5 rounded-lg bg-black/[0.04] text-[#9a9a9a] hover:bg-black/[0.06] transition-colors"
                                        >
                                          Keep
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setDeleteConfirm(entry.id)}
                                        className="flex items-center gap-1 text-xs text-[#9a9a9a] hover:text-red-400 transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
