export type TopologyType = 'spokes' | 'concentric' | 'hybrid';

export type WiringDirection = 'outward' | 'inward' | 'zigzag' | 'ring_by_ring';

export interface SpokeConfig {
  spokeCount: number;         // Number of segments / radial strips
  ledsPerSpoke: number;       // Number of LEDs per segment
  innerRadius: number;        // Inner statue hole radius (0.10 to 0.60)
  outerRadius: number;        // Outer perimeter radius (0.60 to 0.98)
  bottomGapDeg: number;       // Bottom space/gap in degrees (0° full 360° circle, or 40°-120° for statue head/neck cutout)
  discDiameterInches: number; // Physical disc size (e.g. 15 inches, 12 inches, 18 inches)
  stripDensity: number;       // LED strip density (60 LED/m, 144 LED/m, 30 LED/m)
  wiring: WiringDirection;
}

export interface ConcentricRing {
  id: string;
  radius: number;
  ledCount: number;
}

export interface ConcentricConfig {
  rings: ConcentricRing[];
  bottomGapDeg: number;
  discDiameterInches: number;
}

export interface HybridConfig {
  centerLedCount: number;
  centerRadius: number;
  spokeCount: number;
  ledsPerSpoke: number;
  spokeInnerRadius: number;
  spokeOuterRadius: number;
  outerRingLedCount: number;
  outerRingRadius: number;
  bottomGapDeg: number;
  discDiameterInches: number;
}

export interface ChakraTopology {
  type: TopologyType;
  spokes: SpokeConfig;
  concentric: ConcentricConfig;
  hybrid: HybridConfig;
}

export interface LedPoint {
  index: number;              // 0 to totalLeds - 1
  x: number;                  // normalized -1 to 1 or canvas pixel
  y: number;
  radius: number;             // distance from center (0 to 1)
  angle: number;              // angle in radians (0 to 2*PI)
  spokeIndex: number;         // -1 if not a spoke
  posInSpoke: number;         // 0 (inner) to ledsPerSpoke-1 (outer)
  ringIndex: number;          // -1 if not a ring
  posInRing: number;          // index within that ring
  zone: 'center' | 'spoke' | 'outer_ring';
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface ColorPalette {
  id: string;
  name: string;
  sinhalaName: string;
  description: string;
  colors: string[];           // Hex color codes
  isBuddhistFlag?: boolean;
}

export type PatternId =
  | 'vihidena_ras'            // Outward Radiant Ray Burst
  | 'sankocha_ras'            // Inward Energy Suction / Collapse
  | 'karakenna_chakra'        // Spinning Dharma Wheel
  | 'shadvarna_bhranama'      // 6 Buddhist Flag Segments Rotating
  | 'kundalani_spiral'        // Galaxy Spiral Vortex
  | 'warna_galana'            // Smooth Angular Color Wipe Wave
  | 'ulkapaatha_meteor'       // Shooting Meteors / Comets along rays
  | 'tharu_eli_sparkle'       // Sacred Twinkling Starlight
  | 'pibidena_neluma'         // Lotus Blossom Blooming Ripples
  | 'ubaya_bhranama'          // Dual Counter-Rotating Wheels
  | 'prana_spandana'          // Meditative Aura Breath / Heartbeat
  | 'strobe_vesak_flash'      // Festive Radiant Pulse & Fade
  | 'rainbow_cyclone'         // Classic Full Prismatic FastLED Rainbow
  | 'custom_designer';        // Custom User Keyframed Pattern

export interface PatternSettings {
  speed: number;              // 0.1 to 3.0
  brightness: number;         // 0.05 to 1.0
  decay: number;              // Trail persistence 0.1 to 0.95
  colorScale: number;         // Frequency of color transitions
  direction: 1 | -1;          // 1 clockwise/outward, -1 counter
  glowIntensity: number;      // 0 to 1
  diffuserView: boolean;      // Simulates frosted white acrylic casing
  showWiringOrder: boolean;   // Overlay numbers & data wire path
  showCenterMedallion: boolean; // Show sacred Buddha / Dharmachakra center
}

export interface PlaylistStep {
  id: string;
  patternId: PatternId;
  durationSeconds: number;
  paletteId: string;
  speed: number;
  title: string;
}

export interface HardwareExportConfig {
  chipType: 'esp01' | 'esp8266' | 'esp32' | 'arduino_nano' | 'arduino_uno';
  dataPin: number;
  ledType: 'WS2812B' | 'WS2811' | 'SK6812';
  colorOrder: 'GRB' | 'RGB';
  maxMilliamps: number;
  hasButtonControl: boolean;
  buttonPin: number;
  hasBrightnessPot: boolean;
  potPin: number;
}
