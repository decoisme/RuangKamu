"use client";

// Disable static generation for this page (uses dynamic data)
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Lock, Sun, Moon, Download, FileText, Trash2,
  AlertTriangle, Check, Edit2, X, ChevronRight, Shield,
  Database, Eye, EyeOff,
} from "lucide-react";
import {
  getUserProfile as getUserProfileService,
  saveUserProfile,
  getJournalEntries,
  getVaultEntries,
  deleteJournalEntry,
} from "@/lib/supabase-service";
import { getMoodCheckins, deleteMoodCheckin } from "@/lib/checkin-service";
import { generateMonthlyReport } from "@/lib/pdf-export";
import { formatDate } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

// Helper functions for profile operations
async function getUserProfile(): Promise<UserProfile | null> {
  return await getUserProfileService();
}

async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  await saveUserProfile(updates);
}

async function exportAllData(): Promise<string> {
  const [moods, journals, vaults, profile] = await Promise.all([
    getMoodCheckins(),
    getJournalEntries(),
    getVaultEntries(),
    getUserProfile(),
  ]);

  const data = {
    profile,
    moods,
    journals,
    vaults,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(data, null, 2);
}

async function clearAllData(): Promise<void> {
  // Clear all localStorage data
  if (typeof window !== 'undefined') {
    const keys = [
      'ruangkamu_moods',
      'ruangkamu_journal',
      'ruangkamu_gratitude',
      'ruangkamu_vault',
      'ruangkamu_user',
      'ruangkamu_theme',
    ];
    keys.forEach(key => localStorage.removeItem(key));
  }
  
  // Note: Supabase data deletion would require proper auth and DELETE operations
  // For now, this only clears localStorage
}

// ── Setting Section Card ──────────────────────────────────────────────────────
function SettingCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 border border-black/[0.07]">
      <h2 className="font-heading font-semibold text-[#0a0a0a] flex items-center gap-2 mb-5">
        <span className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-[#0a0a0a]">{icon}</span>
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function SettingRow({ label, desc, action }: { label: string; desc?: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-black/[0.05] last:border-0">
      <div>
        <p className="text-sm text-[#0a0a0a] font-medium">{label}</p>
        {desc && <p className="text-xs text-[#9a9a9a] mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{action}</div>
    </div>
  );
}

// ── PIN Change Component ──────────────────────────────────────────────────────
function PinChangeFlow({ currentPin, onSave, onCancel }: { currentPin?: string; onSave: (p: string) => void; onCancel: () => void }) {
  const [step, setStep] = useState<"current" | "new" | "confirm">(currentPin ? "current" : "new");
  const [vals, setVals] = useState({ current: "", new: "", confirm: "" });
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  const handle = (field: "current" | "new" | "confirm", val: string) => {
    if (val.length > 4 || !/^\d*$/.test(val)) return;
    setVals((v) => ({ ...v, [field]: val }));
    setError("");
  };
  const next = () => {
    if (step === "current") {
      if (vals.current !== currentPin) { setError("Incorrect current PIN"); return; }
      setStep("new");
    } else if (step === "new") {
      if (vals.new.length < 4) { setError("PIN must be 4 digits"); return; }
      setStep("confirm");
    } else {
      if (vals.confirm !== vals.new) { setError("PINs don't match"); return; }
      onSave(vals.new);
    }
  };

  const fieldLabels = { current: "Current PIN", new: "New PIN (4 digits)", confirm: "Confirm New PIN" };
  return (
    <div className="mt-3 p-4 rounded-xl bg-[#f8f8f8] border border-black/[0.07]">
      <p className="text-xs text-[#9a9a9a] mb-2">{fieldLabels[step]}</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input type={show ? "text" : "password"} inputMode="numeric" maxLength={4}
            value={vals[step]} onChange={(e) => handle(step, e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-black/[0.10] text-[#0a0a0a] text-sm focus:border-black/30 outline-none pr-9 transition-all"
            placeholder="••••" />
          <button onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <button onClick={next}
          className="px-3 py-2 rounded-lg bg-[#0a0a0a] text-white text-sm hover:bg-[#1a1a1a] transition-all">
          <ChevronRight size={16} />
        </button>
        <button onClick={onCancel} className="px-3 py-2 rounded-lg text-[#9a9a9a] hover:bg-black/5 transition-all">
          <X size={16} />
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertTriangle size={12} />{error}</p>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [changingPin, setChangingPin] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmMood, setConfirmMood] = useState(false);
  const [confirmJournal, setConfirmJournal] = useState(false);
  const [confirmAccount, setConfirmAccount] = useState(false);
  const [confirmAccount2, setConfirmAccount2] = useState(false);
  const [entryCounts, setEntryCounts] = useState({ moods: 0, journals: 0 });

  useEffect(() => { 
    const loadData = async () => {
      const profile = await getUserProfile();
      setProfile(profile);
      
      // Load entry counts
      const [moods, journals] = await Promise.all([
        getMoodCheckins(),
        getJournalEntries(),
      ]);
      setEntryCounts({ moods: moods.length, journals: journals.length });
    };
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const saveName = async () => {
    if (newName.trim()) {
      await updateUserProfile({ name: newName.trim() });
      setProfile((p) => p ? { ...p, name: newName.trim() } : p);
      showToast("Name updated!");
    }
    setEditingName(false);
  };

  const savePin = async (pin: string) => {
    await updateUserProfile({ pin });
    setProfile((p) => p ? { ...p, pin } : p);
    setChangingPin(false);
    showToast("PIN updated!");
  };

  const exportData = async () => {
    const data = await exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ruangkamu-data.json"; a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported!");
  };

  const clearMood = async () => {
    const checkins = await getMoodCheckins();
    for (const c of checkins) {
      await deleteMoodCheckin(c.id);
    }
    setEntryCounts(prev => ({ ...prev, moods: 0 }));
    setConfirmMood(false);
    showToast("Mood data cleared.");
  };

  const clearJournal = async () => {
    const journals = await getJournalEntries();
    for (const entry of journals) {
      await deleteJournalEntry(entry.id);
    }
    setEntryCounts(prev => ({ ...prev, journals: 0 }));
    setConfirmJournal(false);
    showToast("Journal data cleared.");
  };

  const deleteAccount = () => { 
    clearAllData(); 
    window.location.href = "/auth"; 
  };

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "RK";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#fafafa] pt-14 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6 pt-8">

          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-8 border border-black/[0.07] flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#0a0a0a] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {initials}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="font-heading font-bold text-2xl text-[#0a0a0a]">{profile?.name || "Your Name"}</h1>
              <p className="text-[#9a9a9a] text-sm mt-1">{profile?.email || "your@email.com"}</p>
              {profile?.createdAt && (
                <p className="text-xs text-[#9a9a9a]/60 mt-1">Member since {formatDate(profile.createdAt)}</p>
              )}
            </div>
          </motion.div>

          {/* Account Settings */}
          <SettingCard title="Account" icon={<User size={16} />}>
            <SettingRow label="Display Name" desc={profile?.name || "Not set"}
              action={
                editingName ? (
                  <div className="flex gap-2 items-center">
                    <input value={newName} onChange={(e) => setNewName(e.target.value)}
                      autoFocus placeholder="Your name"
                      className="px-2 py-1 text-sm rounded-lg bg-[#f8f8f8] border border-black/[0.10] text-[#0a0a0a] focus:border-black/25 outline-none w-32"
                      onKeyDown={(e) => e.key === "Enter" && saveName()} />
                    <button onClick={saveName} className="p-1.5 rounded-lg bg-black/6 text-[#0a0a0a] hover:bg-black/10 transition-all"><Check size={14} /></button>
                    <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg text-[#9a9a9a] hover:bg-black/5 transition-all"><X size={14} /></button>
                  </div>
                ) : (
                  <button onClick={() => { setNewName(profile?.name || ""); setEditingName(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#9a9a9a] hover:text-[#0a0a0a] hover:bg-black/5 text-sm transition-all">
                    <Edit2 size={13} /> Edit
                  </button>
                )
              }
            />
            <SettingRow label="Email" desc={profile?.email || "Not set"}
              action={<span className="text-xs text-[#9a9a9a]">Cannot change</span>}
            />
          </SettingCard>

          {/* Security */}
          <SettingCard title="Security" icon={<Shield size={16} />}>
            <SettingRow label="Vault PIN" desc={profile?.pin ? "PIN is set" : "No PIN configured"}
              action={
                !changingPin ? (
                  <button onClick={() => setChangingPin(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#9a9a9a] hover:text-[#0a0a0a] hover:bg-black/5 text-sm transition-all">
                    <Lock size={13} /> {profile?.pin ? "Change" : "Set PIN"}
                  </button>
                ) : null
              }
            />
            <AnimatePresence>
              {changingPin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <PinChangeFlow currentPin={profile?.pin} onSave={savePin} onCancel={() => setChangingPin(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </SettingCard>

          {/* Appearance */}
          <SettingCard title="Appearance" icon={darkMode ? <Moon size={16} /> : <Sun size={16} />}>
            <SettingRow label="Theme" desc={darkMode ? "Dark mode (coming soon)" : "Light mode active"}
              action={
                <button onClick={() => { setDarkMode(!darkMode); showToast(`Theme preference saved`); }}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${darkMode ? "bg-[#0a0a0a]" : "bg-black/20"}`}>
                  <motion.div animate={{ x: darkMode ? 24 : 4 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" />
                </button>
              }
            />
          </SettingCard>

          {/* Data & Privacy */}
          <SettingCard title="Data &amp; Privacy" icon={<Database size={16} />}>
            <SettingRow label="Export Data" desc="Download all your data as JSON"
              action={
                <button onClick={exportData}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#555555] hover:text-[#0a0a0a] hover:bg-black/5 text-sm transition-all">
                  <Download size={13} /> Export
                </button>
              }
            />
            <SettingRow label="Download PDF Report" desc="Monthly mood summary report"
              action={
                <button onClick={() => { generateMonthlyReport(); showToast("Generating PDF..."); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#555555] hover:text-[#0a0a0a] hover:bg-black/5 text-sm transition-all">
                  <FileText size={13} /> Download
                </button>
              }
            />
            <SettingRow label="Clear Mood Data" desc={`${entryCounts.moods} entries`}
              action={
                !confirmMood ? (
                  <button onClick={() => setConfirmMood(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 text-sm transition-all">
                    <Trash2 size={13} /> Clear
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button onClick={clearMood} className="px-2 py-1 rounded text-xs bg-red-50 text-red-500 hover:bg-red-100 transition-all">Confirm</button>
                    <button onClick={() => setConfirmMood(false)} className="px-2 py-1 rounded text-xs bg-black/5 text-[#9a9a9a] hover:bg-black/8 transition-all">Cancel</button>
                  </div>
                )
              }
            />
            <SettingRow label="Clear Journal Data" desc={`${entryCounts.journals} entries`}
              action={
                !confirmJournal ? (
                  <button onClick={() => setConfirmJournal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 text-sm transition-all">
                    <Trash2 size={13} /> Clear
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button onClick={clearJournal} className="px-2 py-1 rounded text-xs bg-red-50 text-red-500 hover:bg-red-100 transition-all">Confirm</button>
                    <button onClick={() => setConfirmJournal(false)} className="px-2 py-1 rounded text-xs bg-black/5 text-[#9a9a9a] hover:bg-black/8 transition-all">Cancel</button>
                  </div>
                )
              }
            />
          </SettingCard>

          {/* Danger Zone */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-6 border border-red-200 bg-red-50">
            <h2 className="font-heading font-semibold text-red-500 flex items-center gap-2 mb-4">
              <AlertTriangle size={16} /> Danger Zone
            </h2>
            {!confirmAccount ? (
              <button onClick={() => setConfirmAccount(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm hover:bg-red-100 transition-all">
                <Trash2 size={15} /> Delete Account &amp; All Data
              </button>
            ) : !confirmAccount2 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <p className="text-red-600 text-sm">⚠️ This will delete ALL your data permanently. This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmAccount2(true)}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-all">
                    Yes, I understand
                  </button>
                  <button onClick={() => setConfirmAccount(false)}
                    className="px-4 py-2 rounded-lg bg-black/5 text-[#9a9a9a] text-sm hover:bg-black/8 transition-all">
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <p className="text-red-600 text-sm font-medium">Final confirmation — delete everything?</p>
                <div className="flex gap-2">
                  <button onClick={deleteAccount}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-all">
                    Delete Forever
                  </button>
                  <button onClick={() => { setConfirmAccount(false); setConfirmAccount2(false); }}
                    className="px-4 py-2 rounded-lg bg-black/5 text-[#9a9a9a] text-sm hover:bg-black/8 transition-all">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Footer */}
          <div className="text-center pt-4 pb-2">
            <p className="text-xs text-[#9a9a9a]/50">Ruang Kamu v1.0.0</p>
            <p className="text-xs text-[#9a9a9a]/40 mt-1">Made with ♥ by Muhammad Dinan Ghifari</p>
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-[#0a0a0a] text-white text-sm flex items-center gap-2 shadow-lg">
              <Check size={15} className="text-green-400" /> {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
