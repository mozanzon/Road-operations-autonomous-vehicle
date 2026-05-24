import React from 'react';
import { useRobot } from '../../context/RobotContext';

export function DashboardTab() {
  const { connectionStatus, gps, cameraLive, modelStatus, potholeCount, crackCount } = useRobot();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <StatusCard label="Connection" value={connectionStatus.toUpperCase()} />
      <StatusCard label="Camera" value={cameraLive ? 'LIVE' : 'OFFLINE'} />
      <StatusCard label="Model" value={modelStatus.toUpperCase()} />
      <StatusCard label="GPS" value={gps.fix ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : 'EGYPT DEFAULT'} />
      <StatusCard label="Potholes" value={String(potholeCount)} />
      <StatusCard label="Cracks" value={String(crackCount)} />
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4">
      <div className="text-xs font-mono uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-mono text-slate-100">{value}</div>
    </div>
  );
}
