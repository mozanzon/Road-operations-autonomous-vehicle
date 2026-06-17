import React from 'react';
import { Wifi, WifiOff, Loader2, Server, Clock, Battery, Activity, Radio } from 'lucide-react';
import { useRobot } from '../../context/RobotContext';
import { useTheme } from '../../context/ThemeContext';

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ConnectionTab() {
  const {
    connectionStatus, connectionIp, setConnectionIp,
    connect, disconnect, hostname, uptime, battery, latency,
  } = useRobot();
  const { isDark } = useTheme();

  const statusConfig = {
    connected:    { color: 'text-green-600',  bg: 'bg-green-500/10 border-green-500/30',  dot: 'bg-green-500',  label: 'CONNECTED',    Icon: Wifi },
    disconnected: { color: 'text-red-500',    bg: 'bg-red-500/10 border-red-500/30',      dot: 'bg-red-500',    label: 'DISCONNECTED', Icon: WifiOff },
    attempting:   { color: 'text-amber-500',  bg: 'bg-amber-500/10 border-amber-500/30',  dot: 'bg-amber-500',  label: 'ATTEMPTING…',  Icon: Loader2 },
  }[connectionStatus];

  const latencyColor = latency < 20 ? 'text-green-600' : latency < 50 ? 'text-amber-500' : 'text-red-500';
  const card  = isDark ? 'bg-slate-900/50 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm';
  const title = isDark ? 'text-slate-300' : 'text-slate-700';
  const label = isDark ? 'text-slate-400' : 'text-slate-500';
  const hint  = isDark ? 'text-slate-500' : 'text-slate-500';
  const input = isDark
    ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400';
  const trackBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300';

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-2">
      {/* Status Banner */}
      <div className={`flex items-center gap-3 rounded-lg border px-5 py-4 ${statusConfig.bg}`}>
        <span className="relative flex h-3 w-3">
          {connectionStatus === 'connected' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${statusConfig.dot}`} />
        </span>
        <statusConfig.Icon className={`h-5 w-5 ${statusConfig.color} ${connectionStatus === 'attempting' ? 'animate-spin' : ''}`} />
        <span className={`font-mono font-bold tracking-widest text-sm ${statusConfig.color}`}>{statusConfig.label}</span>
        {connectionStatus === 'connected' && (
          <span className={`ml-auto font-mono text-sm ${latencyColor}`}>{latency} ms</span>
        )}
      </div>

      {/* Connection Form */}
      <div className={`rounded-xl border ${card} p-6 space-y-5`}>
        <h3 className={`text-sm font-semibold uppercase tracking-widest flex items-center gap-2 ${title}`}>
          <Radio className="h-4 w-4 text-amber-400" />
          Raspberry Pi Connection
        </h3>
        <div className="space-y-3">
          <label className={`text-xs font-mono uppercase tracking-wider block ${label}`}>IP Address</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={connectionIp}
              onChange={e => setConnectionIp(e.target.value)}
              placeholder="192.168.1.100"
              disabled={connectionStatus !== 'disconnected'}
              className={`flex-1 border rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${input}`}
            />
            {connectionStatus === 'disconnected' ? (
              <button onClick={connect}
                className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm font-mono tracking-wider transition-all active:scale-95">
                CONNECT
              </button>
            ) : connectionStatus === 'attempting' ? (
              <button disabled className="px-6 py-2.5 rounded-lg bg-amber-500/40 text-slate-900 font-semibold text-sm font-mono tracking-wider cursor-not-allowed flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> CONNECTING
              </button>
            ) : (
              <button onClick={disconnect}
                className="px-6 py-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-500 font-semibold text-sm font-mono tracking-wider transition-all active:scale-95">
                DISCONNECT
              </button>
            )}
          </div>
        </div>
        <p className={`text-xs font-mono ${hint}`}>
          Connects to the Raspberry Pi bridge via WebSocket on port 8765. Ensure the robot is on the same local network.
        </p>
      </div>

      {/* System Info */}
      {connectionStatus === 'connected' && (
        <div className={`rounded-xl border ${card} p-6 space-y-5`}>
          <h3 className={`text-sm font-semibold uppercase tracking-widest flex items-center gap-2 ${title}`}>
            <Server className="h-4 w-4 text-amber-400" />
            System Info
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow isDark={isDark} icon={<Server className="h-4 w-4" />}   label="Hostname" value={hostname} />
            <InfoRow isDark={isDark} icon={<Activity className="h-4 w-4" />} label="Latency"  value={`${latency} ms`} color={latencyColor} />
            <InfoRow isDark={isDark} icon={<Clock className="h-4 w-4" />}    label="Uptime"   value={formatUptime(uptime)} mono />
            <InfoRow isDark={isDark} icon={<Battery className="h-4 w-4" />}  label="Battery"  value={`${battery.toFixed(1)}%`}
              color={battery > 40 ? 'text-green-600' : battery > 20 ? 'text-amber-500' : 'text-red-500'} />
          </div>
          <div>
            <div className={`flex justify-between text-xs font-mono mb-1.5 ${hint}`}>
              <span>Battery Level</span>
              <span className={battery > 40 ? 'text-green-600' : battery > 20 ? 'text-amber-500' : 'text-red-500'}>{battery.toFixed(1)}%</span>
            </div>
            <div className={`h-2.5 rounded-full overflow-hidden border ${trackBg}`}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${battery}%`, background: battery > 40 ? '#22c55e' : battery > 20 ? '#f59e0b' : '#ef4444' }} />
            </div>
          </div>
          <div>
            <div className={`flex justify-between text-xs font-mono mb-1.5 ${hint}`}>
              <span>Network Latency</span>
              <span className={latencyColor}>{latency} ms</span>
            </div>
            <div className={`h-2.5 rounded-full overflow-hidden border ${trackBg}`}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (latency / 200) * 100)}%`, background: latency < 20 ? '#22c55e' : latency < 50 ? '#f59e0b' : '#ef4444' }} />
            </div>
          </div>
        </div>
      )}

      {connectionStatus === 'disconnected' && (
        <div className={`rounded-xl border p-6 text-center text-sm font-mono ${isDark ? 'border-slate-700/30 bg-slate-900/20 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
          Not connected. Enter the Raspberry Pi IP address and click CONNECT.
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, mono, color, isDark }: {
  icon: React.ReactNode; label: string; value: string; mono?: boolean; color?: string; isDark: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${isDark ? 'bg-slate-800/50 border-slate-700/40' : 'bg-slate-100 border-slate-200'}`}>
      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{icon}</span>
      <div className="min-w-0">
        <div className={`text-xs uppercase tracking-wider font-mono ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{label}</div>
        <div className={`text-sm truncate ${mono ? 'font-mono' : ''} ${color || (isDark ? 'text-slate-100' : 'text-slate-900')}`}>{value}</div>
      </div>
    </div>
  );
}
