import Link from "next/link";
import CountUp from "@/components/CountUp";
import type { Project } from "@/data/projects";

/**
 * One project as a row in a measured index. The row is led by the project's
 * real defining value rather than a sequence number, because the value is
 * the thing a technical reader is actually scanning for.
 */
export default function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative grid grid-cols-1 gap-x-8 gap-y-3 border-b border-rule px-3 py-7 transition-colors hover:bg-surface sm:grid-cols-[9rem_1fr] sm:px-4"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-0.5 origin-center scale-y-0 bg-signal transition-transform duration-300 ease-out group-hover:scale-y-100"
      />
      <div
        data-quant-avoid
        className="w-fit transition-transform duration-300 ease-out group-hover:translate-x-1.5 motion-reduce:transform-none"
      >
        <p className="font-display text-4xl font-semibold leading-none tracking-tight text-ink transition-colors group-hover:text-accent-text sm:text-[2.75rem]">
          <CountUp text={project.marker} />
        </p>
        <p className="label mt-2 text-graphite">{project.markerLabel}</p>
      </div>

      <div
        data-quant-avoid
        className="min-w-0 transition-transform duration-300 ease-out group-hover:translate-x-3 motion-reduce:transform-none"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
            {project.title}
          </h3>
          <span
            aria-hidden="true"
            className="shrink-0 font-mono text-sm text-graphite transition-transform group-hover:translate-x-2 group-hover:text-accent-text"
          >
            →
          </span>
        </div>

        <p className="mt-1.5 max-w-xl text-[0.9375rem] leading-7 text-ink-2">
          {project.oneLiner}
        </p>

        {project.markerNote && (
          <p className="tnum mt-2 font-mono text-xs text-graphite">
            {project.markerNote}
          </p>
        )}

        <p className="label mt-4 text-graphite">
          {project.stack.join(" · ")}
          {project.live && (
            <span className="ml-3 text-accent-text">Live</span>
          )}
          {project.status === "in-progress" && (
            <span className="ml-3 text-accent-text">In progress</span>
          )}
        </p>
      </div>
    </Link>
  );
}
