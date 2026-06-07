"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { SmilePlus, BookOpen, BarChart3, Brain, Heart, Lock, ArrowRight, ChevronRight, Menu, X } from "lucide-react";

/* ── Decorative SVG Objects ──────────────────────────────────────────── */

function SmileyFace({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="32" cy="32" r="30" stroke="#0a0a0a" strokeWidth="2" fill="white"/>
      {/* Eyes */}
      <circle cx="22" cy="26" r="3.5" fill="#0a0a0a"/>
      <circle cx="42" cy="26" r="3.5" fill="#0a0a0a"/>
      {/* Smile */}
      <path d="M20 38 Q32 50 44 38" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Cheeks */}
      <circle cx="17" cy="36" r="4" fill="rgba(0,0,0,0.06)"/>
      <circle cx="47" cy="36" r="4" fill="rgba(0,0,0,0.06)"/>
    </svg>
  );
}

function SmileyStar({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="22" stroke="#0a0a0a" strokeWidth="1.5" fill="#f7f7f7"/>
      <circle cx="17" cy="20" r="2.5" fill="#0a0a0a"/>
      <circle cx="31" cy="20" r="2.5" fill="#0a0a0a"/>
      <path d="M15 30 Q24 39 33 30" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function SmileyMini({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="16" cy="16" r="14" stroke="#0a0a0a" strokeWidth="1.5" fill="white"/>
      <circle cx="11" cy="13" r="2" fill="#0a0a0a"/>
      <circle cx="21" cy="13" r="2" fill="#0a0a0a"/>
      <path d="M10 19 Q16 25 22 19" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function HeartShape({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M18 30 C18 30 4 20 4 11 C4 7 7 4 11 4 C14 4 17 6 18 8 C19 6 22 4 25 4 C29 4 32 7 32 11 C32 20 18 30 18 30Z"
        stroke="#0a0a0a" strokeWidth="1.5" fill="#f0f0f0"/>
    </svg>
  );
}

function StarShape({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M14 2 L16.9 10.6 L26 10.6 L18.6 16 L21.5 24.6 L14 19.2 L6.5 24.6 L9.4 16 L2 10.6 L11.1 10.6 Z"
        stroke="#0a0a0a" strokeWidth="1.5" fill="#f5f5f5" strokeLinejoin="round"/>
    </svg>
  );
}

function FloatingObjects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Large smiley - top right */}
      <motion.div className="absolute top-20 right-[8%] opacity-60 deco-face"
        animate={{ y: [0,-12,0], rotate: [0,4,0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
        <SmileyFace size={80} />
      </motion.div>
      {/* Medium smiley - left */}
      <motion.div className="absolute top-40 left-[5%] opacity-40"
        animate={{ y: [0,-8,0], rotate: [0,-3,0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
        <SmileyStar size={60} />
      </motion.div>
      {/* Mini smiley - bottom left */}
      <motion.div className="absolute bottom-32 left-[12%] opacity-50"
        animate={{ y: [0,-10,0], rotate: [0,5,0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}>
        <SmileyMini size={40} />
      </motion.div>
      {/* Mini smiley - bottom right */}
      <motion.div className="absolute bottom-44 right-[10%] opacity-40"
        animate={{ y: [0,-7,0], rotate: [0,-4,0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
        <SmileyMini size={36} />
      </motion.div>
      {/* Heart - middle right */}
      <motion.div className="absolute top-1/2 right-[6%] opacity-35"
        animate={{ y: [0,-9,0], scale: [1,1.08,1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}>
        <HeartShape size={44} />
      </motion.div>
      {/* Star - top left */}
      <motion.div className="absolute top-32 left-[14%] opacity-30"
        animate={{ y: [0,-6,0], rotate: [0,15,0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}>
        <StarShape size={32} />
      </motion.div>
      {/* Tiny circles */}
      {[
        { top: "15%", left: "22%", size: 8, delay: 0 },
        { top: "65%", left: "8%",  size: 6, delay: 2 },
        { top: "80%", right: "20%", size: 10, delay: 1 },
        { top: "30%", right: "18%", size: 6, delay: 3 },
      ].map((c, i) => (
        <motion.div key={i} className="absolute rounded-full bg-black/8 border border-black/12"
          style={{ width: c.size, height: c.size, top: c.top, left: (c as {left?: string}).left, right: (c as {right?: string}).right }}
          animate={{ y: [0,-8,0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: c.delay }} />
      ))}
    </div>
  );
}

const FEATURES = [
  { icon: SmilePlus, title: "Daily Mood Check-in",  desc: "Seven emotional states. One honest moment each day." },
  { icon: BookOpen,  title: "Journal Space",         desc: "A quiet place to write what you can't say out loud." },
  { icon: BarChart3, title: "Mood Analytics",        desc: "See your patterns. Understand what lifts you and what weighs you down." },
  { icon: Brain,     title: "AI Reflection",         desc: "Gentle insights from your own words. Like a thoughtful friend." },
  { icon: Heart,     title: "Coping Tools",          desc: "Breathing exercises and grounding techniques when you need them." },
  { icon: Lock,      title: "Private Vault",         desc: "Your most personal thoughts, locked behind a PIN. Completely yours." },
];

const STEPS = [
  { num: "01", title: "Check in your mood",     desc: "A few taps to capture how you're really feeling — with the triggers behind it." },
  { num: "02", title: "Write your thoughts",     desc: "Freeform journal or guided prompts. Whatever helps you process your day." },
  { num: "03", title: "Get insights & reflect",  desc: "See patterns emerge over time. Understand yourself better, week by week." },
];

function LandingNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/[0.07]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
            <span className="text-white text-xs font-black">R</span>
          </div>
          <span className="font-heading font-semibold text-[15px] text-[#0a0a0a] tracking-tight">Ruang Kamu</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-[13px] text-[#0a0a0a]/40 hover:text-[#0a0a0a] transition-colors">Features</a>
          <a href="#how"      className="text-[13px] text-[#0a0a0a]/40 hover:text-[#0a0a0a] transition-colors">How it works</a>
          <Link href="/auth"  className="text-[13px] text-[#0a0a0a]/40 hover:text-[#0a0a0a] transition-colors">Login</Link>
          <Link href="/auth"  className="inline-flex items-center px-4 py-1.5 text-[13px] font-semibold rounded-full bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] transition-all">Get Started</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-[#0a0a0a]/50">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden px-5 pb-4 space-y-3 border-t border-black/[0.06] pt-3 bg-white">
          <a href="#features" className="block text-[14px] text-[#0a0a0a]/50">Features</a>
          <a href="#how"      className="block text-[14px] text-[#0a0a0a]/50">How it works</a>
          <Link href="/auth"  className="block text-[14px] text-[#0a0a0a]/50">Login</Link>
          <Link href="/auth"  className="inline-flex items-center px-5 py-2 text-[14px] font-semibold rounded-full bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] transition-all">Get Started</Link>
        </div>
      )}
    </nav>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen bg-white text-[#0a0a0a]">
      <LandingNav />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-14 overflow-hidden">
        <FloatingObjects />

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-5 max-w-4xl mx-auto">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/10 bg-black/4 mb-8">
            <SmileyMini size={18} className="opacity-70" />
            <span className="text-[12px] text-[#0a0a0a]/50 tracking-wide font-medium">Your personal mood space</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-bold text-balance leading-[1.08] tracking-tight mb-6 text-[#0a0a0a]"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}>
            Understand
            <br />
            your mind.
            <br />
            <span className="text-[#0a0a0a]/25">One day at a time.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[17px] text-[#0a0a0a]/45 max-w-xl mx-auto leading-relaxed mb-10">
            A private space to track your moods, process your thoughts, and discover what shapes your emotional world — without judgment.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/checkin"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold rounded-full bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] transition-all hover:-translate-y-0.5 hover:shadow-lg">
              Start Check-in <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-medium rounded-full border-[1.5px] border-black/20 text-[#0a0a0a] hover:bg-black/5 hover:border-black/30 transition-all">
              Explore Dashboard <ChevronRight size={16} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
          style={{ y: useTransform(scrollYProgress, [0,1], [0,30]) }}
          className="relative z-10 mt-16 mx-5 max-w-lg w-full mx-auto">
          <div className="glass-card rounded-3xl p-6 border border-black/[0.07]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] text-[#0a0a0a]/30 uppercase tracking-wider mb-0.5">Today&apos;s Mood</p>
                <p className="text-[#0a0a0a] font-semibold text-[15px]">Friday, June 6</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border border-black/8">
                <SmileyMini size={18} />
                <span className="text-[13px] text-[#0a0a0a]/60 font-medium">Okay · 7/10</span>
              </div>
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-2 mb-4 h-12">
              {[4,6,5,8,7,9,7].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-sm" style={{ height: `${v * 5}px`, background: i === 6 ? "#0a0a0a" : "#e0e0e0" }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mb-4">
              {["M","T","W","T","F","S","S"].map((d,i) => (
                <span key={i} className={`flex-1 text-center text-[10px] ${i===6?"text-[#0a0a0a] font-semibold":"text-[#0a0a0a]/25"}`}>{d}</span>
              ))}
            </div>
            <div className="h-px bg-black/6 mb-4" />
            <p className="text-[13px] text-[#0a0a0a]/35 italic leading-relaxed">
              &ldquo;Today felt heavy at first, but writing it out helped. Small wins still count.&rdquo;
            </p>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-px h-8 bg-gradient-to-b from-black/20 to-transparent" />
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-32 px-5 sm:px-8 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="mb-16 max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <SmileyStar size={22} className="opacity-60" />
              <p className="text-[12px] text-[#0a0a0a]/35 uppercase tracking-widest">Features</p>
            </div>
            <h2 className="font-heading font-bold text-[2.4rem] leading-tight tracking-tight text-[#0a0a0a]">
              Everything you need<br />to know yourself better.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black/[0.06] rounded-3xl overflow-hidden border border-black/[0.06]">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: i * 0.06 }} viewport={{ once: true }}
                className="group p-8 bg-white hover:bg-[#fafafa] transition-colors duration-200">
                <div className="w-10 h-10 rounded-2xl bg-black/5 border border-black/8 flex items-center justify-center mb-5 group-hover:bg-black/8 transition-colors">
                  <f.icon size={18} className="text-[#0a0a0a]/60" />
                </div>
                <h3 className="font-heading font-semibold text-[#0a0a0a] mb-2 text-[15px]">{f.title}</h3>
                <p className="text-[13px] text-[#0a0a0a]/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-32 px-5 sm:px-8 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="mb-16 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <SmileyFace size={24} className="opacity-50" />
              <p className="text-[12px] text-[#0a0a0a]/35 uppercase tracking-widest">How it works</p>
              <SmileyFace size={24} className="opacity-50" />
            </div>
            <h2 className="font-heading font-bold text-[2.4rem] leading-tight tracking-tight text-[#0a0a0a]">
              Three steps.<br />Endless clarity.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="text-[11px] font-mono text-[#0a0a0a]/25 mb-4 tracking-widest">{step.num}</div>
                <div className="w-px h-10 bg-gradient-to-b from-black/20 to-transparent mb-4" />
                <h3 className="font-heading font-semibold text-[#0a0a0a] mb-2 text-[18px]">{step.title}</h3>
                <p className="text-[14px] text-[#0a0a0a]/40 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="py-32 px-5 sm:px-8 border-t border-black/[0.06]">
        <div className="max-w-3xl mx-auto text-center relative">
          {/* Decorative smileys */}
          <div className="absolute -left-4 top-0 opacity-20">
            <SmileyFace size={48} />
          </div>
          <div className="absolute -right-4 bottom-0 opacity-20">
            <SmileyStar size={40} />
          </div>
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }} viewport={{ once: true }}>
            <p className="font-heading font-medium leading-relaxed text-[#0a0a0a]/45 mb-6"
              style={{ fontSize: "clamp(1.25rem, 3vw, 1.9rem)" }}>
              &ldquo;The act of writing is the act of discovering<br className="hidden md:block" />
              what you believe.&rdquo;
            </p>
            <cite className="text-[13px] text-[#0a0a0a]/25 not-italic">— Joan Didion</cite>
          </motion.blockquote>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-28 px-5 sm:px-8 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="rounded-3xl p-12 sm:p-16 text-center bg-[#0a0a0a] relative overflow-hidden">
            {/* White floating smileys inside dark card */}
            <div className="absolute top-6 left-8 opacity-10">
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="white" strokeWidth="2"/>
                <circle cx="22" cy="26" r="3.5" fill="white"/>
                <circle cx="42" cy="26" r="3.5" fill="white"/>
                <path d="M20 38 Q32 50 44 38" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="absolute bottom-6 right-8 opacity-10">
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="white" strokeWidth="2"/>
                <circle cx="22" cy="26" r="3.5" fill="white"/>
                <circle cx="42" cy="26" r="3.5" fill="white"/>
                <path d="M20 38 Q32 50 44 38" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex items-center justify-center gap-3 mb-5">
              <svg width="36" height="36" viewBox="0 0 64 64" fill="none" className="opacity-50">
                <circle cx="32" cy="32" r="30" stroke="white" strokeWidth="2"/>
                <circle cx="22" cy="26" r="3.5" fill="white"/>
                <circle cx="42" cy="26" r="3.5" fill="white"/>
                <path d="M20 38 Q32 50 44 38" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="font-heading font-bold tracking-tight text-white mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>
              Your space is waiting.
            </h2>
            <p className="text-[16px] text-white/40 mb-8 max-w-sm mx-auto">
              Start understanding yourself one check-in at a time.
            </p>
            <Link href="/checkin"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-[15px] rounded-full bg-white text-[#0a0a0a] font-semibold hover:bg-white/90 transition-all hover:-translate-y-0.5 hover:shadow-lg">
              Start for free <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-black/[0.06] py-10 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0a0a0a] flex items-center justify-center">
              <span className="text-white text-[10px] font-black">R</span>
            </div>
            <span className="text-[13px] text-[#0a0a0a]/35 font-medium">Ruang Kamu</span>
          </div>
          <p className="text-[12px] text-[#0a0a0a]/25 italic">
            &ldquo;Understand your mind, one day at a time.&rdquo;
          </p>
          <p className="text-[12px] text-[#0a0a0a]/25">
            Made with ♥ by Muhammad Dinan Ghifari
          </p>
        </div>
      </footer>
    </div>
  );
}
