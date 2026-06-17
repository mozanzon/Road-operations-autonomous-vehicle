import React from 'react';

interface CompassProps {
  heading: number; // degrees, 0 = North
  size?: number;
}

export function Compass({ heading, size = 140 }: CompassProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const innerR = r - 14;

  // Generate tick marks
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const angle = (i * 10 * Math.PI) / 180;
    const isMajor = i % 9 === 0;
    const start = isMajor ? innerR - 8 : innerR - 4;
    return {
      x1: cx + Math.sin(angle) * innerR,
      y1: cy - Math.cos(angle) * innerR,
      x2: cx + Math.sin(angle) * start,
      y2: cy - Math.cos(angle) * start,
      major: isMajor,
    };
  });

  const cardinalPositions = [
    { label: 'N', angle: 0 }, { label: 'E', angle: 90 },
    { label: 'S', angle: 180 }, { label: 'W', angle: 270 },
  ].map(({ label, angle }) => {
    const a = (angle * Math.PI) / 180;
    const labelR = innerR - 20;
    return {
      label,
      x: cx + Math.sin(a) * labelR,
      y: cy - Math.cos(a) * labelR + 4,
      isNorth: label === 'N',
    };
  });

  const needleAngle = heading;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none">
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke="currentColor" strokeOpacity={t.major ? 0.5 : 0.25} strokeWidth={t.major ? 1.5 : 0.8} />
      ))}

      {/* Cardinal labels */}
      {cardinalPositions.map(({ label, x, y, isNorth }) => (
        <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fill={isNorth ? '#f59e0b' : 'currentColor'}
          fillOpacity={isNorth ? 1 : 0.5}
          fontSize={isNorth ? 11 : 9}
          fontWeight={isNorth ? 700 : 400}
          fontFamily="monospace">
          {label}
        </text>
      ))}

      {/* Rotating needle group */}
      <g transform={`rotate(${needleAngle}, ${cx}, ${cy})`}>
        {/* North (red) half */}
        <polygon
          points={`${cx},${cy - innerR + 22} ${cx - 5},${cy + 4} ${cx},${cy - 6} ${cx + 5},${cy + 4}`}
          fill="#ef4444" fillOpacity={0.9}
        />
        {/* South (gray) half */}
        <polygon
          points={`${cx},${cy + innerR - 22} ${cx - 5},${cy - 4} ${cx},${cy + 6} ${cx + 5},${cy - 4}`}
          fill="currentColor" fillOpacity={0.3}
        />
      </g>

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={4} fill="#f59e0b" />

      {/* Heading text */}
      <text x={cx} y={cy + r + 14} textAnchor="middle" fill="#f59e0b"
        fontSize={10} fontFamily="monospace" fontWeight={600}>
        {Math.round(heading).toString().padStart(3, '0')}°
      </text>
    </svg>
  );
}
