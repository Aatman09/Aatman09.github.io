import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { href: "/", label: "Work" },
  { href: "/experience", label: "Experience" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-paper/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[68rem] items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-[0.9375rem] font-semibold tracking-tight text-ink"
        >
          <span
            aria-hidden="true"
            className="grid h-6 w-6 place-items-center bg-ink font-mono text-[0.625rem] font-semibold text-paper"
          >
            AS
          </span>
          Aatman Soni
        </Link>

        <div className="flex items-center gap-5 sm:gap-7">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="label text-graphite transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
