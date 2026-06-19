import telemetrySchema from '../../../../telemetry_schema.json';

type TelemetryFieldType = 'number' | 'boolean' | 'string';

type TelemetryField = {
  key: string;
  name: string;
  type: TelemetryFieldType;
};

export type CanonicalTelemetry = Record<string, number | boolean | string> & {
  type: 'status';
};

const fields = telemetrySchema as TelemetryField[];
const fieldsByKey = new Map(fields.map((field) => [field.key, field]));
export const telemetryFieldNames = new Set(fields.map((field) => field.name));

function parseSchemaValue(value: string, type: TelemetryFieldType): number | boolean | string {
  const trimmed = value.trim();
  if (type === 'boolean') return ['1', 'true', 'yes', 'on'].includes(trimmed.toLowerCase());
  if (type === 'number') {
    const numeric = Number(trimmed);
    return trimmed !== '' && Number.isFinite(numeric) ? numeric : 0;
  }
  return trimmed;
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

  return data;
}

export function hasCanonicalTelemetryFields(value: unknown): value is CanonicalTelemetry {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return fields.some((field) => data[field.name] !== undefined && data[field.name] !== null);
}

export function selectTelemetryPayload(parsed: unknown, raw: unknown): CanonicalTelemetry | null {
  if (hasCanonicalTelemetryFields(parsed)) return parsed;
  return parseCompactTelemetry(raw);
}
