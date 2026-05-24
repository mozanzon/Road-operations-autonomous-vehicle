import React, { useMemo, useState } from 'react';
import { BarChart2, Calendar, Download, FileText, TestTube2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useRobot, ReportEvent } from '../../context/RobotContext';

export function ReportingTab() {
  const { reportEvents, detections } = useRobot();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredEvents = useMemo(() => {
    return reportEvents.filter((event) => {
      const day = new Date(event.timestamp).toISOString().slice(0, 10);
      if (dateFrom && day < dateFrom) return false;
      if (dateTo && day > dateTo) return false;
      return true;
    });
  }, [dateFrom, dateTo, reportEvents]);

  const summary = useMemo(() => {
    const potholes = filteredEvents.filter((event) => event.label === 'pothole').length;
    const cracks = filteredEvents.filter((event) => event.label === 'crack').length;
    const manual = filteredEvents.filter((event) => event.kind === 'manual-reading').length;
    const tests = filteredEvents.filter((event) => event.source === 'test').length;
    return { potholes, cracks, manual, tests };
  }, [filteredEvents]);

  const chartData = [
    { name: 'Potholes', count: summary.potholes },
    { name: 'Cracks', count: summary.cracks },
    { name: 'Manual', count: summary.manual },
    { name: 'Test', count: summary.tests },
  ];

  const exportCSV = () => {
    const rows = [
      ['Timestamp', 'Kind', 'Label', 'Source', 'Confidence', 'Lat', 'Lng', 'Heading', 'Velocity', 'Details'],
      ...filteredEvents.map((event) => [
        new Date(event.timestamp).toISOString(),
        event.kind,
        event.label,
        event.source,
        event.confidence ?? '',
        event.gps.lat,
        event.gps.lng,
        event.gps.heading,
        event.encoders.linearVelocity,
        event.details ?? '',
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
    downloadBlob(csv, `roboscan-report-${Date.now()}.csv`, 'text/csv');
  };

  const exportTextReport = () => {
    const lines = [
      'ROBOSCAN REAL RUN REPORT',
      '='.repeat(32),
      `Generated: ${new Date().toLocaleString()}`,
      `Events: ${filteredEvents.length}`,
      `Potholes: ${summary.potholes}`,
      `Cracks: ${summary.cracks}`,
      `Manual readings: ${summary.manual}`,
      `Test records: ${summary.tests}`,
      '',
      ...filteredEvents.map(formatEvent),
    ];
    downloadBlob(lines.join('\n'), `roboscan-report-${Date.now()}.txt`, 'text/plain');
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-200">
            <BarChart2 className="h-4 w-4 text-amber-400" /> Real Inspection Report
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-slate-300 focus:border-amber-500 focus:outline-none" />
              <span>to</span>
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-slate-300 focus:border-amber-500 focus:outline-none" />
            </div>
            <button onClick={exportCSV} className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-mono text-slate-300 hover:bg-slate-700">
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button onClick={exportTextReport} className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-mono text-slate-300 hover:bg-slate-700">
              <FileText className="h-3.5 w-3.5" /> Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Summary label="Events" value={filteredEvents.length} />
        <Summary label="Potholes" value={summary.potholes} color="text-orange-400" />
        <Summary label="Cracks" value={summary.cracks} color="text-yellow-400" />
        <Summary label="Manual" value={summary.manual} color="text-blue-400" />
        <Summary label="Test" value={summary.tests} color="text-purple-400" />
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5">
        <div className="mb-3 text-xs font-mono uppercase tracking-wider text-slate-400">Event Summary</div>
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
                {['Time', 'Kind', 'Label', 'Source', 'Location', 'Sensors', 'Details'].map((header) => (
                  <th key={header} className="whitespace-nowrap px-4 py-3 text-left font-semibold uppercase tracking-wider text-slate-400">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id} className="border-b border-slate-700/30">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">{new Date(event.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-300">{event.kind}</td>
                  <td className="px-4 py-3 text-amber-400">{event.label}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 ${event.source === 'test' ? 'border-purple-500/40 bg-purple-500/10 text-purple-300' : 'border-slate-600 bg-slate-800 text-slate-300'}`}>
                      {event.source === 'test' ? <TestTube2 className="h-3 w-3" /> : null}
                      {event.source}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">{event.gps.lat.toFixed(5)}, {event.gps.lng.toFixed(5)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">H {event.gps.heading.toFixed(1)} deg · V {event.encoders.linearVelocity.toFixed(2)} m/s</td>
                  <td className="px-4 py-3 text-slate-400">{event.details ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEvents.length === 0 && (
          <div className="py-10 text-center text-xs font-mono text-slate-500">
            No real or test report events recorded yet. Use Record reading or Test application in Operations.
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 text-xs font-mono text-slate-500">
        Current detection cache: {detections.length} items. Test-generated records are visibly marked and exported with source=test.
      </div>
    </div>
  );
}

function Summary({ label, value, color = 'text-slate-100' }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4">
      <div className="text-xs font-mono uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function formatEvent(event: ReportEvent) {
  return [
    `${new Date(event.timestamp).toLocaleString()} | ${event.kind} | ${event.label} | ${event.source}`,
    `GPS: ${event.gps.lat.toFixed(6)}, ${event.gps.lng.toFixed(6)} fix=${event.gps.fix} accuracy=${event.gps.accuracy.toFixed(2)}m`,
    `Heading: ${event.gps.heading.toFixed(2)} deg | Velocity: ${event.encoders.linearVelocity.toFixed(2)} m/s`,
    event.details ? `Details: ${event.details}` : '',
    '-'.repeat(32),
  ].filter(Boolean).join('\n');
}

function csvCell(value: unknown) {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
