import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";

const skills = {
  Languages: ["Python", "C++", "SQL"],
  "ML / AI Frameworks": [
    "PyTorch",
    "JAX",
    "Flax",
    "Hugging Face Transformers",
    "NumPy",
    "Pandas",
    "Matplotlib",
    "KV Caching",
    "Quantization (int8 / int4)",
    "Mixed Precision (bf16 / fp16)",
  ],
  "Tools & Platforms": [
    "Git",
    "Docker",
    "Linux",
    "MySQL",
    "FastAPI",
    "SQLAlchemy",
    "Redis",
  ],
};

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      {/* Hero */}
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          Aatman Soni
        </h1>
        <p className="mt-3 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          B.Tech CSE student building ML systems that ship and get measured —
          quantization, document intelligence, and retrieval, not just
          notebooks.
        </p>
        <div className="mt-5 flex gap-4 text-sm">
          <a
            href="mailto:aatmansoni2006@gmail.com"
            className="text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
          >
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/aatman-soni-045505285/"
            className="text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/Aatman09"
            className="text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* Skills */}
      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
          Skills
        </h2>
        <div className="mt-4 space-y-2 text-sm">
          {Object.entries(skills).map(([category, items]) => (
            <p key={category} className="text-zinc-700 dark:text-zinc-300">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {category}:
              </span>{" "}
              {items.join(", ")}
            </p>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
          Projects
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      {/* Experience teaser */}
      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
          Experience
        </h2>
        <Link
          href="/experience"
          className="mt-4 block rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
        >
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
            SilverTouch Technologies — AI/ML Intern
          </h3>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            June – July 2026. Built a production Intelligent Document
            Processing (Graph RAG) system — section reconstruction, VLM-based
            entity extraction, and a served API.
          </p>
        </Link>
      </section>
    </div>
  );
}
