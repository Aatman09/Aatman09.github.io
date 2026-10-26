import Link from "next/link";
import CountUp from "@/components/CountUp";
import type { Project } from "@/data/projects";

/**
 * One project as an open panel: no box, no rules. The defining number leads,
 * then the name and a short account. Panels sit side by side on a wide screen
 * and stack with space between them on a phone.
 */
export default function ProjectPanel({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex min-w-0 flex-col outline-offset-8"
    >
      <p className="font-display text-[2.5rem] font-semibold leading-none tracking-tight text-ink transition-colors duration-300 group-hover:text-accent-text xl:text-[2.25rem] 2xl:text-[2.75rem]">
        <CountUp text={project.marker} />
      </p>
      <p className="label mt-2 text-graphite">{project.markerLabel}</p>

      <h2 className="mt-7 flex items-baseline justify-between gap-3 font-display text-lg font-semibold tracking-tight text-ink">
        <span className="min-w-0">{project.title}</span>
        <span
          aria-hidden="true"
          className="shrink-0 font-mono text-sm text-graphite transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-accent-text"
        >
          →
        </span>
      </h2>

      <p className="mt-3 text-[0.875rem] leading-6 text-ink-2 xl:line-clamp-6">
        {project.oneLiner}
      </p>

      {project.markerNote && (
        <p className="tnum mt-3 font-mono text-xs leading-5 text-graphite">
          {project.markerNote}
        </p>
      )}

      <p className="label mt-5 leading-5 text-graphite">
        {project.stack.slice(0, 4).join(" · ")}
        {project.live && <span className="ml-2 text-accent-text">Live</span>}
      </p>
    </Link>
  );
}
