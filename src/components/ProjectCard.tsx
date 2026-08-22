import Link from "next/link";
import type { Project } from "@/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/70 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-indigo-700 dark:hover:shadow-indigo-950/30"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {project.title}
        </h3>
        {project.status === "in-progress" && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            in progress
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {project.oneLiner}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {s}
          </span>
        ))}
      </div>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-transform group-hover:translate-x-1 dark:text-indigo-400">
        Case study <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
