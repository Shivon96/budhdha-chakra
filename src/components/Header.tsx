import React from 'react';
import { Download, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenExport: () => void;
  activeTab: 'simulator' | 'topology' | 'patterns' | 'playlist' | 'export';
  setActiveTab: (tab: 'simulator' | 'topology' | 'patterns' | 'playlist' | 'export') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
          ☸
        </div>
        <div>
          <span className="text-base font-semibold tracking-tight text-white block">
            Buddha Chakra WS2812
          </span>
          <span className="text-[10px] text-amber-400 font-medium tracking-wider uppercase block -mt-0.5">
            Pixel LED Halo Controller
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'simulator' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Simulator
        </button>
        <button
          onClick={() => setActiveTab('topology')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'topology' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Strips & 15-inch Disc
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'patterns' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Sacred Patterns
        </button>
        <button
          onClick={() => setActiveTab('playlist')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'playlist' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Auto Sequence
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'export' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          ESP-01 & FastLED
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-md shadow-amber-500/15 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Generate ESP-01 / FastLED Code</span>
        </button>
      </div>
    </header>
  );
};
