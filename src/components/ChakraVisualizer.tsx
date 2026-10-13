import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize2, Eye, GitBranch, Layers, Sparkles, Disc } from 'lucide-react';
import { LedPoint, PatternSettings, RGBColor } from '../types/chakra';
import { rgbToHex } from '../constants/palettes';

interface ChakraVisualizerProps {
  ledPoints: LedPoint[];
  colors: RGBColor[];
  settings: PatternSettings;
  onUpdateSettings: (newSettings: Partial<PatternSettings>) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepFrame: () => void;
  onResetTime: () => void;
  fps: number;
  patternTitle: string;
  discDiameterInches?: number;
  bottomGapDeg?: number;
}

export const ChakraVisualizer: React.FC<ChakraVisualizerProps> = ({
  ledPoints,
  colors,
  settings,
  onUpdateSettings,
  isPlaying,
  onTogglePlay,
  onStepFrame,
  onResetTime,
  fps,
  patternTitle,
  discDiameterInches = 15,
  bottomGapDeg = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState(1.0);
  const [hoveredLed, setHoveredLed] = useState<{ point: LedPoint; color: RGBColor; screenX: number; screenY: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Redraw canvas on colors/points update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(centerX, centerY) * 0.88 * zoom;

    // Clear background: dark studio workbench
    ctx.fillStyle = '#070a11';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);

    // DRAW THE PHYSICAL MATTE BLACK 15-INCH DISC (as shown in user photo)
    // 1. Outer disc drop shadow
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius + 14, 0, Math.PI * 2);
    ctx.fillStyle = '#0b0f19';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 28 * zoom;
    ctx.shadowOffsetY = 12 * zoom;
    ctx.fill();
    ctx.restore();

    // 2. Main Matte Black Halo Disc Board
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius + 14, 0, Math.PI * 2);
    ctx.fillStyle = '#121622'; // matte black acrylic / sunboard
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#232a3b';
    ctx.stroke();

    // Subtle edge chamfer
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius + 11, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.stroke();

    // 3. Inner Center Hole / Head Mount Zone
    // If there is an inner radius, draw the center circle
    const innerRadiusEstimate = ledPoints.length > 0 ? (ledPoints[0]?.radius || 0.28) * baseRadius * 0.9 : baseRadius * 0.28;
    ctx.beginPath();
    ctx.arc(0, 0, innerRadiusEstimate, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0d14'; // center cutout
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#1e2433';
    ctx.stroke();

    // 4. Bottom Statue Opening / Gap Wedge (if bottomGapDeg > 0)
    if (bottomGapDeg > 0) {
      const gapRad = (bottomGapDeg * Math.PI) / 180;
      const startAngle = (Math.PI / 2) - (gapRad / 2);
      const endAngle = (Math.PI / 2) + (gapRad / 2);

      // Draw faint guideline wedge showing the statue opening area
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, baseRadius + 14, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.stroke();
      ctx.setLineDash([]);

      // Gap indicator text
      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.textAlign = 'center';
      ctx.fillText(`Statue Gap (${Math.round(bottomGapDeg)}°)`, 0, baseRadius * 0.72);
    }

    // Concentric guideline rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let r = 0.2; r <= 1.0; r += 0.2) {
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // DRAW BLACK PCB STRIP SUBSTRATE UNDERNEATH LEDS (Realistic strips like in user photo)
    // Group LEDs by spoke to draw strip arms
    const spokesMap = new Map<number, LedPoint[]>();
    ledPoints.forEach((p) => {
      if (p.spokeIndex >= 0) {
        if (!spokesMap.has(p.spokeIndex)) spokesMap.set(p.spokeIndex, []);
        spokesMap.get(p.spokeIndex)!.push(p);
      }
    });

    // Draw strip PCB substrate rectangles
    ctx.save();
    spokesMap.forEach((pts) => {
      if (pts.length < 2) return;
      const pFirst = pts[0];
      const pLast = pts[pts.length - 1];
      const angle = pFirst.angle;

      ctx.save();
      ctx.rotate(angle);

      const rStart = pFirst.radius * baseRadius - 6;
      const rEnd = pLast.radius * baseRadius + 6;
      const stripWidth = Math.max(8, 11 * zoom);

      // Black PCB substrate strip
      ctx.fillStyle = '#161922';
      ctx.fillRect(-stripWidth / 2, rStart, stripWidth, rEnd - rStart);
      ctx.strokeStyle = '#272d3b';
      ctx.lineWidth = 1;
      ctx.strokeRect(-stripWidth / 2, rStart, stripWidth, rEnd - rStart);

      // Solder pads at strip ends
      ctx.fillStyle = '#b45309'; // copper pads
      ctx.fillRect(-stripWidth / 2 + 1.5, rStart + 1, 2, 3);
      ctx.fillRect(-stripWidth / 2 + 1.5, rEnd - 4, 2, 3);
      ctx.fillRect(stripWidth / 2 - 3.5, rStart + 1, 2, 3);
      ctx.fillRect(stripWidth / 2 - 3.5, rEnd - 4, 2, 3);

      ctx.restore();
    });
    ctx.restore();

    // Draw wiring connections if enabled
    if (settings.showWiringOrder && ledPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);

      for (let i = 0; i < ledPoints.length - 1; i++) {
        const p1 = ledPoints[i];
        const p2 = ledPoints[i + 1];
        ctx.moveTo(p1.x * baseRadius, p1.y * baseRadius);
        ctx.lineTo(p2.x * baseRadius, p2.y * baseRadius);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // DIFFUSER VIEW (Frosted white acrylic simulation)
    if (settings.diffuserView) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ledPoints.forEach((p, idx) => {
        const c = colors[idx] || { r: 0, g: 0, b: 0 };
        if (c.r === 0 && c.g === 0 && c.b === 0) return;

        const lx = p.x * baseRadius;
        const ly = p.y * baseRadius;
        const glowRad = 34 * zoom;

        const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, glowRad);
        grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.72)`);
        grad.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, 0.28)`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(lx, ly, glowRad, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      ctx.beginPath();
      ctx.arc(0, 0, baseRadius + 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();
    }

    // DRAW INDIVIDUAL WS2812 SMD5050 LED PACKAGES
    const diodeSize = Math.max(5, Math.min(13, 9.5 * zoom));

    ledPoints.forEach((p, idx) => {
      const c = colors[idx] || { r: 0, g: 0, b: 0 };
      const lx = p.x * baseRadius;
      const ly = p.y * baseRadius;

      const brightnessVal = (c.r + c.g + c.b) / (255 * 3);

      // Bloom halo
      if (brightnessVal > 0.04 && !settings.diffuserView) {
        const bloomRad = diodeSize * 2.8 * (0.8 + brightnessVal * 0.8);
        const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, bloomRad);
        grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${0.52 * brightnessVal})`);
        grad.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, ${0.16 * brightnessVal})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(lx, ly, bloomRad, 0, Math.PI * 2);
        ctx.fill();
      }

      // SMD5050 White/Black Package with silver contacts
      ctx.fillStyle = '#0f1118';
      ctx.fillRect(lx - diodeSize / 2, ly - diodeSize / 2, diodeSize, diodeSize);
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.strokeRect(lx - diodeSize / 2, ly - diodeSize / 2, diodeSize, diodeSize);

      // Emitting core diode
      const coreRad = diodeSize * 0.36;
      ctx.beginPath();
      ctx.arc(lx, ly, coreRad, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;
      ctx.fill();

      // Core white hotspot
      if (brightnessVal > 0.1) {
        ctx.beginPath();
        ctx.arc(lx, ly, coreRad * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.48 * brightnessVal})`;
        ctx.fill();
      }

      // LED index number
      if (settings.showWiringOrder) {
        ctx.font = '8px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${idx}`, lx, ly - diodeSize * 0.95);
      }
    });

    // CENTER SACRED MEDALLION
    if (settings.showCenterMedallion) {
      const coreRadius = baseRadius * 0.16;

      const medGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 1.5);
      medGrad.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
      medGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = medGrad;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#111520';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#d97706';
      ctx.stroke();

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      for (let s = 0; s < 8; s++) {
        const spokeAng = (s / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(spokeAng) * (coreRadius * 0.8), Math.sin(spokeAng) * (coreRadius * 0.8));
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(0, 0, coreRadius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = '#d97706';
      ctx.fill();
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }, [ledPoints, colors, settings, zoom, bottomGapDeg, discDiameterInches]);

  // Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height || 640);
      const dpr = window.devicePixelRatio || 1;

      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hover detection for LED points
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(centerX, centerY) * 0.88 * zoom;

      let closest: { point: LedPoint; color: RGBColor; dist: number } | null = null;
      const threshold = 18;

      ledPoints.forEach((p, idx) => {
        const px = centerX + p.x * baseRadius;
        const py = centerY + p.y * baseRadius;
        const dist = Math.hypot(clientX - px, clientY - py);

        if (dist < threshold && (!closest || dist < closest.dist)) {
          closest = {
            point: p,
            color: colors[idx] || { r: 0, g: 0, b: 0 },
            dist,
          };
        }
      });

      if (closest) {
        setHoveredLed({
          point: (closest as any).point,
          color: (closest as any).color,
          screenX: clientX,
          screenY: clientY,
        });
      } else {
        setHoveredLed(null);
      }
    },
    [ledPoints, colors, zoom]
  );

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden p-4 select-none ${
        isFullscreen ? 'w-screen h-screen' : 'min-h-[520px] lg:h-[640px]'
      }`}
    >
      {/* Top Overlay Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200 tracking-wide">
            {patternTitle}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {fps} FPS
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs font-mono text-amber-400 tabular-nums">
            {ledPoints.length} LEDs
          </span>
          {discDiameterInches && (
            <>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-[11px] font-mono text-sky-400 hidden sm:inline">
                {discDiameterInches}-inch Board
              </span>
            </>
          )}
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
          <button
            onClick={() => onUpdateSettings({ diffuserView: !settings.diffuserView })}
            title="Toggle Acrylic Diffuser View"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              settings.diffuserView
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Diffuser</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ showWiringOrder: !settings.showWiringOrder })}
            title="Toggle Wiring Order & LED Indices"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              settings.showWiringOrder
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wiring</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ showCenterMedallion: !settings.showCenterMedallion })}
            title="Toggle Center Medallion"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              settings.showCenterMedallion
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Center Hub</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex items-center justify-center w-full h-full my-auto">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredLed(null)}
          className="cursor-crosshair transition-transform"
        />

        {/* Hover Inspector Tooltip */}
        {hoveredLed && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-900/95 border border-slate-700/90 rounded-xl p-2.5 shadow-2xl backdrop-blur-md text-xs font-mono text-slate-200"
            style={{
              left: `${hoveredLed.screenX + 16}px`,
              top: `${hoveredLed.screenY - 24}px`,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm"
                style={{ backgroundColor: rgbToHex(hoveredLed.color.r, hoveredLed.color.g, hoveredLed.color.b) }}
              />
              <span className="font-semibold text-white">LED #{hoveredLed.point.index}</span>
            </div>
            {hoveredLed.point.spokeIndex >= 0 && (
              <div className="text-slate-400 text-[11px]">
                Segment: <span className="text-amber-400">{hoveredLed.point.spokeIndex + 1}</span> · LED:{' '}
                <span className="text-amber-400">{hoveredLed.point.posInSpoke + 1}</span>
              </div>
            )}
            {hoveredLed.point.ringIndex >= 0 && (
              <div className="text-slate-400 text-[11px]">
                Ring: <span className="text-sky-400">{hoveredLed.point.ringIndex}</span>
              </div>
            )}
            <div className="text-slate-400 text-[11px] mt-1 pt-1 border-t border-slate-800">
              {rgbToHex(hoveredLed.color.r, hoveredLed.color.g, hoveredLed.color.b).toUpperCase()} (
              {hoveredLed.color.r}, {hoveredLed.color.g}, {hoveredLed.color.b})
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Deck */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-md">
          <button
            onClick={onTogglePlay}
            className="p-1.5 bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={onStepFrame}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Step One Frame Forward"
          >
            <div className="flex items-center text-[10px] font-bold">▶|</div>
          </button>

          <button
            onClick={onResetTime}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-slate-800 mx-1" />
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
