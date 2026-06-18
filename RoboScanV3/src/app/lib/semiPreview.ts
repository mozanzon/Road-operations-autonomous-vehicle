import type { GPSData, ScriptedMoveStep } from '../context/RobotContext';

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
  painting?: unknown;
};

type Cursor = {
  lat: number;
  lng: number;
  heading: number;
};

type StepSample = [number, number, number];
type StepResult = {
  movementSamples: StepSample[];
  paintedSegments: LatLngTuple[][];
  end: Cursor;
};

export function generateSemiPreview({
  gps,
  fallbackGps,
  scriptedMoves,
  fallbackMove,
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
  const paintedSegments: LatLngTuple[][] = [];
  let estimatedTravelMeters = 0;

  for (const move of steps) {
    const stepResult = simulateStep(move, cursor);
    if (stepResult.movementSamples.length > 0) {
      appendStepSamples(movementPoints, stepResult.movementSamples);
      estimatedTravelMeters += measureLine([[cursor.lat, cursor.lng], ...stepResult.movementSamples.map(([lat, lng]) => [lat, lng] as LatLngTuple)]);
    }
    if (stepResult.paintedSegments.length > 0) {
      paintedSegments.push(...stepResult.paintedSegments);
    }
    cursor.lat = stepResult.end.lat;
    cursor.lng = stepResult.end.lng;
    cursor.heading = stepResult.end.heading;
  }

  const movementLine = dedupeMovementPoints(movementPoints);
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

function simulateStep(move: ScriptedMoveStep, cursor: Cursor): StepResult {
  if (move.direction === 'left' || move.direction === 'right') {
    return simulateTurn(move, cursor);
  }
  return simulateStraight(move, cursor);
}

function simulateStraight(move: ScriptedMoveStep, cursor: Cursor): StepResult {
  const signedDistance = move.direction === 'backward' ? -move.distance : move.distance;
  const samples = Math.max(2, Math.ceil(Math.abs(signedDistance) / 1.5));
  const points: StepSample[] = [];

  for (let index = 1; index <= samples; index += 1) {
    const partialDistance = (signedDistance * index) / samples;
    const point = offsetByHeading(cursor.lat, cursor.lng, cursor.heading, partialDistance);
    points.push([point.lat, point.lng, cursor.heading]);
  }

  const paintedSegments = buildStepPaintedSegments(move, cursor, points);
  const endPoint = points.at(-1);
  return {
    movementSamples: points,
    paintedSegments,
    end: endPoint
      ? { lat: endPoint[0], lng: endPoint[1], heading: endPoint[2] }
      : { ...cursor },
  };
}

function simulateTurn(move: ScriptedMoveStep, cursor: Cursor): StepResult {
  const signedHeadingDelta = move.direction === 'left' ? -90 : 90;
  return {
    movementSamples: [],
    paintedSegments: [],
    end: {
      lat: cursor.lat,
      lng: cursor.lng,
      heading: normalizeHeading(cursor.heading + signedHeadingDelta),
    },
  };
}

function buildStepPaintedSegments(move: ScriptedMoveStep, cursor: Cursor, movementSamples: StepSample[]): LatLngTuple[][] {
  if (!move.markingEnabled || move.markingDistance <= 0 || movementSamples.length === 0) return [];
  const stepLine = [[cursor.lat, cursor.lng], ...movementSamples.map(([lat, lng]) => [lat, lng] as LatLngTuple)];
  const limitedLine = trimLineToDistance(stepLine, move.markingDistance);
  if (limitedLine.length < 2) return [];
  if (move.markingMode === 'dashed') {
    return dashLine(limitedLine, move.dashLength, move.gapLength);
  }
  return [limitedLine];
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

function trimLineToDistance(points: LatLngTuple[], targetDistance: number): LatLngTuple[] {
  if (points.length < 2 || targetDistance <= 0) return [];
  const trimmed: LatLngTuple[] = [points[0]];
  let remaining = targetDistance;

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    const segmentDistance = distanceMeters(start, end);
    if (segmentDistance <= 0) continue;
    if (remaining >= segmentDistance) {
      trimmed.push(end);
      remaining -= segmentDistance;
      continue;
    }
    trimmed.push(interpolatePoint(start, end, remaining / segmentDistance));
    return trimmed;
  }

  return trimmed;
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

function normalizeHeading(value: number) {
  return ((value % 360) + 360) % 360;
}
