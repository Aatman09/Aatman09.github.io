"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A page-wide field of drifting "weights" that snap to an integer grid under
 * the cursor.
 *
 * It is a fixed canvas behind the content, so the whole landing page sits on
 * it. Each row of dots is a continuous value in [-1, 1]; inside the probe's
 * radius the dots are pulled onto the nearest of 2^(b-1)-1 symmetric levels
 * (the scheme gemma2-quant uses), the grid appears, and a hairline shows each
 * dot's residual. Rows scroll past at their own speeds and wrap, which is the
 * parallax. Click anywhere that is not a link or button to change the bit
 * width. With no pointer the probe wanders on its own.
 */

const PRECISIONS = [
  { label: "int8", bits: 8 },
  { label: "int4", bits: 4 },
  { label: "int3", bits: 3 },
  { label: "int2", bits: 2 },
];
const START = 1;

const COL_GAP = 30;
const ROW_GAP = 115;
const MIN_ROWS = 3;
const MAX_ROWS = 9;
const RADIUS = 190;
// Per-row scroll speed as a fraction of the page's. Slower than 1 reads as depth.
const SPEEDS = [0.12, 0.3, 0.18, 0.4, 0.08, 0.26, 0.5, 0.2, 0.34];
// Level ticks are only drawn when they are countable; int8 has 127 and
// is meant to look like nothing happened.
const MAX_DRAWN_LEVELS = 15;

const levelsFor = (bits: number) => 2 ** (bits - 1) - 1;
const snap = (v: number, L: number) => Math.round(v * L) / L;
const mod = (n: number, m: number) => ((n % m) + m) % m;

function weight(x: number, t: number, phase: number) {
  const u = x * Math.PI * 2;
  return (
    0.55 * Math.sin(u * 1.3 + phase + t * 0.35) +
    0.3 * Math.sin(u * 3.1 - t * 0.5 + phase * 2) +
    0.12 * Math.sin(u * 7.3 + t * 0.9)
  );
}

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export default function QuantField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const precisionRef = useRef(START);
  const [precision, setPrecision] = useState(START);

  function cycle() {
    const next = (precisionRef.current + 1) % PRECISIONS.length;
    precisionRef.current = next;
    setPrecision(next);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    let w = 0;
    let h = 0;
    let rows = MIN_ROWS;
    const amp = 34;
    let ink = "#e7ecee";
    let signal = "#ff6a38";
    let raf = 0;
    let running = false;
    let visible = true;
    const start = performance.now();

    // The probe eases toward its target so entering or leaving never jumps.
    const probe = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0, at: -Infinity };

    function readColors() {
      const cs = getComputedStyle(root);
      ink = cs.getPropertyValue("--ink").trim() || ink;
      signal = cs.getPropertyValue("--signal").trim() || signal;
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      rows = Math.max(MIN_ROWS, Math.min(MAX_ROWS, Math.round(h / ROW_GAP)));
      if (probe.x === 0 && probe.y === 0) {
        probe.x = w * 0.6;
        probe.y = h * 0.4;
      }
    }

    function draw(now: number) {
      const t = reduced.matches ? 2 : (now - start) / 1000;
      const L = levelsFor(PRECISIONS[precisionRef.current].bits);
      const sy = reduced.matches ? 0 : window.scrollY;

      // Idle path, replaced by the pointer while it is moving.
      const pointerLive = now - pointer.at < 2500;
      const tx = pointerLive ? pointer.x : w * (0.5 + 0.35 * Math.sin(t * 0.23));
      const ty = pointerLive
        ? pointer.y
        : h * (0.45 + 0.3 * Math.sin(t * 0.31 + 1));
      const ease = reduced.matches ? 1 : 0.12;
      probe.x += (tx - probe.x) * ease;
      probe.y += (ty - probe.y) * ease;

      ctx!.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / COL_GAP) + 1;
      // Rows wrap past the edges so the field never runs out as you scroll.
      const pad = amp + 12;
      const span = h + pad * 2;

      for (let k = 0; k < rows; k++) {
        const base = (span * (k + 0.5)) / rows;
        const cy = mod(base - SPEEDS[k % SPEEDS.length] * sy, span) - pad;
        const phase = k * 1.7;

        for (let c = 0; c < cols; c++) {
          const px = c * COL_GAP;
          const v = weight(px / Math.max(w, 1) + sy * 0.0003 * (k + 1), t, phase);
          const rawY = cy + v * amp;

          const d = Math.hypot(px - probe.x, cy - probe.y);
          const s = smoothstep(RADIUS, RADIUS * 0.45, d);

          if (s <= 0.01) {
            ctx!.globalAlpha = 0.22;
            ctx!.fillStyle = ink;
            ctx!.fillRect(px - 1, rawY - 1, 2, 2);
            continue;
          }

          const q = snap(v, L);
          const y = cy + (v + (q - v) * s) * amp;

          if (L <= MAX_DRAWN_LEVELS) {
            ctx!.globalAlpha = 0.16 * s;
            ctx!.fillStyle = ink;
            for (let lv = -L; lv <= L; lv++) {
              ctx!.fillRect(px - 5, cy + (lv / L) * amp, 10, 1);
            }
          }

          // Residual: where the value was, and where the grid put it.
          ctx!.globalAlpha = 0.55 * s;
          ctx!.fillStyle = signal;
          ctx!.fillRect(px, Math.min(rawY, y), 1, Math.abs(y - rawY) + 1);

          ctx!.globalAlpha = 0.35 + 0.65 * s;
          ctx!.fillRect(px - 1.5, y - 1.5, 3, 3);
        }
      }
      ctx!.globalAlpha = 1;
    }

    function loop(now: number) {
      draw(now);
      raf = requestAnimationFrame(loop);
    }

    function sync() {
      const shouldRun = visible && !document.hidden && !reduced.matches;
      if (shouldRun && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!shouldRun) {
        if (running) cancelAnimationFrame(raf);
        running = false;
        draw(performance.now());
      }
    }

    function onPointer(e: PointerEvent) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.at = performance.now();
      if (!running) draw(pointer.at);
    }

    // Clicking bare page changes precision; links, buttons and selections do not.
    function onClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest("a, button, input, textarea, select, summary")) return;
      if (window.getSelection()?.toString()) return;
      const next = (precisionRef.current + 1) % PRECISIONS.length;
      precisionRef.current = next;
      setPrecision(next);
      if (!running) draw(performance.now());
    }

    function onScroll() {
      if (!running) draw(performance.now());
    }

    function onResize() {
      resize();
      if (!running) draw(performance.now());
    }

    readColors();
    resize();
    sync();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);

    // Theme toggles flip a class on <html>; recolor without waiting a frame.
    const mo = new MutationObserver(() => {
      readColors();
      if (!running) draw(performance.now());
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  const current = PRECISIONS[precision];
  const next = PRECISIONS[(precision + 1) % PRECISIONS.length];

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      />
      <button
        type="button"
        onClick={cycle}
        aria-label={`Quantization precision ${current.label}. Switch to ${next.label}.`}
        className="fixed bottom-4 right-4 z-30 font-mono text-[11px] uppercase tracking-[0.13em] text-graphite transition-colors hover:text-ink focus-visible:text-ink"
      >
        <span className="text-accent-text">{current.label}</span> ↻
      </button>
    </>
  );
}
