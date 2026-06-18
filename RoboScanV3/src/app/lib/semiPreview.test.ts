import test from 'node:test';
import assert from 'node:assert/strict';

import type { GPSData, PaintingState, ScriptedMoveStep } from '../context/RobotContext';
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

const solidPainting: PaintingState = {
  active: true,
  mode: 'solid',
  dashLength: 0.5,
  gapLength: 0.3,
  color: '#ffffff',
  targetDistance: 100,
  distancePainted: 0,
  status: 'idle',
};

const dashedPainting: PaintingState = {
  ...solidPainting,
  mode: 'dashed',
  dashLength: 2,
  gapLength: 1,
};

function step(overrides: Partial<ScriptedMoveStep>): ScriptedMoveStep {
  return {
    id: 'step-1',
    direction: 'forward',
    movementType: 'straight',
    distance: 10,
    speed: 1,
    ...overrides,
  };
}

test('forward straight step produces forward displacement and paint', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({})],
    fallbackMove: step({}),
    painting: solidPainting,
  });

  assert.equal(preview.source, 'scripted-queue');
  assert.equal(preview.movementPoints.length >= 2, true);
  assert.equal(preview.estimatedTravelMeters > 9.5 && preview.estimatedTravelMeters < 10.5, true);
  assert.equal(preview.estimatedPaintMeters > 9.5 && preview.estimatedPaintMeters < 10.5, true);
  assert.equal(preview.movementPoints.at(-1)![0] > baseGps.lat, true);
});

test('backward straight step reverses displacement', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ direction: 'backward' })],
    fallbackMove: step({ direction: 'backward' }),
    painting: solidPainting,
  });

  assert.equal(preview.movementPoints.at(-1)![0] < baseGps.lat, true);
});

test('turn step changes heading and creates curved movement samples', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ direction: 'right', movementType: 'turn', distance: 1, speed: 0.5 })],
    fallbackMove: step({ direction: 'right', movementType: 'turn', distance: 1, speed: 0.5 }),
    painting: solidPainting,
  });

  assert.equal(preview.movementPoints.length > 3, true);
  assert.equal(preview.finalHeading > 45 && preview.finalHeading < 135, true);
});

test('arc step emits a continuous curved path and changes both axes', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ direction: 'right', movementType: 'arc', distance: 6, speed: 1 })],
    fallbackMove: step({ direction: 'right', movementType: 'arc', distance: 6, speed: 1 }),
    painting: solidPainting,
  });

  const end = preview.movementPoints.at(-1)!;
  assert.equal(preview.movementPoints.length > 4, true);
  assert.equal(end[0] > baseGps.lat, true);
  assert.equal(end[1] > baseGps.lng, true);
});

test('paint off yields no painted segments', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({})],
    fallbackMove: step({}),
    painting: { ...solidPainting, active: false },
  });

  assert.equal(preview.paintedSegments.length, 0);
  assert.equal(preview.estimatedPaintMeters, 0);
});

test('dashed painting produces alternating painted segments shorter than total travel', () => {
  const preview = generateSemiPreview({
    gps: baseGps,
    fallbackGps: baseGps,
    scriptedMoves: [step({ distance: 12 })],
    fallbackMove: step({ distance: 12 }),
    painting: dashedPainting,
  });

  assert.equal(preview.paintedSegments.length > 1, true);
  assert.equal(preview.estimatedPaintMeters > 0, true);
  assert.equal(preview.estimatedPaintMeters < preview.estimatedTravelMeters, true);
});
