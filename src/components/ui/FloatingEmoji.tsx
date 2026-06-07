"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface FloatingEmojiProps {
  emoji: string;
  delay?: number;
  duration?: number;
}

export function FloatingEmoji({ emoji, delay = 0, duration = 4 }: FloatingEmojiProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), (duration + delay) * 1000);
    return () => clearTimeout(timer);
  }, [duration, delay]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 0, 
        x: Math.random() * 100 - 50,
        scale: 0.5,
        rotate: Math.random() * 40 - 20
      }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        y: -150,
        x: Math.random() * 60 - 30,
        rotate: Math.random() * 360,
        scale: [0.5, 1.2, 1, 0.8]
      }}
      transition={{ 
        duration,
        delay,
        ease: "easeOut"
      }}
      className="fixed pointer-events-none z-50 text-4xl"
      style={{ 
        bottom: "10%", 
        left: "50%",
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))"
      }}
    >
      {emoji}
    </motion.div>
  );
}

interface FloatingHeartsProps {
  count?: number;
  color?: string;
}

export function FloatingHearts({ count = 5, color = "#FF6B9D" }: FloatingHeartsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const delay = i * 0.3;
        const duration = 2.5 + Math.random() * 1;
        const xOffset = (Math.random() - 0.5) * 100;
        
        return (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0,
              y: 20,
              x: 0,
              scale: 0
            }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              y: -120,
              x: xOffset,
              scale: [0, 1, 0.8, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration,
              delay,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="fixed pointer-events-none z-50"
            style={{ 
              bottom: "15%",
              left: "50%",
              fontSize: "24px",
              color,
              filter: "drop-shadow(0 2px 6px rgba(255,107,157,0.4))"
            }}
          >
            ♥
          </motion.div>
        );
      })}
    </>
  );
}

interface SparkleEffectProps {
  trigger?: boolean;
}

export function SparkleEffect({ trigger = false }: SparkleEffectProps) {
  if (!trigger) return null;

  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 40 + Math.random() * 20;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        return (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0,
              x: 0,
              y: 0,
              scale: 0
            }}
            animate={{ 
              opacity: [0, 1, 0],
              x: x,
              y: y,
              scale: [0, 1.5, 0],
              rotate: Math.random() * 360
            }}
            transition={{ 
              duration: 0.6,
              delay: i * 0.05,
              ease: "easeOut"
            }}
            className="absolute pointer-events-none"
            style={{
              width: "6px",
              height: "6px",
              background: `hsl(${i * 45}, 70%, 60%)`,
              borderRadius: "50%",
              boxShadow: `0 0 8px hsl(${i * 45}, 70%, 60%)`
            }}
          />
        );
      })}
    </>
  );
}
