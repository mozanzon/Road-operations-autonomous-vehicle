import React, { useMemo, useState } from 'react';
import { BarChart2, Calendar, Download, FileText, TestTube2, Trash2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useRobot, ReportEvent, ReportSession } from '../../context/RobotContext';
import { useTheme } from '../../context/ThemeContext';

const EGYPT_TIME_ZONE = 'Africa/Cairo';

export function ReportingTab() {
  const { reportEvents, detections, reportSessions, activeSession, flushReportData } = useRobot();
  const { isDark } = useTheme();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sessionFilter, setSessionFilter] = useState('all');

  const selectedSessions = useMemo(() => {
    if (sessionFilter === 'all') return reportSessions;
    if (sessionFilter === 'active') return activeSession ? [activeSession] : [];
    return reportSessions.filter((session) => session.id === sessionFilter);
  }, [activeSession, reportSessions, sessionFilter]);

  const selectedSessionIds = useMemo(() => new Set(selectedSessions.map((session) => session.id)), [selectedSessions]);

  const filteredEvents = useMemo(() => {
    return reportEvents.filter((event) => {
      const day = egyptDateKey(event.timestamp);
      if (dateFrom && day < dateFrom) return false;
      if (dateTo && day > dateTo) return false;
      if (sessionFilter === 'all') return true;
      return Boolean(event.sessionId && selectedSessionIds.has(event.sessionId));
    });
  }, [dateFrom, dateTo, reportEvents, selectedSessionIds, sessionFilter]);

  const summary = useMemo(() => {
    const commands = filteredEvents.filter((event) => event.kind === 'command').length;
    const readings = filteredEvents.filter((event) => event.kind === 'telemetry').length;
    const sessionEvents = filteredEvents.filter((event) => event.kind === 'session').length;
    const potholes = filteredEvents.filter((event) => event.label === 'pothole').length;
    const cracks = filteredEvents.filter((event) => event.label === 'crack').length;
    const manual = filteredEvents.filter((event) => event.kind === 'manual-reading').length;
    const tests = filteredEvents.filter((event) => event.source === 'test').length;
    return { commands, readings, sessionEvents, potholes, cracks, manual, tests };
  }, [filteredEvents]);

  const chartData = [
    { name: 'Commands', count: summary.commands },
    { name: 'Readings', count: summary.readings },
    { name: 'Potholes', count: summary.potholes },
    { name: 'Cracks', count: summary.cracks },
    { name: 'Manual', count: summary.manual },
    { name: 'Test', count: summary.tests },
  ];

  const exportWorkbook = () => {
    const workbook = buildWorkbook(filteredEvents, selectedSessions, summary);
    downloadBlob(workbook, `roboscan-${exportScopeName(sessionFilter, activeSession)}-${egyptFilenameStamp(Date.now())}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  };

  const exportTextReport = () => {
    const lines = [
      'ROBOSCAN REAL RUN REPORT',
      '='.repeat(32),
      `Generated: ${formatEgyptDateTime(Date.now())} Egypt time`,
      `Session scope: ${sessionLabel(sessionFilter, activeSession)}`,
      `Events: ${filteredEvents.length}`,
      `Commands: ${summary.commands}`,
      `Readings: ${summary.readings}`,
      `Session events: ${summary.sessionEvents}`,
      `Potholes: ${summary.potholes}`,
      `Cracks: ${summary.cracks}`,
      `Manual readings: ${summary.manual}`,
      `Test records: ${summary.tests}`,
      '',
      ...filteredEvents.map(formatEvent),
    ];
    downloadBlob(lines.join('\n'), `roboscan-${exportScopeName(sessionFilter, activeSession)}-${egyptFilenameStamp(Date.now())}.txt`, 'text/plain');
  };

  const handleFlushRecordings = () => {
    const confirmed = window.confirm('Flush all saved report recordings, sessions, and detection pins? This cannot be undone.');
    if (!confirmed) return;
    flushReportData();
    setSessionFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-200">
            <BarChart2 className="h-4 w-4 text-amber-400" /> Session Recorder
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <select value={sessionFilter} onChange={(event) => setSessionFilter(event.target.value)} className="rounded border border-slate-600 bg-slate-800 px-2 py-2 text-xs font-mono text-slate-300 focus:border-amber-500 focus:outline-none">
              <option value="all">All sessions</option>
              <option value="active" disabled={!activeSession}>Active session</option>
              {reportSessions.map((session) => (
                <option key={session.id} value={session.id}>{session.id}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-slate-300 focus:border-amber-500 focus:outline-none" />
              <span>to</span>
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-slate-300 focus:border-amber-500 focus:outline-none" />
            </div>
            <button onClick={exportWorkbook} className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-mono text-slate-300 hover:bg-slate-700">
              <Download className="h-3.5 w-3.5" /> XLSX
            </button>
            <button onClick={exportTextReport} className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-mono text-slate-300 hover:bg-slate-700">
              <FileText className="h-3.5 w-3.5" /> Report
            </button>
            <button
              onClick={handleFlushRecordings}
              disabled={reportEvents.length === 0 && reportSessions.length === 0 && detections.length === 0 && !activeSession}
              className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-mono text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" /> Flush recordings
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Summary label="Events" value={filteredEvents.length} isDark={isDark} accent={isDark ? 'border-slate-500/50 bg-slate-800/80' : 'border-slate-500 bg-slate-600'} color="text-white" labelColor="text-white" />
        <Summary label="Commands" value={summary.commands} isDark={isDark} accent={isDark ? 'border-sky-500/40 bg-sky-500/15' : 'border-slate-500 bg-slate-600'} color="text-white" labelColor="text-white" />
        <Summary label="Readings" value={summary.readings} isDark={isDark} accent={isDark ? 'border-cyan-500/40 bg-cyan-500/15' : 'border-slate-500 bg-slate-600'} color="text-white" labelColor="text-white" />
        <Summary label="Potholes" value={summary.potholes} isDark={isDark} accent={isDark ? 'border-orange-500/40 bg-orange-500/15' : 'border-slate-500 bg-slate-600'} color="text-white" labelColor="text-white" />
        <Summary label="Cracks" value={summary.cracks} isDark={isDark} accent={isDark ? 'border-yellow-500/40 bg-yellow-500/15' : 'border-slate-500 bg-slate-600'} color="text-white" labelColor="text-white" />
        <Summary label="Manual" value={summary.manual} isDark={isDark} accent={isDark ? 'border-blue-500/40 bg-blue-500/15' : 'border-slate-500 bg-slate-600'} color="text-white" labelColor="text-white" />
        <Summary label="Test" value={summary.tests} isDark={isDark} accent={isDark ? 'border-fuchsia-500/40 bg-fuchsia-500/15' : 'border-slate-500 bg-slate-600'} color="text-white" labelColor="text-white" />
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5">
        <div className="mb-3 text-xs font-mono uppercase tracking-wider text-slate-400">Session Activity Summary</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 2, right: 4, bottom: 2, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 6, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/50">
                {['Egypt Time', 'Kind', 'Label', 'Session', 'Source', 'Location', 'Sensors', 'Details'].map((header) => (
                  <th key={header} className="whitespace-nowrap px-4 py-3 text-left font-semibold uppercase tracking-wider text-slate-400">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id} className="border-b border-slate-700/30">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">{formatEgyptDateTime(event.timestamp)}</td>
                  <td className="px-4 py-3 text-slate-300">{event.kind}</td>
                  <td className="px-4 py-3 text-amber-400">{event.label}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">{event.sessionId ?? ''}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 ${event.source === 'test' ? 'border-purple-500/40 bg-purple-500/10 text-purple-300' : 'border-slate-600 bg-slate-800 text-slate-300'}`}>
                      {event.source === 'test' ? <TestTube2 className="h-3 w-3" /> : null}
                      {event.source}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">{event.gps.lat.toFixed(5)}, {event.gps.lng.toFixed(5)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">C {event.gps.heading.toFixed(1)} deg · V {event.encoders.linearVelocity.toFixed(2)} m/s</td>
                  <td className="px-4 py-3 text-slate-400">{event.details ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEvents.length === 0 && (
          <div className="py-10 text-center text-xs font-mono text-slate-500">
            No recorded session activity matches the selected session and Egypt-time date range.
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 text-xs font-mono text-slate-500">
        Recorder status: {activeSession ? `running on ${activeSession.id}` : 'idle'}. Commands and readings are only stored while a session is active. Detection cache: {detections.length}. Sessions saved: {reportSessions.length}.
      </div>
    </div>
  );
}

function Summary({
  label,
  value,
  isDark,
  color = 'text-slate-100',
  labelColor = 'text-slate-300',
  accent = 'border-slate-700/60 bg-slate-900/60',
}: {
  label: string;
  value: number;
  isDark: boolean;
  color?: string;
  labelColor?: string;
  accent?: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${accent} ${isDark ? '' : 'shadow-sm'}`}>
      <div className={`text-xs font-mono uppercase tracking-wider ${labelColor}`}>{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function formatEvent(event: ReportEvent) {
  return [
    `${formatEgyptDateTime(event.timestamp)} Egypt | ${event.kind} | ${event.label} | ${event.source}`,
    `Session: ${event.sessionId ?? ''}`,
    `GPS: ${event.gps.lat.toFixed(6)}, ${event.gps.lng.toFixed(6)} fix=${event.gps.fix} accuracy=${event.gps.accuracy.toFixed(2)}m`,
    `Compass: ${event.gps.heading.toFixed(2)} deg | Velocity: ${event.encoders.linearVelocity.toFixed(2)} m/s`,
    event.details ? `Details: ${event.details}` : '',
    '-'.repeat(32),
  ].filter(Boolean).join('\n');
}

function buildWorkbook(events: ReportEvent[], sessions: ReportSession[], summary: { commands: number; readings: number; sessionEvents: number; potholes: number; cracks: number; manual: number; tests: number }) {
  const overviewRows = [
    ['Metric', 'Value'],
    ['Generated Egypt Time', formatEgyptDateTime(Date.now())],
    ['Events', events.length],
    ['Commands', summary.commands],
    ['Readings', summary.readings],
    ['Session events', summary.sessionEvents],
    ['Potholes', summary.potholes],
    ['Cracks', summary.cracks],
    ['Manual readings', summary.manual],
    ['Test records', summary.tests],
    ['Sessions in export', sessions.length],
    ['GPS fix rows', events.filter((event) => event.gps.fix).length],
    ['Plot active rows', events.filter((event) => event.plotActive).length],
    ['Total moved distance max', Math.max(0, ...events.map((event) => event.totalMovedDistance ?? 0))],
    [],
    ['Session ID', 'Mode', 'Started Egypt Time', 'Ended Egypt Time', 'Duration s'],
    ...sessions.map((session) => [
      session.id,
      session.mode,
      formatEgyptDateTime(session.startedAt),
      session.endedAt ? formatEgyptDateTime(session.endedAt) : '',
      session.endedAt ? Math.round((session.endedAt - session.startedAt) / 1000) : '',
    ]),
  ];
  const detailHeaders = [
    'Egypt Timestamp', 'Unix Timestamp ms', 'Session ID', 'Event Type', 'Label', 'Message', 'Source', 'Mode',
    'GPS Fix', 'Latitude', 'Longitude', 'Compass Heading', 'GPS Course', 'GPS Speed', 'GPS Accuracy',
    'IMU Roll', 'IMU Pitch', 'IMU Yaw', 'Accel X', 'Accel Y', 'Accel Z', 'Gyro X', 'Gyro Y', 'Gyro Z',
    'Left Ticks', 'Right Ticks', 'Left Meters', 'Right Meters', 'Linear Speed',
    'Motor Motion', 'Drive Moving', 'Drive Speed PWM', 'Active Drive PWM', 'Left PWM', 'Right PWM',
    'Waypoint Active', 'Waypoint Index', 'Waypoint Count', 'Target Bearing', 'Target Distance (m)', 'Heading Error (deg)',
    'Heading Adjusting', 'Turn Active', 'Turn Expected Ticks', 'Encoder Error', 'Encoder PID P', 'Encoder PID I', 'Encoder PID D', 'Encoder PID Output',
    'Plot Mode', 'Plot Active', 'Dash Length (m)', 'Gap Length (m)', 'Plot Target (m)', 'Plotted Dashed (m)', 'Plotted Undashed (m)',
    'Tracking Error (m)', 'Path Position', 'Total Moved Distance', 'Confidence', 'Raw Telemetry',
  ];
  const detailRows = [
    detailHeaders,
    ...events.map((event) => [
      formatEgyptDateTime(event.timestamp),
      event.timestamp,
      event.sessionId ?? '',
      event.kind,
      event.label,
      event.details || event.label,
      event.source,
      event.mode ?? '',
      event.gps.fix ? 1 : 0,
      event.gps.lat,
      event.gps.lng,
      event.gps.heading,
      valueFromTelemetry(event, 'gps_course'),
      event.gps.speed,
      event.gps.accuracy,
      event.imu.roll,
      event.imu.pitch,
      event.imu.yaw,
      event.imu.accelX,
      event.imu.accelY,
      event.imu.accelZ,
      event.imu.gyroX,
      event.imu.gyroY,
      event.imu.gyroZ,
      event.encoders.leftTicks,
      event.encoders.rightTicks,
      valueFromTelemetry(event, 'left_m'),
      valueFromTelemetry(event, 'right_m'),
      event.encoders.linearVelocity,
      event.motorMotion ?? '',
      valueFromTelemetry(event, 'drive_moving'),
      valueFromTelemetry(event, 'drive_speed'),
      valueFromTelemetry(event, 'active_drive_speed'),
      valueFromTelemetry(event, 'left_pwm'),
      valueFromTelemetry(event, 'right_pwm'),
      valueFromTelemetry(event, 'wp_active'),
      valueFromTelemetry(event, 'wp_index'),
      valueFromTelemetry(event, 'wp_count'),
      valueFromTelemetry(event, 'target_bearing'),
      valueFromTelemetry(event, 'target_distance_m'),
      valueFromTelemetry(event, 'heading_error'),
      valueFromTelemetry(event, 'heading_adjusting'),
      valueFromTelemetry(event, 'turn_active'),
      valueFromTelemetry(event, 'turn_expected_ticks'),
      valueFromTelemetry(event, 'encoder_error'),
      valueFromTelemetry(event, 'encoder_pid_kp'),
      valueFromTelemetry(event, 'encoder_pid_ki'),
      valueFromTelemetry(event, 'encoder_pid_kd'),
      valueFromTelemetry(event, 'encoder_pid_output'),
      event.plotMode ?? '',
      event.plotActive ? 1 : 0,
      event.dashLengthM ?? '',
      event.gapLengthM ?? '',
      valueFromTelemetry(event, 'plot_target_m'),
      event.plottedDashedM ?? '',
      event.plottedUndashedM ?? '',
      event.trackingErrorM ?? '',
      event.pathPosition ?? '',
      event.totalMovedDistance ?? '',
      event.confidence ?? '',
      event.arduino ? JSON.stringify(event.arduino) : '',
    ]),
  ];
  return createXlsx([
    { name: 'Overview', rows: overviewRows },
    { name: 'Details', rows: detailRows },
  ]);
}

function valueFromTelemetry(event: ReportEvent, key: string) {
  const value = event.arduino?.[key];
  return typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean' ? value : '';
}

function egyptDateKey(timestamp: number) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: EGYPT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(timestamp));
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function formatEgyptDateTime(timestamp: number) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: EGYPT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
}

function egyptFilenameStamp(timestamp: number) {
  const date = egyptDateKey(timestamp);
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: EGYPT_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(timestamp)).replace(/:/g, '');
  return `${date}-${time}-egypt`;
}

function sessionLabel(value: string, activeSession: ReportSession | null) {
  if (value === 'all') return 'All sessions';
  if (value === 'active') return activeSession?.id ?? 'Active session';
  return value;
}

function exportScopeName(value: string, activeSession: ReportSession | null) {
  return sessionLabel(value, activeSession).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || 'session';
}

function createXlsx(sheets: { name: string; rows: unknown[][] }[]) {
  const files: Record<string, string | Uint8Array> = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((sheet, index) => `<sheet name="${xmlEscape(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join('')}</sheets></workbook>`,
    'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join('')}</Relationships>`,
  };
  sheets.forEach((sheet, index) => {
    files[`xl/worksheets/sheet${index + 1}.xml`] = sheetXml(sheet.rows);
  });
  return zipStore(files);
}

function sheetXml(rows: unknown[][]) {
  return `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((cell, colIndex) => cellXml(cell, rowIndex + 1, colIndex)).join('')}</row>`).join('')}</sheetData></worksheet>`;
}

function cellXml(value: unknown, row: number, col: number) {
  const ref = `${columnName(col)}${row}`;
  if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${ref}"><v>${value}</v></c>`;
  return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(value ?? '')}</t></is></c>`;
}

function columnName(index: number) {
  let name = '';
  let current = index + 1;
  while (current > 0) {
    const mod = (current - 1) % 26;
    name = String.fromCharCode(65 + mod) + name;
    current = Math.floor((current - mod) / 26);
  }
  return name;
}

function xmlEscape(value: unknown) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function zipStore(files: Record<string, string | Uint8Array>) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  Object.entries(files).forEach(([name, content]) => {
    const nameBytes = encoder.encode(name);
    const data = typeof content === 'string' ? encoder.encode(content) : content;
    const crc = crc32(data);
    const local = zipHeader(0x04034b50, nameBytes, data.length, crc, offset);
    localParts.push(local, nameBytes, data);
    const central = zipHeader(0x02014b50, nameBytes, data.length, crc, offset);
    centralParts.push(central, nameBytes);
    offset += local.length + nameBytes.length + data.length;
  });
  const centralOffset = offset;
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, Object.keys(files).length, true);
  view.setUint16(10, Object.keys(files).length, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  return new Blob([...localParts, ...centralParts, end]);
}

function zipHeader(signature: number, nameBytes: Uint8Array, size: number, crc: number, offset: number) {
  const isCentral = signature === 0x02014b50;
  const bytes = new Uint8Array(isCentral ? 46 : 30);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, signature, true);
  if (isCentral) view.setUint16(4, 20, true);
  view.setUint16(isCentral ? 6 : 4, 20, true);
  view.setUint32(isCentral ? 16 : 14, crc, true);
  view.setUint32(isCentral ? 20 : 18, size, true);
  view.setUint32(isCentral ? 24 : 22, size, true);
  view.setUint16(isCentral ? 28 : 26, nameBytes.length, true);
  if (isCentral) view.setUint32(42, offset, true);
  return bytes;
}

function crc32(data: Uint8Array) {
  let crc = -1;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function downloadBlob(content: BlobPart, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
