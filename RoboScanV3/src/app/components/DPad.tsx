import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square } from 'lucide-react';

type Direction = 'forward' | 'backward' | 'left' | 'right' | null;

interface DPadProps {
  onChange: (linear: number, angular: number) => void;
  speedLimit?: number;
  toggleMode?: boolean;
}

const LINEAR_SPEED = 1.0;
const TURN_IN_PLACE_SPEED = 0.1;

function dirToVelocity(dir: Direction, speed: number): [number, number] {
  switch (dir) {
    case 'forward':  return [speed * LINEAR_SPEED, 0];
    case 'backward': return [-speed * LINEAR_SPEED, 0];
    case 'left':     return [0, TURN_IN_PLACE_SPEED];
    case 'right':    return [0, -TURN_IN_PLACE_SPEED];
    default:         return [0, 0];
  }
}

export function DPad({ onChange, speedLimit = 1, toggleMode = false }: DPadProps) {
  const [activeDir, setActiveDir] = useState<Direction>(null);
  const prevDir = useRef<Direction>(null);

  const emit = useCallback((dir: Direction) => {
    const [lin, ang] = dirToVelocity(dir, speedLimit);
    onChange(lin, ang);
  }, [onChange, speedLimit]);

  // Hold mode: pointer events
  const handlePointerDown = (dir: Direction) => (e: React.PointerEvent) => {
    if (toggleMode) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveDir(dir);
    emit(dir);
  };
  const handlePointerUp = () => {
    if (toggleMode) return;
    setActiveDir(null);
    onChange(0, 0);
  };

  // Toggle mode: click events
  const handleClick = (dir: Direction) => () => {
    if (!toggleMode) return;
    setActiveDir(prev => {
      const next = prev === dir ? null : dir;
      emit(next);
      return next;
    });
  };

  // Keyboard support
  useEffect(() => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: 'forward', w: 'forward', W: 'forward',
      ArrowDown: 'backward', s: 'backward', S: 'backward',
      ArrowLeft: 'left', a: 'left', A: 'left',
      ArrowRight: 'right', d: 'right', D: 'right',
    };
    const onDown = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (!dir) return;
      if (toggleMode) return;
      if (prevDir.current === dir) return;
      prevDir.current = dir;
      setActiveDir(dir);
      emit(dir);
    };
    const onUp = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (!dir) return;
      if (toggleMode) return;
      prevDir.current = null;
      setActiveDir(null);
      onChange(0, 0);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [toggleMode, emit, onChange]);

  const btnCls = (dir: Direction) =>
    `flex items-center justify-center rounded-xl border-2 transition-all active:scale-95 select-none cursor-pointer touch-none ${
      activeDir === dir
        ? 'bg-amber-500 border-amber-400 text-slate-900 shadow-lg shadow-amber-500/40'
        : 'bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
    }`;

  const stopCls = `flex items-center justify-center rounded-xl border-2 transition-all active:scale-95 cursor-pointer select-none ${
    activeDir === null && !toggleMode
      ? 'bg-red-500/20 border-red-500/50 text-red-400'
      : 'bg-slate-800/80 border-slate-600 text-slate-500 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400'
  }`;

  const commonEvents = (dir: Direction) => ({
    onPointerDown: handlePointerDown(dir),
    onPointerUp: handlePointerUp,
    onPointerLeave: handlePointerUp,
    onClick: handleClick(dir),
  });

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 56px)', gridTemplateRows: 'repeat(3, 56px)' }}>
        {/* Top row */}
        <div />
        <div className={btnCls('forward')} {...commonEvents('forward')}>
          <ArrowUp className="h-6 w-6" />
        </div>
        <div />
        {/* Middle row */}
        <div className={btnCls('left')} {...commonEvents('left')}>
          <ArrowLeft className="h-6 w-6" />
        </div>
        <div
          className={stopCls}
          onClick={() => { setActiveDir(null); onChange(0, 0); }}
        >
          <Square className="h-5 w-5" />
        </div>
        <div className={btnCls('right')} {...commonEvents('right')}>
          <ArrowRight className="h-6 w-6" />
        </div>
        {/* Bottom row */}
        <div />
        <div className={btnCls('backward')} {...commonEvents('backward')}>
          <ArrowDown className="h-6 w-6" />
        </div>
        <div />
      </div>
      {/* Output labels */}
      <div className="grid grid-cols-2 gap-4 text-center mt-1">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">Linear</div>
          <div className="text-amber-400 font-mono text-sm">
            {dirToVelocity(activeDir, speedLimit)[0].toFixed(2)} m/s
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">Angular</div>
          <div className="text-amber-400 font-mono text-sm">
            {dirToVelocity(activeDir, speedLimit)[1].toFixed(2)} r/s
          </div>
        </div>
      </div>
      {toggleMode && activeDir && (
        <div className="text-xs font-mono text-amber-400 animate-pulse uppercase tracking-widest">
          ● {activeDir.toUpperCase()} — LOCKED
        </div>
      )}
      {!toggleMode && (
        <div className="text-xs font-mono text-slate-600 uppercase tracking-wider">
          Hold to move · W A S D
        </div>
      )}
    </div>
  );
}
