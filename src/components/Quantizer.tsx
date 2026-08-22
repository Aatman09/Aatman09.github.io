"use client";

import { useMemo, useRef, useState } from "react";

/**
 * Symmetric per-tensor integer quantization, drawn live.
 *
 * Top trace: a stand-in weight distribution (graphite) and the same values
 * snapped to 2^(b-1)-1 signed levels (signal) — the scheme gemma2-quant uses.
 * At int8 the two are indistinguishable, which is exactly the finding, so the
 * strip below carries the residual at a stated gain the way a scope would.
 * The gain is what makes int8's error readable at all; the numeric max-error
 * readout is what keeps the comparison honest.
 */

const N = 320;
const W = 1000;
const PAD_X = 22;
const PLOT_W = W - PAD_X * 2;

const MAIN_TOP = 24;
const MAIN_H = 196;
const MAIN_CY = MAIN_TOP + MAIN_H / 2;

const RES_TOP = 244;
const RES_H = 76;
const RES_CY = RES_TOP + RES_H / 2;
const H = RES_TOP + RES_H + 16;

const GAIN_STEPS = [1, 2, 5, 10, 20, 50, 100, 200];

function weightCurve(x: number) {
  return (
    0.8 * Math.exp(-12 * (x - 0.26) ** 2) -
    0.72 * Math.exp(-20 * (x - 0.68) ** 2) +
    0.11 * Math.sin(27.5 * x + 0.4) +
    0.055 * Math.sin(61 * x + 1.9)
  );
}

const SAMPLES = Array.from({ length: N }, (_, i) => {
  const x = i / (N - 1);
  return { x, v: weightCurve(x) };
});

const AMAX = Math.max(...SAMPLES.map((s) => Math.abs(s.v)));
const VRANGE = AMAX * 1.14;
const PX_PER_UNIT = MAIN_H / 2 / VRANGE;

const xToPx = (x: number) => PAD_X + x * PLOT_W;
const vToPy = (v: number) => MAIN_CY - v * PX_PER_UNIT;

type Precision = { id: string; label: string; bits: number | null; note: string };

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
    note: "Not measured. The from-scratch pipeline stops at int8 — the residual above is why int4 needs more than round-to-nearest.",
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
        gain: 1,
      };
    }
    const qmax = 2 ** (bits - 1) - 1;
    const delta = AMAX / qmax;
    let maxError = 0;
    const quantized = SAMPLES.map((s) => {
      const q = Math.max(-qmax, Math.min(qmax, Math.round(s.v / delta))) * delta;
      maxError = Math.max(maxError, Math.abs(s.v - q));
      return q;
    });

    // Pick the largest round gain that keeps the residual inside its strip.
    const room = RES_H / 2 - 7;
    const raw = room / Math.max(maxError * PX_PER_UNIT, 1e-9);
    const gain =
      [...GAIN_STEPS].reverse().find((g) => g <= raw) ?? GAIN_STEPS[0];

    return { quantized, delta, levels: 2 * qmax + 1, maxError, gain };
  }, [precision]);

  const resToPy = (r: number) => RES_CY - r * PX_PER_UNIT * model.gain;

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

  const residualPath = useMemo(() => {
    const q = model.quantized;
    return SAMPLES.map(
      (s, i) =>
        `${i === 0 ? "M" : "L"}${xToPx(s.x).toFixed(2)} ${resToPy(s.v - q[i]).toFixed(2)}`,
    ).join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.quantized, model.gain]);

  // Only draw the level grid while it stays legible.
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
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const frac = (x - PAD_X) / PLOT_W;
    if (frac < 0 || frac > 1) return setCursor(null);
    setCursor(Math.round(frac * (N - 1)));
  }

  const i = cursor;
  const quantized = precision.bits !== null;

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
          aria-label={`A weight distribution and the same values quantized to ${precision.label}${
            model.levels
              ? `, ${model.levels} levels, maximum error ${model.maxError.toFixed(4)}`
              : ", shown as the reference curve"
          }.`}
          className="block h-auto w-full touch-none"
          onPointerMove={handlePointer}
          onPointerLeave={() => setCursor(null)}
        >
          {/* Quantization levels — the grid the design is named for */}
          {levelLines.map((v) => (
            <line
              key={v}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={vToPy(v)}
              y2={vToPy(v)}
              stroke="var(--rule)"
              strokeWidth={1}
            />
          ))}

          <line
            x1={PAD_X}
            x2={W - PAD_X}
            y1={MAIN_CY}
            y2={MAIN_CY}
            stroke="var(--rule-strong)"
            strokeWidth={1}
          />

          {quantized && (
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

          {/* Reference curve rides on top so both traces stay readable */}
          <path
            d={curvePath}
            fill="none"
            stroke="var(--graphite)"
            strokeWidth={1.25}
            strokeLinecap="round"
            className="q-draw"
          />

          {/* Residual strip */}
          <line
            x1={PAD_X}
            x2={W - PAD_X}
            y1={RES_TOP - 12}
            y2={RES_TOP - 12}
            stroke="var(--rule)"
            strokeWidth={1}
          />
          <text
            x={PAD_X}
            y={RES_TOP + 4}
            fill="var(--graphite)"
            fontSize={11}
            letterSpacing="0.13em"
            style={{ fontFamily: "var(--font-plex-mono), monospace" }}
          >
            {quantized
              ? `RESIDUAL  ×${model.gain}`
              : "RESIDUAL  —  REFERENCE"}
          </text>
          <line
            x1={PAD_X}
            x2={W - PAD_X}
            y1={RES_CY}
            y2={RES_CY}
            stroke="var(--rule)"
            strokeWidth={1}
          />
          <path
            key={`res-${precision.id}`}
            d={residualPath}
            fill="none"
            stroke={quantized ? "var(--signal)" : "var(--rule-strong)"}
            strokeWidth={1.25}
            className="q-snap"
          />

          {i !== null && (
            <g>
              <line
                x1={xToPx(SAMPLES[i].x)}
                x2={xToPx(SAMPLES[i].x)}
                y1={MAIN_TOP}
                y2={RES_TOP + RES_H}
                stroke="var(--rule-strong)"
                strokeWidth={1}
              />
              <circle
                cx={xToPx(SAMPLES[i].x)}
                cy={vToPy(SAMPLES[i].v)}
                r={3}
                fill="var(--graphite)"
              />
              {quantized && (
                <circle
                  cx={xToPx(SAMPLES[i].x)}
                  cy={vToPy(model.quantized[i])}
                  r={3.5}
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

        <dl className="tnum grid grid-cols-3 gap-x-6 gap-y-1 font-mono text-sm text-ink sm:gap-x-9 sm:text-right">
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
            <dd className="mt-1 text-accent-text">{model.maxError.toFixed(4)}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-3 max-w-2xl font-mono text-xs leading-6 text-graphite">
        {precision.note}
      </p>
    </figure>
  );
}
