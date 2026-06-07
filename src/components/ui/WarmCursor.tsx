"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const CURSOR_MESSAGES = [
  "You're doing great :)",
  "We believe in you <3",
  "One step at a time :)",
  "You've got this!",
  "Keep going <3",
  "We're proud of you :)",
];

export function WarmCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => {
      setIsClicking(true);
      
      // Randomly show encouragement message (20% chance)
      if (Math.random() < 0.2) {
        const randomMessage = CURSOR_MESSAGES[Math.floor(Math.random() * CURSOR_MESSAGES.length)];
        setMessage(randomMessage);
        setShowMessage(true);
        
        setTimeout(() => {
          setShowMessage(false);
        }, 2000);
      }
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <>
      {/* Custom cursor trail */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: position.x - 12,
          y: position.y - 12,
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      >
        <div className="w-6 h-6 rounded-full border-2 border-white opacity-50" />
      </motion.div>

      {/* Random encouragement message */}
      {showMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          className="fixed pointer-events-none z-[9998]"
          style={{
            left: position.x + 20,
            top: position.y - 40,
          }}
        >
          <div className="px-4 py-2 rounded-xl bg-[#0a0a0a] text-white text-xs whitespace-nowrap shadow-xl">
            {message}
          </div>
        </motion.div>
      )}
    </>
  );
}

// Tooltip with warm messages
interface WarmTooltipProps {
  children: React.ReactNode;
  message: string;
  emoji?: string;
}

export function WarmTooltip({ children, message, emoji }: WarmTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-50"
        >
          <div className="px-3 py-2 rounded-lg bg-[#0a0a0a] text-white text-xs whitespace-nowrap shadow-xl flex items-center gap-1.5">
            {emoji && <span>{emoji}</span>}
            {message}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#0a0a0a]" />
        </motion.div>
      )}
    </div>
  );
}
