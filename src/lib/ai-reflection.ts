import type { MoodType, TriggerType } from './types';

// ===== THEME DETECTION =====

type ThemeKey =
  | 'stress'
  | 'loneliness'
  | 'overwhelm'
  | 'self_doubt'
  | 'relationship'
  | 'academic'
  | 'work'
  | 'family'
  | 'sleep'
  | 'gratitude'
  | 'hope';

const THEME_KEYWORDS: Record<ThemeKey, string[]> = {
  stress: [
    'stress', 'stressed', 'pressure', 'deadline', 'overwhelmed', 'too much',
    'can\'t handle', 'breaking point', 'burnout', 'burned out', 'exhausted',
  ],
  loneliness: [
    'alone', 'lonely', 'no one', 'nobody', 'isolated', 'left out',
    'invisible', 'forgotten', 'don\'t belong', 'disconnected', 'miss',
  ],
  overwhelm: [
    'overwhelm', 'too many', 'everything', 'can\'t cope', 'drowning',
    'falling behind', 'never enough', 'piling up', 'suffocating', 'chaos',
  ],
  self_doubt: [
    'not good enough', 'failure', 'stupid', 'worthless', 'imposter',
    'can\'t do', 'useless', 'hate myself', 'disappointing', 'fraud',
    'insecure', 'doubt', 'inadequate',
  ],
  relationship: [
    'boyfriend', 'girlfriend', 'partner', 'breakup', 'broke up', 'fight',
    'argument', 'love', 'crush', 'jealous', 'toxic', 'cheated', 'trust',
    'dating', 'relationship',
  ],
  academic: [
    'exam', 'assignment', 'grade', 'class', 'professor', 'lecture',
    'study', 'gpa', 'fail', 'thesis', 'college', 'university', 'school',
    'homework', 'semester', 'tugas', 'kuliah', 'dosen',
  ],
  work: [
    'work', 'job', 'boss', 'coworker', 'office', 'meeting', 'project',
    'client', 'salary', 'fired', 'promotion', 'overwork', 'career',
  ],
  family: [
    'family', 'parent', 'mom', 'dad', 'mother', 'father', 'sibling',
    'brother', 'sister', 'home', 'expectation', 'disappoint', 'argue',
  ],
  sleep: [
    'sleep', 'insomnia', 'tired', 'can\'t sleep', 'awake', 'nightmare',
    'restless', 'exhausted', 'nap', 'fatigue', 'waking up',
  ],
  gratitude: [
    'grateful', 'thankful', 'appreciate', 'blessed', 'lucky', 'glad',
    'happy', 'joy', 'good day', 'wonderful', 'amazing', 'smile',
  ],
  hope: [
    'hope', 'better', 'tomorrow', 'looking forward', 'excited', 'goal',
    'dream', 'plan', 'future', 'improve', 'grow', 'progress',
  ],
};

function detectThemes(content: string): ThemeKey[] {
  const lower = content.toLowerCase();
  const detected: ThemeKey[] = [];

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS) as [ThemeKey, string[]][]) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        detected.push(theme);
        break;
      }
    }
  }

  return detected;
}

// ===== MOOD-BASED REFLECTIONS =====

const MOOD_REFLECTIONS: Record<MoodType, string[]> = {
  senang: [
    'It\'s so nice to see you feeling good today. You deserve this lightness — hold onto it.',
    'What a beautiful moment to pause and appreciate. Your happiness matters, and so do you.',
    'Feeling happy is a gift. Even if it\'s fleeting, this feeling is real and valid.',
    'Today seems like a good one. Savor it — you\'ve earned this moment of peace.',
    'Your joy is contagious, even to yourself. Remember this feeling when things get tough.',
  ],
  biasa: [
    '"Okay" is perfectly fine. Not every day needs to be extraordinary.',
    'Some days are just days, and that\'s completely alright. You\'re still here, and that counts.',
    'A calm day can be a restful one. There\'s beauty in the ordinary.',
    'Feeling steady is underrated. Sometimes "okay" is exactly where you need to be.',
    'Not every day needs fireworks. Being okay is its own kind of strength.',
  ],
  capek: [
    'You sound tired, and that\'s your body and mind telling you to slow down. Listen to them.',
    'Being tired doesn\'t mean you\'re weak — it means you\'ve been trying really hard.',
    'Rest isn\'t laziness. It\'s how you recharge to be the person you want to be.',
    'Your tiredness is valid. You don\'t have to push through everything alone.',
    'It sounds like you\'ve been carrying a lot. It\'s okay to set things down for a while.',
  ],
  cemas: [
    'Anxiety likes to make everything feel urgent. But right now, in this moment, you\'re safe.',
    'From what you shared, it seems like your mind is trying to protect you by thinking ahead. That\'s okay — but you don\'t have to solve everything tonight.',
    'The "what ifs" can feel so loud. Try to come back to what\'s real and present, even for just a minute.',
    'Feeling anxious doesn\'t mean something bad will happen. It just means your mind is being extra cautious.',
    'You\'re not crazy for feeling this way. Anxiety is your brain\'s alarm system — sometimes it just goes off too easily.',
  ],
  sedih: [
    'It\'s okay to feel sad. You don\'t have to pretend everything is fine.',
    'Sadness is your heart\'s way of processing something important. Give it the space it needs.',
    'You don\'t have to force a smile. Sometimes sitting with the sadness is braver than pushing it away.',
    'Whatever is making you sad — I hope you know you\'re not alone in it.',
    'The heaviness you feel right now won\'t last forever. Be gentle with yourself in the meantime.',
  ],
  marah: [
    'Your anger is telling you that something matters to you. That\'s not a bad thing.',
    'It\'s okay to feel angry. What matters is what you do with it — and writing it out is a good start.',
    'Anger is a valid emotion. You don\'t have to justify why you feel this way.',
    'Sometimes anger is just sadness in disguise. When you\'re ready, look underneath it.',
    'You\'re allowed to be upset. Don\'t let anyone tell you your feelings are "too much."',
  ],
  kosong: [
    'Feeling empty can be confusing — like you should feel something, but nothing comes. That\'s okay.',
    'Numbness is sometimes your mind\'s way of protecting you from feeling too much at once.',
    'Even in the emptiness, you showed up to write about it. That takes more strength than you think.',
    'You don\'t have to label what you feel. Just being here and acknowledging it is enough.',
    'The emptiness won\'t last forever. Sometimes it\'s the quiet before things start to shift.',
  ],
};

// ===== TRIGGER-BASED ADDITIONS =====

const TRIGGER_REFLECTIONS: Partial<Record<TriggerType, string[]>> = {
  college: [
    'College can feel like a pressure cooker sometimes. Remember: your worth isn\'t defined by your GPA.',
    'Academic stress is real and heavy. Take it one assignment at a time.',
  ],
  work: [
    'Work stress has a way of following you home. Try to create a boundary, even a small one.',
    'Remember, you\'re more than your job title. What you do doesn\'t define who you are.',
  ],
  family: [
    'Family dynamics are complicated. You can love them and still feel frustrated — both can be true.',
    'The expectations from family can feel suffocating. It\'s okay to carve your own path.',
  ],
  friends: [
    'Friendships can be a source of both comfort and confusion. Trust your instincts about who deserves your energy.',
    'Not everyone who\'s around you is for you. It\'s okay to be selective with your circle.',
  ],
  relationship: [
    'Relationships bring out our deepest emotions. Whatever you\'re feeling right now is valid.',
    'Love is complicated. Don\'t rush to figure everything out — some things need time.',
  ],
  money: [
    'Financial stress is exhausting. Take it step by step — you don\'t need to solve it all today.',
    'Money worries can consume your thoughts. Try to focus on what you can control right now.',
  ],
  health: [
    'Your health — mental and physical — comes first. Everything else can wait.',
    'Taking care of your body is taking care of your mind. Be patient with yourself.',
  ],
  future: [
    'The future is uncertain, and that\'s scary. But it also means anything is possible.',
    'You don\'t need to have it all figured out. Most people don\'t — they just don\'t talk about it.',
  ],
  unknown: [
    'Sometimes you feel off without knowing why. That\'s more common than you think.',
    'Not knowing the cause doesn\'t make your feelings less real. Trust yourself.',
  ],
};

// ===== THEME-BASED ADDITIONS =====

const THEME_REFLECTIONS: Partial<Record<ThemeKey, string[]>> = {
  stress: [
    'It sounds like you\'re under a lot of pressure. Remember to breathe — literally.',
    'Stress has a way of making everything feel urgent. Not everything is.',
  ],
  loneliness: [
    'Loneliness hurts, and it\'s not something you should have to carry silently.',
    'Feeling alone doesn\'t mean you are alone. Sometimes we just need to reach out.',
  ],
  overwhelm: [
    'When everything feels like too much, start with just one thing. The smallest step counts.',
    'You\'re not failing — you\'re just carrying more than one person should.',
  ],
  self_doubt: [
    'That inner critic is loud, but it\'s not always right. You are more capable than you believe.',
    'Self-doubt is lying to you. Look at how far you\'ve already come.',
  ],
  sleep: [
    'Sleep and mood are deeply connected. If you can, try to protect your rest tonight.',
    'Your mind might be too active to rest. Try writing everything down before bed.',
  ],
  gratitude: [
    'Noticing the good things — even small ones — says a lot about your resilience.',
  ],
  hope: [
    'Holding onto hope takes courage. The fact that you can still see possibility is powerful.',
  ],
};

// ===== PUBLIC API =====

/**
 * Generates an empathetic, friend-like reflection based on mood, triggers,
 * and optional journal content. Uses keyword matching to detect themes and
 * compose a multi-layered response.
 */
export function generateReflection(
  mood: MoodType,
  triggers: TriggerType[],
  journalContent?: string
): string {
  const parts: string[] = [];

  // 1. Base mood reflection (random pick)
  const moodOptions = MOOD_REFLECTIONS[mood];
  parts.push(moodOptions[Math.floor(Math.random() * moodOptions.length)]);

  // 2. Add a trigger-specific reflection (pick from the first trigger that has reflections)
  for (const trigger of triggers) {
    const triggerOptions = TRIGGER_REFLECTIONS[trigger];
    if (triggerOptions && triggerOptions.length > 0) {
      parts.push(triggerOptions[Math.floor(Math.random() * triggerOptions.length)]);
      break; // Only add one trigger reflection to keep it concise
    }
  }

  // 3. Analyze journal content for themes
  if (journalContent && journalContent.trim().length > 10) {
    const themes = detectThemes(journalContent);
    // Pick the first detected theme that has a reflection
    for (const theme of themes) {
      const themeOptions = THEME_REFLECTIONS[theme];
      if (themeOptions && themeOptions.length > 0) {
        parts.push(themeOptions[Math.floor(Math.random() * themeOptions.length)]);
        break;
      }
    }
  }

  // Ensure we have at least 2 sentences
  if (parts.length < 2) {
    parts.push('Thank you for checking in with yourself today. That alone is a step forward.');
  }

  return parts.join(' ');
}

/**
 * Summarizes a journal entry in 1-2 sentences using keyword analysis.
 */
export function generateJournalSummary(content: string): string {
  if (!content || content.trim().length === 0) {
    return 'An empty entry — sometimes silence says more than words.';
  }

  const themes = detectThemes(content);
  const wordCount = content.trim().split(/\s+/).length;

  if (themes.length === 0) {
    if (wordCount < 20) {
      return 'A brief check-in. Sometimes a few words are all you need.';
    }
    return 'A thoughtful entry reflecting on your current state of mind.';
  }

  const themeSummaryMap: Record<ThemeKey, string> = {
    stress: 'Processing feelings of stress and pressure.',
    loneliness: 'Exploring feelings of loneliness and disconnection.',
    overwhelm: 'Working through feelings of being overwhelmed.',
    self_doubt: 'Confronting self-doubt and inner criticism.',
    relationship: 'Reflecting on relationship dynamics and emotions.',
    academic: 'Navigating academic pressures and expectations.',
    work: 'Processing work-related stress and concerns.',
    family: 'Thinking through family dynamics and feelings.',
    sleep: 'Noting the impact of rest and sleep patterns.',
    gratitude: 'Recognizing positive moments and gratitude.',
    hope: 'Looking forward with hope and intention.',
  };

  const primaryTheme = themes[0];
  let summary = themeSummaryMap[primaryTheme];

  if (themes.length >= 2) {
    const secondaryLabel = themes[1].replace('_', ' ');
    summary += ` Also touching on themes of ${secondaryLabel}.`;
  }

  return summary;
}

// ===== AFFIRMATIONS =====

const AFFIRMATIONS: Record<MoodType, string[]> = {
  senang: [
    'You radiate warmth. Keep sharing that light with the world.',
    'Happiness looks beautiful on you. You deserve every bit of it.',
    'Today is proof that good days exist. Hold onto that.',
    'Your joy is a gift — to you and to everyone around you.',
    'Celebrate this feeling. You worked hard to get here.',
  ],
  biasa: [
    'Steady days are the foundation of a good life. You\'re doing fine.',
    'Not every day needs to be special. Your "normal" is enough.',
    '"Okay" is not a failure. It\'s stability, and that\'s valuable.',
    'You\'re allowed to just exist today without performing happiness.',
    'Sometimes the bravest thing is simply showing up. And you did.',
  ],
  capek: [
    'You\'ve been working so hard. Tonight, let yourself just rest.',
    'Tired means you gave it your all. Now it\'s time to recharge.',
    'You don\'t have to be productive every single day. Rest is progress too.',
    'Give yourself permission to pause. The world will still be there tomorrow.',
    'Your body is asking for a break. Please listen to it.',
  ],
  cemas: [
    'You are safe in this moment. Breathe in, breathe out.',
    'Anxiety doesn\'t define you. You are so much more than your worries.',
    'This feeling will pass. You have survived every anxious moment before this one.',
    'You don\'t need all the answers right now. One step at a time.',
    'Your bravery isn\'t the absence of fear — it\'s showing up despite it.',
  ],
  sedih: [
    'It\'s okay to cry. Tears are your heart\'s way of healing.',
    'You are worthy of love, especially on the days you feel least lovable.',
    'This sadness is temporary. You are not broken — you are human.',
    'Somewhere in the universe, something beautiful is waiting for you.',
    'Let yourself feel this. And when you\'re ready, let yourself heal too.',
  ],
  marah: [
    'Your feelings are valid. You have every right to feel what you feel.',
    'Anger is energy. When you\'re ready, use it to set a boundary.',
    'You don\'t have to be okay with things that hurt you.',
    'Feeling angry doesn\'t make you a bad person. It makes you honest.',
    'Channel this fire into something that protects your peace.',
  ],
  kosong: [
    'Even in the emptiness, you are still here. That matters.',
    'You don\'t have to feel something to be something. You are enough as you are.',
    'The void isn\'t permanent. Something will stir again — give it time.',
    'Numbness is not weakness. It\'s your mind\'s way of catching up.',
    'You showed up today. That\'s more than enough.',
  ],
};

/**
 * Returns a mood-appropriate affirmation.
 */
export function getAffirmation(mood: MoodType): string {
  const options = AFFIRMATIONS[mood];
  return options[Math.floor(Math.random() * options.length)];
}
