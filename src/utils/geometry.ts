import { ChakraTopology, LedPoint } from '../types/chakra';

/**
 * Calculates normalized coordinates (-1 to 1) and indexing for all LEDs
 * in the selected Buddha Chakra topology. Supports bottom statue opening/gap (as in 15-inch halo discs).
 */
export function generateLedPoints(topology: ChakraTopology): LedPoint[] {
  const points: LedPoint[] = [];

  if (topology.type === 'spokes') {
    const { spokeCount, ledsPerSpoke, innerRadius, outerRadius, bottomGapDeg, wiring } = topology.spokes;
    let globalIndex = 0;

    const gapDeg = Math.max(0, Math.min(180, bottomGapDeg || 0));
    const activeArcDeg = 360 - gapDeg;
    const activeArcRad = (activeArcDeg * Math.PI) / 180;

    // Bottom 6 o'clock is +PI/2 in screen coordinates (Y down).
    // The gap is centered at +PI/2.
    // Active arc starts at +PI/2 + (gapRad / 2) and sweeps clockwise for activeArcRad.
    const gapRad = (gapDeg * Math.PI) / 180;
    const startAngleRad = gapDeg > 0
      ? (Math.PI / 2) + (gapRad / 2)
      : -Math.PI / 2; // start at 12 o'clock if full circle

    const getSpokeAngle = (s: number) => {
      if (gapDeg > 0) {
        if (spokeCount <= 1) return startAngleRad;
        return startAngleRad + (s / (spokeCount - 1)) * activeArcRad;
      } else {
        return (s / spokeCount) * Math.PI * 2 - Math.PI / 2;
      }
    };

    if (wiring === 'ring_by_ring') {
      for (let pos = 0; pos < ledsPerSpoke; pos++) {
        const rFrac = ledsPerSpoke === 1 ? 0.5 : pos / (ledsPerSpoke - 1);
        const r = innerRadius + (outerRadius - innerRadius) * rFrac;

        for (let s = 0; s < spokeCount; s++) {
          const angle = getSpokeAngle(s);
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;

          points.push({
            index: globalIndex++,
            x,
            y,
            radius: r,
            angle: ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2),
            spokeIndex: s,
            posInSpoke: pos,
            ringIndex: pos,
            posInRing: s,
            zone: 'spoke',
          });
        }
      }
    } else {
      for (let s = 0; s < spokeCount; s++) {
        const angle = getSpokeAngle(s);

        for (let pos = 0; pos < ledsPerSpoke; pos++) {
          const actualPos = (wiring === 'zigzag' && s % 2 === 1)
            ? (ledsPerSpoke - 1 - pos)
            : (wiring === 'inward' ? (ledsPerSpoke - 1 - pos) : pos);

          const rFrac = ledsPerSpoke === 1 ? 0.5 : actualPos / (ledsPerSpoke - 1);
          const r = innerRadius + (outerRadius - innerRadius) * rFrac;

          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;

          points.push({
            index: globalIndex++,
            x,
            y,
            radius: r,
            angle: ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2),
            spokeIndex: s,
            posInSpoke: actualPos,
            ringIndex: actualPos,
            posInRing: s,
            zone: 'spoke',
          });
        }
      }
    }
  } else if (topology.type === 'concentric') {
    let globalIndex = 0;
    const { rings, bottomGapDeg } = topology.concentric;
    const gapDeg = Math.max(0, Math.min(180, bottomGapDeg || 0));
    const activeArcDeg = 360 - gapDeg;
    const activeArcRad = (activeArcDeg * Math.PI) / 180;
    const gapRad = (gapDeg * Math.PI) / 180;
    const startAngleRad = gapDeg > 0 ? (Math.PI / 2) + (gapRad / 2) : -Math.PI / 2;

    rings.forEach((ring, rIdx) => {
      const count = Math.max(1, ring.ledCount);
      for (let i = 0; i < count; i++) {
        const angle = gapDeg > 0
          ? (count > 1 ? startAngleRad + (i / (count - 1)) * activeArcRad : startAngleRad)
          : (i / count) * Math.PI * 2 - Math.PI / 2;

        const x = Math.cos(angle) * ring.radius;
        const y = Math.sin(angle) * ring.radius;

        points.push({
          index: globalIndex++,
          x,
          y,
          radius: ring.radius,
          angle: ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2),
          spokeIndex: -1,
          posInSpoke: -1,
          ringIndex: rIdx,
          posInRing: i,
          zone: 'outer_ring',
        });
      }
    });
  } else if (topology.type === 'hybrid') {
    let globalIndex = 0;
    const {
      centerLedCount,
      centerRadius,
      spokeCount,
      ledsPerSpoke,
      spokeInnerRadius,
      spokeOuterRadius,
      outerRingLedCount,
      outerRingRadius,
      bottomGapDeg,
    } = topology.hybrid;

    const gapDeg = Math.max(0, Math.min(180, bottomGapDeg || 0));
    const activeArcDeg = 360 - gapDeg;
    const activeArcRad = (activeArcDeg * Math.PI) / 180;
    const gapRad = (gapDeg * Math.PI) / 180;
    const startAngleRad = gapDeg > 0 ? (Math.PI / 2) + (gapRad / 2) : -Math.PI / 2;

    // 1. Center Lotus Ring
    if (centerLedCount > 0) {
      for (let i = 0; i < centerLedCount; i++) {
        const angle = (i / centerLedCount) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * centerRadius;
        const y = Math.sin(angle) * centerRadius;

        points.push({
          index: globalIndex++,
          x,
          y,
          radius: centerRadius,
          angle: ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2),
          spokeIndex: -1,
          posInSpoke: -1,
          ringIndex: 0,
          posInRing: i,
          zone: 'center',
        });
      }
    }

    // 2. Radial Ray Spokes
    for (let s = 0; s < spokeCount; s++) {
      const angle = gapDeg > 0
        ? (spokeCount > 1 ? startAngleRad + (s / (spokeCount - 1)) * activeArcRad : startAngleRad)
        : (s / spokeCount) * Math.PI * 2 - Math.PI / 2;

      for (let pos = 0; pos < ledsPerSpoke; pos++) {
        const rFrac = ledsPerSpoke === 1 ? 0.5 : pos / (ledsPerSpoke - 1);
        const r = spokeInnerRadius + (spokeOuterRadius - spokeInnerRadius) * rFrac;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        points.push({
          index: globalIndex++,
          x,
          y,
          radius: r,
          angle: ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2),
          spokeIndex: s,
          posInSpoke: pos,
          ringIndex: pos + 1,
          posInRing: s,
          zone: 'spoke',
        });
      }
    }

    // 3. Outer Halo Ring
    if (outerRingLedCount > 0) {
      for (let i = 0; i < outerRingLedCount; i++) {
        const angle = gapDeg > 0
          ? (outerRingLedCount > 1 ? startAngleRad + (i / (outerRingLedCount - 1)) * activeArcRad : startAngleRad)
          : (i / outerRingLedCount) * Math.PI * 2 - Math.PI / 2;

        const x = Math.cos(angle) * outerRingRadius;
        const y = Math.sin(angle) * outerRingRadius;

        points.push({
          index: globalIndex++,
          x,
          y,
          radius: outerRingRadius,
          angle: ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2),
          spokeIndex: -1,
          posInSpoke: -1,
          ringIndex: ledsPerSpoke + 1,
          posInRing: i,
          zone: 'outer_ring',
        });
      }
    }
  }

  return points;
}

/**
 * Calculates estimated electrical specifications for the LED setup.
 */
export function calculatePowerMetrics(totalLeds: number) {
  const peakMilliamps = totalLeds * 60;
  const avgMilliamps = totalLeds * 22;
  const peakAmps = peakMilliamps / 1000;
  const avgAmps = avgMilliamps / 1000;
  const peakWatts = peakAmps * 5;
  const avgWatts = avgAmps * 5;

  const injectionPoints = Math.max(1, Math.ceil(totalLeds / 60));
  const recommendedSupplyAmps = Math.ceil(peakAmps * 1.25);

  return {
    totalLeds,
    peakAmps: Number(peakAmps.toFixed(2)),
    avgAmps: Number(avgAmps.toFixed(2)),
    peakWatts: Number(peakWatts.toFixed(1)),
    avgWatts: Number(avgWatts.toFixed(1)),
    injectionPoints,
    recommendedSupplyAmps,
  };
}
