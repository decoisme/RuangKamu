"use client";

// Disable static generation for this page (uses dynamic data)
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Unlock, Plus, Trash2, X, Save,
  Shield, AlertTriangle, ChevronDown, ChevronUp,
  FileText, Clock,
} from "lucide-react";
import {
  getUserProfile as getUserProfileService,
  saveUserProfile,
  getVaultEntries as getVaultEntriesService,
  saveVaultEntry as saveVaultEntryService,
  deleteVaultEntry as deleteVaultEntryService,
} from "@/lib/supabase-service";
import { generateId, formatDate } from "@/lib/utils";
import type { VaultEntry, UserProfile } from "@/lib/types";

// Helper wrappers
async function getUserProfile(): Promise<UserProfile | null> {
  return await getUserProfileService();
}

async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  await saveUserProfile(updates);
}

async function getVaultEntries(): Promise<VaultEntry[]> {
  return await getVaultEntriesService();
}

async function saveVaultEntry(entry: Omit<VaultEntry, 'id'>): Promise<void> {
  await saveVaultEntryService(entry);
}

async function deleteVaultEntry(id: string): Promise<void> {
  await deleteVaultEntryService(id);
}

// ── PIN Input ─────────────────────────────────────────────────────────────────
function PinInput({ length = 4, onComplete }: { length?: number; onComplete: (pin: string) => void }) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handle = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < length - 1) refs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  };
  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }}
          type="password" inputMode="numeric" maxLength={1} value={d}
          onChange={(e) => handle(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 border-black/[0.12] bg-[#f8f8f8] text-[#0a0a0a] focus:border-[#0a0a0a] transition-all outline-none"
        />
      ))}
    </div>
  );
}

// ── Entry Card ────────────────────────────────────────────────────────────────
function EntryCard({ entry, onDelete }: { entry: VaultEntry; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <motion.div layout className="glass-card rounded-2xl p-5 border border-black/[0.07]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText size={18} className="text-[#0a0a0a]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#0a0a0a] truncate">{entry.title || "Untitled"}</h3>
            <p className="text-xs text-[#9a9a9a] mt-0.5 flex items-center gap-1">
              <Clock size={11} /> {formatDate(entry.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-[#9a9a9a] hover:text-[#0a0a0a] hover:bg-black/5 transition-all">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => setConfirm(true)}
            className="p-1.5 rounded-lg text-[#9a9a9a] hover:text-red-500 hover:bg-red-50 transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-black/[0.06]">
            <p className="text-[#555555] text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
          </motion.div>
        )}
        {confirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600 mb-3">Delete this entry permanently?</p>
            <div className="flex gap-2">
              <button onClick={onDelete}
                className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-all">
                Delete
              </button>
              <button onClick={() => setConfirm(false)}
                className="px-4 py-1.5 rounded-lg bg-black/5 text-[#9a9a9a] text-sm hover:bg-black/8 transition-all">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Add Entry Modal ───────────────────────────────────────────────────────────
function AddModal({ onSave, onClose }: { onSave: (t: string, c: string) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg bg-white rounded-3xl p-6 border border-black/[0.08] shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-lg text-[#0a0a0a]">New Private Entry</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#9a9a9a] hover:text-[#0a0a0a] hover:bg-black/5 transition-all">
            <X size={18} />
          </button>
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)"
          className="w-full px-4 py-3 rounded-xl bg-[#f8f8f8] border border-black/[0.08] text-[#0a0a0a] placeholder-[#9a9a9a] mb-3 focus:border-black/25 outline-none transition-all" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Write anything that's on your mind — this is private..." rows={6}
          className="w-full px-4 py-3 rounded-xl bg-[#f8f8f8] border border-black/[0.08] text-[#0a0a0a] placeholder-[#9a9a9a] resize-none focus:border-black/25 outline-none transition-all mb-4" />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[#9a9a9a] hover:text-[#0a0a0a] hover:bg-black/5 transition-all text-sm">
            Cancel
          </button>
          <button onClick={() => { if (content.trim()) { onSave(title, content); onClose(); } }}
            disabled={!content.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#0a0a0a] text-white text-sm font-medium hover:bg-[#1a1a1a] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2">
            <Save size={15} /> Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VaultPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [settingPin, setSettingPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [pinStep, setPinStep] = useState<"enter" | "new" | "confirm">("enter");
  const [pinError, setPinError] = useState("");
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteAll, setDeleteAll] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const p = await getUserProfile();
      setProfile(p);
      if (!p?.pin) setSettingPin(true);
      const vaultEntries = await getVaultEntries();
      setEntries(vaultEntries);
    };
    loadData();
  }, []);

  const handlePinEnter = (pin: string) => {
    if (pin === profile?.pin) { setUnlocked(true); setPinError(""); }
    else setPinError("Incorrect PIN. Try again.");
  };

  const handleNewPin = (pin: string) => { setNewPin(pin); setPinStep("confirm"); };

  const handleConfirmPin = async (pin: string) => {
    if (pin === newPin) {
      await updateUserProfile({ pin });
      setProfile((p) => p ? { ...p, pin } : p);
      setSettingPin(false);
      setUnlocked(true);
      setPinStep("enter");
    } else {
      setPinError("PINs don't match. Try again.");
      setPinStep("new");
    }
  };

  const handleSaveEntry = async (title: string, content: string) => {
    const now = new Date().toISOString();
    const entry: Omit<VaultEntry, 'id'> = { title, content, createdAt: now, updatedAt: now };
    await saveVaultEntry(entry);
    const updatedEntries = await getVaultEntries();
    setEntries(updatedEntries);
  };

  const handleDelete = async (id: string) => { 
    await deleteVaultEntry(id); 
    const updatedEntries = await getVaultEntries();
    setEntries(updatedEntries); 
  };
  const handleLock = () => { setUnlocked(false); setPinError(""); };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-14 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center pt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black/5 mb-4">
              {unlocked ? <Unlock size={28} className="text-[#0a0a0a]" /> : <Lock size={28} className="text-[#0a0a0a]" />}
            </div>
            <h1 className="font-heading font-bold text-3xl text-[#0a0a0a] mb-2">Private Vault</h1>
            <p className="text-[#9a9a9a]">Your most personal thoughts, locked away safely.</p>
          </motion.div>

          {/* PIN SETUP / ENTRY / UNLOCKED */}
          <AnimatePresence mode="wait">
            {settingPin && !unlocked && (
              <motion.div key="setup" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }} className="glass-card rounded-3xl p-8 border border-black/[0.07] text-center">
                <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center mx-auto mb-4">
                  <Shield size={24} className="text-[#0a0a0a]" />
                </div>
                <h2 className="font-heading font-bold text-xl text-[#0a0a0a] mb-2">
                  {pinStep === "new" ? "Create a PIN" : "Confirm Your PIN"}
                </h2>
                <p className="text-[#9a9a9a] text-sm mb-8">
                  {pinStep === "new" ? "Choose a 4-digit PIN to protect your vault." : "Enter the same PIN again to confirm."}
                </p>
                <PinInput key={pinStep} onComplete={pinStep === "new" ? handleNewPin : handleConfirmPin} />
                {pinError && <p className="text-red-500 text-sm mt-4">{pinError}</p>}
              </motion.div>
            )}

            {!settingPin && !unlocked && (
              <motion.div key="locked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }} className="glass-card rounded-3xl p-8 border border-black/[0.07] text-center">
                <div className="mb-4 flex justify-center gap-2">
                  {[...Array(4)].map((_, i) => <div key={i} className="w-2.5 h-2.5 rounded-full bg-black/20" />)}
                </div>
                <h2 className="font-heading font-bold text-xl text-[#0a0a0a] mb-2">Enter Your PIN</h2>
                <p className="text-[#9a9a9a] text-sm mb-8">This vault is locked. Enter your PIN to access it.</p>
                <PinInput key="enter" onComplete={handlePinEnter} />
                {pinError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-sm mt-4 flex items-center justify-center gap-1">
                    <AlertTriangle size={14} /> {pinError}
                  </motion.p>
                )}
              </motion.div>
            )}

            {unlocked && (
              <motion.div key="unlocked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Action Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Vault Unlocked
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowAdd(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a0a0a] text-white text-sm font-medium hover:bg-[#1a1a1a] transition-all">
                      <Plus size={16} /> New Entry
                    </button>
                    <button onClick={handleLock}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-black/[0.10] text-[#0a0a0a] hover:bg-black/4 text-sm transition-all">
                      <Lock size={16} /> Lock
                    </button>
                  </div>
                </div>

                {/* Entries */}
                {entries.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="glass-card rounded-3xl p-12 border border-black/[0.07] text-center">
                    <div className="w-20 h-20 rounded-2xl bg-black/4 flex items-center justify-center mx-auto mb-4">
                      <Lock size={32} className="text-[#0a0a0a]/20" />
                    </div>
                    <h3 className="font-heading font-semibold text-[#0a0a0a] mb-2">Your vault is empty</h3>
                    <p className="text-[#9a9a9a] text-sm mb-6">Add private notes that only you can see.</p>
                    <button onClick={() => setShowAdd(true)}
                      className="px-5 py-2.5 rounded-xl bg-[#0a0a0a] text-white text-sm font-medium hover:bg-[#1a1a1a] transition-all">
                      Add First Entry
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {entries.map((entry) => (
                        <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}>
                          <EntryCard entry={entry} onDelete={() => handleDelete(entry.id)} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Danger Zone */}
                <div className="mt-10 pt-6 border-t border-black/[0.06]">
                  <h3 className="text-sm font-medium text-[#9a9a9a] mb-3 uppercase tracking-wider">Danger Zone</h3>
                  {!deleteAll ? (
                    <button onClick={() => setDeleteAll(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition-all">
                      <Trash2 size={15} /> Delete All Vault Data
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="p-4 rounded-xl bg-red-50 border border-red-200">
                      <p className="text-red-600 text-sm mb-3">⚠️ This will permanently delete all vault entries. Are you sure?</p>
                      <div className="flex gap-2">
                        <button onClick={async () => { 
                        for (const e of entries) {
                          await deleteVaultEntry(e.id);
                        }
                        setEntries([]); 
                        setDeleteAll(false); 
                      }}
                          className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-all">
                          Yes, Delete All
                        </button>
                        <button onClick={() => setDeleteAll(false)}
                          className="px-4 py-2 rounded-lg bg-black/5 text-[#9a9a9a] text-sm hover:bg-black/8 transition-all">
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Modal */}
          <AnimatePresence>
            {showAdd && <AddModal onSave={handleSaveEntry} onClose={() => setShowAdd(false)} />}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
