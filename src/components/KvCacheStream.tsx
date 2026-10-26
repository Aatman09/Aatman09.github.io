"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Two decoders generating the same text, side by side.
 *
 * Without a cache, every step re-runs the whole sequence, so every token's
 * key and value is recomputed. With one, the older tokens' K/V are read back
 * and only the newest token is computed. The K/V counts are exact for that
 * scheme; the wall-clock numbers beneath are CacheGPT's measurements and are
 * quoted, not derived from the counts.
 */

const PROMPT = ["Explain", "why", "caching", "helps", "decoding", ":"];
const GENERATED = [
  "Each",
  "step",
  "reuses",
  "every",
  "earlier",
  "key",
  "and",
  "value",
  "instead",
  "of",
  "recomputing",
  "them",
  ".",
];
const TOKENS = [...PROMPT, ...GENERATED];
const P = PROMPT.length;
const N = TOKENS.length;
const STEP_MS = 650;

type Cell = "computed" | "reused" | "pending";

function lane(
  cached: boolean,
  step: number,
): { cells: Cell[]; now: number; total: number } {
  // step = how many tokens have been generated; the context holds P + step.
  const len = P + step;
  const cells: Cell[] = TOKENS.map((_, i) => {
    if (i >= len) return "pending";
    if (!cached) return "computed";
    // Cached: the prompt is computed once (prefill), then each new token only.
    return i === len - 1 || step === 0 ? "computed" : "reused";
  });
  const now = cached ? (step === 0 ? P : 1) : len;
  let total = 0;
  for (let s = 0; s <= step; s++) {
    total += cached ? (s === 0 ? P : 1) : P + s;
  }
  return { cells, now, total };
}

function Lane({
  title,
  sub,
  cached,
  step,
}: {
  title: string;
  sub: string;
  cached: boolean;
  step: number;
}) {
  const { cells, now, total } = lane(cached, step);

  return (
    <div className="border-x border-b border-rule bg-surface px-4 py-4 first:border-t">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <p className="label text-ink">{title}</p>
          <p className="mt-1 font-mono text-xs text-graphite">{sub}</p>
        </div>
        <dl className="tnum flex gap-x-8 font-mono text-sm text-ink">
          <div>
            <dt className="label text-graphite">K/V this step</dt>
            <dd className={`mt-1 ${cached ? "text-accent-text" : ""}`}>{now}</dd>
          </div>
          <div>
            <dt className="label text-graphite">Total so far</dt>
            <dd className="mt-1">{total}</dd>
          </div>
        </dl>
      </div>

      <ul
        className="mt-4 flex flex-wrap gap-1.5"
        aria-label={`${title}: token state at step ${step}`}
      >
        {TOKENS.map((tok, i) => {
          const state = cells[i];
          const style =
            state === "computed"
              ? "border-signal bg-signal-soft text-ink"
              : state === "reused"
                ? "border-rule-strong text-graphite"
                : "border-dashed border-rule text-graphite opacity-30";
          return (
            <li
              key={i}
              className={`border px-2 py-1 font-mono text-[0.8125rem] ${style}`}
            >
              {tok}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function KvCacheStream() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const figRef = useRef<HTMLElement>(null);
  const autoplayed = useRef(false);

  const done = step >= N - P;

  // Start once when the figure first scrolls into view; never fight reduced motion.
  useEffect(() => {
    const el = figRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !autoplayed.current && !reduced.matches) {
          autoplayed.current = true;
          setPlaying(true);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setStep((s) => {
        if (s >= N - P) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [playing]);

  const naive = lane(false, step);
  const cached = lane(true, step);
  const ratio = naive.total / cached.total;

  function play() {
    if (done) setStep(0);
    setPlaying((p) => !p);
  }

  return (
    <figure ref={figRef} className="m-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-rule bg-surface-2 px-4 py-3">
        <div className="flex w-fit border border-rule-strong">
          <button
            type="button"
            onClick={play}
            className="label bg-ink px-3.5 py-2 text-paper transition-opacity hover:opacity-80"
          >
            {playing ? "Pause" : done ? "Replay" : "Play"}
          </button>
          <button
            type="button"
            disabled={done}
            onClick={() => {
              setPlaying(false);
              setStep((s) => Math.min(s + 1, N - P));
            }}
            className="label px-3.5 py-2 text-graphite transition-colors hover:bg-surface hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Step
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            className="label px-3.5 py-2 text-graphite transition-colors hover:bg-surface hover:text-ink"
          >
            Reset
          </button>
        </div>
        <p className="tnum font-mono text-sm text-ink" aria-live="polite">
          <span className="label mr-3 text-graphite">Step</span>
          {step} / {N - P}
          <span className="label ml-6 mr-3 text-graphite">Work ratio</span>
          <span className="text-accent-text">{ratio.toFixed(1)}×</span>
        </p>
      </div>

      <Lane
        title="No cache"
        sub="Every step re-runs the whole sequence."
        cached={false}
        step={step}
      />
      <Lane
        title="KV cache"
        sub="Earlier keys and values are read back; only the newest token is computed."
        cached
        step={step}
      />

      <p className="mt-3 max-w-2xl font-mono text-xs leading-6 text-graphite">
        Counts are exact for this scheme: key/value projections computed, summed
        over every step so far. Timings are separate and measured: 171.6 ms/token
        without the cache against 16.8 with it (10.2×) at an 84-token context,
        on a CPU-only box. They are not derived from the counts above.
      </p>
      <p className="label mt-2 text-graphite">
        Orange = computed this step · grey = read from cache
      </p>
    </figure>
  );
}
