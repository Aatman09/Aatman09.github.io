import Link from "next/link";
import { experience } from "@/data/experience";
import { stack } from "@/data/stack";

export const metadata = {
  title: "Experience — Aatman Soni",
};

export default function ExperiencePage() {
  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 pt-24 sm:pt-28">
      <Link
        href="/projects"
        className="label inline-block text-graphite transition-colors hover:text-ink"
      >
        <span aria-hidden="true" className="mr-1.5 tracking-normal">
          ←
        </span>
        Projects
      </Link>

      <header className="mt-12 border-b border-ink pb-8">
        <p className="label text-graphite">{experience.dates}</p>
        <h1 className="mt-4 max-w-3xl font-display text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[3.25rem]">
          {experience.company}
        </h1>
        <p className="label mt-4 text-accent-text">
          {experience.role} · {experience.location}
        </p>
        <p className="mt-6 max-w-2xl text-[1.0625rem] leading-8 text-ink-2">
          {experience.summary}
        </p>
      </header>

      <div>
        {experience.sections.map((section) => (
          <section
            key={section.heading}
            className="grid grid-cols-1 gap-x-10 gap-y-3 border-b border-rule py-10 sm:grid-cols-[9rem_1fr]"
          >
            <h2 className="label text-graphite sm:pt-1.5">{section.label}</h2>
            <div className="min-w-0">
              <h3 className="max-w-2xl font-display text-xl font-semibold tracking-tight text-ink">
                {section.heading}
              </h3>
              <div className="mt-4 max-w-2xl space-y-4">
                {section.body.map((para, i) => (
                  <p key={i} className="text-[0.9375rem] leading-7 text-ink-2">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="grid grid-cols-1 gap-x-10 gap-y-3 py-10 sm:grid-cols-[9rem_1fr]">
          <h2 className="label text-graphite sm:pt-1.5">Stack</h2>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-3">
            {stack.map((g) => (
              <div key={g.group}>
                <h3 className="label text-graphite">{g.group}</h3>
                <ul className="mt-3 space-y-1.5">
                  {g.items.map((item) => (
                    <li
                      key={item}
                      className="font-mono text-[0.8125rem] leading-6 text-ink-2"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
