"use client";

import { useEffect, useRef } from "react";

/**
 * A small astronaut drifting across the page on a fixed canvas, tumbling
 * slowly on the end of a loose tether.
 *
 * It floats in from one edge, turns over as it goes, flexes its limbs a
 * little, and leaves the other side; after a pause another pass begins. A
 * click on bare page gives it a spin. Text blocks (data-field-avoid) fade it
 * out as it passes behind them. With reduced motion it hangs still.
 */

const AVOID_PAD = 12;
const AVOID_FADE = 90;
const SCALE = 1.45;
const TETHER_NODES = 16;
const TETHER_SEG = 10;
const REST = 7; // seconds between passes

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

type Box = { l: number; t: number; r: number; b: number };

export default function Astronaut() {
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
    let paper = "#101519";
    let signal = "#ff6a38";
    let raf = 0;
    let running = false;
    let visible = true;
    let last = performance.now();
    const start = last;

    // One drifter: position, velocity, orientation and the tether behind it.
    const a = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rot: 0.4,
      spin: 0.16,
      waitUntil: 0,
    };
    const tether = new Float32Array(TETHER_NODES * 2);

    function readColors() {
      const cs = getComputedStyle(root);
      ink = cs.getPropertyValue("--ink").trim() || ink;
      paper = cs.getPropertyValue("--paper").trim() || paper;
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
        best = Math.min(best, Math.hypot(dx, dy));
      }
      return best;
    }

    function resetTether() {
      for (let i = 0; i < TETHER_NODES; i++) {
        tether[i * 2] = a.x - Math.sign(a.vx || 1) * i * TETHER_SEG;
        tether[i * 2 + 1] = a.y;
      }
    }

    // Enter from the right edge, heading left and a little down, or the mirror.
    function launch(now: number) {
      const fromRight = Math.random() < 0.5;
      const speed = 22 + Math.random() * 12;
      a.x = fromRight ? w + 120 : -120;
      // The band under the text, so a pass is seen in full and not faded out.
      a.y = h * (0.74 + Math.random() * 0.14);
      a.vx = (fromRight ? -1 : 1) * speed;
      a.vy = (Math.random() - 0.6) * 5;
      a.rot = Math.random() * Math.PI * 2;
      a.spin = (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.12);
      a.waitUntil = now + REST * 1000;
      resetTether();
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureBoxes();
    }

    function step(dt: number, now: number) {
      const away = a.vx < 0 ? a.x < -140 : a.x > w + 140;
      if (away && now > a.waitUntil) launch(now);
      else if (away) a.waitUntil = Math.max(a.waitUntil, now);

      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.rot += a.spin * dt;
      // A click's extra spin settles back to a slow tumble.
      const base = 0.16 * Math.sign(a.spin || 1);
      a.spin += (base - a.spin) * Math.min(1, dt * 0.5);

      // The tether trails the pack: each link follows the one before it.
      tether[0] = a.x;
      tether[1] = a.y;
      for (let i = 1; i < TETHER_NODES; i++) {
        const px = tether[(i - 1) * 2];
        const py = tether[(i - 1) * 2 + 1];
        let dx = tether[i * 2] - px;
        let dy = tether[i * 2 + 1] - py;
        dy += 0.6;
        dx += Math.sin(now / 1000 + i * 0.7) * 0.4;
        const d = Math.hypot(dx, dy) || 1;
        tether[i * 2] += (px + (dx / d) * TETHER_SEG - tether[i * 2]) * 0.35;
        tether[i * 2 + 1] +=
          (py + (dy / d) * TETHER_SEG - tether[i * 2 + 1]) * 0.35;
      }
    }

    function limb(
      x0: number,
      y0: number,
      angle: number,
      len: number,
      width: number,
    ) {
      const x1 = x0 + Math.sin(angle) * len;
      const y1 = y0 + Math.cos(angle) * len;
      ctx!.lineWidth = width;
      ctx!.beginPath();
      ctx!.moveTo(x0, y0);
      ctx!.lineTo(x1, y1);
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.arc(x1, y1, width * 0.58, 0, Math.PI * 2);
      ctx!.fill();
    }

    function draw(now: number) {
      ctx!.clearRect(0, 0, w, h);
      const t = reduced.matches ? 0 : (now - start) / 1000;
      const sy = window.scrollY;

      const mid = TETHER_NODES >> 1;
      const d = Math.min(
        textDistance(a.x, a.y + sy),
        textDistance(tether[mid * 2], tether[mid * 2 + 1] + sy),
      );
      const open = smoothstep(0, AVOID_FADE, d);
      if (open < 0.02 || a.x < -200 || a.x > w + 200) return;

      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";

      // Tether.
      ctx!.globalAlpha = 0.35 * open;
      ctx!.strokeStyle = ink;
      ctx!.lineWidth = 1.2;
      ctx!.beginPath();
      ctx!.moveTo(tether[0], tether[1]);
      for (let i = 1; i < TETHER_NODES - 1; i++) {
        const mx = (tether[i * 2] + tether[(i + 1) * 2]) / 2;
        const my = (tether[i * 2 + 1] + tether[(i + 1) * 2 + 1]) / 2;
        ctx!.quadraticCurveTo(tether[i * 2], tether[i * 2 + 1], mx, my);
      }
      ctx!.stroke();

      ctx!.save();
      ctx!.translate(a.x, a.y);
      ctx!.rotate(a.rot);
      ctx!.scale(SCALE, SCALE);
      ctx!.globalAlpha = 0.92 * open;
      ctx!.fillStyle = ink;
      ctx!.strokeStyle = ink;

      const s = (f: number, ph: number) => Math.sin(t * f + ph);

      // Pack behind the torso.
      ctx!.globalAlpha = 0.5 * open;
      ctx!.beginPath();
      ctx!.roundRect(-13, -11, 26, 25, 5);
      ctx!.fill();
      ctx!.globalAlpha = 0.92 * open;

      // Legs and arms flex slowly out of phase.
      limb(-4, 12, 0.22 + 0.2 * s(0.7, 0), 13, 6.2);
      limb(4, 12, -0.22 + 0.2 * s(0.7, 2), 13, 6.2);
      limb(-8, -7, 2.3 + 0.28 * s(0.9, 1), 11, 4.6);
      limb(8, -7, -2.3 + 0.28 * s(0.9, 3), 11, 4.6);

      // Torso.
      ctx!.beginPath();
      ctx!.roundRect(-9, -11, 18, 25, 5.5);
      ctx!.fill();

      // Helmet and visor.
      ctx!.beginPath();
      ctx!.arc(0, -18, 10, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = paper;
      ctx!.beginPath();
      ctx!.ellipse(1.6, -18.5, 6.4, 5.4, 0, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.strokeStyle = signal;
      ctx!.lineWidth = 1.4;
      ctx!.beginPath();
      ctx!.arc(1.6, -18.5, 3.6, Math.PI * 1.1, Math.PI * 1.55);
      ctx!.stroke();

      // Chest panel: one small accent light.
      ctx!.fillStyle = signal;
      ctx!.globalAlpha = (0.6 + 0.4 * (reduced.matches ? 1 : s(2.2, 0))) * open;
      ctx!.fillRect(-2, -3, 4, 3);

      ctx!.restore();
      ctx!.globalAlpha = 1;
    }

    function loop(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      step(dt, now);
      draw(now);
      raf = requestAnimationFrame(loop);
    }

    function paint() {
      draw(performance.now());
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

    // A click on bare page gives it a spin; links and buttons do not.
    function onClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest("a, button, input, textarea, select, summary")) return;
      if (window.getSelection()?.toString()) return;
      const dir = e.clientX < a.x ? 1 : -1;
      a.spin += dir * 2.2;
    }

    function onResize() {
      resize();
      if (!running) paint();
    }

    readColors();
    resize();
    // Start mid-pass, a little right of centre, so it is there on arrival.
    a.x = w * 0.78;
    a.y = h * 0.78;
    a.vx = -24;
    a.vy = -2;
    a.waitUntil = last + REST * 1000;
    resetTether();
    sync();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);

    const mo = new MutationObserver(() => {
      readColors();
      if (!running) paint();
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });

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
    window.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      bodyRO.disconnect();
      window.removeEventListener("resize", onResize);
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
