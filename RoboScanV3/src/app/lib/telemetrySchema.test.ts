import test from 'node:test';
import assert from 'node:assert/strict';

import { parseCompactTelemetry } from './telemetrySchema';

test('compact telemetry expands to canonical UI fields', () => {
  const parsed = parseCompactTelemetry('ST,h=123.4,lat=30.044400,lng=31.235700,fix=1,spd=0.12,crs=90,nav=running,wp=2,wpc=5,dist=3.4,spray=1');

  assert.equal(parsed?.type, 'status');
  assert.equal(parsed?.heading, 123.4);
  assert.equal(parsed?.compassHeading, 123.4);
  assert.equal(parsed?.lat, 30.0444);
  assert.equal(parsed?.lng, 31.2357);
  assert.equal(parsed?.gps_fix, true);
  assert.equal(parsed?.fix, true);
  assert.equal(parsed?.gps_speed, 0.12);
  assert.equal(parsed?.gpsSpeed, 0.12);
  assert.equal(parsed?.gps_course, 90);
  assert.equal(parsed?.gpsCourse, 90);
  assert.equal(parsed?.wp_status, 'running');
  assert.equal(parsed?.wp_index, 2);
  assert.equal(parsed?.wp_count, 5);
  assert.equal(parsed?.target_distance_m, 3.4);
  assert.equal(parsed?.spraying, true);
});

test('non compact telemetry returns null', () => {
  assert.equal(parseCompactTelemetry('STATUS|heading=1'), null);
});
