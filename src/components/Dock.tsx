"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { href: "/", label: "home", active: (p: string) => p === "/" },
  {
    href: "/projects",
    label: "projects",
    active: (p: string) => p.startsWith("/projects"),
  },
  {
    href: "/experience",
    label: "experience",
    active: (p: string) => p.startsWith("/experience"),
  },
];

export default function Dock() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-paper/70">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-[68rem] items-center justify-center gap-6 px-6 sm:gap-8"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`font-mono text-[0.8125rem] tracking-wide transition-colors hover:text-ink ${
              l.active(pathname) ? "text-ink" : "text-graphite"
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
