"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { href: "/", label: "Home", active: (p: string) => p === "/" },
  {
    href: "/projects",
    label: "Projects",
    active: (p: string) => p.startsWith("/projects"),
  },
  {
    href: "/experience",
    label: "Experience",
    active: (p: string) => p.startsWith("/experience"),
  },
];

export default function Dock() {
  const pathname = usePathname();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <nav
        aria-label="Primary"
        className="pointer-events-auto flex items-center gap-1 border border-rule-strong bg-surface p-1.5"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`label px-3 py-2 transition-colors hover:text-ink ${
              l.active(pathname) ? "bg-surface-2 text-ink" : "text-graphite"
            }`}
          >
            {l.label}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}
