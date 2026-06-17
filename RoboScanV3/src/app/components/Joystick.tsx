import React, { useRef, useCallback, useEffect, useState } from 'react';

interface JoystickProps {
  size?: number;
  onChange?: (linear: number, angular: number) => void;
  deadzone?: number;
  speedLimit?: number;
}

export function Joystick({ size = 160, onChange, deadzone = 0.08, speedLimit = 1 }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const activePointerId = useRef<number | null>(null);

  const radius = size / 2;
  const handleRadius = size * 0.18;
  const maxDist = radius - handleRadius - 4;

  const computeOutput = useCallback((x: number, y: number) => {
    const dist = Math.sqrt(x * x + y * y) / maxDist;
    if (dist < deadzone) return { linear: 0, angular: 0 };
    const linear = -y / maxDist * speedLimit;
    const angular = x / maxDist * speedLimit;
    return {
      linear: Math.max(-speedLimit, Math.min(speedLimit, linear)),
      angular: Math.max(-speedLimit, Math.min(speedLimit, angular)),
    };
  }, [maxDist, deadzone, speedLimit]);

  const moveHandle = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxDist) {
      dx = dx / dist * maxDist;
      dy = dy / dist * maxDist;
    }
    setPos({ x: dx, y: dy });
    const out = computeOutput(dx, dy);
    onChange?.(out.linear, out.angular);
  }, [maxDist, computeOutput, onChange]);

  const releaseHandle = useCallback(() => {
    setDragging(false);
    setPos({ x: 0, y: 0 });
    activePointerId.current = null;
    onChange?.(0, 0);
  }, [onChange]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      if (activePointerId.current !== null && e.pointerId !== activePointerId.current) return;
      moveHandle(e.clientX, e.clientY);
    };
    const onUp = (e: PointerEvent) => {
      if (activePointerId.current !== null && e.pointerId !== activePointerId.current) return;
      releaseHandle();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, moveHandle, releaseHandle]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;
    setDragging(true);
    moveHandle(e.clientX, e.clientY);
  };

  const output = computeOutput(pos.x, pos.y);

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div
        ref={containerRef}
        className="relative rounded-full cursor-pointer touch-none"
        style={{
          width: size, height: size,
          background: 'radial-gradient(circle, rgba(51,65,85,0.9) 0%, rgba(15,23,42,0.95) 100%)',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 2px rgba(100,116,139,0.3)',
        }}
        onPointerDown={handlePointerDown}
      >
        {/* Guide circles */}
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={radius} cy={radius} r={maxDist} fill="none" stroke="rgba(100,116,139,0.2)" strokeWidth={1} strokeDasharray="4 4" />
          <circle cx={radius} cy={radius} r={maxDist * 0.5} fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth={1} strokeDasharray="3 3" />
          {/* Crosshairs */}
          <line x1={radius} y1={radius - maxDist} x2={radius} y2={radius + maxDist} stroke="rgba(100,116,139,0.15)" strokeWidth={1} />
          <line x1={radius - maxDist} y1={radius} x2={radius + maxDist} y2={radius} stroke="rgba(100,116,139,0.15)" strokeWidth={1} />
        </svg>
        {/* Handle */}
        <div
          className="absolute rounded-full transition-shadow"
          style={{
            width: handleRadius * 2, height: handleRadius * 2,
            left: radius + pos.x - handleRadius,
            top: radius + pos.y - handleRadius,
            background: dragging
              ? 'radial-gradient(circle, #f59e0b 0%, #d97706 100%)'
              : 'radial-gradient(circle, #64748b 0%, #334155 100%)',
            boxShadow: dragging
              ? '0 0 16px rgba(245,158,11,0.6), 0 0 4px rgba(245,158,11,0.4)'
              : '0 2px 8px rgba(0,0,0,0.5)',
            transition: dragging ? 'none' : 'left 0.15s ease, top 0.15s ease',
          }}
        />
      </div>
      {/* Output values */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">Linear</div>
          <div className="text-amber-400 font-mono text-sm">{output.linear.toFixed(2)} m/s</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">Angular</div>
          <div className="text-amber-400 font-mono text-sm">{output.angular.toFixed(2)} r/s</div>
        </div>
      </div>
    </div>
  );
}
