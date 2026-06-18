import type { GPSData, PaintingState, ScriptedMoveStep } from '../context/RobotContext';

type LatLngTuple = [number, number];

export type SemiPreview = {
  movementPoints: LatLngTuple[];
  paintedSegments: LatLngTuple[][];
  estimatedTravelMeters: number;
  estimatedPaintMeters: number;
  source: 'scripted-queue' | 'single-step';
  isEstimated: true;
  usedFallbackStart: boolean;
  start: LatLngTuple;
  finalHeading: number;
};

type GenerateSemiPreviewInput = {
  gps: GPSData;
  fallbackGps: GPSData;
  scriptedMoves: ScriptedMoveStep[];
  fallbackMove: ScriptedMoveStep;
  painting: PaintingState;
};

type Cursor = {
  lat: number;
  lng: number;
  heading: number;
};

const TURN_RADIUS_METERS = 1.5;
const MIN_ARC_RADIUS_METERS = 1.5;

export function generateSemiPreview({
  gps,
  fallbackGps,
  scriptedMoves,
  fallbackMove,
  painting,
}: GenerateSemiPreviewInput): SemiPreview {
  const seedGps = gps.fix ? gps : fallbackGps;
  const start: LatLngTuple = [seedGps.lat, seedGps.lng];
  const cursor: Cursor = {
    lat: start[0],
    lng: start[1],
    heading: normalizeHeading(seedGps.heading),
  };
  const steps = scriptedMoves.length > 0 ? scriptedMoves : [fallbackMove];
  const source = scriptedMoves.length > 0 ? 'scripted-queue' as const : 'single-step' as const;

  const movementPoints: LatLngTuple[] = [start];
  let estimatedTravelMeters = 0;

  for (const move of steps) {
    const samples = simulateStep(move, cursor);
    if (samples.length === 0) continue;
    appendStepSamples(movementPoints, samples);
    estimatedTravelMeters += measureLine([[cursor.lat, cursor.lng], ...samples.map(([lat, lng]) => [lat, lng] as LatLngTuple)]);
    const last = samples.at(-1)!;
    cursor.lat = last[0];
    cursor.lng = last[1];
    cursor.heading = last[2];
  }

  const movementLine = dedupeMovementPoints(movementPoints);
  const paintedSegments = buildPaintedSegments(movementLine, painting);
  const estimatedPaintMeters = paintedSegments.reduce((total, segment) => total + measureLine(segment), 0);

  return {
    movementPoints: movementLine,
    paintedSegments,
    estimatedTravelMeters,
    estimatedPaintMeters,
    source,
    isEstimated: true,
    usedFallbackStart: !gps.fix,
    start,
    finalHeading: cursor.heading,
  };
}

type StepSample = [number, number, number];

function simulateStep(move: ScriptedMoveStep, cursor: Cursor): StepSample[] {
  if (move.movementType === 'turn') return simulateTurn(move, cursor);
  if (move.movementType === 'arc') return simulateArc(move, cursor);
  return simulateStraight(move, cursor);
}

function simulateStraight(move: ScriptedMoveStep, cursor: Cursor): StepSample[] {
  const signedDistance = move.direction === 'backward' ? -move.distance : move.distance;
  const samples = Math.max(2, Math.ceil(Math.abs(signedDistance) / 1.5));
  const points: StepSample[] = [];

  for (let index = 1; index <= samples; index += 1) {
    const partialDistance = (signedDistance * index) / samples;
    const point = offsetByHeading(cursor.lat, cursor.lng, cursor.heading, partialDistance);
    points.push([point.lat, point.lng, cursor.heading]);
  }

  return points;
}

function simulateTurn(move: ScriptedMoveStep, cursor: Cursor): StepSample[] {
  const durationSeconds = stepDurationMs(move) / 1000;
  const signedTravel = (move.direction === 'left' ? -1 : 1) * Math.max(0.05, move.speed) * durationSeconds;
  return sampleArcFromCursor(cursor, TURN_RADIUS_METERS, signedTravel);
}

function simulateArc(move: ScriptedMoveStep, cursor: Cursor): StepSample[] {
  const signedTravel = (move.direction === 'left' ? -1 : 1) * Math.max(0, move.distance);
  const radius = Math.max(MIN_ARC_RADIUS_METERS, move.distance / 2);
  return sampleArcFromCursor(cursor, radius, signedTravel);
}

function sampleArcFromCursor(cursor: Cursor, radiusMeters: number, signedTravelMeters: number): StepSample[] {
  if (Math.abs(signedTravelMeters) < 0.001) return [];
  const samples = Math.max(4, Math.ceil(Math.abs(signedTravelMeters) / 1.5));
  const headingRad = toRadians(cursor.heading);
  const sign = Math.sign(signedTravelMeters);
  const rightNormal = headingRad + Math.PI / 2;
  const center = offsetByBearingRadians(cursor.lat, cursor.lng, rightNormal, sign * radiusMeters);
  const startBearing = rightNormal + Math.PI;
  const sweep = signedTravelMeters / radiusMeters;
  const points: StepSample[] = [];

  for (let index = 1; index <= samples; index += 1) {
    const fraction = index / samples;
    const bearing = startBearing + sweep * fraction;
    const point = offsetByBearingRadians(center.lat, center.lng, bearing, radiusMeters);
    const heading = normalizeHeading(cursor.heading + toDegrees(sweep * fraction));
    points.push([point.lat, point.lng, heading]);
  }

  return points;
}

function buildPaintedSegments(movementPoints: LatLngTuple[], painting: PaintingState): LatLngTuple[][] {
  if (!painting.active || movementPoints.length < 2) return [];
  if (painting.mode === 'solid') return [movementPoints];
  return dashLine(movementPoints, painting.dashLength, painting.gapLength);
}

function dashLine(points: LatLngTuple[], dashLength: number, gapLength: number): LatLngTuple[][] {
  const dash = Math.max(0.1, dashLength);
  const gap = Math.max(0.1, gapLength);
  const segments: LatLngTuple[][] = [];
  let phaseRemaining = dash;
  let paintingOn = true;
  let currentSegment: LatLngTuple[] = [];

  for (let index = 1; index < points.length; index += 1) {
    let start = points[index - 1];
    const end = points[index];
    let remaining = distanceMeters(start, end);
    if (remaining <= 0) continue;

    while (remaining > 0) {
      const piece = Math.min(phaseRemaining, remaining);
      const ratio = piece / remaining;
      const next = interpolatePoint(start, end, ratio);

      if (paintingOn) {
        if (currentSegment.length === 0) currentSegment.push(start);
        currentSegment.push(next);
      }

      remaining -= piece;
      phaseRemaining -= piece;
      start = next;

      if (phaseRemaining <= 1e-6) {
        if (paintingOn && currentSegment.length >= 2) {
          segments.push(currentSegment);
          currentSegment = [];
        }
        paintingOn = !paintingOn;
        phaseRemaining = paintingOn ? dash : gap;
      }
    }
  }

  if (paintingOn && currentSegment.length >= 2) segments.push(currentSegment);
  return segments;
}

function appendStepSamples(points: LatLngTuple[], samples: StepSample[]) {
  for (const [lat, lng] of samples) {
    const last = points.at(-1);
    if (!last || last[0] !== lat || last[1] !== lng) points.push([lat, lng]);
  }
}

function dedupeMovementPoints(points: LatLngTuple[]) {
  return points.filter((point, index) => index === 0 || point[0] !== points[index - 1][0] || point[1] !== points[index - 1][1]);
}

function measureLine(points: LatLngTuple[]) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += distanceMeters(points[index - 1], points[index]);
  }
  return total;
}

function interpolatePoint(start: LatLngTuple, end: LatLngTuple, ratio: number): LatLngTuple {
  return [
    start[0] + (end[0] - start[0]) * ratio,
    start[1] + (end[1] - start[1]) * ratio,
  ];
}

function stepDurationMs(step: Pick<ScriptedMoveStep, 'direction' | 'movementType' | 'distance' | 'speed'>) {
  if (step.direction === 'left' || step.direction === 'right' || step.movementType === 'turn') return 3500;
  const speed = Math.max(0.05, step.speed);
  return Math.max(750, Math.min(30000, (step.distance / speed) * 1000));
}

function offsetByHeading(lat: number, lng: number, headingDeg: number, distanceMetersValue: number) {
  return offsetByBearingRadians(lat, lng, toRadians(headingDeg), distanceMetersValue);
}

function offsetByBearingRadians(lat: number, lng: number, bearingRad: number, distanceMetersValue: number) {
  const northM = Math.cos(bearingRad) * distanceMetersValue;
  const eastM = Math.sin(bearingRad) * distanceMetersValue;
  return offsetGps(lat, lng, northM, eastM);
}

function offsetGps(lat: number, lng: number, northM: number, eastM: number) {
  const radius = 6378137;
  return {
    lat: lat + (northM / radius) * (180 / Math.PI),
    lng: lng + (eastM / (radius * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI),
  };
}

function distanceMeters(start: LatLngTuple | StepSample, end: LatLngTuple | StepSample) {
  const radius = 6371000;
  const dLat = ((end[0] - start[0]) * Math.PI) / 180;
  const dLng = ((end[1] - start[1]) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((start[0] * Math.PI) / 180) * Math.cos((end[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

function toDegrees(rad: number) {
  return (rad * 180) / Math.PI;
}

function normalizeHeading(value: number) {
  return ((value % 360) + 360) % 360;
}
