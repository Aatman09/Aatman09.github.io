"use client";

import { useMemo, useRef, useState } from "react";

/**
 * Symmetric per-tensor integer quantization, drawn live.
 *
 * The curve is a stand-in weight distribution; the staircase is that curve
 * snapped to 2^(b-1)-1 signed levels, the same scheme gemma2-quant uses.
 * At int8 the two are visually indistinguishable — which is the finding.
 * At int4 the grid is coarse enough to see the error open up.
 */

const N = 300;
const W = 1000;
const H = 360;
const PAD = { top: 26, right: 22, bottom: 26, left: 22 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const CY = PAD.top + PLOT_H / 2;

function weightCurve(x: number) {
  return (
    0.86 * Math.exp(-11 * (x - 0.27) ** 2) -
    0.78 * Math.exp(-18 * (x - 0.7) ** 2) +
    0.14 * Math.sin(10.5 * x + 0.4)
  );
}

const SAMPLES = Array.from({ length: N }, (_, i) => {
  const x = i / (N - 1);
  return { x, v: weightCurve(x) };
});

const AMAX = Math.max(...SAMPLES.map((s) => Math.abs(s.v)));
const VRANGE = AMAX * 1.18;

const xToPx = (x: number) => PAD.left + x * PLOT_W;
const vToPy = (v: number) => CY - (v / VRANGE) * (PLOT_H / 2);

type Precision = {
  id: string;
  label: string;
  bits: number | null;
  note: string;
};

const PRECISIONS: Precision[] = [
  {
    id: "bf16",
    label: "bf16",
    bits: null,
    note: "Baseline. 4.87 GB, 12.46 perplexity on wikitext-2.",
  },
  {
    id: "int8",
    label: "int8",
    bits: 8,
    note: "Measured. 3.54 GB (−27%), 12.53 perplexity (+0.56%). bitsandbytes lands at 12.70.",
  },
  {
    id: "int4",
    label: "int4",
    bits: 4,
    note: "Not measured. The from-scratch pipeline stops at int8 — the error above is why int4 needs more than round-to-nearest.",
  },
];

export default function Quantizer() {
  const [precisionId, setPrecisionId] = useState("int8");
  const [cursor, setCursor] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const precision =
    PRECISIONS.find((p) => p.id === precisionId) ?? PRECISIONS[1];

  const model = useMemo(() => {
    const { bits } = precision;
    if (bits === null) {
      return {
        quantized: SAMPLES.map((s) => s.v),
        delta: null,
        levels: null,
        maxError: 0,
      };
    }
    const qmax = 2 ** (bits - 1) - 1;
    const delta = AMAX / qmax;
    let maxError = 0;
    const quantized = SAMPLES.map((s) => {
      const q =
        Math.max(-qmax, Math.min(qmax, Math.round(s.v / delta))) * delta;
      maxError = Math.max(maxError, Math.abs(s.v - q));
      return q;
    });
    return { quantized, delta, levels: 2 * qmax + 1, maxError };
  }, [precision]);

  const curvePath = useMemo(
    () =>
      SAMPLES.map(
        (s, i) =>
          `${i === 0 ? "M" : "L"}${xToPx(s.x).toFixed(2)} ${vToPy(s.v).toFixed(2)}`,
      ).join(" "),
    [],
  );

  // True stairs: hold the value across the sample, then jump.
  const stepPath = useMemo(() => {
    const q = model.quantized;
    let d = `M${xToPx(0).toFixed(2)} ${vToPy(q[0]).toFixed(2)}`;
    for (let i = 1; i < q.length; i++) {
      const px = xToPx(SAMPLES[i].x).toFixed(2);
      d += ` L${px} ${vToPy(q[i - 1]).toFixed(2)} L${px} ${vToPy(q[i]).toFixed(2)}`;
    }
    return d;
  }, [model.quantized]);

  const errorPath = useMemo(() => {
    if (precision.bits === null) return null;
    const q = model.quantized;
    const forward = SAMPLES.map(
      (s, i) =>
        `${i === 0 ? "M" : "L"}${xToPx(s.x).toFixed(2)} ${vToPy(s.v).toFixed(2)}`,
    ).join(" ");
    const back = [];
    for (let i = q.length - 1; i >= 0; i--) {
      back.push(`L${xToPx(SAMPLES[i].x).toFixed(2)} ${vToPy(q[i]).toFixed(2)}`);
    }
    return `${forward} ${back.join(" ")} Z`;
  }, [model.quantized, precision.bits]);

  // Only draw the level grid when it stays legible.
  const levelLines = useMemo(() => {
    if (model.delta === null || model.levels === null || model.levels > 33) {
      return [];
    }
    const qmax = (model.levels - 1) / 2;
    const lines: number[] = [];
    for (let k = -qmax; k <= qmax; k++) {
      const v = k * model.delta;
      if (Math.abs(v) <= VRANGE) lines.push(v);
    }
    return lines;
  }, [model.delta, model.levels]);

  function handlePointer(e: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const frac = ((e.clientX - rect.left) / rect.width) * W;
    const x = (frac - PAD.left) / PLOT_W;
    if (x < 0 || x > 1) return setCursor(null);
    setCursor(Math.round(x * (N - 1)));
  }

  const readIndex = cursor ?? Math.round(0.27 * (N - 1));
  const readTrue = SAMPLES[readIndex].v;
  const readQuant = model.quantized[readIndex];

  return (
    <figure className="m-0">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule pb-2.5">
        <span className="label text-ink">Quantization grid</span>
        <span className="label text-graphite">
          Symmetric · per-tensor · round-to-nearest
        </span>
      </figcaption>

      <div className="border-x border-b border-rule bg-surface">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Plot of a weight distribution and the same distribution quantized to ${
            precision.label
          }${
            model.levels ? `, ${model.levels} levels` : ", shown as the reference curve"
          }.`}
          className="block h-auto w-full touch-none"
          onPointerMove={handlePointer}
          onPointerLeave={() => setCursor(null)}
        >
          {/* Quantization levels — the grid the whole design is named for */}
          {levelLines.map((v) => (
            <line
              key={v}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={vToPy(v)}
              y2={vToPy(v)}
              stroke="var(--rule)"
              strokeWidth={1}
            />
          ))}

          {/* Zero */}
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={CY}
            y2={CY}
            stroke="var(--rule-strong)"
            strokeWidth={1}
          />

          {errorPath && (
            <path d={errorPath} fill="var(--signal)" fillOpacity={0.16} />
          )}

          <path
            d={curvePath}
            fill="none"
            stroke="var(--graphite)"
            strokeWidth={1.5}
            strokeLinecap="round"
            className="q-draw"
          />

          {precision.bits !== null && (
            <path
              key={precision.id}
              d={stepPath}
              fill="none"
              stroke="var(--signal)"
              strokeWidth={2}
              strokeLinejoin="miter"
              className="q-snap"
            />
          )}

          {cursor !== null && (
            <g>
              <line
                x1={xToPx(SAMPLES[readIndex].x)}
                x2={xToPx(SAMPLES[readIndex].x)}
                y1={PAD.top}
                y2={H - PAD.bottom}
                stroke="var(--rule-strong)"
                strokeWidth={1}
              />
              <circle
                cx={xToPx(SAMPLES[readIndex].x)}
                cy={vToPy(readTrue)}
                r={3.5}
                fill="var(--graphite)"
              />
              {precision.bits !== null && (
                <circle
                  cx={xToPx(SAMPLES[readIndex].x)}
                  cy={vToPy(readQuant)}
                  r={4}
                  fill="var(--signal)"
                />
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Controls + live readout */}
      <div className="flex flex-col gap-4 border-x border-b border-rule bg-surface-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Weight precision"
          className="flex w-fit border border-rule-strong"
        >
          {PRECISIONS.map((p) => {
            const active = p.id === precision.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => setPrecisionId(p.id)}
                className={`label px-3.5 py-2 transition-colors ${
                  active
                    ? "bg-ink text-paper"
                    : "text-graphite hover:bg-surface hover:text-ink"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <dl className="tnum grid grid-cols-3 gap-x-6 gap-y-1 font-mono text-sm text-ink sm:gap-x-8 sm:text-right">
          <div>
            <dt className="label text-graphite">Levels</dt>
            <dd className="mt-1">{model.levels ?? "ref"}</dd>
          </div>
          <div>
            <dt className="label text-graphite">Step Δ</dt>
            <dd className="mt-1">
              {model.delta === null ? "—" : model.delta.toFixed(4)}
            </dd>
          </div>
          <div>
            <dt className="label text-graphite">Max error</dt>
            <dd className="mt-1 text-accent-text">
              {model.maxError.toFixed(4)}
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-3 max-w-2xl font-mono text-xs leading-6 text-graphite">
        {precision.note}
      </p>
    </figure>
  );
}
