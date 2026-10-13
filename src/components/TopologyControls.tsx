import React from 'react';
import { ChakraTopology, WiringDirection } from '../types/chakra';
import { TOPOLOGY_PRESETS } from '../constants/presets';
import { calculatePowerMetrics } from '../utils/geometry';
import { Zap, CircleDot, Sliders, Info, ShieldAlert, Disc, Scissors, CheckCircle, AlertCircle } from 'lucide-react';

interface TopologyControlsProps {
  topology: ChakraTopology;
  onUpdateTopology: (newTopology: ChakraTopology) => void;
  totalLeds: number;
}

const STANDARD_BOARD_SIZES = [6, 8, 12, 15, 18, 24, 30, 36];
const QUICK_SEGMENT_COUNTS = [8, 12, 16, 18, 20, 24, 28, 32, 36, 48];
const QUICK_LED_COUNTS = [3, 5, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24];

export const TopologyControls: React.FC<TopologyControlsProps> = ({
  topology,
  onUpdateTopology,
  totalLeds,
}) => {
  const power = calculatePowerMetrics(totalLeds);

  const currentDiameter = topology.spokes.discDiameterInches || 15;
  const currentSegments = topology.spokes.spokeCount;
  const currentLedsPerStrip = topology.spokes.ledsPerSpoke;
  const currentDensity = topology.spokes.stripDensity || 60; // LEDs per meter

  // Physical calculations
  const diameterCm = Number((currentDiameter * 2.54).toFixed(1));
  const radiusCm = Number((diameterCm / 2).toFixed(1));
  const innerRadiusCm = Number((radiusCm * topology.spokes.innerRadius).toFixed(1));
  const outerRadiusCm = Number((radiusCm * topology.spokes.outerRadius).toFixed(1));
  const availableRadialRoomCm = Number((outerRadiusCm - innerRadiusCm).toFixed(1));
  
  // LED strip length: pitch for 60 LED/m is ~1.67 cm, 144 LED/m is ~0.69 cm, 30 LED/m is ~3.33 cm
  const pitchCm = currentDensity === 144 ? 0.694 : (currentDensity === 30 ? 3.333 : 1.667);
  const physicalStripLengthCm = Number((currentLedsPerStrip * pitchCm).toFixed(1));
  const stripFitsWell = physicalStripLengthCm <= availableRadialRoomCm * 1.08;

  const applyPreset = (presetId: string) => {
    const found = TOPOLOGY_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onUpdateTopology(JSON.parse(JSON.stringify(found.topology)));
    }
  };

  const handleSpokeChange = (updates: Partial<typeof topology.spokes>) => {
    onUpdateTopology({
      ...topology,
      type: 'spokes',
      spokes: {
        ...topology.spokes,
        ...updates,
      },
    });
  };

  const handleWiringChange = (wiring: WiringDirection) => {
    handleSpokeChange({ wiring });
  };

  return (
    <div className="space-y-6">
      {/* Topology Mode Segmented Tabs */}
      <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-1">
        <button
          onClick={() => onUpdateTopology({ ...topology, type: 'spokes' })}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            topology.type === 'spokes'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Radial Strips / Segments
        </button>
        <button
          onClick={() => onUpdateTopology({ ...topology, type: 'concentric' })}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            topology.type === 'concentric'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Concentric Rings
        </button>
        <button
          onClick={() => onUpdateTopology({ ...topology, type: 'hybrid' })}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            topology.type === 'hybrid'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Hybrid Center + Rays + Ring
        </button>
      </div>

      {/* SECTION 1: BOARD SIZE / DIAMETER (6, 8, 12, 15, 18, 24, 30, 36 INCHES) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Disc className="w-4 h-4 text-amber-400" />
            <span>Halo Board Diameter Size</span>
          </h3>
          <span className="text-xs font-mono text-amber-400 tabular-nums">
            {currentDiameter} Inches ({diameterCm} cm)
          </span>
        </div>

        {/* Quick Size Preset Buttons (6, 8, 12, 15, 18, 24, 30, 36) */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-2">
            Select Standard Board Size:
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {STANDARD_BOARD_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => handleSpokeChange({ discDiameterInches: size })}
                className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center ${
                  currentDiameter === size
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <span>{size}"</span>
                <span className="text-[9px] opacity-75 font-normal">{(size * 2.54).toFixed(0)}cm</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Diameter Input & Slider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300">Custom Diameter (Inches)</span>
              <span className="font-mono text-amber-400">{currentDiameter} Inches</span>
            </div>
            <input
              type="range"
              min="4"
              max="48"
              step="1"
              value={currentDiameter}
              onChange={(e) => handleSpokeChange({ discDiameterInches: Number(e.target.value) })}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[11px] text-slate-400 block mb-1">Direct Inch Input:</label>
              <input
                type="number"
                min="4"
                max="60"
                value={currentDiameter}
                onChange={(e) => handleSpokeChange({ discDiameterInches: Math.max(4, Number(e.target.value)) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-amber-400"
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-slate-400 block mb-1">Strip Density:</label>
              <select
                value={currentDensity}
                onChange={(e) => handleSpokeChange({ stripDensity: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 cursor-pointer"
              >
                <option value="60">60 LEDs/m (Standard)</option>
                <option value="144">144 LEDs/m (High Density)</option>
                <option value="30">30 LEDs/m (Low Density)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Physical Fit Check Ribbon */}
        <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {stripFitsWell ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="text-slate-300">
              Strip Length: <strong className="text-white font-mono">{physicalStripLengthCm} cm</strong> ({Number((physicalStripLengthCm / 2.54).toFixed(1))}") · Radial Space: <strong className="text-white font-mono">{availableRadialRoomCm} cm</strong>
            </span>
          </div>
          <span className={`text-[11px] font-semibold ${stripFitsWell ? 'text-emerald-400' : 'text-amber-400'}`}>
            {stripFitsWell ? 'Fits Board' : 'Long Strip for Disc'}
          </span>
        </div>
      </div>

      {/* SECTION 2: INDEPENDENT SEGMENT COUNT & INDEPENDENT LED COUNT */}
      {topology.type === 'spokes' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Segment & Strip LED Count (Independent Controls)
            </h3>
            <span className="text-xs font-mono text-amber-400 tabular-nums">
              {currentSegments} Segments × {currentLedsPerStrip} LEDs = {totalLeds} LEDs
            </span>
          </div>

          {/* INDEPENDENT CONTROL 1: NUMBER OF SEGMENTS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                1. Number of Strip Segments:
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Exact Count:</span>
                <input
                  type="number"
                  min="3"
                  max="64"
                  value={currentSegments}
                  onChange={(e) => handleSpokeChange({ spokeCount: Math.max(3, Number(e.target.value)) })}
                  className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono text-amber-400 text-center"
                />
              </div>
            </div>

            {/* Quick Segment Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SEGMENT_COUNTS.map((seg) => (
                <button
                  key={seg}
                  onClick={() => handleSpokeChange({ spokeCount: seg })}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    currentSegments === seg
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {seg} Segments
                </button>
              ))}
            </div>

            <input
              type="range"
              min="4"
              max="64"
              step="1"
              value={currentSegments}
              onChange={(e) => handleSpokeChange({ spokeCount: Number(e.target.value) })}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* INDEPENDENT CONTROL 2: LEDS PER STRIP SEGMENT */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                2. Number of LEDs per Strip Segment:
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Exact Count:</span>
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={currentLedsPerStrip}
                  onChange={(e) => handleSpokeChange({ ledsPerSpoke: Math.max(2, Number(e.target.value)) })}
                  className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono text-amber-400 text-center"
                />
              </div>
            </div>

            {/* Quick LED Count Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_LED_COUNTS.map((leds) => (
                <button
                  key={leds}
                  onClick={() => handleSpokeChange({ ledsPerSpoke: leds })}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    currentLedsPerStrip === leds
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {leds} LEDs
                </button>
              ))}
            </div>

            <input
              type="range"
              min="2"
              max="48"
              step="1"
              value={currentLedsPerStrip}
              onChange={(e) => handleSpokeChange({ ledsPerSpoke: Number(e.target.value) })}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* BOTTOM STATUE OPENING GAP */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
                Bottom Statue Cutout Opening Angle
              </span>
              <span className="font-mono text-xs text-amber-400 tabular-nums">
                {topology.spokes.bottomGapDeg || 0}° Opening
              </span>
            </div>
            
            <div className="flex gap-2 mb-1">
              {[
                { deg: 0, label: '0° (Full Circle)' },
                { deg: 45, label: '45° Small' },
                { deg: 70, label: '70° (Photo Match)' },
                { deg: 90, label: '90° Wide Base' },
              ].map((gap) => (
                <button
                  key={gap.deg}
                  onClick={() => handleSpokeChange({ bottomGapDeg: gap.deg })}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                    (topology.spokes.bottomGapDeg || 0) === gap.deg
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {gap.label}
                </button>
              ))}
            </div>

            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={topology.spokes.bottomGapDeg || 0}
              onChange={(e) => handleSpokeChange({ bottomGapDeg: Number(e.target.value) })}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* INNER & OUTER RADII */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Center Statue Head Hole</span>
                <span className="font-mono text-slate-400">{Math.round(topology.spokes.innerRadius * 100)}% ({innerRadiusCm} cm)</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.01"
                value={topology.spokes.innerRadius}
                onChange={(e) => handleSpokeChange({ innerRadius: Number(e.target.value) })}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Outer Rim Margin</span>
                <span className="font-mono text-slate-400">{Math.round(topology.spokes.outerRadius * 100)}% ({outerRadiusCm} cm)</span>
              </div>
              <input
                type="range"
                min="0.65"
                max="0.98"
                step="0.01"
                value={topology.spokes.outerRadius}
                onChange={(e) => handleSpokeChange({ outerRadius: Number(e.target.value) })}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Soldering / Data Wiring Routing Selection */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="text-xs font-medium text-slate-300 block mb-2">
              Physical Data Wiring Sequence:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'zigzag', name: 'Zig-zag (Snake S-Curve)', desc: 'Connects adjacent tips' },
                { id: 'outward', name: 'Outward (Center to Tip)', desc: 'Standard radial flow' },
                { id: 'inward', name: 'Inward (Tip to Center)', desc: 'Outer bus DIN' },
                { id: 'ring_by_ring', name: 'Ring-by-Ring', desc: 'Concentric steps' },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleWiringChange(w.id as WiringDirection)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    topology.spokes.wiring === w.id
                      ? 'bg-sky-500/15 border-sky-400 text-sky-200'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold">{w.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{w.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONCENTRIC RINGS CONFIGURATION */}
      {topology.type === 'concentric' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <CircleDot className="w-4 h-4 text-amber-400" />
              Concentric Rings Configuration
            </h3>
            <button
              onClick={() => {
                const rings = [...topology.concentric.rings];
                const last = rings[rings.length - 1];
                rings.push({
                  id: `r_${Date.now()}`,
                  radius: Math.min(0.95, (last ? last.radius : 0.2) + 0.15),
                  ledCount: (last ? last.ledCount : 12) + 12,
                });
                onUpdateTopology({ ...topology, concentric: { ...topology.concentric, rings } });
              }}
              className="px-2.5 py-1 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 cursor-pointer"
            >
              + Add Ring
            </button>
          </div>

          <div className="space-y-3">
            {topology.concentric.rings.map((ring, idx) => (
              <div key={ring.id} className="flex items-center gap-3 p-2.5 bg-slate-800/40 rounded-lg border border-slate-800">
                <span className="text-xs font-mono text-amber-400 w-16">Ring {idx + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>LED Count: {ring.ledCount}</span>
                    <span>Radius: {Math.round(ring.radius * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="96"
                    step="2"
                    value={ring.ledCount}
                    onChange={(e) => {
                      const rings = [...topology.concentric.rings];
                      rings[idx] = { ...rings[idx], ledCount: Number(e.target.value) };
                      onUpdateTopology({ ...topology, concentric: { ...topology.concentric, rings } });
                    }}
                    className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                {topology.concentric.rings.length > 1 && (
                  <button
                    onClick={() => {
                      const rings = topology.concentric.rings.filter((_, i) => i !== idx);
                      onUpdateTopology({ ...topology, concentric: { ...topology.concentric, rings } });
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                    title="Remove Ring"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HYBRID CONFIGURATION */}
      {topology.type === 'hybrid' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
            Hybrid Master Chakra Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-amber-400 block mb-1">1. Center Lotus Ring</span>
              <span className="text-[11px] text-slate-400 block mb-2">{topology.hybrid.centerLedCount} LEDs in Center</span>
              <input
                type="range"
                min="6"
                max="24"
                step="2"
                value={topology.hybrid.centerLedCount}
                onChange={(e) =>
                  onUpdateTopology({
                    ...topology,
                    hybrid: { ...topology.hybrid, centerLedCount: Number(e.target.value) },
                  })
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-amber-400 block mb-1">2. Radial Ray Spokes</span>
              <span className="text-[11px] text-slate-400 block mb-2">
                {topology.hybrid.spokeCount} Spokes × {topology.hybrid.ledsPerSpoke} LEDs
              </span>
              <input
                type="range"
                min="4"
                max="24"
                step="1"
                value={topology.hybrid.ledsPerSpoke}
                onChange={(e) =>
                  onUpdateTopology({
                    ...topology,
                    hybrid: { ...topology.hybrid, ledsPerSpoke: Number(e.target.value) },
                  })
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-amber-400 block mb-1">3. Outer Border Halo</span>
              <span className="text-[11px] text-slate-400 block mb-2">{topology.hybrid.outerRingLedCount} LEDs in Outer Rim</span>
              <input
                type="range"
                min="24"
                max="96"
                step="4"
                value={topology.hybrid.outerRingLedCount}
                onChange={(e) =>
                  onUpdateTopology({
                    ...topology,
                    hybrid: { ...topology.hybrid, outerRingLedCount: Number(e.target.value) },
                  })
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ELECTRICAL POWER METRICS & SAFETY ADVISORY */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Electrical Power Calculation & Sizing (5V DC)
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Total Pixels</span>
            <span className="text-base font-bold font-mono text-white tabular-nums">{power.totalLeds} LEDs</span>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Peak Current (Full White)</span>
            <span className="text-base font-bold font-mono text-amber-400 tabular-nums">{power.peakAmps} A</span>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Typical Animation Draw</span>
            <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">~{power.avgAmps} A ({power.avgWatts} W)</span>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Recommended Power Supply</span>
            <span className="text-base font-bold font-mono text-sky-400 tabular-nums">5V {power.recommendedSupplyAmps}A</span>
          </div>
        </div>

        {power.injectionPoints > 1 && (
          <div className="flex items-start gap-2.5 mt-3 pt-3 border-t border-slate-800 text-[11px] text-amber-300/90">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Power Injection Advisory:</strong> For {power.totalLeds} LEDs, run 5V and GND bus wiring to inject power at least every <strong>{power.injectionPoints} points</strong> around the disc to prevent dimming or yellowing on outer LEDs!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
