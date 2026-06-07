// ===== MOOD TYPES =====

export type MoodType = 'senang' | 'biasa' | 'capek' | 'cemas' | 'sedih' | 'marah' | 'kosong';

export const MOOD_LIST: { type: MoodType; label: string; emoji: string; color: string }[] = [
  { type: 'senang', label: 'Happy', emoji: '😊', color: '#FFD93D' },
  { type: 'biasa', label: 'Okay', emoji: '😌', color: '#6BCB77' },
  { type: 'capek', label: 'Tired', emoji: '😴', color: '#A0C4FF' },
  { type: 'cemas', label: 'Anxious', emoji: '😰', color: '#BDB2FF' },
  { type: 'sedih', label: 'Sad', emoji: '😢', color: '#6B9BD2' },
  { type: 'marah', label: 'Angry', emoji: '😤', color: '#FF6B6B' },
  { type: 'kosong', label: 'Empty', emoji: '😶', color: '#94A3B8' },
];

export const MOOD_COLORS: Record<MoodType, string> = {
  senang: '#FFD93D',
  biasa: '#6BCB77',
  capek: '#A0C4FF',
  cemas: '#BDB2FF',
  sedih: '#6B9BD2',
  marah: '#FF6B6B',
  kosong: '#94A3B8',
};

// ===== TRIGGER TYPES =====

export type TriggerType =
  | 'college'
  | 'work'
  | 'family'
  | 'friends'
  | 'relationship'
  | 'money'
  | 'health'
  | 'future'
  | 'unknown';

export const TRIGGER_LIST: { type: TriggerType; label: string; icon: string }[] = [
  { type: 'college', label: 'College', icon: 'GraduationCap' },
  { type: 'work', label: 'Work', icon: 'Briefcase' },
  { type: 'family', label: 'Family', icon: 'Home' },
  { type: 'friends', label: 'Friends', icon: 'Users' },
  { type: 'relationship', label: 'Relationship', icon: 'Heart' },
  { type: 'money', label: 'Money', icon: 'Wallet' },
  { type: 'health', label: 'Health', icon: 'Activity' },
  { type: 'future', label: 'Future', icon: 'Compass' },
  { type: 'unknown', label: "Don't Know", icon: 'HelpCircle' },
];

// ===== DATA MODELS =====

export interface MoodEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  mood: MoodType;
  score: number; // 1-10
  triggers: TriggerType[];
  note: string;
  timestamp: string; // ISO datetime string
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  prompt: string;
  isPrivate: boolean;
  aiSummary?: string;
  drawing?: string; // base64 image data
  drawingAiInterpretation?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  pin?: string;
  theme: 'dark' | 'light';
  createdAt: string;
  isLoggedIn: boolean;
}

// ===== ANALYTICS TYPES =====

export interface MoodFrequency {
  mood: MoodType;
  count: number;
  percentage: number;
}

export interface TriggerFrequency {
  trigger: TriggerType;
  count: number;
  percentage: number;
}

export interface WeeklyMoodData {
  day: string;
  score: number;
  mood: MoodType;
  date: string;
}

export interface MonthlyMoodData {
  week: string;
  avgScore: number;
  entries: number;
}

export interface MoodInsight {
  type: 'info' | 'warning' | 'positive' | 'suggestion';
  title: string;
  description: string;
  icon: string;
}

// ===== JOURNAL PROMPTS =====

export const JOURNAL_PROMPTS = [
  "The hardest part of today was...",
  "Something I wanted to say but held back...",
  "One small thing I'm still grateful for...",
  "What made me tired today?",
  "If I could tell someone how I really feel...",
  "Something that made me smile, even just a little...",
  "What I need right now is...",
  "A thought I keep replaying in my head...",
  "If today were a color, it would be...",
  "What I wish someone understood about me...",
];

// ===== COPING STRATEGIES =====

export interface CopingStrategy {
  mood: MoodType;
  title: string;
  strategies: {
    name: string;
    description: string;
    icon: string;
  }[];
}

export const COPING_STRATEGIES: CopingStrategy[] = [
  {
    mood: 'cemas',
    title: 'When Feeling Anxious',
    strategies: [
      { name: 'Breathing Exercise', description: 'Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s', icon: 'Wind' },
      { name: 'Grounding 5-4-3-2-1', description: '5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste', icon: 'Anchor' },
      { name: 'Control Circle', description: 'Write down what you can and cannot control right now', icon: 'Circle' },
    ],
  },
  {
    mood: 'sedih',
    title: 'When Feeling Sad',
    strategies: [
      { name: 'Journal It Out', description: 'Write freely without judging your thoughts', icon: 'PenLine' },
      { name: 'Calming Playlist', description: 'Listen to gentle, soothing music', icon: 'Music' },
      { name: 'Reach Out', description: 'Talk to someone you trust — you don\'t have to be alone', icon: 'Phone' },
    ],
  },
  {
    mood: 'marah',
    title: 'When Feeling Angry',
    strategies: [
      { name: 'Write Without Sending', description: 'Type everything you want to say, then delete it', icon: 'FileX' },
      { name: 'Pause 10 Minutes', description: 'Step away and give yourself space before reacting', icon: 'Timer' },
      { name: 'Identify the Trigger', description: 'Ask: what exactly made me feel this way?', icon: 'Search' },
    ],
  },
  {
    mood: 'capek',
    title: 'When Feeling Tired',
    strategies: [
      { name: 'Permission to Rest', description: 'You don\'t always have to be productive', icon: 'Moon' },
      { name: 'Micro Break', description: 'Close your eyes for 5 minutes, no screens', icon: 'Eye' },
      { name: 'Simplify Tomorrow', description: 'Pick only 3 priorities for tomorrow', icon: 'List' },
    ],
  },
  {
    mood: 'kosong',
    title: 'When Feeling Empty',
    strategies: [
      { name: 'Small Actions', description: 'Do one tiny thing: drink water, open a window, stretch', icon: 'Droplets' },
      { name: 'Name It', description: 'Try to label what you\'re feeling, even if it\'s "nothing"', icon: 'Tag' },
      { name: 'Be Present', description: 'Focus on one sensation right now — warmth, texture, sound', icon: 'Scan' },
    ],
  },
];
