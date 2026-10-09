import Link from "next/link";
import ProjectRow from "@/components/ProjectRow";
import { projects } from "@/data/projects";
import { experience } from "@/data/experience";

// Empty fields are left out of the hero.
const education = {
  university: "",
  classOf: "",
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

const contacts = [
  { href: "https://github.com/Aatman09", label: "GitHub" },
  {
    href: "https://www.linkedin.com/in/aatman-soni-045505285/",
    label: "LinkedIn",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-[68rem] px-6">
      {/* Hero */}
      <section className="pt-16 sm:pt-24">
        <p className="label flex flex-wrap items-center gap-x-3 gap-y-1 text-graphite">
          <span className="text-ink">Aatman Soni</span>
          <span aria-hidden="true">/</span>
          <span>ML systems</span>
          <span aria-hidden="true">/</span>
          <span>Ahmedabad, IN</span>
        </p>
        <p className="label mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-graphite">
          <span>
            B.Tech CSE
            {education.university && ` · ${education.university}`}
          </span>
          <span aria-hidden="true">/</span>
          {education.classOf && (
            <>
              <span>Class of {education.classOf}</span>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span className="text-accent-text">Seeking ML / SDE internships</span>
        </p>

        <h1 className="mt-6 max-w-3xl font-display text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[4rem]">
          Built from scratch.
          <br />
          Measured against the alternative.
        </h1>

        <p className="mt-7 max-w-xl text-[1.0625rem] leading-8 text-ink-2">
          I write the implementation — int8 quantization, a
          KV-cache decoder, a ConvNeXt port merged into jax-ml — and then run
          the benchmark that says whether it was worth doing.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="mailto:aatmansoni2006@gmail.com"
            className="label bg-ink px-4 py-2.5 text-paper transition-colors hover:bg-accent-text"
          >
            aatmansoni2006@gmail.com
          </a>
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className="label border border-rule-strong px-4 py-2.5 text-graphite transition-colors hover:border-ink hover:text-ink"
            >
              {c.label}
            </a>
          ))}
        </div>
      </section>

      {/* Work */}
      <section className="mt-24 sm:mt-28">
        <div className="flex items-baseline justify-between gap-6 border-b border-ink pb-2.5">
          <h2 className="label text-ink">Work</h2>
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
