"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light"); // Default to light
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved theme, default to light if not set
    const saved = localStorage.getItem("ruangkamu_theme") as Theme;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    } else {
      // Default to light instead of system
      setTheme("light");
      localStorage.setItem("ruangkamu_theme", "light");
      applyTheme("light");
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", newTheme === "dark");
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("ruangkamu_theme", newTheme);
    applyTheme(newTheme);
    setIsOpen(false);
  };

  const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  const currentThemeData = themes.find(t => t.value === theme);
  const CurrentIcon = currentThemeData?.icon || Sun;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl hover:bg-black/5 transition-colors relative"
        title="Change theme"
      >
        <motion.div
          animate={{ rotate: theme === "dark" ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <CurrentIcon className="w-5 h-5 text-[#555555]" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 glass-strong rounded-2xl p-2 shadow-xl border border-black/[0.08] z-50 min-w-[160px]"
            >
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                const isSelected = theme === themeOption.value;

                return (
                  <motion.button
                    key={themeOption.value}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleThemeChange(themeOption.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? "bg-black/8 text-[#0a0a0a]"
                        : "text-[#555555] hover:bg-black/4"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{themeOption.label}</span>
                    {isSelected && (
                      <motion.div
                        layoutId="theme-indicator"
                        className="ml-auto w-2 h-2 rounded-full bg-[#0a0a0a]"
                      />
                    )}
                  </motion.button>
                );
              })}

              <div className="h-px bg-black/[0.06] my-2" />

              <div className="px-3 py-2">
                <p className="text-xs text-[#9a9a9a] leading-relaxed">
                  Choose your preferred appearance :)
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
