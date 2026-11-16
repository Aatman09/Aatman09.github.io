"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  // At the top of a page the bar is bare, so the landing sky runs behind it.
  // Once content scrolls under, it turns solid with a rule beneath.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-200 ${
        scrolled ? "border-rule bg-paper" : "border-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-[68rem] items-center justify-center px-3 sm:gap-2"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={l.active(pathname) ? "page" : undefined}
            className={`inline-flex h-11 items-center px-3 font-mono text-[0.8125rem] tracking-wide transition-colors hover:text-ink ${
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
