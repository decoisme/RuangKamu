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
  dominantColors: Array<{ name: string; label: string; value: string; proportion: number }>;
  coverage: number;            // 0–1
  verticalBias: "top" | "center" | "bottom" | "spread";
  horizontalBias: "left" | "center" | "right" | "spread";
  colorVariety: number;        // number of distinct color families used
  darknessBias: "dark" | "neutral" | "light";
  strokeRoughness: number;     // 0–1 (high = choppy/erratic, low = smooth)
  hasMultipleClusters: boolean; // marks drawn in separate areas = fragmented
}

function toHSL(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h60 = max === rn
    ? ((gn - bn) / d + (gn < bn ? 6 : 0))
    : max === gn
    ? (bn - rn) / d + 2
    : (rn - gn) / d + 4;
  return { h: h60 * 60, s, l };
}

function categorizeColor(r: number, g: number, b: number): string {
  const { h, s, l } = toHSL(r, g, b);
  if (l < 0.15) return "black";
  if (l > 0.85 && s < 0.15) return "white";
  if (s < 0.12) return l < 0.45 ? "dark" : "gray";
  if (l < 0.25) return "dark";
  if (h < 15 || h >= 345) return "red";
  if (h < 40) return "orange";
  if (h < 70) return "yellow";
  if (h < 165) return "green";
  if (h < 255) return "blue";
  if (h < 290) return "purple";
  if (h < 345) return "pink";
  return "red";
}

function analyzeCanvas(canvas: HTMLCanvasElement): DrawingStats {
  const ctx = canvas.getContext("2d");
  if (!ctx) return {} as DrawingStats;

  const w = canvas.width;
  const h = canvas.height;

  // Sample every other pixel for performance
  const STEP = 2;
  const imgData = ctx.getImageData(0, 0, w, h);
  const pixels = imgData.data;

  const colorBuckets: Record<string, number> = {};
  let totalNonWhite = 0;
  let totalBrightness = 0;

  // Spatial grid 4×4 for finer position detection
  const GRID = 4;
  const gW = Math.floor(w / GRID);
  const gH = Math.floor(h / GRID);
  const spatialGrid: number[][] = Array.from({ length: GRID }, () => Array(GRID).fill(0));

  // Roughness: count edge transitions (color changes in adjacent pixels)
  let edgeChanges = 0;
  let edgeSamples = 0;

  for (let y = 0; y < h; y += STEP) {
    for (let x = 0; x < w; x += STEP) {
      const i = (y * w + x) * 4;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];

      if (r > 235 && g > 235 && b > 235) {
        // Check for edge transitions even on white boundaries
        if (x > 0) {
          const pi = (y * w + (x - STEP)) * 4;
          const pr = pixels[pi], pg = pixels[pi + 1], pb = pixels[pi + 2];
          const wasDark = !(pr > 235 && pg > 235 && pb > 235);
          if (wasDark) edgeChanges++; edgeSamples++;
        }
        continue;
      }

      totalNonWhite++;
      totalBrightness += (r * 299 + g * 587 + b * 114) / 1000;

      const gx = Math.min(GRID - 1, Math.floor(x / gW));
      const gy = Math.min(GRID - 1, Math.floor(y / gH));
      spatialGrid[gy][gx]++;

      const key = categorizeColor(r, g, b);
      if (key !== "white") colorBuckets[key] = (colorBuckets[key] || 0) + 1;

      // Edge detection
      if (x > 0) {
        const pi = (y * w + (x - STEP)) * 4;
        const pr = pixels[pi], pg = pixels[pi + 1], pb = pixels[pi + 2];
        const brightDiff = Math.abs(
          (r * 299 + g * 587 + b * 114) / 1000 -
          (pr * 299 + pg * 587 + pb * 114) / 1000
        );
        if (brightDiff > 40) edgeChanges++;
        edgeSamples++;
      }
    }
  }

  const totalSampledPixels = (w * h) / (STEP * STEP);
  const coverage = Math.min(1, totalNonWhite / (totalSampledPixels * 0.9));

  // Color mapping
  const colorMeta: Record<string, { label: string; value: string }> = {
    black:  { label: "hitam",  value: "#0a0a0a" },
    dark:   { label: "gelap",  value: "#334155" },
    red:    { label: "merah",  value: "#E05C5C" },
    orange: { label: "oranye", value: "#F59E0B" },
    yellow: { label: "kuning", value: "#FCD34D" },
    green:  { label: "hijau",  value: "#6DAF7A" },
    blue:   { label: "biru",   value: "#60A5FA" },
    purple: { label: "ungu",   value: "#8B7EC8" },
    pink:   { label: "pink",   value: "#F472B6" },
    gray:   { label: "abu",    value: "#94A3B8" },
  };

  const sortedColors = Object.entries(colorBuckets)
    .sort((a, b) => b[1] - a[1]);

  const dominantColors = sortedColors.slice(0, 4).map(([key, count]) => ({
    name: key,
    label: colorMeta[key]?.label || key,
    value: colorMeta[key]?.value || "#9a9a9a",
    proportion: count / (totalNonWhite || 1),
  }));

  // Spatial bias using 4×4 grid collapsed to 3 zones
  const topRows = spatialGrid.slice(0, 1).reduce((s, r) => s + r.reduce((a,b) => a+b, 0), 0);
  const midRows = spatialGrid.slice(1, 3).reduce((s, r) => s + r.reduce((a,b) => a+b, 0), 0);
  const botRows = spatialGrid.slice(3).reduce((s, r) => s + r.reduce((a,b) => a+b, 0), 0);
  const leftCols = spatialGrid.reduce((s, r) => s + r[0] + r[1], 0);
  const rightCols = spatialGrid.reduce((s, r) => s + r[2] + r[3], 0);

  const rowTotal = topRows + midRows + botRows || 1;
  const colTotal = leftCols + rightCols || 1;

  const verticalBias: DrawingStats["verticalBias"] =
    (Math.max(topRows, botRows) / rowTotal < 0.45 && midRows / rowTotal > 0.4) ? "center"
    : topRows > botRows * 1.5 ? "top"
    : botRows > topRows * 1.5 ? "bottom"
    : "spread";

  const horizontalBias: DrawingStats["horizontalBias"] =
    leftCols > rightCols * 1.4 ? "left"
    : rightCols > leftCols * 1.4 ? "right"
    : Math.abs(leftCols - rightCols) / colTotal < 0.15 ? "spread"
    : "center";

  // Cluster detection: check how many of the 4×4 cells are occupied
  const occupiedCells = spatialGrid.flat().filter(v => v > totalNonWhite * 0.02).length;
  const hasMultipleClusters = occupiedCells >= 5 && coverage < 0.4;

  const colorVariety = Object.keys(colorBuckets).filter(k => k !== "black" && k !== "dark" && k !== "gray").length;
  const avgBrightness = totalNonWhite > 0 ? totalBrightness / totalNonWhite : 200;
  const darknessBias: DrawingStats["darknessBias"] =
    avgBrightness < 90 ? "dark" : avgBrightness > 175 ? "light" : "neutral";

  const strokeRoughness = edgeSamples > 0
    ? Math.min(1, (edgeChanges / edgeSamples) * 4)
    : 0;

  return {
    dominantColors,
    coverage,
    verticalBias,
    horizontalBias,
    colorVariety,
    darknessBias,
    strokeRoughness,
    hasMultipleClusters,
  };
}

// ==================== INTERPRETATION ENGINE ====================
function buildInterpretation(stats: DrawingStats): string {
  const {
    dominantColors, coverage, verticalBias, horizontalBias,
    colorVariety, darknessBias, strokeRoughness, hasMultipleClusters,
  } = stats;

  if (!dominantColors || dominantColors.length === 0) {
    return "Kanvasnya masih kosong — coba gambar dulu, lalu minta AI membaca :)";
  }

  const main = dominantColors[0];
  const second = dominantColors[1];
  const parts: string[] = [];

  // ── 1. WARNA UTAMA ──
  const colorInsights: Record<string, string> = {
    black:  "Kamu banyak pakai warna hitam. Warna ini sering muncul saat seseorang sedang memproses sesuatu yang berat atau serius, atau memang suka ekspresi yang tegas.",
    dark:   "Warna-warna gelap mendominasi gambarmu. Ini bisa berarti kamu lagi di fase yang lebih introspektif atau ada sesuatu yang terasa berat hari ini.",
    red:    "Merah adalah warna yang kuat — bisa menandakan kamu lagi merasa intens, baik itu semangat, frustrasi, atau emosi yang sedang memuncak.",
    orange: "Oranye biasanya muncul saat seseorang merasa aktif atau sedikit gelisah. Energi tinggi, tapi mungkin belum tahu harus diarahkan ke mana.",
    yellow: "Kuning sering dikaitkan dengan keceriaan atau harapan. Kamu mungkin sedang berusaha melihat sisi positif dari sesuatu.",
    green:  "Hijau menandakan ketenangan atau keinginan untuk recovery. Kamu mungkin butuh sedikit jeda dan ruang untuk napas.",
    blue:   "Biru menunjukkan kamu sedang dalam mode reflektif atau butuh ketenangan. Bisa juga ada rasa rindu atau sedikit sedih yang belum terungkap.",
    purple: "Ungu sering muncul saat emosi terasa kompleks atau campur aduk. Kamu mungkin sedang memproses lebih dari satu perasaan sekaligus.",
    pink:   "Pink menunjukkan sisi yang lebih lembut — mungkin kamu sedang merasakan sesuatu yang hangat, atau ingin lebih sayang ke diri sendiri.",
    gray:   "Abu-abu sering muncul saat seseorang merasa netral, lelah, atau belum yakin dengan apa yang dirasakan. Itu wajar kok.",
  };

  parts.push(colorInsights[main.name] || `Kamu menggunakan warna ${main.label} sebagai warna utama.`);

  // ── 2. WARNA KEDUA (jika signifikan) ──
  if (second && second.proportion > 0.15) {
    const secondLines: Record<string, string> = {
      red:    `Ada sentuhan merah juga — kombinasi ini bisa menandakan perasaan yang kuat tapi juga penuh semangat.`,
      blue:   `Kombinasi dengan biru menunjukkan ada sisi tenang di balik ekspresimu.`,
      green:  `Sentuhan hijau menambah nuansa yang lebih damai di antara ekspresimu.`,
      yellow: `Warna kuning di sini seperti kilatan harapan kecil di tengah perasaan lainnya.`,
      black:  `Hitam sebagai warna pendukung biasanya menambah ketegasan atau kedalaman ekspresi.`,
      purple: `Ada ungu juga — ini membuat gambarmu terasa lebih emosional dan berlapis.`,
      pink:   `Sentuhan pink di sini membuat ekspresimu terasa lebih lembut.`,
      orange: `Oranye di sampingnya menambah kesan energik.`,
      gray:   `Abu-abu sebagai pendukung menambah nuansa ketidakpastian atau keheningan.`,
      dark:   `Warna gelap sebagai pendukung memperkuat kesan serius dari gambarmu.`,
    };
    const secondLine = secondLines[second.name];
    if (secondLine) parts.push(secondLine);
  }

  // ── 3. COVERAGE (seberapa penuh kanvas) ──
  if (coverage > 0.45) {
    parts.push("Kamu mengisi hampir seluruh kanvas — ini menunjukkan kamu menuangkan banyak hal sekaligus, seperti ada yang perlu dikeluarkan.");
  } else if (coverage > 0.2) {
    parts.push("Kamu mengisi sebagian kanvas dengan cukup seimbang — tidak terlalu menahan, tapi juga tidak berlebihan.");
  } else {
    parts.push("Gambarmu cukup minimalis — bisa jadi kamu sedang hati-hati dalam mengekspresikan sesuatu, atau masih memulai.");
  }

  // ── 4. STROKE ROUGHNESS ──
  if (strokeRoughness > 0.65) {
    parts.push("Goresan di gambarmu terlihat cepat dan tidak teratur — ini bisa menandakan kamu sedang merasa tidak tenang atau ada emosi yang ingin segera keluar.");
  } else if (strokeRoughness < 0.25 && coverage > 0.1) {
    parts.push("Goresanmu terlihat cukup halus dan terkontrol — kamu seperti menggambar dengan lebih tenang dan sadar.");
  }

  // ── 5. COLOR VARIETY ──
  if (colorVariety >= 4) {
    parts.push(`Kamu memakai ${colorVariety} warna berbeda — gambarmu terasa seperti refleksi dari banyak perasaan yang sedang bercampur.`);
  } else if (colorVariety === 0 && (main.name === "black" || main.name === "dark")) {
    parts.push("Kamu hanya pakai warna gelap — kadang ini berarti ada satu perasaan dominan yang sedang memenuhi pikiran.");
  }

  // ── 6. SPATIAL ──
  const spatialNotes: Partial<Record<string, string>> = {
    top:    "Gambarmu cenderung di area atas — biasanya ini menandakan banyak pikiran yang berputar di kepala.",
    bottom: "Gambarmu cenderung di area bawah — bisa jadi kamu merasa lebih terhubung ke hal-hal yang konkret atau ada sesuatu yang terasa 'berat'.",
    left:   "Kamu banyak menggambar di sisi kiri — orang sering kali menggambar di area ini saat memikirkan masa lalu atau hal yang belum selesai.",
    right:  "Gambarmu condong ke kanan — bisa menandakan kamu sedang melihat ke depan atau memikirkan sesuatu yang akan datang.",
    spread: "Gambarmu tersebar di seluruh kanvas — terasa seperti banyak hal yang ingin diungkapkan sekaligus.",
  };
  const spatialKey = verticalBias !== "spread" && verticalBias !== "center" ? verticalBias
    : horizontalBias !== "spread" && horizontalBias !== "center" ? horizontalBias
    : "spread";
  if (spatialNotes[spatialKey]) parts.push(spatialNotes[spatialKey]!);

  // ── 7. CLUSTERS ──
  if (hasMultipleClusters) {
    parts.push("Ada beberapa kelompok gambar yang terpisah-pisah — ini menarik, bisa jadi ada lebih dari satu hal yang sedang kamu pikirkan atau rasakan.");
  }

  // ── 8. DARKNESS BIAS ──
  if (darknessBias === "dark") {
    parts.push("Secara keseluruhan, gambarmu cenderung gelap. Tidak apa-apa merasa berat — ekspresi seperti ini justru membantu kamu mengenalinya.");
  } else if (darknessBias === "light") {
    parts.push("Gambarmu punya nuansa yang cerah dan ringan — ada energi positif yang tampak dari pilihanmu.");
  }

  // ── 9. PERTANYAAN REFLEKTIF (1 saja, langsung to the point) ──
  const reflectiveQs = [
    "Kalau kamu harus kasih judul buat gambar ini, kira-kira apa?",
    "Ada bagian dari gambar ini yang paling terasa 'benar' buatmu?",
    "Apa yang kamu rasakan pas menggambar tadi?",
    "Kalau gambar ini bisa ngomong, kira-kira dia bilang apa?",
    "Perasaan apa yang paling kamu ingin orang lain mengerti dari gambar ini?",
  ];
  parts.push("\n" + reflectiveQs[Math.floor(Math.random() * reflectiveQs.length)]);

  // ── 10. PENUTUP HANGAT ──
  const closings = [
    "Gambar itu sendiri sudah cukup — tidak perlu sempurna untuk jadi bermakna.",
    "Terima kasih sudah meluangkan waktu untuk mengekspresikan diri. Itu bukan hal yang kecil.",
    "Tidak ada cara yang salah untuk mengungkapkan perasaan, termasuk dengan menggambar seperti ini.",
    "Kamu sudah melakukan sesuatu yang bagus hari ini — mengenali dan mengekspresikan perasaan itu butuh keberanian.",
  ];
  parts.push(closings[Math.floor(Math.random() * closings.length)]);

  return parts.join("\n\n");
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

    // Analyze pixel data (replace with real API for even better results)
    await new Promise(r => setTimeout(r, 1800));

    const stats = analyzeCanvas(canvas);
    const interpretation = buildInterpretation(stats);

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
                  Pembacaan ini berdasarkan analisis warna & pola visual — maknamu sendiri tetap yang paling penting.
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
            <span className="font-semibold text-[#555555]">Tips:</span> Nggak harus realistis — bentuk, warna, dan tekanan goresan semuanya punya makna. Gambar apapun yang kamu rasakan.
          </p>
        </motion.div>
      )}
    </div>
  );
}
