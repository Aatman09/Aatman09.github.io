import Link from "next/link";
import { getProject } from "@/data/projects";

type Props = {
  children: React.ReactNode;
} & (
  | { slug: string; href?: undefined; title?: undefined; blurb?: undefined }
  | { slug?: undefined; href: string; title: string; blurb: string }
);

const LINK =
  "pointer-events-auto underline decoration-[color-mix(in_srgb,var(--ink)_35%,transparent)] decoration-1 underline-offset-[5px] outline-none transition-colors hover:text-ink hover:decoration-ink focus-visible:text-ink focus-visible:decoration-ink";

/**
 * A name in running prose that backs itself up. On a pointer device, hovering
 * or focusing it opens a small card with the evidence; on touch the card is
 * hidden and the link just goes to the page.
 */
export default function Cited(props: Props) {
  const project = props.slug ? getProject(props.slug) : undefined;
  const href = project ? `/projects/${project.slug}` : props.href;
  if (!href) return <>{props.children}</>;

  return (
    <span className="group relative">
      <Link href={href} className={LINK}>
        {props.children}
      </Link>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-3 hidden w-72 -translate-x-1/2 border border-rule-strong bg-surface p-3.5 text-left opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:hover)]:block"
      >
        {project ? (
          <>
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-display text-xl font-semibold leading-none tracking-tight text-accent-text">
                {project.marker}
              </span>
              <span className="label text-graphite">{project.markerLabel}</span>
            </span>
            <span className="mt-2.5 block text-[0.8125rem] font-normal leading-6 text-ink">
              {project.title}
            </span>
            {project.markerNote && (
              <span className="tnum mt-1 block text-xs font-normal leading-5 text-graphite">
                {project.markerNote}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="text-[0.8125rem] font-normal leading-6 text-ink">
              {props.title}
            </span>
            <span className="mt-1 block text-xs font-normal leading-5 text-graphite">
              {props.blurb}
            </span>
          </>
        )}
      </span>
    </span>
  );
}
