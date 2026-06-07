"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Palette, Eraser, Trash2, Download, Sparkles, 
  RotateCcw, Check, Loader2, Image as ImageIcon
} from "lucide-react";

interface DrawingCanvasProps {
  onSave?: (imageData: string, aiInterpretation?: string) => void;
  initialImage?: string;
}

const COLORS = [
  { name: "Black", value: "#0a0a0a" },
  { name: "Red", value: "#FF6B6B" },
  { name: "Orange", value: "#FF8C6B" },
  { name: "Yellow", value: "#FFD93D" },
  { name: "Green", value: "#7DA87B" },
  { name: "Blue", value: "#6B9BD2" },
  { name: "Purple", value: "#8B7EC8" },
  { name: "Pink", value: "#FF6B9D" },
];

const BRUSH_SIZES = [2, 4, 8, 12, 16];

export function DrawingCanvas({ onSave, initialImage }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#0a0a0a");
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load initial image if exists
    if (initialImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = initialImage;
    }
  }, [initialImage]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? "#ffffff" : color;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
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
    link.download = `journal-drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const analyzeDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    setIsAnalyzing(true);
    setShowInterpretation(false);

    // Simulate AI analysis (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI interpretation based on colors and complexity
    const imageData = canvas.toDataURL();
    const mockInterpretation = generateMockInterpretation(imageData);
    
    setAiInterpretation(mockInterpretation);
    setShowInterpretation(true);
    setIsAnalyzing(false);
  };

  const generateMockInterpretation = (imageData: string): string => {
    // Analyze actual canvas data
    const canvas = canvasRef.current;
    if (!canvas) return "Unable to analyze the drawing.";

    const ctx = canvas.getContext("2d");
    if (!ctx) return "Unable to analyze the drawing.";

    // Get image data for analysis
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    // Analyze colors used
    const colorCounts: Record<string, number> = {};
    let totalNonWhite = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Skip white/near-white pixels
      if (r > 240 && g > 240 && b > 240) continue;
      
      totalNonWhite++;
      
      // Categorize colors
      const colorKey = getColorCategory(r, g, b);
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    }

    // Determine dominant colors
    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Calculate coverage
    const coverage = totalNonWhite / (canvas.width * canvas.height);
    const coverageLevel = coverage > 0.4 ? "full" : coverage > 0.2 ? "moderate" : "minimal";

    // Build interpretation
    return buildInterpretation(sortedColors, coverageLevel);
  };

  const getColorCategory = (r: number, g: number, b: number): string => {
    // Determine color family
    if (r > 200 && g < 100 && b < 100) return "red";
    if (r > 200 && g > 150 && b < 100) return "orange";
    if (r > 200 && g > 200 && b < 100) return "yellow";
    if (g > 150 && r < 150 && b < 150) return "green";
    if (b > 150 && r < 150 && g < 150) return "blue";
    if (r > 150 && b > 150 && g < 150) return "purple";
    if (r > 180 && g < 150 && b > 150) return "pink";
    if (r < 100 && g < 100 && b < 100) return "black";
    return "gray";
  };

  const buildInterpretation = (
    dominantColors: [string, number][],
    coverage: "full" | "moderate" | "minimal"
  ): string => {
    const colorMeanings: Record<string, string[]> = {
      red: [
        "The red tones suggest intensity - perhaps passion, anger, or strong determination.",
        "Red appears prominently, indicating powerful emotions you're experiencing.",
        "Your use of red shows energy and urgency in what you're feeling."
      ],
      orange: [
        "Orange hues suggest warmth and enthusiasm, though perhaps tinged with restlessness.",
        "The orange tones show creative energy seeking expression.",
        "Orange indicates a mix of passion and optimism in your current state."
      ],
      yellow: [
        "Yellow suggests hope and brightness, even if things feel challenging.",
        "The yellow tones show you're seeking light and clarity.",
        "Your use of yellow indicates optimism trying to break through."
      ],
      green: [
        "Green suggests a need for balance, growth, or healing.",
        "The green tones show you're in a process of renewal or seeking peace.",
        "Green indicates you're grounding yourself or seeking stability."
      ],
      blue: [
        "Blue suggests calm, contemplation, or perhaps sadness that needs acknowledgment.",
        "The blue tones show introspection - you're thinking deeply about something.",
        "Your use of blue indicates a need for peace or emotional release."
      ],
      purple: [
        "Purple suggests deep emotions, spirituality, or creative processing.",
        "The purple tones show you're exploring complex feelings.",
        "Purple indicates you're in a transformative emotional space."
      ],
      pink: [
        "Pink suggests gentleness, love, or vulnerable emotions.",
        "The pink tones show tenderness - either toward yourself or others.",
        "Your use of pink indicates soft, caring emotions at play."
      ],
      black: [
        "Black suggests depth, perhaps heaviness, but also strength and grounding.",
        "The dark tones show you're processing something weighty.",
        "Black indicates you're facing something difficult but with honesty."
      ],
      gray: [
        "Gray tones suggest ambiguity or neutral processing of emotions.",
        "The muted colors show you might feel uncertain or in transition.",
        "Gray indicates you're in a liminal space, which is okay."
      ]
    };

    const coverageMeanings = {
      full: [
        "Your drawing fills the space, suggesting these feelings are taking up a lot of room in your mind right now.",
        "The fullness of your drawing shows these emotions are consuming significant mental and emotional energy.",
        "You've used the entire canvas - these feelings are big and deserve attention."
      ],
      moderate: [
        "Your drawing occupies a comfortable amount of space, suggesting balanced emotional processing.",
        "The moderate coverage shows you're engaging with your feelings without being overwhelmed.",
        "You're giving these emotions appropriate space - not minimizing, not drowning."
      ],
      minimal: [
        "Your sparse drawing might suggest holding back, or perhaps these feelings are just emerging.",
        "The minimal coverage could mean you're being gentle with yourself, taking things slowly.",
        "Less can be more - sometimes the smallest marks carry the deepest meaning."
      ]
    };

    const questionPrompts = [
      "What does this drawing mean to you?",
      "What feelings were you trying to express?",
      "Is there something specific this represents?",
      "What would you tell a friend who drew this?",
      "What part of the drawing feels most true?"
    ];

    const supportiveClosings = [
      "Remember, all feelings are valid. You're doing brave work by expressing them {'<3'}",
      "Thank you for sharing this with yourself. That takes courage :)",
      "Your feelings deserve to be seen and heard, even in abstract form.",
      "This is your truth right now, and that's enough {'<3'}",
      "Keep expressing yourself - words, art, or both. You're worth it :)"
    ];

    // Build the interpretation
    let interpretation = "";

    // Opening based on dominant color
    if (dominantColors.length > 0) {
      const mainColor = dominantColors[0][0];
      const colorMessage = colorMeanings[mainColor]?.[
        Math.floor(Math.random() * colorMeanings[mainColor].length)
      ] || "Your color choices are meaningful.";
      interpretation += colorMessage + " ";
    }

    // Multiple colors = complexity
    if (dominantColors.length >= 2) {
      const secondColor = dominantColors[1][0];
      if (secondColor && colorMeanings[secondColor]) {
        interpretation += `The presence of ${secondColor} alongside this adds complexity - you might be experiencing multiple emotions at once, which is completely natural. `;
      }
    }

    // Coverage meaning
    const coverageMessage = coverageMeanings[coverage][
      Math.floor(Math.random() * coverageMeanings[coverage].length)
    ];
    interpretation += coverageMessage + " ";

    // Reflective question
    const question = questionPrompts[Math.floor(Math.random() * questionPrompts.length)];
    interpretation += "\n\n" + question + " ";

    // Supportive closing
    const closing = supportiveClosings[Math.floor(Math.random() * supportiveClosings.length)];
    interpretation += closing;

    return interpretation;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL();
    onSave?.(imageData, aiInterpretation);
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#FF6B9D]/20 to-[#8B7EC8]/20">
            <Palette className="w-5 h-5 text-[#8B7EC8]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0a0a0a]">Visual Journal</h3>
            <p className="text-xs text-[#9a9a9a]">Draw how you feel :)</p>
          </div>
        </div>

        {hasDrawn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={analyzeDrawing}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B7EC8] to-[#6B9BD2] text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-[#8B7EC8]/25"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI Interpret
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-80 border-2 border-black/[0.08] rounded-xl cursor-crosshair bg-white"
          style={{ touchAction: "none" }}
        />
        
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-[#9a9a9a]/30 mx-auto mb-2" />
              <p className="text-sm text-[#9a9a9a]/60">Start drawing to express yourself</p>
            </div>
          </div>
        )}
      </div>

      {/* Tools */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Colors */}
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <motion.button
              key={c.value}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setColor(c.value);
                setIsEraser(false);
              }}
              className="w-7 h-7 rounded-full border-2 transition-all"
              style={{
                background: c.value,
                borderColor: color === c.value && !isEraser ? "#0a0a0a" : "transparent",
                boxShadow: color === c.value && !isEraser ? "0 0 0 2px #0a0a0a20" : "none",
              }}
              title={c.name}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-black/[0.08]" />

        {/* Brush Sizes */}
        <div className="flex items-center gap-1">
          {BRUSH_SIZES.map((size) => (
            <motion.button
              key={size}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setBrushSize(size);
                setIsEraser(false);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: brushSize === size && !isEraser ? "rgba(0,0,0,0.08)" : "transparent",
              }}
              title={`${size}px`}
            >
              <div
                className="rounded-full bg-[#0a0a0a]"
                style={{ width: size, height: size }}
              />
            </motion.button>
          ))}
        </div>

        <div className="w-px h-6 bg-black/[0.08]" />

        {/* Eraser */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEraser(!isEraser)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isEraser ? "bg-black/8 text-[#0a0a0a]" : "text-[#9a9a9a] hover:bg-black/4"
          }`}
        >
          <Eraser className="w-4 h-4" />
          <span className="text-xs font-medium">Eraser</span>
        </motion.button>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearCanvas}
            className="p-2 rounded-lg text-[#9a9a9a] hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadImage}
            disabled={!hasDrawn}
            className="p-2 rounded-lg text-[#9a9a9a] hover:text-[#0a0a0a] hover:bg-black/5 transition-colors disabled:opacity-30"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </motion.button>

          {onSave && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={!hasDrawn}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a0a0a] text-white text-sm font-medium disabled:opacity-30"
            >
              <Check className="w-4 h-4" />
              Save Drawing
            </motion.button>
          )}
        </div>
      </div>

      {/* AI Interpretation */}
      <AnimatePresence>
        {showInterpretation && aiInterpretation && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-xl bg-gradient-to-r from-[#8B7EC8]/10 to-[#6B9BD2]/10 border border-[#8B7EC8]/30"
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-2 rounded-lg bg-[#8B7EC8]/20 flex-shrink-0"
              >
                <Sparkles className="w-5 h-5 text-[#8B7EC8]" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#0a0a0a] mb-2">
                  AI Interpretation
                </h4>
                <p className="text-sm text-[#555555] leading-relaxed">
                  {aiInterpretation}
                </p>
                <p className="text-xs text-[#9a9a9a] mt-3 italic">
                  💡 This is an interpretation based on visual patterns. Your feelings are valid regardless of AI analysis {'<3'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      {!hasDrawn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-[#f8f8f8] border border-black/[0.06]"
        >
          <p className="text-xs text-[#555555] leading-relaxed">
            <span className="font-semibold">💡 Tip:</span> Don't worry about making it perfect. 
            Use colors, shapes, and lines to express what words can't capture. 
            Abstract is beautiful :)
          </p>
        </motion.div>
      )}
    </div>
  );
}
