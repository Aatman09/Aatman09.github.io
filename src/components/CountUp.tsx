"use client";

import { useLayoutEffect, useRef, useState } from "react";

const DURATION = 900;

/**
 * Splits "+0.56%" into prefix "+", number 0.56, suffix "%". A value with no
 * digits ("EN→ES") has nothing to count and is rendered as is.
 */
function parse(text: string) {
  const m = text.match(/^(\D*)(\d+(?:\.\d+)?)([\s\S]*)$/);
  if (!m) return null;
  const decimals = m[2].includes(".") ? m[2].length - m[2].indexOf(".") - 1 : 0;
  return { prefix: m[1], value: parseFloat(m[2]), decimals, suffix: m[3] };
}

/**
 * Counts up to its value the first time it scrolls into view. Server HTML and
 * reduced-motion users get the final value, so nothing depends on the script.
 */
export default function CountUp({ text }: { text: string }) {
  const parts = parse(text);
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !parts) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { value } = parts;
    // Starts the count from zero before first paint; the server HTML keeps the final value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShown(0);
    let raf = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / DURATION, 1);
          // ease-out cubic: fast start, soft landing
          setShown(value * (1 - (1 - p) ** 3));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  if (!parts) return <>{text}</>;

  const { prefix, decimals, suffix, value } = parts;
  const n = shown === null ? value : shown;
  return (
    <span ref={ref} className="tnum">
      {prefix}
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}
