"use client";

import { useEffect, useRef } from "react";

/**
 * A few jellyfish drifting up the page on a fixed canvas behind the content.
 *
 * Each one swims by pulsing: the bell squeezes, a kick of thrust pushes it
 * upward, then it relaxes and sinks. Its tentacles are chains that trail
 * behind the motion with a lag, which is what makes them read as soft. They
 * lean toward the cursor from a distance and keep a respectful gap from it;
 * a click makes them bolt away. Text blocks (data-field-avoid) steer them
 * aside and fade them out as they approach. With reduced motion they hang
 * still.
 */

const AVOID_PAD = 12;
const AVOID_FADE = 90; // opacity eases in over this distance from text
const AVOID_PUSH = 150; // steering away from text starts this close
const SEE = 340; // how far they notice the cursor
const KEEP_OFF = 110; // gap they keep from it
const TENTACLES = 8;
const NODES = 10;

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

type Jelly = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tilt: number;
  scale: number;
  rate: number; // pulses per second
  phase: number; // 0..1 within the pulse
  sway: number;
  swayRate: number;
  curiosity: number;
  boost: number; // a click makes the pulse faster for a while
  // Tentacle chains: [x0, y0, x1, y1, ...] per tentacle, rim first.
  chains: Float32Array[];
  attach: number[]; // where along the rim each tentacle hangs, -0.8..0.8
  seg: number[];
};

type Box = { l: number; t: number; r: number; b: number };

export default function Jellyfish() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    let w = 0;
    let h = 0;
    const jellies: Jelly[] = [];
    let boxes: Box[] = [];
    let rgb: [number, number, number] = [255, 106, 56];
    let raf = 0;
    let running = false;
    let visible = true;
    let last = performance.now();
    const start = last;
    const pointer = { x: 0, y: 0, at: -Infinity };

    const BELL_W = 30;
    const BELL_H = 24;

    function readColors() {
      const cs = getComputedStyle(root);
      const dark = root.classList.contains("dark");
      rgb = hexToRgb(
        cs.getPropertyValue(dark ? "--signal" : "--accent-text") || "#ff6a38",
      );
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

    function spawn(): Jelly {
      const scale = 0.7 + Math.random() * 0.8;
      const attach = Array.from(
        { length: TENTACLES },
        (_, i) => -0.8 + (1.6 * i) / (TENTACLES - 1),
      );
      const seg = attach.map(
        (a) => (7 + Math.random() * 5) * scale * (1 - Math.abs(a) * 0.35),
      );
      const x = Math.random() * w;
      const y = Math.random() * h;
      return {
        x,
        y,
        vx: 0,
        vy: 0,
        tilt: 0,
        scale,
        rate: 0.32 + Math.random() * 0.2,
        phase: Math.random(),
        sway: Math.random() * Math.PI * 2,
        swayRate: 0.25 + Math.random() * 0.3,
        curiosity: 0.3 + Math.random() * 0.7,
        boost: 0,
        attach,
        seg,
        chains: attach.map((a, k) => {
          const c = new Float32Array(NODES * 2);
          for (let i = 0; i < NODES; i++) {
            c[i * 2] = x + a * BELL_W * scale;
            c[i * 2 + 1] = y + i * seg[k];
          }
          return c;
        }),
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(clamp((w * h) / 150000, 4, 8));
      while (jellies.length < target) jellies.push(spawn());
      jellies.length = target;
      measureBoxes();
    }

    function nearestText(x: number, pageY: number) {
      let best = Infinity;
      let ox = 0;
      let oy = 0;
      for (const b of boxes) {
        const cx = clamp(x, b.l, b.r);
        const cy = clamp(pageY, b.t, b.b);
        const dx = x - cx;
        const dy = pageY - cy;
        const d = Math.hypot(dx, dy);
        let nx = dx;
        let ny = dy;
        if (d === 0) {
          const left = x - b.l;
          const right = b.r - x;
          const up = pageY - b.t;
          const down = b.b - pageY;
          const m = Math.min(left, right, up, down);
          nx = m === left ? -1 : m === right ? 1 : 0;
          ny = m === up ? -1 : m === down ? 1 : 0;
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

    // 0..1 contraction: a quick squeeze, then a long relax.
    const squeeze = (phase: number) =>
      phase < 0.35 ? Math.sin((Math.PI * phase) / 0.35) : 0;

    function step(dt: number, t: number) {
      const sy = window.scrollY;
      const live = t * 1000 + start - pointer.at < 3500;

      for (const j of jellies) {
        const speedUp = 1 + j.boost * 1.6;
        j.phase = (j.phase + dt * j.rate * speedUp) % 1;
        const c = squeeze(j.phase);

        // Thrust along the bell's axis during the squeeze; sink while it relaxes.
        const thrust = c * 150 * j.scale * speedUp;
        const ax = Math.sin(j.tilt) * thrust + Math.sin(t * j.swayRate + j.sway) * 10;
        let ay = -Math.cos(j.tilt) * thrust + 16;

        let axx = ax;
        if (live) {
          const dx = pointer.x - j.x;
          const dy = pointer.y - j.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < SEE) {
            const near = smoothstep(SEE, KEEP_OFF, d);
            const dir = d > KEEP_OFF ? 1 : -1.6;
            axx += (dx / d) * 34 * j.curiosity * near * dir;
            ay += (dy / d) * 34 * j.curiosity * near * dir;
          }
        }

        const text = nearestText(j.x, j.y + sy);
        if (text.d < AVOID_PUSH) {
          const push = (1 - text.d / AVOID_PUSH) * 260;
          axx += text.ox * push;
          ay += text.oy * push;
        }

        j.vx += axx * dt;
        j.vy += ay * dt;
        const drag = Math.exp(-dt * 1.3);
        j.vx *= drag;
        j.vy *= drag;
        j.boost *= Math.exp(-dt * 0.6);

        j.x += j.vx * dt;
        j.y += j.vy * dt;
        const target = clamp(j.vx / 70, -0.55, 0.55);
        j.tilt += (target - j.tilt) * Math.min(1, dt * 2);

        // Float off the top, come back up from the bottom.
        const reach = 150 * j.scale;
        if (j.y < -reach) {
          j.y = h + reach;
          resetChains(j);
        } else if (j.y > h + reach * 1.4) {
          j.y = -reach;
          resetChains(j);
        }
        if (j.x < -80) j.x = w + 80;
        else if (j.x > w + 80) j.x = -80;

        followChains(j, t);
      }
    }

    function rimPoint(j: Jelly, a: number) {
      const cos = Math.cos(j.tilt);
      const sin = Math.sin(j.tilt);
      const bx = a * BELL_W * j.scale;
      return [j.x + bx * cos, j.y + bx * sin];
    }

    function resetChains(j: Jelly) {
      j.chains.forEach((c, k) => {
        const [rx, ry] = rimPoint(j, j.attach[k]);
        for (let i = 0; i < NODES; i++) {
          c[i * 2] = rx;
          c[i * 2 + 1] = ry + i * j.seg[k];
        }
      });
    }

    // Each node trails the one above it at a fixed distance, a little late.
    function followChains(j: Jelly, t: number) {
      j.chains.forEach((c, k) => {
        const [rx, ry] = rimPoint(j, j.attach[k]);
        c[0] = rx;
        c[1] = ry;
        const seg = j.seg[k];
        for (let i = 1; i < NODES; i++) {
          const px = c[(i - 1) * 2];
          const py = c[(i - 1) * 2 + 1];
          let dx = c[i * 2] - px;
          let dy = c[i * 2 + 1] - py;
          // A small downward lean and a slow wave keep them from going rigid.
          dy += 1.2;
          dx += Math.sin(t * 1.3 + i * 0.6 + k) * 0.35;
          const d = Math.hypot(dx, dy) || 1;
          const tx = px + (dx / d) * seg;
          const ty = py + (dy / d) * seg;
          c[i * 2] += (tx - c[i * 2]) * 0.42;
          c[i * 2 + 1] += (ty - c[i * 2 + 1]) * 0.42;
        }
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      const sy = window.scrollY;
      const [r, g, b] = rgb;

      for (const j of jellies) {
        const tip = j.chains[Math.floor(TENTACLES / 2)];
        const samples: [number, number][] = [
          [j.x, j.y],
          [tip[(NODES >> 1) * 2], tip[(NODES >> 1) * 2 + 1]],
          [tip[(NODES - 1) * 2], tip[(NODES - 1) * 2 + 1]],
        ];
        let d = Infinity;
        for (const [sx, syy] of samples) {
          d = Math.min(d, nearestText(sx, syy + sy).d);
        }
        const open = smoothstep(0, AVOID_FADE, d);
        if (open < 0.02) continue;

        const c = reduced.matches ? 0 : squeeze(j.phase);
        const bw = BELL_W * j.scale * (1 + 0.16 * c);
        const bh = BELL_H * j.scale * (1 - 0.3 * c);

        // Tentacles first, so the bell sits over their roots.
        ctx!.lineCap = "round";
        ctx!.lineJoin = "round";
        j.chains.forEach((chain, k) => {
          const thick = k === 2 || k === 5;
          ctx!.strokeStyle = `rgba(${r},${g},${b},${(thick ? 0.34 : 0.26) * open})`;
          ctx!.lineWidth = thick ? 1.8 : 1;
          ctx!.beginPath();
          ctx!.moveTo(chain[0], chain[1]);
          for (let i = 1; i < NODES - 1; i++) {
            const mx = (chain[i * 2] + chain[(i + 1) * 2]) / 2;
            const my = (chain[i * 2 + 1] + chain[(i + 1) * 2 + 1]) / 2;
            ctx!.quadraticCurveTo(chain[i * 2], chain[i * 2 + 1], mx, my);
          }
          ctx!.stroke();
        });

        ctx!.save();
        ctx!.translate(j.x, j.y);
        ctx!.rotate(j.tilt);
        ctx!.beginPath();
        ctx!.moveTo(-bw, 0);
        ctx!.bezierCurveTo(-bw, -bh * 1.35, bw, -bh * 1.35, bw, 0);
        ctx!.quadraticCurveTo(0, bh * 0.22, -bw, 0);
        ctx!.closePath();
        ctx!.fillStyle = `rgba(${r},${g},${b},${0.1 * open})`;
        ctx!.fill();
        ctx!.strokeStyle = `rgba(${r},${g},${b},${0.62 * open})`;
        ctx!.lineWidth = 1.2;
        ctx!.stroke();

        // An inner dome gives the bell some depth without any shading.
        ctx!.beginPath();
        ctx!.moveTo(-bw * 0.6, -bh * 0.05);
        ctx!.bezierCurveTo(
          -bw * 0.6,
          -bh * 0.85,
          bw * 0.6,
          -bh * 0.85,
          bw * 0.6,
          -bh * 0.05,
        );
        ctx!.strokeStyle = `rgba(${r},${g},${b},${0.28 * open})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
        ctx!.restore();
      }
    }

    function loop(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = (now - start) / 1000;
      step(dt, t);
      draw();
      raf = requestAnimationFrame(loop);
    }

    function paint() {
      const t = (performance.now() - start) / 1000;
      for (const j of jellies) followChains(j, t);
      draw();
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

    // Clicking bare page startles them; links, buttons and selections do not.
    function onClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest("a, button, input, textarea, select, summary")) return;
      if (window.getSelection()?.toString()) return;
      for (const j of jellies) {
        const dx = j.x - e.clientX;
        const dy = j.y - e.clientY;
        const d = Math.hypot(dx, dy) || 1;
        const near = smoothstep(520, 0, d);
        j.vx += (dx / d) * 260 * near;
        j.vy += (dy / d) * 260 * near;
        j.boost = Math.max(j.boost, near * 1.2);
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
