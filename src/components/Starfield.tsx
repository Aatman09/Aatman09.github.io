"use client";

import { useEffect, useRef } from "react";

/**
 * A slowly drifting starfield on a fixed canvas behind the content.
 *
 * Stars sit on three depth layers. All of them drift the same way, but the
 * near ones move faster, and scrolling shifts them in proportion to depth,
 * which is what makes it read as space and not wallpaper.
 * A few twinkle and a handful carry a four-point glint. Text blocks
 * (data-field-avoid) dim the stars around them so the type stays clean. With
 * reduced motion the sky holds still.
 */

const LAYERS = [
  // size px, alpha, drift px/s, parallax, share of stars
  { size: 1, alpha: 0.34, drift: 2.5, par: 0.25, share: 0.58 },
  { size: 1.4, alpha: 0.52, drift: 6, par: 0.55, share: 0.32 },
  { size: 2, alpha: 0.82, drift: 13, par: 1, share: 0.1 },
];
const DRIFT_X = -1;
const DRIFT_Y = 0.22;
const AVOID_PAD = 10;
const AVOID_FADE = 90;
const GLINT_SHARE = 0.07; // of the nearest layer

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;
const mod = (n: number, m: number) => ((n % m) + m) % m;

function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

type Box = { l: number; t: number; r: number; b: number };

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    let w = 0;
    let h = 0;
    let boxes: Box[] = [];
    let ink = "#e7ecee";
    let signal = "#ff6a38";
    let raf = 0;
    let running = false;
    let visible = true;
    const start = performance.now();

    // Per-star data in flat arrays; positions are the t=0 sky.
    let n = 0;
    let sx = new Float32Array(0);
    let sy0 = new Float32Array(0);
    let layer = new Uint8Array(0);
    let twPhase = new Float32Array(0);
    let twRate = new Float32Array(0);
    let kind = new Uint8Array(0); // 0 plain, 1 twinkles, 2 glints, 3 accent

    function readColors() {
      const cs = getComputedStyle(root);
      ink = cs.getPropertyValue("--ink").trim() || ink;
      const dark = root.classList.contains("dark");
      signal =
        cs.getPropertyValue(dark ? "--signal" : "--accent-text").trim() ||
        signal;
    }

    function measureBoxes() {
      const sy = window.scrollY;
      boxes = Array.from(
        document.querySelectorAll<HTMLElement>("[data-field-avoid]"),
      ).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          l: r.left - AVOID_PAD,
          t: r.top + sy - AVOID_PAD,
          r: r.right + AVOID_PAD,
          b: r.bottom + sy + AVOID_PAD,
        };
      });
    }

    function textDistance(x: number, pageY: number) {
      let best = Infinity;
      for (const b of boxes) {
        const dx = Math.max(b.l - x, 0, x - b.r);
        const dy = Math.max(b.t - pageY, 0, pageY - b.b);
        const d = Math.hypot(dx, dy);
        if (d < best) best = d;
      }
      return best;
    }

    function seed() {
      n = Math.round(clamp((w * h) / 1800, 300, 900));
      sx = new Float32Array(n);
      sy0 = new Float32Array(n);
      layer = new Uint8Array(n);
      twPhase = new Float32Array(n);
      twRate = new Float32Array(n);
      kind = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        sx[i] = Math.random() * w;
        sy0[i] = Math.random() * h;
        let r = Math.random();
        let l = 0;
        for (let k = 0; k < LAYERS.length; k++) {
          r -= LAYERS[k].share;
          if (r <= 0) {
            l = k;
            break;
          }
          l = k;
        }
        layer[i] = l;
        twPhase[i] = Math.random() * Math.PI * 2;
        twRate[i] = 0.6 + Math.random() * 1.6;
        const q = Math.random();
        kind[i] =
          l === 2 && q < GLINT_SHARE * 8
            ? 2
            : q < 0.06
              ? 3
              : q < 0.3
                ? 1
                : 0;
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      measureBoxes();
    }

    function draw(now: number) {
      const t = reduced.matches ? 0 : (now - start) / 1000;
      const scroll = reduced.matches ? 0 : window.scrollY;

      ctx!.clearRect(0, 0, w, h);

      for (let i = 0; i < n; i++) {
        const L = LAYERS[layer[i]];
        const x = mod(sx[i] + DRIFT_X * L.drift * t, w);
        const y = mod(
          sy0[i] + DRIFT_Y * L.drift * t - scroll * L.par * 0.25,
          h,
        );

        const open = smoothstep(0, AVOID_FADE, textDistance(x, y + window.scrollY));
        if (open < 0.02) continue;

        let a = L.alpha;
        if (kind[i] === 1 || kind[i] === 2) {
          a *= 0.55 + 0.45 * Math.sin(t * twRate[i] + twPhase[i]);
        }
        a *= open;

        const accent = kind[i] === 3;
        ctx!.globalAlpha = a;
        ctx!.fillStyle = accent ? signal : ink;
        const s = L.size;
        ctx!.fillRect(x - s / 2, y - s / 2, s, s);

        if (kind[i] === 2) {
          const len = 5 + 3 * Math.sin(t * twRate[i] + twPhase[i]);
          ctx!.globalAlpha = a * 0.55;
          ctx!.fillRect(x - len, y - 0.5, len * 2, 1);
          ctx!.fillRect(x - 0.5, y - len, 1, len * 2);
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

    // Theme toggles flip a class on <html>; recolor right away.
    const mo = new MutationObserver(() => {
      readColors();
      if (!running) draw(performance.now());
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });

    // Text reflows (fonts loading, wrapping, hover cards) move the boxes.
    const bodyRO = new ResizeObserver(() => {
      measureBoxes();
      if (!running) draw(performance.now());
    });
    bodyRO.observe(document.body);
    document.fonts?.ready.then(() => {
      measureBoxes();
      if (!running) draw(performance.now());
    });

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      bodyRO.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
