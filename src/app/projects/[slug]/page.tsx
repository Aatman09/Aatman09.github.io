import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:-translate-x-1 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        ← Back to work
      </Link>

      <div className="mt-12 flex items-start justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-[-0.035em] text-zinc-900 sm:text-5xl dark:text-zinc-50">
          {project.title}
        </h1>
        {project.status === "in-progress" && (
          <span className="mt-1 shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            in progress
          </span>
        )}
      </div>

      <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        {project.oneLiner}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {s}
          </span>
        ))}
      </div>

      {project.github && (
        <a
          href={project.github}
          className="mt-7 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition hover:bg-indigo-500"
        >
          View on GitHub →
        </a>
      )}

      {project.resultsTable && (
        <div className="mt-10 overflow-x-auto rounded-2xl border border-zinc-200 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                {project.resultsTable.headers.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {project.resultsTable.rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-4 py-2 text-zinc-700 dark:text-zinc-300"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-14 space-y-10">
        {project.deepDive.map((section) => (
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
