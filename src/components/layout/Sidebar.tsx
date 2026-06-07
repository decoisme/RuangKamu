"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, SmilePlus, BookOpen, BarChart3, Brain, Lock, User, ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps { currentPath: string; }

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/checkin",    label: "Check-in",   icon: SmilePlus },
  { href: "/journal",    label: "Journal",    icon: BookOpen },
  { href: "/analytics",  label: "Analytics",  icon: BarChart3 },
  { href: "/reflection", label: "Reflection", icon: Brain },
  { href: "/vault",      label: "Vault",      icon: Lock },
  { href: "/profile",    label: "Profile",    icon: User },
];

export function Sidebar({ currentPath }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const isActive = (href: string) => currentPath.startsWith(href);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ type: "spring" as const, stiffness: 350, damping: 35 }}
      className="hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-black/[0.07] overflow-hidden z-40"
    >
      <div className="flex items-center h-14 px-4 border-b border-black/[0.06]">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div key="logo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-black">R</span>
              </div>
              <span className="font-heading font-semibold text-[14px] text-[#0a0a0a] tracking-tight truncate">
                Ruang Kamu
              </span>
            </motion.div>
          ) : (
            <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} className="mx-auto">
              <div className="w-6 h-6 rounded-md bg-[#0a0a0a] flex items-center justify-center">
                <span className="text-white text-[10px] font-black">R</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className={`group relative flex items-center rounded-xl transition-all duration-150 ${
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
              } ${active ? "bg-black/6 text-[#0a0a0a]" : "text-[#0a0a0a]/35 hover:text-[#0a0a0a]/70 hover:bg-black/4"}`}>
              {active && (
                <motion.span layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-black/6 border border-black/10"
                  transition={{ type: "spring" as const, stiffness: 350, damping: 30 }} />
              )}
              <Icon size={16}
                className={`relative z-10 flex-shrink-0 transition-colors ${active ? "text-[#0a0a0a]" : "text-[#0a0a0a]/30"}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.15 }}
                    className="relative z-10 text-[13px] font-medium truncate">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-white border border-black/10
                  text-[#0a0a0a] text-[12px] font-medium whitespace-nowrap opacity-0 pointer-events-none
                  group-hover:opacity-100 transition-opacity shadow-md z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-black/[0.06]">
        <button onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-xl text-[#0a0a0a]/25
            hover:text-[#0a0a0a]/60 hover:bg-black/4 transition-all text-[12px]">
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[12px]">Collapse</motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
