import React from 'react';
import { PatternId, PatternSettings } from '../types/chakra';
import { PATTERN_CATALOG } from '../constants/presets';
import { BUDDHIST_FLAG_PALETTES } from '../constants/palettes';
import { Gauge, Sun, Sparkles, RefreshCw, Palette, Compass, Activity } from 'lucide-react';

interface PatternControlsProps {
  currentPatternId: PatternId;
  onSelectPattern: (id: PatternId) => void;
  settings: PatternSettings;
  onUpdateSettings: (newSettings: Partial<PatternSettings>) => void;
  currentPaletteId: string;
  onSelectPalette: (paletteId: string) => void;
  customColors: string[];
  onUpdateCustomColors: (colors: string[]) => void;
}

export const PatternControls: React.FC<PatternControlsProps> = ({
  currentPatternId,
  onSelectPattern,
  settings,
  onUpdateSettings,
  currentPaletteId,
  onSelectPalette,
  customColors,
  onUpdateCustomColors,
}) => {
  const [activeCategory, setActiveCategory] = React.useState<'all' | 'radial' | 'rotation' | 'wave' | 'sacred'>('all');

  const filteredPatterns = PATTERN_CATALOG.filter(
    (p) => activeCategory === 'all' || p.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Pattern Category Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        {(['all', 'radial', 'rotation', 'wave', 'sacred'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat === 'all' ? 'All 13 Patterns' : cat}
          </button>
        ))}
      </div>

      {/* Pattern Selection Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
        {filteredPatterns.map((pat) => {
          const isSelected = currentPatternId === pat.id;
          return (
            <button
              key={pat.id}
              onClick={() => onSelectPattern(pat.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-amber-400/20 rounded-bl-xl flex items-center justify-center text-amber-300 text-xs font-bold">
                  ✓
                </div>
              )}
              <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{pat.name}</span>
              </div>
              <div className="text-[10px] text-amber-400/90 font-mono mt-0.5 capitalize">
                Category: {pat.category}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {pat.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Dynamic Animation Tuning Sliders */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          Motion & Modulation Tuning
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Speed Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                Rotation / Burst Speed
              </span>
              <span className="font-mono text-amber-400 tabular-nums">
                {settings.speed.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={settings.speed}
              onChange={(e) => onUpdateSettings({ speed: Number(e.target.value) })}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Brightness Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Master Brightness
              </span>
              <span className="font-mono text-amber-400 tabular-nums">
                {Math.round(settings.brightness * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={settings.brightness}
              onChange={(e) => onUpdateSettings({ brightness: Number(e.target.value) })}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Trail Decay Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                Trail Persistence / Decay
              </span>
              <span className="font-mono text-sky-400 tabular-nums">
                {Math.round(settings.decay * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={settings.decay}
              onChange={(e) => onUpdateSettings({ decay: Number(e.target.value) })}
              className="w-full accent-sky-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Color Wave Frequency */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                Color Wave Frequency
              </span>
              <span className="font-mono text-emerald-400 tabular-nums">
                {settings.colorScale.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={settings.colorScale}
              onChange={(e) => onUpdateSettings({ colorScale: Number(e.target.value) })}
              className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Direction Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-300">Rotation & Flow Direction</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateSettings({ direction: 1 })}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                settings.direction === 1
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Clockwise ↻ / Outward
            </button>
            <button
              onClick={() => onUpdateSettings({ direction: -1 })}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                settings.direction === -1
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Counter-Clockwise ↺ / Inward
            </button>
          </div>
        </div>
      </div>

      {/* Sacred Buddhist Color Palette Selector */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            Sacred Color Palettes
          </h3>
          <span className="text-[11px] text-amber-400 font-medium">
            Buddhist Flag Colors (Shadvarna)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {BUDDHIST_FLAG_PALETTES.map((pal) => {
            const isSelected = currentPaletteId === pal.id;
            return (
              <button
                key={pal.id}
                onClick={() => onSelectPalette(pal.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400'
                    : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-100">{pal.name}</span>
                  {pal.isBuddhistFlag && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                      FLAG
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 my-2">
                  {pal.colors.map((c, i) => (
                    <span
                      key={i}
                      className="flex-1 h-3.5 rounded-sm border border-white/20 shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
                <div className="text-[10px] text-slate-400">{pal.description}</div>
              </button>
            );
          })}
        </div>

        {/* Custom Color Editor */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Custom Palette Color Stops:</span>
            <button
              onClick={() => onUpdateCustomColors([...customColors, '#FFD700'])}
              className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              + Add Color Stop
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {customColors.map((color, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const updated = [...customColors];
                    updated[idx] = e.target.value;
                    onUpdateCustomColors(updated);
                  }}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[11px] font-mono text-slate-300">{color.toUpperCase()}</span>
                {customColors.length > 2 && (
                  <button
                    onClick={() => {
                      const updated = customColors.filter((_, i) => i !== idx);
                      onUpdateCustomColors(updated);
                    }}
                    className="text-slate-500 hover:text-rose-400 ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
