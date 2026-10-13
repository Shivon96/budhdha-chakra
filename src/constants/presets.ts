import { ChakraTopology, PatternId, PlaylistStep } from '../types/chakra';

export interface TopologyPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  topology: ChakraTopology;
}

export const TOPOLOGY_PRESETS: TopologyPreset[] = [
  {
    id: 'disc_15inch_cutout',
    name: '15-inch Real Halo Board (20 Segments × 11 LEDs)',
    category: '15-inch Disc with Bottom Statue Cutout',
    description: '15-inch circular board layout with 70° bottom statue opening, 20 radial segments with 11 LEDs per strip (220 LEDs total).',
    topology: {
      type: 'spokes',
      spokes: {
        spokeCount: 20,
        ledsPerSpoke: 11,
        innerRadius: 0.28,
        outerRadius: 0.94,
        bottomGapDeg: 70,
        discDiameterInches: 15,
        stripDensity: 60,
        wiring: 'zigzag',
      },
      concentric: {
        rings: [
          { id: 'r1', radius: 0.25, ledCount: 16 },
          { id: 'r2', radius: 0.45, ledCount: 32 },
          { id: 'r3', radius: 0.65, ledCount: 48 },
          { id: 'r4', radius: 0.85, ledCount: 64 },
        ],
        bottomGapDeg: 70,
        discDiameterInches: 15,
      },
      hybrid: {
        centerLedCount: 12,
        centerRadius: 0.22,
        spokeCount: 20,
        ledsPerSpoke: 11,
        spokeInnerRadius: 0.30,
        spokeOuterRadius: 0.86,
        outerRingLedCount: 56,
        outerRingRadius: 0.94,
        bottomGapDeg: 70,
        discDiameterInches: 15,
      },
    },
  },
  {
    id: 'spokes_16x7',
    name: 'Standard Temple (16 Segments × 7 LEDs)',
    category: 'Full Circle 360°',
    description: '16 radial spokes with 7 LEDs per strip (112 total LEDs). Popular classic size.',
    topology: {
      type: 'spokes',
      spokes: {
        spokeCount: 16,
        ledsPerSpoke: 7,
        innerRadius: 0.22,
        outerRadius: 0.92,
        bottomGapDeg: 0,
        discDiameterInches: 12,
        stripDensity: 60,
        wiring: 'outward',
      },
      concentric: {
        rings: [
          { id: 'r1', radius: 0.2, ledCount: 12 },
          { id: 'r2', radius: 0.4, ledCount: 24 },
          { id: 'r3', radius: 0.6, ledCount: 36 },
          { id: 'r4', radius: 0.8, ledCount: 48 },
        ],
        bottomGapDeg: 0,
        discDiameterInches: 12,
      },
      hybrid: {
        centerLedCount: 12,
        centerRadius: 0.2,
        spokeCount: 16,
        ledsPerSpoke: 7,
        spokeInnerRadius: 0.26,
        spokeOuterRadius: 0.82,
        outerRingLedCount: 48,
        outerRingRadius: 0.92,
        bottomGapDeg: 0,
        discDiameterInches: 12,
      },
    },
  },
  {
    id: 'spokes_24x9',
    name: 'Grand Vihara (24 Segments × 9 LEDs)',
    category: 'Full Circle 360°',
    description: '24 radial spokes with 9 LEDs per strip (216 total LEDs). High-density grand halo display.',
    topology: {
      type: 'spokes',
      spokes: {
        spokeCount: 24,
        ledsPerSpoke: 9,
        innerRadius: 0.20,
        outerRadius: 0.95,
        bottomGapDeg: 0,
        discDiameterInches: 18,
        stripDensity: 60,
        wiring: 'zigzag',
      },
      concentric: {
        rings: [
          { id: 'r1', radius: 0.18, ledCount: 16 },
          { id: 'r2', radius: 0.36, ledCount: 32 },
          { id: 'r3', radius: 0.54, ledCount: 48 },
          { id: 'r4', radius: 0.72, ledCount: 64 },
          { id: 'r5', radius: 0.90, ledCount: 80 },
        ],
        bottomGapDeg: 0,
        discDiameterInches: 18,
      },
      hybrid: {
        centerLedCount: 16,
        centerRadius: 0.18,
        spokeCount: 24,
        ledsPerSpoke: 9,
        spokeInnerRadius: 0.24,
        spokeOuterRadius: 0.84,
        outerRingLedCount: 64,
        outerRingRadius: 0.94,
        bottomGapDeg: 0,
        discDiameterInches: 18,
      },
    },
  },
  {
    id: 'spokes_12x5',
    name: 'Compact Shrine (12 Segments × 5 LEDs)',
    category: 'Full Circle 360°',
    description: '12 radial spokes with 5 LEDs per strip (60 total LEDs). Ideal for small altar boxes.',
    topology: {
      type: 'spokes',
      spokes: {
        spokeCount: 12,
        ledsPerSpoke: 5,
        innerRadius: 0.25,
        outerRadius: 0.90,
        bottomGapDeg: 0,
        discDiameterInches: 8,
        stripDensity: 60,
        wiring: 'outward',
      },
      concentric: {
        rings: [
          { id: 'r1', radius: 0.25, ledCount: 8 },
          { id: 'r2', radius: 0.50, ledCount: 16 },
          { id: 'r3', radius: 0.75, ledCount: 24 },
        ],
        bottomGapDeg: 0,
        discDiameterInches: 8,
      },
      hybrid: {
        centerLedCount: 8,
        centerRadius: 0.22,
        spokeCount: 12,
        ledsPerSpoke: 5,
        spokeInnerRadius: 0.28,
        spokeOuterRadius: 0.80,
        outerRingLedCount: 32,
        outerRingRadius: 0.90,
        bottomGapDeg: 0,
        discDiameterInches: 8,
      },
    },
  },
  {
    id: 'spokes_18x12_statue',
    name: 'Shrine Halo with Statue Cutout (18 Segments × 12 LEDs)',
    category: '15-inch Disc with Bottom Cutout',
    description: '18 segments with 12 LEDs per strip and 80° bottom opening for Buddha statue pedestal.',
    topology: {
      type: 'spokes',
      spokes: {
        spokeCount: 18,
        ledsPerSpoke: 12,
        innerRadius: 0.30,
        outerRadius: 0.95,
        bottomGapDeg: 80,
        discDiameterInches: 15,
        stripDensity: 60,
        wiring: 'zigzag',
      },
      concentric: {
        rings: [
          { id: 'r1', radius: 0.3, ledCount: 16 },
          { id: 'r2', radius: 0.55, ledCount: 36 },
          { id: 'r3', radius: 0.8, ledCount: 54 },
        ],
        bottomGapDeg: 80,
        discDiameterInches: 15,
      },
      hybrid: {
        centerLedCount: 12,
        centerRadius: 0.22,
        spokeCount: 18,
        ledsPerSpoke: 12,
        spokeInnerRadius: 0.32,
        spokeOuterRadius: 0.88,
        outerRingLedCount: 54,
        outerRingRadius: 0.95,
        bottomGapDeg: 80,
        discDiameterInches: 15,
      },
    },
  },
];

export interface PatternMeta {
  id: PatternId;
  name: string;
  category: 'radial' | 'rotation' | 'wave' | 'sacred';
  description: string;
}

export const PATTERN_CATALOG: PatternMeta[] = [
  {
    id: 'vihidena_ras',
    name: 'Radiant Ray Burst',
    category: 'radial',
    description: 'Light beams pulse outward from center lotus to the tips of each strip segment.',
  },
  {
    id: 'sankocha_ras',
    name: 'Inward Energy Inflow',
    category: 'radial',
    description: 'Light cascades inwards from outer circumference converging into the center.',
  },
  {
    id: 'karakenna_chakra',
    name: 'Spinning Wheel of Dharma',
    category: 'rotation',
    description: 'Continuous circular rotation of strip segments with trailing light persistence.',
  },
  {
    id: 'shadvarna_bhranama',
    name: 'Six-Color Buddhist Flag Wheel',
    category: 'rotation',
    description: 'Distinct 6 Buddhist flag color sectors revolving smoothly around the halo.',
  },
  {
    id: 'kundalani_spiral',
    name: 'Spiral Galaxy Vortex',
    category: 'rotation',
    description: 'Spiraling arms with curved phase shifts creating hypnotic vortex light rays.',
  },
  {
    id: 'warna_galana',
    name: 'Flowing Color Tide Wave',
    category: 'wave',
    description: 'Silky smooth color flood sweeping through segments with fluid luminescence.',
  },
  {
    id: 'ulkapaatha_meteor',
    name: 'Shooting Comets / Meteors',
    category: 'radial',
    description: 'High-speed luminous comet heads race along the strips leaving glowing decaying tails.',
  },
  {
    id: 'pibidena_neluma',
    name: 'Blooming Lotus Ripple',
    category: 'wave',
    description: 'Harmonic concentric waves expanding outwards like lotus petals unfolding.',
  },
  {
    id: 'tharu_eli_sparkle',
    name: 'Twinkling Starlight Shimmer',
    category: 'sacred',
    description: 'Gentle divine shimmering across the chakra with random sparkling radiant flares.',
  },
  {
    id: 'ubaya_bhranama',
    name: 'Dual Counter-Rotating Wheels',
    category: 'rotation',
    description: 'Even rays rotate clockwise while odd rays counter-rotate in opposite direction.',
  },
  {
    id: 'prana_spandana',
    name: 'Meditative Breath (Prana)',
    category: 'sacred',
    description: 'Slow, deep rhythmic breathing glow radiating tranquility and peace.',
  },
  {
    id: 'strobe_vesak_flash',
    name: 'Festive Radiant Flash',
    category: 'sacred',
    description: 'Rhythmic bursts of full brilliance followed by soft lingering color afterglow.',
  },
  {
    id: 'rainbow_cyclone',
    name: 'FastLED Prismatic Cyclone',
    category: 'rotation',
    description: 'Continuous rich FastLED CHSV 256-color cycle traversing the entire array.',
  },
];

export const DEFAULT_PLAYLIST: PlaylistStep[] = [
  {
    id: 'step_1',
    patternId: 'vihidena_ras',
    durationSeconds: 12,
    paletteId: 'shadvarna_classic',
    speed: 1.2,
    title: 'Outward Radiant Rays',
  },
  {
    id: 'step_2',
    patternId: 'shadvarna_bhranama',
    durationSeconds: 10,
    paletteId: 'shadvarna_classic',
    speed: 1.0,
    title: 'Six Flag Colors Wheel',
  },
  {
    id: 'step_3',
    patternId: 'kundalani_spiral',
    durationSeconds: 14,
    paletteId: 'golden_radiance',
    speed: 1.3,
    title: 'Golden Spiral Vortex',
  },
  {
    id: 'step_4',
    patternId: 'pibidena_neluma',
    durationSeconds: 10,
    paletteId: 'sacred_lotus',
    speed: 0.9,
    title: 'Lotus Bloom Ripple',
  },
  {
    id: 'step_5',
    patternId: 'ulkapaatha_meteor',
    durationSeconds: 12,
    paletteId: 'shadvarna_classic',
    speed: 1.4,
    title: 'Shooting Meteors',
  },
  {
    id: 'step_6',
    patternId: 'tharu_eli_sparkle',
    durationSeconds: 8,
    paletteId: 'golden_radiance',
    speed: 1.1,
    title: 'Divine Starlight Sparkle',
  },
];
