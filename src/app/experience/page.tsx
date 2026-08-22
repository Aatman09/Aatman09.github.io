import Link from "next/link";
import { experience } from "@/data/experience";

export const metadata = {
  title: "Experience — Aatman Soni",
};

export default function ExperiencePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:-translate-x-1 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        ← Back to work
      </Link>

      <p className="mt-12 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Experience</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-zinc-900 sm:text-5xl dark:text-zinc-50">
        {experience.company}
      </h1>
      <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {experience.role} · {experience.location} · {experience.dates}
      </p>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        {experience.summary}
      </p>

      <div className="mt-14 space-y-10 border-l border-indigo-200 pl-6 dark:border-indigo-900 sm:pl-9">
        {experience.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {section.heading}
            </h2>
            <div className="mt-2 space-y-3">
              {section.body.map((para, i) => (
                <p
                  key={i}
                  className="text-sm leading-7 text-zinc-700 dark:text-zinc-300"
                >
                  {para}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
