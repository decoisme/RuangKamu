import { jsPDF } from 'jspdf';
import { format, subDays } from 'date-fns';
import { MOOD_LIST, TRIGGER_LIST } from './types';
import {
  getMoodFrequencies,
  getTriggerFrequencies,
  getWeeklyMoodData,
  getAverageMoodScore,
  getMostFrequentMood,
  generateInsights,
} from './analytics';
import { getMoodEntriesByDateRange } from './store';

// ===== CONSTANTS =====

const PAGE_WIDTH = 210; // A4
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

const COLORS = {
  primary: [79, 70, 229] as [number, number, number],     // indigo-600
  secondary: [107, 114, 128] as [number, number, number],  // gray-500
  text: [31, 41, 55] as [number, number, number],           // gray-800
  lightText: [107, 114, 128] as [number, number, number],   // gray-500
  accent: [236, 72, 153] as [number, number, number],       // pink-500
  divider: [229, 231, 235] as [number, number, number],     // gray-200
  background: [249, 250, 251] as [number, number, number],  // gray-50
};

// ===== HELPERS =====

function addPageIfNeeded(doc: jsPDF, y: number, requiredSpace: number): number {
  if (y + requiredSpace > 280) {
    doc.addPage();
    return 30;
  }
  return y;
}

function drawDivider(doc: jsPDF, y: number): number {
  doc.setDrawColor(...COLORS.divider);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  return y + 8;
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primary);
  doc.text(title, MARGIN_LEFT, y);
  return y + 10;
}

// ===== MAIN EXPORT FUNCTION =====

/**
 * Generates and downloads a PDF monthly report of mood data.
 */
export function generateMonthlyReport(): void {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  const startDate = format(thirtyDaysAgo, 'yyyy-MM-dd');
  const endDate = format(today, 'yyyy-MM-dd');
  const entries = getMoodEntriesByDateRange(startDate, endDate);

  let y = 20;

  // ===== HEADER =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.primary);
  doc.text('Ruang Kamu', MARGIN_LEFT, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.lightText);
  doc.text('Monthly Mood Report', MARGIN_LEFT, y);
  y += 8;

  doc.setFontSize(9);
  doc.text(
    `${format(thirtyDaysAgo, 'MMMM d, yyyy')} — ${format(today, 'MMMM d, yyyy')}`,
    MARGIN_LEFT,
    y
  );
  y += 5;
  doc.text(`Generated on ${format(today, 'MMMM d, yyyy \'at\' h:mm a')}`, MARGIN_LEFT, y);
  y += 10;

  y = drawDivider(doc, y);

  // ===== OVERVIEW SECTION =====
  y = addPageIfNeeded(doc, y, 50);
  y = drawSectionTitle(doc, 'Overview', y);

  const totalEntries = entries.length;
  const avgScore = getAverageMoodScore();
  const mostFrequent = getMostFrequentMood();
  const mostFrequentLabel = mostFrequent
    ? MOOD_LIST.find((m) => m.type === mostFrequent.mood)?.label ?? mostFrequent.mood
    : 'N/A';
  const mostFrequentEmoji = mostFrequent
    ? MOOD_LIST.find((m) => m.type === mostFrequent.mood)?.emoji ?? ''
    : '';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const overviewItems = [
    { label: 'Total Check-ins', value: `${totalEntries}` },
    { label: 'Average Mood Score', value: `${avgScore} / 10` },
    { label: 'Most Frequent Mood', value: `${mostFrequentEmoji} ${mostFrequentLabel}${mostFrequent ? ` (${mostFrequent.count} times)` : ''}` },
  ];

  for (const item of overviewItems) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.label}:`, MARGIN_LEFT + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.text(item.value, MARGIN_LEFT + 52, y);
    y += 7;
  }

  y += 5;
  y = drawDivider(doc, y);

  // ===== MOOD BREAKDOWN =====
  y = addPageIfNeeded(doc, y, 60);
  y = drawSectionTitle(doc, 'Mood Breakdown', y);

  const frequencies = getMoodFrequencies();
  if (frequencies.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.lightText);
    doc.text('No mood data available for this period.', MARGIN_LEFT + 4, y);
    y += 10;
  } else {
    for (const freq of frequencies) {
      y = addPageIfNeeded(doc, y, 10);
      const moodInfo = MOOD_LIST.find((m) => m.type === freq.mood);
      const label = moodInfo ? `${moodInfo.emoji} ${moodInfo.label}` : freq.mood;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      doc.text(label, MARGIN_LEFT + 4, y);

      // Draw bar
      const barMaxWidth = CONTENT_WIDTH - 80;
      const barWidth = (freq.percentage / 100) * barMaxWidth;
      doc.setFillColor(...COLORS.background);
      doc.roundedRect(MARGIN_LEFT + 48, y - 4, barMaxWidth, 5, 1, 1, 'F');
      doc.setFillColor(...COLORS.primary);
      if (barWidth > 0) {
        doc.roundedRect(MARGIN_LEFT + 48, y - 4, Math.max(barWidth, 2), 5, 1, 1, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.lightText);
      doc.text(`${freq.count} (${freq.percentage}%)`, MARGIN_LEFT + 48 + barMaxWidth + 3, y);

      y += 9;
    }
  }

  y += 3;
  y = drawDivider(doc, y);

  // ===== TRIGGER ANALYSIS =====
  y = addPageIfNeeded(doc, y, 50);
  y = drawSectionTitle(doc, 'Top Triggers', y);

  const triggerFreqs = getTriggerFrequencies();
  const topTriggers = triggerFreqs.slice(0, 5);

  if (topTriggers.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.lightText);
    doc.text('No trigger data available for this period.', MARGIN_LEFT + 4, y);
    y += 10;
  } else {
    for (let i = 0; i < topTriggers.length; i++) {
      y = addPageIfNeeded(doc, y, 10);
      const trigger = topTriggers[i];
      const triggerInfo = TRIGGER_LIST.find((t) => t.type === trigger.trigger);
      const label = triggerInfo?.label ?? trigger.trigger;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      doc.text(`${i + 1}.`, MARGIN_LEFT + 4, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${label}`, MARGIN_LEFT + 12, y);

      doc.setFontSize(9);
      doc.setTextColor(...COLORS.lightText);
      doc.text(`— ${trigger.count} time${trigger.count > 1 ? 's' : ''} (${trigger.percentage}%)`, MARGIN_LEFT + 12 + doc.getTextWidth(label) + 3, y);

      y += 8;
    }
  }

  y += 3;
  y = drawDivider(doc, y);

  // ===== WEEKLY MOOD SCORES =====
  y = addPageIfNeeded(doc, y, 60);
  y = drawSectionTitle(doc, 'Weekly Mood Scores (Last 7 Days)', y);

  const weeklyData = getWeeklyMoodData();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.lightText);
  doc.text('Day', MARGIN_LEFT + 4, y);
  doc.text('Mood', MARGIN_LEFT + 30, y);
  doc.text('Score', MARGIN_LEFT + 70, y);
  doc.text('Visual', MARGIN_LEFT + 90, y);
  y += 7;

  for (const day of weeklyData) {
    y = addPageIfNeeded(doc, y, 8);
    const moodInfo = MOOD_LIST.find((m) => m.type === day.mood);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    doc.text(day.day, MARGIN_LEFT + 4, y);

    if (day.score > 0) {
      doc.text(`${moodInfo?.emoji ?? ''} ${moodInfo?.label ?? day.mood}`, MARGIN_LEFT + 30, y);
      doc.text(`${day.score}/10`, MARGIN_LEFT + 70, y);

      // Score bar
      const barWidth = (day.score / 10) * 60;
      doc.setFillColor(...COLORS.background);
      doc.roundedRect(MARGIN_LEFT + 90, y - 3, 60, 4, 1, 1, 'F');
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(MARGIN_LEFT + 90, y - 3, barWidth, 4, 1, 1, 'F');
    } else {
      doc.setTextColor(...COLORS.lightText);
      doc.text('—', MARGIN_LEFT + 30, y);
      doc.text('—', MARGIN_LEFT + 70, y);
    }

    y += 7;
  }

  y += 3;
  y = drawDivider(doc, y);

  // ===== INSIGHTS =====
  y = addPageIfNeeded(doc, y, 50);
  y = drawSectionTitle(doc, 'Key Insights', y);

  const insights = generateInsights();

  for (const insight of insights) {
    y = addPageIfNeeded(doc, y, 18);

    const typeSymbol: Record<string, string> = {
      positive: '✦',
      warning: '⚠',
      info: 'ℹ',
      suggestion: '💡',
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    doc.text(`${typeSymbol[insight.type] ?? '•'} ${insight.title}`, MARGIN_LEFT + 4, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.secondary);

    // Word wrap the description
    const lines = doc.splitTextToSize(insight.description, CONTENT_WIDTH - 12);
    for (const line of lines) {
      y = addPageIfNeeded(doc, y, 6);
      doc.text(line, MARGIN_LEFT + 8, y);
      y += 5;
    }

    y += 4;
  }

  y += 3;
  y = drawDivider(doc, y);

  // ===== PERSONAL REFLECTIONS SECTION =====
  y = addPageIfNeeded(doc, y, 40);
  y = drawSectionTitle(doc, 'Personal Reflections', y);

  // Show the last few mood notes as reflections
  const notesEntries = entries
    .filter((e) => e.note && e.note.trim().length > 0)
    .slice(0, 5);

  if (notesEntries.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.lightText);
    doc.text('No personal notes recorded this period.', MARGIN_LEFT + 4, y);
    y += 10;
  } else {
    for (const entry of notesEntries) {
      y = addPageIfNeeded(doc, y, 20);
      const moodInfo = MOOD_LIST.find((m) => m.type === entry.mood);
      const dateLabel = format(new Date(entry.date), 'MMM d');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.primary);
      doc.text(`${dateLabel} — ${moodInfo?.emoji ?? ''} ${moodInfo?.label ?? entry.mood}`, MARGIN_LEFT + 4, y);
      y += 6;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);

      const noteLines = doc.splitTextToSize(`"${entry.note}"`, CONTENT_WIDTH - 12);
      for (const line of noteLines) {
        y = addPageIfNeeded(doc, y, 6);
        doc.text(line, MARGIN_LEFT + 8, y);
        y += 5;
      }
      y += 4;
    }
  }

  // ===== FOOTER =====
  y = addPageIfNeeded(doc, y, 25);
  y += 5;
  y = drawDivider(doc, y);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.lightText);
  doc.text(
    'This report was generated by Ruang Kamu — your personal safe space for emotional check-ins.',
    MARGIN_LEFT,
    y
  );
  y += 5;
  doc.text(
    'Remember: your feelings are valid, and tracking them is an act of self-care.',
    MARGIN_LEFT,
    y
  );

  // ===== SAVE =====
  const filename = `ruang-kamu-report-${format(today, 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}
