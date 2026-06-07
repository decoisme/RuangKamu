"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  FileText, Brain, Moon, Sun, Heart, Target, 
  AlertCircle, Smile, BookOpen, X 
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  icon: typeof FileText;
  description: string;
  prompts: string[];
  color: string;
}

const TEMPLATES: Template[] = [
  {
    id: "morning",
    name: "Morning Pages",
    icon: Sun,
    description: "Start your day with intention",
    color: "#FFD93D",
    prompts: [
      "How am I feeling this morning?",
      "What are my intentions for today?",
      "What am I grateful for right now?",
      "What would make today great?"
    ]
  },
  {
    id: "evening",
    name: "Evening Reflection",
    icon: Moon,
    description: "Review and release your day",
    color: "#8B7EC8",
    prompts: [
      "What went well today?",
      "What challenged me?",
      "What did I learn?",
      "What am I letting go of before sleep?"
    ]
  },
  {
    id: "cbt",
    name: "CBT Thought Record",
    icon: Brain,
    description: "Challenge negative thoughts",
    color: "#6B9BD2",
    prompts: [
      "What triggered this thought/feeling?",
      "What automatic thoughts came up?",
      "What evidence supports this thought?",
      "What evidence contradicts this thought?",
      "What's a more balanced perspective?"
    ]
  },
  {
    id: "anxiety",
    name: "Anxiety Log",
    icon: AlertCircle,
    description: "Understand and manage anxiety",
    color: "#FF6B9D",
    prompts: [
      "What am I anxious about?",
      "What physical sensations am I noticing?",
      "What's the worst that could happen?",
      "What's more likely to happen?",
      "What can I control right now?"
    ]
  },
  {
    id: "wins",
    name: "Daily Wins",
    icon: Target,
    description: "Celebrate your progress",
    color: "#7DA87B",
    prompts: [
      "What did I accomplish today (big or small)?",
      "What am I proud of?",
      "Who did I help or connect with?",
      "What skill did I practice or improve?"
    ]
  },
  {
    id: "self-compassion",
    name: "Self-Compassion",
    icon: Heart,
    description: "Be kind to yourself",
    color: "#FF8C6B",
    prompts: [
      "What am I struggling with right now?",
      "How would I comfort a friend in this situation?",
      "What do I need to hear right now?",
      "How can I be gentle with myself today?"
    ]
  },
  {
    id: "mood-check",
    name: "Mood Check-In",
    icon: Smile,
    description: "Quick emotional awareness",
    color: "#BDB2FF",
    prompts: [
      "On a scale of 1-10, how am I feeling?",
      "What emotions am I experiencing?",
      "Where do I feel these emotions in my body?",
      "What do these emotions need from me?"
    ]
  },
  {
    id: "dream",
    name: "Dream Journal",
    icon: Moon,
    description: "Record and explore your dreams",
    color: "#9B8FFF",
    prompts: [
      "What did I dream about?",
      "What emotions did I feel in the dream?",
      "What symbols or themes appeared?",
      "What might this dream be telling me?"
    ]
  },
  {
    id: "freeform",
    name: "Free Writing",
    icon: BookOpen,
    description: "Write without structure",
    color: "#555555",
    prompts: [
      "Let your thoughts flow freely...",
      "Don't judge, just write...",
      "What's on your mind?",
      "No rules, no limits."
    ]
  }
];

interface JournalTemplatesProps {
  onSelectTemplate: (template: Template) => void;
}

export function JournalTemplates({ onSelectTemplate }: JournalTemplatesProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelect = (template: Template) => {
    setSelectedId(template.id);
    onSelectTemplate(template);
  };

  const selectedTemplate = TEMPLATES.find(t => t.id === selectedId);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-black/6">
            <FileText className="w-5 h-5 text-[#555555]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0a0a0a]">Journal Templates</h3>
            <p className="text-xs text-[#9a9a9a]">Structured prompts to guide your writing :)</p>
          </div>
        </div>
        {selectedId && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedId(null)}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4 text-[#9a9a9a]" />
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedId ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {TEMPLATES.map((template, index) => {
              const Icon = template.icon;
              const isHovered = hoveredId === template.id;

              return (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(template)}
                  onMouseEnter={() => setHoveredId(template.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="relative p-4 rounded-xl text-left transition-all border-2 border-transparent hover:border-black/[0.08]"
                  style={{ 
                    background: `${template.color}${isHovered ? '20' : '15'}`,
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <motion.div
                      animate={{ 
                        rotate: isHovered ? [0, -10, 10, 0] : 0,
                        scale: isHovered ? 1.1 : 1
                      }}
                      transition={{ duration: 0.4 }}
                      className="p-2 rounded-lg"
                      style={{ background: `${template.color}30` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: template.color }} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#0a0a0a] mb-0.5">
                        {template.name}
                      </h4>
                      <p className="text-xs text-[#555555] line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9a9a9a]">
                      {template.prompts.length} prompts
                    </span>
                    <motion.div
                      animate={{ x: isHovered ? 4 : 0 }}
                      className="text-xs font-medium"
                      style={{ color: template.color }}
                    >
                      Start →
                    </motion.div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        ) : selectedTemplate && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Template header */}
            <div 
              className="p-5 rounded-2xl"
              style={{ background: `${selectedTemplate.color}15` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="p-2.5 rounded-xl"
                  style={{ background: `${selectedTemplate.color}30` }}
                >
                  <selectedTemplate.icon 
                    className="w-5 h-5" 
                    style={{ color: selectedTemplate.color }} 
                  />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0a0a0a]">
                    {selectedTemplate.name}
                  </h4>
                  <p className="text-xs text-[#555555]">
                    {selectedTemplate.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Prompts */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#0a0a0a] flex items-center gap-2">
                <span>Guided prompts</span>
                <span className="text-xs text-[#9a9a9a] font-normal">
                  (answer in your journal below)
                </span>
              </p>
              
              {selectedTemplate.prompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#f8f8f8] border border-black/[0.06]"
                >
                  <span 
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: selectedTemplate.color }}
                  >
                    {index + 1}
                  </span>
                  <p className="text-sm text-[#0a0a0a] leading-relaxed pt-0.5">
                    {prompt}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-xl bg-gradient-to-r from-[#FFD93D]/10 to-[#FF6B9D]/10 border border-[#FFD93D]/20"
            >
              <p className="text-xs text-[#555555] leading-relaxed">
                <span className="font-semibold">💡 Tip:</span> Take your time with each prompt. 
                There&apos;s no rush — write as much or as little as feels right for you {'<3'}
              </p>
            </motion.div>

            {/* Action */}
            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-black/[0.10] text-[#555555] hover:bg-black/4 transition-colors"
              >
                Choose Different
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Scroll to journal editor
                  const editor = document.querySelector('textarea');
                  editor?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  editor?.focus();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${selectedTemplate.color} 0%, ${selectedTemplate.color}dd 100%)`,
                }}
              >
                Start Writing
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
