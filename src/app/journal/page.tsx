'use client';

// Disable static generation for this page (uses dynamic data)
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Save, Sparkles, Trash2, Search, ChevronDown, ChevronUp,
  Menu, X, LayoutDashboard, SmilePlus, BarChart3, Brain, Lock, User,
  Loader2, Shield, FileText, Calendar, MessageSquare, Check
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  JOURNAL_PROMPTS, MOOD_LIST, MOOD_COLORS,
  type JournalEntry, type MoodEntry, type MoodType
} from '@/lib/types';
import { FloatingEmoji } from '@/components/ui/FloatingEmoji';
import { RandomEncouragement } from '@/components/ui/EncouragementBadge';
import { MoodInsights } from '@/components/ui/MoodInsights';
import { DrawingCanvas } from '@/components/ui/DrawingCanvas';

// ==================== SUPABASE INTEGRATION ====================
import {
  getJournalEntries as getJournalEntriesService,
  saveJournalEntry as saveJournalEntryService,
  deleteJournalEntry as deleteJournalEntryService,
  getMoodEntries as getMoodEntriesService,
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

async function getMoodEntries(): Promise<MoodEntry[]> {
  return await getMoodEntriesService();
}

// ==================== INLINE AI HELPER ====================
function generateJournalSummary(content: string): string {
  if (!content || content.trim().length < 20) return 'Entry too short for summary.';
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const keywords: string[] = [];
  const emotionWords: Record<string, string> = {
    happy: '😊', grateful: '🙏', sad: '😢', anxious: '😰', tired: '😴',
    angry: '😤', love: '❤️', hope: '✨', fear: '😨', peace: '☮️',
    stress: '😩', joy: '🎉', lonely: '🥺', proud: '💪', confused: '😕'
  };
  const lower = content.toLowerCase();
  for (const [word, emoji] of Object.entries(emotionWords)) {
    if (lower.includes(word)) keywords.push(`${emoji} ${word}`);
  }
  const summary = sentences.length > 2
    ? `${sentences[0].trim()}. ${sentences[Math.floor(sentences.length / 2)].trim()}.`
    : sentences[0]?.trim() || content.slice(0, 100);
  const emotionLine = keywords.length > 0 ? ` Emotions detected: ${keywords.join(', ')}.` : '';
  return `${summary}${emotionLine}`;
}

// ==================== MAIN PAGE ====================
export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [content, setContent] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [floatingEmoji, setFloatingEmoji] = useState<string | null>(null);
  const [showDrawing, setShowDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<string>("");
  const [drawingInterpretation, setDrawingInterpretation] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      const journals = await getJournalEntries();
      const moods = await getMoodEntries();
      setEntries(journals);
      setMoodEntries(moods);
    };
    loadData();
    
    // Pick 4 random prompts
    const shuffled = [...JOURNAL_PROMPTS].sort(() => Math.random() - 0.5);
    setPrompts(shuffled.slice(0, 4));
  }, []);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(e =>
      e.content.toLowerCase().includes(q) ||
      e.prompt.toLowerCase().includes(q) ||
      (e.aiSummary && e.aiSummary.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  const getMoodForDate = useCallback((date: string): MoodEntry | undefined => {
    return moodEntries.find(m => m.date === date);
  }, [moodEntries]);

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);
    setContent(prompt + '\n\n');
  };

  const handleSave = async () => {
    if (!content.trim() && !currentDrawing) return;
    setSaving(true);
    setShowSummary(false);
    setShowEncouragement(true);
    
    // Random encouraging emoji
    const emojis = ['✨', '💝', '🌟', '🫂', '💖', '🌈', '⭐'];
    setFloatingEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    
    await new Promise(r => setTimeout(r, 800));
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
    setShowDrawing(false);
    setSaving(false);
    
    setTimeout(() => {
      setShowEncouragement(false);
      setFloatingEmoji(null);
    }, 2000);
  };

  const handleDelete = async (id: string) => {
    await deleteJournalEntry(id);
    const updatedEntries = await getJournalEntries();
    setEntries(updatedEntries);
    setDeleteConfirm(null);
    setExpandedId(null);
  };

  return (
    <>
      <Navbar />
      {floatingEmoji && <FloatingEmoji emoji={floatingEmoji} duration={2} />}
      
      <div className="min-h-screen bg-[#fafafa] pt-14 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-black/6">
                <BookOpen className="w-6 h-6 text-[#0a0a0a]" />
              </div>
              <h1 className="text-3xl font-bold text-[#0a0a0a]" style={{ fontFamily: 'var(--font-heading)' }}>
                Journal Space{' '}
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block"
                >
                  ✍️
                </motion.span>
              </h1>
            </div>
            <p className="text-[#9a9a9a] ml-14">Write freely. No one is judging you here :)</p>
            {showEncouragement && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="ml-14 mt-2"
              >
                <RandomEncouragement trigger={showEncouragement} />
              </motion.div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* ===== LEFT COLUMN — Editor ===== */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="lg:col-span-3 space-y-6">

              {/* Mood Insights */}
              <MoodInsights 
                entries={moodEntries}
                todayScore={moodEntries.find(e => e.date === format(new Date(), 'yyyy-MM-dd'))?.score}
              />

              {/* Drawing Canvas */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-[#9a9a9a] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Visual Expression
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDrawing(!showDrawing)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-black/[0.08] hover:bg-black/4 transition-colors"
                  >
                    {showDrawing ? 'Hide Canvas' : 'Draw Your Feelings'}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showDrawing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <DrawingCanvas
                        onSave={(imageData, interpretation) => {
                          setCurrentDrawing(imageData);
                          setDrawingInterpretation(interpretation || '');
                        }}
                        initialImage={currentDrawing}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {!showDrawing && currentDrawing && (
                  <div className="p-4 rounded-xl bg-[#f8f8f8] border border-black/[0.06]">
                    <p className="text-xs text-[#555555] flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      Drawing saved — it will be included with your journal entry
                    </p>
                  </div>
                )}
              </div>

              {/* Prompt Chips */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-medium text-[#9a9a9a] mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />Need a starting point?
                </h3>
                <div className="flex flex-wrap gap-2">
                  {prompts.map((prompt, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handlePromptClick(prompt)}
                      className={`px-4 py-2 rounded-xl text-sm transition-all border ${selectedPrompt === prompt
                        ? 'bg-black/6 text-[#0a0a0a] border-black/15'
                        : 'bg-black/3 text-[#9a9a9a] border-black/[0.06] hover:bg-black/5 hover:text-[#0a0a0a]'}`}>
                      &ldquo;{prompt}&rdquo;
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Text Editor */}
              <div className="glass-card rounded-2xl p-6">
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Start writing... let your thoughts flow freely."
                  className="w-full min-h-[300px] bg-[#f8f8f8] text-[#0a0a0a] placeholder-[#9a9a9a]/50 resize-y rounded-xl p-4 text-base leading-relaxed border border-black/[0.08] focus:border-black/25 transition-colors"
                  style={{ fontFamily: 'var(--font-sans)' }}
                />
                <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#9a9a9a]">
                      {content.length} characters
                      {currentDrawing && <span className="ml-2">+ drawing</span>}
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)}
                          className="sr-only peer" />
                        <div className="w-9 h-5 rounded-full bg-black/8 peer-checked:bg-[#0a0a0a]/20 transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#9a9a9a] peer-checked:bg-[#0a0a0a] peer-checked:translate-x-4 transition-all" />
                      </div>
                      <span className="text-xs text-[#9a9a9a] flex items-center gap-1"><Shield className="w-3 h-3" />Save to Vault</span>
                    </label>
                  </div>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleSave} disabled={(!content.trim() && !currentDrawing) || saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0a0a0a] text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Entry'}
                  </motion.button>
                </div>
              </div>

              {/* AI Summary */}
              <AnimatePresence>
                {showSummary && aiSummary && (
                  <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }} className="glass-card rounded-2xl p-6 border-l-4 border-[#0a0a0a]">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-[#0a0a0a]" />
                      <h3 className="text-sm font-semibold text-[#0a0a0a]">AI Summary</h3>
                    </div>
                    <p className="text-[#0a0a0a] text-sm leading-relaxed">{aiSummary}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ===== RIGHT COLUMN — History ===== */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-[#0a0a0a] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#555555]" />Past Entries
                </h2>
                <span className="text-xs text-[#9a9a9a] bg-black/5 px-2 py-1 rounded-lg">{entries.length} total</span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search entries..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/4 border border-black/[0.07] text-sm text-[#0a0a0a] placeholder-[#9a9a9a] focus:border-black/25 transition-colors" />
              </div>

              {/* Entry List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {filteredEntries.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="glass-card rounded-2xl p-8 text-center">
                      <BookOpen className="w-12 h-12 text-[#9a9a9a]/30 mx-auto mb-4" />
                      <h3 className="text-[#0a0a0a] font-medium mb-1">No entries yet</h3>
                      <p className="text-[#9a9a9a] text-sm">Start writing above — your thoughts deserve a space.</p>
                    </motion.div>
                  ) : filteredEntries.map((entry, i) => {
                    const mood = getMoodForDate(entry.date);
                    const moodInfo = mood ? MOOD_LIST.find(m => m.type === mood.mood) : null;
                    const isExpanded = expandedId === entry.id;
                    return (
                      <motion.div key={entry.id} layout initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.03 }}
                        className="glass-card rounded-xl overflow-hidden">
                        <button onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                          className="w-full text-left p-4 hover:bg-white/3 transition-colors">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#9a9a9a]" />
                              <span className="text-xs text-[#9a9a9a]">
                                {format(parseISO(entry.createdAt), 'MMM d, yyyy · h:mm a')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {entry.isPrivate && <Shield className="w-3 h-3 text-[#D4A0A0]" />}
                              {moodInfo && (
                                <span className="text-xs px-2 py-0.5 rounded-full border"
                                  style={{ color: MOOD_COLORS[moodInfo.type as MoodType], borderColor: `${MOOD_COLORS[moodInfo.type as MoodType]}40`, backgroundColor: `${MOOD_COLORS[moodInfo.type as MoodType]}15` }}>
                                  {moodInfo.emoji} {moodInfo.label}
                                </span>
                              )}
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-[#9a9a9a]" /> : <ChevronDown className="w-4 h-4 text-[#9a9a9a]" />}
                            </div>
                          </div>
                          <p className="text-sm text-[#0a0a0a] line-clamp-2">
                            {entry.content.slice(0, 100)}{entry.content.length > 100 ? '...' : ''}
                          </p>
                          {entry.aiSummary && !isExpanded && (
                            <p className="text-xs text-[#0a0a0a]/50 mt-1.5 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />{entry.aiSummary.slice(0, 60)}...
                            </p>
                          )}
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="px-4 pb-4 space-y-3 border-t border-black/6 pt-3">
                                {entry.prompt && (
                                  <p className="text-xs text-[#555555] italic">&ldquo;{entry.prompt}&rdquo;</p>
                                )}
                                <p className="text-sm text-[#0a0a0a] leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                                
                                {/* Drawing */}
                                {entry.drawing && (
                                  <div className="mt-3">
                                    <img 
                                      src={entry.drawing} 
                                      alt="Journal drawing"
                                      className="w-full rounded-lg border border-black/[0.08]"
                                    />
                                    {entry.drawingAiInterpretation && (
                                      <div className="mt-2 p-3 rounded-lg bg-[#8B7EC8]/10 border border-[#8B7EC8]/20">
                                        <p className="text-xs text-[#555555] flex items-center gap-1 mb-1">
                                          <Sparkles className="w-3 h-3 text-[#8B7EC8]" />
                                          AI Interpretation
                                        </p>
                                        <p className="text-xs text-[#0a0a0a]/70">{entry.drawingAiInterpretation}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {entry.aiSummary && (
                                  <div className="bg-black/4 rounded-lg p-3">
                                    <p className="text-xs text-[#0a0a0a]/50 flex items-center gap-1 mb-1"><Sparkles className="w-3 h-3" />AI Summary</p>
                                    <p className="text-xs text-[#0a0a0a]/70">{entry.aiSummary}</p>
                                  </div>
                                )}
                                <div className="flex justify-end">
                                  {deleteConfirm === entry.id ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-[#D4A0A0]">Delete?</span>
                                      <button onClick={() => handleDelete(entry.id)}
                                        className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">Yes</button>
                                      <button onClick={() => setDeleteConfirm(null)}
                                        className="text-xs px-3 py-1 rounded-lg bg-black/4 text-[#9a9a9a] hover:bg-black/6 transition-colors">No</button>
                                    </div>
                                  ) : (
                                    <button onClick={() => setDeleteConfirm(entry.id)}
                                      className="flex items-center gap-1 text-xs text-[#9a9a9a] hover:text-red-500 transition-colors p-1">
                                      <Trash2 className="w-3.5 h-3.5" />Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
