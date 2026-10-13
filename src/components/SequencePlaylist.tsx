import React from 'react';
import { PlaylistStep, PatternId } from '../types/chakra';
import { PATTERN_CATALOG } from '../constants/presets';
import { BUDDHIST_FLAG_PALETTES } from '../constants/palettes';
import { ListOrdered, Clock, Play, Pause, Plus, Trash2 } from 'lucide-react';

interface SequencePlaylistProps {
  playlist: PlaylistStep[];
  onUpdatePlaylist: (newPlaylist: PlaylistStep[]) => void;
  activeStepIndex: number;
  stepRemainingSeconds: number;
  isPlaylistRunning: boolean;
  onTogglePlaylistRunning: () => void;
  onJumpToStep: (index: number) => void;
}

export const SequencePlaylist: React.FC<SequencePlaylistProps> = ({
  playlist,
  onUpdatePlaylist,
  activeStepIndex,
  stepRemainingSeconds,
  isPlaylistRunning,
  onTogglePlaylistRunning,
  onJumpToStep,
}) => {
  const currentStep = playlist[activeStepIndex] || playlist[0];
  const progressPercent = currentStep
    ? Math.max(0, Math.min(100, ((currentStep.durationSeconds - stepRemainingSeconds) / currentStep.durationSeconds) * 100))
    : 0;

  const handleAddStep = () => {
    const newStep: PlaylistStep = {
      id: `step_${Date.now()}`,
      patternId: 'karakenna_chakra',
      durationSeconds: 10,
      paletteId: 'shadvarna_classic',
      speed: 1.0,
      title: 'Spinning Wheel of Dharma',
    };
    onUpdatePlaylist([...playlist, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    if (playlist.length <= 1) return;
    const updated = playlist.filter((_, i) => i !== index);
    onUpdatePlaylist(updated);
  };

  const handleUpdateStep = (index: number, updates: Partial<PlaylistStep>) => {
    const updated = [...playlist];
    updated[index] = { ...updated[index], ...updates };
    onUpdatePlaylist(updated);
  };

  return (
    <div className="space-y-5">
      {/* Playlist Master Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Chakra Light Show Playlist
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cycles through selected patterns automatically, ideal for continuous temple and shrine room displays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlaylistRunning}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              isPlaylistRunning
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isPlaylistRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaylistRunning ? 'Sequence Running' : 'Start Auto Sequence'}</span>
          </button>

          <button
            onClick={handleAddStep}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Step</span>
          </button>
        </div>
      </div>

      {/* Active Step Progress Indicator */}
      {isPlaylistRunning && currentStep && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-amber-300">
              Step {activeStepIndex + 1} of {playlist.length}: {currentStep.title}
            </span>
            <span className="font-mono text-amber-400 tabular-nums">
              {Math.ceil(stepRemainingSeconds)}s remaining
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Playlist Steps List */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {playlist.map((step, idx) => {
          const isActive = activeStepIndex === idx;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isActive && isPlaylistRunning
                  ? 'bg-slate-900 border-amber-400/80 shadow-md'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onJumpToStep(idx)}
                    className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Jump to this step"
                  >
                    {idx + 1}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <select
                        value={step.patternId}
                        onChange={(e) => {
                          const newPatId = e.target.value as PatternId;
                          const found = PATTERN_CATALOG.find((p) => p.id === newPatId);
                          handleUpdateStep(idx, {
                            patternId: newPatId,
                            title: found ? found.name : newPatId,
                          });
                        }}
                        className="bg-slate-800 border border-slate-700 text-slate-100 text-xs font-semibold rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-amber-400 outline-none cursor-pointer"
                      >
                        {PATTERN_CATALOG.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={step.paletteId}
                        onChange={(e) => handleUpdateStep(idx, { paletteId: e.target.value })}
                        className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-amber-400 outline-none cursor-pointer"
                      >
                        {BUDDHIST_FLAG_PALETTES.map((pal) => (
                          <option key={pal.id} value={pal.id}>
                            {pal.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Duration Slider / Input */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="number"
                      min="3"
                      max="120"
                      value={step.durationSeconds}
                      onChange={(e) =>
                        handleUpdateStep(idx, {
                          durationSeconds: Math.max(2, Number(e.target.value)),
                        })
                      }
                      className="w-12 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center text-xs font-mono text-amber-400"
                    />
                    <span>sec</span>
                  </div>

                  {/* Speed control */}
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span>Speed:</span>
                    <select
                      value={step.speed}
                      onChange={(e) => handleUpdateStep(idx, { speed: Number(e.target.value) })}
                      className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                    >
                      <option value="0.7">0.7x</option>
                      <option value="1.0">1.0x</option>
                      <option value="1.3">1.3x</option>
                      <option value="1.8">1.8x</option>
                    </select>
                  </div>

                  {/* Delete Step */}
                  {playlist.length > 1 && (
                    <button
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Remove Step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
