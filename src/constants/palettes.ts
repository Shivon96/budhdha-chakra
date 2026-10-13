import { ColorPalette, RGBColor } from '../types/chakra';

// Authentic Buddhist Flag Colors (The Six Sacred Rays of the Buddha's Halo / Shadvarna Budu Ras)
// 1. Neela (Blue): Loving-kindness, peace, universal compassion
// 2. Peetha (Yellow): The Middle Path, wisdom, freedom from extremes
// 3. Lohitha (Red): Blessings of practice, virtue, devotion
// 4. Odata (White): Purity of Dhamma, liberation, clarity
// 5. Manjesta (Orange): The essence of Buddhist teaching, profound wisdom
// 6. Prabhasvara (Radiant aura): Prismatic mixture of all five rays combined

export const BUDDHIST_FLAG_PALETTES: ColorPalette[] = [
  {
    id: 'shadvarna_classic',
    name: 'Six Sacred Aura Rays (Shadvarna)',
    sinhalaName: 'Six Sacred Aura Rays',
    description: 'Blue (Neela), Yellow (Peetha), Red (Lohitha), White (Odata), and Orange (Manjesta)',
    colors: [
      '#0038A8', // Blue
      '#FFD700', // Yellow
      '#D11212', // Red
      '#FFFFFF', // White
      '#FF6A00', // Orange
    ],
    isBuddhistFlag: true,
  },
  {
    id: 'golden_radiance',
    name: 'Golden Radiance (Amber Aura)',
    sinhalaName: 'Golden Radiance',
    description: 'Divine golden embers, warm amber radiance, and soft pearl glow',
    colors: ['#FF9E00', '#FFD000', '#FFF3B0', '#FF7700', '#FFAA00'],
  },
  {
    id: 'sacred_lotus',
    name: 'Sacred Lotus Blossom',
    sinhalaName: 'Sacred Lotus',
    description: 'Ethereal lotus petal pink, magenta, pure white dew, and golden stamen',
    colors: ['#FF2A85', '#FFA3D7', '#FFFFFF', '#FFD700', '#D1127C'],
  },
  {
    id: 'prabhasvara_rainbow',
    name: 'Prabhasvara (Combined Spectrum)',
    sinhalaName: 'Prabhasvara Spectrum',
    description: 'Full harmonious spectrum blending all divine colors seamlessly',
    colors: ['#0038A8', '#00A3FF', '#00D68F', '#FFD700', '#FF6A00', '#D11212', '#A800FF'],
  },
  {
    id: 'dharma_wheel_azure',
    name: 'Tranquil Sapphire & White',
    sinhalaName: 'Tranquil Sapphire',
    description: 'Deep sapphire meditation blue, turquoise, and pure diamond white',
    colors: ['#001B48', '#02457A', '#0091D5', '#97CADB', '#FFFFFF'],
  },
  {
    id: 'vesak_celebration',
    name: 'Vesak Lantern Glow',
    sinhalaName: 'Vesak Lantern',
    description: 'High vibrancy festive festival celebration palette',
    colors: ['#FF0055', '#FFCC00', '#00F0FF', '#7000FF', '#00FF66'],
  },
];

// Helper: Hex string to RGB
export function hexToRgb(hex: string): RGBColor {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

// Helper: RGB to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Linear color interpolation
export function lerpColor(c1: RGBColor, c2: RGBColor, t: number): RGBColor {
  const clampT = Math.max(0, Math.min(1, t));
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * clampT),
    g: Math.round(c1.g + (c2.g - c1.g) * clampT),
    b: Math.round(c1.b + (c2.b - c1.b) * clampT),
  };
}

// Sample palette at continuous normalized position (0.0 to 1.0)
export function samplePalette(colors: RGBColor[], t: number): RGBColor {
  if (colors.length === 0) return { r: 255, g: 255, b: 255 };
  if (colors.length === 1) return colors[0];

  // wrap t in [0, 1)
  const normT = ((t % 1) + 1) % 1;
  const scaled = normT * colors.length;
  const index = Math.floor(scaled);
  const frac = scaled - index;
  const c1 = colors[index % colors.length];
  const c2 = colors[(index + 1) % colors.length];

  return lerpColor(c1, c2, frac);
}
