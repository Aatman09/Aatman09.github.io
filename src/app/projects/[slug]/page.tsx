import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Quantizer from "@/components/Quantizer";
import { projects, getProject } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const title = `${project.title} — Aatman Soni`;
  return {
    title,
    description: project.oneLiner,
    openGraph: { title, description: project.oneLiner, type: "article" },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 pt-10 sm:pt-14">
      <Link
        href="/"
        className="label inline-block text-graphite transition-colors hover:text-ink"
      >
        <span aria-hidden="true" className="mr-1.5 tracking-normal">
          ←
        </span>
        Work
      </Link>

      <header className="mt-12 grid grid-cols-1 gap-x-10 gap-y-6 border-b border-ink pb-9 sm:grid-cols-[9rem_1fr]">
        <div>
          <p className="font-display text-4xl font-semibold leading-none tracking-tight text-accent-text sm:text-[2.75rem]">
            {project.marker}
          </p>
          <p className="label mt-2 text-graphite">{project.markerLabel}</p>
        </div>

        <div className="min-w-0">
          <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[2.75rem]">
            {project.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[1.0625rem] leading-8 text-ink-2">
            {project.oneLiner}
          </p>
          <p className="label mt-5 text-graphite">
            {project.stack.join(" · ")}
            {project.status === "in-progress" && (
              <span className="ml-3 text-accent-text">In progress</span>
            )}
          </p>
          {(project.live || project.github) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {project.live && (
                <a
                  href={project.live}
                  className="label inline-block border border-ink bg-ink px-4 py-2.5 text-paper transition-opacity hover:opacity-80"
                >
                  Open the live app
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  className="label inline-block border border-rule-strong px-4 py-2.5 text-graphite transition-colors hover:border-ink hover:text-ink"
                >
                  Open on GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      {project.cardBullets.length > 0 && (
        <section className="mt-10 max-w-[44rem]">
          <h2 className="label text-graphite">TL;DR</h2>
          <ul className="mt-4 space-y-2.5">
            {project.cardBullets.map((b, i) => (
              <li
                key={i}
                className="flex gap-3 text-[0.9375rem] leading-7 text-ink-2"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 bg-signal"
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {project.media && (
        <figure className="mt-14">
          {/* Static export: images are served unoptimized, so a plain img is the honest choice. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.media.src}
            alt={project.media.alt}
            className="w-full border border-rule bg-surface"
          />
          {project.media.caption && (
            <figcaption className="label mt-3 text-graphite">
              {project.media.caption}
            </figcaption>
          )}
        </figure>
      )}

      {project.figure === "quantizer" && (
        <section className="mt-14">
          <div className="max-w-2xl">
            <h2 className="label text-graphite">How it works</h2>
            <p className="mt-3 text-[1.0625rem] leading-8 text-ink-2">
              Quantization makes a model smaller by storing each weight at lower
              precision. The only question worth asking is what that costs.
              Below is a weight distribution and the same weights snapped to an
              integer grid — switch the precision to watch the error open up.
            </p>
          </div>
          <div className="mt-8">
            <Quantizer />
          </div>
        </section>
      )}

      {project.resultsTable && (
        <section className="mt-14">
          <h2 className="label border-b border-rule pb-2.5 text-ink">
            Results
          </h2>
          <div className="overflow-x-auto">
            <table className="tnum w-full min-w-[34rem] border-collapse font-mono text-sm">
              <thead>
                <tr>
                  {project.resultsTable.headers.map((h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className={`label border-b border-rule px-3 py-3 font-normal text-graphite ${
                        i === 0 ? "text-left" : "text-right"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {project.resultsTable.rows.map((row, i) => {
                  const mine = project.resultsTable?.highlightRow === i;
                  return (
                    <tr key={i} className={mine ? "bg-signal-soft" : undefined}>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`border-b border-rule px-3 py-3 ${
                            j === 0
                              ? "text-left text-ink"
                              : "text-right text-ink-2"
                          } ${mine ? "text-ink" : ""}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="mt-14 max-w-[44rem]">
        {project.deepDive.map((section) =>
          section.tone === "limits" ? (
            <section
              key={section.heading}
              className="mt-12 border-l-2 border-signal bg-surface px-6 py-7"
            >
              <h2 className="label text-accent-text">Known limits</h2>
              <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-ink">
                {section.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {section.body.map((para, i) => (
                  <li key={i} className="text-[0.9375rem] leading-7 text-ink-2">
                    {para}
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section
              key={section.heading}
              className="border-t border-rule py-9 first:border-t-0 first:pt-0"
            >
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {section.body.map((para, i) => (
                  <p key={i} className="text-[0.9375rem] leading-7 text-ink-2">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ),
        )}
      </div>
    </div>
  );
}
