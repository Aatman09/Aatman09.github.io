import Link from "next/link";
import { experience } from "@/data/experience";

export const metadata = {
  title: "Experience — Aatman Soni",
};

export default function ExperiencePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        ← Back
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        {experience.company}
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
        {experience.role} · {experience.location} · {experience.dates}
      </p>
      <p className="mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
        {experience.summary}
      </p>

      <div className="mt-10 space-y-8">
        {experience.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {section.heading}
            </h2>
            <div className="mt-2 space-y-3">
              {section.body.map((para, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
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
