import Link from "next/link";
import Cited from "@/components/Cited";
import ProjectRow from "@/components/ProjectRow";
import QuantField from "@/components/QuantField";
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
    <>
      <QuantField />

      {/* Hero */}
      <section className="relative h-[100svh] min-h-[34rem] w-full overflow-hidden border-b border-rule">
        <div className="pointer-events-none relative z-10 mx-auto flex h-full w-full max-w-[68rem] flex-col justify-end px-6 pb-14 pt-28 sm:pb-20">
          <h1
            className="max-w-[16ch] font-display text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[4.5rem] lg:text-[5.5rem]"
          >
            I build ML systems from scratch, then measure them.
            <span
              aria-hidden="true"
              className="cursor-blink ml-2 inline-block h-[0.8em] w-[0.12em] translate-y-[0.06em] bg-signal"
            />
          </h1>

          <div className="mt-8 max-w-xl space-y-2 font-mono text-[0.875rem] leading-7 text-graphite">
            <p>
              Aatman Soni · B.Tech CSE
              {education.university && ` · ${education.university}`} · seeking
              ML / SDE internships
            </p>
            <p>
              Recently: int8 for{" "}
              <Cited slug="gemma2-quant">Gemma 2</Cited>, a KV-cache decoder
              for <Cited slug="cachegpt">GPT-2</Cited>, a ConvNeXt port in{" "}
              <Cited slug="bonsai">jax-ml/bonsai</Cited>.
            </p>
          </div>

          <p className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.875rem]">
            <a
              href="mailto:aatmansoni2006@gmail.com"
              className="pointer-events-auto bg-ink px-4 py-2.5 text-paper transition-colors hover:bg-accent-text"
            >
              Get in touch
            </a>
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="pointer-events-auto text-graphite underline decoration-1 underline-offset-[5px] transition-colors hover:text-ink"
              >
                {c.label.toLowerCase()}
              </a>
            ))}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[68rem] px-6">
      {/* Work */}
      <section id="work" className="mt-24 scroll-mt-24 sm:mt-28">
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
    </>
  );
}
