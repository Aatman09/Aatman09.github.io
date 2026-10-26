import type { Metadata } from "next";
import Link from "next/link";
import ProjectRow from "@/components/ProjectRow";
import { projects } from "@/data/projects";
import { experience } from "@/data/experience";

export const metadata: Metadata = {
  title: "Projects — Aatman Soni",
  description:
    "Projects, experience and stack: int8 quantization, KV-cache decoding, a ConvNeXt port, and document-graph retrieval.",
};

const stack = [
  { group: "Languages", items: ["Python", "C++", "SQL", "TypeScript"] },
  {
    group: "ML / AI",
    items: [
      "PyTorch",
      "JAX",
      "Flax",
      "Hugging Face Transformers",
      "PEFT / LoRA",
      "NumPy",
      "Pandas",
      "vLLM",
      "llama.cpp",
    ],
  },
  {
    group: "Tools",
    items: [
      "Git",
      "Docker",
      "Linux",
      "AWS EC2",
      "PostgreSQL",
      "FastAPI",
      "SQLAlchemy",
      "Redis",
      "React",
      "Next.js",
    ],
  },
];

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 pt-24 sm:pt-28">
      {/* Projects */}
      <section id="projects">
        <div className="flex items-baseline justify-between gap-6 border-b border-ink pb-2.5">
          <h2 className="label text-ink">Projects</h2>
          <p className="label text-graphite">Value · project · stack</p>
        </div>
        <div>
          {projects.map((p) => (
            <ProjectRow key={p.slug} project={p} />
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mt-24 sm:mt-28">
        <h2 className="label border-b border-ink pb-2.5 text-ink">
          Experience
        </h2>
        <Link
          href="/experience"
          className="group grid grid-cols-1 gap-x-8 gap-y-3 border-b border-rule px-3 py-7 transition-colors hover:bg-surface sm:grid-cols-[9rem_1fr] sm:px-4"
        >
          <p className="label text-graphite">{experience.dates}</p>
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                {experience.company}
              </h3>
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-sm text-graphite transition-transform group-hover:translate-x-1 group-hover:text-accent-text"
              >
                →
              </span>
            </div>
            <p className="label mt-1.5 text-graphite">{experience.role}</p>
            <p className="mt-3 max-w-xl text-[0.9375rem] leading-7 text-ink-2">
              Contributed to a production Intelligent Document Processing
              system: section reconstruction on top of PaddleOCR-VL, a
              vision-language model chosen and served for entity extraction,
              and an API endpoint moved onto a dedicated inference server.
            </p>
          </div>
        </Link>
      </section>

      {/* Stack */}
      <section className="mt-24 sm:mt-28">
        <h2 className="label border-b border-ink pb-2.5 text-ink">Stack</h2>
        <div className="grid gap-x-10 gap-y-8 pt-7 sm:grid-cols-3">
          {stack.map((s) => (
            <div key={s.group}>
              <h3 className="label text-graphite">{s.group}</h3>
              <ul className="mt-3 space-y-1.5">
                {s.items.map((item) => (
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
  );
}
