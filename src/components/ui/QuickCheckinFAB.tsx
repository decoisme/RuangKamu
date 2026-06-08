'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse } from 'lucide-react';
import CheckinModal from './CheckinModal';

export default function QuickCheckinFAB() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-[#0a0a0a] text-white shadow-2xl flex items-center justify-center hover:bg-black transition-all group"
        aria-label="Quick mood check-in"
      >
        <HeartPulse size={24} strokeWidth={1.8} color="white" />
        {/* Pulse ring animation */}
        <motion.span
          animate={{
            scale: [1, 1.5],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="absolute inset-0 rounded-full bg-black"
        />
      </motion.button>
      
      {/* Check-in Modal */}
      <AnimatePresence>
        {showModal && (
          <CheckinModal 
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              // Trigger page refresh or callback if needed
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('checkin-updated'));
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
