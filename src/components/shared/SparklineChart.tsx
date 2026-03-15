'use client';

import { useMemo, useId } from 'react';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  positive?: boolean;
}

export default function SparklineChart({
  data,
  width = 80,
  height = 32,
  color = '#6366f1',
  positive,
}: SparklineChartProps) {
  const id = useId();
  const gradientId = `sparkline-grad-${id}`;

  const resolvedColor =
    positive !== undefined ? (positive ? '#10b981' : '#ef4444') : color;

  const points = useMemo(() => {
    if (data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    const usableW = width - padding * 2;
    const usableH = height - padding * 2;

    return data
      .map((v, i) => {
        const x = padding + (i / (data.length - 1)) * usableW;
        const y = padding + usableH - ((v - min) / range) * usableH;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, width, height]);

  const fillPoints = useMemo(() => {
    if (data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    const usableW = width - padding * 2;
    const usableH = height - padding * 2;

    const linePoints = data.map((v, i) => {
      const x = padding + (i / (data.length - 1)) * usableW;
      const y = padding + usableH - ((v - min) / range) * usableH;
      return `${x},${y}`;
    });

    const firstX = padding;
    const lastX = padding + usableW;
    const bottom = height - padding;

    return `${firstX},${bottom} ${linePoints.join(' ')} ${lastX},${bottom}`;
  }, [data, width, height]);

  const lastPoint = useMemo(() => {
    if (data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    const usableW = width - padding * 2;
    const usableH = height - padding * 2;
    const lastIdx = data.length - 1;
    const x = padding + (lastIdx / (data.length - 1)) * usableW;
    const y = padding + usableH - ((data[lastIdx] - min) / range) * usableH;
    return { x, y };
  }, [data, width, height]);

  if (data.length < 2) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className="block"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={resolvedColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={resolvedColor} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Gradient fill area */}
      <polygon points={fillPoints} fill={`url(#${gradientId})`} />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={resolvedColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Animated glow dot on last point */}
      {lastPoint && (
        <>
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={3.5}
            fill={resolvedColor}
            opacity={0.3}
          >
            <animate
              attributeName="r"
              values="3;5;3"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0.1;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={1.5}
            fill={resolvedColor}
          />
        </>
      )}
    </svg>
  );
}
