"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Menu, X, Lock, User, LayoutDashboard, SmilePlus, BookOpen, BarChart3, Brain, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { logout } from "@/lib/auth";

interface NavbarProps { showNav?: boolean; }

const NAV_LINKS = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/checkin",    label: "Check-in",   icon: SmilePlus },
  { href: "/journal",    label: "Journal",    icon: BookOpen },
  { href: "/analytics",  label: "Analytics",  icon: BarChart3 },
  { href: "/reflection", label: "Reflection", icon: Brain },
];

const drawerVariants: Variants = {
  closed: { x: "100%", transition: { type: "spring" as const, stiffness: 350, damping: 35 } },
  open:   { x: 0,      transition: { type: "spring" as const, stiffness: 350, damping: 35 } },
};

const linkVariants: Variants = {
  closed: { x: 24, opacity: 0 },
  open: (i: number) => ({
    x: 0, opacity: 1,
    transition: { delay: 0.06 + i * 0.05, type: "spring" as const, stiffness: 250, damping: 25 },
  }),
};

export function Navbar({ showNav = true }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  if (!showNav) return null;
  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-black/[0.07] shadow-[0_1px_16px_rgba(0,0,0,0.06)]"
            : "bg-white/70 backdrop-blur-lg border-b border-black/[0.05]"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
              <span className="text-white text-xs font-black tracking-tighter">R</span>
            </div>
            <span className="font-heading font-semibold text-[15px] text-[#0a0a0a] tracking-tight">
              Ruang Kamu
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link key={link.href} href={link.href}
                  className={`relative px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                    active ? "text-[#0a0a0a]" : "text-[#0a0a0a]/40 hover:text-[#0a0a0a]/80"
                  }`}>
                  {active && (
                    <motion.span layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-black/6 border border-black/10"
                      transition={{ type: "spring" as const, stiffness: 350, damping: 30 }} />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            
            <Link href="/vault"
              className={`hidden md:flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                isActive("/vault") ? "bg-black/8 text-[#0a0a0a]" : "text-[#0a0a0a]/35 hover:text-[#0a0a0a] hover:bg-black/5"
              }`}>
              <Lock size={15} />
            </Link>
            <Link href="/profile"
              className={`hidden md:flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                isActive("/profile") ? "bg-black/8 text-[#0a0a0a]" : "text-[#0a0a0a]/35 hover:text-[#0a0a0a] hover:bg-black/5"
              }`}>
              <User size={15} />
            </Link>
            <button 
              onClick={handleLogout}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-full text-red-500/60 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
            <button onClick={() => setOpen(true)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full text-[#0a0a0a]/50 hover:text-[#0a0a0a] hover:bg-black/5 transition-all">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm md:hidden" />
            <motion.div variants={drawerVariants} initial="closed" animate="open" exit="closed"
              className="fixed top-0 right-0 bottom-0 z-[70] w-64 bg-white border-l border-black/[0.07] shadow-2xl flex flex-col md:hidden">
              <div className="flex items-center justify-between px-5 h-14 border-b border-black/[0.06]">
                <span className="font-heading font-semibold text-[#0a0a0a] text-sm">Menu</span>
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-[#0a0a0a]/40 hover:text-[#0a0a0a] hover:bg-black/5 transition-all">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 py-3 px-2 space-y-0.5">
                {[...NAV_LINKS, { href: "/vault", label: "Vault", icon: Lock }, { href: "/profile", label: "Profile", icon: User }].map((link, i) => {
                  const active = isActive(link.href);
                  const Icon = link.icon;
                  return (
                    <motion.div key={link.href} variants={linkVariants} initial="closed" animate="open" custom={i}>
                      <Link href={link.href} onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                          active ? "bg-black/6 text-[#0a0a0a]" : "text-[#0a0a0a]/40 hover:text-[#0a0a0a] hover:bg-black/4"
                        }`}>
                        <Icon size={16} className={active ? "text-[#0a0a0a]" : "text-[#0a0a0a]/30"} />
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              <div className="px-3 py-3 border-t border-black/[0.06]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
