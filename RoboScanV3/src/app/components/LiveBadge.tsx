import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LiveBadgeProps {
  live: boolean;
  label?: string;
}

export function LiveBadge({ live, label }: LiveBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      {live ? (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          {label && <span className="text-green-400 text-xs font-mono uppercase tracking-wider">{label || 'LIVE'}</span>}
        </>
      ) : (
        <>
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 animate-pulse" />
          {label && <span className="text-red-500 text-xs font-mono uppercase tracking-wider">NO SIGNAL</span>}
        </>
      )}
    </div>
  );
}
