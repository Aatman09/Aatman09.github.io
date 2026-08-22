import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/experience", label: "Experience" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/75 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/75">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="group flex items-center gap-2 font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm shadow-indigo-500/30 transition-transform group-hover:-rotate-6">AS</span>
          Aatman Soni
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
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
