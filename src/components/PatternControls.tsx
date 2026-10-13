import React, { useState, useEffect } from 'react';
import { PatternId, PatternSettings, SavedPatternPreset } from '../types/chakra';
import { PATTERN_CATALOG, BUILT_IN_PATTERN_PRESETS } from '../constants/presets';
import { BUDDHIST_FLAG_PALETTES } from '../constants/palettes';
import {
  Gauge,
  Sun,
  Sparkles,
  RefreshCw,
  Palette,
  Compass,
  Activity,
  Bookmark,
  BookmarkPlus,
  Trash2,
  Download,
  Upload,
  Check,
  Search,
  Sliders,
  FolderHeart,
} from 'lucide-react';

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

const STORAGE_KEY = 'buddha_chakra_user_presets';

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
  const [mainView, setMainView] = useState<'catalog' | 'library'>('catalog');
  const [activeCategory, setActiveCategory] = useState<'all' | 'radial' | 'rotation' | 'wave' | 'sacred'>('all');
  
  // Pattern Library states
  const [userPresets, setUserPresets] = useState<SavedPatternPreset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved presets:', e);
    }
    return [];
  });

  const [presetSearch, setPresetSearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'custom' | 'builtin'>('all');
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Sync user presets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userPresets));
    } catch (e) {
      console.warn('Failed to save presets:', e);
    }
  }, [userPresets]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Save current active configuration as a new preset
  const handleSaveCurrentPreset = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPresetName.trim();
    if (!trimmed) return;

    const currentPattern = PATTERN_CATALOG.find((p) => p.id === currentPatternId);
    const newPreset: SavedPatternPreset = {
      id: `preset_${Date.now()}`,
      name: trimmed,
      patternId: currentPatternId,
      paletteId: currentPaletteId,
      customColors: currentPaletteId === 'custom' ? [...customColors] : undefined,
      settings: { ...settings },
      description: `Custom configuration based on ${currentPattern ? currentPattern.name : currentPatternId}`,
      createdAt: new Date().toISOString(),
      isBuiltIn: false,
    };

    setUserPresets((prev) => [newPreset, ...prev]);
    setNewPresetName('');
    setIsSavingNew(false);
    showToast(`Saved "${trimmed}" to Pattern Library!`);
  };

  // Load / Apply a preset
  const handleApplyPreset = (preset: SavedPatternPreset) => {
    onSelectPattern(preset.patternId);
    onSelectPalette(preset.paletteId);
    onUpdateSettings(preset.settings);
    if (preset.customColors && preset.customColors.length > 0) {
      onUpdateCustomColors(preset.customColors);
    }
    showToast(`Loaded "${preset.name}"!`);
  };

  // Delete a user preset
  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserPresets((prev) => prev.filter((p) => p.id !== id));
    showToast('Preset deleted.');
  };

  // Export Presets JSON
  const handleExportJson = () => {
    const dataStr = JSON.stringify(userPresets, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buddha_chakra_presets_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported custom presets to JSON.');
  };

  // Import Presets JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setUserPresets((prev) => [...imported, ...prev]);
          showToast(`Imported ${imported.length} presets successfully!`);
        } else {
          showToast('Invalid JSON file format.');
        }
      } catch {
        showToast('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Combine built-in and user presets for the library view
  const allLibraryPresets = [...userPresets, ...BUILT_IN_PATTERN_PRESETS];

  const filteredLibraryPresets = allLibraryPresets.filter((p) => {
    const matchesFilter =
      libraryFilter === 'all' ||
      (libraryFilter === 'custom' && !p.isBuiltIn) ||
      (libraryFilter === 'builtin' && p.isBuiltIn);

    const matchesSearch =
      presetSearch.trim() === '' ||
      p.name.toLowerCase().includes(presetSearch.toLowerCase()) ||
      p.patternId.toLowerCase().includes(presetSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const filteredPatterns = PATTERN_CATALOG.filter(
    (p) => activeCategory === 'all' || p.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-2.5 bg-amber-500 text-slate-950 font-semibold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Mode Toggle: Standard Patterns vs Pattern Library */}
      <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-1">
        <button
          onClick={() => setMainView('catalog')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mainView === 'catalog'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pattern Catalog (13 Core)</span>
        </button>

        <button
          onClick={() => setMainView('library')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mainView === 'library'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderHeart className="w-3.5 h-3.5" />
          <span>
            Pattern Library & Favorites ({allLibraryPresets.length})
          </span>
        </button>
      </div>

      {/* VIEW 1: PATTERN CATALOG */}
      {mainView === 'catalog' && (
        <div className="space-y-5">
          {/* Top Bar with Category Filter & Save Button */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto">
              {(['all', 'radial', 'rotation', 'wave', 'sacred'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setNewPresetName('');
                setIsSavingNew(true);
                setMainView('library');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 rounded-lg transition-all cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Save As Preset</span>
            </button>
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
        </div>
      )}

      {/* VIEW 2: PATTERN LIBRARY (SAVED & PRESETS) */}
      {mainView === 'library' && (
        <div className="space-y-4">
          {/* Quick Save Current Setup Header / Action */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
            {!isSavingNew ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-amber-400" />
                    <span>Current Active Configuration</span>
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Pattern:{' '}
                    <span className="text-amber-400 font-medium">
                      {PATTERN_CATALOG.find((p) => p.id === currentPatternId)?.name || currentPatternId}
                    </span>{' '}
                    · Speed: <span className="text-slate-300 font-mono">{settings.speed}x</span> · Brightness:{' '}
                    <span className="text-slate-300 font-mono">{Math.round(settings.brightness * 100)}%</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsSavingNew(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save to Library</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveCurrentPreset} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Name Your Custom Preset</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSavingNew(false)}
                    className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g., Midnight Temple Beams, Vesak Starlight 15-inch..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-all cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Library Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search presets by name or pattern..."
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 border border-slate-800 rounded-xl">
              {[
                { id: 'all', label: 'All' },
                { id: 'custom', label: `My Custom (${userPresets.length})` },
                { id: 'builtin', label: 'Curated' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setLibraryFilter(f.id as any)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    libraryFilter === f.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* JSON Export & Import Tools */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={handleExportJson}
                disabled={userPresets.length === 0}
                className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                title="Export Custom Presets to JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <label
                className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Import Presets from JSON"
              >
                <Upload className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Preset Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredLibraryPresets.map((preset) => {
              const patMeta = PATTERN_CATALOG.find((p) => p.id === preset.patternId);
              const palMeta = BUDDHIST_FLAG_PALETTES.find((p) => p.id === preset.paletteId);
              const colorsToShow: string[] = preset.customColors || (palMeta ? palMeta.colors : ['#FFD700']);

              return (
                <div
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-400/60 transition-all cursor-pointer flex flex-col justify-between group space-y-2 relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                          {preset.name}
                        </span>
                        {preset.isBuiltIn ? (
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            CURATED
                          </span>
                        ) : (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                            CUSTOM
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Base: <strong className="text-slate-300">{patMeta?.name || preset.patternId}</strong>
                      </div>
                    </div>

                    {!preset.isBuiltIn && (
                      <button
                        onClick={(e) => handleDeletePreset(preset.id, e)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                        title="Delete Preset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Palette preview swatches & parameters */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-1">
                      {colorsToShow.slice(0, 5).map((c: string, i: number) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full border border-slate-950 shadow-sm"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>{preset.settings.speed}x</span>
                      <span>·</span>
                      <span>{Math.round(preset.settings.brightness * 100)}%</span>
                      <span>·</span>
                      <span>{preset.settings.direction === 1 ? 'CW' : 'CCW'}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredLibraryPresets.length === 0 && (
              <div className="col-span-2 text-center py-8 text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800/60">
                No matching presets found. Click <strong>"Save to Library"</strong> above to save your first custom configuration!
              </div>
            )}
          </div>
        </div>
      )}

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
