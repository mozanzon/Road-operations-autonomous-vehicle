import telemetrySchema from '../../../../telemetry_schema.json';

type TelemetryFieldType = 'number' | 'boolean' | 'string';

type TelemetryField = {
  key: string;
  name: string;
  type: TelemetryFieldType;
  aliases?: string[];
};

export type CanonicalTelemetry = Record<string, number | boolean | string> & {
  type: 'status';
};

const fields = telemetrySchema as TelemetryField[];
const fieldsByKey = new Map(fields.map((field) => [field.key, field]));

function parseSchemaValue(value: string, type: TelemetryFieldType): number | boolean | string {
  const trimmed = value.trim();
  if (type === 'boolean') return ['1', 'true', 'yes', 'on'].includes(trimmed.toLowerCase());
  if (type === 'number') {
    const numeric = Number(trimmed);
    return trimmed !== '' && Number.isFinite(numeric) ? numeric : 0;
  }
  return trimmed;
}

function applyAliases(data: CanonicalTelemetry): CanonicalTelemetry {
  for (const field of fields) {
    const value = data[field.name];
    if (value === undefined) continue;
    for (const alias of field.aliases ?? []) {
      data[alias] = value;
    }
  }

  if (data.heading !== undefined && data.compassHeading === undefined) data.compassHeading = data.heading;
  if (data.gps_fix !== undefined && data.fix === undefined) data.fix = Boolean(data.gps_fix);
  if (data.gps_speed !== undefined && data.gpsSpeed === undefined) data.gpsSpeed = data.gps_speed;
  if (data.gps_course !== undefined && data.gpsCourse === undefined) data.gpsCourse = data.gps_course;
  if (data.drive_moving !== undefined && data.moving === undefined) data.moving = Boolean(data.drive_moving);

  return data;
}

export function parseCompactTelemetry(raw: unknown): CanonicalTelemetry | null {
  if (typeof raw !== 'string' || !raw.startsWith('ST,')) return null;

  const data: CanonicalTelemetry = { type: 'status' };
  for (const part of raw.slice(3).split(',')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1);
    const field = fieldsByKey.get(key);
    if (!field) continue;
    data[field.name] = parseSchemaValue(value, field.type);
  }

  return applyAliases(data);
}
