import test from 'node:test';
import assert from 'node:assert/strict';

import { getMapTileSource, getPrimaryMapMarker, resolveMapCenter, type MapLocationSource } from './mapSettings';

test('returns the satellite tile source when requested', () => {
  const tile = getMapTileSource('satellite');

  assert.equal(tile.url.includes('World_Imagery'), true);
  assert.equal(tile.attr, '© Esri');
});

test('falls back to openstreetmap when tile source is unknown', () => {
  const tile = getMapTileSource('unknown');

  assert.equal(tile.url.includes('openstreetmap.org'), true);
  assert.equal(tile.attr, '© OpenStreetMap');
});

test('uses operator location when selected and available', () => {
  const center = resolveMapCenter({
    source: 'operator',
    robotPosition: [30.0444, 31.2357],
    operatorLocation: { lat: 29.97, lng: 31.12 },
    fallbackCenter: [30, 31],
  });

  assert.deepEqual(center, [29.97, 31.12]);
});

test('falls back to robot position when operator location is selected but unavailable', () => {
  const center = resolveMapCenter({
    source: 'operator',
    robotPosition: [30.0444, 31.2357],
    operatorLocation: null,
    fallbackCenter: [30, 31],
  });

  assert.deepEqual(center, [30.0444, 31.2357]);
});

test('falls back to explicit center when robot source has no valid gps position', () => {
  const center = resolveMapCenter({
    source: 'robot' satisfies MapLocationSource,
    robotPosition: null,
    operatorLocation: { lat: 29.97, lng: 31.12 },
    fallbackCenter: [30, 31],
  });

  assert.deepEqual(center, [30, 31]);
});

test('prefers operator marker when operator mode is selected and location is available', () => {
  const marker = getPrimaryMapMarker({
    source: 'operator',
    robotPosition: [30.0444, 31.2357],
    operatorLocation: { lat: 29.97, lng: 31.12 },
  });

  assert.deepEqual(marker, {
    kind: 'operator',
    position: [29.97, 31.12],
  });
});

test('falls back to robot marker when operator mode is selected without operator location', () => {
  const marker = getPrimaryMapMarker({
    source: 'operator',
    robotPosition: [30.0444, 31.2357],
    operatorLocation: null,
  });

  assert.deepEqual(marker, {
    kind: 'robot',
    position: [30.0444, 31.2357],
  });
});

