'use client';

import { useMemo, useId } from 'react';

interface MiniDonutChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export default function MiniDonutChart({
  percentage,
  size = 48,
  strokeWidth = 4,
  color,
}: MiniDonutChartProps) {
  const id = useId();
  const animId = `donut-anim-${id}`;

  const resolvedColor = color ?? (percentage >= 50 ? '#10b981' : '#ef4444');
  const clamped = Math.max(0, Math.min(100, percentage));

  const { radius, circumference, offset } = useMemo(() => {
    const r = (size - strokeWidth) / 2;
    const c = 2 * Math.PI * r;
    const o = c - (clamped / 100) * c;
    return { radius: r, circumference: c, offset: o };
  }, [size, strokeWidth, clamped]);

  const center = size / 2;
  const fontSize = size * 0.26;

  return (
    <>
      <style>{`
        @keyframes ${animId} {
          from { stroke-dashoffset: ${circumference}; }
          to   { stroke-dashoffset: ${offset}; }
        }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />

        {/* Foreground ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            animation: `${animId} 0.8s ease-out forwards`,
          }}
        />

        {/* Center text */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          fontSize={fontSize}
          fontWeight={700}
          className="text-foreground"
        >
          {Math.round(clamped)}%
        </text>
      </svg>
    </>
  );
}
