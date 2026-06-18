import test from 'node:test';
import assert from 'node:assert/strict';

import type { GPSData, ScriptedMoveStep } from '../context/RobotContext';
import { generateSemiPreview } from './semiPreview';

const baseGps: GPSData = {
  lat: 30.0444,
  lng: 31.2357,
  speed: 0,
  heading: 0,
  fix: true,
  accuracy: 1,
  timestamp: 0,
};

function step(overrides: Partial<ScriptedMoveStep>): ScriptedMoveStep {
  return {
    id: 'step-1',
    direction: 'forward',
    distance: 10,
    speed: 1,
    markingEnabled: true,
    markingMode: 'solid',
    markingDistance: 10,
    dashLength: 0.5,
    gapLength: 0.3,
    ...overrides,
  };
}

test('forward step produces forward displacement and paint', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({})],
    fallbackMove: step({}),
  });

  assert.equal(preview.source, 'scripted-queue');
  assert.equal(preview.movementPoints.length >= 2, true);
  assert.equal(preview.estimatedTravelMeters > 9.5 && preview.estimatedTravelMeters < 10.5, true);
  assert.equal(preview.estimatedPaintMeters > 9.5 && preview.estimatedPaintMeters < 10.5, true);
  assert.equal(preview.movementPoints.at(-1)![0] > baseGps.lat, true);
});

test('backward step reverses displacement', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ direction: 'backward' })],
    fallbackMove: step({ direction: 'backward' }),
  });

  assert.equal(preview.movementPoints.at(-1)![0] < baseGps.lat, true);
});

test('turn step changes heading in place', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ direction: 'right', distance: 0, speed: 0.1 })],
    fallbackMove: step({ direction: 'right', distance: 0, speed: 0.1 }),
  });

  assert.deepEqual(preview.movementPoints, [[baseGps.lat, baseGps.lng]]);
  assert.equal(preview.finalHeading > 45 && preview.finalHeading < 135, true);
});

test('paint off yields no painted segments', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ markingEnabled: false })],
    fallbackMove: step({ markingEnabled: false }),
  });

  assert.equal(preview.paintedSegments.length, 0);
  assert.equal(preview.estimatedPaintMeters, 0);
});

test('dashed painting uses the step dash and gap values', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ distance: 12, markingMode: 'dashed', markingDistance: 12, dashLength: 2, gapLength: 1 })],
    fallbackMove: step({ distance: 12, markingMode: 'dashed', markingDistance: 12, dashLength: 2, gapLength: 1 }),
  });

  assert.equal(preview.paintedSegments.length > 1, true);
  assert.equal(preview.estimatedPaintMeters > 0, true);
  assert.equal(preview.estimatedPaintMeters < preview.estimatedTravelMeters, true);
  const firstSegment = preview.paintedSegments[0];
  const firstDashDistance = firstSegment.length >= 2
    ? measureSegmentLength(firstSegment)
    : 0;
  assert.equal(firstDashDistance > 1.5 && firstDashDistance < 2.5, true);
});

test('move-only step travels without painting', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ markingEnabled: false })],
    fallbackMove: step({ markingEnabled: false }),
  });

  assert.equal(preview.estimatedTravelMeters > 9.5 && preview.estimatedTravelMeters < 10.5, true);
  assert.equal(preview.estimatedPaintMeters, 0);
  assert.equal(preview.paintedSegments.length, 0);
  assert.equal(preview.movementPoints.at(-1)![0] > baseGps.lat, true);
});

test('marked distance uses the step marking distance instead of travel distance', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ distance: 10, markingDistance: 4 })],
    fallbackMove: step({ distance: 10, markingDistance: 4 }),
  });

  assert.equal(preview.estimatedTravelMeters > 9.5 && preview.estimatedTravelMeters < 10.5, true);
  assert.equal(preview.estimatedPaintMeters > 3.5 && preview.estimatedPaintMeters < 4.5, true);
});

test('right turn followed by forward step uses the new heading', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [
      step({ id: 'turn-1', direction: 'right', distance: 0, speed: 0.1 }),
      step({ id: 'forward-1', direction: 'forward', distance: 10, speed: 1 }),
    ],
    fallbackMove: step({}),
  });

  const end = preview.movementPoints.at(-1)!;
  assert.equal(preview.finalHeading > 45 && preview.finalHeading < 135, true);
  assert.equal(preview.estimatedTravelMeters > 9.5 && preview.estimatedTravelMeters < 10.5, true);
  assert.equal(end[1] > baseGps.lng, true);
  assert.equal(Math.abs(end[0] - baseGps.lat) < 0.000005, true);
});

test('turn-only step rotates in place without adding paint distance', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ direction: 'right', distance: 0, speed: 0.1 })],
    fallbackMove: step({ direction: 'right', distance: 0, speed: 0.1 }),
  });

  assert.equal(preview.finalHeading > 45 && preview.finalHeading < 135, true);
  assert.equal(preview.estimatedTravelMeters, 0);
  assert.equal(preview.estimatedPaintMeters, 0);
  assert.equal(preview.paintedSegments.length, 0);
  assert.deepEqual(preview.movementPoints, [[baseGps.lat, baseGps.lng]]);
});

function measureSegmentLength(points: [number, number][]) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += distanceMeters(points[index - 1], points[index]);
  }
  return total;
}

function distanceMeters(start: [number, number], end: [number, number]) {
  const radius = 6371000;
  const dLat = ((end[0] - start[0]) * Math.PI) / 180;
  const dLng = ((end[1] - start[1]) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((start[0] * Math.PI) / 180) * Math.cos((end[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
