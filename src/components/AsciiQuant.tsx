/**
 * A quantizer drawn in text. A weight curve ('.') and the same curve snapped
 * to 7 integer levels ('#'), computed rather than typed so the two always
 * agree. Server-rendered and static.
 */

const COLS = 58;
const LEVELS = 3; // 2^(3-1)-1, i.e. int3
const ROWS_PER_LEVEL = 2;
const ROWS = LEVELS * ROWS_PER_LEVEL * 2 + 1;

const curve = (x: number) => 0.92 * Math.sin(x * Math.PI * 2 * 1.15 + 0.5);

// Level l (an integer in [-LEVELS, LEVELS]) sits on an exact row.
const levelRow = (l: number) => (LEVELS - l) * ROWS_PER_LEVEL;
const valueRow = (v: number) =>
  Math.min(ROWS - 1, Math.max(0, Math.round(((1 - v) / 2) * (ROWS - 1))));

function build() {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));
  for (let c = 0; c < COLS; c++) {
    const v = curve(c / (COLS - 1));
    const q = Math.round(v * LEVELS);
    grid[levelRow(q)][c] = "#";
    const r = valueRow(v);
    if (grid[r][c] === " ") grid[r][c] = ".";
  }
  return grid
    .map((row, r) => {
      const isLevel = r % ROWS_PER_LEVEL === 0;
      const l = LEVELS - r / ROWS_PER_LEVEL;
      const label = isLevel ? `${l > 0 ? "+" : l < 0 ? "-" : " "}${Math.abs(l)} ┤` : "   │";
      return label + row.join("");
    })
    .join("\n");
}

const ART = build();

export default function AsciiQuant({ className }: { className?: string }) {
  return (
    <figure aria-hidden="true" className={className}>
      <pre className="font-mono text-[10px] leading-[1.25] text-graphite">
        {ART}
      </pre>
      <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[0.13em] text-graphite">
        <span className="text-accent-text">#</span> int3 · 7 levels{"   "}
        <span className="text-ink">.</span> weights
      </figcaption>
    </figure>
  );
}
