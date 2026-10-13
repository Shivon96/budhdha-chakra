import { LedPoint, PatternId, PatternSettings, RGBColor } from '../types/chakra';
import { hexToRgb, samplePalette } from '../constants/palettes';

/**
 * Computes the RGB color of each LED for the current animation frame.
 */
export function renderPatternFrame(
  points: LedPoint[],
  patternId: PatternId,
  elapsedTime: number, // in seconds
  paletteColorsHex: string[],
  settings: PatternSettings
): RGBColor[] {
  const paletteRgb = paletteColorsHex.map(hexToRgb);
  const { speed, brightness, decay, direction, colorScale } = settings;
  const t = elapsedTime * speed * direction;

  return points.map((p, idx) => {
    let intensity = 0;
    let colorPos = 0;

    switch (patternId) {
      case 'vihidena_ras': {
        // Outward radiant rays pulsing from center outward
        // Wave front travels from radius 0 to 1
        const wavePhase = (t * 1.8 - p.radius * 2.5 * colorScale);
        const wave = Math.sin(wavePhase);
        // Sharp positive pulses
        intensity = Math.pow(Math.max(0, wave), 2.2);

        // Add spoke beam focus
        const spokeGlow = Math.cos(p.angle * 8 + t * 0.5) * 0.15;
        intensity = Math.min(1, intensity + Math.max(0, spokeGlow));

        // Color shifts along radius and time
        colorPos = (p.radius * 1.2 - t * 0.3) % 1;
        break;
      }

      case 'sankocha_ras': {
        // Inward cascading energy towards sacred core
        const wavePhase = (t * 1.8 + p.radius * 2.8 * colorScale);
        const wave = Math.sin(wavePhase);
        intensity = Math.pow(Math.max(0, wave), 2.2);
        colorPos = (1 - p.radius + t * 0.25) % 1;
        break;
      }

      case 'karakenna_chakra': {
        // Rotating Dharma wheel with trailing decay
        // Angle in radians (0 to 2*PI)
        const rotAngle = (p.angle - t * 2.2) % (Math.PI * 2);
        const normalizedAngle = ((rotAngle / (Math.PI * 2)) % 1 + 1) % 1;

        // 8 or 16 wheel lobes
        const lobes = 8;
        const lobePhase = (normalizedAngle * lobes) % 1;
        // Sawtooth decay for trailing spin effect
        intensity = Math.pow(1 - lobePhase, 1 / (1.1 - decay * 0.6));

        // Slightly brighten tips
        intensity = Math.min(1, intensity * (0.6 + p.radius * 0.6));
        colorPos = (normalizedAngle * colorScale + p.radius * 0.2) % 1;
        break;
      }

      case 'shadvarna_bhranama': {
        // 6 Buddhist Flag Color Sectors rotating around the circle
        const rotAngle = (p.angle - t * 1.2) % (Math.PI * 2);
        const normalizedAngle = ((rotAngle / (Math.PI * 2)) % 1 + 1) % 1;
        
        // 6 distinct equal segments (or 5 rays + combined prabhasvara)
        const sectorIndex = Math.floor(normalizedAngle * 6);
        const sectorFrac = (normalizedAngle * 6) % 1;

        // Edge definition with smooth center body
        intensity = 0.55 + 0.45 * Math.sin(sectorFrac * Math.PI);
        // Outer tip emphasis
        intensity *= (0.7 + p.radius * 0.4);

        colorPos = (sectorIndex / 6);
        break;
      }

      case 'kundalani_spiral': {
        // Spiral galaxy vortex
        const arms = 6;
        const spiralPhase = p.angle * arms + p.radius * 8 - t * 4;
        const wave = Math.sin(spiralPhase);
        intensity = Math.pow(Math.max(0, (wave + 1) / 2), 2.5);

        colorPos = ((spiralPhase / (Math.PI * 2 * arms)) * colorScale) % 1;
        break;
      }

      case 'warna_galana': {
        // Smooth flowing color tide wave
        const wave1 = Math.sin(p.angle * 2 - t * 2);
        const wave2 = Math.cos(p.radius * 6 - t * 2.5);
        intensity = 0.4 + 0.6 * ((wave1 + wave2) / 2 + 1) / 2;

        colorPos = ((p.angle / (Math.PI * 2)) + p.radius * 0.5 + t * 0.2) % 1;
        break;
      }

      case 'ulkapaatha_meteor': {
        // Comets racing outward along spokes
        const spokeIdx = p.spokeIndex >= 0 ? p.spokeIndex : Math.floor((p.angle / (Math.PI * 2)) * 16);
        const spokeOffset = (spokeIdx * 0.618) % 1; // golden ratio pseudo-random phase
        const meteorHead = ((t * 1.6 + spokeOffset) % 1);

        const distFromHead = meteorHead - p.radius;
        if (distFromHead >= 0 && distFromHead < (0.45 * (1.1 - decay * 0.5))) {
          // Trail
          intensity = Math.pow(1 - distFromHead / (0.45 * (1.1 - decay * 0.5)), 2);
        } else {
          intensity = 0.08; // ambient soft glow
        }

        colorPos = (spokeIdx / 16 + p.radius * 0.3) % 1;
        break;
      }

      case 'pibidena_neluma': {
        // Blooming lotus flower ripples
        const petals = 8;
        const petalShape = Math.cos(p.angle * petals);
        const bloomWave = Math.sin(p.radius * 7 - t * 2.8 + petalShape * 0.8);
        intensity = Math.pow(Math.max(0, (bloomWave + 1) / 2), 2.0);

        colorPos = (p.radius * 0.8 + petalShape * 0.2 + t * 0.15) % 1;
        break;
      }

      case 'tharu_eli_sparkle': {
        // Sacred twinkling stars with serene ambient breath
        const baseBreath = 0.25 + 0.15 * Math.sin(t * 1.5 + p.radius * 2);
        // Deterministic pseudo-random twinkle per LED index
        const hash = Math.sin(idx * 7919 + Math.floor(t * 8)) * 43758.5453;
        const sparkle = (hash - Math.floor(hash)) > 0.82 ? 1.0 : 0.0;
        
        intensity = Math.min(1, baseBreath + sparkle * 0.85);
        colorPos = ((p.radius * 0.4 + (idx % 7) / 7 + t * 0.1)) % 1;
        break;
      }

      case 'ubaya_bhranama': {
        // Dual counter-rotating wheels: even spokes clockwise, odd counter-clockwise
        const spokeIdx = p.spokeIndex >= 0 ? p.spokeIndex : Math.floor((p.angle / (Math.PI * 2)) * 16);
        const isEven = spokeIdx % 2 === 0;
        const dir = isEven ? 1 : -1;

        const phase = (p.angle * dir * 4 - t * 3.5 + p.radius * 3) % (Math.PI * 2);
        const wave = Math.sin(phase);
        intensity = Math.pow(Math.max(0, (wave + 1) / 2), 2.2);

        colorPos = isEven ? (p.radius * 0.5 + t * 0.2) % 1 : (1 - p.radius * 0.5 - t * 0.2) % 1;
        break;
      }

      case 'prana_spandana': {
        // Deep meditative divine breath
        const breath = (Math.sin(t * 1.8) + 1) / 2; // 0 to 1
        // Active zone expands outward with breath
        const activeRadius = 0.2 + 0.75 * breath;
        const distFromFront = Math.abs(p.radius - activeRadius);
        intensity = Math.max(0.12, Math.exp(-distFromFront * 6));

        colorPos = (breath * 0.6 + p.radius * 0.4) % 1;
        break;
      }

      case 'strobe_vesak_flash': {
        // Vesak festive strobe pulses with trailing color fade
        const beat = (t * 2.2) % 1; // 0 to 1
        const flash = Math.pow(Math.max(0, 1 - beat * 2.5), 3);
        const ripple = (Math.sin(p.radius * 10 - t * 4) + 1) / 2;
        intensity = Math.min(1, flash * 0.85 + ripple * 0.35 + 0.1);

        colorPos = (Math.floor(t * 2.2) * 0.2 + p.radius * 0.3) % 1;
        break;
      }

      case 'rainbow_cyclone': {
        // Full fastled rainbow cyclone
        intensity = 0.85 + 0.15 * Math.sin(p.radius * 8 - t * 3);
        colorPos = ((p.angle / (Math.PI * 2)) + p.radius * 0.6 - t * 0.5) % 1;
        break;
      }

      case 'custom_designer':
      default: {
        // Default harmonious radial ripple
        const ripple = Math.sin(p.radius * 6 * colorScale - t * 2.5);
        intensity = 0.3 + 0.7 * Math.pow(Math.max(0, (ripple + 1) / 2), 1.8);
        colorPos = ((p.angle / (Math.PI * 2)) * 2 + p.radius * 0.5) % 1;
        break;
      }
    }

    // Sample palette color
    const sampled = samplePalette(paletteRgb, colorPos);

    // Apply global brightness and pattern intensity
    const finalBrightness = Math.max(0, Math.min(1, intensity * brightness));

    return {
      r: Math.round(sampled.r * finalBrightness),
      g: Math.round(sampled.g * finalBrightness),
      b: Math.round(sampled.b * finalBrightness),
    };
  });
}
