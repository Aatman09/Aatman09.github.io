"use client";

import { useEffect, useRef } from "react";

/**
 * A page-wide scatter of fireflies on a fixed canvas behind the content.
 *
 * Each one wanders on its own heading and pulses at its own rate. They notice
 * the cursor, drift toward it and loiter in a loose orbit; a click on bare page
 * scatters them. Text blocks (tagged data-field-avoid) are kept clear: a
 * firefly is steered out of one and fades to nothing as it nears the edge.
 * With reduced motion they hold still and glow steadily.
 */

const AVOID_PAD = 10;
const AVOID_FADE = 80; // opacity eases in over this distance from text
const AVOID_PUSH = 56; // steering away from text starts this close
const SEE = 300; // how far a firefly notices the cursor
const ORBIT = 72; // distance they like to hold from it
const MARGIN = 24;

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.trim().replace("#", "");
  if (m.length !== 6) return [255, 106, 56];
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ];
}

type Fly = {
  x: number;
  y: number;
  heading: number;
  speed: number;
  wobble: number;
  wobbleRate: number;
  phase: number;
  rate: number;
  size: number;
  curiosity: number;
  spin: number;
  ix: number;
  iy: number;
  flash: number;
};

type Box = { l: number; t: number; r: number; b: number };

export default function Fireflies() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    let w = 0;
    let h = 0;
    const flies: Fly[] = [];
    let boxes: Box[] = [];
    let sprite: HTMLCanvasElement | null = null;
    let core = "#ff6a38";
    let raf = 0;
    let running = false;
    let visible = true;
    let last = performance.now();
    const start = last;
    const pointer = { x: 0, y: 0, at: -Infinity };

    function makeSprite(color: string) {
      const [r, g, b] = hexToRgb(color);
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g2 = c.getContext("2d")!;
      const grad = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.95)`);
      grad.addColorStop(0.16, `rgba(${r},${g},${b},0.55)`);
      grad.addColorStop(0.45, `rgba(${r},${g},${b},0.14)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      g2.fillStyle = grad;
      g2.fillRect(0, 0, 64, 64);
      return c;
    }

    function readColors() {
      const cs = getComputedStyle(root);
      // The brighter accent glows on dark; the text-safe one stays visible on light.
      const dark = root.classList.contains("dark");
      core = (
        cs.getPropertyValue(dark ? "--signal" : "--accent-text").trim() ||
        core
      );
      sprite = makeSprite(core);
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

    function spawn(): Fly {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        heading: Math.random() * Math.PI * 2,
        speed: 10 + Math.random() * 20,
        wobble: 0.6 + Math.random() * 1.2,
        wobbleRate: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        rate: 0.5 + Math.random() * 0.9,
        size: 18 + Math.random() * 20,
        curiosity: 0.25 + Math.random() * 0.75,
        spin: Math.random() < 0.5 ? -1 : 1,
        ix: 0,
        iy: 0,
        flash: 0,
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(clamp((w * h) / 24000, 18, 64));
      while (flies.length < target) flies.push(spawn());
      flies.length = target;
      measureBoxes();
    }

    // Distance to the nearest text block, plus the direction to leave it.
    function nearestText(x: number, pageY: number) {
      let best = Infinity;
      let ox = 0;
      let oy = 0;
      for (const b of boxes) {
        const cx = clamp(x, b.l, b.r);
        const cy = clamp(pageY, b.t, b.b);
        const dx = x - cx;
        const dy = pageY - cy;
        let d = Math.hypot(dx, dy);
        let nx = dx;
        let ny = dy;
        if (d === 0) {
          // Inside: leave by the closest edge.
          const left = x - b.l;
          const right = b.r - x;
          const up = pageY - b.t;
          const down = b.b - pageY;
          const m = Math.min(left, right, up, down);
          nx = m === left ? -1 : m === right ? 1 : 0;
          ny = m === up ? -1 : m === down ? 1 : 0;
          d = 0;
        } else {
          nx /= d;
          ny /= d;
        }
        if (d < best) {
          best = d;
          ox = nx;
          oy = ny;
        }
      }
      return { d: best, ox, oy };
    }

    function step(dt: number, t: number) {
      const sy = window.scrollY;
      const live = t * 1000 + start - pointer.at < 3000;

      for (const f of flies) {
        f.heading += Math.sin(t * f.wobbleRate + f.phase) * f.wobble * dt;
        let vx = Math.cos(f.heading) * f.speed;
        let vy = Math.sin(f.heading) * f.speed;

        if (live) {
          const dx = pointer.x - f.x;
          const dy = pointer.y - f.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < SEE) {
            const near = smoothstep(SEE, 40, d);
            // Drawn in until ORBIT, then held there and swung around the cursor.
            const radial = clamp((d - ORBIT) / 110, -1, 1) * 70 * f.curiosity;
            const swing = 38 * f.curiosity * f.spin;
            vx += ((dx / d) * radial - (dy / d) * swing) * near;
            vy += ((dy / d) * radial + (dx / d) * swing) * near;
          }
        }

        vx += f.ix;
        vy += f.iy;
        const decay = Math.exp(-dt * 1.6);
        f.ix *= decay;
        f.iy *= decay;
        f.flash *= Math.exp(-dt * 1.2);

        const text = nearestText(f.x, f.y + sy);
        if (text.d < AVOID_PUSH) {
          const push = (1 - text.d / AVOID_PUSH) * 90;
          vx += text.ox * push;
          vy += text.oy * push;
        }

        f.x += vx * dt;
        f.y += vy * dt;
        if (f.x < -MARGIN) f.x = w + MARGIN;
        else if (f.x > w + MARGIN) f.x = -MARGIN;
        if (f.y < -MARGIN) f.y = h + MARGIN;
        else if (f.y > h + MARGIN) f.y = -MARGIN;
      }
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);
      if (!sprite) return;
      const sy = window.scrollY;

      for (const f of flies) {
        const open = smoothstep(
          0,
          AVOID_FADE,
          nearestText(f.x, f.y + sy).d,
        );
        if (open < 0.02) continue;

        const pulse = reduced.matches
          ? 0.7
          : 0.5 + 0.5 * Math.sin(t * f.rate + f.phase);
        const glow = (0.22 + 0.78 * pulse * pulse + f.flash) * open;
        const size = f.size * (0.8 + 0.4 * pulse + f.flash * 0.6);

        ctx!.globalAlpha = Math.min(1, glow) * 0.9;
        ctx!.drawImage(sprite, f.x - size / 2, f.y - size / 2, size, size);
        ctx!.globalAlpha = Math.min(1, 0.35 + glow);
        ctx!.fillStyle = core;
        ctx!.fillRect(f.x - 1, f.y - 1, 2, 2);
      }
      ctx!.globalAlpha = 1;
    }

    function loop(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = (now - start) / 1000;
      step(dt, t);
      draw(t);
      raf = requestAnimationFrame(loop);
    }

    function paint() {
      draw((performance.now() - start) / 1000);
    }

    function sync() {
      const shouldRun = visible && !document.hidden && !reduced.matches;
      if (shouldRun && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else if (!shouldRun) {
        if (running) cancelAnimationFrame(raf);
        running = false;
        paint();
      }
    }

    function onPointer(e: PointerEvent) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.at = performance.now();
    }

    // Clicking bare page scatters them; links, buttons and selections do not.
    function onClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest("a, button, input, textarea, select, summary")) return;
      if (window.getSelection()?.toString()) return;
      for (const f of flies) {
        const dx = f.x - e.clientX;
        const dy = f.y - e.clientY;
        const d = Math.hypot(dx, dy) || 1;
        const kick = 260 * smoothstep(420, 0, d);
        f.ix += (dx / d) * kick;
        f.iy += (dy / d) * kick;
        f.flash = Math.max(f.flash, 0.8 * smoothstep(420, 0, d));
      }
    }

    function onResize() {
      resize();
      if (!running) paint();
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
      if (!running) paint();
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });

    // Text reflows (fonts loading, wrapping, hover cards) move the boxes.
    const bodyRO = new ResizeObserver(() => {
      measureBoxes();
      if (!running) paint();
    });
    bodyRO.observe(document.body);
    document.fonts?.ready.then(() => {
      measureBoxes();
      if (!running) paint();
    });

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      bodyRO.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("click", onClick);
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
