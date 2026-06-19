import test from 'node:test';
import assert from 'node:assert/strict';

import { parseCompactTelemetry, selectTelemetryPayload, telemetryFieldNames } from './telemetrySchema';

test('compact telemetry expands to canonical UI fields', () => {
  const parsed = parseCompactTelemetry('ST,h=123.4,lat=30.044400,lng=31.235700,fix=1,spd=0.12,crs=90,e1=10,e2=11,lm=1.2,rm=1.3,v=0.2,nav=running,wp=2,wpc=5,dist=3.4,lp=80,rp=81,tet=44,ekp=1.1,eki=0.2,ekd=0.3,epo=-2,spray=1');

  assert.equal(parsed?.type, 'status');
  assert.equal(parsed?.heading, 123.4);
  assert.equal(parsed?.lat, 30.0444);
  assert.equal(parsed?.lng, 31.2357);
  assert.equal(parsed?.gps_fix, true);
  assert.equal(parsed?.gps_speed, 0.12);
  assert.equal(parsed?.gps_course, 90);
  assert.equal(parsed?.e1, 10);
  assert.equal(parsed?.e2, 11);
  assert.equal(parsed?.left_m, 1.2);
  assert.equal(parsed?.right_m, 1.3);
  assert.equal(parsed?.speed, 0.2);
  assert.equal(parsed?.wp_status, 'running');
  assert.equal(parsed?.wp_index, 2);
  assert.equal(parsed?.wp_count, 5);
  assert.equal(parsed?.target_distance_m, 3.4);
  assert.equal(parsed?.left_pwm, 80);
  assert.equal(parsed?.right_pwm, 81);
  assert.equal(parsed?.turn_expected_ticks, 44);
  assert.equal(parsed?.encoder_pid_kp, 1.1);
  assert.equal(parsed?.encoder_pid_ki, 0.2);
  assert.equal(parsed?.encoder_pid_kd, 0.3);
  assert.equal(parsed?.encoder_pid_output, -2);
  assert.equal(parsed?.spraying, true);
  assert.equal(parsed?.compassHeading, undefined);
  assert.equal(parsed?.gpsSpeed, undefined);
  assert.equal(parsed?.fix, undefined);
});

test('non compact telemetry returns null', () => {
  assert.equal(parseCompactTelemetry('STATUS|heading=1'), null);
});

test('schema includes all UI required telemetry fields', () => {
  const required = [
    'heading', 'lat', 'lng', 'gps_fix', 'gps_speed', 'gps_course', 'gps_hdop',
    'e1', 'e2', 'left_m', 'right_m', 'speed', 'battery', 'drive_moving',
    'drive_speed', 'active_drive_speed', 'left_pwm', 'right_pwm',
    'wp_status', 'nav_active', 'wp_active', 'wp_paused', 'wp_count', 'wp_index',
    'target_lat', 'target_lng', 'target_bearing', 'target_distance_m',
    'heading_error', 'heading_adjusting', 'turn_active', 'turn_expected_ticks',
    'encoder_error', 'encoder_pid_kp', 'encoder_pid_ki', 'encoder_pid_kd', 'encoder_pid_output',
    'plot_mode', 'spraying', 'dash_m', 'gap_m', 'plot_target_m', 'plot_done',
  ];

  for (const field of required) {
    assert.equal(telemetryFieldNames.has(field), true, `${field} missing from telemetry schema`);
  }
});

test('raw compact telemetry is used when bridge payload has no canonical fields', () => {
  const selected = selectTelemetryPayload(
    { type: 'status' },
    'ST,h=12.5,lat=29.983943,lng=30.949378,fix=1,e1=77,e2=98',
  );

  assert.equal(selected?.heading, 12.5);
  assert.equal(selected?.lat, 29.983943);
  assert.equal(selected?.lng, 30.949378);
  assert.equal(selected?.gps_fix, true);
  assert.equal(selected?.e1, 77);
  assert.equal(selected?.e2, 98);
});

test('parsed bridge telemetry wins when it has canonical fields', () => {
  const selected = selectTelemetryPayload(
    { type: 'status', heading: 22, lat: 29.1, lng: 30.1, gps_fix: true },
    'ST,h=12.5,lat=29.983943,lng=30.949378,fix=1',
  );

  assert.equal(selected?.heading, 22);
  assert.equal(selected?.lat, 29.1);
});
