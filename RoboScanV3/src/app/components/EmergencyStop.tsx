import React, { useState } from 'react';
import { AlertOctagon } from 'lucide-react';
import { useRobot } from '../context/RobotContext';

export function EmergencyStop() {
  const { emergencyStop, connectionStatus } = useRobot();
  const [triggered, setTriggered] = useState(false);

  const handleStop = () => {
    emergencyStop();
    setTriggered(true);
    setTimeout(() => setTriggered(false), 2000);
  };

  return (
    <button
      onClick={handleStop}
      title="Emergency Stop — Halt all motion immediately"
      aria-label="Emergency Stop"
      className="fixed bottom-6 right-6 z-[9999] group flex flex-col items-center justify-center gap-1 rounded-full transition-all duration-150 active:scale-95 focus:outline-none"
      style={{
        width: 72, height: 72,
        background: triggered
          ? 'radial-gradient(circle, #7f1d1d, #450a0a)'
          : 'radial-gradient(circle, #ef4444, #b91c1c)',
        boxShadow: triggered
          ? '0 0 0 4px #ef4444, 0 0 32px rgba(239,68,68,0.6), 0 4px 16px rgba(0,0,0,0.5)'
          : '0 0 0 3px #fca5a5, 0 0 20px rgba(239,68,68,0.4), 0 4px 16px rgba(0,0,0,0.5)',
      }}
    >
      <AlertOctagon className="h-6 w-6 text-white" strokeWidth={2.5} />
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', color: 'white', fontFamily: 'monospace', lineHeight: 1 }}>
        {triggered ? 'HALTED' : 'E-STOP'}
      </span>
      {connectionStatus !== 'connected' && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500" title="Disconnected" />
        </span>
      )}
    </button>
  );
}
