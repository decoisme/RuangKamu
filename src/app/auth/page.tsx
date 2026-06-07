'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';

// ===== INLINE STORE HELPERS =====
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveUser(user: {
  id: string;
  name: string;
  email: string;
  theme: 'dark' | 'light';
  createdAt: string;
  isLoggedIn: boolean;
}) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ruangkamu_user', JSON.stringify(user));
  }
}

function getUser() {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('ruangkamu_user');
    if (data) return JSON.parse(data);
  }
  return null;
}

// ===== FLOATING PARTICLES =====
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4 + Math.random() * 6,
            height: 4 + Math.random() * 6,
            background: `rgba(0, 0, 0, ${0.04 + Math.random() * 0.04})`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40 - Math.random() * 60, 0],
            x: [0, 20 - Math.random() * 40, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6 + Math.random() * 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 4,
          }}
        />
      ))}
    </div>
  );
}

// ===== MAIN AUTH PAGE =====
export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirm, setRegShowConfirm] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [regLoading, setRegLoading] = useState(false);

  // Validate login
  const validateLogin = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!loginEmail.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) errors.email = 'Invalid email format';
    if (!loginPassword) errors.password = 'Password is required';
    else if (loginPassword.length < 6) errors.password = 'Password must be at least 6 characters';
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  }, [loginEmail, loginPassword]);

  // Validate register
  const validateRegister = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!regName.trim()) errors.name = 'Name is required';
    if (!regEmail.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) errors.email = 'Invalid email format';
    if (!regPassword) errors.password = 'Password is required';
    else if (regPassword.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!regConfirm) errors.confirm = 'Please confirm your password';
    else if (regConfirm !== regPassword) errors.confirm = 'Passwords do not match';
    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  }, [regName, regEmail, regPassword, regConfirm]);

  // Handle login
  const handleLogin = async () => {
    if (!validateLogin()) return;
    setLoginLoading(true);

    // Simulate async login
    await new Promise((r) => setTimeout(r, 800));

    // Check existing user or create one
    const existingUser = getUser();
    if (existingUser && existingUser.email === loginEmail) {
      existingUser.isLoggedIn = true;
      saveUser(existingUser);
    } else {
      saveUser({
        id: generateId(),
        name: loginEmail.split('@')[0],
        email: loginEmail,
        theme: 'dark',
        createdAt: new Date().toISOString(),
        isLoggedIn: true,
      });
    }
    setLoginLoading(false);
    router.push('/dashboard');
  };

  // Handle register
  const handleRegister = async () => {
    if (!validateRegister()) return;
    setRegLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    saveUser({
      id: generateId(),
      name: regName,
      email: regEmail,
      theme: 'dark',
      createdAt: new Date().toISOString(),
      isLoggedIn: true,
    });
    setRegLoading(false);
    router.push('/dashboard');
  };

  const tabVariants = {
    hidden: { opacity: 0, x: activeTab === 'login' ? -30 : 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
    exit: { opacity: 0, x: activeTab === 'login' ? 30 : -30, transition: { duration: 0.25 } },
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10 relative">
      <FloatingParticles />

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)', top: '-15%', right: '-10%', filter: 'blur(80px)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%)', bottom: '-10%', left: '-10%', filter: 'blur(80px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#9a9a9a] hover:text-[#0a0a0a] transition-colors mb-6 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] flex items-center justify-center">
            <span className="text-white text-base font-black">R</span>
          </div>
          <span className="font-semibold text-xl text-[#0a0a0a] tracking-tight">
            Ruang Kamu
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-black/[0.08] shadow-[0_2px_24px_rgba(0,0,0,0.06)] relative overflow-hidden">
          {/* Subtle top accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

          {/* Tab switcher */}
          <div className="flex rounded-xl bg-[#f5f5f5] p-1 mb-8">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setLoginErrors({});
                  setRegErrors({});
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-[#0a0a0a] shadow-sm border border-black/[0.07]'
                    : 'text-[#9a9a9a] hover:text-[#0a0a0a]'
                }`}
              >
                {tab === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.div
                key="login"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2 className="text-2xl font-bold text-[#0a0a0a] mb-1">Welcome back</h2>
                <p className="text-sm text-[#9a9a9a] mb-7">Continue your self-reflection journey</p>

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-xs text-[#9a9a9a] mb-1.5 font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (loginErrors.email) setLoginErrors((p) => ({ ...p, email: '' }));
                      }}
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border text-[#0a0a0a] placeholder-[#9a9a9a] text-sm transition-colors ${
                        loginErrors.email ? 'border-red-300' : 'border-black/[0.08] focus:border-black/25'
                      }`}
                    />
                  </div>
                  {loginErrors.email && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1.5">
                      {loginErrors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password */}
                <div className="mb-6">
                  <label className="block text-xs text-[#9a9a9a] mb-1.5 font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" />
                    <input
                      type={loginShowPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginErrors.password) setLoginErrors((p) => ({ ...p, password: '' }));
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-3 rounded-xl bg-transparent border text-[#0a0a0a] placeholder-[#9a9a9a] text-sm transition-colors ${
                        loginErrors.password ? 'border-red-300' : 'border-black/[0.08] focus:border-black/25'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setLoginShowPassword(!loginShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#0a0a0a] transition-colors cursor-pointer"
                    >
                      {loginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1.5">
                      {loginErrors.password}
                    </motion.p>
                  )}
                </div>

                <div className="flex justify-end mb-6">
                  <button className="text-xs text-[#0a0a0a] hover:text-black font-medium transition-colors cursor-pointer">
                    Forgot password?
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  disabled={loginLoading}
                  className="w-full py-3.5 rounded-xl bg-[#0a0a0a] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loginLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2 className="text-2xl font-bold text-[#0a0a0a] mb-1">Create your space</h2>
                <p className="text-sm text-[#9a9a9a] mb-7">Begin your journey of self-understanding</p>

                {/* Name */}
                <div className="mb-4">
                  <label className="block text-xs text-[#9a9a9a] mb-1.5 font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        if (regErrors.name) setRegErrors((p) => ({ ...p, name: '' }));
                      }}
                      placeholder="Your name"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border text-[#0a0a0a] placeholder-[#9a9a9a] text-sm transition-colors ${
                        regErrors.name ? 'border-red-300' : 'border-black/[0.08] focus:border-black/25'
                      }`}
                    />
                  </div>
                  {regErrors.name && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1.5">
                      {regErrors.name}
                    </motion.p>
                  )}
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-xs text-[#9a9a9a] mb-1.5 font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (regErrors.email) setRegErrors((p) => ({ ...p, email: '' }));
                      }}
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border text-[#0a0a0a] placeholder-[#9a9a9a] text-sm transition-colors ${
                        regErrors.email ? 'border-red-300' : 'border-black/[0.08] focus:border-black/25'
                      }`}
                    />
                  </div>
                  {regErrors.email && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1.5">
                      {regErrors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="block text-xs text-[#9a9a9a] mb-1.5 font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" />
                    <input
                      type={regShowPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        if (regErrors.password) setRegErrors((p) => ({ ...p, password: '' }));
                      }}
                      placeholder="Min 6 characters"
                      className={`w-full pl-10 pr-10 py-3 rounded-xl bg-transparent border text-[#0a0a0a] placeholder-[#9a9a9a] text-sm transition-colors ${
                        regErrors.password ? 'border-red-300' : 'border-black/[0.08] focus:border-black/25'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setRegShowPassword(!regShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#0a0a0a] transition-colors cursor-pointer"
                    >
                      {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {regErrors.password && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1.5">
                      {regErrors.password}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-6">
                  <label className="block text-xs text-[#9a9a9a] mb-1.5 font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" />
                    <input
                      type={regShowConfirm ? 'text' : 'password'}
                      value={regConfirm}
                      onChange={(e) => {
                        setRegConfirm(e.target.value);
                        if (regErrors.confirm) setRegErrors((p) => ({ ...p, confirm: '' }));
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-3 rounded-xl bg-transparent border text-[#0a0a0a] placeholder-[#9a9a9a] text-sm transition-colors ${
                        regErrors.confirm ? 'border-red-300' : 'border-black/[0.08] focus:border-black/25'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setRegShowConfirm(!regShowConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#0a0a0a] transition-colors cursor-pointer"
                    >
                      {regShowConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {regErrors.confirm && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1.5">
                      {regErrors.confirm}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegister}
                  disabled={regLoading}
                  className="w-full py-3.5 rounded-xl bg-[#0a0a0a] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {regLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-[#0a0a0a]/30 mt-6">
          Your data is stored locally on your device. We respect your privacy.
        </p>
      </motion.div>
    </div>
  );
}
