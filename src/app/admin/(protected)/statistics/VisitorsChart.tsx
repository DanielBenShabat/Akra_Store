'use client';

import { useState } from 'react';

export type DayPoint = { label: string; visitors: number; views: number };

// Chart chrome on the white admin surface. The series hue (#2a78d6) is
// CVD-validated at ≥3:1 against white; text never wears the data color.
const SERIES = '#2a78d6';
const SERIES_ACTIVE = '#1c5cab';
const GRIDLINE = '#e5e4de';
const BASELINE = '#c9c8c1';
const MUTED = '#898781';

const VIEW_W = 900;
const VIEW_H = 240;
const PAD = { top: 12, right: 8, bottom: 24, left: 40 };

/** Round the axis max up to a clean 1/2/5 × 10^k step. */
function niceMax(value: number): number {
  if (value <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(value));
  for (const m of [1, 2, 5, 10]) {
    if (m * pow >= value) return m * pow;
  }
  return 10 * pow;
}

/** Column with a 4px rounded data-end and a square baseline. */
function columnPath(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, w / 2, h);
  return [
    `M ${x} ${y + h}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `L ${x + w} ${y + h}`,
    'Z',
  ].join(' ');
}

export default function VisitorsChart({ days }: { days: DayPoint[] }) {
  const [active, setActive] = useState<number | null>(null);

  const plotW = VIEW_W - PAD.left - PAD.right;
  const plotH = VIEW_H - PAD.top - PAD.bottom;
  const max = niceMax(Math.max(...days.map((d) => d.visitors), 0));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  const step = plotW / days.length;
  const barW = Math.min(24, step * 0.6);

  // Show ~6 x labels regardless of range length.
  const labelEvery = Math.max(1, Math.ceil(days.length / 6));

  const activeDay = active !== null ? days[active] : null;
  const activeCenterPct =
    active !== null ? ((PAD.left + step * active + step / 2) / VIEW_W) * 100 : 0;

  return (
    <div className="relative mt-3" onMouseLeave={() => setActive(null)}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" role="img" aria-label="Visitors per day">
        {ticks.map((t) => {
          const y = PAD.top + plotH - (t / max) * plotH;
          return (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={VIEW_W - PAD.right}
                y1={y}
                y2={y}
                stroke={t === 0 ? BASELINE : GRIDLINE}
                strokeWidth={1}
              />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize={11} fill={MUTED}>
                {t.toLocaleString()}
              </text>
            </g>
          );
        })}

        {days.map((d, i) => {
          const h = max > 0 ? (d.visitors / max) * plotH : 0;
          const x = PAD.left + step * i + (step - barW) / 2;
          const y = PAD.top + plotH - h;
          return (
            <g key={i}>
              {h > 0 && (
                <path d={columnPath(x, y, barW, h)} fill={active === i ? SERIES_ACTIVE : SERIES} />
              )}
              {i % labelEvery === 0 && (
                <text
                  x={PAD.left + step * i + step / 2}
                  y={VIEW_H - 6}
                  textAnchor="middle"
                  fontSize={11}
                  fill={MUTED}
                >
                  {d.label}
                </text>
              )}
              {/* Full-height hit target, wider than the mark */}
              <rect
                x={PAD.left + step * i}
                y={PAD.top}
                width={step}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setActive(i)}
              />
            </g>
          );
        })}
      </svg>

      {activeDay && (
        <div
          className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-md border border-border bg-white px-3 py-2 text-xs shadow-sm"
          style={{ left: `${Math.min(88, Math.max(12, activeCenterPct))}%` }}
        >
          <p className="font-medium">{activeDay.label}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: SERIES }} />
            {activeDay.visitors.toLocaleString()} visitors · {activeDay.views.toLocaleString()} views
          </p>
        </div>
      )}
    </div>
  );
}
