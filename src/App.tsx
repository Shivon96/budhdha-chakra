/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChakraTopology, PatternId, PatternSettings, PlaylistStep } from './types/chakra';
import { TOPOLOGY_PRESETS, DEFAULT_PLAYLIST, PATTERN_CATALOG } from './constants/presets';
import { BUDDHIST_FLAG_PALETTES } from './constants/palettes';
import { generateLedPoints, calculatePowerMetrics } from './utils/geometry';
import { renderPatternFrame } from './utils/animations';
import { Header } from './components/Header';
import { ChakraVisualizer } from './components/ChakraVisualizer';
import { TopologyControls } from './components/TopologyControls';
import { PatternControls } from './components/PatternControls';
import { SequencePlaylist } from './components/SequencePlaylist';
import { HardwareExporter } from './components/HardwareExporter';
import { Sliders, Sparkles, ListOrdered, Download, Disc, Scissors, Cpu } from 'lucide-react';

export default function App() {
  // Topology state defaults to the 15-inch board with statue cutout matching user photo!
  const [topology, setTopology] = useState<ChakraTopology>(() => {
    return JSON.parse(JSON.stringify(TOPOLOGY_PRESETS[0].topology));
  });

  // Current active light pattern
  const [currentPatternId, setCurrentPatternId] = useState<PatternId>('vihidena_ras');

  // Motion & visual settings
  const [settings, setSettings] = useState<PatternSettings>({
    speed: 1.2,
    brightness: 0.9,
    decay: 0.5,
    colorScale: 1.0,
    direction: 1,
    glowIntensity: 0.8,
    diffuserView: false,
    showWiringOrder: false,
    showCenterMedallion: true,
  });

  // Active color palette
  const [currentPaletteId, setCurrentPaletteId] = useState<string>('shadvarna_classic');
  const [customColors, setCustomColors] = useState<string[]>([
    '#0038A8', // Blue
    '#FFD700', // Yellow
    '#D11212', // Red
    '#FFFFFF', // White
    '#FF6A00', // Orange
  ]);

  // Playlist state
  const [playlist, setPlaylist] = useState<PlaylistStep[]>(DEFAULT_PLAYLIST);
  const [isPlaylistRunning, setIsPlaylistRunning] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [stepRemainingSeconds, setStepRemainingSeconds] = useState<number>(
    DEFAULT_PLAYLIST[0].durationSeconds
  );

  // Playback & animation state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [fps, setFps] = useState<number>(60);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'simulator' | 'topology' | 'patterns' | 'playlist' | 'export'>('simulator');

  // Compute LED points from topology
  const ledPoints = useMemo(() => {
    return generateLedPoints(topology);
  }, [topology]);

  const powerMetrics = useMemo(() => {
    return calculatePowerMetrics(ledPoints.length);
  }, [ledPoints.length]);

  // Determine current active colors
  const activePaletteColors = useMemo(() => {
    if (currentPaletteId === 'custom') return customColors;
    const found = BUDDHIST_FLAG_PALETTES.find((p) => p.id === currentPaletteId);
    return found ? found.colors : customColors;
  }, [currentPaletteId, customColors]);

  // Current frame RGB buffer
  const [currentFrameColors, setCurrentFrameColors] = useState(() => {
    return renderPatternFrame(ledPoints, currentPatternId, 0, activePaletteColors, settings);
  });

  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const fpsFramesRef = useRef<number>(0);
  const fpsLastCalcRef = useRef<number>(performance.now());

  const handleUpdateSettings = useCallback((newSettings: Partial<PatternSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Main 60 FPS Animation Loop
  useEffect(() => {
    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      fpsFramesRef.current++;
      if (now - fpsLastCalcRef.current >= 500) {
        setFps(Math.round((fpsFramesRef.current * 1000) / (now - fpsLastCalcRef.current)));
        fpsFramesRef.current = 0;
        fpsLastCalcRef.current = now;
      }

      if (isPlaying) {
        setElapsedTime((prevTime) => {
          const newTime = prevTime + dt;

          if (isPlaylistRunning && playlist.length > 0) {
            setStepRemainingSeconds((prevSec) => {
              const updatedSec = prevSec - dt;
              if (updatedSec <= 0) {
                setActiveStepIndex((currIdx) => {
                  const nextIdx = (currIdx + 1) % playlist.length;
                  const nextStep = playlist[nextIdx];
                  if (nextStep) {
                    setCurrentPatternId(nextStep.patternId);
                    setCurrentPaletteId(nextStep.paletteId);
                    setSettings((s) => ({ ...s, speed: nextStep.speed }));
                    return nextIdx;
                  }
                  return 0;
                });
                const nextStep = playlist[(activeStepIndex + 1) % playlist.length];
                return nextStep ? nextStep.durationSeconds : 10;
              }
              return updatedSec;
            });
          }

          const frameColors = renderPatternFrame(
            ledPoints,
            currentPatternId,
            newTime,
            activePaletteColors,
            settings
          );
          setCurrentFrameColors(frameColors);

          return newTime;
        });
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, isPlaylistRunning, playlist, ledPoints, currentPatternId, activePaletteColors, settings, activeStepIndex]);

  const handleJumpToStep = (index: number) => {
    if (index >= 0 && index < playlist.length) {
      setActiveStepIndex(index);
      const step = playlist[index];
      setCurrentPatternId(step.patternId);
      setCurrentPaletteId(step.paletteId);
      setSettings((s) => ({ ...s, speed: step.speed }));
      setStepRemainingSeconds(step.durationSeconds);
    }
  };

  const activePatternMeta = useMemo(() => {
    return PATTERN_CATALOG.find((p) => p.id === currentPatternId) || PATTERN_CATALOG[0];
  }, [currentPatternId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setActiveTab('export')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Top Summary & Quick Sizing Control Ribbon */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 space-y-3 text-xs">
          {/* Row 1: Active Specs & Power Metrics */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                ☸ <span>{topology.spokes.discDiameterInches || 15}" Disc (Ø {((topology.spokes.discDiameterInches || 15) * 2.54).toFixed(1)} cm)</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">
                Segments: <strong className="text-amber-400 font-mono">{topology.spokes.spokeCount}</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">
                LEDs/Strip: <strong className="text-amber-400 font-mono">{topology.spokes.ledsPerSpoke}</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-200">
                Total: <strong className="text-white font-mono">{powerMetrics.totalLeds} LEDs</strong>
              </span>
              {(topology.spokes.bottomGapDeg || 0) > 0 && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-300/90 font-medium">
                    {topology.spokes.bottomGapDeg}° Statue Opening
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <span>
                Est. Current: <strong className="text-emerald-400 font-mono">~{powerMetrics.avgAmps}A</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span>
                PSU: <strong className="text-sky-400 font-mono">5V {powerMetrics.recommendedSupplyAmps}A</strong>
              </span>
            </div>
          </div>

          {/* Row 2: Quick Board Size (6, 8, 12, 15, 18, 24, 30, 36 inches) & Independent Adjusters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Board Size Quick Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-medium whitespace-nowrap mr-1">Board Diameter:</span>
              {[6, 8, 12, 15, 18, 24, 30, 36].map((size) => {
                const isSelected = (topology.spokes.discDiameterInches || 15) === size;
                return (
                  <button
                    key={size}
                    onClick={() => {
                      setTopology((prev) => ({
                        ...prev,
                        type: 'spokes',
                        spokes: {
                          ...prev.spokes,
                          discDiameterInches: size,
                        },
                      }));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {size}"
                  </button>
                );
              })}
            </div>

            {/* Independent Segments & LED Incrementers */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Segments control */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">Segments:</span>
                <button
                  onClick={() => {
                    setTopology((prev) => ({
                      ...prev,
                      type: 'spokes',
                      spokes: {
                        ...prev.spokes,
                        spokeCount: Math.max(4, prev.spokes.spokeCount - 1),
                      },
                    }));
                  }}
                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center cursor-pointer text-xs"
                  title="Decrease Segments"
                >
                  -
                </button>
                <span className="font-mono text-amber-400 font-bold px-1 tabular-nums">
                  {topology.spokes.spokeCount}
                </span>
                <button
                  onClick={() => {
                    setTopology((prev) => ({
                      ...prev,
                      type: 'spokes',
                      spokes: {
                        ...prev.spokes,
                        spokeCount: Math.min(64, prev.spokes.spokeCount + 1),
                      },
                    }));
                  }}
                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center cursor-pointer text-xs"
                  title="Increase Segments"
                >
                  +
                </button>
              </div>

              {/* LEDs per Strip control */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">LEDs/Strip:</span>
                <button
                  onClick={() => {
                    setTopology((prev) => ({
                      ...prev,
                      type: 'spokes',
                      spokes: {
                        ...prev.spokes,
                        ledsPerSpoke: Math.max(2, prev.spokes.ledsPerSpoke - 1),
                      },
                    }));
                  }}
                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center cursor-pointer text-xs"
                  title="Decrease LEDs per strip"
                >
                  -
                </button>
                <span className="font-mono text-amber-400 font-bold px-1 tabular-nums">
                  {topology.spokes.ledsPerSpoke}
                </span>
                <button
                  onClick={() => {
                    setTopology((prev) => ({
                      ...prev,
                      type: 'spokes',
                      spokes: {
                        ...prev.spokes,
                        ledsPerSpoke: Math.min(60, prev.spokes.ledsPerSpoke + 1),
                      },
                    }));
                  }}
                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center cursor-pointer text-xs"
                  title="Increase LEDs per strip"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Center Interactive Stage (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <ChakraVisualizer
              ledPoints={ledPoints}
              colors={currentFrameColors}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onStepFrame={() => setElapsedTime((t) => t + 0.05)}
              onResetTime={() => setElapsedTime(0)}
              fps={fps}
              patternTitle={activePatternMeta.name}
              discDiameterInches={topology.spokes.discDiameterInches || 15}
              bottomGapDeg={topology.spokes.bottomGapDeg || 0}
            />

            {/* Quick Palette Bar below Visualizer */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-semibold text-amber-400">Palette:</span>
                <span>{BUDDHIST_FLAG_PALETTES.find((p) => p.id === currentPaletteId)?.name || 'Custom'}</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {BUDDHIST_FLAG_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    onClick={() => setCurrentPaletteId(pal.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      currentPaletteId === pal.id
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                    title={pal.description}
                  >
                    <div className="flex -space-x-1">
                      {pal.colors.slice(0, 4).map((c, i) => (
                        <div
                          key={i}
                          className="w-2.5 h-2.5 rounded-full border border-slate-950"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium whitespace-nowrap ml-1">
                      {pal.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Control & Parameter Deck (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 md:p-5 flex flex-col gap-4">
            <div className="p-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setActiveTab('topology')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'topology'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>15" Disc Setup</span>
              </button>

              <button
                onClick={() => setActiveTab('patterns')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'patterns' || activeTab === 'simulator'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Patterns</span>
              </button>

              <button
                onClick={() => setActiveTab('playlist')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'playlist'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Sequence</span>
              </button>

              <button
                onClick={() => setActiveTab('export')}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'export'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>ESP-01 / Code</span>
              </button>
            </div>

            <div className="pt-1">
              {(activeTab === 'patterns' || activeTab === 'simulator') && (
                <PatternControls
                  currentPatternId={currentPatternId}
                  onSelectPattern={setCurrentPatternId}
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  currentPaletteId={currentPaletteId}
                  onSelectPalette={setCurrentPaletteId}
                  customColors={customColors}
                  onUpdateCustomColors={setCustomColors}
                />
              )}

              {activeTab === 'topology' && (
                <TopologyControls
                  topology={topology}
                  onUpdateTopology={setTopology}
                  totalLeds={powerMetrics.totalLeds}
                />
              )}

              {activeTab === 'playlist' && (
                <SequencePlaylist
                  playlist={playlist}
                  onUpdatePlaylist={setPlaylist}
                  activeStepIndex={activeStepIndex}
                  stepRemainingSeconds={stepRemainingSeconds}
                  isPlaylistRunning={isPlaylistRunning}
                  onTogglePlaylistRunning={() => setIsPlaylistRunning(!isPlaylistRunning)}
                  onJumpToStep={handleJumpToStep}
                />
              )}

              {activeTab === 'export' && (
                <HardwareExporter
                  topology={topology}
                  totalLeds={powerMetrics.totalLeds}
                  currentFrameColors={currentFrameColors}
                />
              )}
            </div>
          </div>
        </div>

        {/* Technical Guidance Section */}
        <div className="border-t border-slate-800/80 pt-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/60 space-y-1.5">
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <span className="text-amber-400 font-bold">☸ 01.</span>
                <span>15-Inch Halo Board with Statue Gap</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Matches real circular acrylic/MDF boards with 20 radial segments and an open bottom notch (around 70°) designed to fit neatly behind the Buddha statue head and neck.
              </p>
            </div>

            <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/60 space-y-1.5">
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <span className="text-amber-400 font-bold">⚡ 02.</span>
                <span>ESP-01 / ESP8266 Microcontroller</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Connect FastLED data output to GPIO 2 (Pin 3). Power the ESP-01 with a clean 3.3V DC regulator, and connect GND commonly to your 5V LED power supply rail.
              </p>
            </div>

            <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/60 space-y-1.5">
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <span className="text-amber-400 font-bold">💻 03.</span>
                <span>The Six Sacred Colors (Shadvarna)</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Blue (Loving-kindness), Yellow (Middle Path & Wisdom), Red (Virtue & Blessings), White (Purity of Dhamma), and Orange (The Essence of Buddha's Teaching).
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
