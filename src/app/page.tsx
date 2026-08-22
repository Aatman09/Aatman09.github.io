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
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-20">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white/75 px-7 py-10 shadow-sm sm:px-12 sm:py-14 dark:border-indigo-950 dark:bg-zinc-900/60">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-700/20" />
        <div className="relative">
        <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Available for ML opportunities</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-zinc-900 sm:text-6xl dark:text-zinc-50">
          Building ML systems<br className="hidden sm:block" /> that make it to production.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          B.Tech CSE student building ML systems that ship and get measured —
          quantization, document intelligence, and retrieval, not just
          notebooks.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <a
            href="mailto:aatmansoni2006@gmail.com"
            className="rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm shadow-indigo-500/30 transition hover:bg-indigo-500"
          >
            Get in touch →
          </a>
          <a
            href="https://www.linkedin.com/in/aatman-soni-045505285/"
            className="rounded-lg border border-zinc-200 bg-white/70 px-4 py-2.5 font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/Aatman09"
            className="rounded-lg border border-zinc-200 bg-white/70 px-4 py-2.5 font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
          >
            GitHub
          </a>
        </div>
        </div>
      </section>

      {/* Skills */}
      <section className="mt-20">
        <div className="flex items-baseline justify-between"><h2 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-500">
          Toolkit
        </h2>
        <span className="text-sm text-zinc-400">What I build with</span></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {Object.entries(skills).map(([category, items]) => (
            <div key={category} className="rounded-2xl border border-zinc-200/80 bg-white/60 p-5 dark:border-zinc-800 dark:bg-zinc-900/45">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{category}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{items.join(" · ")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mt-20">
        <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-500">Selected work</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Projects with receipts.</h2></div>
        <span className="hidden text-sm text-zinc-500 sm:block">Implementation, benchmarks, outcomes.</span></div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      {/* Experience teaser */}
      <section className="mt-20">
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-500">
          Experience
        </h2>
        <Link
          href="/experience"
          className="group mt-5 block rounded-2xl border border-zinc-200 bg-zinc-950 p-7 text-white shadow-lg shadow-zinc-300/40 transition hover:-translate-y-1 hover:bg-indigo-950 dark:border-zinc-700 dark:shadow-none"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">Internship · 2026</p>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">
            SilverTouch Technologies — AI/ML Intern
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
            June – July 2026. Built a production Intelligent Document
            Processing (Graph RAG) system — section reconstruction, VLM-based
            entity extraction, and a served API.
          </p>
          <span className="mt-5 inline-block text-sm font-semibold text-indigo-300 group-hover:text-white">Read the experience →</span>
        </Link>
      </section>
    </div>
  );
}
