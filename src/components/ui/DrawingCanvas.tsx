"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Eraser, Trash2, Download, Sparkles,
  Check, Loader2, Image as ImageIcon, Minus, Pen,
  RefreshCw
} from "lucide-react";

interface DrawingCanvasProps {
  onSave?: (imageData: string, aiInterpretation?: string) => void;
  initialImage?: string;
}

const COLORS = [
  { name: "Midnight",  value: "#0a0a0a" },
  { name: "Crimson",   value: "#E05C5C" },
  { name: "Amber",     value: "#F59E0B" },
  { name: "Sunshine",  value: "#FCD34D" },
  { name: "Sage",      value: "#6DAF7A" },
  { name: "Sky",       value: "#60A5FA" },
  { name: "Lavender",  value: "#8B7EC8" },
  { name: "Rose",      value: "#F472B6" },
  { name: "Slate",     value: "#94A3B8" },
  { name: "Warm Gray", value: "#D6D3D1" },
];

const BRUSH_SIZES = [
  { size: 2,  label: "Fine"   },
  { size: 5,  label: "Medium" },
  { size: 10, label: "Bold"   },
  { size: 18, label: "Broad"  },
];

// ==================== PIXEL ANALYSIS ENGINE ====================
interface DrawingStats {
  dominantColors: Array<{ name: string; value: string; proportion: number }>;
  coverage: number;            // 0–1
  strokeComplexity: number;    // 0–1 (entropy proxy)
  verticalBias: "top" | "center" | "bottom" | "spread";
  horizontalBias: "left" | "center" | "right" | "spread";
  colorVariety: number;        // 0–1
  darknessBias: "dark" | "neutral" | "light";
}

function analyzeCanvas(canvas: HTMLCanvasElement): DrawingStats {
  const ctx = canvas.getContext("2d");
  if (!ctx) return {} as DrawingStats;

  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const pixels = imgData.data;

  // Count non-white pixels in a grid
  const colorBuckets: Record<string, number> = {};
  let totalNonWhite = 0;

  // Spatial tracking (divide into 3×3 grid)
  const gridW = Math.floor(w / 3);
  const gridH = Math.floor(h / 3);
  const spatialGrid: number[][] = Array.from({ length: 3 }, () => [0, 0, 0]);

  // Track darkness
  let totalBrightness = 0;
  let brightnessSamples = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      if (r > 238 && g > 238 && b > 238) continue; // skip near-white

      totalNonWhite++;
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      totalBrightness += brightness;
      brightnessSamples++;

      // Spatial bucket
      const gx = Math.min(2, Math.floor(x / gridW));
      const gy = Math.min(2, Math.floor(y / gridH));
      spatialGrid[gy][gx]++;

      // Color categorization
      const key = categorizeColor(r, g, b);
      colorBuckets[key] = (colorBuckets[key] || 0) + 1;
    }
  }

  const totalPixels = (w * h) / 4; // device ratio adjusted approx
  const coverage = Math.min(1, totalNonWhite / (totalPixels * 0.85));

  // Dominant colors (map to COLORS palette)
  const sortedColors = Object.entries(colorBuckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const colorNames: Record<string, { name: string; value: string }> = {
    black:   { name: "black",   value: "#0a0a0a" },
    red:     { name: "red",     value: "#E05C5C" },
    orange:  { name: "orange",  value: "#F59E0B" },
    yellow:  { name: "yellow",  value: "#FCD34D" },
    green:   { name: "green",   value: "#6DAF7A" },
    blue:    { name: "blue",    value: "#60A5FA" },
    purple:  { name: "purple",  value: "#8B7EC8" },
    pink:    { name: "pink",    value: "#F472B6" },
    gray:    { name: "gray",    value: "#94A3B8" },
    dark:    { name: "dark",    value: "#334155" },
  };

  const dominantColors = sortedColors.map(([key, count]) => ({
    name: colorNames[key]?.name || key,
    value: colorNames[key]?.value || "#9a9a9a",
    proportion: count / totalNonWhite,
  }));

  // Spatial bias
  const topSum = spatialGrid[0].reduce((a, b) => a + b, 0);
  const midRowSum = spatialGrid[1].reduce((a, b) => a + b, 0);
  const botSum = spatialGrid[2].reduce((a, b) => a + b, 0);

  const leftSum = spatialGrid.reduce((s, row) => s + row[0], 0);
  const centerColSum = spatialGrid.reduce((s, row) => s + row[1], 0);
  const rightSum = spatialGrid.reduce((s, row) => s + row[2], 0);

  const rowMax = Math.max(topSum, midRowSum, botSum);
  const colMax = Math.max(leftSum, centerColSum, rightSum);
  const rowSpread = Math.min(topSum, midRowSum, botSum) / (rowMax || 1) > 0.35;
  const colSpread = Math.min(leftSum, centerColSum, rightSum) / (colMax || 1) > 0.35;

  const verticalBias: DrawingStats["verticalBias"] =
    rowSpread ? "spread"
    : rowMax === topSum ? "top"
    : rowMax === botSum ? "bottom"
    : "center";

  const horizontalBias: DrawingStats["horizontalBias"] =
    colSpread ? "spread"
    : colMax === leftSum ? "left"
    : colMax === rightSum ? "right"
    : "center";

  // Color variety
  const colorVariety = Math.min(1, Object.keys(colorBuckets).length / 7);

  // Darkness bias
  const avgBrightness = brightnessSamples > 0 ? totalBrightness / brightnessSamples : 128;
  const darknessBias: DrawingStats["darknessBias"] =
    avgBrightness < 80 ? "dark" : avgBrightness > 180 ? "light" : "neutral";

  // Stroke complexity: rough estimate via color transition changes
  const strokeComplexity = Math.min(1, colorVariety * 0.5 + (coverage > 0.3 ? 0.3 : coverage));

  return {
    dominantColors,
    coverage,
    strokeComplexity,
    verticalBias,
    horizontalBias,
    colorVariety,
    darknessBias,
  };
}

function categorizeColor(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (l < 60) return "black";
  if (l < 100 && max - min < 40) return "dark";
  if (max - min < 30) return "gray";

  const h = max === r
    ? ((g - b) / (max - min)) % 6
    : max === g
    ? (b - r) / (max - min) + 2
    : (r - g) / (max - min) + 4;
  const hDeg = (h * 60 + 360) % 360;

  if (hDeg < 20 || hDeg >= 340) return "red";
  if (hDeg < 45)  return "orange";
  if (hDeg < 70)  return "yellow";
  if (hDeg < 160) return "green";
  if (hDeg < 240) return "blue";
  if (hDeg < 280) return "purple";
  return "pink";
}

// ==================== INTERPRETATION ENGINE ====================
function buildRichInterpretation(stats: DrawingStats): string {
  const { dominantColors, coverage, strokeComplexity, verticalBias, horizontalBias, colorVariety, darknessBias } = stats;

  const mainColor = dominantColors[0];
  const secondColor = dominantColors[1];

  // ── COLOR MEANINGS ──
  const colorNarratives: Record<string, string[]> = {
    black: [
      "The deep, grounding darkness of your strokes speaks of honesty — you're not looking away from something heavy.",
      "Black carries depth. There's weight here, but weight isn't weakness; it's gravity, it's truth.",
      "Your choice of darkness may reflect a quiet turning inward — a search for clarity beneath the noise.",
    ],
    dark: [
      "These shadowy tones hold something unspoken — emotions that haven't found words yet.",
      "Dark hues often carry stories we're still trying to understand ourselves.",
    ],
    red: [
      "Red pulses through this piece — something alive and urgent moves in you right now.",
      "There's fire here. Whether that's passion, frustration, or fierce love, it demands to be felt.",
      "Red is the body's color — heartbeat, urgency, aliveness. You're fully present in whatever this is.",
    ],
    orange: [
      "Orange sits between fire and warmth — you might be processing something restless, something becoming.",
      "There's an aliveness in this orange, like a late afternoon sky. Energetic, searching.",
      "Orange carries creative restlessness — ideas and feelings looking for form.",
    ],
    yellow: [
      "Yellow reaches toward light, even when it's hard to find. There's hope coded into this color.",
      "Like sunlight through leaves, your yellows suggest a part of you still reaching upward.",
      "Brightness lives here — maybe tentative, maybe defiant, but reaching.",
    ],
    green: [
      "Green speaks of healing, of wanting to grow through rather than around something.",
      "There's something restorative in these greens — a need for calm, for ground beneath your feet.",
      "Like new growth after rain, your greens carry the possibility of renewal.",
    ],
    blue: [
      "Blue is the color of deep water and open sky — contemplation, longing, or a need for peace.",
      "Your blues suggest you're thinking deeply, perhaps sitting with something rather than rushing through it.",
      "Blue holds both sadness and serenity. There's depth here worth acknowledging.",
    ],
    purple: [
      "Purple lives at the edge of feeling and meaning — you may be processing something layered, something transformative.",
      "These purples suggest emotional complexity, the kind that doesn't resolve quickly but grows into something rich.",
      "Like dusk, your purples carry transition — between one state of being and another.",
    ],
    pink: [
      "Pink holds vulnerability and tenderness — emotions that are soft but no less real.",
      "Your use of pink speaks to gentleness, perhaps toward yourself or someone you care about.",
      "There's something sweet and honest in these pinks — an openness to feeling.",
    ],
    gray: [
      "Gray carries ambiguity — neither here nor there. You may be in the middle of something, not yet resolved.",
      "These neutral tones suggest you're holding space for uncertainty, which is its own kind of wisdom.",
      "Gray is the color of fog and early morning — things not yet clear but present.",
    ],
  };

  // ── COVERAGE NARRATIVES ──
  const coverageNarratives = {
    full: [
      "You've filled the space completely — whatever you're feeling takes up a lot of room right now, and that's okay.",
      "The fullness of this drawing suggests these emotions are significant, worth taking seriously.",
      "You didn't hold back. There's courage in letting it all out, even on a canvas.",
    ],
    moderate: [
      "You've given yourself space to breathe within the drawing — engaging deeply without being consumed.",
      "The balance here suggests you're processing with intention — holding the feeling, not drowning in it.",
      "There's thoughtfulness in how you've filled this space — measured, present, aware.",
    ],
    minimal: [
      "The quiet marks you've left carry weight despite their smallness — sometimes restraint holds everything.",
      "A few careful strokes can say what paragraphs can't. You're choosing what matters.",
      "This sparseness might mean you're still approaching something, still finding words for it. That's okay.",
    ],
  };

  // ── SPATIAL NARRATIVES ──
  const spatialLines: Record<string, string> = {
    top:    "Your marks gather at the top — reaching, aspiring, or perhaps trying to get above something.",
    bottom: "You've anchored toward the base — grounded, but perhaps weighed down too.",
    center: "You've drawn inward, toward center — this feels personal, close to the chest.",
    spread: "Your expression spreads across the whole canvas — these feelings don't fit neatly in one place.",
    left:   "The left side carries more energy — beginnings, the past, or things not yet resolved.",
    right:  "You've moved toward the right — forward motion, what's coming, anticipation.",
  };

  // ── COLOR VARIETY ──
  const varietyLines: Record<string, string> = {
    rich:    "The range of colors you've used reflects emotional complexity — you're holding many things at once.",
    moderate:"A few colors work together here, suggesting layers you're sorting through.",
    simple:  "You've kept to one or two tones — focused, perhaps, or deliberately contained.",
  };

  const varietyKey = colorVariety > 0.6 ? "rich" : colorVariety > 0.3 ? "moderate" : "simple";

  // ── REFLECTIVE QUESTIONS ──
  const reflectiveQuestions = [
    "What does this drawing mean to you — not what it looks like, but what it *feels* like?",
    "If this drawing could speak, what would it say first?",
    "Where in your body do you feel what this drawing expresses?",
    "Is there something in this drawing you haven't let yourself say out loud yet?",
    "What would change if you looked at this drawing a year from now?",
    "What part of this drawing feels most true to where you are right now?",
    "What would you draw differently if you were feeling the opposite of this?",
  ];

  // ── AFFIRMATIONS ──
  const affirmations = [
    "Your feelings are real and worthy of space — in art, in words, in the world.",
    "Thank you for showing up for yourself today, in whatever form that takes. ♥",
    "Expression is brave work. You're doing it.",
    "There's no wrong way to feel. This drawing is proof you're paying attention.",
    "You are allowed to feel all of this — and more.",
    "Art is how we say what language can't hold. You're speaking.",
  ];

  // ── BUILD OUTPUT ──
  const lines: string[] = [];

  // Opening color reading
  if (mainColor) {
    const colorKey = mainColor.name in colorNarratives ? mainColor.name : "gray";
    const options = colorNarratives[colorKey] || colorNarratives["gray"];
    lines.push(options[Math.floor(Math.random() * options.length)]);
  }

  // Secondary color nuance
  if (secondColor && secondColor.proportion > 0.12) {
    const secKey = secondColor.name in colorNarratives ? secondColor.name : "gray";
    const secOptions = colorNarratives[secKey] || [];
    if (secOptions.length > 0) {
      const secLine = secOptions[Math.floor(Math.random() * secOptions.length)];
      lines.push(`Underneath that, ${secLine.charAt(0).toLowerCase() + secLine.slice(1)}`);
    }
  }

  // Color variety
  lines.push(varietyLines[varietyKey]);

  // Spatial reading
  const spatialKey = [verticalBias, horizontalBias]
    .filter(v => v !== "spread" && v !== "center")
    .find(Boolean) || verticalBias;
  if (spatialLines[spatialKey]) {
    lines.push(spatialLines[spatialKey]);
  }

  // Coverage
  const coverageKey = coverage > 0.35 ? "full" : coverage > 0.12 ? "moderate" : "minimal";
  const coverageOptions = coverageNarratives[coverageKey];
  lines.push(coverageOptions[Math.floor(Math.random() * coverageOptions.length)]);

  // Darkness note (if noteworthy)
  if (darknessBias === "dark") {
    lines.push("The darkness you've chosen isn't absence — it's honesty.");
  } else if (darknessBias === "light") {
    lines.push("The lightness here has its own kind of courage — choosing brightness even when things are heavy.");
  }

  // Reflective question
  lines.push("\n" + reflectiveQuestions[Math.floor(Math.random() * reflectiveQuestions.length)]);

  // Affirmation
  lines.push(affirmations[Math.floor(Math.random() * affirmations.length)]);

  return lines.join("\n\n");
}

// ==================== COMPONENT ====================
export function DrawingCanvas({ onSave, initialImage }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#0a0a0a");
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // ── Canvas Init ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (initialImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = initialImage;
    }
  }, [initialImage]);

  // ── Drawing helpers ──
  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getPos(e);
    lastPos.current = pos;
    setIsDrawing(true);
    setHasDrawn(true);

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, (isEraser ? brushSize * 2 : brushSize) / 2, 0, Math.PI * 2);
    ctx.fillStyle = isEraser ? "#ffffff" : color;
    ctx.fill();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = isEraser ? brushSize * 2.5 : brushSize;
    ctx.strokeStyle = isEraser ? "#ffffff" : color;
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setAiInterpretation("");
    setShowInterpretation(false);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `visual-journal-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // ── AI Analysis ──
  const analyzeDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    setIsAnalyzing(true);
    setShowInterpretation(false);

    // Simulate thinking time (real API would go here)
    await new Promise(r => setTimeout(r, 2200));

    const stats = analyzeCanvas(canvas);
    const interpretation = buildRichInterpretation(stats);

    setAiInterpretation(interpretation);
    setShowInterpretation(true);
    setIsAnalyzing(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageData = canvas.toDataURL();
    onSave?.(imageData, aiInterpretation);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F472B6]/20 to-[#8B7EC8]/20 flex items-center justify-center">
            <Palette className="w-4 h-4 text-[#8B7EC8]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0a0a0a]">Visual Journal</h3>
            <p className="text-[11px] text-[#9a9a9a]">Draw what words can't say</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasDrawn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={analyzeDrawing}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#8B7EC8] to-[#6B9BD2] text-white text-xs font-semibold disabled:opacity-60 shadow-md shadow-[#8B7EC8]/20"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Reading...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {showInterpretation ? "Re-read" : "AI Read"}
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Canvas ── */}
      <div className="relative bg-white mx-4 my-3 rounded-xl overflow-hidden border border-black/[0.06]">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-72 cursor-crosshair block"
          style={{ touchAction: "none" }}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <ImageIcon className="w-10 h-10 text-[#9a9a9a]/25 mx-auto mb-2" />
              <p className="text-xs text-[#9a9a9a]/50">Pick a color and draw freely</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="px-4 pb-4 space-y-3">
        {/* Colors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {COLORS.map(c => (
            <motion.button
              key={c.value}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setColor(c.value); setIsEraser(false); }}
              className="w-6 h-6 rounded-full border-2 transition-all"
              style={{
                background: c.value,
                borderColor: color === c.value && !isEraser ? "#0a0a0a" : "transparent",
                outline: color === c.value && !isEraser ? "2px solid #0a0a0a20" : "none",
                outlineOffset: "1px",
              }}
              title={c.name}
            />
          ))}
        </div>

        {/* Brush + Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Brush sizes */}
          <div className="flex items-center gap-1 bg-black/[0.04] rounded-lg p-1">
            {BRUSH_SIZES.map(b => (
              <button
                key={b.size}
                onClick={() => { setBrushSize(b.size); setIsEraser(false); }}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                  brushSize === b.size && !isEraser
                    ? "bg-white shadow-sm text-[#0a0a0a]"
                    : "text-[#9a9a9a] hover:text-[#555555]"
                }`}
                title={b.label}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: Math.min(b.size, 14),
                    height: Math.min(b.size, 14),
                    background: brushSize === b.size && !isEraser ? color : "#9a9a9a",
                  }}
                />
              </button>
            ))}
          </div>

          {/* Eraser */}
          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isEraser
                ? "bg-[#0a0a0a] text-white"
                : "bg-black/[0.04] text-[#9a9a9a] hover:text-[#555555]"
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            Erase
          </button>

          <div className="flex-1" />

          {/* Actions */}
          <button
            onClick={clearCanvas}
            disabled={!hasDrawn}
            className="p-2 rounded-lg text-[#9a9a9a] hover:text-red-400 hover:bg-red-50 transition-all disabled:opacity-30"
            title="Clear canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={downloadImage}
            disabled={!hasDrawn}
            className="p-2 rounded-lg text-[#9a9a9a] hover:text-[#0a0a0a] hover:bg-black/5 transition-all disabled:opacity-30"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          {onSave && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={!hasDrawn}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a0a0a] text-white text-xs font-semibold disabled:opacity-30 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Use Drawing
            </motion.button>
          )}
        </div>
      </div>

      {/* ── AI Interpretation ── */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-4 overflow-hidden"
          >
            <div className="p-5 rounded-xl bg-gradient-to-r from-[#8B7EC8]/6 to-[#6B9BD2]/6 border border-[#8B7EC8]/15 flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B7EC8]/20 to-[#6B9BD2]/20 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-[#8B7EC8] animate-spin" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0a0a0a]">Reading your drawing...</p>
                <p className="text-xs text-[#9a9a9a] mt-0.5">Analyzing colors, patterns & emotional signals</p>
              </div>
            </div>
          </motion.div>
        )}

        {showInterpretation && aiInterpretation && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mb-4"
          >
            <div className="rounded-xl border border-[#8B7EC8]/20 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-[#8B7EC8]/10 to-[#6B9BD2]/8 flex items-center gap-2 border-b border-[#8B7EC8]/15">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-7 h-7 rounded-lg bg-[#8B7EC8]/20 flex items-center justify-center"
                >
                  <Sparkles className="w-4 h-4 text-[#8B7EC8]" />
                </motion.div>
                <div>
                  <h4 className="text-xs font-bold text-[#8B7EC8]">AI Reading</h4>
                  <p className="text-[10px] text-[#9a9a9a]">Pattern & color interpretation</p>
                </div>
                <button
                  onClick={() => setShowInterpretation(false)}
                  className="ml-auto text-[#9a9a9a] hover:text-[#555555] text-xs"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="p-4 bg-white space-y-3">
                {aiInterpretation.split("\n\n").map((para, i) => {
                  const isQuestion = para.trim().startsWith("\n") || para.includes("?");
                  const isAffirmation = i === aiInterpretation.split("\n\n").length - 1;
                  return (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className={`text-sm leading-relaxed ${
                        isAffirmation
                          ? "text-[#8B7EC8] font-medium italic border-t border-[#8B7EC8]/15 pt-3 mt-1"
                          : isQuestion
                          ? "text-[#555555] font-medium bg-[#8B7EC8]/5 px-3 py-2 rounded-lg border-l-2 border-[#8B7EC8]/40"
                          : "text-[#555555]"
                      }`}
                    >
                      {para.trim()}
                    </motion.p>
                  );
                })}
              </div>

              <div className="px-4 py-2.5 bg-black/[0.02] border-t border-black/[0.05]">
                <p className="text-[10px] text-[#9a9a9a] italic">
                  This reading is based on visual patterns — your own meaning matters most.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty Tip ── */}
      {!hasDrawn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mx-4 mb-4 p-3 rounded-xl bg-[#f8f8f8] border border-black/[0.05] flex items-start gap-2.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8B7EC8] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#9a9a9a] leading-relaxed">
            <span className="font-semibold text-[#555555]">Tip:</span> Abstract is powerful — shapes, colors,
            and pressure carry meaning even without form. Draw whatever feels right.
          </p>
        </motion.div>
      )}
    </div>
  );
}
